/**
 * Bridge between the symbolic engine and the existing ComputeResult interface.
 * Replaces the old lookup-table approach with symbolic evaluation.
 */

import type { ArchitectureType, ComputeResult, MemoryCode, ProcessorCode, TargetProblem } from "./interface";
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
      timingWaterfall: {
        readout: cycleTime * 0.25,
        transport: cycleTime * 0.15,
        gates: cycleTime * 0.20,
        decode: cycleTime * 0.40,
      },
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

  let sensitivity: SensitivityResult[] = [];
  let bottlenecks: Record<string, { parameter: string; elasticity: number }> = {};
  try {
    sensitivity = sensitivityAnalysis(arch, bindings);
    bottlenecks = bottleneckAnalysis(sensitivity);
  } catch { /* ok */ }

  return {
    totalQubits: result.totalQubits,
    qubitBreakdown: result.qubitBreakdown,
    blockErrorRate: result.blockErrorRate,
    toffoliCount: result.toffoliCount,
    toffoliBudget: result.toffoliBudget,
    runtimeDays: result.runtimeDays,
    timingWaterfall: {
      readout: cycleTime * (archType === "space-efficient" ? 0.30 : 0.30),
      transport: cycleTime * (archType === "space-efficient" ? 0.35 : 0.25),
      gates: cycleTime * (archType === "space-efficient" ? 0.10 : 0.15),
      decode: cycleTime * (archType === "space-efficient" ? 0.25 : 0.30),
    },
    feasible: result.feasible,
    extrapolationWarning,
    codeParams,
    processorParams,
    sensitivity,
    bottlenecks,
    symbolicArchName: archKey,
  };
}
