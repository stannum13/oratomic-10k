"use client";

import { useMemo } from "react";
import { useSimulator } from "@/store/simulator";
import { ERROR_FIT_COEFFICIENTS } from "@/compute/lookup-tables";

export function DistanceSweep() {
  const physicalErrorRate = useSimulator((s) => s.physicalErrorRate);

  const width = 320;
  const height = 160;
  const pad = { top: 12, right: 12, bottom: 28, left: 48 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const data = useMemo(() => {
    const distances = Array.from({ length: 20 }, (_, i) => (i + 2) * 2); // d = 4, 6, 8, ..., 42
    return distances.map(d => {
      // Generic power-law: P_L ~ c * p^(d/2) where c depends on code family
      const pL = 10 * Math.pow(physicalErrorRate, d / 2);
      return { d, pL: Math.max(pL, 1e-50) };
    });
  }, [physicalErrorRate]);

  // Mark paper's codes
  const paperCodes = [
    { d: 16, label: "lp\u2081\u2086", fit: ERROR_FIT_COEFFICIENTS.lp16 },
    { d: 18, label: "bb\u2081\u2088", fit: ERROR_FIT_COEFFICIENTS.bb18 },
    { d: 20, label: "lp\u2082\u2080", fit: ERROR_FIT_COEFFICIENTS["lp-proc"] },
    { d: 24, label: "lp\u2082\u2084", fit: ERROR_FIT_COEFFICIENTS.lp24 },
  ];

  const paperPoints = paperCodes.map(c => ({
    d: c.d,
    pL: c.fit.a * Math.pow(physicalErrorRate, c.fit.b),
    label: c.label,
  }));

  // Scales (log Y)
  const allPL = [...data.map(d => d.pL), ...paperPoints.map(p => p.pL)].filter(v => v > 0 && isFinite(v));
  if (allPL.length === 0) return null;

  const yMin = Math.min(...allPL) * 0.1;
  const yMax = Math.max(...allPL) * 10;
  const xMin = 2;
  const xMax = 44;

  const scaleX = (d: number) => pad.left + ((d - xMin) / (xMax - xMin)) * plotW;
  const scaleY = (pL: number) => {
    const logRange = Math.log10(yMax) - Math.log10(yMin);
    if (logRange === 0) return pad.top + plotH / 2;
    return pad.top + plotH - ((Math.log10(pL) - Math.log10(yMin)) / logRange) * plotH;
  };

  const pathD = data
    .filter(d => d.pL > 0 && isFinite(d.pL) && d.pL >= yMin && d.pL <= yMax)
    .map((d, i) => `${i === 0 ? "M" : "L"} ${scaleX(d.d).toFixed(1)} ${scaleY(d.pL).toFixed(1)}`)
    .join(" ");

  // Y ticks
  const yTicks: number[] = [];
  for (let exp = Math.ceil(Math.log10(yMin)); exp <= Math.floor(Math.log10(yMax)); exp += 5) {
    yTicks.push(Math.pow(10, exp));
  }
  if (yTicks.length < 3) {
    for (let exp = Math.ceil(Math.log10(yMin)); exp <= Math.floor(Math.log10(yMax)); exp += 2) {
      yTicks.push(Math.pow(10, exp));
    }
  }

  const superscript = (n: number): string => {
    const map: Record<string, string> = { "0":"\u2070","1":"\u00B9","2":"\u00B2","3":"\u00B3","4":"\u2074","5":"\u2075","6":"\u2076","7":"\u2077","8":"\u2078","9":"\u2079","-":"\u207B" };
    return String(n).split("").map(c => map[c] || c).join("");
  };

  return (
    <div>
      <div style={{
        fontSize: "var(--fs-label)",
        color: "var(--text-tertiary)",
        marginBottom: "var(--s2)",
      }}>
        Block error rate vs code distance at p = {(physicalErrorRate * 100).toFixed(2)}%
      </div>

      <div style={{ background: "var(--bg-elevated)", borderRadius: 3, padding: "var(--s2)" }}>
        <svg width={width} height={height} style={{ width: "100%" }} viewBox={`0 0 ${width} ${height}`}>
          {/* Grid */}
          {yTicks.map(t => (
            <g key={t}>
              <line x1={pad.left} y1={scaleY(t)} x2={pad.left + plotW} y2={scaleY(t)}
                stroke="var(--border)" strokeDasharray="2,4" />
              <text x={pad.left - 4} y={scaleY(t) + 3} textAnchor="end"
                fill="var(--text-tertiary)" fontSize="8" fontFamily="var(--font-mono)">
                10{superscript(Math.round(Math.log10(t)))}
              </text>
            </g>
          ))}

          {/* Generic curve */}
          <path d={pathD} fill="none" stroke="var(--text-tertiary)" strokeWidth={1} opacity={0.4} />

          {/* Paper code points */}
          {paperPoints.filter(p => p.pL > yMin && p.pL < yMax && isFinite(p.pL)).map(p => (
            <g key={p.label}>
              <circle cx={scaleX(p.d)} cy={scaleY(p.pL)} r={3.5}
                fill="var(--text-primary)" opacity={0.7} />
              <text x={scaleX(p.d)} y={scaleY(p.pL) - 7} textAnchor="middle"
                fill="var(--text-secondary)" fontSize="8" fontFamily="var(--font-mono)">
                {p.label}
              </text>
            </g>
          ))}

          {/* X axis */}
          {[8, 16, 20, 24, 32, 40].filter(d => d >= xMin && d <= xMax).map(d => (
            <text key={d} x={scaleX(d)} y={height - 4} textAnchor="middle"
              fill="var(--text-tertiary)" fontSize="8" fontFamily="var(--font-mono)">
              d={d}
            </text>
          ))}

          <text x={width / 2} y={height - 14} textAnchor="middle"
            fill="var(--text-tertiary)" fontSize="9">
            Code distance
          </text>
        </svg>
      </div>
    </div>
  );
}
