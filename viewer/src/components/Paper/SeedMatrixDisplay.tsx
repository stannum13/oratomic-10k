"use client";

import { useSimulator } from "@/store/simulator";
import { Math, CodeParams } from "@/components/ui/Math";
import { SEED_MATRICES } from "@/lib/seed-matrices";

const CODE_PARAMS_DATA: Record<string, { n: number; k: number; d: number; rate: string }> = {
  lp16: { n: 2610, k: 744, d: 16, rate: "28.5" },
  lp20: { n: 4350, k: 1224, d: 20, rate: "28.1" },
  lp24: { n: 5278, k: 1480, d: 24, rate: "28.0" },
};

export function SeedMatrixDisplay() {
  const memoryCode = useSimulator((s) => s.memoryCode);
  const matrix = SEED_MATRICES[memoryCode];
  const params = CODE_PARAMS_DATA[memoryCode];

  if (!matrix || !params) return null;

  // Build LaTeX matrix string
  const matrixTex = matrix.entries
    .map(row => row.map(v => `x^{${v}}`).join(' & '))
    .join(' \\\\ ');

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[4px] p-4 mt-4">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] text-[var(--text-tertiary)]">
          Seed Matrix <Math tex="A" /> over <Math tex={`\\mathbb{F}_2[x]/(x^{${matrix.ringOrder}}+1)`} />
        </span>
        <CodeParams n={params.n} k={params.k} d={params.d} />
      </div>

      <div className="flex justify-center my-3">
        <Math
          tex={`A = \\begin{pmatrix} ${matrixTex} \\end{pmatrix}`}
          display
          className="text-[var(--text-primary)]"
        />
      </div>

      <div className="flex gap-5 mt-3 text-[11px] text-[var(--text-tertiary)] mono">
        <span><Math tex="n" /> = {params.n.toLocaleString()}</span>
        <span><Math tex="k" /> = {params.k.toLocaleString()}</span>
        <span><Math tex="d \leq" /> {params.d}</span>
        <span>rate = {params.rate}%</span>
      </div>
    </div>
  );
}
