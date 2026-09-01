"use client";

import { useEffect, useState } from "react";
import { useSimulator } from "@/store/simulator";
import { encodeConfig } from "@/lib/url-state";
import { mlxBridge } from "@/compute/mlx-bridge";

function MLXStatus() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    setConnected(mlxBridge.isConnected());
    const unsub = mlxBridge.onConnectionChange(setConnected);
    return () => { unsub(); };
  }, []);

  return (
    <button
      onClick={() => connected ? mlxBridge.disconnect() : mlxBridge.connect()}
      className="flex items-center gap-1.5 h-7 px-2.5 border border-[var(--border-subtle)] hover:border-[var(--border-default)] rounded-[4px] transition-all"
      title={connected ? "MLX backend connected" : "Click to connect to MLX backend"}
    >
      <div className={`w-1.5 h-1.5 rounded-full ${
        connected
          ? "bg-[var(--success)] shadow-[0_0_6px_rgba(34,197,94,0.4)]"
          : "bg-[var(--text-quaternary)]"
      }`} />
      <span className="text-[10px] font-medium text-[var(--text-tertiary)] tracking-wide uppercase mono">
        MLX
      </span>
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
      p: state.physicalErrorRate,
      t: state.cycleTime,
      a: state.architectureType,
      prob: state.targetProblem,
      mem: state.memoryCode,
      proc: state.processorCode,
    })}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="flex items-center justify-between px-5 h-12 border-b border-[var(--border-subtle)] bg-black shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-1.5 h-1.5 rounded-full bg-[var(--zone-memory)] shadow-[0_0_6px_rgba(77,201,246,0.4)]" />
        <span className="text-[13px] font-semibold text-[var(--text-primary)] tracking-tight">
          Oratomic
        </span>
        <span className="text-[13px] text-[var(--text-quaternary)]">/</span>
        <span className="text-[13px] text-[var(--text-tertiary)] font-light">
          10k Qubit Architecture
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex h-8 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[4px] overflow-hidden">
          <button
            onClick={() => setMode("paper")}
            className={`px-4 text-[11px] font-medium tracking-wide transition-all ${
              mode === "paper"
                ? "bg-[var(--accent-muted)] text-[var(--accent)]"
                : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
            }`}
          >
            Read
          </button>
          <div className="w-px bg-[var(--border-subtle)]" />
          <button
            onClick={() => setMode("simulate")}
            className={`px-4 text-[11px] font-medium tracking-wide transition-all ${
              mode === "simulate"
                ? "bg-[rgba(34,197,94,0.1)] text-[var(--success)]"
                : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
            }`}
          >
            Simulate
          </button>
        </div>

        <MLXStatus />

        <button
          onClick={handleShare}
          className="h-8 px-3 text-[11px] font-medium text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] rounded-[4px] transition-all"
        >
          {copied ? "Copied" : "Share"}
        </button>
      </div>
    </header>
  );
}
