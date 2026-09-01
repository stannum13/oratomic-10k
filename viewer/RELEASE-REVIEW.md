# Release-Readiness Review: Oratomic 10k Qubit Architecture Viewer

**Reviewer:** Dr. Kai Nakamura
**Date:** 2026-08-29
**Verdict:** NOT READY for public release. Strong foundation, but several blockers and consistency issues need resolution. Estimated effort to ship-ready: 3-5 days of focused work.

---

## A. BLOCKERS -- things that MUST be fixed before public release

### A1. Complete mobile breakage
The layout uses `w-[40%]` / `w-[60%]` hardcoded split with no responsive breakpoints (`page.tsx:143-146`). On any screen under ~900px, the paper pane becomes unreadable and the 3D viewport is cramped to uselessness. The `overflow: hidden` on `html, body` (`globals.css:49`) combined with the fixed `h-screen` layout means nothing scrolls on mobile at all. This is a showstopper for any researcher who shares a link and the recipient opens it on a phone.

### A2. Zone color inconsistency across three systems
There are THREE different color palettes for the same four zones, and they disagree:

| Zone | CSS variables (`globals.css`) | `constants.ts` | `ZoneLayout.tsx` | `paper-sections.json` |
|------|------------------------------|-----------------|------------------|-----------------------|
| Memory | `#4dc9f6` | `#4fc3f7` | `#4dc9f6` | `#4fc3f7` |
| Processor | `#f67019` | `#ffa726` | `#f67019` | `#ffa726` |
| Operation | `#4bc076` | `#4caf50` | `#4bc076` | `#4caf50` |
| Resource | `#e8548e` | `#f06292` | `#e8548e` | `#f06292` |

The 3D scene uses one set, the paper's zone cards use another, and the status bar dots use the CSS variables (which match the 3D scene). A researcher seeing "Memory" in the paper with color `#4fc3f7` and then looking at the 3D view where it is `#4dc9f6` will perceive this as sloppy. Canonicalize to one palette.

### A3. `CameraRig` uses illegal static property mutation pattern
`CameraRig.tsx:89-90` assigns static properties to a function component:
```typescript
CameraRig._onStart = () => {};
CameraRig._onEnd = () => {};
```
This works by accident in current React but is unsound. TypeScript should flag this but doesn't because there are no type annotations. In strict mode or future React versions this could break silently. The `Viewport.tsx:109-110` references `CameraRig._onStart?.()` which is equally fragile.

### A4. `Apparatus.tsx` `ZoneMarkings` component has wrong props interface
`Apparatus.tsx:179` declares `ZoneMarkings` as accepting `{ zones: ZoneConfig[]; breakdown: Record<string, number> }` but the `breakdown` parameter is never used inside the component. It is passed by the parent (`Apparatus.tsx:237`) but serves no purpose. This is dead code masquerading as a feature -- a reviewer or contributor would wonder what it does.

### A5. `DataBuses` violates React hooks rules
`Apparatus.tsx:103-108`: `useMemo` is called after a conditional early return on line 101 (`if (!memory || ...) return null`). This violates the Rules of Hooks -- hooks must not be called conditionally. This will crash in React StrictMode or future concurrent features.

### A6. MLX WebSocket auto-connects on page load
`Header.tsx:12`: `mlxBridge.connect()` fires inside a `useEffect` on every page load, attempting a WebSocket connection to `ws://localhost:8765`. For the vast majority of users who don't have an MLX backend running, this will:
- Emit console errors on every page load
- Trigger a reconnect attempt every 5 seconds indefinitely (`mlx-bridge.ts:51`)
- Pollute the developer console

This is aggressive behavior for a read-mode paper viewer. The connection should be opt-in only.

### A7. `js-compute.ts` is dead code
The entire `js-compute.ts` file contains a full `computeArchitecture` function that duplicates what `engine-compute.ts` does. It imports from `lookup-tables.ts` but is never imported by anything. This is a refactor leftover that will confuse contributors.

### A8. No keyboard accessibility for the Knob slider
`Knob.tsx`: The range inputs work, but the `ToggleKnob` buttons have no `aria-pressed` or `role="radio"` attributes. The `SliderKnob` has no `aria-label` or `aria-valuetext`. Screen readers will announce these as unlabeled controls.

---

## B. FUNCTIONAL GAPS -- missing features that undermine the value proposition

