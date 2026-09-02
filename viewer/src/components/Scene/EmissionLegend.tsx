"use client";

import { useSimulator } from "@/store/simulator";

export function EmissionLegend() {
  const mode = useSimulator((s) => s.mode);

  if (mode !== "simulate") return null;

  const items = [
    { color: "#6B7BFF", label: "Rydberg excitation (420nm)" },
    { color: "#FF4D3D", label: "Transport / error (780nm)" },
    { color: "#FFD166", label: "Erasure detection" },
  ];

  return (
    <div style={{
      position: "absolute",
      bottom: "var(--s6)",
      right: "var(--s5)",
      zIndex: 2,
      display: "flex",
      flexDirection: "column",
      gap: "var(--s2)",
      pointerEvents: "none",
    }}>
      {items.map((item) => (
        <div key={item.label} style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--s2)",
        }}>
          <div style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: item.color,
            boxShadow: `0 0 4px ${item.color}40`,
          }} />
          <span style={{
            fontSize: 9,
            fontFamily: "var(--font-mono)",
            color: "var(--text-tertiary)",
            letterSpacing: "0.05em",
          }}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
