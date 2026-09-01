"use client";

import { useSimulator } from "@/store/simulator";
import { CodeParams } from "@/components/ui/Math";
import { formatNumber } from "@/lib/format";

function fmtSci(n: number): string {
  if (n === 0 || !isFinite(n) || isNaN(n)) return "\u2014";
  const exp = Math.floor(Math.log10(Math.abs(n)));
  return `10${superscript(exp)}`;
}

function superscript(n: number): string {
  const map: Record<string, string> = { "0": "\u2070", "1": "\u00B9", "2": "\u00B2", "3": "\u00B3", "4": "\u2074", "5": "\u2075", "6": "\u2076", "7": "\u2077", "8": "\u2078", "9": "\u2079", "-": "\u207B" };
  return String(n).split("").map(c => map[c] || c).join("");
}

function fmtRuntime(d: number): string {
  if (!isFinite(d) || d < 0 || isNaN(d)) return "\u2014";
  if (d >= 365) return `${(d / 365).toFixed(1)} yr`;
  if (d >= 1) return `${d.toFixed(0)} days`;
  return `${(d * 24).toFixed(1)} hr`;
}

function fmtToffoli(n: number): string {
  if (!isFinite(n) || isNaN(n) || n === 0) return "\u2014";
  const exp = Math.floor(Math.log10(Math.abs(n)));
  const mantissa = n / Math.pow(10, exp);
  if (exp >= 9) return `${mantissa.toFixed(1)} \u00D7 10${superscript(exp)}`;
  return formatNumber(n);
}

export function StatusBar() {
  const computed = useSimulator((s) => s.computed);

  const items = [
    { label: "qubits", value: formatNumber(computed.totalQubits) },
    { label: "block error", value: fmtSci(computed.blockErrorRate) },
    { label: "runtime", value: fmtRuntime(computed.runtimeDays) },
    { label: "toffoli budget", value: fmtToffoli(computed.toffoliBudget) },
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
        <div key={i} style={{ display: "flex", gap: "var(--s2)", alignItems: "baseline" }}>
          <span>{item.label}</span>
          <span className="value">{item.value}</span>
        </div>
      ))}

      <div style={{ marginLeft: "auto" }}>
        <CodeParams n={computed.codeParams.n} k={computed.codeParams.k} d={computed.codeParams.d} />
      </div>
    </div>
  );
}
