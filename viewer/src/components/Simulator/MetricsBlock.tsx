"use client";

import { useSimulator } from "@/store/simulator";
import { formatNumber } from "@/lib/format";
import { formatRuntime } from "@/lib/simulator-presentation";

function formatBlockError(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "—";
  const superscripts: Record<string, string> = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "-": "⁻" };
  const exponent = Math.floor(Math.log10(value));
  return `10${String(exponent).split("").map((digit) => superscripts[digit] ?? digit).join("")}`;
}

export function MetricsBlock() {
  const computed = useSimulator((state) => state.computed);
  const metrics = [
    { label: "Physical qubits", value: formatNumber(computed.totalQubits) },
    { label: "Block error", value: formatBlockError(computed.blockErrorRate) },
    { label: "Runtime", value: formatRuntime(computed.runtimeDays) },
  ];

  return (
    <section className="metrics-block" aria-label="Current simulation results" aria-live="polite">
      {metrics.map((metric) => (
        <div className="metric" key={metric.label}>
          <strong>{metric.value}</strong>
          <span>{metric.label}</span>
        </div>
      ))}
    </section>
  );
}
