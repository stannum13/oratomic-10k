# Oratomic 10k Qubit Architecture Viewer — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js + R3F interactive viewer that progressively presents the Oratomic paper as scroll-driven 3D scenes, then unlocks a full architecture simulator with lab-realistic controls.

**Architecture:** Single-page Next.js app with React Three Fiber for 3D rendering. Zustand store connects lab-style parameter controls to both the 3D scene (InstancedMesh atom clouds per zone) and computed outputs (qubit counts, error rates, runtimes). Paper data extracted from main.tex into static JSON. Hybrid Observatory dark aesthetic with Tailwind CSS.

**Tech Stack:** Next.js 15, React 19, TypeScript, React Three Fiber, drei, postprocessing, Zustand, Tailwind CSS 4

---

## Task 1: Scaffold Next.js Project

**Files:**
- Create: `viewer/package.json`
- Create: `viewer/next.config.js`
- Create: `viewer/tsconfig.json`
- Create: `viewer/tailwind.config.js`
- Create: `viewer/src/app/globals.css`
- Create: `viewer/src/app/layout.tsx`
- Create: `viewer/src/app/page.tsx`

- [ ] **Step 1: Initialize project and install dependencies**

```bash
cd /Users/shiva/repos/reading-papers/oratomic-10k
npx create-next-app@latest viewer --typescript --tailwind --eslint --app --src-dir --no-import-alias
cd viewer
npm install three @react-three/fiber @react-three/drei @react-three/postprocessing zustand
npm install -D @types/three
```

- [ ] **Step 2: Configure globals.css for dark theme**

Replace `viewer/src/app/globals.css` with:

```css
@import "tailwindcss";

:root {
  --bg-primary: #111827;
  --bg-secondary: #1e293b;
  --bg-surface: rgba(255, 255, 255, 0.03);
  --border: rgba(255, 255, 255, 0.1);
  --text-primary: #e2e8f0;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --zone-memory: #4fc3f7;
  --zone-processor: #ffa726;
  --zone-operation: #4caf50;
  --zone-resource: #f06292;
  --accent-indigo: #818cf8;
  --accent-green: #34d399;
}

html, body {
  margin: 0;
  padding: 0;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: system-ui, -apple-system, sans-serif;
  overflow: hidden;
  height: 100vh;
}

* {
  box-sizing: border-box;
}
```

- [ ] **Step 3: Write layout.tsx**

Replace `viewer/src/app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shor's Algorithm — 10k Qubits | Oratomic Architecture Viewer",
  description:
    "Interactive viewer for fault-tolerant quantum computation with reconfigurable atomic qubits",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
```

- [ ] **Step 4: Write minimal page.tsx placeholder**

Replace `viewer/src/app/page.tsx` with:

```tsx
export default function Home() {
  return (
    <div className="flex items-center justify-center h-screen bg-[#111827]">
      <p className="text-[#94a3b8] font-mono text-sm">
        Oratomic Architecture Viewer — loading...
      </p>
    </div>
  );
}
```

- [ ] **Step 5: Verify dev server runs**

```bash
cd /Users/shiva/repos/reading-papers/oratomic-10k/viewer
npm run dev
```

Expected: Server starts on localhost:3000, shows dark page with loading text.

- [ ] **Step 6: Commit**

```bash
cd /Users/shiva/repos/reading-papers/oratomic-10k
git init
git add viewer/
git commit -m "feat: scaffold Next.js project with dark theme and R3F dependencies"
```

---

## Task 2: Extract Paper Data into JSON

**Files:**
- Create: `viewer/public/data/code-params.json`
- Create: `viewer/public/data/resource-tables.json`
- Create: `viewer/public/data/paper-sections.json`

- [ ] **Step 1: Create code-params.json**

```bash
mkdir -p /Users/shiva/repos/reading-papers/oratomic-10k/viewer/public/data
```

Write `viewer/public/data/code-params.json`:

```json
{
  "codes": {
    "bb18": {
      "label": "bb₁₈",
      "type": "bivariate-bicycle",
      "n": 248,
      "k": 10,
      "d": 18,
      "stabilizerWeight": 6,
      "encodingRate": 0.04,
      "polynomials": {
        "a": "1 + x^6*y + x^27",
        "b": "y^2 + x^15*y^3 + x^24",
        "l": 31,
        "m": 4
      },
      "fitCoefficients": { "a": 15.65, "b": 9 }
    },
    "lp-proc": {
      "label": "lp₂₀^{3,5}",
      "type": "lifted-product",
      "n": 1122,
      "k": 148,
      "d": 20,
      "stabilizerWeight": 8,
      "encodingRate": 0.132,
      "seedMatrix": {
        "ringOrder": 33,
        "rows": 3,
        "cols": 5,
        "entries": [
          [0, 0, 0, 0, 0],
          [0, 14, 19, 11, 26],
          [0, 13, 2, 15, 21]
        ]
      },
      "fitCoefficients": { "a": 18.5, "b": 10 }
    },
    "lp16": {
      "label": "lp₁₆^{3,7}",
      "type": "lifted-product",
      "n": 2610,
      "k": 744,
      "d": 16,
      "stabilizerWeight": 10,
      "encodingRate": 0.285,
      "seedMatrix": {
        "ringOrder": 45,
        "rows": 3,
        "cols": 7,
        "entries": [
          [29, 21, 31, 15, 37, 25, 27],
          [13, 25, 19, 26, 11, 18, 29],
          [31, 2, 27, 32, 41, 41, 18]
        ]
      },
      "fitCoefficients": { "a": 14.6, "b": 7.1 }
    },
    "lp20": {
      "label": "lp₂₀^{3,7}",
      "type": "lifted-product",
      "n": 4350,
      "k": 1224,
      "d": 20,
      "stabilizerWeight": 10,
      "encodingRate": 0.281,
      "seedMatrix": {
        "ringOrder": 75,
        "rows": 3,
        "cols": 7,
        "entries": [
          [0, 71, 73, 68, 33, 50, 47],
          [38, 39, 60, 26, 18, 1, 23],
          [73, 6, 5, 42, 20, 22, 73]
        ]
      },
      "fitCoefficients": { "a": 1.0, "b": 10, "note": "conservative d/2 fit" }
    },
    "lp24": {
      "label": "lp₂₄^{3,7}",
      "type": "lifted-product",
      "n": 5278,
      "k": 1480,
      "d": 24,
      "stabilizerWeight": 10,
      "encodingRate": 0.280,
      "seedMatrix": {
        "ringOrder": 91,
        "rows": 3,
        "cols": 7,
        "entries": [
          [57, 75, 42, 80, 7, 67, 27],
          [57, 73, 34, 12, 27, 50, 87],
          [21, 53, 70, 18, 1, 3, 18]
        ]
      },
      "fitCoefficients": { "a": 1.0, "b": 12, "note": "conservative d/2 fit" }
    }
  }
}
```

- [ ] **Step 2: Create resource-tables.json**

Write `viewer/public/data/resource-tables.json`:

```json
{
  "architectures": {
    "space-efficient-lp20": {
      "label": "Space-efficient (lp₂₀)",
      "memoryCode": "lp20",
      "processorCode": "bb18",
      "qubitBreakdown": {
        "memory": 5913,
        "processor": 367,
        "resource": 2565,
        "operation": 894
      },
      "totalQubits": 9739
    },
    "space-efficient-lp24": {
      "label": "Space-efficient (lp₂₄)",
      "memoryCode": "lp24",
      "processorCode": "bb18",
      "qubitBreakdown": {
        "memory": 7177,
        "processor": 367,
        "resource": 2565,
        "operation": 924
      },
      "totalQubits": 11033
    },
    "balanced-lp20": {
      "label": "Balanced (lp₂₀)",
      "memoryCode": "lp20",
      "processorCode": "lp-proc",
      "qubitBreakdown": {
        "memory": 5913,
        "processor": 1609,
        "resource": 2565,
        "operation": 1874
      },
      "totalQubits": 11961
    },
    "balanced-lp24": {
      "label": "Balanced (lp₂₄)",
      "memoryCode": "lp24",
      "processorCode": "lp-proc",
      "qubitBreakdown": {
        "memory": 7177,
        "processor": 1609,
        "resource": 2565,
        "operation": 1904
      },
      "totalQubits": 13255
    }
  },
  "tauToff": {
    "space-efficient": {
      "rsa-2048": { "multiplier": 43, "unit": "tau_s" },
      "ecc-256": { "multiplier": 72, "unit": "tau_s" }
    },
    "balanced": {
      "rsa-2048": { "multiplier": 10, "unit": "tau_s" },
      "ecc-256": { "multiplier": 19, "unit": "tau_s" }
    }
  },
  "toffoliCounts": {
    "rsa-2048": {
      "gidney2025": 2.7e9,
      "label": "RSA-2048 (Gidney 2025)"
    },
    "ecc-256-compilation1": {
      "count": 1.35e9,
      "logicalQubits": 1396,
      "label": "ECC-256 Compilation (1)"
    },
    "ecc-256-compilation2": {
      "count": 2.0e9,
      "logicalQubits": 952,
      "label": "ECC-256 Compilation (2)"
    }
  },
  "timeEfficient": {
    "ecc-256": {
      "parallelism": 130,
      "totalQubits": 26000,
      "runtimeDays": 10
    },
    "rsa-2048": {
      "parallelism": 1160,
      "totalQubits": 102000,
      "runtimeDays": 97
    }
  },
  "surgeryAncilla": {
    "memory-lp20": { "qubits": 342, "xChecks": 200, "zChecks": 143, "degree": 12, "distance": 20 },
    "memory-lp24": { "qubits": 364, "xChecks": 208, "zChecks": 157, "degree": 12, "distance": 22 },
    "processor-bb18": { "qubits": 189, "xChecks": 104, "zChecks": 86, "degree": 9, "distance": 18 },
    "processor-lp-proc": { "qubits": 813, "xChecks": 460, "zChecks": 357, "degree": 10, "distance": 20 },
    "resource-bb18": { "qubits": 39, "xChecks": 20, "zChecks": 20, "degree": 7, "distance": 18 }
  }
}
```

