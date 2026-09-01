"use client";

import { useSimulator } from "@/store/simulator";
import { CodeParams } from "@/components/ui/Math";
import { formatNumber, formatSci, formatDays } from "@/lib/format";

function Stat({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-[var(--text-quaternary)]">{label}</span>
      <span className={`text-[11px] mono font-medium ${warn ? "text-[var(--warning)]" : "text-[var(--text-secondary)]"}`}>
        {value}
      </span>
    </div>
  );
}

export function StatusBar() {
  const computed = useSimulator((s) => s.computed);

  return (
    <div className="flex flex-wrap items-center gap-5 gap-y-1 px-5 h-10 border-t border-[var(--border-subtle)] bg-black shrink-0">
      {/* Feasibility */}
      <div className="flex items-center gap-1.5">
        <div className={`w-[6px] h-[6px] rounded-full ${
          computed.feasible
            ? "bg-[var(--success)] shadow-[0_0_4px_rgba(34,197,94,0.4)]"
            : "bg-[var(--danger)] animate-pulse"
        }`} />
        <span className={`text-[10px] font-medium tracking-wide ${
          computed.feasible ? "text-[var(--success)]" : "text-[var(--danger)]"
        }`}>
          {computed.feasible ? "FEASIBLE" : "INFEASIBLE"}
        </span>
      </div>

      <div className="w-px h-4 bg-[var(--border-subtle)]" />

      <Stat label="Qubits" value={formatNumber(computed.totalQubits)} />
      <Stat label="Error" value={formatSci(computed.blockErrorRate)} />
      <Stat label="Runtime" value={formatDays(computed.runtimeDays)} />
      <Stat label="Budget" value={formatNumber(computed.toffoliBudget)} />

      {computed.extrapolationWarning && (
        <>
          <div className="w-px h-4 bg-[var(--border-subtle)]" />
          <span className="text-[9px] text-[var(--warning)] truncate max-w-40 mono" title={computed.extrapolationWarning}>
            {computed.extrapolationWarning}
          </span>
        </>
      )}

      <div className="ml-auto flex items-center gap-4">
        <CodeParams n={computed.codeParams.n} k={computed.codeParams.k} d={computed.codeParams.d} />

        <div className="flex items-center gap-3">
          {[
            { color: "var(--zone-memory)", val: computed.qubitBreakdown.memory },
            { color: "var(--zone-processor)", val: computed.qubitBreakdown.processor },
            { color: "var(--zone-operation)", val: computed.qubitBreakdown.operation },
            { color: "var(--zone-resource)", val: computed.qubitBreakdown.resource },
          ].map((z, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className="w-[5px] h-[5px] rounded-full" style={{ backgroundColor: z.color }} />
              <span className="text-[10px] mono text-[var(--text-quaternary)]">{formatNumber(z.val)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
