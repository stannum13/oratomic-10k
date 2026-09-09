# QPU, PHY, Noise, and Methods Explainer Design

**Date:** 2026-09-09
**Status:** Approved for autonomous implementation

## Purpose

Make the QPU and its surrounding mixed-signal control system the hero of the Oratomic interactive. A visitor should be able to connect the spatial quantum architecture to the physical sensing, analog signal chain, digital processing, error decoding, scheduling, and feedback hardware that make computation possible.

The experience must welcome curious technical readers while remaining explicit enough for quantum-computing specialists to audit its assumptions and sources.

## Core story

The public hook is:

> What can a 10,000-qubit quantum computer actually do?

The supporting explanation is:

> Give it ECC-256 or RSA-2048, tune its error rate, cycle time, codes, and architecture, then watch the estimated qubit allocation, feasibility, and runtime change.

The visualization answers five questions:

1. What physical components make up this QPU?
2. How does a physical signal become a digital measurement?
3. How are measurements filtered, classified, decoded, and fed back?
4. Where do noise and bottlenecks enter the loop?
5. Which values are sourced, fitted, assumed, or illustrative?

## Recommended presentation

Use two synchronized views rather than placing every concept into the 3D scene.

### QPU architecture view

The existing 3D scene remains the spatial view. It shows the memory, processor, operation, and resource zones and their qubit allocations. A new visual-mode selector adds restrained overlays for:

- Architecture and qubit flow
- Error and noise pathways
- Timing and system bottlenecks

The overlays are diagnostic abstractions, not microscopic simulations. All animated meaning must also be conveyed with labels, line styles, shapes, or text.

### Physical/control stack view

A new HTML/SVG system view presents the closed loop:

```text
environment → physical qubits → sensing/readout → analog front end
→ ADC → filtering/denoising → state classification → syndrome decoder
→ scheduler → DAC/waveform generation → physical actuation → qubits
```

The view is selectable from the scene pane and remains synchronized with the current platform and computed state. It must make these distinctions explicit:

- Signal denoising improves noisy classical measurement data.
- State classification maps a conditioned analog signal to a discrete measurement outcome.
- Syndrome decoding infers likely physical errors from a pattern of measurements.
- Quantum error correction determines the logical correction or frame update.
- Feedback control converts the classical decision into physical control signals.

The view includes a classical-computer correspondence layer. It maps the physical medium and control hardware to a PHY, readout hardware to a receiver, ADC/DAC to the analog/digital boundary, filtering and classification to DSP, and decoding/scheduling to the compute-and-control plane. It explicitly notes that a qubit is not a classical bit and that measurement does not copy an unknown quantum state.

## Platform switching

The selected platform changes the entire explanatory profile rather than only numerical defaults.

### Oratomic neutral atom

- Physical medium: individually trapped atoms in a vacuum chamber
- Control: optical tweezers, acousto-optic deflection, Rydberg gate lasers
- Readout: fluorescence collection and imaging
- Relevant noise: atom loss, gate infidelity, transport error, readout error, dephasing and correlated disturbances
- Likely bottlenecks: readout time, transport, decoder latency, and resource-state throughput
- Spatial topology: reconfigurable memory, processor, operation, and resource zones

### IonQ walking cat

- Physical medium: trapped-ion chains and modules
- Control: RF trap electrodes, laser gates, ion shuttling, and photonic interconnects
- Readout: state-dependent fluorescence
- Relevant noise: gate error, motional-mode error, shuttling error, crosstalk, photon loss, and readout error
- Likely bottlenecks: gate time, chain/module scaling, routing, decoding, and cat-state supply
- Spatial topology: memory/code blocks, gate zones, cat factories, and modular links

### Superconducting surface code

- Physical medium: transmons and tunable couplers in a cryogenic stack
- Control: microwave lines, pulse synthesis, DACs, and cryogenic wiring
- Readout: dispersive resonators, amplifiers, ADCs, and FPGA processing
- Relevant noise: relaxation, dephasing, leakage, crosstalk, control error, and readout error
- Likely bottlenecks: fixed connectivity, cryogenic I/O, calibration, decoder throughput, and code overhead
- Spatial topology: fixed planar nearest-neighbor grid

Platform profiles live in one typed data registry. Unsupported numerical claims must not be invented. Missing values appear as `Not modeled` and an explanatory note.

## Noise and bottleneck communication

Noise and bottlenecks are separate concepts in both visuals and copy.

### Noise classes

- Gate and control error
- Measurement and readout error
- Transport or routing error
- Loss and leakage
- Decoherence: relaxation and dephasing
- Crosstalk and correlated noise
- Environmental disturbance

### Bottleneck classes

- Physical cycle time
- Readout and transduction latency
- Analog/digital processing latency
- Decoder throughput and backlog
- Transport or routing congestion
- Resource-state production
- Physical-qubit capacity and code overhead

The visual encoding uses:

- Amber pulse or ring: stochastic/local error pressure
- Red gap or broken mark: loss, leakage, or failure
- Violet directional trail: transport/routing pressure
- Cyan dashed return path: classical decoding and feedback
- Hatched/congested stage: throughput bottleneck
- Neutral solid connection: normal signal or qubit flow