- [ ] **Step 3: Create paper-sections.json**

Write `viewer/public/data/paper-sections.json`:

```json
{
  "sections": [
    {
      "id": "hero",
      "title": "Shor's Algorithm with 10,000 Atomic Qubits",
      "subtitle": "Oratomic — Cain, Xu, King, Picard, Levine, Endres, Preskill, Huang, Bluvstein",
      "body": "Quantum computers have the potential to perform computational tasks beyond the reach of classical machines. By leveraging advances in high-rate quantum error-correcting codes, efficient logical instruction sets, and circuit design, Shor's algorithm can be executed at cryptographically relevant scales with as few as 10,000 reconfigurable atomic qubits.",
      "keyInsight": "Five orders of magnitude reduction in qubit requirements over two decades of research."
    },
    {
      "id": "architecture",
      "title": "Neutral-Atom Architecture",
      "body": "The computer is divided into four primary functional zones. The memory zone stores logical quantum information. The processor zone stores quantum information undergoing active computation. The operation zone performs Clifford logical Pauli product measurements (PPMs). The resource zone generates magic states to elevate Clifford PPMs to universal quantum computation.",
      "keyInsight": "Reconfigurable atom arrays enable nonlocal connectivity required for high-rate qLDPC codes, with demonstrated arrays exceeding 6,100 qubits.",
      "zones": [
        { "name": "Memory", "role": "Stores logical quantum information during computation", "color": "#4fc3f7" },
        { "name": "Processor", "role": "Active computation on subcircuits", "color": "#ffa726" },
        { "name": "Operation", "role": "Ancillary qubits for code surgery PPMs", "color": "#4caf50" },
        { "name": "Resource", "role": "Magic state generation via cultivation + distillation", "color": "#f06292" }
      ]
    },
    {
      "id": "codes",
      "title": "Codes, Logic, and Compilation",
      "body": "High-rate quantum low-density parity check (qLDPC) codes leverage nonlocality to densely pack many logical qubits into a single code block. We analyze lifted-product codes with encoding rates of approximately 30%, encoding more than 1,000 logical qubits. At p=0.1%, the lp₂₄ code achieves extrapolated per-cycle block failure rates of approximately 10⁻¹¹ — comparable to surface codes with the same distance but 161× fewer physical qubits.",
      "keyInsight": "LP codes with ~30% encoding rate achieve 161× qubit savings over surface codes at equivalent error suppression.",
      "equation": "[[n = (r²_A + n²_A)·ℓ, k ≥ (n_A − r_A)²·ℓ, d]]"
    },
    {
      "id": "surgery",
      "title": "Surgery and Logic",
      "body": "Universal computation is performed by teleporting logical qubits from memory to processor, executing Pauli-based computation with CCZ gate teleportation, then teleporting back. Each sub-circuit C_i involves 4m_i + 4β_i + γ_i PPMs, where m_i is the qubit count, β_i the Toffoli count, and γ_i the mid-circuit measurement count.",
      "keyInsight": "Computation on smaller processor codes avoids the prohibitive cost of surgery directly on large memory blocks.",
      "equation": "τ(C_i) = (4m_i + 4β_i + γ_i) · τ_s, where τ_s ≈ 2d/3 cycles"
    },
    {
      "id": "magic",
      "title": "Magic State Distillation",
      "body": "High-rate 8T-to-CCZ distillation combines surface-code cultivation with high-rate factory codes. Five bb₁₈ factory blocks produce 10 CCZ states each with error rate ~10⁻¹⁰ at p=0.1%, using 2,565 total qubits in ~120 cycles. The time cost per CCZ state is less than a single surgery cycle.",
      "keyInsight": "Factory produces 10 CCZ states in 120 cycles (6d_p) — fast enough that magic state generation is never the bottleneck."
    },
    {
      "id": "resources",
      "title": "Resource Estimates",
      "body": "ECC-256 requires p=0.093% with the lp₂₄ memory, with balanced architecture runtimes of ~264 days (1ms cycle time). The time-efficient architecture with P=130 parallelism achieves ~10 days for ECC-256 using 26,000 qubits. RSA-2048 runtimes are 1-2 orders of magnitude longer due to higher circuit depth.",
      "keyInsight": "Architecture choice creates a 100× runtime spread: from years (space-efficient) to days (time-efficient with parallelism)."
    },
    {
      "id": "simulator",
      "title": "Architecture Simulator",
      "body": "Explore the full parameter space of the Oratomic architecture. Adjust physical error rates, select code families, switch between architecture types, and see how qubit counts, error rates, and runtimes respond in real time.",
      "keyInsight": "Configure your own architecture and understand the design tradeoffs that drive fault-tolerant quantum computing."
    }
  ]
}
```

- [ ] **Step 4: Commit**

```bash
cd /Users/shiva/repos/reading-papers/oratomic-10k
git add viewer/public/data/
git commit -m "feat: extract paper data into structured JSON files"
```

---

## Task 3: Zustand Store and Compute Functions

**Files:**
- Create: `viewer/src/lib/constants.ts`
- Create: `viewer/src/compute/interface.ts`
- Create: `viewer/src/compute/lookup-tables.ts`
- Create: `viewer/src/compute/js-compute.ts`
- Create: `viewer/src/store/simulator.ts`

- [ ] **Step 1: Create constants.ts**

Write `viewer/src/lib/constants.ts`:

```typescript
export const ZONE_COLORS = {
  memory: "#4fc3f7",
  processor: "#ffa726",
  operation: "#4caf50",
  resource: "#f06292",
} as const;

export const CAMERA_PRESETS: Record<
  string,
  { position: [number, number, number]; target: [number, number, number]; fov: number }
> = {
  hero: { position: [0, 8, 20], target: [0, 0, 0], fov: 50 },
  architecture: { position: [0, 12, 16], target: [0, 0, 0], fov: 55 },
  codes: { position: [-8, 4, 8], target: [-8, 0, 0], fov: 45 },
  surgery: { position: [0, 6, 12], target: [0, 0, 0], fov: 50 },
  magic: { position: [8, 4, 8], target: [8, 0, 0], fov: 45 },
  resources: { position: [0, 10, 14], target: [0, 0, 0], fov: 55 },
  simulator: { position: [0, 10, 18], target: [0, 0, 0], fov: 50 },
};

export const SECTION_IDS = [
  "hero",
  "architecture",
  "codes",
  "surgery",
  "magic",
  "resources",
  "simulator",
] as const;

export type SectionId = (typeof SECTION_IDS)[number];
```

- [ ] **Step 2: Create compute interface and lookup tables**

Write `viewer/src/compute/interface.ts`:

```typescript
export interface CodeBlock {
  n: number;
  k: number;
  d: number;
  stabilizerWeight: number;
  encodingRate: number;
}

export interface QubitBreakdown {
  memory: number;
  processor: number;
  resource: number;
  operation: number;
}

export interface TimingWaterfall {
  readout: number;
  transport: number;
  gates: number;
  decode: number;
}

export interface ComputeResult {
  totalQubits: number;
  qubitBreakdown: QubitBreakdown;
  blockErrorRate: number;
  toffoliCount: number;
  toffoliBudget: number;
  runtimeDays: number;
  timingWaterfall: TimingWaterfall;
}

export type ArchitectureType = "space-efficient" | "balanced" | "time-efficient";
export type TargetProblem = "ecc-256" | "rsa-2048";
export type MemoryCode = "lp16" | "lp20" | "lp24";
export type ProcessorCode = "bb18" | "lp-proc";
```

Write `viewer/src/compute/lookup-tables.ts`:

