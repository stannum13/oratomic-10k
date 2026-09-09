# Accessible Simulator and Portfolio Launch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the complete Oratomic simulator readable and accessible, remove the platform-specific MLX public surface, and launch it in a full-screen experience from `shivanknigam.com`.

**Architecture:** Keep the simulator as a static Next.js export on GitHub Pages and keep the portfolio as a dependency-free Cloudflare Pages site. Improve simulator semantics and contrast in place, then add a lazy full-screen iframe dialog to the separate portfolio repository with a direct-link fallback.

**Tech Stack:** Next.js 16, React 19, TypeScript, Three.js/React Three Fiber, Vitest, Playwright, static HTML/CSS/JavaScript, GitHub Pages, Cloudflare Pages

## Global Constraints

- Preserve the complete simulator and all browser-native scientific controls.
- Do not expose or connect to the MLX backend from the public application.
- Keep the experience equivalent on Windows, Linux, and macOS.
- Target WCAG 2.2 AA contrast for required text and controls.
- Do not add a domain, paid service, reverse proxy, analytics, or portfolio framework.
- Do not modify or commit the user's untracked `.next/`, `viewer/src/components/Scene/PlatformGeometry.tsx`, or `viewer/src/components/Widget/` work.
- Load the simulator iframe only after an explicit portfolio interaction and remove it on close.

---

### Task 1: Lock the public UI contract with failing tests

**Files:**
- Create: `viewer/src/ui-contract/__tests__/public-experience.test.ts`
- Modify: `scripts/check-site.mjs` in the portfolio checkout

**Interfaces:**
- Consumes: simulator CSS/component source and portfolio `index.html`.
- Produces: regression assertions for complete theme tokens, MLX-free public imports, accessible accordion semantics, and launcher dialog markup.

- [ ] **Step 1: Add simulator source-contract tests**

Read `globals.css`, `Header.tsx`, and `ControlPanel.tsx` with `readFileSync`. Assert that both theme blocks provide `--bg-hover`, `--bg-surface`, `--border-subtle`, `--text-quaternary`, `--accent`, `--accent-muted`, and `--success`; assert the header and control panel do not contain `mlxBridge`, `MLXIndicator`, or `MLXPanel`; and assert the section trigger includes `aria-expanded`, `aria-controls`, and a matching panel `id`.

- [ ] **Step 2: Run the simulator test and verify RED**

Run: `cd viewer && npm test -- src/ui-contract/__tests__/public-experience.test.ts`

Expected: FAIL because semantic tokens are missing, MLX imports remain, and accordion ARIA relationships are absent.

- [ ] **Step 3: Add portfolio launcher assertions**

Extend `scripts/check-site.mjs` to require a dialog with `id="oratomicLauncher"`, `aria-labelledby="oratomicLauncherTitle"`, a titled iframe, close and external-launch controls, and the deployed Oratomic URL.

- [ ] **Step 4: Run the portfolio check and verify RED**

Run: `node scripts/check-site.mjs`

Expected: FAIL because the launcher markup does not exist.

### Task 2: Repair simulator readability and navigation

**Files:**
- Modify: `viewer/src/app/globals.css`
- Modify: `viewer/src/components/Simulator/ControlPanel.tsx`
- Modify: `viewer/src/components/Layout/Header.tsx`
- Modify: `viewer/src/app/page.tsx`

**Interfaces:**
- Produces: complete theme tokens; `Section` triggers with linked panel IDs; a `simulator-guide` orientation block; clearer primary controls and interaction instructions.
- Consumes: existing simulator store actions and accordion content unchanged.

- [ ] **Step 1: Define every semantic theme token**

Add explicit dark and light values for the seven missing tokens. Raise required tertiary/quaternary text contrast, strengthen borders, and provide distinct hover/surface states. Keep the emission and status colors semantically unchanged.

- [ ] **Step 2: Make accordion semantics and targets explicit**

