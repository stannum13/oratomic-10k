# Simulator Trust Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make displayed units and feasibility language trustworthy while improving first-read mobile context and desktop QPU framing.

**Architecture:** Keep computation untouched. Centralize cycle-time presentation in the existing simulator-presentation module, consume it from the shared controls, and limit visual changes to copy/CSS/camera defaults.

**Tech Stack:** Next.js, React, TypeScript, Zustand, React Three Fiber, Vitest, CSS.

## Global Constraints

- Cycle time remains measured in milliseconds end to end.
- Runtime equations and URL parameter meanings do not change.
- Mobile QPU framing does not change.
- Existing untracked user work is not modified.

---

### Task 1: Consistent cycle-time display

**Files:**
- Modify: `viewer/src/lib/simulator-presentation.ts`
- Modify: `viewer/src/lib/__tests__/simulator-presentation.test.ts`
- Modify: `viewer/src/components/Simulator/CoreControls.tsx`

- [ ] Add failing tests asserting `formatMilliseconds(0.001) === "0.001"`, `formatMilliseconds(1) === "1"`, and `formatMilliseconds(1.25) === "1.25"`.
- [ ] Run the focused test and verify it fails because `formatMilliseconds` is missing.
- [ ] Implement the formatter and use it for the Cycle time readout.
- [ ] Run the focused test and verify it passes.

### Task 2: Honest feasibility summary

**Files:**
- Modify: `viewer/src/lib/simulator-presentation.ts`
- Modify: `viewer/src/lib/__tests__/simulator-presentation.test.ts`
- Modify: `viewer/src/components/Simulator/FeasibilityStrip.tsx`

- [ ] Add failing tests for `Budget non-binding` at extreme headroom and `2.0× headroom` near the boundary.
- [ ] Run the focused test and verify the new expectation fails.
- [ ] Add a compact status label while preserving the exact ratio in the expanded explanation.
- [ ] Rename the UI label to `Modeled constraint` and verify the focused tests pass.

### Task 3: First-read context and desktop scene polish

**Files:**
- Modify: `viewer/src/components/Simulator/MobileSimulator.tsx`
- Modify: `viewer/src/components/Scene/Viewport.tsx`
- Modify: `viewer/src/components/Scene/CameraRig.tsx`
- Modify: `viewer/src/components/Scene/AtomCloud.tsx`
- Modify: `viewer/src/app/globals.css`
- Modify: `viewer/src/ui-contract/__tests__/public-experience.test.ts`

- [ ] Add failing contract assertions for the mobile orientation sentence, distinct desktop camera coordinates, and increased desktop atom visibility.
- [ ] Run the contract test and verify it fails on the missing behavior.
- [ ] Add the orientation sentence, bring only the desktop camera closer, and raise desktop dot/emissive contrast without altering mobile performance settings.
- [ ] Run the contract and full suites, then verify responsive screenshots.

### Task 4: Release

**Files:**
- Generated: `viewer/out/**`
- Generated in portfolio repository: `oratomic/**`

- [ ] Run lint, full tests, TypeScript, `build:pages`, and `build:site`.
- [ ] Merge to `main`, push source and GitHub Pages, sync the portfolio export, and push it.
- [ ] Verify both live URLs at desktop and phone dimensions with no runtime errors.
