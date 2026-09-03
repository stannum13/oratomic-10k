"use client";

import { useState, useEffect, useRef } from "react";
import { useSimulator } from "@/store/simulator";
import { formatNumber } from "@/lib/format";

interface SessionEvent {
  t: number; // ms since recording started
  param: string;
  value: string;
  qubits: number;
  runtime: number;
  feasible: boolean;
}

export function SessionRecorder() {
  const [recording, setRecording] = useState(false);
  const [events, setEvents] = useState<SessionEvent[]>([]);
  const startTimeRef = useRef(0);

  const physicalErrorRate = useSimulator((s) => s.physicalErrorRate);
  const cycleTime = useSimulator((s) => s.cycleTime);
  const architectureType = useSimulator((s) => s.architectureType);
  const targetProblem = useSimulator((s) => s.targetProblem);
  const memoryCode = useSimulator((s) => s.memoryCode);
  const computed = useSimulator((s) => s.computed);

  // Track changes while recording
  const prevRef = useRef({ physicalErrorRate, cycleTime, architectureType, targetProblem, memoryCode });

  useEffect(() => {
    if (!recording) return;

    const prev = prevRef.current;
    const changes: string[] = [];

    if (prev.physicalErrorRate !== physicalErrorRate) changes.push(`p=${(physicalErrorRate * 100).toFixed(3)}%`);
    if (prev.cycleTime !== cycleTime) changes.push(`cycle=${cycleTime}ms`);
    if (prev.architectureType !== architectureType) changes.push(`arch=${architectureType}`);
    if (prev.targetProblem !== targetProblem) changes.push(`target=${targetProblem}`);
    if (prev.memoryCode !== memoryCode) changes.push(`code=${memoryCode}`);

    if (changes.length > 0) {
      setEvents(e => [...e, {
        t: Date.now() - startTimeRef.current,
        param: changes.join(", "),
        value: changes[0],
        qubits: computed.totalQubits,
        runtime: computed.runtimeDays,
        feasible: computed.feasible,
      }]);
    }

    prevRef.current = { physicalErrorRate, cycleTime, architectureType, targetProblem, memoryCode };
  }, [recording, physicalErrorRate, cycleTime, architectureType, targetProblem, memoryCode, computed]);

  const startRecording = () => {
    setEvents([]);
    startTimeRef.current = Date.now();
    setRecording(true);
  };

  const stopRecording = () => {
    setRecording(false);
  };

  const exportSession = () => {
    const data = {
      _meta: {
        tool: "Oratomic Architecture Viewer",
        version: "1.0.0",
        recorded: new Date().toISOString(),
        duration: events.length > 0 ? events[events.length - 1].t : 0,
      },
      events: events.map(e => ({
        timeMs: e.t,
        change: e.param,
        qubits: e.qubits,
        runtimeDays: e.runtime,
        feasible: e.feasible,
      })),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `exploration-session-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Controls */}
      <div style={{ display: "flex", gap: "var(--s2)", marginBottom: "var(--s3)" }}>
        {!recording ? (
          <button
            onClick={startRecording}
            style={{
              flex: 1,
              padding: "var(--s2) var(--s3)",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              borderRadius: 3,
              color: "var(--text-secondary)",
              fontSize: "var(--fs-label)",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Start recording
          </button>
        ) : (
          <button
            onClick={stopRecording}
            style={{
              flex: 1,
              padding: "var(--s2) var(--s3)",
              background: "var(--bg-elevated)",
              border: "1px solid var(--status-fail)",
              borderRadius: 3,
              color: "var(--status-fail)",
              fontSize: "var(--fs-label)",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            ● Stop ({events.length} events)
          </button>
        )}

        {events.length > 0 && !recording && (
          <button
            onClick={exportSession}
            style={{
              padding: "var(--s2) var(--s3)",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              borderRadius: 3,
              color: "var(--text-secondary)",
              fontSize: "var(--fs-label)",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Export
          </button>
        )}
      </div>

      {/* Event timeline */}
      {events.length > 0 && (
        <div style={{
          maxHeight: 160,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}>
          {events.map((e, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--s3)",
                padding: "var(--s1) var(--s2)",
                background: i % 2 === 0 ? "transparent" : "var(--bg-elevated)",
                borderRadius: 2,
                fontSize: 9,
              }}
            >
              <span className="mono" style={{ color: "var(--text-tertiary)", width: 48, flexShrink: 0 }}>
                {(e.t / 1000).toFixed(1)}s
              </span>
              <span style={{ color: "var(--text-secondary)", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {e.param}
              </span>
              <span className="mono" style={{ color: "var(--text-tertiary)", flexShrink: 0 }}>
                {formatNumber(e.qubits)}q
              </span>
              <span style={{
                width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                background: e.feasible ? "var(--status-ok)" : "var(--status-fail)",
              }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
