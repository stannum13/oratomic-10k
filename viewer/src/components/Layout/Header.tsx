"use client";

import { useEffect, useState } from "react";
import { useSimulator } from "@/store/simulator";
import { encodeConfig } from "@/lib/url-state";
import { mlxBridge } from "@/compute/mlx-bridge";

function MLXIndicator() {
  const [connected, setConnected] = useState(false);
  useEffect(() => {
    setConnected(mlxBridge.isConnected());
    const unsub = mlxBridge.onConnectionChange(setConnected);
    return () => { unsub(); };
  }, []);

  return (
    <button
      onClick={() => connected ? mlxBridge.disconnect() : mlxBridge.connect()}
      style={{
        display: "flex", alignItems: "center", gap: "var(--s2)",
        padding: `var(--s1) var(--s3)`,
        background: "none", border: `1px solid var(--border)`,
        borderRadius: 3, cursor: "pointer",
        fontSize: "var(--fs-label)", color: "var(--text-tertiary)",
        letterSpacing: "var(--tracking-label)", textTransform: "uppercase",
      }}
    >
      <div style={{
        width: 6, height: 6, borderRadius: "50%",
        background: connected ? "var(--status-ok)" : "var(--border)",
        boxShadow: connected ? "0 0 6px rgba(74,222,128,0.4)" : "none",
      }} />
      MLX
    </button>
  );
}

export function Header() {
  const mode = useSimulator((s) => s.mode);
  const setMode = useSimulator((s) => s.setMode);
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const state = useSimulator.getState();
    const url = `${window.location.origin}${window.location.pathname}?${encodeConfig({
      p: state.physicalErrorRate, t: state.cycleTime,
      a: state.architectureType, prob: state.targetProblem,
      mem: state.memoryCode, proc: state.processorCode,
    })}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: `0 var(--s6)`, height: 48,
      borderBottom: `1px solid var(--border)`,
      background: "var(--bg)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--s3)" }}>
        <span style={{ fontSize: "var(--fs-body)", fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
          Oratomic
        </span>
        <span style={{ color: "var(--border)", fontSize: "var(--fs-body)" }}>/</span>
        <span style={{ fontSize: "var(--fs-body)", fontWeight: 300, color: "var(--text-tertiary)" }}>
          10k Architecture
        </span>
        <span style={{
          fontSize: "var(--fs-label)",
          color: "var(--text-tertiary)",
          marginLeft: "var(--s2)",
          opacity: 0.5,
        }}>
          v1.0.0
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "var(--s3)" }}>
        <div style={{ display: "flex", border: `1px solid var(--border)`, borderRadius: 3, overflow: "hidden" }}>
          {(["paper", "simulate"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                padding: `var(--s2) var(--s4)`,
                fontSize: "var(--fs-tab)", fontWeight: 500,
                letterSpacing: "var(--tracking-tab)",
                background: mode === m ? "var(--bg-elevated)" : "transparent",
                color: mode === m ? "var(--text-primary)" : "var(--text-tertiary)",
                border: "none", cursor: "pointer",
                borderRight: m === "paper" ? `1px solid var(--border)` : "none",
              }}
            >
              {m === "paper" ? "Read" : "Simulate"}
            </button>
          ))}
        </div>

        <MLXIndicator />

        <button
          onClick={handleShare}
          style={{
            padding: `var(--s2) var(--s3)`,
            fontSize: "var(--fs-label)", fontWeight: 500,
            color: "var(--text-tertiary)",
            background: "none", border: `1px solid var(--border)`,
            borderRadius: 3, cursor: "pointer",
            letterSpacing: "var(--tracking-label)", textTransform: "uppercase",
          }}
        >
          {copied ? "Copied" : "Share"}
        </button>
      </div>
    </header>
  );
}
