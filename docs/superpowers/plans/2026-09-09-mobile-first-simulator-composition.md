# Mobile-first simulator composition implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the phone reflow with a dedicated vertical simulator while making desktop hierarchy, metrics, controls, feasibility, PHY content, and 3D framing consistent and accessible.

**Architecture:** Extract shared result and control primitives backed by the existing Zustand store, then compose them differently in desktop `ControlPanel` and a new `MobileSimulator`. Pure helpers own runtime formatting, feasibility margins, numeric clamping, and allocation proportions. The right pane owns a normal-flow visualization header; the PHY becomes a continuous document and the mobile QPU canvas uses constrained gestures and visibility-aware rendering.

**Tech Stack:** Next.js 16, React 19, TypeScript, Zustand, react-three-fiber/Three.js, Vitest, CSS, static export.

## Global Constraints

- Preserve browser-native behavior on Windows, Linux, and macOS; do not expose MLX.
- At widths up to 767px render a dedicated single-column composition, not the desktop panes.
- Mobile order is header, metrics, controls, feasibility, scenarios, allocation, visualization, explainer.
- Runtime under one day uses one decimal hour everywhere.
- Every phone target is at least 44 by 44 CSS pixels; editable input text is at least 16px.
- Only active selectors and the primary comparison action use L2.
- Hidden or off-screen canvases do not render; mobile DPR is capped at 1.5 and bloom is disabled.
- No information is hover-only and no mobile selector scrolls horizontally.
- Cross-platform and timing rows remain explicitly illustrative.
- Preserve unrelated untracked scene and widget work.

---

### Task 1: Shared result derivations

**Files:**
- Create: `viewer/src/lib/simulator-presentation.ts`
- Create: `viewer/src/lib/__tests__/simulator-presentation.test.ts`
- Modify: `viewer/src/lib/format.ts`

**Interfaces:**
- Produces: `formatRuntime(days: number): string`, `clampNumber(value, min, max, fallback): number`, `deriveFeasibility(computed): FeasibilitySummary`, and `deriveAllocation(breakdown): AllocationSegment[]`.

- [ ] **Step 1: Write failing helper tests**

Test `0.2625` days as `6.3 hr`, `10` days as `10 days`, and `730` days as `2.0 yr`. Test finite clamping, feasible `headroom = toffoliBudget / toffoliCount`, infeasible percentage, and four allocation percentages summing to 100 within floating-point tolerance.

- [ ] **Step 2: Verify RED**

Run: `cd viewer && npm test -- src/lib/__tests__/simulator-presentation.test.ts`

Expected: FAIL because the presentation helpers do not exist.

- [ ] **Step 3: Implement pure helpers**

Use this runtime rule:

```ts
export function formatRuntime(days: number): string {
  if (!Number.isFinite(days) || days < 0) return "—";
  if (days >= 365) return `${(days / 365).toFixed(1)} yr`;
  if (days >= 1) return `${days.toFixed(0)} days`;
  return `${(days * 24).toFixed(1)} hr`;
}
```

`deriveFeasibility` returns `{ feasible, marginRatio, marginLabel, bindingLabel, explanation }`. `deriveAllocation` returns stable `memory`, `resource`, `operation`, `processor` ordering with count and percent.

- [ ] **Step 4: Verify GREEN and commit**

Run: `cd viewer && npm test -- src/lib/__tests__/simulator-presentation.test.ts && npx tsc --noEmit`

Commit: `feat: centralize simulator result presentation`

---

### Task 2: Shared metrics, controls, feasibility, and allocation primitives

**Files:**
- Create: `viewer/src/components/Simulator/MetricsBlock.tsx`
- Create: `viewer/src/components/Simulator/CoreControls.tsx`
- Create: `viewer/src/components/Simulator/ScenarioPicker.tsx`
- Create: `viewer/src/components/Simulator/FeasibilityStrip.tsx`
- Create: `viewer/src/components/Simulator/AllocationBar.tsx`
- Modify: `viewer/src/components/Simulator/Knob.tsx`
- Modify: `viewer/src/lib/qpu-glossary.ts`
- Modify: `viewer/src/lib/__tests__/qpu-glossary.test.ts`
- Modify: `viewer/src/ui-contract/__tests__/public-experience.test.ts`

**Interfaces:**
- Consumes: existing store values/actions and Task 1 helpers.
- Produces: five reusable components and a `SliderKnob` with paired numeric input.

- [ ] **Step 1: Add failing contracts**

Require all five component files, numeric `inputMode`, a target `radiogroup`, allocation `aria-label`, feasibility `details`, and glossary terms `walking-cat`, `block-error-target`, `toffoli-budget`, and `code-notation` with arXiv sources.

- [ ] **Step 2: Verify RED**

Run: `cd viewer && npm test -- src/ui-contract/__tests__/public-experience.test.ts src/lib/__tests__/qpu-glossary.test.ts`

Expected: FAIL on missing primitives and definitions.

- [ ] **Step 3: Implement primitives**

