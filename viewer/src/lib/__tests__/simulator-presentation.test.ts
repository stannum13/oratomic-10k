import { describe, expect, it } from "vitest";
import {
  clampNumber,
  deriveAllocation,
  deriveFeasibility,
  formatRuntime,
} from "../simulator-presentation";

describe("simulator presentation", () => {
  it("uses one runtime precision rule", () => {
    expect(formatRuntime(0.2625)).toBe("6.3 hr");
    expect(formatRuntime(10)).toBe("10 days");
    expect(formatRuntime(730)).toBe("2.0 yr");
    expect(formatRuntime(Number.NaN)).toBe("—");
  });

  it("clamps editable values without admitting NaN", () => {
    expect(clampNumber(2, 0, 1, 0.5)).toBe(1);
    expect(clampNumber(-1, 0, 1, 0.5)).toBe(0);
    expect(clampNumber(Number.NaN, 0, 1, 0.5)).toBe(0.5);
  });

  it("explains feasible and infeasible margins", () => {
    expect(deriveFeasibility({ feasible: true, toffoliBudget: 200, toffoliCount: 100, extrapolationWarning: null })).toMatchObject({
      marginRatio: 2,
      marginLabel: "2.0× headroom",
      bindingLabel: "Reliable-operation budget",
    });
    expect(deriveFeasibility({ feasible: true, toffoliBudget: 3.9e28, toffoliCount: 1e8, extrapolationWarning: null }).marginLabel)
      .toBe("3.9 × 10²⁰ headroom");
    expect(deriveFeasibility({ feasible: false, toffoliBudget: 25, toffoliCount: 100, extrapolationWarning: "outside fit" })).toMatchObject({
      marginRatio: 0.25,
      marginLabel: "25% of required budget",
      warning: "outside fit",
    });
  });

  it("returns stable allocation proportions", () => {
    const allocation = deriveAllocation({ memory: 50, resource: 25, operation: 15, processor: 10 });
    expect(allocation.map((segment) => segment.id)).toEqual(["memory", "resource", "operation", "processor"]);
    expect(allocation.reduce((sum, segment) => sum + segment.percent, 0)).toBeCloseTo(100);
    expect(allocation[0]).toMatchObject({ count: 50, percent: 50 });
  });
});