### B1. README promises features that don't exist as described
- `viewer/README.md:57` references `TweezerBeams` in the architecture diagram, but the component is actually called `LaserDelivery` (inside `Apparatus.tsx`). No file named `TweezerBeams` exists.
- `viewer/README.md:65` references `public/data/code-params.json` and `public/data/resource-tables.json` as data sources. These files exist but are never imported by the application -- the data lives in `lookup-tables.ts` and `SeedMatrixDisplay.tsx` instead. The README is describing an older architecture.
- `viewer/README.md:73` lists Roadmap v1.1 (WASM for LP code construction) and v2 (decoder simulation, parameter sweep, comparison mode) as future work, but v2 features (parameter sweep, comparison mode, decoder slots) are already implemented. The roadmap is stale.

### B2. Decoder selector is cosmetic
The decoder toggle in `ControlPanel.tsx:166` (BP-LSD / BP / FNO) changes `decoderType` in the store, but `setDecoderType` (`simulator.ts:130`) does NOT trigger a `recompute()`. The decoder choice has zero effect on any computed output. The displayed decoder stats in lines 168-174 are hardcoded stub values. A researcher selecting "FNO" decoder and seeing "1MHz throughput" is being shown fictional data. This is misleading.

### B3. "Live Code Construction" blocks the main thread
`simulator.ts:139-163`: `computeLiveCode` uses a dynamic `import()` which is async for module loading, but then calls `computeCodeSync` -- a synchronous function. For large ring orders (e.g., lp24 with ringOrder=91), this will freeze the UI. The function name even says "sync." This should run in a Web Worker, which the filename `code-worker.ts` implies was the intent but was never implemented.

### B4. No error boundaries around the 3D scene
If any Three.js component throws (e.g., WebGL context lost, unsupported GPU), the entire application crashes with a white screen. There is no `<ErrorBoundary>` wrapping the `<Canvas>`. Given that this targets researchers who may be on varied hardware, this is a real risk.

### B5. Parameter sweep recomputes 60 points synchronously on every state change
`ParameterSweep.tsx:31-65`: The `useMemo` dependency array includes every simulator parameter. Any slider drag triggers 60 calls to `computeWithEngine`, each of which runs `sensitivityAnalysis` (which does symbolic differentiation). This will cause visible jank on slower machines. Needs debouncing or web worker offloading.

### B6. Comparison mode pinned state is lost on mode switch
If a user pins a configuration in Comparison Mode, then switches to Paper mode and back, the pinned state is gone (it lives in local React state inside `ComparisonMode.tsx:56`). This should persist in the Zustand store.

---

## C. AESTHETIC ISSUES -- design problems that reduce perceived quality

### C1. Mixed design language between ControlPanel sections and sub-panels
The ControlPanel accordion sections use CSS variable-based styling (`var(--bg-surface)`, `var(--text-tertiary)`) consistently, but the child panels (ParameterSweep, ComparisonMode, SensitivityPanel, ExportPanel) use raw Tailwind color values like `text-[#64748b]`, `bg-white/5`, `border-white/10`, `text-[#e2e8f0]`. These are Slate palette colors that don't match the design system at all. Compare:
- `ParameterSweep.tsx:117`: `text-[#64748b]` (Slate 500)
- `ControlPanel.tsx:46`: `text-[var(--text-tertiary)]` which is `#5a5a5a`

The sub-panels look like they were ported from a different project.

### C2. SVG charts have hardcoded pixel width
`ParameterSweep.tsx:71`: `const width = 320` is hardcoded. The SVG has `className="w-full"` which stretches it, but the viewBox is fixed at 320x160. This means the chart will be distorted on wider or narrower panels. Should use a responsive approach with `useRef` + `ResizeObserver`.

### C3. Font size inconsistency
The codebase uses at least 8 different font sizes for "small" text: `text-[7px]`, `text-[8px]`, `text-[9px]`, `text-[10px]`, `text-[11px]`, `text-[12px]`, `text-[13px]`, `text-xs`. The distinction between 9px and 10px is imperceptible on most displays and just creates visual noise. Consolidate to 3-4 sizes.

### C4. Section nav labels are cryptic
`page.tsx:29`: `["Hero", "Arch", "Codes", "Surgery", "Magic", "Resources", "Sim"]` -- "Arch" and "Sim" are unclear abbreviations. Given the 9px font size and generous spacing, there is room for full words.

### C5. Orphaned `count-animate` class
`globals.css:121`: The `.count-animate` class is defined but only used in `ControlPanel.tsx:82` (QuickStats). It fires the animation on initial render only -- there is no mechanism to re-trigger it when values change. The animation is invisible in practice.

### C6. `hero-gradient` is barely visible
`globals.css:104-107`: The hero gradient uses `rgba(77, 201, 246, 0.02)` and `rgba(99, 102, 241, 0.015)`. These opacity values are so low that on most monitors, especially non-P3 displays, the gradient is completely invisible. Either commit to the effect (bump to 0.05+) or remove the dead CSS.

