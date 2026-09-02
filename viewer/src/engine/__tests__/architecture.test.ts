import { describe, test, expect } from "vitest";
import { ORATOMIC_ARCHITECTURES, instantiate } from "../architecture";
import { TOFFOLI_COUNTS, TAU_TOFF_MULTIPLIERS } from "../../compute/lookup-tables";

describe("architecture instantiation", () => {
  const defaultBindings = {
    p: 0.001,
    cycleTime: 1.0,
    toffoliCount: 9.0e7,  // compilation (2) — paper's headline
    tauToffMul: 19,
  };

  test("balanced-lp20 gives 11961 qubits", () => {
    const arch = ORATOMIC_ARCHITECTURES["balanced-lp20"];
    const result = instantiate(arch, defaultBindings);
    expect(result.totalQubits).toBe(11961);
  });

  test("balanced-lp24 gives 13255 qubits", () => {
    const arch = ORATOMIC_ARCHITECTURES["balanced-lp24"];
    const result = instantiate(arch, defaultBindings);
    expect(result.totalQubits).toBe(13255);
  });

  test("space-efficient-lp20 gives 9739 qubits", () => {
    const arch = ORATOMIC_ARCHITECTURES["space-efficient-lp20"];
    const result = instantiate(arch, { ...defaultBindings, tauToffMul: 72 });
    expect(result.totalQubits).toBe(9739);
  });

  test("feasibility: low error rate is feasible", () => {
    const arch = ORATOMIC_ARCHITECTURES["balanced-lp20"];
    const result = instantiate(arch, defaultBindings);
    expect(result.feasible).toBe(true);
  });

  test("feasibility: very high error rate is infeasible", () => {
    const arch = ORATOMIC_ARCHITECTURES["balanced-lp20"];
    // p=0.1 gives blockErrorRate = 1.0 * 0.1^10 = 1e-10, toffoliBudget becomes small
    const result = instantiate(arch, { ...defaultBindings, p: 0.1 });
    expect(result.feasible).toBe(false);
  });

  test("qubit breakdown sums to total", () => {
    const arch = ORATOMIC_ARCHITECTURES["balanced-lp20"];
    const result = instantiate(arch, defaultBindings);
    const sum = result.qubitBreakdown.memory + result.qubitBreakdown.processor +
                result.qubitBreakdown.resource + result.qubitBreakdown.operation;
    expect(sum).toBe(result.totalQubits);
  });
});

describe("paper validation", () => {
  test("balanced ECC-256 runtime matches paper (~264 days)", () => {
    const arch = ORATOMIC_ARCHITECTURES["balanced-lp20"];
    const result = instantiate(arch, {
      p: 0.001,
      cycleTime: 1.0,
      toffoliCount: 9.0e7,  // compilation (2)
      tauToffMul: 19,
    });
    // Paper says ~264 days for balanced ECC-256 with compilation (2)
    expect(result.runtimeDays).toBeGreaterThan(150);
    expect(result.runtimeDays).toBeLessThan(400);
  });
});