```typescript
import type { QubitBreakdown } from "./interface";

export const QUBIT_BREAKDOWNS: Record<string, { breakdown: QubitBreakdown; total: number }> = {
  "space-efficient|lp20": {
    breakdown: { memory: 5913, processor: 367, resource: 2565, operation: 894 },
    total: 9739,
  },
  "space-efficient|lp24": {
    breakdown: { memory: 7177, processor: 367, resource: 2565, operation: 924 },
    total: 11033,
  },
  "balanced|lp20": {
    breakdown: { memory: 5913, processor: 1609, resource: 2565, operation: 1874 },
    total: 11961,
  },
  "balanced|lp24": {
    breakdown: { memory: 7177, processor: 1609, resource: 2565, operation: 1904 },
    total: 13255,
  },
};

export const TAU_TOFF_MULTIPLIERS: Record<string, Record<string, number>> = {
  "space-efficient": { "rsa-2048": 43, "ecc-256": 72 },
  balanced: { "rsa-2048": 10, "ecc-256": 19 },
  "time-efficient": { "rsa-2048": 3, "ecc-256": 3 },
};

export const TOFFOLI_COUNTS: Record<string, number> = {
  "rsa-2048": 2.7e9,
  "ecc-256": 1.35e9,
};

export const ERROR_FIT_COEFFICIENTS: Record<string, { a: number; b: number }> = {
  lp16: { a: 14.6, b: 7.1 },
  lp20: { a: 1.0, b: 10 },
  lp24: { a: 1.0, b: 12 },
  bb18: { a: 15.65, b: 9 },
  "lp-proc": { a: 18.5, b: 10 },
};

export const TIME_EFFICIENT_PRESETS: Record<string, { qubits: number; runtimeDays: number; parallelism: number }> = {
  "ecc-256": { qubits: 26000, runtimeDays: 10, parallelism: 130 },
  "rsa-2048": { qubits: 102000, runtimeDays: 97, parallelism: 1160 },
};
```

- [ ] **Step 3: Create js-compute.ts**

Write `viewer/src/compute/js-compute.ts`:

```typescript
import type {
  ArchitectureType,
  ComputeResult,
  MemoryCode,
  ProcessorCode,
  TargetProblem,
} from "./interface";
import {
  ERROR_FIT_COEFFICIENTS,
  QUBIT_BREAKDOWNS,
  TAU_TOFF_MULTIPLIERS,
  TIME_EFFICIENT_PRESETS,
  TOFFOLI_COUNTS,
} from "./lookup-tables";

export function computeArchitecture(params: {
  physicalErrorRate: number;
  cycleTime: number;
  architectureType: ArchitectureType;
  targetProblem: TargetProblem;
  memoryCode: MemoryCode;
  processorCode: ProcessorCode;
}): ComputeResult {
  const { physicalErrorRate, cycleTime, architectureType, targetProblem, memoryCode } = params;

  // Time-efficient uses fixed presets
  if (architectureType === "time-efficient") {
    const preset = TIME_EFFICIENT_PRESETS[targetProblem];
    const fit = ERROR_FIT_COEFFICIENTS[memoryCode];
    const blockErrorRate = fit.a * Math.pow(physicalErrorRate, fit.b);
    return {
      totalQubits: preset.qubits,
      qubitBreakdown: {
        memory: Math.round(preset.qubits * 0.4),
        processor: Math.round(preset.qubits * 0.25),
        resource: Math.round(preset.qubits * 0.2),
        operation: Math.round(preset.qubits * 0.15),
      },
      blockErrorRate,
      toffoliCount: TOFFOLI_COUNTS[targetProblem],
      toffoliBudget: computeToffoliBudget(blockErrorRate, 3),
      runtimeDays: preset.runtimeDays * (cycleTime / 1.0),
      timingWaterfall: computeTimingWaterfall(cycleTime, 20),
    };
  }

  // Space-efficient and balanced
  const archKey = architectureType === "space-efficient" ? "space-efficient" : "balanced";
  const lookupKey = `${archKey}|${memoryCode}`;
  const qubitData = QUBIT_BREAKDOWNS[lookupKey];

  if (!qubitData) {
    // Fallback for lp16 (not in table — use lp20 as proxy)
    const fallbackKey = `${archKey}|lp20`;
    const fallback = QUBIT_BREAKDOWNS[fallbackKey];
    return computeWithBreakdown(fallback, params);
  }

  return computeWithBreakdown(qubitData, params);
}

function computeWithBreakdown(
  qubitData: { breakdown: { memory: number; processor: number; resource: number; operation: number }; total: number },
  params: {
    physicalErrorRate: number;
    cycleTime: number;
    architectureType: ArchitectureType;
    targetProblem: TargetProblem;
    memoryCode: MemoryCode;
  },
): ComputeResult {
  const { physicalErrorRate, cycleTime, architectureType, targetProblem, memoryCode } = params;

  const fit = ERROR_FIT_COEFFICIENTS[memoryCode];
  const blockErrorRate = fit.a * Math.pow(physicalErrorRate, fit.b);

  const archKey = architectureType === "time-efficient" ? "balanced" : architectureType;
  const tauToffMultiplier = TAU_TOFF_MULTIPLIERS[archKey][targetProblem];
  const toffoliCount = TOFFOLI_COUNTS[targetProblem];
  const processorD = architectureType === "space-efficient" ? 18 : 20;
  const tauS = (2 * processorD) / 3;
  const tauToff = tauToffMultiplier * tauS;

  const toffoliBudget = computeToffoliBudget(blockErrorRate, tauToff);

  const totalCycles = toffoliCount * tauToff;
  const totalSeconds = totalCycles * (cycleTime / 1000);
  const runtimeDays = totalSeconds / 86400;

  return {
    totalQubits: qubitData.total,
    qubitBreakdown: qubitData.breakdown,
    blockErrorRate,
    toffoliCount,
    toffoliBudget,
    runtimeDays,
    timingWaterfall: computeTimingWaterfall(cycleTime, processorD),
  };
}

function computeToffoliBudget(blockErrorRate: number, tauToff: number): number {
  if (blockErrorRate <= 0 || blockErrorRate >= 1) return 0;
  return Math.log(0.9) / (tauToff * Math.log(1 - blockErrorRate));
}

function computeTimingWaterfall(cycleTimeMs: number, d: number): {
  readout: number;
  transport: number;
  gates: number;
  decode: number;
} {
  const total = cycleTimeMs;
  return {
    readout: total * 0.35,
    transport: total * 0.25,
    gates: total * 0.15,
    decode: total * 0.25,
  };
}
```

- [ ] **Step 4: Create Zustand store**

Write `viewer/src/store/simulator.ts`:

```typescript
import { create } from "zustand";
import type {
  ArchitectureType,
  ComputeResult,
  MemoryCode,
  ProcessorCode,
  TargetProblem,
} from "@/compute/interface";
import { computeArchitecture } from "@/compute/js-compute";

interface SimulatorState {
  // Mode
  mode: "paper" | "simulate";
  activeSection: number;
  setMode: (mode: "paper" | "simulate") => void;
  setActiveSection: (section: number) => void;

  // Tier 1
  physicalErrorRate: number;
  cycleTime: number;
  architectureType: ArchitectureType;
  targetProblem: TargetProblem;

  // Tier 2
  memoryCode: MemoryCode;
  processorCode: ProcessorCode;
  decoderType: string;

  // Tier 3 (derived)
  computed: ComputeResult;

  // Actions
  setPhysicalErrorRate: (v: number) => void;
  setCycleTime: (v: number) => void;
  setArchitectureType: (v: ArchitectureType) => void;
  setTargetProblem: (v: TargetProblem) => void;
  setMemoryCode: (v: MemoryCode) => void;
  setProcessorCode: (v: ProcessorCode) => void;
  setDecoderType: (v: string) => void;
}

function recompute(state: {
  physicalErrorRate: number;
  cycleTime: number;
  architectureType: ArchitectureType;
  targetProblem: TargetProblem;
  memoryCode: MemoryCode;
  processorCode: ProcessorCode;
}): ComputeResult {
  return computeArchitecture(state);
}

const defaults = {
  physicalErrorRate: 0.001,
  cycleTime: 1.0,
  architectureType: "balanced" as ArchitectureType,
  targetProblem: "ecc-256" as TargetProblem,
  memoryCode: "lp20" as MemoryCode,
  processorCode: "lp-proc" as ProcessorCode,
};

export const useSimulator = create<SimulatorState>((set) => ({
  mode: "paper",
  activeSection: 0,
  ...defaults,
  decoderType: "bp-lsd",
  computed: recompute(defaults),

  setMode: (mode) => set({ mode }),
  setActiveSection: (activeSection) => set({ activeSection }),

  setPhysicalErrorRate: (physicalErrorRate) =>
    set((s) => {
      const next = { ...s, physicalErrorRate };
      return { physicalErrorRate, computed: recompute(next) };
    }),
  setCycleTime: (cycleTime) =>
    set((s) => {
      const next = { ...s, cycleTime };
      return { cycleTime, computed: recompute(next) };
    }),
  setArchitectureType: (architectureType) =>
    set((s) => {
      const next = { ...s, architectureType };
      return { architectureType, computed: recompute(next) };
    }),
  setTargetProblem: (targetProblem) =>
    set((s) => {
      const next = { ...s, targetProblem };
      return { targetProblem, computed: recompute(next) };
    }),
  setMemoryCode: (memoryCode) =>
    set((s) => {
      const next = { ...s, memoryCode };
      return { memoryCode, computed: recompute(next) };
    }),
  setProcessorCode: (processorCode) =>
    set((s) => {
      const next = { ...s, processorCode };
      return { processorCode, computed: recompute(next) };
    }),
  setDecoderType: (decoderType) => set({ decoderType }),
}));
```

