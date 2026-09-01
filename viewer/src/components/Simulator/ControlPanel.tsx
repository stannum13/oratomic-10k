"use client";

import { useState, type ReactNode } from "react";
import { useSimulator } from "@/store/simulator";
import { SliderKnob, ToggleKnob } from "./Knob";
import type { ArchitectureType, MemoryCode, ProcessorCode, TargetProblem } from "@/compute/interface";
import configsData from "../../../public/data/example-configs.json";
import { getDecoder } from "@/compute/decoder";
import { ParameterSweep } from "./ParameterSweep";
import { ComparisonMode } from "./ComparisonMode";
import { MLXPanel } from "./MLXPanel";
import { SensitivityPanel } from "./SensitivityPanel";
import { ExportPanel } from "./ExportPanel";

// ─── Accordion Section ──────────────────────────────────

function Section({
  id,
  title,
  color,
  badge,
  expanded,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  color?: string;
  badge?: string;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="border-b border-[var(--border-subtle)]">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-5 py-3 hover:bg-[var(--bg-hover)] transition-colors text-left group"
      >
        {color && (
          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color, opacity: 0.7 }} />
        )}
        <span className="text-[11px] text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)] tracking-wide uppercase flex-1 transition-colors">
          {title}
        </span>
        {badge && (
          <span className="text-[9px] px-1.5 py-0.5 rounded-[3px] bg-[var(--bg-surface)] text-[var(--text-quaternary)]">
            {badge}
          </span>
        )}
        <svg
          className={`w-3 h-3 text-[var(--text-quaternary)] transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && (
        <div className="px-5 pb-4 pt-1">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Quick Stats Bar ────────────────────────────────────

function QuickStats() {
  const computed = useSimulator((s) => s.computed);
  return (
    <div className="grid grid-cols-4 gap-px bg-[var(--border-subtle)] mx-5 my-3 rounded-sm overflow-hidden">
      {[
        { label: "Qubits", value: computed.totalQubits >= 1e3 ? `${(computed.totalQubits / 1e3).toFixed(1)}k` : `${computed.totalQubits}`, color: "var(--zone-memory)" },
        { label: "Error", value: computed.blockErrorRate > 0 ? `1e${Math.floor(Math.log10(computed.blockErrorRate))}` : "\u2014", color: "var(--zone-processor)" },
        { label: "Runtime", value: computed.runtimeDays >= 365 ? `${(computed.runtimeDays / 365).toFixed(1)}yr` : computed.runtimeDays >= 1 ? `${computed.runtimeDays.toFixed(0)}d` : `${(computed.runtimeDays * 24).toFixed(0)}h`, color: "var(--zone-operation)" },
        { label: "Status", value: computed.feasible ? "GO" : "FAIL", color: computed.feasible ? "var(--success)" : "var(--danger)" },
      ].map((stat) => (
        <div key={stat.label} className="bg-black p-2.5 text-center">
          <div className="text-[14px] font-semibold mono count-animate" style={{ color: stat.color }}>
            {stat.value}
          </div>
          <div className="text-[9px] text-[var(--text-quaternary)] tracking-wide uppercase mt-0.5">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Control Panel ─────────────────────────────────

export function ControlPanel() {
  const {
    physicalErrorRate, cycleTime, architectureType, targetProblem,
    memoryCode, processorCode, decoderType,
    setPhysicalErrorRate, setCycleTime, setArchitectureType, setTargetProblem,
    setMemoryCode, setProcessorCode, setDecoderType,
    computed, computeLiveCode, liveCode, liveCodeLoading,
  } = useSimulator();

  const [expanded, setExpanded] = useState<string>("physics");
  const toggle = (id: string) => setExpanded(expanded === id ? "" : id);

  const decoderInfo = getDecoder(decoderType).getStats();
  const presets = configsData.configs;

  const applyPreset = (preset: typeof presets[0]) => {
    setPhysicalErrorRate(preset.physicalErrorRate);
    setCycleTime(preset.cycleTime);
    setArchitectureType(preset.architectureType as ArchitectureType);
    setTargetProblem(preset.targetProblem as TargetProblem);
    setMemoryCode(preset.memoryCode as MemoryCode);
    setProcessorCode(preset.processorCode as ProcessorCode);
  };

  const waterfall = computed.timingWaterfall;
  const segments = [
    { label: "Readout", value: waterfall.readout, color: "var(--zone-memory)" },
    { label: "Transport", value: waterfall.transport, color: "var(--zone-processor)" },
    { label: "Gates", value: waterfall.gates, color: "var(--zone-operation)" },
    { label: "Decode", value: waterfall.decode, color: "var(--zone-resource)" },
  ];

  return (
    <div className="pb-8">
      {/* Quick Stats */}
      <QuickStats />

      {/* Accordion Sections */}
      <Section id="presets" title="Presets" badge={`${presets.length}`} color="#6366f1" expanded={expanded === "presets"} onToggle={() => toggle("presets")}>
        <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
          {presets.map((preset, i) => (
            <button
              key={i}
              onClick={() => applyPreset(preset)}
              className="w-full text-left bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] hover:border-[rgba(99,102,241,0.15)] rounded-[4px] p-2.5 transition-all group"
            >
              <div className="text-[11px] text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors font-medium">
                {preset.name}
              </div>
              <div className="text-[10px] text-[var(--text-quaternary)] mt-0.5 line-clamp-1">
                {preset.description}
              </div>
              {"whatToLookAt" in preset && (
                <div className="text-[9px] text-[var(--accent)] opacity-0 group-hover:opacity-50 mt-1 line-clamp-2 transition-opacity">
                  {(preset as any).whatToLookAt}
                </div>
              )}
            </button>
          ))}
        </div>
      </Section>

      <Section id="physics" title="Physical Parameters" color="#00d4ff" expanded={expanded === "physics"} onToggle={() => toggle("physics")}>
        <SliderKnob label="Physical Error Rate (p)" value={physicalErrorRate} min={0.0001} max={0.01} step={0.0001} logarithmic formatValue={(v) => `${(v * 100).toFixed(2)}%`} onChange={setPhysicalErrorRate} />
        <SliderKnob label="Cycle Time" value={cycleTime} min={0.001} max={10} step={0.001} unit="ms" logarithmic formatValue={(v) => v >= 1 ? `${v.toFixed(1)}` : `${(v * 1000).toFixed(0)} \u00B5s`} onChange={setCycleTime} />
        <ToggleKnob<TargetProblem> label="Target Problem" value={targetProblem} options={[{ value: "ecc-256", label: "ECC-256" }, { value: "rsa-2048", label: "RSA-2048" }]} onChange={setTargetProblem} />
        <ToggleKnob<ArchitectureType> label="Architecture" value={architectureType} options={[{ value: "space-efficient", label: "Space" }, { value: "balanced", label: "Balanced" }, { value: "time-efficient", label: "Time" }]} onChange={setArchitectureType} />
      </Section>

      <Section id="codes" title="Code Architecture" color="#ff8a00" expanded={expanded === "codes"} onToggle={() => toggle("codes")}>
        <ToggleKnob<MemoryCode> label="Memory Code" value={memoryCode} options={[{ value: "lp16", label: "lp\u2081\u2086" }, { value: "lp20", label: "lp\u2082\u2080" }, { value: "lp24", label: "lp\u2082\u2084" }]} onChange={setMemoryCode} />
        <ToggleKnob<ProcessorCode> label="Processor Code" value={processorCode} options={[{ value: "bb18", label: "bb\u2081\u2088" }, { value: "lp-proc", label: "lp\u2082\u2080 proc" }]} onChange={setProcessorCode} />

        <div className="mt-3">
          <span className="text-[11px] text-[var(--text-tertiary)] block mb-2">
            Decoder <span className="text-[9px] text-[var(--text-quaternary)] ml-1">(preview)</span>
          </span>
          <ToggleKnob<string> label="" value={decoderType} options={[{ value: "bp-lsd", label: "BP-LSD" }, { value: "bp-simplified", label: "BP" }, { value: "neural-fno", label: "FNO" }]} onChange={(v) => setDecoderType(v)} />
          {decoderInfo && (
            <div className="mt-1.5 grid grid-cols-2 gap-1 text-[9px]">
              <span className="text-[var(--text-quaternary)]">Latency</span>
              <span className="text-[var(--text-tertiary)] mono">{decoderInfo.decoderLatencyUs >= 1000 ? `${(decoderInfo.decoderLatencyUs / 1000).toFixed(1)}ms` : `${decoderInfo.decoderLatencyUs}\u00B5s`}</span>
              <span className="text-[var(--text-quaternary)]">Throughput</span>
              <span className="text-[var(--text-tertiary)] mono">{decoderInfo.throughputHz >= 1e6 ? `${(decoderInfo.throughputHz / 1e6).toFixed(0)}MHz` : decoderInfo.throughputHz >= 1e3 ? `${(decoderInfo.throughputHz / 1e3).toFixed(0)}kHz` : `${decoderInfo.throughputHz}Hz`}</span>
            </div>
          )}
        </div>
      </Section>

      <Section id="construct" title="Live Code Construction" color="#6366f1" expanded={expanded === "construct"} onToggle={() => toggle("construct")}>
        <button
          onClick={computeLiveCode}
          disabled={liveCodeLoading}
          className="w-full py-2 px-3 bg-[var(--accent-muted)] hover:bg-[rgba(99,102,241,0.2)] active:bg-[rgba(99,102,241,0.25)] border border-[rgba(99,102,241,0.2)] rounded-[4px] text-[11px] text-[var(--accent)] transition-all disabled:opacity-30 flex items-center justify-center gap-2"
        >
          {liveCodeLoading && <div className="w-2.5 h-2.5 border border-[rgba(99,102,241,0.4)] border-t-[var(--accent)] rounded-full animate-spin" />}
          {liveCodeLoading ? "Constructing..." : "Construct LP Code"}
        </button>
        {liveCode && (
          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-0.5 text-[10px]">
            <span className="text-[var(--text-quaternary)]">Physical qubits</span><span className="text-[var(--text-secondary)] mono">{liveCode.n.toLocaleString()}</span>
            <span className="text-[var(--text-quaternary)]">Logical qubits</span><span className="text-[var(--text-secondary)] mono">&ge; {liveCode.kLowerBound.toLocaleString()}</span>
            <span className="text-[var(--text-quaternary)]">Rate</span><span className="text-[var(--text-secondary)] mono">{(liveCode.encodingRate * 100).toFixed(1)}%</span>
            <span className="text-[var(--text-quaternary)]">Stab weight</span><span className="text-[var(--text-secondary)] mono">{liveCode.stabilizerWeightX}</span>
            <span className="text-[var(--text-quaternary)]">Compute</span><span className="text-[var(--success)] mono">{liveCode.computeTimeMs.toFixed(0)}ms</span>
          </div>
        )}
      </Section>

      <Section id="timing" title="Timing Breakdown" color="#ff4488" expanded={expanded === "timing"} onToggle={() => toggle("timing")}>
        <div className="flex h-3 rounded-sm overflow-hidden mb-2">
          {segments.map((seg) => (
            <div key={seg.label} style={{ width: `${(seg.value / cycleTime) * 100}%`, backgroundColor: seg.color, opacity: 0.5 }} />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-1">
          {segments.map((seg) => (
            <div key={seg.label} className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: seg.color }} />
              <span className="text-[9px] text-[var(--text-quaternary)]">{seg.label}: <span className="mono">{(seg.value * 1000).toFixed(0)}\u00B5s</span></span>
            </div>
          ))}
        </div>
      </Section>

      <Section id="sweep" title="Parameter Sweep" color="#22c55e" expanded={expanded === "sweep"} onToggle={() => toggle("sweep")}>
        <ParameterSweep />
      </Section>

      <Section id="compare" title="Comparison" color="#eab308" expanded={expanded === "compare"} onToggle={() => toggle("compare")}>
        <ComparisonMode />
      </Section>

      <Section id="sensitivity" title="Sensitivity" color="#6366f1" expanded={expanded === "sensitivity"} onToggle={() => toggle("sensitivity")}>
        <SensitivityPanel />
      </Section>

      <Section id="mlx" title="MLX Compute" badge="GPU" color="#00ff88" expanded={expanded === "mlx"} onToggle={() => toggle("mlx")}>
        <MLXPanel />
      </Section>

      <Section id="export" title="Export" color="#ff8a00" expanded={expanded === "export"} onToggle={() => toggle("export")}>
        <ExportPanel />
      </Section>
    </div>
  );
}
