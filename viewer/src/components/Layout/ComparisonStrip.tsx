"use client";

import { useSimulator } from "@/store/simulator";
import { formatNumber, formatSci, formatDays } from "@/lib/format";

export function ComparisonStrip() {
  const pinned = useSimulator((s) => s.pinnedConfig);
  const computed = useSimulator((s) => s.computed);
  const setPinned = useSimulator((s) => s.setPinnedConfig);
  const mode = useSimulator((s) => s.mode);

  if (mode !== "simulate" || !pinned) return null;

  const diffs = [
    {
      label: "qubits",
      pinVal: formatNumber(pinned.computed.totalQubits),
      curVal: formatNumber(computed.totalQubits),
      delta: ((computed.totalQubits - pinned.computed.totalQubits) / pinned.computed.totalQubits * 100),
      lowerIsBetter: true,
    },
    {
      label: "error",
      pinVal: formatSci(pinned.computed.blockErrorRate),
      curVal: formatSci(computed.blockErrorRate),
      delta: pinned.computed.blockErrorRate > 0 ? ((computed.blockErrorRate - pinned.computed.blockErrorRate) / pinned.computed.blockErrorRate * 100) : 0,
      lowerIsBetter: true,
    },
    {
      label: "runtime",
      pinVal: formatDays(pinned.computed.runtimeDays),
      curVal: formatDays(computed.runtimeDays),
      delta: pinned.computed.runtimeDays > 0 ? ((computed.runtimeDays - pinned.computed.runtimeDays) / pinned.computed.runtimeDays * 100) : 0,
      lowerIsBetter: true,
    },
  ];

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "var(--s5)",
      padding: "var(--s2) var(--s6)",
      borderTop: "1px solid var(--border)",
      background: "var(--bg)",
      fontFamily: "var(--font-mono)",
      fontSize: "var(--fs-mono-sm)",
    }}>
      <span style={{ color: "var(--text-tertiary)", fontSize: "var(--fs-label)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase" }}>
        vs pinned
      </span>

      {diffs.map((d) => {
        const improved = d.lowerIsBetter ? d.delta < -1 : d.delta > 1;
        const worsened = d.lowerIsBetter ? d.delta > 1 : d.delta < -1;
        const color = improved ? "var(--status-ok)" : worsened ? "var(--status-fail)" : "var(--text-tertiary)";
        const sign = d.delta > 0 ? "+" : "";

        return (
          <div key={d.label} style={{ display: "flex", gap: "var(--s2)", alignItems: "baseline" }}>
            <span style={{ color: "var(--text-tertiary)" }}>{d.label}</span>
            <span style={{ color }}>{sign}{isFinite(d.delta) ? d.delta.toFixed(0) : "\u2014"}%</span>
          </div>
        );
      })}

      <button
        onClick={() => setPinned(null)}
        style={{
          marginLeft: "auto",
          fontSize: "var(--fs-label)",
          color: "var(--text-tertiary)",
          background: "none",
          border: "none",
          cursor: "pointer",
        }}
      >
        clear
      </button>
    </div>
  );
}