`MetricsBlock` uses one `aria-live="polite"` region. `CoreControls` renders workload first, then physical error and cycle-time sliders with numeric inputs that stage local strings and commit clamped values on blur/Enter. `ScenarioPicker` accepts the preset-application callback. `FeasibilityStrip` renders a native disclosure with budget, requirement, margin, binding constraint, and fitted-range warning. `AllocationBar` renders a stacked proportional bar plus four textual legend rows.

- [ ] **Step 4: Expand jargon definitions**

Add locally complete definitions for Walking Cat, the block-error target rationale, Toffoli budget, and `[[n,k,d]]` notation. Use tap-capable `details`; desktop hover may enhance but never replace activation.

- [ ] **Step 5: Verify GREEN and commit**

Run: `cd viewer && npm test -- src/ui-contract/__tests__/public-experience.test.ts src/lib/__tests__/qpu-glossary.test.ts && npx tsc --noEmit`

Commit: `feat: add shared simulator result controls`

---

### Task 3: Desktop hierarchy and truthful chrome

**Files:**
- Modify: `viewer/src/components/Simulator/ControlPanel.tsx`
- Modify: `viewer/src/components/Layout/Header.tsx`
- Modify: `viewer/src/components/Layout/StatusBar.tsx`
- Modify: `viewer/src/app/page.tsx`
- Modify: `viewer/src/app/globals.css`
- Modify: `viewer/src/ui-contract/__tests__/public-experience.test.ts`

**Interfaces:**
- Consumes: Task 2 primitives.
- Produces: desktop order `metrics → controls → scenarios → explainer/advanced`, compact header overflow, normal-flow visualization tabs, and a deduplicated desktop status.

- [ ] **Step 1: Write failing hierarchy contracts**

Assert the JSX source places `MetricsBlock` before `CoreControls`, controls before `ScenarioPicker`, and the explainer after scenarios. Require an overflow `details`, normal-flow `visualization-header`, and desktop status containing Toffoli/code while excluding qubits/block error/runtime.

- [ ] **Step 2: Verify RED**

Run: `cd viewer && npm test -- src/ui-contract/__tests__/public-experience.test.ts`

- [ ] **Step 3: Recompose desktop**

Replace inline quick stats/core controls/scenarios with shared primitives. Keep advanced analysis below the essential journey. Restyle the workflow as caption text. Render primary `Pin for comparison` before text-only reset.

- [ ] **Step 4: Fix header and right-pane flow**

Move version out of phone markup and copy/theme into an accessible overflow disclosure on mobile. Move QPU/PHY tabs into `visualization-header` normal flow so neither visualization heading can overlap them.

- [ ] **Step 5: Apply surface/type tokens**

Define L0/L1/L2 tokens, brighter borders, stronger body text, sans UI roles, and mono-only numeric/status roles. Ensure only pressed/selected controls and the comparison action use L2.

- [ ] **Step 6: Verify GREEN and commit**

Run: `cd viewer && npm test -- src/ui-contract/__tests__/public-experience.test.ts && npx tsc --noEmit`

Commit: `refactor: establish simulator information hierarchy`

---

### Task 4: Dedicated mobile composition

**Files:**
- Create: `viewer/src/components/Simulator/MobileSimulator.tsx`
- Create: `viewer/src/hooks/useMediaQuery.ts`
- Modify: `viewer/src/app/page.tsx`
- Modify: `viewer/src/components/Layout/StatusBar.tsx`
- Modify: `viewer/src/app/globals.css`
- Modify: `viewer/src/ui-contract/__tests__/public-experience.test.ts`

**Interfaces:**
- Consumes: media query hook and Task 2 primitives.
- Produces: a single vertical phone document and sticky `feasibility + runtime` line.

- [ ] **Step 1: Add failing mobile composition contract**

Require `MobileSimulator`, exact ordered data-section markers (`metrics`, `controls`, `feasibility`, `scenarios`, `allocation`, `visualization`, `explainer`), a collapsed `What is this?` disclosure, and a status line using shared `formatRuntime`.

- [ ] **Step 2: Verify RED**

Run: `cd viewer && npm test -- src/ui-contract/__tests__/public-experience.test.ts`

- [ ] **Step 3: Implement media selection and composition**

Render desktop workspace only above 767px and `MobileSimulator` only at or below it after the media query is known. The mobile component composes shared primitives in the required order; it does not render desktop panes or their toggle.

- [ ] **Step 4: Implement mobile layout CSS**

Use document scrolling, sticky compact header, one-row metrics, grouped 16px controls, 44px targets, full-width stacked actions, no horizontal selector scrolling, and a single sticky bottom line containing only badge and runtime.

- [ ] **Step 5: Verify GREEN and commit**

Run: `cd viewer && npm test -- src/ui-contract/__tests__/public-experience.test.ts && npx tsc --noEmit`

Commit: `feat: compose a vertical mobile simulator`

---

### Task 5: Mobile QPU framing and bounded overlays

