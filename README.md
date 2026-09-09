# Oratomic 10k

Interactive 3D viewer and architecture simulator for fault-tolerant quantum computation with 10,000 reconfigurable atomic qubits.

**[Open the interactive visualization](https://stannum13.github.io/oratomic-10k/)**

Change physical error rate, cycle time, code choice, and architecture to see qubit allocation, logical error, runtime, feasibility, and the 3D system update live. The methodology panel distinguishes paper-derived quantities, fitted projections, model assumptions, and illustrative cross-platform estimates.

<!-- ![Screenshot](viewer/screenshot.png) -->

## Quick Start

```bash
cd viewer
npm install
npm run dev
# Open http://localhost:3000
```

## Features

- Scroll-synced paper reading with 3D atom cloud visualization
- Real-time architecture simulator with lab-realistic parameter controls
- Four-zone layout: Memory, Processor, Operation, Resource
- LP/BB code construction with live Tanner graph rendering
- Parameter sweep and sensitivity analysis
- Side-by-side configuration comparison with delta indicators
- Shareable URLs encoding full simulator state
- Cross-platform browser-native simulation with no local backend required
- Export simulation results as JSON or CSV

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **3D**: Three.js via React Three Fiber + Drei
- **State**: Zustand
- **Styling**: Tailwind CSS v4 + CSS custom properties
- **Math**: KaTeX for equation rendering
- **Language**: TypeScript (strict)

## Project Structure

```
viewer/                   # Interactive Next.js + Three.js app
  src/
    app/                  # Next.js app router pages + global styles
    components/           # UI components (Scene, Simulator, Paper, Layout)
    compute/              # Engine, code construction, and decoders
    store/                # Zustand state management
    lib/                  # Constants, lookup tables, formatting utilities
  public/data/            # Paper sections, example configs
```

## Paper

Based on: *"Shor's algorithm is possible with as few as 10,000 reconfigurable atomic qubits"*
by Cain, Xu, King, et al. (Oratomic / Caltech, 2026).

Source: [arXiv:2603.28627](https://arxiv.org/abs/2603.28627). This repository is an independent interactive implementation by Shivank and is not affiliated with IonQ, Oratomic, or Caltech.

## License

MIT
