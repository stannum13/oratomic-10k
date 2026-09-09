# Oratomic 10k Qubit Architecture Viewer

Interactive 3D viewer and simulator for the paper **"Shor's algorithm is possible with as few as 10,000 reconfigurable atomic qubits"** by Cain, Xu, King, Picard, Levine, Endres, Preskill, Huang, Bluvstein (Oratomic / Caltech, 2026).

**Live demo:** [stannum13.github.io/oratomic-10k](https://stannum13.github.io/oratomic-10k/)

For a quick review, open **Simulate**, change the physical error rate or architecture, and watch qubit count, block error, runtime, feasibility, and the 3D allocation update. Open **Methodology & Sources** for the boundary between paper-derived values, fitted projections, model assumptions, and illustrative estimates.

The public viewer is browser-native and does not require a platform-specific local backend, providing the same controls on Windows, Linux, and macOS.

## What This Is

A scroll-driven paper reader that progressively builds into a fully configurable architecture simulator. Designed for researchers exploring fault-tolerant quantum computing with high-rate qLDPC codes on neutral-atom platforms.

**Paper mode** — scroll through 7 sections with synchronized 3D visualizations of the neutral-atom architecture. Each section zooms into a different functional zone (memory, processor, operation, resource) with contextual explanations.

**Simulate mode** — unlock lab-realistic controls to explore the full parameter space: physical error rates, cycle times, architecture types (space-efficient / balanced / time-efficient), code families (LP and BB codes), and target problems (ECC-256, RSA-2048).

## Features

- **10,000+ atom visualization** — InstancedMesh rendering with bloom post-processing and optical tweezer beam effects
- **Reactive compute pipeline** — adjust any parameter and see qubit counts, block error rates, runtimes, and Toffoli budgets update instantly
- **Feasibility checking** — green/red indicator showing whether the configuration can complete Shor's algorithm with 90% success probability
- **Extrapolation warnings** — alerts when physical error rates fall outside the validated simulation range
- **Tanner graph overlay** — visualize qLDPC code connectivity structure over the memory zone
- **Gate arc animations** — animated teleportation arcs between zones during surgery
- **Seed matrix display** — interactive view of the LP code seed matrices from the paper
- **10 preset configurations** — curated scenarios demonstrating key insights (headline 10k result, error cliffs, code tradeoffs, time-efficient parallelism)
- **Code parameter display** — live [[n,k,d]] parameters in the status bar

## Getting Started

```bash
cd viewer
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build for Deployment

```bash
npm run build    # static export to out/
npm run build:pages # static export with the /oratomic-10k base path
npm run build:site  # static export for shivanknigam.com/oratomic/
npx serve out    # test locally
```

Deploy the `out/` directory to GitHub Pages, Vercel, or any static host.

## Architecture

```
viewer/src/
  app/            # Next.js app router (single page)
  components/
    Layout/       # Header (mode toggle), StatusBar (computed outputs)
    Paper/        # PaperSection, SectionTracker, SeedMatrixDisplay
    Simulator/    # ControlPanel, Knob (sliders/toggles)
    Scene/        # R3F 3D components:
                  #   Viewport, AtomCloud, ZoneLayout,
                  #   CameraRig, BloomEffect, Apparatus,
                  #   GateArcs, TannerOverlay
  store/          # Zustand state management
  compute/        # JS compute pipeline with ComputeBackend interface
  engine/         # Symbolic compute engine (expr, architecture, code-family, sensitivity)
  lib/            # Constants, camera presets, shared utilities
```

## Data Sources

All numerical values are extracted from the paper's LaTeX source:
- `public/data/paper-sections.json` — 7 narrative sections
- `public/data/example-configs.json` — 10 curated parameter configurations

## Roadmap

### Done
- Parameter sweep plots with debounced rendering
- Comparison mode (pin and diff configurations)
- Decoder simulation slots (BP-LSD, BP, FNO) with preview badge
- Sensitivity analysis panel
- Platform-neutral public simulator with no local acceleration service required
- Export panel (JSON, CSV, parity check matrices)
- Symbolic compute engine with expression IR

### Future
- WASM module (Rust) for live LP code construction from seed matrices
- Constraint solvers for automated architecture optimization
- Capability-based acceleration providers after cross-platform correctness and parity validation

## Tech Stack

Next.js 16, React 19, TypeScript, React Three Fiber, drei, postprocessing, Zustand, Tailwind CSS

## References

Cain, M., Xu, Q., King, R., et al. "Shor's algorithm is possible with as few as 10,000 reconfigurable atomic qubits." (2026)

[arXiv:2603.28627](https://arxiv.org/abs/2603.28627). Independent interactive implementation by Shivank; not affiliated with IonQ, Oratomic, or Caltech. Cross-platform rows are illustrative scenarios unless explicitly identified as paper-derived.