Derive a stable slug from each section title, set `aria-expanded` and `aria-controls` on the trigger, assign the matching content `id`, and ensure each trigger has at least a 44 px target. Show a visible expanded-state accent independent of the chevron.

- [ ] **Step 3: Add workflow guidance above controls**

Insert a compact heading (`Tune the architecture`) and numbered `Choose → Tune → Observe → Compare` guide above `QuickStats`. Add one sentence that parameters update the totals and 3D allocation live. Keep QuickStats and the existing analysis sections.

- [ ] **Step 4: Clarify scene navigation**

Add a small non-obstructive instruction in the viewport layer: `Drag to rotate · Scroll to zoom · Right-drag to pan`. Ensure it remains visible in both themes and is hidden from screen readers only if equivalent accessible copy is provided elsewhere.

- [ ] **Step 5: Verify GREEN for the UI contract**

Run: `cd viewer && npm test -- src/ui-contract/__tests__/public-experience.test.ts -t "defines complete semantic color tokens|links accordion triggers to their panels"`

Expected: the token and accordion assertions pass; the separate MLX assertion remains intentionally red until Task 4.

### Task 3: Increase 3D scene legibility

**Files:**
- Modify: `viewer/src/components/Scene/Viewport.tsx`
- Modify: `viewer/src/components/Scene/Apparatus.tsx`
- Modify: `viewer/src/app/globals.css`

**Interfaces:**
- Produces: `.zone-label`, `.zone-label__name`, `.zone-label__count`, and `.scene-navigation-hint` presentation classes.
- Consumes: existing zone names, counts, positions, theme, and OrbitControls.

- [ ] **Step 1: Render zone data as readable badges**

Replace inline low-opacity label styling with semantic classes. Use an opaque/high-opacity contrasting surface, border, 12 px minimum text, separated zone name/count, and a small shadow. Keep `pointerEvents: none` and the existing zone anchors.

- [ ] **Step 2: Strengthen apparatus structure**

Raise substrate edge, chamber frame, data-bus, and zone-corner luminance/opacity enough to remain visible without competing with atom clouds. Select light/dark structural colors from the active theme rather than hard-coding nearly black dark-theme lines.

- [ ] **Step 3: Tune scene lighting and label hierarchy**

Increase ambient/directional contribution conservatively, keep atom positions and simulation values unchanged, and ensure counts are secondary but readable.

- [ ] **Step 4: Run focused validation**

Run: `cd viewer && npx eslint src/components/Scene/Viewport.tsx src/components/Scene/Apparatus.tsx src/app/globals.css`

Expected: zero lint errors in TypeScript/TSX; CSS is processed by the production build in Task 6.

### Task 4: Remove the public MLX surface and document future acceleration

**Files:**
- Modify: `viewer/src/components/Layout/Header.tsx`
- Modify: `viewer/src/components/Simulator/ControlPanel.tsx`
- Modify: `README.md`
- Modify: `viewer/README.md`
- Create: `viewer/docs/platform-neutral-acceleration.md`

**Interfaces:**
- Produces: a public component graph with no MLX imports or localhost connection affordance; a concrete future backend-selection contract.
- Leaves dormant: `viewer/src/compute/mlx-bridge.ts`, `viewer/src/components/Simulator/MLXPanel.tsx`, and `mlx-backend/` for later research work.

- [ ] **Step 1: Remove MLX from the header**

Delete the bridge import, connection-state component, and MLX button. Preserve theme, read/simulate, and share controls.

- [ ] **Step 2: Remove MLX from the control panel**

Delete the panel import and System accordion entry so the public component graph cannot load platform-specific UI.

- [ ] **Step 3: Correct release documentation**

Remove MLX from shipped feature lists. Document that all public interactions are browser-native and available across supported desktop operating systems.

- [ ] **Step 4: Record the future acceleration contract**

