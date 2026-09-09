import type { QubitBreakdown } from "@/compute/interface";
import { formatRuntime } from "./format";

export { formatRuntime };

export interface FeasibilityInput {
  feasible: boolean;
  toffoliBudget: number;
  toffoliCount: number;
  extrapolationWarning: string | null;
}

export interface FeasibilitySummary {
  feasible: boolean;
  marginRatio: number;
  marginLabel: string;
  bindingLabel: string;
  explanation: string;
  warning: string | null;
}

export interface AllocationSegment {
  id: keyof QubitBreakdown;
  label: string;
  count: number;
  percent: number;
}

export function clampNumber(value: number, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

export function deriveFeasibility(input: FeasibilityInput): FeasibilitySummary {
  const marginRatio = input.toffoliCount > 0 ? input.toffoliBudget / input.toffoliCount : 0;
  const marginLabel = input.feasible
    ? `${marginRatio.toFixed(1)}\u00d7 headroom`
    : `${Math.max(0, marginRatio * 100).toFixed(0)}% of required budget`;

  return {
    feasible: input.feasible,
    marginRatio,
    marginLabel,
    bindingLabel: "Reliable-operation budget",
    explanation: input.feasible
      ? `The modeled reliable Toffoli budget is ${marginLabel} above the selected workload.`
      : `The modeled reliable Toffoli budget supplies only ${marginLabel}; physical error is the binding input in this estimate.`,
    warning: input.extrapolationWarning,
  };
}

export function deriveAllocation(breakdown: QubitBreakdown): AllocationSegment[] {
  const ordered: Array<{ id: keyof QubitBreakdown; label: string }> = [
    { id: "memory", label: "Memory" },
    { id: "resource", label: "Resource" },
    { id: "operation", label: "Operation" },
    { id: "processor", label: "Processor" },
  ];
  const total = ordered.reduce((sum, item) => sum + breakdown[item.id], 0);

  return ordered.map((item) => ({
    ...item,
    count: breakdown[item.id],
    percent: total > 0 ? (breakdown[item.id] / total) * 100 : 0,
  }));
}
