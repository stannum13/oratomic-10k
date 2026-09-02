"use client";

import { useSimulator } from "@/store/simulator";
import { SCALE_STOPS } from "@/lib/motion";

export function TimeScaleControl() {
  const timeScale = useSimulator((s) => s.timeScale);
  const setTimeScale = useSimulator((s) => s.setTimeScale);

  const stops = SCALE_STOPS;
  const minLog = stops[0].logRate;
  const maxLog = stops[stops.length - 1].logRate;

  // Find closest stop for label
  const closest = stops.reduce((prev, curr) =>
    Math.abs(curr.logRate - timeScale) < Math.abs(prev.logRate - timeScale) ? curr : prev
  );

  return (
    <div style={{ padding: "var(--s4) 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--s2)" }}>
        <span style={{ fontSize: "var(--fs-label)", color: "var(--text-tertiary)" }}>
          Time scale
        </span>
        <span className="mono" style={{ fontSize: "var(--fs-label)", color: "var(--text-secondary)" }}>
          {closest.label}
        </span>
      </div>

      <div style={{ position: "relative", height: 20, display: "flex", alignItems: "center" }}>
        <input
          type="range"
          min={minLog}
          max={maxLog}
          step={0.5}
          value={timeScale}
          onChange={(e) => setTimeScale(parseFloat(e.target.value))}
          aria-label="Time scale"
          aria-valuetext={closest.label}
          style={{
            width: "100%",
            height: 3,
            appearance: "none",
            WebkitAppearance: "none",
            background: `linear-gradient(to right, var(--text-tertiary) ${((timeScale - minLog) / (maxLog - minLog)) * 100}%, var(--border) ${((timeScale - minLog) / (maxLog - minLog)) * 100}%)`,
            borderRadius: 2,
            outline: "none",
            cursor: "pointer",
          }}
          className="[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--text-primary)] [&::-webkit-slider-thumb]:cursor-grab"
        />
      </div>

      {/* Detent labels */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "var(--s1)" }}>
        {stops.map((stop) => (
          <button
            key={stop.id}
            onClick={() => setTimeScale(stop.logRate)}
            style={{
              fontSize: 8,
              color: Math.abs(stop.logRate - timeScale) < 1 ? "var(--text-secondary)" : "var(--text-tertiary)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "2px 0",
              opacity: Math.abs(stop.logRate - timeScale) < 1 ? 1 : 0.5,
              transition: "all 200ms",
            }}
          >
            {stop.id}
          </button>
        ))}
      </div>
    </div>
  );
}