**Files:**
- Modify: `viewer/src/components/Scene/Viewport.tsx`
- Modify: `viewer/src/components/Scene/CameraRig.tsx`
- Modify: `viewer/src/components/Scene/EmissionLegend.tsx`
- Modify: `viewer/src/components/Scene/EmissionLayer.tsx`
- Modify: `viewer/src/components/Simulator/BacklogMeter.tsx`
- Modify: `viewer/src/components/Simulator/MobileSimulator.tsx`
- Create: `viewer/src/hooks/useElementVisibility.ts`
- Modify: `viewer/src/app/globals.css`
- Modify: `viewer/src/ui-contract/__tests__/public-experience.test.ts`

**Interfaces:**
- Produces: 4:3 mobile canvas, reset callback, pan-disabled touch controls, two mobile labels, off-screen render pause, hidden unused wavelength legend, and clamped stall label.

- [ ] **Step 1: Write failing interaction contracts**

Require `enablePan={false}`, `Reset view`, a mobile 4:3 class, visibility-driven `frameloop`, two-label mobile filtering, and absence of `EmissionLegend` from the public QPU composition until wavelength colors are actually used.

- [ ] **Step 2: Verify RED**

Run: `cd viewer && npm test -- src/ui-contract/__tests__/public-experience.test.ts`

- [ ] **Step 3: Implement camera and canvas behavior**

Give `Viewport` `mobile`, `active`, and reset-signal props. Use tighter desktop/mobile camera presets, `enablePan={false}` on mobile, DPR `[1,1.5]`, no mobile bloom, and `frameloop={active ? "always" : "never"}`. Expose a button that increments reset signal and restores camera/target.

- [ ] **Step 4: Protect vertical scroll and visibility**

Wrap the 4:3 canvas in a card with 16px scroll gutters. Use `IntersectionObserver` to pause rendering when the card is outside the viewport. Keep one-finger rotate and pinch zoom inside the center region while gutters remain normal document scroll surfaces.

- [ ] **Step 5: Bound labels and remove unused legend**

Show only the two largest zone labels on mobile and list all allocations below. Clamp backlog status inside its container with layout CSS. Remove the wavelength legend from the rendered composition until emission geometry visibly adopts its palette.

- [ ] **Step 6: Verify GREEN and commit**

Run: `cd viewer && npm test -- src/ui-contract/__tests__/public-experience.test.ts && npx tsc --noEmit`

Commit: `feat: optimize QPU interaction for phones`

---

### Task 6: Continuous PHY document

**Files:**
- Modify: `viewer/src/components/Scene/QpuSystemView.tsx`
- Modify: `viewer/src/app/globals.css`
- Modify: `viewer/src/ui-contract/__tests__/public-experience.test.ts`

**Interfaces:**
- Produces: normal-flow platform selector, mobile platform dropdown, and continuous semantic sections for signal, noise, bottlenecks, classical correspondence, state, terms, and methods.

- [ ] **Step 1: Add failing continuous-document contracts**

Require all four explanatory sections in one render path, section IDs, a mobile platform `select`, desktop segmented platform control, and no `system-layer-switcher` state.

- [ ] **Step 2: Verify RED**

Run: `cd viewer && npm test -- src/ui-contract/__tests__/public-experience.test.ts`

- [ ] **Step 3: Recompose PHY view**

Remove layer state and render signal loop, noise, bottlenecks, and classical correspondence sequentially. Use sticky subsection headings where supported. Keep the diagnostic-versus-modeled distinction and current-state explanation visible.

- [ ] **Step 4: Verify GREEN and commit**

Run: `cd viewer && npm test -- src/ui-contract/__tests__/public-experience.test.ts && npx tsc --noEmit`

Commit: `refactor: make the PHY explanation continuous`

---

### Task 7: Full verification and production release

**Files:**
- Modify: `.worktrees/shivanknigam.com/scripts/check-site.mjs`
- Regenerate: `.worktrees/shivanknigam.com/oratomic/`

**Interfaces:**
- Produces: deployed `/oratomic/` and `/oratomic-10k/` builds from the verified source.

- [ ] **Step 1: Run complete local verification**

Run: `cd viewer && npm test -- --run && npx tsc --noEmit && npm run lint && npm run build:pages && npm run build:site`

Expected: all tests and builds pass; lint has no errors. Preserve warnings originating solely from unrelated untracked user files.

- [ ] **Step 2: Verify portfolio composition contract**

Update the site check to require the mobile-first assets/copy, sync the `/oratomic` export, and run `node scripts/check-site.mjs`.

- [ ] **Step 3: Publish all three branches**

Push simulator `main`, synchronize the latest `/oratomic-10k` export into `gh-pages`, push it, then commit and push the portfolio repository `main` with the `/oratomic` export.

- [ ] **Step 4: Verify live production**

Require HTTP 200 and current asset content from both public URLs. Verify the bundles contain `What is this?`, `Reset view`, and the continuous PHY section IDs, and no longer contain the unused wavelength legend or `qubits demonstrated` claim.
