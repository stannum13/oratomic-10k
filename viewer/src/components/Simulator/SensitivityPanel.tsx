"use client";

import { useSimulator } from "@/store/simulator";
import type { SensitivityResult } from "@/engine/sensitivity";

export function SensitivityPanel() {
  const computed = useSimulator((s) => s.computed);
  const sensitivity: SensitivityResult[] = computed.sensitivity;
  const bottlenecks = computed.bottlenecks;

  if (!sensitivity || sensitivity.length === 0) return null;

  const costs = ["blockErrorRate", "runtimeDays", "toffoliBudget", "totalQubits"];
  const costLabels: Record<string, string> = {
    blockErrorRate: "Error Rate",
    runtimeDays: "Runtime",
    toffoliBudget: "Toffoli Budget",
    totalQubits: "Qubits",
  };

  const paramLabels: Record<string, string> = {
    p: "error rate",
    cycleTime: "cycle time",
    tauToffMul: "\u03C4_Toff multiplier",
    toffoliCount: "Toffoli count",
  };

  return (
    <div>
      <h3 className="text-[10px] text-[var(--text-quaternary)] uppercase tracking-[0.2em] mb-3">
        Sensitivity Analysis
      </h3>

      <div className="space-y-2">
        {costs.map((cost) => {
          const bn = bottlenecks?.[cost];
          if (!bn) return null;

          const items = sensitivity
            .filter((s) => s.cost === cost && isFinite(s.elasticity))
            .sort((a, b) => Math.abs(b.elasticity) - Math.abs(a.elasticity))
            .slice(0, 3);

          return (
            <div key={cost} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-sm p-2">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-[var(--text-secondary)]">{costLabels[cost]}</span>
                <span className="text-[9px] text-[var(--accent)]">
                  dominated by {paramLabels[bn.parameter] || bn.parameter}
                </span>
              </div>

              {/* Elasticity bars */}
              <div className="space-y-1">
                {items.map((item, i) => {
                  const maxElasticity = Math.max(...items.map((x) => Math.abs(x.elasticity)));
                  const width = maxElasticity > 0 ? (Math.abs(item.elasticity) / maxElasticity) * 100 : 0;
                  const isPositive = item.elasticity > 0;

                  return (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-[9px] text-[var(--text-tertiary)] w-20 shrink-0 truncate">
                        {paramLabels[item.parameter] || item.parameter}
                      </span>
                      <div className="flex-1 h-2 bg-[var(--bg-surface)] rounded-sm overflow-hidden">
                        <div
                          className="h-full rounded-sm transition-all"
                          style={{
                            width: `${Math.min(width, 100)}%`,
                            backgroundColor: isPositive ? "#ef4444" : "#22c55e",
                            opacity: 0.5,
                          }}
                        />
                      </div>
                      <span className="text-[8px] text-[var(--text-quaternary)] w-10 text-right shrink-0">
                        {item.elasticity.toFixed(1)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
