# QPU and PHY Explainer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a sourced, platform-switchable QPU and mixed-signal PHY explainer that communicates noise, bottlenecks, denoising, decoding, feedback, methods, and classical-computer correspondences.

**Architecture:** Put platform and glossary facts in typed registries, derive the current causal explanation through pure functions, and render it in an accessible HTML/SVG system view synchronized with the existing simulator store. Keep the Three.js scene focused on spatial qubit allocation while the new system view explains signal and control flow. Reuse the same registries in terminology disclosures and the methods panel so copy and provenance cannot drift.

**Tech Stack:** Next.js 16, React 19, TypeScript, Zustand, Three.js/react-three-fiber, Vitest, CSS, static export.

## Global Constraints

- Diagnostic overlays are abstractions, not microscopic simulations.
- Unsupported numerical claims display `Not modeled`; no values are invented.
- Cross-platform estimates are not presented as equivalent published benchmarks.
- Every color encoding also uses text, shape, pattern, or line style.
- No interaction relies on hover.
- Definitions work without remote sources loading.
- Minimum phone touch target is 44 CSS pixels.
- Hidden mobile canvases do not keep rendering.
- MLX remains absent from the public component graph.

---

### Task 1: Typed platform and source registries

**Files:**
- Create: `viewer/src/lib/qpu-profiles.ts`
- Create: `viewer/src/lib/qpu-glossary.ts`
- Create: `viewer/src/lib/__tests__/qpu-profiles.test.ts`
- Create: `viewer/src/lib/__tests__/qpu-glossary.test.ts`

**Interfaces:**
- Produces: `QPU_PROFILES: Record<string, QpuProfile>`, `getQpuProfile(id: string): QpuProfile`, `QPU_GLOSSARY: Record<GlossaryTerm, GlossaryEntry>`, and `getGlossaryEntry(term: GlossaryTerm): GlossaryEntry`.

- [ ] **Step 1: Write failing platform registry tests**

Test that all keys in `PLATFORM_PRESETS` resolve to a profile with physical medium, control, readout, signal-chain stages, noise classes, bottlenecks, topology, source, and classical correspondence; test that unknown IDs fall back to Oratomic.

- [ ] **Step 2: Run the platform tests and verify RED**

Run: `cd viewer && npm test -- src/lib/__tests__/qpu-profiles.test.ts`

Expected: FAIL because `qpu-profiles.ts` does not exist.

- [ ] **Step 3: Implement the platform registry**

Define exact shared types:

```ts
export type ProvenanceKind = "Paper-derived" | "Fitted projection" | "Model assumption" | "Illustrative estimate" | "Not modeled";
export interface SignalStage { id: string; label: string; layer: "quantum" | "analog" | "digital" | "feedback"; description: string; classicalAnalogy: string; }
export interface DiagnosticItem { label: string; description: string; stageId: string; modeled: boolean; }
export interface QpuProfile { id: string; shortLabel: string; medium: string; control: string; readout: string; topology: string; signalStages: SignalStage[]; noise: DiagnosticItem[]; bottlenecks: DiagnosticItem[]; sourceUrl: string; sourceLabel: string; }
```

Populate Oratomic, Walking Cat, and surface-code profiles with the approved physical/control stacks. Mark only timing channels used by the existing engine as modeled.

- [ ] **Step 4: Run platform tests and verify GREEN**

Run: `cd viewer && npm test -- src/lib/__tests__/qpu-profiles.test.ts`

Expected: PASS.

- [ ] **Step 5: Write failing glossary tests**

Require the approved initial terms, non-empty definition and relevance copy, HTTPS arXiv URLs, and valid provenance.

- [ ] **Step 6: Run glossary tests and verify RED**

Run: `cd viewer && npm test -- src/lib/__tests__/qpu-glossary.test.ts`

Expected: FAIL because `qpu-glossary.ts` does not exist.

- [ ] **Step 7: Implement the glossary registry**

Define:

```ts
export type GlossaryTerm = "physical-qubit" | "logical-qubit" | "qec" | "qldpc" | "surface-code" | "block-error" | "physical-error" | "cycle-time" | "syndrome" | "decoder" | "toffoli" | "resource-factory" | "ecc-256" | "rsa-2048" | "adc-dac" | "denoising" | "classification" | "transduction" | "phy" | "feedback";
export interface GlossaryEntry { label: string; definition: string; relevance: string; sourceLabel: string; sourceUrl: string; provenance: ProvenanceKind; }
```

Use the approved arXiv source registry and plain-language definitions.

- [ ] **Step 8: Run glossary tests and verify GREEN**

Run: `cd viewer && npm test -- src/lib/__tests__/qpu-glossary.test.ts`

Expected: PASS.

---

### Task 2: Pure causal state explanation

**Files:**
- Create: `viewer/src/lib/qpu-state.ts`
- Create: `viewer/src/lib/__tests__/qpu-state.test.ts`

**Interfaces:**
- Consumes: `QpuProfile`, `PLATFORM_PRESETS`, simulator inputs, and `EngineComputeResult`.
- Produces: `deriveQpuState(input: QpuStateInput): QpuStateSummary` with `dominantBottleneck`, `causalExplanation`, `timingStages`, and `activeNoise`.

- [ ] **Step 1: Write failing derivation tests**

Cover Oratomic readout dominance, surface-code no-transport behavior, decoder-backlog dominance, infeasible high-error explanation, and explicit `Not modeled` noise.

- [ ] **Step 2: Verify RED**

Run: `cd viewer && npm test -- src/lib/__tests__/qpu-state.test.ts`

Expected: FAIL because `deriveQpuState` is missing.

- [ ] **Step 3: Implement deterministic derivation**

Compare `readoutTimeUs`, `transportTimeUs`, `gateTimeUs`, and `decoderLatencyUs` to select the largest modeled latency. Use `computed.feasible` and `physicalErrorRate` only for causal statements already represented by the engine. Return listed-but-unmodeled noise separately and never state that it changed computed output.

- [ ] **Step 4: Verify GREEN**

Run: `cd viewer && npm test -- src/lib/__tests__/qpu-state.test.ts`

Expected: PASS.

---

### Task 3: Accessible terminology and system-loop view

**Files:**
- Create: `viewer/src/components/ui/Term.tsx`
- Create: `viewer/src/components/Scene/QpuSystemView.tsx`
- Modify: `viewer/src/app/page.tsx`
- Modify: `viewer/src/app/globals.css`
- Modify: `viewer/src/ui-contract/__tests__/public-experience.test.ts`

**Interfaces:**
- Consumes: glossary entries, `getQpuProfile`, `deriveQpuState`, and current simulator state.
- Produces: `Term({ term, children })`, `QpuSystemView()`, and a scene selector with `QPU architecture` and `PHY + feedback` views.

- [ ] **Step 1: Write failing public-contract tests**

Require `QPU architecture`, `PHY + feedback`, `Signal loop`, `Noise pathways`, `Bottlenecks`, `Classical map`, `Explain this state`, `Diagnostic abstraction`, native `details`, and safe external-link attributes.

- [ ] **Step 2: Verify RED**

Run: `cd viewer && npm test -- src/ui-contract/__tests__/public-experience.test.ts`

Expected: FAIL on missing view and terminology UI.

- [ ] **Step 3: Implement `Term`**

Render a native `details` disclosure with a `summary` term, local definition, relevance, provenance badge, and source link using `target="_blank" rel="noreferrer"`.

- [ ] **Step 4: Implement `QpuSystemView`**

Render platform identity, physical medium/control/readout cards, a semantic ordered signal loop, layer filter buttons, noise and bottleneck annotations, current state summary, and classical correspondences. Use HTML/CSS plus an accessible textual flow; decorative SVG connectors are `aria-hidden="true"`.

- [ ] **Step 5: Integrate synchronized scene views**

Add `sceneView: "qpu" | "system"` and `setSceneView` in `Home`. The selector remains above the right pane. Render `Viewport` only for the QPU view and `QpuSystemView` for the system view. Update mobile labels to `Controls`, `QPU`, and let the in-pane selector reach the system view.

- [ ] **Step 6: Add responsive/accessibility styles**

Provide 44px view/layer targets, high-contrast stage cards, patterned bottleneck/noise marks, scrollable system content, phone single-column layout, safe-area padding, and reduced-motion behavior.