- [ ] **Step 5: Commit**

```bash
cd /Users/shiva/repos/reading-papers/oratomic-10k
git add viewer/src/lib/ viewer/src/compute/ viewer/src/store/
git commit -m "feat: add Zustand store, compute pipeline, and lookup tables from paper data"
```

---

## Task 4: Layout Shell — Header, Split Pane, Status Bar

**Files:**
- Create: `viewer/src/components/Layout/Header.tsx`
- Create: `viewer/src/components/Layout/StatusBar.tsx`
- Modify: `viewer/src/app/page.tsx`

- [ ] **Step 1: Create Header.tsx**

```bash
mkdir -p /Users/shiva/repos/reading-papers/oratomic-10k/viewer/src/components/Layout
```

Write `viewer/src/components/Layout/Header.tsx`:

```tsx
"use client";

import { useSimulator } from "@/store/simulator";

export function Header() {
  const mode = useSimulator((s) => s.mode);
  const setMode = useSimulator((s) => s.setMode);

  return (
    <header className="flex items-center justify-between px-6 h-12 border-b border-white/10 bg-[#111827] shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-[#4fc3f7]" />
        <span className="text-sm font-semibold text-[#e2e8f0] tracking-wide">
          Shor&apos;s Algorithm — 10k Qubits
        </span>
      </div>
      <div className="flex gap-1 bg-white/5 rounded-lg p-0.5">
        <button
          onClick={() => setMode("paper")}
          className={`px-3 py-1 text-xs rounded-md transition-colors ${
            mode === "paper"
              ? "bg-[#818cf8]/20 text-[#818cf8]"
              : "text-[#64748b] hover:text-[#94a3b8]"
          }`}
        >
          Paper
        </button>
        <button
          onClick={() => setMode("simulate")}
          className={`px-3 py-1 text-xs rounded-md transition-colors ${
            mode === "simulate"
              ? "bg-[#34d399]/20 text-[#34d399]"
              : "text-[#64748b] hover:text-[#94a3b8]"
          }`}
        >
          Simulate
        </button>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Create StatusBar.tsx**

Write `viewer/src/components/Layout/StatusBar.tsx`:

```tsx
"use client";

import { useSimulator } from "@/store/simulator";

function formatNumber(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}k`;
  return n.toFixed(0);
}

function formatSci(n: number): string {
  if (n === 0) return "0";
  const exp = Math.floor(Math.log10(Math.abs(n)));
  const mantissa = n / Math.pow(10, exp);
  return `${mantissa.toFixed(1)}e${exp}`;
}

function formatDays(d: number): string {
  if (d >= 365) return `${(d / 365).toFixed(1)} yr`;
  if (d >= 1) return `${d.toFixed(0)} days`;
  if (d >= 1 / 24) return `${(d * 24).toFixed(1)} hr`;
  return `${(d * 24 * 60).toFixed(0)} min`;
}

export function StatusBar() {
  const computed = useSimulator((s) => s.computed);

  return (
    <div className="flex items-center gap-6 px-6 h-10 border-t border-white/10 bg-[#111827] shrink-0 font-mono text-xs">
      <div className="flex items-center gap-2">
        <span className="text-[#64748b]">Qubits</span>
        <span className="text-[#e2e8f0]">{formatNumber(computed.totalQubits)}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[#64748b]">Block Error</span>
        <span className="text-[#e2e8f0]">{formatSci(computed.blockErrorRate)}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[#64748b]">Runtime</span>
        <span className="text-[#e2e8f0]">{formatDays(computed.runtimeDays)}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[#64748b]">Toffoli Budget</span>
        <span className="text-[#e2e8f0]">{formatNumber(computed.toffoliBudget)}</span>
      </div>
      <div className="ml-auto flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#4fc3f7]" />
          <span className="text-[#64748b]">mem {formatNumber(computed.qubitBreakdown.memory)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#ffa726]" />
          <span className="text-[#64748b]">proc {formatNumber(computed.qubitBreakdown.processor)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#4caf50]" />
          <span className="text-[#64748b]">ops {formatNumber(computed.qubitBreakdown.operation)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#f06292]" />
          <span className="text-[#64748b]">res {formatNumber(computed.qubitBreakdown.resource)}</span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Wire up page.tsx with split layout**

Replace `viewer/src/app/page.tsx` with:

```tsx
"use client";

import { Header } from "@/components/Layout/Header";
import { StatusBar } from "@/components/Layout/StatusBar";

export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-[#111827]">
      <Header />
      <div className="flex flex-1 min-h-0">
        {/* Left Pane */}
        <div className="w-[40%] overflow-y-auto border-r border-white/10 p-6">
          <p className="text-[#94a3b8] font-mono text-sm">
            Paper sections will render here...
          </p>
        </div>
        {/* Right Pane — 3D Viewport */}
        <div className="w-[60%] relative bg-[#0a0a1a]">
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-[#64748b] font-mono text-sm">
              3D viewport loading...
            </p>
          </div>
        </div>
      </div>
      <StatusBar />
    </div>
  );
}
```

- [ ] **Step 4: Verify layout renders**

```bash
cd /Users/shiva/repos/reading-papers/oratomic-10k/viewer
npm run dev
```

Expected: Dark split-pane layout with header (Paper/Simulate toggle), left pane text, right pane placeholder, and status bar with computed values.

- [ ] **Step 5: Commit**

```bash
cd /Users/shiva/repos/reading-papers/oratomic-10k
git add viewer/src/components/Layout/ viewer/src/app/page.tsx
git commit -m "feat: add Header, StatusBar, and split-pane layout shell"
```

---

## Task 5: 3D Viewport with AtomCloud

**Files:**
- Create: `viewer/src/components/Scene/Viewport.tsx`
- Create: `viewer/src/components/Scene/AtomCloud.tsx`
- Create: `viewer/src/components/Scene/ZoneLayout.tsx`
- Create: `viewer/src/components/Scene/BloomEffect.tsx`
- Modify: `viewer/src/app/page.tsx`

- [ ] **Step 1: Create ZoneLayout.ts — atom position generator**

```bash
mkdir -p /Users/shiva/repos/reading-papers/oratomic-10k/viewer/src/components/Scene
```

Write `viewer/src/components/Scene/ZoneLayout.tsx`:

```tsx
import * as THREE from "three";

export interface ZoneConfig {
  name: string;
  count: number;
  color: string;
  center: [number, number, number];
  gridSize: [number, number];
  spacing: number;
}

export function generateAtomPositions(
  count: number,
  center: [number, number, number],
  gridSize: [number, number],
  spacing: number,
): Float32Array {
  const positions = new Float32Array(count * 3);
  const [cols, rows] = gridSize;
  const offsetX = ((cols - 1) * spacing) / 2;
  const offsetZ = ((rows - 1) * spacing) / 2;

  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols) % rows;
    const layer = Math.floor(i / (cols * rows));

    positions[i * 3 + 0] = center[0] + col * spacing - offsetX;
    positions[i * 3 + 1] = center[1] + layer * spacing * 0.8;
    positions[i * 3 + 2] = center[2] + row * spacing - offsetZ;
  }

  return positions;
}

export function getZoneConfigs(breakdown: {
  memory: number;
  processor: number;
  resource: number;
  operation: number;
}): ZoneConfig[] {
  return [
    {
      name: "memory",
      count: Math.min(breakdown.memory, 6000),
      color: "#4fc3f7",
      center: [-6, 0, 0],
      gridSize: [80, 40],
      spacing: 0.15,
    },
    {
      name: "processor",
      count: Math.min(breakdown.processor, 2000),
      color: "#ffa726",
      center: [3, 0, 2],
      gridSize: [40, 20],
      spacing: 0.15,
    },
    {
      name: "operation",
      count: Math.min(breakdown.operation, 2000),
      color: "#4caf50",
      center: [3, 0, -2],
      gridSize: [40, 20],
      spacing: 0.15,
    },
    {
      name: "resource",
      count: Math.min(breakdown.resource, 3000),
      color: "#f06292",
      center: [8, 0, 0],
      gridSize: [50, 25],
      spacing: 0.15,
    },
  ];
}
```

- [ ] **Step 2: Create AtomCloud.tsx — InstancedMesh renderer**

Write `viewer/src/components/Scene/AtomCloud.tsx`:

```tsx
"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { generateAtomPositions, type ZoneConfig } from "./ZoneLayout";