Every color encoding has a paired shape, line style, icon, or text label. Reduced-motion mode shows static states.

## Explain-this-state summary

The physical/control view includes a concise state summary generated from current simulator values:

- Current platform and workload
- Current feasibility result
- Dominant modeled bottleneck
- Active error/noise assumption
- Current readout, transport, gate, and decoder timing
- One causal sentence explaining why the state changed

Examples:

> Physical error increased, weakening logical protection and reducing the reliable operation budget.

> Readout dominates this cycle, so faster gates alone do not reduce the estimated runtime proportionally.

> This platform has no modeled transport stage; connectivity pressure appears as routing and code overhead instead.

The summary must not claim a causal relationship not represented by the numerical model.

## Definition-first terminology

Unknown terms are interactive buttons with a subtle dotted underline. Activating one opens a keyboard-accessible definition containing:

1. Plain-language definition
2. Why the term matters in the current simulator
3. Direct primary-source or arXiv link

Only the first or most useful occurrence in a region is interactive to avoid visual noise. A central typed glossary registry supplies all copy and source URLs.

Initial terms:

- Physical qubit
- Logical qubit
- Quantum error correction
- qLDPC code
- Surface code
- Block error rate
- Physical error rate
- Cycle time
- Syndrome
- Decoder
- Toffoli gate
- Magic-state/resource-state factory
- ECC-256
- RSA-2048
- ADC and DAC
- Signal denoising
- State classification
- Transduction
- PHY
- Feedback loop

## Methods and provenance

The methodology panel becomes a persistent, explicit contract for the selected state.

Every important control or result exposes:

- Current value
- Allowed range
- Physical interpretation
- Direct downstream outputs
- Equation or numerical rule
- Provenance badge
- Source link when sourced

Provenance badges are:

- **Paper-derived:** directly transcribed from a cited paper
- **Fitted projection:** derived from a fit and potentially extrapolated
- **Model assumption:** adjustable scenario input used by this implementation
- **Illustrative estimate:** useful orientation without an equivalent published benchmark
- **Not modeled:** physically relevant but absent from the current numerical engine

The interface never presents cross-platform scenarios as equivalent benchmarks. Published IonQ or Google results are labeled with their actual workload and scope. The current cross-platform RSA/ECC rows remain illustrative unless directly replaced by matching published values.

## Primary source registry

The initial registry links to:

- Cain et al., Oratomic architecture and Shor resource analysis: `https://arxiv.org/abs/2603.28627`
- Tripier et al., Walking Cat architecture: `https://arxiv.org/abs/2604.19481`
- Häner et al., 256-bit ECDLP on Walking Cat: `https://arxiv.org/abs/2609.05625`
- Google Quantum AI, below-threshold surface-code error correction: `https://arxiv.org/abs/2408.13687`
- Panteleev and Kalachev, asymptotically good quantum LDPC codes: `https://arxiv.org/abs/2111.03654`
- Fowler et al., surface-code review: `https://arxiv.org/abs/1208.0928`
- Shor, factoring and discrete logarithms: `https://arxiv.org/abs/quant-ph/9508027`
- Gidney and Ekerå, RSA-2048 resource estimate: `https://arxiv.org/abs/1905.09749`

Links open in a new tab with safe `rel` attributes. Definitions never depend on the remote source loading.

## Phone experience and performance

- Controls and scene remain separate mobile panes.
- Add a sticky `View QPU result` action after scenario selection or parameter tuning.
- Use touch-specific instructions: `Drag to rotate · Pinch to zoom`.
- Minimum touch target is 44 CSS pixels.
- Pause or unmount the hidden 3D canvas.
- Cap mobile device pixel ratio at 1.5.
- Disable bloom on mobile/reduced-power presentation.
- Condense the mobile status bar to feasibility, qubits, and runtime; advanced metrics remain accessible in the control pane.
- Add safe-area padding for notched devices.
- Reduce and reposition 3D labels on small screens.

## Accessibility

- View and layer selectors use buttons with `aria-pressed` or tabs with correct relationships.
- Terminology popovers use native disclosure where possible and remain keyboard accessible.
- All status changes use restrained live regions.
- No interaction relies on hover.
- No meaning relies on color alone.
- Reduced-motion users receive equivalent static signals.
- SVG stages and connections have accessible text summaries; decorative paths are hidden from assistive technology.

## Testing and release

- Unit-test platform/profile selection and state-summary derivation.
- Unit-test glossary completeness and source URL validity.
- Add public UI contract tests for required views, labels, provenance kinds, and touch guidance.
- Build both `/oratomic` and `/oratomic-10k` static exports.
- Verify portfolio sync and launcher checks.
- Test desktop and mobile layouts, touch targets, view switching, platform switching, terminology disclosure, reduced motion, reset/share, and hidden-canvas behavior.
- Push simulator source to `main`, export to `gh-pages`, synchronize the portfolio `/oratomic/` directory, and push the portfolio `main` branch.

## Out of scope

- Microscopic Hamiltonian or density-matrix noise simulation
- Claiming that all listed physical noise channels affect the current resource equations
- Backend-specific acceleration
- Treating illustrative cross-platform estimates as published performance results
- Replacing the original paper or platform publications as authoritative sources
