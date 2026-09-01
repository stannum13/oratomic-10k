# Oratomic 10k Qubit Architecture Viewer — Design Spec

## Overview

Interactive Next.js + Three.js viewer for the Oratomic paper "Shor's algorithm is possible with as few as 10,000 reconfigurable atomic qubits." Progressive paper reader that builds into a fully configurable architecture simulator. Public GitHub showcase with research-grade interactivity.

## Aesthetic

Hybrid Observatory: dark UI (`#111827` → `#1e293b`), split-pane layout, Tailwind-inspired design system. Paper text on the left, 3D viewport on the right. Mode toggle between "Paper" and "Simulate." Monospace parameter labels, color-coded zones (cyan memory, amber processor, emerald operation, rose resource).

## Layout

```
┌──────────────────────────────────────────────────────┐
│ Header: title + [Paper | Simulate] toggle            │
├────────────────────┬─────────────────────────────────┤
│ Left Pane (40%)    │ Right Pane (60%)                │
│ Scrollable:        │ Sticky R3F Canvas:              │
│ - Paper sections   │ - InstancedMesh atoms           │
│   (Paper mode)     │ - OrbitControls                 │
│ - Simulator knobs  │ - Scene transitions on scroll   │
│   (Simulate mode)  │                                 │
├────────────────────┴─────────────────────────────────┤
│ Status Bar: total qubits │ error rate │ runtime      │
└──────────────────────────────────────────────────────┘
```

## Scroll Sections & 3D Scenes

| # | Section | 3D Scene | Unlocked Controls |
|---|---------|----------|-------------------|
| 1 | Hero (title, abstract) | Slow orbit around full architecture | None |
| 2 | Architecture | Exploded zone view with labels | Architecture type toggle |
| 3 | Codes | Memory zone zoom, code block structure, Tanner graph overlay | Code selector, seed matrix display |
| 4 | Surgery & Logic | Teleportation animation: memory → processor → back | Processor code selector |
| 5 | Magic States | Resource zone zoom, 5 factory blocks, distillation pipeline | Error rate slider |
| 6 | Resource Estimates | Qubit breakdown bars + runtime scatter | Full simulator unlocks |
| 7 | Simulator | Full architecture, real-time parameter response | All controls |

Scroll mechanics: `IntersectionObserver` per section, camera lerps over ~800ms between presets.

## 3D Rendering

### Atoms
- `InstancedMesh` per zone (single geometry, single material, thousands of instances)
- Zone colors: memory `#4fc3f7`, processor `#ffa726`, operation `#4caf50`, resource `#f06292`
- Grid layouts matching paper zone topology, circulant shift structure visible in memory zone
- Atom counts update to match selected architecture (Extended Data Table 3 values)

### Atmospheric effects (additive, layered after base)
- Bloom via `UnrealBloomPass` for glowing atom look
- Point lights at zone centers for depth
- Translucent cylinders for optical tweezer beams
- `CatmullRomCurve3` arcs for entangling gate animations

### Camera
- OrbitControls in right pane
- Per-section camera presets: `{ position, target, fov }`
- Smooth lerp on section transition
- Full free orbit in Simulate mode

### Performance
- Target: 60fps on M1 MacBook
- InstancedMesh handles 10k+ spheres
- Bloom quality configurable

## State Management

Zustand store, single source of truth:

```typescript
interface SimulatorState {
  // Mode
  mode: 'paper' | 'simulate'
  activeSection: number  // 0-6

  // Tier 1 — Lab knobs
  physicalErrorRate: number       // default 0.001
  cycleTime: number               // ms, default 1.0
  architectureType: 'space-efficient' | 'balanced' | 'time-efficient'
  targetProblem: 'ecc-256' | 'rsa-2048'

  // Tier 2 — Code & decoder
  memoryCode: 'lp16' | 'lp20' | 'lp24'
  processorCode: 'bb18' | 'lp-proc'
  decoderType: string             // extensible: 'bp-lsd' default

  // Tier 3 — Derived (computed reactively)
  totalQubits: number
  qubitBreakdown: { memory: number, processor: number, resource: number, operation: number }
  blockErrorRate: number
  toffoliCount: number
  toffoliBudget: number
  runtimeDays: number
  timingWaterfall: { readout: number, transport: number, gates: number, decode: number }
}
```

