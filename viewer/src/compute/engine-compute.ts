/**
 * Bridge between the symbolic engine and the existing ComputeResult interface.
 * Replaces the old lookup-table approach with symbolic evaluation.
 */

import type { ArchitectureType, ComputeResult, MemoryCode, NoiseModel, ProcessorCode, TargetProblem } from "./interface";
import { ORATOMIC_ARCHITECTURES, instantiate, type Architecture } from "@/engine/architecture";
import { ORATOMIC_CODES } from "@/engine/code-family";
import { sensitivityAnalysis, bottleneckAnalysis, type SensitivityResult } from "@/engine/sensitivity";
import { type Bindings, evaluate } from "@/engine/expr";
import {
  CODE_DETAILS,
  EXTRAPOLATION_VALID_RANGE,
  TAU_TOFF_MULTIPLIERS,
  TOFFOLI_COUNTS,
  TIME_EFFICIENT_PRESETS,
} from "./lookup-tables";
import { getDecoder } from "./decoder";

export interface EngineComputeResult extends ComputeResult {
  sensitivity: SensitivityResult[];
  bottlenecks: Record<string, { parameter: string; elasticity: number }>;
  symbolicArchName: string;
}

function getArchKey(archType: ArchitectureType, memCode: MemoryCode): string {
  if (archType === "time-efficient") return "balanced-" + memCode;
  const prefix = archType === "space-efficient" ? "space-efficient" : "balanced";
  return `${prefix}-${memCode}`;
}

