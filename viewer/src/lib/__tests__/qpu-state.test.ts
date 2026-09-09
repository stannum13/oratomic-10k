import { describe, expect, it } from "vitest";
import { computeWithEngine } from "@/compute/engine-compute";
import { deriveQpuState } from "../qpu-state";

function state(overrides: Partial<Parameters<typeof deriveQpuState>[0]> = {}) {
  const physicalErrorRate = overrides.physicalErrorRate ?? 0.001;
  const computed = computeWithEngine({
    physicalErrorRate,
    cycleTime: 1,
    architectureType: "balanced",
    targetProblem: "ecc-256",
    memoryCode: "lp20",
    processorCode: "lp-proc",
    decoderType: "bp-lsd",
    noiseModel: "depolarizing",
  });
  return deriveQpuState({
    hardwarePlatform: "oratomic-neutral-atom",
    physicalErrorRate,
    cycleTime: 1,
    noiseModel: "depolarizing",
    targetProblem: "ecc-256",
    computed,
    ...overrides,
  });
}

describe("QPU state explanation", () => {
  it("identifies the largest modeled latency without hiding physical stages", () => {
    const result = state();
    expect(result.dominantBottleneck.label).toBe("Decoder latency");
    expect(result.timingStages.map((stage) => stage.label)).toEqual(["Readout", "Transport / routing", "Gates", "Decoder"]);
  });

  it("marks transport absent for the fixed superconducting topology", () => {
    const result = state({ hardwarePlatform: "google-surface-code" });
    expect(result.timingStages.find((stage) => stage.label === "Transport / routing")?.value).toBe("Not modeled");
  });

  it("explains infeasibility only through modeled physical-error behavior", () => {
    const computed = computeWithEngine({
      physicalErrorRate: 0.01,
      cycleTime: 1,
      architectureType: "balanced",
      targetProblem: "ecc-256",
      memoryCode: "lp20",
      processorCode: "lp-proc",
    });
    const result = state({ physicalErrorRate: 0.01, computed: { ...computed, feasible: false } });
    expect(result.causalExplanation).toContain("reliable-operation budget");
    expect(result.causalExplanation).toContain("infeasible");
  });

  it("separates listed physical noise from engine-backed noise", () => {
    const result = state();
    expect(result.activeNoise.some((noise) => noise.modeled)).toBe(true);
    expect(result.activeNoise.some((noise) => !noise.modeled)).toBe(true);
    expect(result.activeNoise.find((noise) => noise.label === "Atom loss")?.status).toBe("Not modeled");
  });
});
