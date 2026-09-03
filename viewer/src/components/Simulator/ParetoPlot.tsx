"use client";

import { useMemo } from "react";
import { useSimulator } from "@/store/simulator";
import { PLATFORM_PRESETS, PLATFORM_RESOURCE_ESTIMATES } from "@/compute/lookup-tables";
import { formatNumber } from "@/lib/format";

export function ParetoPlot() {
  const targetProblem = useSimulator((s) => s.targetProblem);
  const hardwarePlatform = useSimulator((s) => s.hardwarePlatform);
  const computed = useSimulator((s) => s.computed);

  const width = 320;
  const height = 200;
  const pad = { top: 16, right: 16, bottom: 32, left: 52 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const points = useMemo(() => {
    const pts: { key: string; label: string; qubits: number; runtime: number; active: boolean }[] = [];

    for (const [key, preset] of Object.entries(PLATFORM_PRESETS)) {
      const est = PLATFORM_RESOURCE_ESTIMATES[key]?.[targetProblem];
      if (!est) continue;
      pts.push({
        key,
        label: preset.label.split(" ")[0], // short name
        qubits: est.qubits,
        runtime: est.runtimeDays,
        active: key === hardwarePlatform,
      });
    }

    // Add current config as a point
    pts.push({
      key: "current",
      label: "Current",
      qubits: computed.totalQubits,
      runtime: computed.runtimeDays,
      active: true,
    });

    return pts;
  }, [targetProblem, hardwarePlatform, computed.totalQubits, computed.runtimeDays]);

  // Log scales
  const allQ = points.map(p => p.qubits).filter(v => v > 0);
  const allR = points.map(p => p.runtime).filter(v => v > 0 && isFinite(v));

  if (allQ.length === 0 || allR.length === 0) return null;

  const qMin = Math.min(...allQ) * 0.5;
  const qMax = Math.max(...allQ) * 2;
  const rMin = Math.min(...allR) * 0.5;
  const rMax = Math.max(...allR) * 2;

  const logQ = (v: number) => Math.log10(Math.max(v, 1));
  const logR = (v: number) => Math.log10(Math.max(v, 0.001));

  const scaleX = (q: number) => pad.left + ((logQ(q) - logQ(qMin)) / (logQ(qMax) - logQ(qMin))) * plotW;
  const scaleY = (r: number) => pad.top + plotH - ((logR(r) - logR(rMin)) / (logR(rMax) - logR(rMin))) * plotH;

  // Pareto frontier (lower-left is better)
  const sorted = [...points].filter(p => p.qubits > 0 && p.runtime > 0 && isFinite(p.runtime)).sort((a, b) => a.qubits - b.qubits);
  const frontier: typeof points = [];
  let minRuntime = Infinity;
  for (const p of sorted) {
    if (p.runtime < minRuntime) {
      frontier.push(p);
      minRuntime = p.runtime;
    }
  }

  const frontierPath = frontier.length > 1
    ? `M ${frontier.map(p => `${scaleX(p.qubits).toFixed(1)} ${scaleY(p.runtime).toFixed(1)}`).join(" L ")}`
    : "";

  // Axis ticks
  const qTicks = [1e3, 1e4, 1e5, 1e6].filter(v => v >= qMin && v <= qMax);
  const rTicks = [0.01, 0.1, 1, 10, 100, 1000, 10000].filter(v => v >= rMin && v <= rMax);

  return (
    <div>
      <svg width={width} height={height} style={{ width: "100%" }} viewBox={`0 0 ${width} ${height}`}>
        {/* Grid */}
        {qTicks.map(q => (
          <line key={`gq-${q}`} x1={scaleX(q)} y1={pad.top} x2={scaleX(q)} y2={pad.top + plotH}
            stroke="var(--border)" strokeDasharray="2,4" />
        ))}
        {rTicks.map(r => (
          <line key={`gr-${r}`} x1={pad.left} y1={scaleY(r)} x2={pad.left + plotW} y2={scaleY(r)}
            stroke="var(--border)" strokeDasharray="2,4" />
        ))}

        {/* Pareto frontier */}
        {frontierPath && (
          <path d={frontierPath} fill="none" stroke="var(--text-tertiary)" strokeWidth={1} strokeDasharray="4,4" opacity={0.5} />
        )}

        {/* Points */}
        {points.filter(p => p.qubits > 0 && p.runtime > 0 && isFinite(p.runtime)).map(p => (
          <g key={p.key}>
            <circle
              cx={scaleX(p.qubits)}
              cy={scaleY(p.runtime)}
              r={p.key === "current" ? 5 : 4}
              fill={p.key === "current" ? "var(--emission-420)" : p.active ? "var(--text-primary)" : "var(--text-tertiary)"}
              opacity={p.key === "current" ? 0.9 : 0.6}
            />
            <text
              x={scaleX(p.qubits)}
              y={scaleY(p.runtime) - 8}
              textAnchor="middle"
              fill="var(--text-tertiary)"
              fontSize="8"
              fontFamily="var(--font-mono)"
            >
              {p.label}
            </text>
          </g>
        ))}

        {/* Axis labels */}
        {qTicks.map(q => (
          <text key={`ql-${q}`} x={scaleX(q)} y={height - 4} textAnchor="middle"
            fill="var(--text-tertiary)" fontSize="8" fontFamily="var(--font-mono)">
            {formatNumber(q)}
          </text>
        ))}
        {rTicks.map(r => (
          <text key={`rl-${r}`} x={pad.left - 4} y={scaleY(r) + 3} textAnchor="end"
            fill="var(--text-tertiary)" fontSize="8" fontFamily="var(--font-mono)">
            {r >= 365 ? `${(r/365).toFixed(0)}yr` : r >= 1 ? `${r.toFixed(0)}d` : `${(r*24).toFixed(0)}h`}
          </text>
        ))}

        {/* Axis titles */}
        <text x={width / 2} y={height - 16} textAnchor="middle"
          fill="var(--text-tertiary)" fontSize="9" fontFamily="var(--font-body)">
          Physical qubits
        </text>
        <text x={12} y={height / 2} textAnchor="middle" transform={`rotate(-90, 12, ${height/2})`}
          fill="var(--text-tertiary)" fontSize="9" fontFamily="var(--font-body)">
          Runtime
        </text>
      </svg>
    </div>
  );
}