interface AtomCloudProps {
  zone: ZoneConfig;
}

export function AtomCloud({ zone }: AtomCloudProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const positions = useMemo(
    () => generateAtomPositions(zone.count, zone.center, zone.gridSize, zone.spacing),
    [zone.count, zone.center, zone.gridSize, zone.spacing],
  );

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(zone.color), [zone.color]);

  useEffect(() => {
    if (!meshRef.current) return;
    for (let i = 0; i < zone.count; i++) {
      dummy.position.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [positions, zone.count, dummy]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, zone.count]}>
      <sphereGeometry args={[0.04, 8, 6]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
        toneMapped={false}
      />
    </instancedMesh>
  );
}
```

- [ ] **Step 3: Create BloomEffect.tsx**

Write `viewer/src/components/Scene/BloomEffect.tsx`:

```tsx
"use client";

import { EffectComposer, Bloom } from "@react-three/postprocessing";

export function BloomEffect() {
  return (
    <EffectComposer>
      <Bloom
        intensity={0.8}
        luminanceThreshold={0.1}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
    </EffectComposer>
  );
}
```

- [ ] **Step 4: Create Viewport.tsx**

Write `viewer/src/components/Scene/Viewport.tsx`:

```tsx
"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useSimulator } from "@/store/simulator";
import { AtomCloud } from "./AtomCloud";
import { getZoneConfigs } from "./ZoneLayout";
import { BloomEffect } from "./BloomEffect";

function Scene() {
  const breakdown = useSimulator((s) => s.computed.qubitBreakdown);
  const zones = getZoneConfigs(breakdown);

  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight position={[-6, 5, 0]} intensity={0.5} color="#4fc3f7" />
      <pointLight position={[3, 5, 2]} intensity={0.3} color="#ffa726" />
      <pointLight position={[3, 5, -2]} intensity={0.3} color="#4caf50" />
      <pointLight position={[8, 5, 0]} intensity={0.3} color="#f06292" />

      {zones.map((zone) => (
        <AtomCloud key={zone.name} zone={zone} />
      ))}

      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={3}
        maxDistance={40}
      />
      <BloomEffect />
    </>
  );
}

export function Viewport() {
  return (
    <Canvas
      camera={{ position: [0, 8, 20], fov: 50 }}
      gl={{ antialias: true, alpha: false }}
      style={{ background: "#0a0a1a" }}
    >
      <Scene />
    </Canvas>
  );
}
```

- [ ] **Step 5: Wire Viewport into page.tsx**

Replace the right pane placeholder in `viewer/src/app/page.tsx`:

```tsx
"use client";

import dynamic from "next/dynamic";
import { Header } from "@/components/Layout/Header";
import { StatusBar } from "@/components/Layout/StatusBar";

const Viewport = dynamic(
  () => import("@/components/Scene/Viewport").then((m) => ({ default: m.Viewport })),
  { ssr: false },
);

export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-[#111827]">
      <Header />
      <div className="flex flex-1 min-h-0">
        {/* Left Pane */}
        <div className="w-[40%] overflow-y-auto border-r border-white/10 p-6">
          <p className="text-[#94a3b8] font-mono text-sm">
            Paper sections will render here...
          </p>
        </div>
        {/* Right Pane — 3D Viewport */}
        <div className="w-[60%] relative">
          <Viewport />
        </div>
      </div>
      <StatusBar />
    </div>
  );
}
```

- [ ] **Step 6: Verify 3D scene renders**

```bash
cd /Users/shiva/repos/reading-papers/oratomic-10k/viewer
npm run dev
```

Expected: Glowing atom clouds in 4 zone colors, orbit controls working, bloom active, status bar showing computed values.

- [ ] **Step 7: Commit**

```bash
cd /Users/shiva/repos/reading-papers/oratomic-10k
git add viewer/src/components/Scene/ viewer/src/app/page.tsx
git commit -m "feat: add 3D viewport with InstancedMesh atom clouds and bloom"
```

---

## Task 6: Scroll-Driven Paper Sections

**Files:**
- Create: `viewer/src/components/Paper/PaperSection.tsx`
- Create: `viewer/src/components/Paper/SectionTracker.tsx`
- Modify: `viewer/src/app/page.tsx`

- [ ] **Step 1: Create PaperSection.tsx**

```bash
mkdir -p /Users/shiva/repos/reading-papers/oratomic-10k/viewer/src/components/Paper
```

Write `viewer/src/components/Paper/PaperSection.tsx`:

```tsx
"use client";

interface PaperSectionProps {
  title: string;
  subtitle?: string;
  body: string;
  keyInsight: string;
  equation?: string;
  zones?: Array<{ name: string; role: string; color: string }>;
  isActive: boolean;
}

