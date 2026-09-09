# IonQ Application Visualization Release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a stable, sourced, mobile-usable Oratomic interactive visualization at a public GitHub Pages URL suitable for the IonQ application.

**Architecture:** Keep the current static Next.js application and Zustand/compute-engine data flow. Add small presentation and provenance components, harden URL sharing, make the existing split workspace responsive, then deploy the `viewer/out` static export through GitHub Actions with a repository base path.

**Tech Stack:** Next.js 16 static export, React 19, TypeScript, Zustand, Vitest, Playwright, GitHub Actions, GitHub Pages

## Global Constraints

- No backend is required for the public demonstration.
- Optional MLX compute must remain optional and must not connect automatically.
- Claims must be identified as paper-derived, extrapolated, model assumptions, or illustrative estimates.
- The primary reviewer journey must work at desktop and 390px mobile widths.
- Preserve untracked user work in `viewer/src/components/Scene/PlatformGeometry.tsx` and `viewer/src/components/Widget/`.
- Do not claim IonQ affiliation; credit the artifact as an independent implementation by Shivank.
- Do not add new simulation models, authentication, analytics, or a broader portfolio redesign.

---

### Task 1: Harden shareable simulator state

**Files:**
- Modify: `viewer/src/lib/url-state.ts`
- Modify: `viewer/src/components/Layout/Header.tsx`
- Create: `viewer/src/lib/__tests__/url-state.test.ts`

**Interfaces:**
- Consumes: existing `ShareableConfig`, simulator setters, browser Clipboard API.
- Produces: `decodeConfig(search: string): Partial<ShareableConfig> | null` that accepts only finite in-range numeric values; visible share success/failure feedback.

- [ ] **Step 1: Add failing URL validation tests**

Cover valid round trips, `NaN`, `Infinity`, malformed values, and out-of-range `p`/`t`. Assert that physical error rate is accepted only in `[0.0001, 0.01]` and cycle time only in `[0.001, 10]`.

- [ ] **Step 2: Verify the focused test fails**

Run: `npm test -- src/lib/__tests__/url-state.test.ts`
Expected: invalid numeric inputs are currently returned and at least one assertion fails.

- [ ] **Step 3: Add finite range validation**

Parse each numeric value once and assign it only when `Number.isFinite(value)` and it falls inside the control's supported range. Keep the existing enum allowlists.

- [ ] **Step 4: Make sharing resilient**

Change `handleShare` to `async`, await `navigator.clipboard.writeText(url)`, show `Copied` on success and `Copy failed` on rejection, and always clear the feedback after two seconds. Initialize the MLX indicator from `mlxBridge.isConnected()` in `useState` so the subscription effect does not synchronously set state.

- [ ] **Step 5: Verify and commit**

Run: `npm test -- src/lib/__tests__/url-state.test.ts && npx eslint src/lib/url-state.ts src/lib/__tests__/url-state.test.ts src/components/Layout/Header.tsx`
Expected: tests and focused lint pass.

Commit: `fix: harden shared simulator configurations`

### Task 2: Add reviewer orientation and scientific provenance

**Files:**
- Create: `viewer/src/lib/methodology.ts`
- Create: `viewer/src/components/Layout/ReleaseIntro.tsx`
- Create: `viewer/src/components/Simulator/MethodologyPanel.tsx`
- Modify: `viewer/src/app/page.tsx`
- Modify: `viewer/src/components/Simulator/ControlPanel.tsx`
- Modify: `viewer/src/components/Simulator/PlatformComparison.tsx`
- Modify: `viewer/src/app/globals.css`

**Interfaces:**
- Produces: `METHODOLOGY_ITEMS`, typed provenance labels, `ReleaseIntro`, and `MethodologyPanel`.
- Consumes: `useSimulator.getState().setMode("simulate")` for the primary call to action.

- [ ] **Step 1: Create typed methodology metadata**

Define entries for paper-derived architecture quantities, fitted block-error projections, model controls, and illustrative platform comparisons. Include the local source paper title and a link to the public repository. Mark IonQ resource estimates as illustrative, unpublished model estimates.

