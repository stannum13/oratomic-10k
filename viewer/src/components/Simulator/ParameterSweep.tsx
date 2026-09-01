"use client";

import { useState, useMemo, useDeferredValue } from "react";
import { useSimulator } from "@/store/simulator";
import { computeWithEngine } from "@/compute/engine-compute";
import type { ArchitectureType, MemoryCode, ProcessorCode, TargetProblem } from "@/compute/interface";

type SweepParam = "physicalErrorRate" | "cycleTime";
type OutputMetric = "totalQubits" | "blockErrorRate" | "runtimeDays" | "toffoliBudget";

const SWEEP_CONFIGS: Record<SweepParam, { label: string; min: number; max: number; steps: number; logScale: boolean }> = {
  physicalErrorRate: { label: "Physical Error Rate (p)", min: 0.0001, max: 0.01, steps: 60, logScale: true },
  cycleTime: { label: "Cycle Time (ms)", min: 0.001, max: 10, steps: 60, logScale: true },
};

const OUTPUT_CONFIGS: Record<OutputMetric, { label: string; logScale: boolean; format: (v: number) => string }> = {
  totalQubits: { label: "Total Qubits", logScale: false, format: (v) => v >= 1e3 ? `${(v/1e3).toFixed(1)}k` : `${v}` },
  blockErrorRate: { label: "Block Error Rate", logScale: true, format: (v) => v === 0 ? "0" : `1e${Math.floor(Math.log10(v))}` },
  runtimeDays: { label: "Runtime (days)", logScale: true, format: (v) => v >= 365 ? `${(v/365).toFixed(1)}yr` : v >= 1 ? `${v.toFixed(0)}d` : `${(v*24).toFixed(1)}h` },
  toffoliBudget: { label: "Toffoli Budget", logScale: true, format: (v) => v >= 1e9 ? `${(v/1e9).toFixed(1)}B` : v >= 1e6 ? `${(v/1e6).toFixed(1)}M` : `${v.toFixed(0)}` },
};

