# Oratomic 10k

Interactive 3D viewer and architecture simulator for fault-tolerant quantum computation with 10,000 reconfigurable atomic qubits.

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
- MLX GPU backend bridge for accelerated decoding (optional)
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
    compute/              # Engine, code construction, decoders, MLX bridge
    store/                # Zustand state management
    lib/                  # Constants, lookup tables, formatting utilities
  public/data/            # Paper sections, example configs
```

## Paper

Based on: *"Shor's algorithm is possible with as few as 10,000 reconfigurable atomic qubits"*
by Cain, Xu, King, et al. (Oratomic / Caltech, 2025).

## License

MIT