- [ ] **Step 7: Verify GREEN**

Run: `cd viewer && npm test -- src/ui-contract/__tests__/public-experience.test.ts && npx tsc --noEmit`

Expected: PASS.

---

### Task 4: Explicit methods, copy, and phone rendering

**Files:**
- Modify: `viewer/src/components/Simulator/ControlPanel.tsx`
- Modify: `viewer/src/components/Simulator/MethodologyPanel.tsx`
- Modify: `viewer/src/components/Scene/Viewport.tsx`
- Modify: `viewer/src/components/Scene/BloomEffect.tsx`
- Modify: `viewer/src/components/Layout/StatusBar.tsx`
- Modify: `viewer/src/app/page.tsx`
- Modify: `viewer/src/app/globals.css`
- Modify: `viewer/src/ui-contract/__tests__/public-experience.test.ts`

**Interfaces:**
- Consumes: `Term`, methodology registry, media queries, and mobile pane state.
- Produces: curiosity-led copy, method cards per current state, touch instructions, `active`/`mobile` viewport props, and condensed mobile status.

- [ ] **Step 1: Add failing contracts**

Require the approved hook, `Run a scenario`, `Methods for this state`, all five provenance labels, `View QPU result`, touch guidance, mobile DPR cap, and conditional canvas rendering.

- [ ] **Step 2: Verify RED**

Run: `cd viewer && npm test -- src/ui-contract/__tests__/public-experience.test.ts`

Expected: FAIL on missing copy and mobile behavior.

- [ ] **Step 3: Update simulator copy and terminology**

Use the approved hook and subhead, rename guided action copy, place `Term` disclosures at the most useful first occurrences, and add the sticky mobile `View QPU result` action.

- [ ] **Step 4: Expand methods for the current state**

Show paper-derived inputs, fitted error projection and valid range, adjustable assumptions, illustrative cross-platform rows, not-modeled physical effects, equations/rules, downstream outputs, and primary sources.

- [ ] **Step 5: Optimize phone rendering**

Use a media query hook to pass mobile state to `Viewport`; set `dpr={mobile ? [1, 1.5] : [1, 2]}`, set antialias false on mobile, skip bloom on mobile/reduced-motion, unmount the QPU canvas when its mobile pane is hidden, use touch-specific navigation copy, and show only feasibility/qubits/runtime in the mobile status bar.

- [ ] **Step 6: Verify GREEN**

Run: `cd viewer && npm test -- src/ui-contract/__tests__/public-experience.test.ts && npx tsc --noEmit`

Expected: PASS.

---

### Task 5: Portfolio synchronization and production release

**Files:**
- Modify: `.worktrees/shivanknigam.com/index.html`
- Modify: `.worktrees/shivanknigam.com/scripts/check-site.mjs`
- Regenerate: `.worktrees/shivanknigam.com/oratomic/`

**Interfaces:**
- Consumes: the `/oratomic` static export.
- Produces: updated portfolio framing and both live production targets.

- [ ] **Step 1: Write a failing portfolio copy contract**

Require `What can a 10,000-qubit quantum computer actually do?`, `QPU + PHY explainer`, and copy naming the analog-to-digital feedback loop.

- [ ] **Step 2: Verify RED**

Run: `cd .worktrees/shivanknigam.com && node scripts/check-site.mjs`

Expected: FAIL on the new copy requirements.

- [ ] **Step 3: Update portfolio copy**

Describe the simulator as a switchable QPU, PHY, noise, bottleneck, denoising, decoding, and feedback explainer while retaining the independent-model caveat and launcher behavior.

- [ ] **Step 4: Run complete verification**

Run all Vitest tests, tracked-source ESLint, TypeScript, `/oratomic` build, `/oratomic-10k` build, portfolio sync/check, and desktop/mobile live content checks. Verify external source URLs return HTTP 200.

- [ ] **Step 5: Publish**

Commit and push simulator `main`, publish `viewer/out` built with `/oratomic-10k` to `gh-pages`, rebuild `/oratomic`, synchronize it into the portfolio repository, commit/push portfolio `main`, and verify deployed asset hashes and public URLs.