- [ ] **Step 2: Add the opening reviewer card**

Render a compact introduction above the first paper section with the title “Explore a 10,000-qubit fault-tolerant architecture,” credit “Independent interactive implementation by Shivank,” a sentence naming adjustable inputs/live outputs, and an “Explore simulator” button.

- [ ] **Step 3: Add methodology to Simulate mode**

Add a collapsed `Methodology & sources` section near the top of `ControlPanel`. Render all provenance categories and the repository/source references without requiring the reviewer to inspect source code.

- [ ] **Step 4: Qualify cross-platform numbers in context**

Display `Illustrative estimate` beside IonQ rows and a note below the comparison explaining that cross-platform values are scenario estimates rather than reported equivalent benchmarks.

- [ ] **Step 5: Verify and commit**

Run focused ESLint on all Task 2 files and `npm test`.
Expected: no errors in touched files; 31 existing engine tests plus new URL tests pass.

Commit: `feat: add release context and model provenance`

### Task 3: Make the primary experience responsive

**Files:**
- Modify: `viewer/src/app/page.tsx`
- Modify: `viewer/src/app/globals.css`
- Modify: `viewer/src/components/Layout/Header.tsx`
- Modify: `viewer/src/components/Layout/StatusBar.tsx`
- Create: `audit/tests/release.spec.ts`

**Interfaces:**
- Produces: `mobilePane: "controls" | "scene"` UI state and `.mobile-view-toggle` behavior below 768px.
- Consumes: existing `.pane-left`, `.pane-right`, header, and status bar markup.

- [ ] **Step 1: Add a failing mobile browser assertion**

At 390×844, assert `document.documentElement.scrollWidth <= window.innerWidth`, switch from controls to scene, and confirm both panes become reachable. At 1440×900, assert both panes remain visible simultaneously.

- [ ] **Step 2: Verify the test reproduces current overflow**

Run the production export with a local static server, then run the focused Playwright test.
Expected: current mobile scroll width is approximately 1041px and the test fails.

- [ ] **Step 3: Add mobile pane switching and responsive CSS**

Name the workspace wrapper, add a two-button mobile view switch, collapse the split layout below 768px, give the active pane full width, hide the inactive pane, allow header controls to wrap, and contain status overflow locally.

- [ ] **Step 4: Verify and commit**

Run the focused browser test at desktop and mobile, then focused ESLint.
Expected: no page-level horizontal overflow, both mobile views work, desktop retains split layout.

Commit: `feat: make visualization responsive`

### Task 4: Clear release-blocking React and lint failures

**Files:**
- Modify tracked files reported by `npx eslint src`, especially:
  - `viewer/src/components/Scene/CameraRig.tsx`
  - `viewer/src/components/Scene/Viewport.tsx`
  - `viewer/src/components/Scene/EmissionLayer.tsx`
  - `viewer/src/components/Simulator/BacklogMeter.tsx`
  - `viewer/src/components/Simulator/MLXPanel.tsx`
  - `viewer/src/components/Simulator/SyndromeReplay.tsx`
  - tracked files with unused imports or explicit `any`

**Interfaces:**
- Produces: a clean lint result for every tracked TypeScript/TSX source file.
- Consumes: the existing visual behavior and simulator contracts unchanged.

- [ ] **Step 1: Capture the tracked-source lint baseline**

Run ESLint against `git ls-files 'viewer/src/**/*.ts' 'viewer/src/**/*.tsx'` from the repository root, converting paths relative to `viewer`.
Expected: reproduce the current React purity/ref errors, explicit-`any` errors, and unused-symbol warnings while excluding preserved untracked work.

- [ ] **Step 2: Fix callback ownership and render-time ref access**

Pass camera interaction callbacks through a React ref or component-local ownership rather than assigning module globals during render. Convert animated emission rendering so refs are read in frame callbacks and rendered objects use stable state/data.

- [ ] **Step 3: Fix effect-derived state**