export function ParameterSweep() {
  const state = useSimulator();
  const [sweepParam, setSweepParam] = useState<SweepParam>("physicalErrorRate");
  const [outputMetric, setOutputMetric] = useState<OutputMetric>("blockErrorRate");

  const deferredErrorRate = useDeferredValue(state.physicalErrorRate);
  const deferredCycleTime = useDeferredValue(state.cycleTime);

  const sweepConfig = SWEEP_CONFIGS[sweepParam];
  const outputConfig = OUTPUT_CONFIGS[outputMetric];

  const sweepData = useMemo(() => {
    const data: { x: number; y: number; feasible: boolean }[] = [];
    const cfg = sweepConfig;

    for (let i = 0; i <= cfg.steps; i++) {
      const t = i / cfg.steps;
      const x = cfg.logScale
        ? Math.pow(10, Math.log10(cfg.min) + t * (Math.log10(cfg.max) - Math.log10(cfg.min)))
        : cfg.min + t * (cfg.max - cfg.min);

      const params = {
        physicalErrorRate: deferredErrorRate,
        cycleTime: deferredCycleTime,
        architectureType: state.architectureType,
        targetProblem: state.targetProblem,
        memoryCode: state.memoryCode,
        processorCode: state.processorCode,
        [sweepParam]: x,
      };

      const result = computeWithEngine(params as {
        physicalErrorRate: number;
        cycleTime: number;
        architectureType: ArchitectureType;
        targetProblem: TargetProblem;
        memoryCode: MemoryCode;
        processorCode: ProcessorCode;
      });

      const y = result[outputMetric] as number;
      data.push({ x, y: isFinite(y) && y > 0 ? y : 1e-30, feasible: result.feasible });
    }

    return data;
  }, [sweepParam, outputMetric, deferredErrorRate, deferredCycleTime, state.architectureType, state.targetProblem, state.memoryCode, state.processorCode, sweepConfig]);

  // Current value marker position
  const currentX = state[sweepParam];

  // SVG rendering
  const width = 320;
  const height = 160;
  const padding = { top: 10, right: 10, bottom: 25, left: 45 };
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const xValues = sweepData.map(d => d.x);
  const yValues = sweepData.map(d => d.y).filter(v => v > 0 && isFinite(v));

  const xMin = Math.min(...xValues);
  const xMax = Math.max(...xValues);
  const yMin = Math.min(...yValues);
  const yMax = Math.max(...yValues);

  function scaleX(v: number): number {
    if (sweepConfig.logScale) {
      return padding.left + ((Math.log10(v) - Math.log10(xMin)) / (Math.log10(xMax) - Math.log10(xMin))) * plotW;
    }
    return padding.left + ((v - xMin) / (xMax - xMin)) * plotW;
  }

  function scaleY(v: number): number {
    if (outputConfig.logScale && yMin > 0 && yMax > 0) {
      const logRange = Math.log10(yMax) - Math.log10(yMin);
      if (logRange === 0) return padding.top + plotH / 2;
      return padding.top + plotH - ((Math.log10(v) - Math.log10(yMin)) / logRange) * plotH;
    }
    const range = yMax - yMin;
    if (range === 0) return padding.top + plotH / 2;
    return padding.top + plotH - ((v - yMin) / range) * plotH;
  }

  const pathD = sweepData
    .filter(d => d.y > 0 && isFinite(d.y))
    .map((d, i) => `${i === 0 ? "M" : "L"} ${scaleX(d.x).toFixed(1)} ${scaleY(d.y).toFixed(1)}`)
    .join(" ");

  const currentMarkerX = scaleX(currentX);

  // Y-axis labels (3 ticks)
  const yTicks = outputConfig.logScale && yMin > 0
    ? [yMin, Math.sqrt(yMin * yMax), yMax]
    : [yMin, (yMin + yMax) / 2, yMax];

  return (
    <div>
      <h3 className="text-xs font-mono text-[var(--text-tertiary)] uppercase tracking-wider mb-3">
        Parameter Sweep
      </h3>

      <div className="flex gap-2 mb-3">
        <select
          value={sweepParam}
          onChange={(e) => setSweepParam(e.target.value as SweepParam)}
          className="flex-1 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded px-2 py-1 text-xs font-mono text-[var(--text-primary)] appearance-none"
        >
          <option value="physicalErrorRate">Sweep: Error Rate</option>
          <option value="cycleTime">Sweep: Cycle Time</option>
        </select>
        <select
          value={outputMetric}
          onChange={(e) => setOutputMetric(e.target.value as OutputMetric)}
          className="flex-1 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded px-2 py-1 text-xs font-mono text-[var(--text-primary)] appearance-none"
        >
          <option value="blockErrorRate">Plot: Block Error</option>
          <option value="runtimeDays">Plot: Runtime</option>
          <option value="toffoliBudget">Plot: Toffoli Budget</option>
          <option value="totalQubits">Plot: Qubits</option>
        </select>
      </div>

      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg p-2">
        <svg width={width} height={height} className="w-full" viewBox={`0 0 ${width} ${height}`}>
          {/* Grid lines */}
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={padding.left}
                y1={scaleY(tick)}
                x2={width - padding.right}
                y2={scaleY(tick)}
                stroke="rgba(255,255,255,0.05)"
                strokeDasharray="2,4"
              />
              <text
                x={padding.left - 4}
                y={scaleY(tick) + 3}
                textAnchor="end"
                className="fill-[#5a5a5a]"
                fontSize="8"
                fontFamily="monospace"
              >
                {outputConfig.format(tick)}
              </text>
            </g>
          ))}

          {/* X-axis label */}
          <text
            x={width / 2}
            y={height - 2}
            textAnchor="middle"
            className="fill-[#5a5a5a]"
            fontSize="8"
            fontFamily="monospace"
          >
            {sweepConfig.label}
          </text>

          {/* Feasibility regions */}
          {sweepData.map((d, i) => {
            if (i === 0) return null;
            const prev = sweepData[i - 1];
            if (!d.feasible && prev.feasible) {
              return (
                <line
                  key={`thresh-${i}`}
                  x1={scaleX(d.x)}
                  y1={padding.top}
                  x2={scaleX(d.x)}
                  y2={padding.top + plotH}
                  stroke="#f87171"
                  strokeDasharray="3,3"
                  opacity={0.5}
                />
              );
            }
            return null;
          })}

          {/* Data line */}
          <path
            d={pathD}
            fill="none"
            stroke="#6366f1"
            strokeWidth={1.5}
            opacity={0.8}
          />

          {/* Current value marker */}
          <line
            x1={currentMarkerX}
            y1={padding.top}
            x2={currentMarkerX}
            y2={padding.top + plotH}
            stroke="#22c55e"
            strokeWidth={1}
            opacity={0.6}
          />
          <circle
            cx={currentMarkerX}
            cy={scaleY(sweepData.find(d => Math.abs(d.x - currentX) < currentX * 0.1)?.y || yMin)}
            r={3}
            fill="#22c55e"
          />
        </svg>
      </div>
    </div>
  );
}