---

## D. DEAD CODE & CLEANUP -- files that should be removed or refactored

### D1. `src/compute/js-compute.ts` -- dead file
Never imported. Fully superseded by `engine-compute.ts`. Remove.

### D2. Duplicated seed matrix data
`SEED_MATRICES` is defined identically in both `store/simulator.ts:11-36` and `components/Paper/SeedMatrixDisplay.tsx:6-19`. Consolidate into a single source of truth (e.g., a shared constants file or the JSON data).

### D3. Duplicated number formatting utilities
`StatusBar.tsx` defines `fmt`, `fmtSci`, `fmtDays`. `ComparisonMode.tsx` defines `formatNum`, `formatSci`, `formatDays` -- functionally identical. Extract to a shared `src/lib/format.ts`.

### D4. `ControlPanel.tsx` `defaultOpen` prop on `Section`
`ControlPanel.tsx:31`: The `Section` component accepts a `defaultOpen` prop that is declared but never read inside the component body. Dead parameter.

### D5. `public/data/code-params.json` and `public/data/resource-tables.json`
These files exist in `public/data/` but are never loaded by the application. The data they contain is duplicated in `src/compute/lookup-tables.ts`. Either use them as the source of truth (import at build time) or remove them.

### D6. `engine/circuit-ir.ts`
Listed in the engine directory but not imported by any reviewed file. Likely scaffolding for a future feature. Should be documented or removed.

### D7. `ZONE_COLORS` in `constants.ts` is never imported
`constants.ts:1-6` exports `ZONE_COLORS` but a global search shows it is not used anywhere. The 3D scene hardcodes zone colors in `ZoneLayout.ts` and the CSS uses separate variables.

---

## E. WHAT'S ACTUALLY GOOD -- things to preserve and highlight

### E1. The symbolic compute engine is genuinely impressive
The `engine/` directory implements a symbolic expression system with differentiation and simplification (`expr.ts`), architecture definitions as symbolic expressions (`architecture.ts`), and automatic sensitivity analysis (`sensitivity.ts`). This is not a toy -- it is a proper symbolic algebra system that enables real exploratory computation. The elasticity-based bottleneck analysis is exactly what a researcher would want.

### E2. The LP code construction pipeline works
The chain from seed matrix exponents through polynomial ring arithmetic (`polynomial-ring.ts`) to lifted-product code construction (`lp-code.ts`) to Tanner graph extraction is a real implementation of the paper's math. The fact that users can construct codes from seed matrices in-browser is a genuine contribution.

### E3. The 3D visualization is aesthetically excellent
The InstancedMesh atom cloud rendering, bloom post-processing, vacuum chamber apparatus, zone markings with corner lines, and laser delivery beams create a cohesive visual that looks like a real lab photograph. The camera rig with section-aware presets and user-interaction yielding is well-designed.

### E4. The scroll-driven paper reader with synchronized 3D is a strong concept
The IntersectionObserver-based section tracking (`SectionTracker.tsx`) driving both the left-pane active state and camera position creates a genuinely engaging reading experience. The gate arc animations during the surgery section (index 3) and magic state injection (index 4) are good pedagogical touches.

### E5. URL state sharing is well-implemented
`url-state.ts` properly encodes/decodes all simulator parameters with validation. The Share button in the header copies a full configuration URL. This is exactly right for researchers collaborating on parameter exploration.

### E6. The example configurations are exceptional
`example-configs.json` contains 10 carefully curated presets with detailed `description` and `whatToLookAt` fields. These are not generic -- they tell a story about the paper's tradeoffs. The "Cliff" preset (p=0.5%) and "Slow Cycles" preset (p=3e-3, 5ms) are particularly good for building intuition. These descriptions should be surfaced in the UI (currently only `name` and `description` are shown; `whatToLookAt` is unused).

### E7. The MLX bridge architecture is forward-looking
The WebSocket bridge to a Python MLX backend (`mlx-bridge.ts`) with typed RPC methods for BP decoding, neural training, tensor network contraction, and code search is a clean abstraction. The MLXPanel UI is well-structured even if the backend doesn't exist yet.

---

## F. PRIORITIZED TASK LIST -- ordered by impact