export function PaperSection({
  title,
  subtitle,
  body,
  keyInsight,
  equation,
  zones,
  isActive,
}: PaperSectionProps) {
  return (
    <div
      className={`min-h-[70vh] py-12 transition-opacity duration-500 ${
        isActive ? "opacity-100" : "opacity-40"
      }`}
    >
      <h2 className="text-xl font-semibold text-[#e2e8f0] mb-1">{title}</h2>
      {subtitle && (
        <p className="text-xs text-[#64748b] mb-6 font-mono">{subtitle}</p>
      )}

      <p className="text-sm text-[#94a3b8] leading-relaxed mb-6">{body}</p>

      {equation && (
        <div className="bg-white/[0.03] border border-white/10 rounded-lg p-4 mb-6 font-mono text-sm text-[#818cf8]">
          {equation}
        </div>
      )}

      {zones && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          {zones.map((z) => (
            <div
              key={z.name}
              className="bg-white/[0.03] border border-white/10 rounded-lg p-3"
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: z.color }}
                />
                <span className="text-xs font-mono font-semibold text-[#e2e8f0]">
                  {z.name}
                </span>
              </div>
              <p className="text-xs text-[#64748b]">{z.role}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-start gap-2 bg-[#818cf8]/5 border border-[#818cf8]/20 rounded-lg p-3">
        <span className="text-[#818cf8] text-xs mt-0.5">*</span>
        <p className="text-xs text-[#818cf8]/80">{keyInsight}</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create SectionTracker.tsx**

Write `viewer/src/components/Paper/SectionTracker.tsx`:

```tsx
"use client";

import { useEffect, useRef, useCallback } from "react";
import { useSimulator } from "@/store/simulator";

interface SectionTrackerProps {
  sectionIndex: number;
  children: React.ReactNode;
}

export function SectionTracker({ sectionIndex, children }: SectionTrackerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const setActiveSection = useSimulator((s) => s.setActiveSection);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(sectionIndex);
        }
      });
    },
    [sectionIndex, setActiveSection],
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin: "-40% 0px -40% 0px",
      threshold: 0,
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [handleIntersection]);

  return <div ref={ref}>{children}</div>;
}
```

- [ ] **Step 3: Wire sections into page.tsx**

Replace `viewer/src/app/page.tsx` with:

```tsx
"use client";

import dynamic from "next/dynamic";
import { Header } from "@/components/Layout/Header";
import { StatusBar } from "@/components/Layout/StatusBar";
import { PaperSection } from "@/components/Paper/PaperSection";
import { SectionTracker } from "@/components/Paper/SectionTracker";
import { useSimulator } from "@/store/simulator";
import paperData from "../../public/data/paper-sections.json";

const Viewport = dynamic(
  () => import("@/components/Scene/Viewport").then((m) => ({ default: m.Viewport })),
  { ssr: false },
);

function LeftPane() {
  const mode = useSimulator((s) => s.mode);
  const activeSection = useSimulator((s) => s.activeSection);

  if (mode === "simulate") {
    return (
      <div className="p-6">
        <p className="text-[#94a3b8] font-mono text-sm">
          Simulator controls will render here...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {paperData.sections.map((section, i) => (
        <SectionTracker key={section.id} sectionIndex={i}>
          <PaperSection
            title={section.title}
            subtitle={"subtitle" in section ? section.subtitle : undefined}
            body={section.body}
            keyInsight={section.keyInsight}
            equation={"equation" in section ? section.equation : undefined}
            zones={"zones" in section ? section.zones : undefined}
            isActive={activeSection === i}
          />
        </SectionTracker>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-[#111827]">
      <Header />
      <div className="flex flex-1 min-h-0">
        <div className="w-[40%] overflow-y-auto border-r border-white/10">
          <LeftPane />
        </div>
        <div className="w-[60%] relative">
          <Viewport />
        </div>
      </div>
      <StatusBar />
    </div>
  );
}
```

- [ ] **Step 4: Verify scroll tracking works**

```bash
cd /Users/shiva/repos/reading-papers/oratomic-10k/viewer
npm run dev
```

Expected: Scrolling through paper sections highlights active section (opacity change), status bar stays fixed.

- [ ] **Step 5: Commit**

```bash
cd /Users/shiva/repos/reading-papers/oratomic-10k
git add viewer/src/components/Paper/ viewer/src/app/page.tsx
git commit -m "feat: add scroll-driven paper sections with IntersectionObserver tracking"
```

---

## Task 7: Camera Rig — Scroll-Driven Scene Transitions

**Files:**
- Create: `viewer/src/components/Scene/CameraRig.tsx`
- Modify: `viewer/src/components/Scene/Viewport.tsx`

- [ ] **Step 1: Create CameraRig.tsx**

Write `viewer/src/components/Scene/CameraRig.tsx`:

```tsx
"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useSimulator } from "@/store/simulator";
import { CAMERA_PRESETS, SECTION_IDS } from "@/lib/constants";

const lerpVec = new THREE.Vector3();
const lerpTarget = new THREE.Vector3();

export function CameraRig() {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 8, 20));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const activeSection = useSimulator((s) => s.activeSection);
  const mode = useSimulator((s) => s.mode);

  useFrame(() => {
    if (mode === "simulate") return;

    const sectionId = SECTION_IDS[activeSection] || "hero";
    const preset = CAMERA_PRESETS[sectionId];

    targetPos.current.set(...preset.position);
    targetLookAt.current.set(...preset.target);

    lerpVec.copy(camera.position).lerp(targetPos.current, 0.03);
    camera.position.copy(lerpVec);

    lerpTarget
      .set(0, 0, -1)
      .applyQuaternion(camera.quaternion)
      .add(camera.position)
      .lerp(targetLookAt.current, 0.03);
    camera.lookAt(lerpTarget);
  });

  return null;
}
```

- [ ] **Step 2: Add CameraRig to Viewport**

Replace `viewer/src/components/Scene/Viewport.tsx` with:

```tsx
"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useSimulator } from "@/store/simulator";
import { AtomCloud } from "./AtomCloud";
import { getZoneConfigs } from "./ZoneLayout";
import { BloomEffect } from "./BloomEffect";
import { CameraRig } from "./CameraRig";

function Scene() {
  const breakdown = useSimulator((s) => s.computed.qubitBreakdown);
  const mode = useSimulator((s) => s.mode);
  const zones = getZoneConfigs(breakdown);

  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight position={[-6, 5, 0]} intensity={0.5} color="#4fc3f7" />
      <pointLight position={[3, 5, 2]} intensity={0.3} color="#ffa726" />
      <pointLight position={[3, 5, -2]} intensity={0.3} color="#4caf50" />
      <pointLight position={[8, 5, 0]} intensity={0.3} color="#f06292" />

      {zones.map((zone) => (
        <AtomCloud key={zone.name} zone={zone} />
      ))}

      <CameraRig />
      {mode === "simulate" && (
        <OrbitControls enableDamping dampingFactor={0.05} minDistance={3} maxDistance={40} />
      )}
      <BloomEffect />
    </>
  );
}

export function Viewport() {
  return (
    <Canvas
      camera={{ position: [0, 8, 20], fov: 50 }}
      gl={{ antialias: true, alpha: false }}
      style={{ background: "#0a0a1a" }}
    >
      <Scene />
    </Canvas>
  );
}
```

- [ ] **Step 3: Verify camera follows scroll**

```bash
cd /Users/shiva/repos/reading-papers/oratomic-10k/viewer
npm run dev
```

Expected: Scrolling paper sections smoothly lerps camera to zoom into different zones. Switching to Simulate mode enables free orbit.

- [ ] **Step 4: Commit**

```bash
cd /Users/shiva/repos/reading-papers/oratomic-10k
git add viewer/src/components/Scene/CameraRig.tsx viewer/src/components/Scene/Viewport.tsx
git commit -m "feat: add scroll-driven camera rig with smooth lerp transitions"
```

---

## Task 8: Simulator Control Panel

**Files:**
- Create: `viewer/src/components/Simulator/Knob.tsx`
- Create: `viewer/src/components/Simulator/ControlPanel.tsx`
- Modify: `viewer/src/app/page.tsx`

- [ ] **Step 1: Create Knob.tsx**

```bash
mkdir -p /Users/shiva/repos/reading-papers/oratomic-10k/viewer/src/components/Simulator
```

Write `viewer/src/components/Simulator/Knob.tsx`:

```tsx
"use client";

interface SliderKnobProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  logarithmic?: boolean;
  onChange: (v: number) => void;
  formatValue?: (v: number) => string;
}

export function SliderKnob({
  label,
  value,
  min,
  max,
  step,
  unit,
  logarithmic,
  onChange,
  formatValue,
}: SliderKnobProps) {
  const displayValue = formatValue ? formatValue(value) : value.toString();

  const sliderValue = logarithmic ? Math.log10(value) : value;
  const sliderMin = logarithmic ? Math.log10(min) : min;
  const sliderMax = logarithmic ? Math.log10(max) : max;
  const sliderStep = logarithmic ? 0.01 : step;

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-mono text-[#94a3b8]">{label}</span>
        <span className="text-xs font-mono text-[#e2e8f0]">
          {displayValue}
          {unit && <span className="text-[#64748b] ml-1">{unit}</span>}
        </span>
      </div>
      <input
        type="range"
        min={sliderMin}
        max={sliderMax}
        step={sliderStep}
        value={sliderValue}
        onChange={(e) => {
          const raw = parseFloat(e.target.value);
          onChange(logarithmic ? Math.pow(10, raw) : raw);
        }}
        className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3
          [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-[#818cf8]"
      />
    </div>
  );
}

interface ToggleKnobProps<T extends string> {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}

export function ToggleKnob<T extends string>({
  label,
  value,
  options,
  onChange,
}: ToggleKnobProps<T>) {
  return (
    <div className="mb-4">
      <span className="text-xs font-mono text-[#94a3b8] block mb-2">{label}</span>
      <div className="flex gap-1 bg-white/5 rounded-lg p-0.5">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex-1 px-2 py-1.5 text-xs rounded-md transition-colors ${
              value === opt.value
                ? "bg-[#818cf8]/20 text-[#818cf8]"
                : "text-[#64748b] hover:text-[#94a3b8]"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create ControlPanel.tsx**

Write `viewer/src/components/Simulator/ControlPanel.tsx`:

```tsx
"use client";

import { useSimulator } from "@/store/simulator";
import { SliderKnob, ToggleKnob } from "./Knob";
import type { ArchitectureType, MemoryCode, ProcessorCode, TargetProblem } from "@/compute/interface";

export function ControlPanel() {
  const {
    physicalErrorRate,
    cycleTime,
    architectureType,
    targetProblem,
    memoryCode,
    processorCode,
    decoderType,
    setPhysicalErrorRate,
    setCycleTime,
    setArchitectureType,
    setTargetProblem,
    setMemoryCode,
    setProcessorCode,
  } = useSimulator();

  return (
    <div className="p-6 space-y-6">
      {/* Tier 1 — Lab Knobs */}
      <div>
        <h3 className="text-xs font-mono text-[#64748b] uppercase tracking-wider mb-4">
          Physical Parameters
        </h3>

        <SliderKnob
          label="Physical Error Rate (p)"
          value={physicalErrorRate}
          min={0.0001}
          max={0.01}
          step={0.0001}
          logarithmic
          formatValue={(v) => `${(v * 100).toFixed(2)}%`}
          onChange={setPhysicalErrorRate}
        />

        <SliderKnob
          label="Cycle Time"
          value={cycleTime}
          min={0.001}
          max={10}
          step={0.001}
          unit="ms"
          logarithmic
          formatValue={(v) => v >= 1 ? `${v.toFixed(1)}` : `${(v * 1000).toFixed(0)} us`}
          onChange={setCycleTime}
        />

        <ToggleKnob<TargetProblem>
          label="Target Problem"
          value={targetProblem}
          options={[
            { value: "ecc-256", label: "ECC-256" },
            { value: "rsa-2048", label: "RSA-2048" },
          ]}
          onChange={setTargetProblem}
        />

        <ToggleKnob<ArchitectureType>
          label="Architecture"
          value={architectureType}
          options={[
            { value: "space-efficient", label: "Space" },
            { value: "balanced", label: "Balanced" },
            { value: "time-efficient", label: "Time" },
          ]}
          onChange={setArchitectureType}
        />
      </div>

      {/* Tier 2 — Code & Decoder */}
      <div>
        <h3 className="text-xs font-mono text-[#64748b] uppercase tracking-wider mb-4">
          Code Architecture
        </h3>

        <ToggleKnob<MemoryCode>
          label="Memory Code"
          value={memoryCode}
          options={[
            { value: "lp16", label: "lp₁₆" },
            { value: "lp20", label: "lp₂₀" },
            { value: "lp24", label: "lp₂₄" },
          ]}
          onChange={setMemoryCode}
        />

        <ToggleKnob<ProcessorCode>
          label="Processor Code"
          value={processorCode}
          options={[
            { value: "bb18", label: "bb₁₈" },
            { value: "lp-proc", label: "lp₂₀ proc" },
          ]}
          onChange={setProcessorCode}
        />

        <div className="mb-4">
          <span className="text-xs font-mono text-[#94a3b8] block mb-2">Decoder</span>
          <div className="bg-white/[0.03] border border-white/10 rounded-lg p-3">
            <span className="text-xs font-mono text-[#818cf8]">{decoderType}</span>
            <span className="text-xs text-[#64748b] ml-2">(extensible slot)</span>
          </div>
        </div>
      </div>

      {/* Tier 3 — Timing Waterfall */}
      <div>
        <h3 className="text-xs font-mono text-[#64748b] uppercase tracking-wider mb-4">
          Timing Breakdown
        </h3>
        <TimingWaterfall />
      </div>
    </div>
  );
}

function TimingWaterfall() {
  const waterfall = useSimulator((s) => s.computed.timingWaterfall);
  const cycleTime = useSimulator((s) => s.cycleTime);
  const total = cycleTime;

  const segments = [
    { label: "Readout", value: waterfall.readout, color: "#4fc3f7" },
    { label: "Transport", value: waterfall.transport, color: "#ffa726" },
    { label: "Gates", value: waterfall.gates, color: "#4caf50" },
    { label: "Decode", value: waterfall.decode, color: "#f06292" },
  ];

  return (
    <div>
      <div className="flex h-4 rounded-full overflow-hidden mb-2">
        {segments.map((seg) => (
          <div
            key={seg.label}
            style={{
              width: `${(seg.value / total) * 100}%`,
              backgroundColor: seg.color,
              opacity: 0.6,
            }}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: seg.color }} />
            <span className="text-xs font-mono text-[#64748b]">
              {seg.label}: {(seg.value * 1000).toFixed(0)} us
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Wire ControlPanel into page.tsx**

Update the LeftPane function in `viewer/src/app/page.tsx`:

```tsx
"use client";

import dynamic from "next/dynamic";
import { Header } from "@/components/Layout/Header";
import { StatusBar } from "@/components/Layout/StatusBar";
import { PaperSection } from "@/components/Paper/PaperSection";
import { SectionTracker } from "@/components/Paper/SectionTracker";
import { ControlPanel } from "@/components/Simulator/ControlPanel";
import { useSimulator } from "@/store/simulator";
import paperData from "../../public/data/paper-sections.json";

const Viewport = dynamic(
  () => import("@/components/Scene/Viewport").then((m) => ({ default: m.Viewport })),
  { ssr: false },
);

function LeftPane() {
  const mode = useSimulator((s) => s.mode);
  const activeSection = useSimulator((s) => s.activeSection);

  if (mode === "simulate") {
    return <ControlPanel />;
  }

  return (
    <div className="p-6">
      {paperData.sections.map((section, i) => (
        <SectionTracker key={section.id} sectionIndex={i}>
          <PaperSection
            title={section.title}
            subtitle={"subtitle" in section ? section.subtitle : undefined}
            body={section.body}
            keyInsight={section.keyInsight}
            equation={"equation" in section ? section.equation : undefined}
            zones={"zones" in section ? section.zones : undefined}
            isActive={activeSection === i}
          />
        </SectionTracker>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-[#111827]">
      <Header />
      <div className="flex flex-1 min-h-0">
        <div className="w-[40%] overflow-y-auto border-r border-white/10">
          <LeftPane />
        </div>
        <div className="w-[60%] relative">
          <Viewport />
        </div>
      </div>
      <StatusBar />
    </div>
  );
}
```

- [ ] **Step 4: Verify simulator controls work**

```bash
cd /Users/shiva/repos/reading-papers/oratomic-10k/viewer
npm run dev
```

Expected: Clicking "Simulate" shows control panel. Adjusting sliders updates status bar values in real time. Switching architecture type changes qubit counts. 3D scene allows free orbit in Simulate mode.

- [ ] **Step 5: Commit**

```bash
cd /Users/shiva/repos/reading-papers/oratomic-10k
git add viewer/src/components/Simulator/ viewer/src/app/page.tsx
git commit -m "feat: add simulator control panel with lab-style knobs and timing waterfall"
```

---

## Task 9: Zone Labels in 3D Scene

**Files:**
- Modify: `viewer/src/components/Scene/Viewport.tsx`

- [ ] **Step 1: Add Html labels from drei**

Replace `viewer/src/components/Scene/Viewport.tsx` with:

```tsx
"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { useSimulator } from "@/store/simulator";
import { AtomCloud } from "./AtomCloud";
import { getZoneConfigs } from "./ZoneLayout";
import { BloomEffect } from "./BloomEffect";
import { CameraRig } from "./CameraRig";

function ZoneLabel({ name, color, center, count }: { name: string; color: string; center: [number, number, number]; count: number }) {
  return (
    <Html position={[center[0], center[1] + 3, center[2]]} center>
      <div className="pointer-events-none select-none text-center">
        <div className="text-xs font-mono font-semibold tracking-wider uppercase" style={{ color }}>
          {name}
        </div>
        <div className="text-[10px] font-mono text-[#64748b]">
          {count.toLocaleString()} qubits
        </div>
      </div>
    </Html>
  );
}

function Scene() {
  const breakdown = useSimulator((s) => s.computed.qubitBreakdown);
  const mode = useSimulator((s) => s.mode);
  const activeSection = useSimulator((s) => s.activeSection);
  const zones = getZoneConfigs(breakdown);
  const showLabels = activeSection >= 1 || mode === "simulate";

  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight position={[-6, 5, 0]} intensity={0.5} color="#4fc3f7" />
      <pointLight position={[3, 5, 2]} intensity={0.3} color="#ffa726" />
      <pointLight position={[3, 5, -2]} intensity={0.3} color="#4caf50" />
      <pointLight position={[8, 5, 0]} intensity={0.3} color="#f06292" />

      {zones.map((zone) => (
        <AtomCloud key={zone.name} zone={zone} />
      ))}

      {showLabels &&
        zones.map((zone) => (
          <ZoneLabel
            key={`label-${zone.name}`}
            name={zone.name}
            color={zone.color}
            center={zone.center}
            count={
              zone.name === "memory"
                ? breakdown.memory
                : zone.name === "processor"
                  ? breakdown.processor
                  : zone.name === "operation"
                    ? breakdown.operation
                    : breakdown.resource
            }
          />
        ))}

      <CameraRig />
      {mode === "simulate" && (
        <OrbitControls enableDamping dampingFactor={0.05} minDistance={3} maxDistance={40} />
      )}
      <BloomEffect />
    </>
  );
}

export function Viewport() {
  return (
    <Canvas
      camera={{ position: [0, 8, 20], fov: 50 }}
      gl={{ antialias: true, alpha: false }}
      style={{ background: "#0a0a1a" }}
    >
      <Scene />
    </Canvas>
  );
}
```

- [ ] **Step 2: Verify labels appear**

```bash
cd /Users/shiva/repos/reading-papers/oratomic-10k/viewer
npm run dev
```

Expected: Zone labels with name and qubit count float above each atom cloud. Labels appear after scrolling past hero section.

- [ ] **Step 3: Commit**

```bash
cd /Users/shiva/repos/reading-papers/oratomic-10k
git add viewer/src/components/Scene/Viewport.tsx
git commit -m "feat: add floating zone labels with qubit counts"
```

---

## Task 10: Seed Matrix Visualization in Codes Section

**Files:**
- Create: `viewer/src/components/Paper/SeedMatrixDisplay.tsx`
- Modify: `viewer/src/components/Paper/PaperSection.tsx`

- [ ] **Step 1: Create SeedMatrixDisplay.tsx**

Write `viewer/src/components/Paper/SeedMatrixDisplay.tsx`:

```tsx
"use client";

import { useSimulator } from "@/store/simulator";

const SEED_MATRICES: Record<string, { ringOrder: number; rows: number; cols: number; entries: number[][] }> = {
  lp16: {
    ringOrder: 45, rows: 3, cols: 7,
    entries: [
      [29, 21, 31, 15, 37, 25, 27],
      [13, 25, 19, 26, 11, 18, 29],
      [31, 2, 27, 32, 41, 41, 18],
    ],
  },
  lp20: {
    ringOrder: 75, rows: 3, cols: 7,
    entries: [
      [0, 71, 73, 68, 33, 50, 47],
      [38, 39, 60, 26, 18, 1, 23],
      [73, 6, 5, 42, 20, 22, 73],
    ],
  },
  lp24: {
    ringOrder: 91, rows: 3, cols: 7,
    entries: [
      [57, 75, 42, 80, 7, 67, 27],
      [57, 73, 34, 12, 27, 50, 87],
      [21, 53, 70, 18, 1, 3, 18],
    ],
  },
};

const CODE_PARAMS: Record<string, { n: number; k: number; d: number; rate: string }> = {
  lp16: { n: 2610, k: 744, d: 16, rate: "28.5%" },
  lp20: { n: 4350, k: 1224, d: 20, rate: "28.1%" },
  lp24: { n: 5278, k: 1480, d: 24, rate: "28.0%" },
};

export function SeedMatrixDisplay() {
  const memoryCode = useSimulator((s) => s.memoryCode);
  const matrix = SEED_MATRICES[memoryCode];
  const params = CODE_PARAMS[memoryCode];

  if (!matrix || !params) return null;

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-lg p-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono text-[#818cf8]">
          Seed Matrix A — F₂[x]/(x^{matrix.ringOrder}+1)
        </span>
        <span className="text-xs font-mono text-[#64748b]">
          [[{params.n}, {params.k}, ≤{params.d}]]
        </span>
      </div>
      <div className="font-mono text-xs overflow-x-auto">
        <table className="border-collapse">
          <tbody>
            {matrix.entries.map((row, i) => (
              <tr key={i}>
                {i === 0 && (
                  <td rowSpan={matrix.rows} className="text-[#64748b] pr-2 align-middle text-lg">
                    (
                  </td>
                )}
                {row.map((val, j) => (
                  <td key={j} className="px-1.5 py-0.5 text-center text-[#e2e8f0]">
                    x<sup className="text-[#818cf8]">{val}</sup>
                  </td>
                ))}
                {i === 0 && (
                  <td rowSpan={matrix.rows} className="text-[#64748b] pl-2 align-middle text-lg">
                    )
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-4 mt-3 text-xs font-mono text-[#64748b]">
        <span>n = {params.n}</span>
        <span>k = {params.k}</span>
        <span>d ≤ {params.d}</span>
        <span>rate = {params.rate}</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Import SeedMatrixDisplay into PaperSection for codes section**

This is rendered conditionally in the page. Add to the codes section in `page.tsx` by modifying the LeftPane in `viewer/src/app/page.tsx`. After the PaperSection for `section.id === "codes"`, render the SeedMatrixDisplay:

Replace the `LeftPane` function's paper mode return:

```tsx
import { SeedMatrixDisplay } from "@/components/Paper/SeedMatrixDisplay";

// Inside the map:
{paperData.sections.map((section, i) => (
  <SectionTracker key={section.id} sectionIndex={i}>
    <PaperSection
      title={section.title}
      subtitle={"subtitle" in section ? section.subtitle : undefined}
      body={section.body}
      keyInsight={section.keyInsight}
      equation={"equation" in section ? section.equation : undefined}
      zones={"zones" in section ? section.zones : undefined}
      isActive={activeSection === i}
    />
    {section.id === "codes" && activeSection === i && <SeedMatrixDisplay />}
  </SectionTracker>
))}
```

- [ ] **Step 3: Verify seed matrix renders**

```bash
cd /Users/shiva/repos/reading-papers/oratomic-10k/viewer
npm run dev
```

Expected: Scrolling to "Codes" section shows seed matrix with polynomial exponents for the active memory code.

- [ ] **Step 4: Commit**

```bash
cd /Users/shiva/repos/reading-papers/oratomic-10k
git add viewer/src/components/Paper/SeedMatrixDisplay.tsx viewer/src/app/page.tsx
git commit -m "feat: add interactive seed matrix display for LP codes section"
```

---

## Task 11: Atmospheric Effects — Tweezer Beams

**Files:**
- Create: `viewer/src/components/Scene/TweezerBeams.tsx`
- Modify: `viewer/src/components/Scene/Viewport.tsx`

- [ ] **Step 1: Create TweezerBeams.tsx**

Write `viewer/src/components/Scene/TweezerBeams.tsx`:

```tsx
"use client";

import { useMemo } from "react";
import * as THREE from "three";

interface TweezerBeamsProps {
  center: [number, number, number];
  color: string;
  count: number;
  spread: number;
}

export function TweezerBeams({ center, color, count, spread }: TweezerBeamsProps) {
  const beamPositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    const cols = Math.ceil(Math.sqrt(count));
    const spacing = spread / cols;
    for (let i = 0; i < Math.min(count, 25); i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      positions.push([
        center[0] + (col - cols / 2) * spacing,
        center[1],
        center[2] + (row - cols / 2) * spacing,
      ]);
    }
    return positions;
  }, [center, count, spread]);

  const beamColor = useMemo(() => new THREE.Color(color), [color]);

  return (
    <group>
      {beamPositions.map((pos, i) => (
        <mesh key={i} position={[pos[0], pos[1] + 2.5, pos[2]]}>
          <cylinderGeometry args={[0.01, 0.15, 5, 8, 1, true]} />
          <meshBasicMaterial
            color={beamColor}
            transparent
            opacity={0.06}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}
```

- [ ] **Step 2: Add TweezerBeams to Scene in Viewport.tsx**

Add after the AtomCloud map in the Scene component:

```tsx
import { TweezerBeams } from "./TweezerBeams";

// Inside Scene, after the AtomCloud map:
{zones.map((zone) => (
  <TweezerBeams
    key={`beam-${zone.name}`}
    center={zone.center}
    color={zone.color}
    count={20}
    spread={zone.gridSize[0] * zone.spacing}
  />
))}
```

- [ ] **Step 3: Verify beams render**

```bash
cd /Users/shiva/repos/reading-papers/oratomic-10k/viewer
npm run dev
```

Expected: Subtle translucent light cone beams above each zone, colored to match zones.

- [ ] **Step 4: Commit**

```bash
cd /Users/shiva/repos/reading-papers/oratomic-10k
git add viewer/src/components/Scene/TweezerBeams.tsx viewer/src/components/Scene/Viewport.tsx
git commit -m "feat: add atmospheric tweezer beam effects per zone"
```

---

## Task 12: Slow Auto-Rotation for Hero Section

**Files:**
- Modify: `viewer/src/components/Scene/CameraRig.tsx`

- [ ] **Step 1: Add auto-rotation when on hero section**

Replace `viewer/src/components/Scene/CameraRig.tsx` with:

```tsx
"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useSimulator } from "@/store/simulator";
import { CAMERA_PRESETS, SECTION_IDS } from "@/lib/constants";

const lerpVec = new THREE.Vector3();
const lerpTarget = new THREE.Vector3();

export function CameraRig() {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 8, 20));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const angle = useRef(0);
  const activeSection = useSimulator((s) => s.activeSection);
  const mode = useSimulator((s) => s.mode);

  useFrame((_, delta) => {
    if (mode === "simulate") return;

    const sectionId = SECTION_IDS[activeSection] || "hero";
    const preset = CAMERA_PRESETS[sectionId];

    if (sectionId === "hero") {
      angle.current += delta * 0.15;
      const radius = 22;
      const y = 8;
      targetPos.current.set(
        Math.sin(angle.current) * radius,
        y,
        Math.cos(angle.current) * radius,
      );
      targetLookAt.current.set(0, 0, 0);
    } else {
      targetPos.current.set(...preset.position);
      targetLookAt.current.set(...preset.target);
    }

    lerpVec.copy(camera.position).lerp(targetPos.current, 0.03);
    camera.position.copy(lerpVec);

    lerpTarget
      .set(0, 0, -1)
      .applyQuaternion(camera.quaternion)
      .add(camera.position)
      .lerp(targetLookAt.current, 0.03);
    camera.lookAt(lerpTarget);
  });

  return null;
}
```

- [ ] **Step 2: Verify auto-rotation**

```bash
cd /Users/shiva/repos/reading-papers/oratomic-10k/viewer
npm run dev
```

Expected: On hero section, camera slowly orbits the architecture. Scrolling to other sections stops rotation and transitions to preset.

- [ ] **Step 3: Commit**

```bash
cd /Users/shiva/repos/reading-papers/oratomic-10k
git add viewer/src/components/Scene/CameraRig.tsx
git commit -m "feat: add slow auto-rotation for hero section cinematic"
```

---

## Task 13: Build & Verify Static Export

**Files:**
- Modify: `viewer/next.config.js` (or `next.config.ts`)

- [ ] **Step 1: Configure static export**

Check which config file exists and update it for static export:

```typescript
// next.config.ts or next.config.js
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
```

- [ ] **Step 2: Build static export**

```bash
cd /Users/shiva/repos/reading-papers/oratomic-10k/viewer
npm run build
```

Expected: Build succeeds, static files in `out/` directory.

- [ ] **Step 3: Test static export locally**

```bash
cd /Users/shiva/repos/reading-papers/oratomic-10k/viewer
npx serve out
```

Expected: App loads from static files, all functionality works (scroll, 3D, controls, mode toggle).

- [ ] **Step 4: Commit**

```bash
cd /Users/shiva/repos/reading-papers/oratomic-10k
git add viewer/next.config.ts
git commit -m "feat: configure static export for GitHub Pages deployment"
```
