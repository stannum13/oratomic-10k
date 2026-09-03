"use client";

import { useSimulator } from "@/store/simulator";
import { PLATFORM_PRESETS, PLATFORM_RESOURCE_ESTIMATES } from "@/compute/lookup-tables";
import { formatNumber } from "@/lib/format";

export function PlatformComparison() {
  const targetProblem = useSimulator((s) => s.targetProblem);
  const hardwarePlatform = useSimulator((s) => s.hardwarePlatform);

  const platforms = Object.entries(PLATFORM_PRESETS);

  return (
    <div>
      <div style={{
        fontSize: "var(--fs-label)",
        color: "var(--text-tertiary)",
        marginBottom: "var(--s3)",
        letterSpacing: "var(--tracking-label)",
        textTransform: "uppercase",
      }}>
        {targetProblem === "ecc-256" ? "ECC-256" : "RSA-2048"} across platforms
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {platforms.map(([key, preset]) => {
          const estimate = PLATFORM_RESOURCE_ESTIMATES[key]?.[targetProblem];
          const isActive = key === hardwarePlatform;

          return (
            <div
              key={key}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto auto",
                gap: "var(--s4)",
                padding: "var(--s2) var(--s3)",
                background: isActive ? "var(--bg-elevated)" : "transparent",
                borderRadius: 3,
                alignItems: "center",
              }}
            >
              <div>
                <div style={{
                  fontSize: "var(--fs-label)",
                  fontWeight: isActive ? 500 : 400,
                  color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                }}>
                  {preset.label}
                </div>
                <div style={{ fontSize: 9, color: "var(--text-tertiary)" }}>
                  p={preset.defaultErrorRate} · {preset.codeType}
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div className="mono" style={{
                  fontSize: "var(--fs-label)",
                  color: "var(--text-primary)",
                }}>
                  {estimate ? formatNumber(estimate.qubits) : "\u2014"}
                </div>
                <div style={{ fontSize: 9, color: "var(--text-tertiary)" }}>qubits</div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div className="mono" style={{
                  fontSize: "var(--fs-label)",
                  color: "var(--text-primary)",
                }}>
                  {estimate
                    ? estimate.runtimeDays >= 365
                      ? `${(estimate.runtimeDays / 365).toFixed(1)} yr`
                      : estimate.runtimeDays >= 1
                        ? `${estimate.runtimeDays.toFixed(0)} d`
                        : `${(estimate.runtimeDays * 24).toFixed(1)} hr`
                    : "\u2014"}
                </div>
                <div style={{ fontSize: 9, color: "var(--text-tertiary)" }}>runtime</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
