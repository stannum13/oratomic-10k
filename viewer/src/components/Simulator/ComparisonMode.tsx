"use client";

import { useSimulator } from "@/store/simulator";
import { formatNumber, formatSci, formatDays } from "@/lib/format";

function DeltaIndicator({ current, pinned, inverse }: { current: number; pinned: number; inverse?: boolean }) {
  if (!isFinite(current) || !isFinite(pinned) || pinned === 0) return null;
  const ratio = current / pinned;
  const isImprovement = inverse ? ratio > 1 : ratio < 1;
  const pct = ((ratio - 1) * 100);
  const sign = pct > 0 ? "+" : "";
  return (
    <span className={`text-[9px] font-mono ${isImprovement ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
      {sign}{pct.toFixed(0)}%
    </span>
  );
}

export function ComparisonMode() {
  const pinned = useSimulator((s) => s.pinnedConfig);
  const setPinned = useSimulator((s) => s.setPinnedConfig);
  const state = useSimulator();

  const handlePin = () => {
    setPinned({
      label: `${state.architectureType} / ${state.memoryCode} / ${state.targetProblem}`,
      computed: { ...state.computed },
      params: {
        physicalErrorRate: state.physicalErrorRate,
        cycleTime: state.cycleTime,
        architectureType: state.architectureType,
        targetProblem: state.targetProblem,
        memoryCode: state.memoryCode,
        processorCode: state.processorCode,
      },
    });
  };

  return (
    <div>
      <h3 className="text-xs font-mono text-[var(--text-tertiary)] uppercase tracking-wider mb-3">
        Compare Configurations
      </h3>

      <button
        onClick={handlePin}
        className="w-full py-1.5 px-3 bg-[rgba(234,179,8,0.1)] hover:bg-[rgba(234,179,8,0.2)] border border-[rgba(234,179,8,0.2)] rounded-lg text-xs font-mono text-[var(--warning)] transition-colors mb-3"
      >
        {pinned ? "Update Pinned Config" : "Pin Current Config"}
      </button>

      {pinned && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg overflow-hidden">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-[var(--border-default)]">
                <th className="text-left text-[var(--text-tertiary)] p-2 font-normal">Metric</th>
                <th className="text-right text-[var(--warning)] p-2 font-normal">Pinned</th>
                <th className="text-right text-[var(--accent)] p-2 font-normal">Current</th>
                <th className="text-right text-[var(--text-tertiary)] p-2 font-normal">Delta</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[var(--border-subtle)]">
                <td className="text-[var(--text-secondary)] p-2">Qubits</td>
                <td className="text-right text-[var(--text-primary)] p-2">{formatNumber(pinned.computed.totalQubits)}</td>
                <td className="text-right text-[var(--text-primary)] p-2">{formatNumber(state.computed.totalQubits)}</td>
                <td className="text-right p-2">
                  <DeltaIndicator current={state.computed.totalQubits} pinned={pinned.computed.totalQubits} />
                </td>
              </tr>
              <tr className="border-b border-[var(--border-subtle)]">
                <td className="text-[var(--text-secondary)] p-2">Error Rate</td>
                <td className="text-right text-[var(--text-primary)] p-2">{formatSci(pinned.computed.blockErrorRate)}</td>
                <td className="text-right text-[var(--text-primary)] p-2">{formatSci(state.computed.blockErrorRate)}</td>
                <td className="text-right p-2">
                  <DeltaIndicator current={state.computed.blockErrorRate} pinned={pinned.computed.blockErrorRate} />
                </td>
              </tr>
              <tr className="border-b border-[var(--border-subtle)]">
                <td className="text-[var(--text-secondary)] p-2">Runtime</td>
                <td className="text-right text-[var(--text-primary)] p-2">{formatDays(pinned.computed.runtimeDays)}</td>
                <td className="text-right text-[var(--text-primary)] p-2">{formatDays(state.computed.runtimeDays)}</td>
                <td className="text-right p-2">
                  <DeltaIndicator current={state.computed.runtimeDays} pinned={pinned.computed.runtimeDays} />
                </td>
              </tr>
              <tr className="border-b border-[var(--border-subtle)]">
                <td className="text-[var(--text-secondary)] p-2">Toffoli Budget</td>
                <td className="text-right text-[var(--text-primary)] p-2">{formatNumber(pinned.computed.toffoliBudget)}</td>
                <td className="text-right text-[var(--text-primary)] p-2">{formatNumber(state.computed.toffoliBudget)}</td>
                <td className="text-right p-2">
                  <DeltaIndicator current={state.computed.toffoliBudget} pinned={pinned.computed.toffoliBudget} inverse />
                </td>
              </tr>
              <tr>
                <td className="text-[var(--text-secondary)] p-2">Feasible</td>
                <td className="text-right p-2">
                  <span className={pinned.computed.feasible ? "text-[var(--success)]" : "text-[var(--danger)]"}>
                    {pinned.computed.feasible ? "YES" : "NO"}
                  </span>
                </td>
                <td className="text-right p-2">
                  <span className={state.computed.feasible ? "text-[var(--success)]" : "text-[var(--danger)]"}>
                    {state.computed.feasible ? "YES" : "NO"}
                  </span>
                </td>
                <td></td>
              </tr>
            </tbody>
          </table>

          <div className="p-2 border-t border-[var(--border-default)]">
            <div className="text-[9px] text-[var(--text-tertiary)] font-mono">
              Pinned: {pinned.label} | p={pinned.params.physicalErrorRate}
            </div>
            <button
              onClick={() => setPinned(null)}
              className="text-[9px] text-[var(--danger)] hover:text-[var(--danger)] font-mono mt-1"
            >
              Clear pinned
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
