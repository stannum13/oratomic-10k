# Guided Simulator Production Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the public simulator immediately understandable, visibly responsive, easier to navigate, and ready to share as portfolio evidence.

**Architecture:** Keep the simulator's computational model unchanged. Add a focused guided layer inside `ControlPanel`, expose reset as one atomic store action, clarify sharing copy in the header, and remove the unexplained scene watermark. Keep the portfolio launcher as a same-origin, full-screen wrapper around the exported simulator.

**Tech Stack:** Next.js 16, React 19, Zustand, Vitest, CSS, static export, Cloudflare Pages, GitHub Pages.

## Global Constraints

- Preserve all existing paper-reading and simulation behavior.
- Do not expose or depend on MLX in the public experience.
- Keep the simulator usable on Windows, Linux, and macOS through browser-side TypeScript/WebGL.
- Preserve unrelated untracked files in the repository.
- Keep `shivanknigam.com/oratomic/` and GitHub Pages deployable from the same source.

---

### Task 1: Lock the public UX contract

**Files:**
- Modify: `viewer/src/ui-contract/__tests__/public-experience.test.ts`

**Interfaces:**
- Consumes: public component source and stylesheet text.
- Produces: regression assertions for guided presets, core/advanced navigation, reset/copy actions, live output feedback, independence copy, and watermark removal.

- [ ] **Step 1: Write failing contract tests**

Add assertions requiring `Start with a guided scenario`, the three scenario names, `Core controls`, `Advanced analysis`, `Reset configuration`, `Copy configuration`, `aria-live="polite"`, `Independent, research-informed model`, and the absence of the standalone watermark block containing `10,000`.

- [ ] **Step 2: Verify the tests fail for missing behavior**

Run: `cd viewer && npm test -- src/ui-contract/__tests__/public-experience.test.ts`

Expected: FAIL on the newly required copy and controls.

---

### Task 2: Add guidance, hierarchy, and visible feedback

**Files:**
- Modify: `viewer/src/components/Simulator/ControlPanel.tsx`
- Modify: `viewer/src/components/Layout/Header.tsx`
- Modify: `viewer/src/store/simulator.ts`
- Modify: `viewer/src/app/page.tsx`
- Modify: `viewer/src/app/globals.css`

**Interfaces:**
- Consumes: `configsData.configs`, existing simulator setters, `computed`, and `encodeConfig`.
- Produces: `resetConfig(): void`, three guided scenario buttons, core/advanced view tabs, animated/live quick stats, explicit configuration actions, and a scene without an orphaned numeral.

- [ ] **Step 1: Add one atomic reset action**

Extend `SimulatorState` with `resetConfig: () => void`. Implement it by restoring `defaults`, recomputing `computed`, and clearing `paramHistory`, `pinnedConfig`, and `liveCode` while preserving theme and mode.

- [ ] **Step 2: Add the guided entry point**

Render three compact buttons above the detailed controls: `Minimum qubits`, `Balanced baseline`, and `Error-rate cliff`. Map them to the existing headline, balanced, and high-error configurations. Each card includes a one-line question describing what changes to observe.

- [ ] **Step 3: Separate core controls from advanced analysis**

Add an accessible two-button switch labeled `Control depth`. Core shows guided scenarios, physical parameters, code architecture, and comparison pinning. Advanced shows methodology, hardware/platform details, the full preset library, analysis tools, recording, and export.

- [ ] **Step 4: Make parameter response visible**

Give `QuickStats` `aria-live="polite"`; key each metric by its current value and apply a short `quick-stat-change` animation on value changes. Add explanatory copy telling users the scene labels and headline metrics update together.

- [ ] **Step 5: Clarify actions and provenance**

Add `Reset configuration` beside comparison pinning, rename the header share action to `Copy configuration`, retain explicit copied/failure feedback, and display `Independent, research-informed model` in the simulator guide.

- [ ] **Step 6: Remove the unexplained right-pane numeral**

Delete the absolute-positioned `10,000` watermark from `page.tsx` without removing contextual mentions of the paper's 10,000-qubit result.

- [ ] **Step 7: Add focused styling**

Add styles for scenario cards, the core/advanced switch, action buttons, visible focus states, and metric-change animation. Respect `prefers-reduced-motion` and keep mobile layouts single-column.

- [ ] **Step 8: Verify the contract passes**

Run: `cd viewer && npm test -- src/ui-contract/__tests__/public-experience.test.ts`

Expected: PASS.

---

### Task 3: Update portfolio copy, synchronize, and release

**Files:**
- Modify: `.worktrees/shivanknigam.com/index.html`
- Modify: `.worktrees/shivanknigam.com/README.md` only if workflow changes are necessary
- Regenerate: `.worktrees/shivanknigam.com/oratomic/`

**Interfaces:**
- Consumes: `viewer/out` generated with `/oratomic` base path.
- Produces: a portfolio CTA labeled `Launch the interactive simulator`, updated project framing, and a same-origin production export.

- [ ] **Step 1: Write a failing portfolio contract assertion**

Update the portfolio check to require `Launch the interactive simulator` and concise independent-model framing.

- [ ] **Step 2: Verify the portfolio check fails**

Run: `cd .worktrees/shivanknigam.com && node scripts/check-site.mjs`

Expected: FAIL on the new copy requirement.

- [ ] **Step 3: Update portfolio copy**

Lead with the question `What does it take to operate a 10,000-qubit system?`, describe the live architecture/error/hardware tradeoffs, and use the exact CTA `Launch the interactive simulator`.

- [ ] **Step 4: Build and synchronize both public targets**

Run `cd viewer && npm run build:site`, then `cd .worktrees/shivanknigam.com && node scripts/sync-oratomic.mjs /Users/shiva/repos/reading-papers/oratomic-10k/viewer/out`. Separately run `cd viewer && npm run build:pages` for GitHub Pages.

- [ ] **Step 5: Run full verification**

Run simulator tests, lint on tracked sources, both static builds, portfolio checks, and browser smoke tests at desktop and mobile widths. Confirm guided presets work, a slider updates results, reset restores defaults, copy reports success/failure, core/advanced navigation works, the watermark is absent, and the same-origin dialog closes with Escape.

- [ ] **Step 6: Commit and push the simulator release**

Commit source changes on `main`, push `origin/main`, then publish the verified Pages export to `gh-pages`.

- [ ] **Step 7: Commit and push the portfolio release**

Commit the portfolio source and synchronized `/oratomic/` export on its `main` branch and push `origin/main` so Cloudflare CI/CD deploys it.
