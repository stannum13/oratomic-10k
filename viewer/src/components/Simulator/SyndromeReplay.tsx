"use client";

import { useState, useRef, useEffect } from "react";
import { useSimulator } from "@/store/simulator";

interface SyndromeStep {
  id: number;
  label: string;
  description: string;
  activeQubits: "data" | "ancilla-x" | "ancilla-z" | "all";
  action: "idle" | "entangle" | "measure" | "decode" | "correct";
  syndromeValues?: number[];
  correctionMask?: number[];
}

function generateRound(n: number, k: number, p: number): SyndromeStep[] {
  const numChecksX = Math.floor((n - k) / 2);
  const numChecksZ = Math.floor((n - k) / 2);

  // Generate random syndrome based on error rate
  const syndromeX = Array.from({ length: Math.min(numChecksX, 40) }, () =>
    Math.random() < p * 5 ? 1 : 0 // amplified for visibility
  );
  const syndromeZ = Array.from({ length: Math.min(numChecksZ, 40) }, () =>
    Math.random() < p * 5 ? 1 : 0
  );

  const numErrorsX = syndromeX.filter(v => v === 1).length;
  const numErrorsZ = syndromeZ.filter(v => v === 1).length;

  // Correction mask (simplified — correct where syndrome fired)
  const correctionX = syndromeX.map(v => v);

  return [
    {
      id: 0,
      label: "Initialize",
      description: `${n} data qubits in encoded state. Preparing ${numChecksX} X-ancillae and ${numChecksZ} Z-ancillae.`,
      activeQubits: "data",
      action: "idle",
    },
    {
      id: 1,
      label: "X-stabilizer entanglement",
      description: `CNOT gates between X-ancillae and data qubits. ${numChecksX} stabilizers, weight ${Math.min(10, Math.ceil(n / numChecksX))}.`,
      activeQubits: "ancilla-x",
      action: "entangle",
    },
    {
      id: 2,
      label: "Z-stabilizer entanglement",
      description: `CNOT gates between data qubits and Z-ancillae. ${numChecksZ} stabilizers.`,
      activeQubits: "ancilla-z",
      action: "entangle",
    },
    {
      id: 3,
      label: "Measure X-ancillae",
      description: `Measure all X-ancillae. Syndrome: ${numErrorsX} of ${syndromeX.length} checks fired.`,
      activeQubits: "ancilla-x",
      action: "measure",
      syndromeValues: syndromeX,
    },
    {
      id: 4,
      label: "Measure Z-ancillae",
      description: `Measure all Z-ancillae. Syndrome: ${numErrorsZ} of ${syndromeZ.length} checks fired.`,
      activeQubits: "ancilla-z",
      action: "measure",
      syndromeValues: syndromeZ,
    },
    {
      id: 5,
      label: "Decode syndrome",
      description: `BP-LSD decoder processes ${numErrorsX + numErrorsZ} triggered checks. Estimating most likely error pattern.`,
      activeQubits: "all",
      action: "decode",
    },
    {
      id: 6,
      label: "Apply correction",
      description: `Pauli corrections applied to ${numErrorsX} X-errors and ${numErrorsZ} Z-errors. Round complete.`,
      activeQubits: "data",
      action: "correct",
      correctionMask: correctionX,
    },
  ];
}

