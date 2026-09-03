"use client";

import { useState, useEffect, useRef } from "react";
import { useSimulator } from "@/store/simulator";

interface PassStage {
  id: string;
  label: string;
  sublabel: string;
  level: "algorithm" | "logical" | "surgery" | "qec" | "physical";
  description: string;
  metric: string;
  duration: number; // ms for animation
}

function getStages(problem: string, arch: string): PassStage[] {
  const isRSA = problem === "rsa-2048";
  const n = isRSA ? 2048 : 256;

  return [
    {
      id: "input",
      label: "Problem input",
      sublabel: isRSA ? `Factor N = p·q (${n}-bit)` : `Find k: k·G = Q on P-256`,
      level: "algorithm",
      description: "Classical problem statement enters the quantum computer as a circuit specification.",
      metric: `${n}-bit key`,
      duration: 800,
    },
    {
      id: "compile",
      label: "Circuit compilation",
      sublabel: `Decompose into ${isRSA ? "modular exponentiation" : "elliptic curve arithmetic"}`,
      level: "algorithm",
      description: isRSA
        ? "Repeated squaring decomposes into modular multiplications, each built from adders and lookups."
        : "Point addition and doubling on the elliptic curve, compiled into controlled adders and lookups.",
      metric: isRSA ? "2.7B Toffoli" : "90M Toffoli",
      duration: 600,
    },
    {
      id: "subcircuit",
      label: "Sub-circuit partition",
      sublabel: "Split into processor-sized chunks",
      level: "logical",
      description: `Each chunk fits inside the processor code (${arch === "balanced" ? "148" : "10"} logical qubits). Qubits teleport in from memory, compute, teleport back.`,
      metric: arch === "balanced" ? "148 qubits/chunk" : "10 qubits/chunk",
      duration: 500,
    },
    {
      id: "teleport-in",
      label: "Teleport to processor",
      sublabel: "Memory → Processor via PPMs",
      level: "surgery",
      description: "Logical qubits move from the high-rate memory code to the processor code using 2m Pauli product measurements. The Clifford frame is tracked, not executed.",
      metric: "2m PPMs",
      duration: 700,
    },
    {
      id: "toffoli",
      label: "Execute Toffoli gate",
      sublabel: "CCZ teleportation from factory",
      level: "surgery",
      description: "A magic CCZ state is consumed from the factory buffer. Three PPMs between processor and factory implement the gate. The Clifford frame absorbs all corrections.",
      metric: "3 PPMs + 1 CCZ",
      duration: 800,
    },
    {
      id: "surgery-cycle",
      label: "Surgery cycle",
      sublabel: `${arch === "balanced" ? "13" : "12"} stabilizer measurement rounds`,
      level: "qec",
      description: "Each PPM requires τ_s = 2d/3 rounds of stabilizer measurement on the merged code. Ancilla qubits are reconfigured for each logical operator.",
      metric: `τ_s = ${arch === "balanced" ? "13.3" : "12"} cycles`,
      duration: 600,
    },
    {
      id: "syndrome",
      label: "Syndrome extraction",
      sublabel: "Measure all stabilizers",
      level: "qec",
      description: "X and Z stabilizers measured sequentially. CNOT gates between data and ancilla qubits, scheduled by edge coloring of the Tanner graph. Ancillae measured, syndrome extracted.",
      metric: "weight-10 checks",
      duration: 700,
    },
    {
      id: "decode",
      label: "Classical decoding",
      sublabel: "BP-LSD on syndrome",
      level: "physical",
      description: "Belief propagation with localized statistics decoder. Ensemble of 5 instances with varied channel models. The correction is a Pauli frame update, not a physical operation.",
      metric: "~10ms latency",
      duration: 500,
    },
    {
      id: "physical-gate",
      label: "Physical gate",
      sublabel: "Rydberg excitation",
      level: "physical",
      description: "Two-qubit CZ gate via simultaneous Rydberg excitation. 200ns pulse creates entanglement. Atoms return to clock states. Fidelity: 99.9%.",
      metric: "200ns / 99.9%",
      duration: 400,
    },
    {
      id: "teleport-out",
      label: "Teleport to memory",
      sublabel: "Processor → Memory",
      level: "surgery",
      description: "Results teleported back to memory. Sub-circuit complete. Processor reset for next chunk.",
      metric: "2m PPMs",
      duration: 600,
    },
    {
      id: "result",
      label: "Classical output",
      sublabel: isRSA ? "Factors p, q" : "Private key k",
      level: "algorithm",
      description: "After all sub-circuits execute and QFT/post-processing completes, classical output is extracted by measuring all logical qubits.",
      metric: isRSA ? "p × q = N" : "k · G = Q",
      duration: 1000,
    },
  ];
}