| # | Task | Why | Effort | Priority |
|---|------|-----|--------|----------|
| 1 | Fix React hooks violation in `DataBuses` (`Apparatus.tsx:101-108`). Move the early return below all hooks, or restructure so hooks are always called. | Will crash in StrictMode and future React versions. | S | P0 |
| 2 | Add responsive layout breakpoints. At minimum: stack the panes vertically below 768px, hide 3D viewport on screens <640px with a "View 3D" toggle. | Complete unusability on mobile/tablet. | M | P0 |
| 3 | Canonicalize zone colors. Pick one palette (suggest the CSS variables in `globals.css`), update `constants.ts`, `ZoneLayout.tsx`, and `paper-sections.json` to match. | Visual inconsistency undermines credibility. | S | P0 |
| 4 | Make MLX WebSocket connection opt-in. Remove auto-connect from `Header.tsx` useEffect. Only connect when user clicks the MLX status button or opens the MLX panel. Kill the auto-reconnect timer. | Console spam and unnecessary network requests for 99% of users. | S | P0 |
| 5 | Delete `src/compute/js-compute.ts`. | Dead code confusion. | S | P0 |
| 6 | Fix `CameraRig` static property pattern. Use a module-scoped `ref` or context instead of mutating function component properties. | Fragile, breaks TypeScript strict mode. | S | P1 |
| 7 | Add `<ErrorBoundary>` around the `<Canvas>` in `page.tsx` with a graceful fallback showing computed stats without 3D. | White screen crash on WebGL failure. | S | P1 |
| 8 | Make decoder selection functional or clearly label it as "preview." Either wire `decoderType` into `recompute()` (affecting decode timing in the waterfall) or add "(preview)" badge to the decoder section and grey out the stats. | Misleading fictional data. | M | P1 |
| 9 | Extract shared formatting utilities from `StatusBar.tsx` and `ComparisonMode.tsx` into `src/lib/format.ts`. | Code duplication. | S | P1 |
| 10 | Extract `SEED_MATRICES` from `simulator.ts` and `SeedMatrixDisplay.tsx` into a single shared constant. | Data duplication risks divergence. | S | P1 |
| 11 | Harmonize sub-panel styling. Replace all raw hex colors in `ParameterSweep.tsx`, `ComparisonMode.tsx`, `SensitivityPanel.tsx`, `ExportPanel.tsx` with CSS variable equivalents. | Visual inconsistency between accordion sections. | M | P1 |
| 12 | Surface `whatToLookAt` from preset configs in the UI. Show it as an expandable detail below each preset button in the ControlPanel. | Valuable pedagogical content is hidden. | S | P1 |
| 13 | Move `computeLiveCode` to a Web Worker. The filename `code-worker.ts` already implies this was intended. | Main thread blocking on code construction. | M | P1 |
| 14 | Debounce or throttle the ParameterSweep recomputation. Use `useDeferredValue` or a 100ms debounce on the sweep dependencies. | UI jank during slider drags. | S | P1 |
| 15 | Add `aria-label`, `aria-valuetext` to `SliderKnob` and `role="radiogroup"` + `aria-pressed` to `ToggleKnob`. | Accessibility compliance. | S | P1 |
| 16 | Update `viewer/README.md`: fix `TweezerBeams` reference, remove references to unused JSON files, update roadmap to reflect implemented features. | README describes a different app than what exists. | S | P1 |
| 17 | Remove `ZONE_COLORS` from `constants.ts` or use it as the canonical source. | Dead export. | S | P2 |
| 18 | Delete or document `engine/circuit-ir.ts` and unused JSON files in `public/data/`. | Unused scaffolding. | S | P2 |
| 19 | Remove `defaultOpen` prop from `Section` component in `ControlPanel.tsx`. | Dead parameter. | S | P2 |
| 20 | Consolidate font sizes to a 4-size scale: `text-[9px]` (tiny labels), `text-[11px]` (body small), `text-[13px]` (body), `text-[16px]+` (headings). | Visual noise from 8 nearly-identical sizes. | M | P2 |
| 21 | Expand section nav labels from abbreviations to full words: "Architecture", "Simulator". | Clarity for first-time users. | S | P2 |
| 22 | Add viewport `<meta>` tag for mobile scaling in `layout.tsx`. | Mobile rendering. | S | P2 |
| 23 | Persist ComparisonMode pinned state in Zustand store instead of local React state. | State lost on mode switch. | S | P2 |
| 24 | Make the hero gradient visible (bump opacity to 0.05+) or remove it. | Invisible CSS. | S | P2 |
| 25 | Add a loading/empty state to TannerOverlay when code hasn't been constructed yet -- show "Construct LP code to visualize Tanner graph" as Html overlay. | Silent empty state is confusing. | S | P2 |

---

**Bottom line:** The core concept is strong and the symbolic compute engine is real engineering. But the project has the telltale signs of rapid iteration without a cleanup pass: duplicated data, dead code, mixed styling conventions, and no mobile consideration. Fix the P0s (items 1-5, roughly one day of work), then do a styling harmonization pass (items 6-16, two more days), and this is ready to ship.