## Compute Pipeline

Three tiers of computation speed:

### 1. Reactive JS (instant)
Tier 1 slider changes → zone qubit arithmetic → update 3D instance counts + status bar. Pure functions from paper's formulas:
- Qubit counts: Extended Data Table 3 values per architecture
- Runtime: `toffoliCount * τ_Toff * cycleTime`
- Block error rate: power-law extrapolation `a * p^b` with paper's fitted coefficients
- Toffoli budget at 90% success: `log(0.9) / (τ_Toff * log(1 - P_L))`

### 2. WASM module (< 100ms) — v1.1
- LP code construction from seed matrices (polynomial ring arithmetic over F₂)
- Tanner graph generation and edge coloring
- Simplified BP decoder iteration

### 3. Pre-computed tables (lookup)
Baked JSON files extracted from paper:
- Power-law fit coefficients per code (a, b from Figure 2)
- Toffoli counts per algorithm (Figure 3a)
- Surgery ancilla sizes (Extended Data Table 4)
- Seed matrices for all 5 codes

## ComputeBackend Interface

```typescript
interface ComputeBackend {
  constructCode(seedMatrix: number[][], ringOrder: number): CodeBlock
  generateTannerGraph(code: CodeBlock): TannerGraph
  runDecoder(syndrome: Uint8Array, config: DecoderConfig): Correction
  estimateSurgeryDistance(gadget: SurgeryGadget, trials: number): number
}
```

v1: JS lookup tables implement this interface.
v1.1: WASM (Rust via wasm-pack) implements code construction + Tanner graph.
v2: C++ backend via WebSocket for real decoder simulation, tensor network methods, neural/FNO decoder experimentation.

## File Structure

```
oratomic-10k/
├── shor-algorithm-10k-qubits-oratomic/   # existing paper source
├── viewer/                                # new Next.js app
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── public/data/
│   │   ├── paper-sections.json
│   │   ├── code-params.json
│   │   └── resource-tables.json
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/
│   │   │   ├── Layout/          # Header, LeftPane, StatusBar
│   │   │   ├── Paper/           # SectionTracker, PaperSection
│   │   │   ├── Simulator/       # ControlPanel, Knob, TimingWaterfall
│   │   │   └── Scene/           # Viewport, AtomCloud, ZoneLayout,
│   │   │                        # TannerOverlay, TweezerBeams,
│   │   │                        # GateArcs, CameraRig, BloomEffect
│   │   ├── store/simulator.ts
│   │   ├── compute/
│   │   │   ├── interface.ts
│   │   │   ├── js-compute.ts
│   │   │   ├── wasm-bridge.ts
│   │   │   └── lookup-tables.ts
│   │   └── lib/
│   │       ├── tex-parser.ts
│   │       └── constants.ts
│   └── wasm/                    # v1.1
│       ├── src/
│       └── Cargo.toml
```

## Dependencies

- `next`, `react`, `react-dom`, `typescript`
- `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`
- `zustand`
- `tailwindcss`
- `three`
- WASM: Rust via `wasm-pack` (v1.1)

## Versioning

- **v1:** All 7 scroll sections with schematic atoms, bloom effects, all Tier 1/2/3 controls, JS compute with pre-computed paper data. Deployable static export.
- **v1.1:** WASM module for live code construction from seed matrices, Tanner graph rendering.
- **v2:** Decoder simulation slots, neural/FNO decoder interface, C++ backend option, tensor network simulation hooks.

## Data Extraction from Paper

The following values need to be extracted from main.tex into JSON data files:

### code-params.json
- 5 codes: bb18, lp-proc, lp16, lp20, lp24
- Per code: n, k, d, stabilizer weight, encoding rate, seed matrix entries, ring order
- Power-law fit coefficients (a, b) from Figure 2 fits
- Block error rate data points at simulated physical error rates

### resource-tables.json
- Extended Data Table 3: qubit breakdown per zone per architecture (4 configurations)
- τ_Toff values: per architecture per problem (ECC/RSA)
- Toffoli counts: from Figure 3a (RSA-2048, ECC-256)
- Runtime estimates: from Figure 3b/c

### paper-sections.json
- 7 sections of parsed paper text (abstract, architecture, codes, surgery, magic, resources, conclusion)
- Key equations rendered as formatted strings
- Figure captions for context