const LEVEL_COLORS: Record<string, string> = {
  algorithm: "var(--text-primary)",
  logical: "var(--text-secondary)",
  surgery: "var(--text-tertiary)",
  qec: "var(--emission-420)",
  physical: "var(--emission-780)",
};

export function ForwardPass() {
  const targetProblem = useSimulator((s) => s.targetProblem);
  const architectureType = useSimulator((s) => s.architectureType);

  const stages = getStages(targetProblem, architectureType);
  const [activeStage, setActiveStage] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!playing) return;
    const stage = stages[activeStage];
    timerRef.current = setTimeout(() => {
      if (activeStage < stages.length - 1) {
        setActiveStage(prev => prev + 1);
      } else {
        setPlaying(false);
      }
    }, stage.duration);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [playing, activeStage, stages]);

  const stage = stages[activeStage];

  return (
    <div>
      {/* Transport */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--s2)", marginBottom: "var(--s3)" }}>
        <button
          onClick={() => { setActiveStage(0); setPlaying(false); }}
          style={{ background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer", fontSize: 12, padding: 2 }}
        >⏮</button>
        <button
          onClick={() => setPlaying(!playing)}
          style={{ background: "none", border: "none", color: "var(--text-primary)", cursor: "pointer", fontSize: 12, padding: 2 }}
        >{playing ? "⏸" : "▶"}</button>
        <button
          onClick={() => setActiveStage(prev => Math.min(stages.length - 1, prev + 1))}
          style={{ background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer", fontSize: 12, padding: 2 }}
        >▶</button>
        <span className="mono" style={{ marginLeft: "auto", fontSize: 9, color: "var(--text-tertiary)" }}>
          {activeStage + 1}/{stages.length}
        </span>
      </div>

      {/* Pipeline visualization */}
      <div style={{ display: "flex", flexDirection: "column", gap: 1, marginBottom: "var(--s3)" }}>
        {stages.map((s, i) => {
          const isActive = i === activeStage;
          const isPast = i < activeStage;

          return (
            <button
              key={s.id}
              onClick={() => { setActiveStage(i); setPlaying(false); }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--s2)",
                padding: "3px var(--s2)",
                background: isActive ? "var(--bg-elevated)" : "transparent",
                border: "none",
                borderRadius: 2,
                cursor: "pointer",
                textAlign: "left",
                fontFamily: "inherit",
                opacity: isPast ? 0.4 : isActive ? 1 : 0.6,
                transition: "all 200ms",
                borderLeft: `2px solid ${isActive ? LEVEL_COLORS[s.level] : "transparent"}`,
              }}
            >
              <div style={{
                width: 5, height: 5, borderRadius: "50%",
                background: isPast ? "var(--status-ok)" : isActive ? LEVEL_COLORS[s.level] : "var(--border)",
                flexShrink: 0,
                transition: "background 300ms",
              }} />
              <span style={{
                fontSize: 9,
                color: isActive ? "var(--text-primary)" : "var(--text-tertiary)",
                flex: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>
                {s.label}
              </span>
              <span className="mono" style={{
                fontSize: 8,
                color: "var(--text-tertiary)",
                flexShrink: 0,
              }}>
                {s.metric}
              </span>
            </button>
          );
        })}
      </div>

      {/* Detail panel */}
      <div style={{
        padding: "var(--s3) var(--s4)",
        background: "var(--bg-elevated)",
        borderRadius: 3,
        borderLeft: `2px solid ${LEVEL_COLORS[stage.level]}`,
      }}>
        <div style={{ fontSize: "var(--fs-label)", fontWeight: 500, color: LEVEL_COLORS[stage.level], marginBottom: 2 }}>
          {stage.label}
        </div>
        <div style={{ fontSize: 9, color: "var(--text-tertiary)", marginBottom: "var(--s2)" }}>
          {stage.sublabel}
        </div>
        <p style={{ fontSize: "var(--fs-label)", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
          {stage.description}
        </p>
      </div>

      {/* Level legend */}
      <div style={{ display: "flex", gap: "var(--s3)", marginTop: "var(--s3)", flexWrap: "wrap" }}>
        {Object.entries(LEVEL_COLORS).map(([level, color]) => (
          <div key={level} style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: color }} />
            <span style={{ fontSize: 8, color: "var(--text-tertiary)" }}>{level}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