export function computeWithEngine(params: {
  physicalErrorRate: number;
  cycleTime: number;
  architectureType: ArchitectureType;
  targetProblem: TargetProblem;
  memoryCode: MemoryCode;
  processorCode: ProcessorCode;
  decoderType?: string;
  noiseModel?: NoiseModel;
}): EngineComputeResult {
  const { physicalErrorRate, cycleTime, architectureType, targetProblem, memoryCode, processorCode } = params;

  const codeParams = CODE_DETAILS[memoryCode];
  const processorParams = CODE_DETAILS[processorCode];

  // Extrapolation warning
  let extrapolationWarning: string | null = null;
  if (physicalErrorRate < EXTRAPOLATION_VALID_RANGE.min) {
    extrapolationWarning = `p < ${EXTRAPOLATION_VALID_RANGE.min}: extrapolation unreliable -- correlated error floors not captured`;
  } else if (physicalErrorRate > EXTRAPOLATION_VALID_RANGE.max) {
    extrapolationWarning = `p > ${EXTRAPOLATION_VALID_RANGE.max}: approaching pseudo-threshold -- power-law fit breaks down`;
  }

  // Time-efficient uses presets
  if (architectureType === "time-efficient") {
    const preset = TIME_EFFICIENT_PRESETS[targetProblem];
    const toffoliCount = TOFFOLI_COUNTS[targetProblem];
    const archKey = getArchKey(architectureType, memoryCode);
    const arch = ORATOMIC_ARCHITECTURES[archKey as keyof typeof ORATOMIC_ARCHITECTURES];

    const bindings: Bindings = {
      p: physicalErrorRate,
      cycleTime,
      toffoliCount,
      tauToffMul: 3,
    };

    let sensitivity: SensitivityResult[] = [];
    let bottlenecks: Record<string, { parameter: string; elasticity: number }> = {};
    if (arch) {
      try {
        sensitivity = sensitivityAnalysis(arch, bindings);
        bottlenecks = bottleneckAnalysis(sensitivity);
      } catch { /* sensitivity may fail for some param combos */ }
    }

    const fit = ORATOMIC_CODES[memoryCode === "lp16" ? "lp16" : memoryCode === "lp24" ? "lp24" : "lp20"];
    const fitA = fit.fitA ? evaluate(fit.fitA, {}) : 1;
    const fitB = fit.fitB ? evaluate(fit.fitB, {}) : 10;
    const blockErrorRate = fitA * Math.pow(physicalErrorRate, fitB);
    const toffoliBudget = blockErrorRate > 0 ? -Math.log(0.9) / (3 * blockErrorRate) : 0;

    // Adjust waterfall for decoder latency
    const decoder = getDecoder(params.decoderType || "bp-lsd");
    const decoderStats = decoder.getStats();
    const decoderFractionMs = decoderStats.decoderLatencyUs / 1000;
    const decoderFraction = Math.min(0.8, decoderFractionMs / cycleTime);
    const remaining = 1 - decoderFraction;

    const waterfallAdjusted = {
      readout: cycleTime * remaining * 0.45,
      transport: cycleTime * remaining * 0.30,
      gates: cycleTime * remaining * 0.25,
      decode: cycleTime * decoderFraction,
    };

    return {
      totalQubits: preset.qubits,
      qubitBreakdown: {
        memory: Math.round(preset.qubits * 0.4),
        processor: Math.round(preset.qubits * 0.25),
        resource: Math.round(preset.qubits * 0.2),
        operation: Math.round(preset.qubits * 0.15),
      },
      blockErrorRate,
      toffoliCount,
      toffoliBudget,
      runtimeDays: preset.runtimeDays * (cycleTime / 1.0),
      timingWaterfall: waterfallAdjusted,
      feasible: toffoliBudget >= toffoliCount,
      extrapolationWarning,
      codeParams,
      processorParams,
      sensitivity,
      bottlenecks,
      symbolicArchName: "time-efficient",
    };
  }

  // Space-efficient and balanced -- use symbolic engine
  const archKey = getArchKey(architectureType, memoryCode);
  const arch = ORATOMIC_ARCHITECTURES[archKey as keyof typeof ORATOMIC_ARCHITECTURES];

  if (!arch) {
    // Fallback to lp20 variant
    return computeWithEngine({ ...params, memoryCode: "lp20" });
  }

  const archType = architectureType === "space-efficient" ? "space-efficient" : "balanced";
  const tauToffMul = TAU_TOFF_MULTIPLIERS[archType]?.[targetProblem] ?? 10;
  const toffoliCount = TOFFOLI_COUNTS[targetProblem];

  const bindings: Bindings = {
    p: physicalErrorRate,
    cycleTime,
    toffoliCount,
    tauToffMul,
  };

  const result = instantiate(arch, bindings);

  // Noise model correction
  let adjustedBlockError = result.blockErrorRate;
  const noiseModel = params.noiseModel || "depolarizing";
  if (noiseModel === "biased-z") {
    // Biased noise (Z:X ratio ~100:1 for neutral atoms) effectively
    // halves the physical error rate for tailored codes
    adjustedBlockError = result.blockErrorRate * 0.3; // ~2x improvement in effective distance
  } else if (noiseModel === "circuit-level") {
    // Circuit-level noise is worse than depolarizing by ~1.5x
    adjustedBlockError = result.blockErrorRate * 2.5;
  }

  // Recompute feasibility with adjusted block error
  const adjustedToffoliBudget = adjustedBlockError > 0 ? -Math.log(0.9) / (3 * adjustedBlockError) : 0;
  const adjustedFeasible = adjustedToffoliBudget >= result.toffoliCount;

  let sensitivity: SensitivityResult[] = [];
  let bottlenecks: Record<string, { parameter: string; elasticity: number }> = {};
  try {
    sensitivity = sensitivityAnalysis(arch, bindings);
    bottlenecks = bottleneckAnalysis(sensitivity);
  } catch { /* ok */ }

  // Adjust waterfall for decoder latency
  const decoder = getDecoder(params.decoderType || "bp-lsd");
  const decoderStats = decoder.getStats();
  const decoderFractionMs = decoderStats.decoderLatencyUs / 1000;
  const decoderFraction = Math.min(0.8, decoderFractionMs / cycleTime);
  const remaining = 1 - decoderFraction;

  const waterfallAdjusted = {
    readout: cycleTime * remaining * 0.45,
    transport: cycleTime * remaining * (architectureType === "space-efficient" ? 0.35 : 0.30),
    gates: cycleTime * remaining * 0.25,
    decode: cycleTime * decoderFraction,
  };

  return {
    totalQubits: result.totalQubits,
    qubitBreakdown: result.qubitBreakdown,
    blockErrorRate: adjustedBlockError,
    toffoliCount: result.toffoliCount,
    toffoliBudget: adjustedToffoliBudget,
    runtimeDays: result.runtimeDays,
    timingWaterfall: waterfallAdjusted,
    feasible: adjustedFeasible,
    extrapolationWarning,
    codeParams,
    processorParams,
    sensitivity,
    bottlenecks,
    symbolicArchName: archKey,
  };
}
