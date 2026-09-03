"use client";

import { useState } from "react";
import { useSimulator } from "@/store/simulator";

interface WalkthroughStep {
  title: string;
  content: string;
  section: number; // which paper section to scroll to
  action?: () => void; // optional store action
  highlight?: string; // what to look at in the 3D view
}

const WALKTHROUGHS: Record<string, { title: string; steps: WalkthroughStep[] }> = {
  "quick-tour": {
    title: "Quick Tour",
    steps: [
      {
        title: "The headline result",
        content: "This paper shows Shor's algorithm can run on just 10,000 physical qubits — five orders of magnitude fewer than prior estimates. The key enabler is high-rate qLDPC codes that pack ~1,000 logical qubits into a single code block with 30% encoding rate.",
        section: 0,
        highlight: "The four zones of the neutral-atom QPU",
      },
      {
        title: "Four functional zones",
        content: "The processor is divided into memory (stores quantum state), processor (runs gates), operation (measures syndromes), and resource (generates magic states). Atoms are physically moved between zones using optical tweezers.",
        section: 1,
        highlight: "Each dot cluster is a zone",
      },
      {
        title: "Why high-rate codes matter",
        content: "Surface codes need ~1,000 physical qubits per logical qubit. The LP codes here achieve 30% encoding rate — 3× more logical qubits per physical qubit. At p=0.1%, the lp₂₄ code achieves 10⁻¹¹ block error rate with 161× fewer qubits than surface codes.",
        section: 2,
        highlight: "Memory zone — the largest block",
      },
      {
        title: "The compilation strategy",
        content: "Circuits are split into sub-circuits that fit inside the processor code. Logical qubits teleport from memory to processor, computation happens via Pauli product measurements, then qubits teleport back. Each Toffoli takes ~19 surgery cycles in balanced mode.",
        section: 3,
        highlight: "Watch for transport arcs between zones",
      },
      {
        title: "Magic state factory",
        content: "Non-Clifford gates need magic states. Five bb₁₈ factory blocks produce 10 CCZ states in ~120 cycles via 8T-to-CCZ distillation. The factory is fast enough that it's never the bottleneck — until you try parallelism.",
        section: 4,
        highlight: "Resource zone — concentric ring pattern",
      },
      {
        title: "The tradeoff space",
        content: "Architecture choice creates a 100× runtime spread. Space-efficient: 9,739 qubits, months of runtime. Balanced: 11,961 qubits, 264 days. Time-efficient: 26,000 qubits, 10 days. Switch to Simulate mode to explore this yourself.",
        section: 5,
        highlight: "Try the preset configurations",
      },
    ],
  },
  "code-deep-dive": {
    title: "Code Construction Deep Dive",
    steps: [
      {
        title: "Polynomial rings",
        content: "LP codes are built over the ring F₂[x]/(xˡ+1). Each entry of the seed matrix is a polynomial, which expands into an ℓ×ℓ circulant permutation matrix. The ring order ℓ controls the code block size.",
        section: 2,
        highlight: "The seed matrix in the left pane",
      },
      {
        title: "The lifted product",
        content: "The quantum code LP(A, A†) is the hypergraph product of the seed matrix A with itself over the ring. This gives n = (r²+n²)·ℓ physical qubits and k ≥ (n-r)²·ℓ logical qubits. The 3×7 seed matrix with ℓ=75 gives the lp₂₀ code: [[4350, 1224, ≤20]].",
        section: 2,
        highlight: "Switch to Simulate → Construct LP Code to see this live",
      },
      {
        title: "Why distance matters",
        content: "The code distance d determines error suppression: block error scales as p^(d/2). Going from d=16 to d=24 improves the exponent from 7.1 to 12 — but costs more physical qubits. The Distance Sweep panel shows this tradeoff.",
        section: 2,
        highlight: "Open the Distance Sweep panel in Simulate mode",
      },
    ],
  },
  "architecture-comparison": {
    title: "Architecture Comparison",
    steps: [
      {
        title: "Three platforms, one problem",
        content: "Neutral atoms (Oratomic), trapped ions (IonQ), and superconducting qubits (Google) take fundamentally different approaches to fault tolerance. Neutral atoms offer nonlocal connectivity for qLDPC codes. Trapped ions have slow but high-fidelity gates. Superconducting qubits are fast but need planar surface codes.",
        section: 5,
        highlight: "Open Platform Comparison in Simulate mode",
      },
      {
        title: "The qubit-runtime tradeoff",
        content: "Oratomic: 10k qubits, months. Google: 4M qubits, days. IonQ: 50k qubits, weeks. The Pareto frontier shows there's no free lunch — you trade qubits for speed. The question is which regime your hardware can reach first.",
        section: 5,
        highlight: "Open the Pareto Frontier panel",
      },
      {
        title: "The decoder bottleneck",
        content: "IonQ showed a MacBook Pro can decode MegaQuOp-scale computations. The Decoder Backlog meter shows whether your decoder can keep pace with the QEC cycle. At Google's 1µs cycles, BP-LSD can't keep up. At IonQ's 100µs cycles, it's fine.",
        section: 5,
        highlight: "Try switching platforms and watch the backlog",
      },
    ],
  },
};

