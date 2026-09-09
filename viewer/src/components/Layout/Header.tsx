"use client";

import { useState } from "react";
import { useSimulator } from "@/store/simulator";
import { encodeConfig } from "@/lib/url-state";

function ThemeToggle() {
  const theme = useSimulator((s) => s.theme);
  const setTheme = useSimulator((s) => s.setTheme);

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      style={{
        width: 28, height: 28,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "none",
        border: `1px solid var(--border)`,
        borderRadius: 3,
        cursor: "pointer",
        color: "var(--text-tertiary)",
        fontSize: 14,
      }}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? "\u2600" : "\u263E"}
    </button>
  );
}

export function Header() {
  const mode = useSimulator((s) => s.mode);
  const setMode = useSimulator((s) => s.setMode);
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "failed">("idle");

  const handleShare = async () => {
    const state = useSimulator.getState();
    const url = `${window.location.origin}${window.location.pathname}?${encodeConfig({
      p: state.physicalErrorRate, t: state.cycleTime,
      a: state.architectureType, prob: state.targetProblem,
      mem: state.memoryCode, proc: state.processorCode,
    })}`;
    try {
      await navigator.clipboard.writeText(url);
      setShareStatus("copied");
    } catch {
      setShareStatus("failed");
    }
    setTimeout(() => setShareStatus("idle"), 2000);
  };

  return (
    <header className="app-header" style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: `0 var(--s6)`, height: 48,
      borderBottom: `1px solid var(--border)`,
      background: "var(--bg)",
    }}>
      <div className="app-brand" style={{ display: "flex", alignItems: "center", gap: "var(--s3)" }}>
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

      <div className="header-actions" style={{ display: "flex", alignItems: "center", gap: "var(--s3)" }}>
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

        <ThemeToggle />

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
          {shareStatus === "copied" ? "Copied" : shareStatus === "failed" ? "Copy failed" : "Share"}
        </button>
      </div>
    </header>
  );
}
