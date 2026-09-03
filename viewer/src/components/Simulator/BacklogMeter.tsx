"use client";

import { useState, useEffect, useRef } from "react";
import { useSimulator } from "@/store/simulator";
import { PLATFORM_PRESETS } from "@/compute/lookup-tables";

export function BacklogMeter() {
  const mode = useSimulator((s) => s.mode);
  const cycleTime = useSimulator((s) => s.cycleTime);
  const hardwarePlatform = useSimulator((s) => s.hardwarePlatform);
  const [backlog, setBacklog] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const preset = PLATFORM_PRESETS[hardwarePlatform];
  const decoderLatencyMs = preset ? preset.decoderLatencyUs / 1000 : 10;
  const cycleMs = cycleTime;
  const backlogRate = Math.max(0, (decoderLatencyMs / cycleMs) - 1); // syndromes accumulating per cycle

  useEffect(() => {
    if (mode !== "simulate") {
      setBacklog(0);
      return;
    }

    intervalRef.current = setInterval(() => {
      setBacklog(prev => {
        if (backlogRate > 0) {
          return Math.min(prev + backlogRate * 0.1, 100); // accumulate
        }
        return Math.max(0, prev - 0.5); // drain
      });
    }, 100);

    return () => clearInterval(intervalRef.current);
  }, [mode, backlogRate]);

  if (mode !== "simulate") return null;

  const isBottlenecked = backlogRate > 0;
  const pct = Math.min(100, backlog);

  return (
    <div style={{ padding: "var(--s3) 0" }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "var(--s2)",
      }}>
        <span style={{ fontSize: "var(--fs-label)", color: "var(--text-tertiary)" }}>
          Decoder backlog
        </span>
        <span className="mono" style={{
          fontSize: "var(--fs-label)",
          color: isBottlenecked ? "var(--status-fail)" : "var(--status-ok)",
        }}>
          {isBottlenecked ? `+${backlogRate.toFixed(1)}/cycle` : "keeping pace"}
        </span>
      </div>
      <div style={{
        height: 3,
        background: "var(--border)",
        borderRadius: 2,
        overflow: "hidden",
      }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          background: isBottlenecked ? "var(--status-fail)" : "var(--status-ok)",
          borderRadius: 2,
          transition: "width 100ms linear",
        }} />
      </div>
      {isBottlenecked && (
        <div style={{
          fontSize: 9,
          color: "var(--status-stall)",
          marginTop: "var(--s2)",
        }}>
          Decoder latency ({decoderLatencyMs.toFixed(1)}ms) exceeds cycle time ({cycleMs.toFixed(3)}ms)
        </div>
      )}
    </div>
  );
}
