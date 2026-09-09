import type { EngineComputeResult } from "@/compute/engine-compute";
import type { NoiseModel, TargetProblem } from "@/compute/interface";
import { PLATFORM_PRESETS } from "@/compute/lookup-tables";
import { getQpuProfile, type DiagnosticItem, type ProvenanceKind } from "./qpu-profiles";

export interface QpuStateInput {
  hardwarePlatform: string;
  physicalErrorRate: number;
  cycleTime: number;
  noiseModel: NoiseModel;
  targetProblem: TargetProblem;
  computed: EngineComputeResult;
}

export interface TimingStage {
  label: string;
  value: string;
  microseconds: number | null;
  provenance: ProvenanceKind;
}

export interface ActiveDiagnostic extends DiagnosticItem {
  status: "Included in model" | "Not modeled";
}

export interface QpuStateSummary {
  dominantBottleneck: { label: string; detail: string };
  causalExplanation: string;
  timingStages: TimingStage[];
  activeNoise: ActiveDiagnostic[];
}

function duration(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)} ms`;
  if (value === 0) return "Not modeled";
  return `${value.toLocaleString()} µs`;
}

export function deriveQpuState(input: QpuStateInput): QpuStateSummary {
  const profile = getQpuProfile(input.hardwarePlatform);
  const preset = PLATFORM_PRESETS[profile.id] ?? PLATFORM_PRESETS["oratomic-neutral-atom"];
  const rawStages = [
    { label: "Readout", microseconds: preset.readoutTimeUs, bottleneck: "Readout latency" },
    { label: "Transport / routing", microseconds: preset.transportTimeUs, bottleneck: "Transport / routing latency" },
    { label: "Gates", microseconds: preset.gateTimeUs, bottleneck: "Gate latency" },
    { label: "Decoder", microseconds: preset.decoderLatencyUs, bottleneck: "Decoder latency" },
  ];
  const dominant = rawStages.reduce((best, stage) => stage.microseconds > best.microseconds ? stage : best);
  const timingStages: TimingStage[] = rawStages.map((stage) => ({
    label: stage.label,
    value: duration(stage.microseconds),
    microseconds: stage.microseconds || null,
    provenance: stage.microseconds === 0 ? "Not modeled" : "Illustrative estimate",
  }));

  const causalExplanation = input.computed.feasible
    ? `${dominant.bottleneck} is the largest listed stage for this profile. The current ${input.targetProblem.toUpperCase()} scenario remains feasible in the model.`
    : `At a ${(input.physicalErrorRate * 100).toFixed(2)}% physical error assumption, logical protection leaves the reliable-operation budget below the workload; this estimated state is infeasible.`;

  return {
    dominantBottleneck: {
      label: dominant.bottleneck,
      detail: `${duration(dominant.microseconds)} listed profile latency; compare it with the ${(input.cycleTime * 1000).toLocaleString()} µs cycle assumption.`,
    },
    causalExplanation,
    timingStages,
    activeNoise: profile.noise.map((item) => ({
      ...item,
      status: item.modeled ? "Included in model" : "Not modeled",
    })),
  };
}