export function Walkthrough() {
  const [activeWalkthrough, setActiveWalkthrough] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const setActiveSection = useSimulator((s) => s.setActiveSection);

  const walkthrough = activeWalkthrough ? WALKTHROUGHS[activeWalkthrough] : null;
  const step = walkthrough?.steps[stepIndex];

  const goToStep = (idx: number) => {
    setStepIndex(idx);
    const s = walkthrough?.steps[idx];
    if (s) {
      setActiveSection(s.section);
      const el = document.querySelector(`[data-section="${s.section}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (!activeWalkthrough) {
    return (
      <div style={{ padding: "var(--s5) var(--s6)", borderBottom: "1px solid var(--border)" }}>
        <div style={{
          fontSize: "var(--fs-label)",
          color: "var(--text-tertiary)",
          letterSpacing: "var(--tracking-label)",
          textTransform: "uppercase",
          marginBottom: "var(--s3)",
        }}>
          Guided Walkthroughs
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--s2)" }}>
          {Object.entries(WALKTHROUGHS).map(([key, wt]) => (
            <button
              key={key}
              onClick={() => { setActiveWalkthrough(key); goToStep(0); }}
              style={{
                textAlign: "left",
                padding: "var(--s3) var(--s4)",
                background: "var(--bg-elevated)",
                border: "none",
                borderRadius: 3,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <div style={{ fontSize: "var(--fs-label)", fontWeight: 500, color: "var(--text-primary)" }}>
                {wt.title}
              </div>
              <div style={{ fontSize: 9, color: "var(--text-tertiary)", marginTop: 2 }}>
                {wt.steps.length} steps
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (!step) return null;

  return (
    <div style={{
      padding: "var(--s5) var(--s6)",
      borderBottom: "1px solid var(--border)",
      background: "var(--bg-pane-left)",
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "var(--s3)",
      }}>
        <span style={{
          fontSize: "var(--fs-label)",
          color: "var(--text-tertiary)",
          letterSpacing: "var(--tracking-label)",
          textTransform: "uppercase",
        }}>
          {walkthrough.title}
        </span>
        <button
          onClick={() => { setActiveWalkthrough(null); setStepIndex(0); }}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--text-tertiary)", fontSize: "var(--fs-label)",
          }}
        >
          Exit
        </button>
      </div>

      {/* Progress */}
      <div style={{ display: "flex", gap: 2, marginBottom: "var(--s3)" }}>
        {walkthrough.steps.map((_, i) => (
          <button
            key={i}
            onClick={() => goToStep(i)}
            style={{
              flex: 1, height: 2, borderRadius: 1, border: "none", cursor: "pointer",
              background: i <= stepIndex ? "var(--text-secondary)" : "var(--border)",
              transition: "background 200ms",
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div style={{
        fontSize: "var(--fs-body)",
        fontWeight: 500,
        color: "var(--text-primary)",
        marginBottom: "var(--s2)",
      }}>
        {step.title}
      </div>
      <p style={{
        fontSize: "var(--fs-label)",
        color: "var(--text-secondary)",
        lineHeight: 1.6,
        margin: `0 0 var(--s3) 0`,
      }}>
        {step.content}
      </p>
      {step.highlight && (
        <div style={{
          fontSize: 9,
          color: "var(--text-tertiary)",
          fontStyle: "italic",
          marginBottom: "var(--s3)",
        }}>
          Look for: {step.highlight}
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: "flex", gap: "var(--s2)" }}>
        <button
          onClick={() => goToStep(Math.max(0, stepIndex - 1))}
          disabled={stepIndex === 0}
          style={{
            flex: 1, padding: "var(--s2)", background: "var(--bg-elevated)",
            border: "none", borderRadius: 3, cursor: "pointer",
            color: stepIndex === 0 ? "var(--text-tertiary)" : "var(--text-secondary)",
            fontSize: "var(--fs-label)", fontFamily: "inherit",
            opacity: stepIndex === 0 ? 0.3 : 1,
          }}
        >
          Previous
        </button>
        <button
          onClick={() => {
            if (stepIndex < walkthrough.steps.length - 1) {
              goToStep(stepIndex + 1);
            } else {
              setActiveWalkthrough(null);
              setStepIndex(0);
            }
          }}
          style={{
            flex: 1, padding: "var(--s2)", background: "var(--bg-elevated)",
            border: "none", borderRadius: 3, cursor: "pointer",
            color: "var(--text-primary)",
            fontSize: "var(--fs-label)", fontWeight: 500, fontFamily: "inherit",
          }}
        >
          {stepIndex < walkthrough.steps.length - 1 ? "Next" : "Finish"}
        </button>
      </div>

      <div className="mono" style={{
        fontSize: 9, color: "var(--text-tertiary)",
        textAlign: "center", marginTop: "var(--s2)",
      }}>
        {stepIndex + 1} / {walkthrough.steps.length}
      </div>
    </div>
  );
}
