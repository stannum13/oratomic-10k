"use client";

import { useEffect, useState } from "react";
import { useSimulator } from "@/store/simulator";

const SHORTCUTS = [
  { keys: "?", action: "Show this help" },
  { keys: "\u2318Z", action: "Undo parameter change" },
  { keys: "R", action: "Switch to Read mode" },
  { keys: "S", action: "Switch to Simulate mode" },
  { keys: "P", action: "Pin current config for comparison" },
  { keys: "C", action: "Construct LP code" },
  { keys: "1\u20137", action: "Jump to section (in Read mode)" },
  { keys: "Esc", action: "Close overlay" },
];

export function KeyboardShortcuts() {
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === "?") {
        e.preventDefault();
        setShowHelp(v => !v);
        return;
      }

      if (e.key === "Escape") {
        setShowHelp(false);
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        useSimulator.getState().undoParams();
        return;
      }

      const store = useSimulator.getState();

      if (e.key === "r" || e.key === "R") {
        store.setMode("paper");
        return;
      }

      if (e.key === "s" && !e.metaKey && !e.ctrlKey) {
        store.setMode("simulate");
        return;
      }

      if (e.key === "p" || e.key === "P") {
        store.setPinnedConfig({
          label: `${store.architectureType} / ${store.memoryCode}`,
          computed: { ...store.computed },
          params: {
            physicalErrorRate: store.physicalErrorRate,
            cycleTime: store.cycleTime,
            architectureType: store.architectureType,
            targetProblem: store.targetProblem,
            memoryCode: store.memoryCode,
            processorCode: store.processorCode,
          },
        });
        return;
      }

      if (e.key === "c" || e.key === "C") {
        store.computeLiveCode();
        return;
      }

      // Number keys 1-7 jump to sections
      const num = parseInt(e.key);
      if (num >= 1 && num <= 7 && store.mode === "paper") {
        const el = document.querySelector(`[data-section="${num - 1}"]`);
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (!showHelp) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(8, 9, 12, 0.85)",
        backdropFilter: "blur(8px)",
      }}
      onClick={() => setShowHelp(false)}
    >
      <div
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border)",
          borderRadius: 6,
          padding: "var(--s6)",
          width: 360,
          maxWidth: "90vw",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          fontSize: "var(--fs-body)",
          fontWeight: 500,
          color: "var(--text-primary)",
          marginBottom: "var(--s5)",
        }}>
          Keyboard shortcuts
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--s3)" }}>
          {SHORTCUTS.map(s => (
            <div key={s.keys} style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <span style={{
                fontSize: "var(--fs-label)",
                color: "var(--text-secondary)",
              }}>
                {s.action}
              </span>
              <kbd style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--fs-label)",
                color: "var(--text-primary)",
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: 3,
                padding: "2px 6px",
                minWidth: 28,
                textAlign: "center",
              }}>
                {s.keys}
              </kbd>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: "var(--s5)",
          fontSize: "var(--fs-label)",
          color: "var(--text-tertiary)",
          textAlign: "center",
        }}>
          Press ? or Esc to close
        </div>
      </div>
    </div>
  );
}
