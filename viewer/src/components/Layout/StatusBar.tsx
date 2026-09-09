"use client";

import { useSimulator } from "@/store/simulator";
import { CodeParams } from "@/components/ui/Math";

function superscript(n: number): string {
  const map: Record<string, string> = { "0": "\u2070", "1": "\u00B9", "2": "\u00B2", "3": "\u00B3", "4": "\u2074", "5": "\u2075", "6": "\u2076", "7": "\u2077", "8": "\u2078", "9": "\u2079", "-": "\u207B" };
  return String(n).split("").map(c => map[c] || c).join("");
}

function fmtToffoli(n: number): string {
  if (!isFinite(n) || isNaN(n) || n === 0) return "\u2014";
  if (n < 0) return "\u2014";
  const exp = Math.floor(Math.log10(n));
  const mantissa = n / Math.pow(10, exp);
  return `${mantissa.toFixed(1)} \u00D7 10${superscript(exp)}`;
}

export function StatusBar() {
  const computed = useSimulator((s) => s.computed);

  const items = [
    {
      label: "toffoli budget",
      value: fmtToffoli(computed.toffoliBudget),
      tooltip: `Budget = ln(0.9) / (τ_toff × ln(1 - P_L)) at 90% success`,
    },
  ];

  return (
    <div className="status-bar">
      <div className="status-chip" data-state={computed.feasible ? "feasible" : "infeasible"}>
        <div style={{
          width: 6, height: 6, borderRadius: "50%",
          background: "currentColor",
        }} />
        {computed.feasible ? "feasible" : "infeasible"}
      </div>

      {items.map((item, i) => (
        <div key={i} className="status-item">
          <span>{item.label}</span>
          <span className="value" title={item.tooltip}>{item.value}</span>
        </div>
      ))}

      <div className="status-code-params">
        <CodeParams n={computed.codeParams.n} k={computed.codeParams.k} d={computed.codeParams.d} />
      </div>
    </div>
  );
}
