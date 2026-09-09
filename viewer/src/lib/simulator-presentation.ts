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

const SUPERSCRIPT_DIGITS: Record<string, string> = {
  "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
  "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "-": "⁻",
};

function formatHeadroom(ratio: number): string {
  if (ratio < 1e6) return `${ratio.toFixed(1)}× headroom`;
  const exponent = Math.floor(Math.log10(ratio));
  const mantissa = ratio / 10 ** exponent;
  const superscript = String(exponent).split("").map((digit) => SUPERSCRIPT_DIGITS[digit] ?? digit).join("");
  return `${mantissa.toFixed(1)} × 10${superscript} headroom`;
}

export function clampNumber(value: number, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

export function deriveFeasibility(input: FeasibilityInput): FeasibilitySummary {
  const marginRatio = input.toffoliCount > 0 ? input.toffoliBudget / input.toffoliCount : 0;
  const marginLabel = input.feasible
    ? formatHeadroom(marginRatio)
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