Write a focused note specifying an `AccelerationProvider` capability interface, runtime feature/OS detection, provider priority, Web Worker fallback, user-visible status, and identical numerical contracts across Apple MLX, CUDA/DirectML or WebGPU-capable systems, and CPU fallback. State that acceleration remains disabled until correctness and parity benchmarks pass.

- [ ] **Step 5: Verify GREEN**

Run: `cd viewer && npm test -- src/ui-contract/__tests__/public-experience.test.ts`

Expected: all public-experience contract tests pass.

### Task 5: Add the full-screen portfolio launcher

**Files:**
- Modify: `index.html` in the `stannum13/shivanknigam.com` checkout
- Modify: `scripts/check-site.mjs` in that checkout

**Interfaces:**
- Produces: `openOratomicLauncher(trigger)`, `closeOratomicLauncher()`, `#oratomicLauncher`, and a lazily assigned iframe source.
- Consumes: `https://stannum13.github.io/oratomic-10k/` and the existing project-array renderer.

- [ ] **Step 1: Add the Oratomic project entry**

Add a project card describing the adjustable error rate, cycle time, code, architecture, live feasibility outputs, and 3D allocation. Give it an `Open interactive simulator` launcher action plus a direct external URL.

- [ ] **Step 2: Add the accessible dialog shell**

Add a fixed full-viewport `<dialog id="oratomicLauncher" aria-labelledby="oratomicLauncherTitle">` with title, context, close control, loading message, iframe title, and `Open in new tab` fallback. Style it to match the portfolio while giving the simulator nearly the full viewport.

- [ ] **Step 3: Implement lazy lifecycle and keyboard behavior**

On open, remember the invoking element, assign the iframe `src`, call `showModal()`, lock body scrolling, and focus the close button. On iframe load, remove the loading state. On close or cancel, clear `src`, unlock scrolling, and restore focus. Keep native Escape behavior through the dialog `cancel` event.

- [ ] **Step 4: Verify portfolio GREEN**

Run: `node scripts/check-site.mjs`

Expected: `site checks passed` and all launcher assertions pass.

- [ ] **Step 5: Commit portfolio changes**

Commit only `index.html` and `scripts/check-site.mjs` with: `feat: launch Oratomic simulator from portfolio`.

### Task 6: Verify, deploy, and inspect both public experiences

**Files:**
- Modify only if a verification failure identifies an in-scope defect.

**Interfaces:**
- Produces: updated GitHub Pages simulator and Cloudflare Pages portfolio.

- [ ] **Step 1: Run complete simulator verification**

Run from `viewer`: `npm test`, tracked-source ESLint, and `npm run build:pages`.

Expected: all tests pass, lint exits zero, and static export succeeds with `/oratomic-10k` asset paths.

- [ ] **Step 2: Run browser checks locally**

Serve the production export at the repository base path. At 1440×900 and 390×844, verify readable controls, keyboard accordion use, mobile pane switching, zone badges, navigation hint, no MLX UI, and no horizontal document overflow.

- [ ] **Step 3: Commit simulator implementation**

Commit only intended tracked simulator, documentation, and test files with: `feat: improve simulator accessibility and guidance`.

- [ ] **Step 4: Push both repositories**

Push the simulator `main` branch and publish its static export to the existing `gh-pages` branch. Push the portfolio `main` branch and allow its existing Cloudflare Pages integration to deploy.

- [ ] **Step 5: Verify live origins**

Check both URLs return HTTP 200. Open the live portfolio, launch and close the full-screen simulator with pointer and keyboard, confirm the iframe loads, confirm the direct link works, tune a primary parameter, rotate/zoom the scene, and verify the mobile layout.

- [ ] **Step 6: Report exact shipped URLs and evidence**

Report `https://www.shivanknigam.com` and `https://stannum13.github.io/oratomic-10k/`, the test/lint/build results, and any remaining external deployment caveat.