Initialize state lazily where possible and derive regenerated values with `useMemo` or event/state boundaries instead of synchronous `setState` calls in effects. Preserve timers and subscriptions with cleanup.

- [ ] **Step 4: Replace unsafe `any` and remove unused symbols**

Use `unknown`, typed RPC payload/result shapes, or existing interfaces. Remove unused imports and variables without changing public behavior.

- [ ] **Step 5: Verify and commit**

Run tracked-source ESLint, `npm test`, and `npm run build`.
Expected: tracked-source lint has zero errors, tests pass, and static export succeeds.

Commit: `fix: clear release-blocking code quality issues`

### Task 5: Configure reproducible GitHub Pages deployment

**Files:**
- Modify: `viewer/next.config.ts`
- Modify: `viewer/package.json`
- Create: `.github/workflows/deploy-pages.yml`
- Modify: `README.md`
- Modify: `viewer/README.md`

**Interfaces:**
- Consumes: `NEXT_PUBLIC_BASE_PATH` at build time.
- Produces: static assets under `/oratomic-10k`, a Pages artifact from `viewer/out`, and a documented public URL.

- [ ] **Step 1: Configure the repository base path**

Read `NEXT_PUBLIC_BASE_PATH`, default it to an empty string locally, and apply it as Next.js `basePath` and `assetPrefix`. Add `trailingSlash: true` and keep unoptimized images/static export.

- [ ] **Step 2: Add the Pages workflow**

On pushes to `main` and manual dispatch, check out the repository, set up Node with the `viewer/package-lock.json` cache, run `npm ci`, tests, tracked-source lint, and build from `viewer`, upload `viewer/out`, then deploy with official GitHub Pages actions. Set `NEXT_PUBLIC_BASE_PATH=/oratomic-10k` during build and grant `contents: read`, `pages: write`, and `id-token: write`.

- [ ] **Step 3: Document local and public use**

Update both READMEs with the public demo URL, quick reviewer interaction, scientific-source caveat, and the local build command.

- [ ] **Step 4: Verify the subpath build locally**

Run: `NEXT_PUBLIC_BASE_PATH=/oratomic-10k npm run build`
Expected: `viewer/out/index.html` refers to assets below `/oratomic-10k/_next/` and serving the export at that subpath loads without asset 404s.

- [ ] **Step 5: Verify and commit**

Run the workflow-equivalent test, lint, and build commands.
Expected: all pass locally.

Commit: `ci: deploy visualization to GitHub Pages`

### Task 6: Publish and validate the application URL

**Files:**
- Modify only if deployment verification reveals an in-scope defect.

**Interfaces:**
- Produces: `https://stannum13.github.io/oratomic-10k/` and final IonQ application copy.

- [ ] **Step 1: Push the reviewed release commits**

Push `main` to `origin` after confirming that only intended tracked changes are included and preserved untracked files remain uncommitted.

- [ ] **Step 2: Enable GitHub Pages with Actions**

Use the repository Pages API to select the workflow build type if the first workflow run reports that Pages is not enabled.

- [ ] **Step 3: Monitor the deployment**

Watch the `Deploy visualization to GitHub Pages` workflow to completion and retrieve the deployment URL. If it fails, inspect the exact job logs, fix the root cause, rerun local verification, commit, and push.

- [ ] **Step 4: Test the deployed origin**

Open the public URL at desktop and mobile sizes. Exercise the reviewer call to action, change physical error rate and architecture, open methodology, copy/reopen a shared URL, and verify no uncaught errors or failed assets.

- [ ] **Step 5: Prepare submission copy**

Provide the public URL followed by one sentence: “I built this interactive explorer to model how physical error rate, cycle time, code choice, and architecture trade qubit count against runtime and fault-tolerance feasibility; every control updates the simulation and 3D allocation live.”

- [ ] **Step 6: Commit any deployment-only fix and report completion**

If no fix was needed, leave the verified release commits as-is. Report the live URL, checks performed, and the exact application-field response.