export function SyndromeReplay() {
  const n = useSimulator((s) => s.computed.codeParams.n);
  const k = useSimulator((s) => s.computed.codeParams.k);
  const p = useSimulator((s) => s.physicalErrorRate);

  const [steps, setSteps] = useState<SyndromeStep[]>(() => generateRound(n, k, p));
  const [currentStep, setCurrentStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  // Regenerate on param change
  useEffect(() => {
    setSteps(generateRound(n, k, p));
    setCurrentStep(0);
    setPlaying(false);
  }, [n, k, p]);

  // Auto-advance when playing
  useEffect(() => {
    if (!playing) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 1) {
          setPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [playing, steps.length]);

  const step = steps[currentStep];

  const actionColor: Record<string, string> = {
    idle: "var(--text-tertiary)",
    entangle: "var(--emission-420)",
    measure: "var(--emission-780)",
    decode: "var(--text-secondary)",
    correct: "var(--status-ok)",
  };

  return (
    <div>
      {/* Transport bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--s2)",
        marginBottom: "var(--s3)",
      }}>
        <button
          onClick={() => { setCurrentStep(0); setPlaying(false); }}
          style={{ background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer", fontSize: 14, padding: 2 }}
          title="Reset"
        >
          ⏮
        </button>
        <button
          onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
          style={{ background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer", fontSize: 14, padding: 2 }}
          title="Previous step"
        >
          ◀
        </button>
        <button
          onClick={() => setPlaying(!playing)}
          style={{ background: "none", border: "none", color: "var(--text-primary)", cursor: "pointer", fontSize: 14, padding: 2 }}
          title={playing ? "Pause" : "Play"}
        >
          {playing ? "⏸" : "▶"}
        </button>
        <button
          onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
          style={{ background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer", fontSize: 14, padding: 2 }}
          title="Next step"
        >
          ▶
        </button>
        <button
          onClick={() => { setSteps(generateRound(n, k, p)); setCurrentStep(0); }}
          style={{ background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer", fontSize: 11, padding: 2, marginLeft: "auto", fontFamily: "var(--font-mono)" }}
          title="New random round"
        >
          reroll
        </button>
      </div>

      {/* Progress dots */}
      <div style={{ display: "flex", gap: 3, marginBottom: "var(--s3)" }}>
        {steps.map((s, i) => (
          <button
            key={i}
            onClick={() => { setCurrentStep(i); setPlaying(false); }}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 1,
              border: "none",
              cursor: "pointer",
              background: i <= currentStep ? actionColor[s.action] : "var(--border)",
              opacity: i === currentStep ? 1 : 0.5,
              transition: "all 200ms",
            }}
          />
        ))}
      </div>

      {/* Current step display */}
      <div style={{
        padding: "var(--s3) var(--s4)",
        background: "var(--bg-elevated)",
        borderRadius: 3,
        borderLeft: `2px solid ${actionColor[step.action]}`,
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "var(--s2)",
        }}>
          <span style={{
            fontSize: "var(--fs-label)",
            fontWeight: 500,
            color: actionColor[step.action],
          }}>
            {step.label}
          </span>
          <span className="mono" style={{
            fontSize: 9,
            color: "var(--text-tertiary)",
          }}>
            {currentStep + 1}/{steps.length}
          </span>
        </div>

        <p style={{
          fontSize: "var(--fs-label)",
          color: "var(--text-secondary)",
          lineHeight: 1.5,
          margin: 0,
        }}>
          {step.description}
        </p>

        {/* Syndrome visualization */}
        {step.syndromeValues && (
          <div style={{ marginTop: "var(--s3)" }}>
            <div style={{
              fontSize: 9,
              color: "var(--text-tertiary)",
              marginBottom: "var(--s1)",
              letterSpacing: "var(--tracking-label)",
              textTransform: "uppercase",
            }}>
              Syndrome
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {step.syndromeValues.map((v, i) => (
                <div
                  key={i}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 1,
                    background: v === 1 ? "var(--emission-780)" : "var(--border)",
                    opacity: v === 1 ? 0.9 : 0.3,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Correction mask */}
        {step.correctionMask && (
          <div style={{ marginTop: "var(--s3)" }}>
            <div style={{
              fontSize: 9,
              color: "var(--text-tertiary)",
              marginBottom: "var(--s1)",
              letterSpacing: "var(--tracking-label)",
              textTransform: "uppercase",
            }}>
              Corrections applied
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {step.correctionMask.map((v, i) => (
                <div
                  key={i}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 1,
                    background: v === 1 ? "var(--status-ok)" : "var(--border)",
                    opacity: v === 1 ? 0.9 : 0.3,
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
