# Guided Experiment Player Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a default guided experiment that leads desktop and mobile visitors through workload, allocation, noise, feedback, feasibility, and honest architecture comparison while preserving the full simulator and all legacy shared links.

**Architecture:** Add a pure declarative guide model and reducer, then place a responsive `GuidedExperience` presentation layer over the existing Zustand simulator and compute engine. Extract the dense PHY lists into reusable interactive explainers shared by Guided and Explore modes; keep numerical calculations in the existing engine and label cross-platform estimates by evidence quality.

**Tech Stack:** Next.js 16 static export, React 19, TypeScript, Zustand 5, Three.js/react-three-fiber, Vitest, CSS media queries, Playwright for release verification.

## Global Constraints

- Keep `/oratomic/` and `/oratomic-10k/` unchanged.
- Bare URLs open Guided mode; legacy parameterized URLs without `experience` open Explore mode with their values preserved.
- The current numerical engine remains the Oratomic/qLDPC core model. Walking Cat and Surface Code values are visibly labeled illustrative.
- No audio, no new animation dependency, and no server dependency.
- Every guide screen has one primary question, one emphasized result, and one recommended action.
- Manual interaction pauses playback; reduced-motion visitors advance discrete steps manually.
- Canvas-only information is repeated in HTML, controls are at least 44px, and mobile scrolling is never trapped.
- Preserve unrelated untracked work in `.next/`, `viewer/src/components/Scene/PlatformGeometry.tsx`, and `viewer/src/components/Widget/`.

---

### Task 1: Experience URL compatibility

**Files:**
- Modify: `viewer/src/lib/url-state.ts`
- Modify: `viewer/src/lib/__tests__/url-state.test.ts`

**Interfaces:**
- Produces: `ExperienceMode`, `GuideChapterId`, optional `experience` and `chapter` fields on `ShareableConfig`, and `resolveInitialExperience(search: string): ExperienceMode`.
- Consumes: the existing validated simulator query fields.

- [ ] **Step 1: Write failing URL-state tests**

Add tests asserting:

```ts
expect(resolveInitialExperience("")).toBe("guided");
expect(resolveInitialExperience("?p=0.001&a=balanced")).toBe("explore");
expect(resolveInitialExperience("?experience=guided&chapter=noise&p=0.001")).toBe("guided");
expect(decodeConfig("?experience=guided&chapter=noise")).toMatchObject({
  experience: "guided",
  chapter: "noise",
});
expect(decodeConfig("?experience=guided&chapter=unknown")).toEqual({ experience: "guided" });
```

Update the complete encode/decode fixture to include `experience: "explore"` and verify old fixtures still decode without it.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `cd viewer && npm test -- --run src/lib/__tests__/url-state.test.ts`

Expected: FAIL because the new types and resolver do not exist.

- [ ] **Step 3: Implement experience-aware URL state**

Add:

```ts
export type ExperienceMode = "guided" | "explore";
export type GuideChapterId = "frame" | "allocate" | "noise" | "feedback" | "workload" | "compare";

const GUIDE_CHAPTERS: GuideChapterId[] = ["frame", "allocate", "noise", "feedback", "workload", "compare"];

export function resolveInitialExperience(search: string): ExperienceMode {
  const params = new URLSearchParams(search);
  const explicit = params.get("experience");
  if (explicit === "guided" || explicit === "explore") return explicit;
  const legacyFields = ["p", "t", "a", "prob", "mem", "proc", "platform"];
  return legacyFields.some((field) => params.has(field)) ? "explore" : "guided";
}
```

Encode optional experience/chapter fields, validate both during decode, and keep unknown values out of the returned object.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `cd viewer && npm test -- --run src/lib/__tests__/url-state.test.ts`

Expected: all URL-state tests PASS.

- [ ] **Step 5: Commit**

```bash
git add viewer/src/lib/url-state.ts viewer/src/lib/__tests__/url-state.test.ts
git commit -m "feat: preserve guided and legacy simulator links"
```

### Task 2: Declarative guide model and player reducer

**Files:**
- Create: `viewer/src/lib/guided-experience.ts`
- Create: `viewer/src/lib/guide-player.ts`
- Create: `viewer/src/lib/__tests__/guide-player.test.ts`

**Interfaces:**
- Produces: `GUIDE_CHAPTERS`, `GuideChapter`, `GuideBeat`, `GuidePlayerState`, `GuidePlayerEvent`, `createGuidePlayerState`, `reduceGuidePlayer`, and `getCurrentBeat`.
- Consumes: `GuideChapterId` from `url-state.ts`.

- [ ] **Step 1: Write reducer tests first**

Cover intro start, autoplay tick, decision-beat pause, manual edit, next/back bounds, restart, complete, and reduced-motion start:

```ts
it("pauses when the visitor changes the experiment", () => {
  const playing = { ...createGuidePlayerState(), status: "playing" as const };
  expect(reduceGuidePlayer(playing, { type: "MANUAL_EDIT" })).toMatchObject({
    status: "paused",
    modified: true,
  });
});

it("does not autoplay for reduced-motion visitors", () => {
  expect(reduceGuidePlayer(createGuidePlayerState(), { type: "START", reducedMotion: true }).status)
    .toBe("paused");
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `cd viewer && npm test -- --run src/lib/__tests__/guide-player.test.ts`

Expected: FAIL because the guide model and reducer do not exist.

- [ ] **Step 3: Define the six chapters and their beats**

Each `GuideBeat` must include:

```ts
export interface GuideBeat {
  id: string;
  question: string;
  title: string;
  explanation: string;
  caption: string;
  actionLabel: string;
  durationMs: number;
  stage: "metrics" | "allocation" | "noise" | "feedback" | "workload" | "comparison";
  provenance: "Core model" | "Paper-derived" | "Model assumption" | "Illustrative estimate";
  awaitAction?: boolean;
  focusId?: string;
}
```

Use the approved copy from `docs/superpowers/specs/2026-09-19-guided-experiment-player-design.md`. Decision beats are allocation inspection, the error-rate cliff, binding feedback stage, feasibility recovery, and architecture selection.

- [ ] **Step 4: Implement the pure player reducer**

Use reducer events:

```ts
type GuidePlayerEvent =
  | { type: "START"; reducedMotion: boolean }
  | { type: "PLAY" }
  | { type: "PAUSE" }
  | { type: "TICK" }
  | { type: "NEXT" }
  | { type: "PREVIOUS" }
  | { type: "GO_TO_CHAPTER"; chapter: GuideChapterId }
  | { type: "MANUAL_EDIT" }
  | { type: "COMPLETE_ACTION" }
  | { type: "RESTART" };
```

Clamp chapter/beat indices, stop at `awaitAction`, and mark the final beat `complete` rather than wrapping.

- [ ] **Step 5: Run tests and verify GREEN**

Run: `cd viewer && npm test -- --run src/lib/__tests__/guide-player.test.ts`

Expected: all player tests PASS.

- [ ] **Step 6: Commit**

```bash
git add viewer/src/lib/guided-experience.ts viewer/src/lib/guide-player.ts viewer/src/lib/__tests__/guide-player.test.ts
git commit -m "feat: define the guided FTQC experiment"
```

### Task 3: Interactive PHY explainers for the dense sections

**Files:**
- Create: `viewer/src/components/Scene/SystemConcepts.tsx`
- Modify: `viewer/src/components/Scene/QpuSystemView.tsx`
- Modify: `viewer/src/lib/qpu-state.ts`
- Modify: `viewer/src/lib/__tests__/qpu-state.test.ts`
- Modify: `viewer/src/ui-contract/__tests__/public-experience.test.ts`

**Interfaces:**
- Produces: `SignalFlowExplorer`, `NoisePathwaysExplorer`, `BottleneckExplorer`, and `ClassicalMapExplorer`.
- Consumes: `QpuProfile`, `QpuStateSummary`, optional `focusId`, `compact`, and selection callbacks.

- [ ] **Step 1: Write failing state and contract tests**

Add a derived `scopeSummary` and normalized timing fractions:

```ts
expect(state.scopeSummary).toEqual({ included: 1, notModeled: 4 });
expect(state.timingStages.reduce((sum, stage) => sum + stage.fraction, 0)).toBeCloseTo(1);
```

Add contract assertions that `QpuSystemView` imports all four explorer components and no longer maps the raw noise, bottleneck, and classical correspondence lists inline.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `cd viewer && npm test -- --run src/lib/__tests__/qpu-state.test.ts src/ui-contract/__tests__/public-experience.test.ts`

Expected: FAIL on the missing derived fields and components.

- [ ] **Step 3: Extend derived system state**

Add `fraction` to `TimingStage`, `scopeSummary` to `QpuStateSummary`, and compute fractions using the sum of positive listed latencies. Preserve `0` as “Not modeled,” not zero latency.

- [ ] **Step 4: Build the four focused explainers**

Implement:

- `SignalFlowExplorer`: one selected signal stage, a named pipeline, input/process/output explanation, and Previous/Next stage controls.
- `NoisePathwaysExplorer`: included/not-modeled summary, one selected pathway detail, scope badge, and a compact list of selectable pathways.
- `BottleneckExplorer`: proportional timing bars for listed stages, one selected detail, and a separate “system constraint” list so estimated latency is not conflated with every bottleneck.
- `ClassicalMapExplorer`: one selected quantum stage beside its classical analogy and the persistent “analogy, not equivalence” boundary.

All selectable controls use buttons with `aria-pressed`; every compact mode renders one detail rather than the full wall of cards.

- [ ] **Step 5: Refactor `QpuSystemView` to compose the explainers**

Keep the continuous Explore document and anchor navigation, but replace raw list maps with the interactive components. Retain the platform selector, source link, state explanation, glossary, and diagnostic disclaimer.

- [ ] **Step 6: Run focused tests and verify GREEN**

Run: `cd viewer && npm test -- --run src/lib/__tests__/qpu-state.test.ts src/ui-contract/__tests__/public-experience.test.ts`

Expected: focused tests PASS.

- [ ] **Step 7: Commit**

```bash
git add viewer/src/components/Scene/SystemConcepts.tsx viewer/src/components/Scene/QpuSystemView.tsx viewer/src/lib/qpu-state.ts viewer/src/lib/__tests__/qpu-state.test.ts viewer/src/ui-contract/__tests__/public-experience.test.ts
git commit -m "feat: make PHY diagnostics explorable"
```

### Task 4: Guided player UI and chapter stages

**Files:**
- Create: `viewer/src/components/Guided/PlayerControls.tsx`
- Create: `viewer/src/components/Guided/ChapterTimeline.tsx`
- Create: `viewer/src/components/Guided/GuidedStage.tsx`
- Create: `viewer/src/components/Guided/GuidedExperience.tsx`
- Create: `viewer/src/hooks/useGuidePlayer.ts`
- Modify: `viewer/src/ui-contract/__tests__/public-experience.test.ts`

**Interfaces:**
- Produces: `GuidedExperience({ qpuView, reducedMotion, initialChapter, onChapterChange })` and `useGuidePlayer`.
- Consumes: guide definitions/reducer, simulator store actions, Metrics/Allocation/Feasibility primitives, and the Task 3 PHY explainers.

- [ ] **Step 1: Write failing UI contract tests**

Assert that the new source includes:

```ts
expect(guided).toContain("Start guided experiment");
expect(guided).toContain("Architecture explorer and resource estimator");
expect(guided).toContain("not a quantum emulator");
expect(controls).toContain('aria-label={state.status === "playing" ? "Pause guided experiment" : "Play guided experiment"}');
expect(timeline).toContain('aria-label="Guided experiment chapters"');
expect(stage).toContain("Core model");
expect(stage).toContain("Illustrative estimate");
```

Also verify that manual guided controls call `markModified` before changing simulator state.

- [ ] **Step 2: Run the contract test and verify RED**

Run: `cd viewer && npm test -- --run src/ui-contract/__tests__/public-experience.test.ts`

Expected: FAIL because guided UI files do not exist.

- [ ] **Step 3: Implement `useGuidePlayer`**

Use `useReducer(reduceGuidePlayer, createGuidePlayerState(initialChapter))`. Schedule one timeout only while `status === "playing"`; clear it on state changes, unmount, `visibilitychange`, and manual input. Persist `{chapterId, beatId}` under `oratomic-guide-progress-v1`, catching storage errors. Explicit URL state overrides storage.

- [ ] **Step 4: Implement accessible navigation components**

`PlayerControls` renders 44px Back, Play/Pause, and Next buttons plus `Chapter N of 6`. `ChapterTimeline` renders all six chapter names as buttons on desktop and a current-name progress element on mobile. Back/Next explicitly focus the story heading; autoplay does not move focus.

- [ ] **Step 5: Implement chapter-specific stages**

Compose existing primitives and Task 3 explainers:

- frame: one primary feasibility sentence plus headline metrics;
- allocation: allocation bar, selectable zones, and QPU view;
- noise: compact noise explorer plus bounded physical-error slider;
- feedback: compact signal/bottleneck explorer;
- workload: Toffoli budget, runtime, and constraint margin;
- comparison: architecture selector with `Core model` or `Illustrative estimate` badge.

Manual sliders and selectors must call `markModified()`. A changed experiment renders **You changed the experiment** with **Continue from here** and **Restore guided baseline** actions.

- [ ] **Step 6: Implement the responsive guided shell**

`GuidedExperience` renders the intro until started, then semantic order: header → story card → primary result → stage → player. It accepts a validated `initialChapter` and calls `onChapterChange(chapterId)` whenever navigation changes the active chapter. Do not fork separate desktop/mobile component trees; CSS will reposition the same DOM.

- [ ] **Step 7: Run the contract test and verify GREEN**

Run: `cd viewer && npm test -- --run src/ui-contract/__tests__/public-experience.test.ts`

Expected: guided UI contract tests PASS.

- [ ] **Step 8: Commit**

```bash
git add viewer/src/components/Guided viewer/src/hooks/useGuidePlayer.ts viewer/src/ui-contract/__tests__/public-experience.test.ts
git commit -m "feat: add the guided FTQC experiment player"
```

### Task 5: Integrate Guided/Explore mode without breaking old links

**Files:**
- Modify: `viewer/src/store/simulator.ts`
- Modify: `viewer/src/components/Layout/Header.tsx`
- Modify: `viewer/src/app/page.tsx`
- Modify: `viewer/src/lib/__tests__/url-state.test.ts`
- Modify: `viewer/src/ui-contract/__tests__/public-experience.test.ts`

**Interfaces:**
- Consumes: `GuidedExperience`, `resolveInitialExperience`, decoded chapter state.
- Produces: global `experienceMode` and `setExperienceMode`, Guided/Explore header switch, and compatible share links.

- [ ] **Step 1: Write failing integration contracts**

Assert:

```ts
expect(store).toContain('experienceMode: "guided" | "explore"');
expect(header).toContain("Guided");
expect(header).toContain("Explore");
expect(page).toContain("resolveInitialExperience");
expect(page).toContain("<GuidedExperience");
expect(header).toContain("experience: state.experienceMode");
```

Keep existing assertions for platform-aware identity and legacy configuration application.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `cd viewer && npm test -- --run src/lib/__tests__/url-state.test.ts src/ui-contract/__tests__/public-experience.test.ts`

Expected: FAIL on missing experience integration.

- [ ] **Step 3: Add experience mode to the store and header**

Default the store to `guided`. Replace the primary Read/Simulate switch with Guided/Explore. Entering Explore sets the existing internal mode to `simulate`; add **Read research summary** inside the overflow menu so the paper view remains accessible.

- [ ] **Step 4: Resolve initial entry behavior in `page.tsx`**

On mount:

1. decode and apply all valid simulator fields;
2. set experience using `resolveInitialExperience(window.location.search)`;
3. keep the active guide chapter in page state, pass it to `GuidedExperience`, and receive chapter-change callbacks;
4. render Guided on both breakpoints when selected;
5. otherwise preserve the existing desktop Explore and `MobileSimulator` trees.

- [ ] **Step 5: Preserve experience state in copied links**

Add `experience: state.experienceMode` to `encodeConfig`. Pass the page's active chapter into `Header`; Guided shares include it and Explore shares omit it. Old links remain valid because the resolver treats parameterized URLs without `experience` as Explore.

- [ ] **Step 6: Run focused tests and verify GREEN**

Run: `cd viewer && npm test -- --run src/lib/__tests__/url-state.test.ts src/ui-contract/__tests__/public-experience.test.ts`

Expected: focused tests PASS.

- [ ] **Step 7: Commit**

```bash
git add viewer/src/store/simulator.ts viewer/src/components/Layout/Header.tsx viewer/src/app/page.tsx viewer/src/lib/__tests__/url-state.test.ts viewer/src/ui-contract/__tests__/public-experience.test.ts
git commit -m "feat: make guided mode the public entry experience"
```

### Task 6: Responsive hierarchy and reduced-motion behavior

**Files:**
- Modify: `viewer/src/app/globals.css`
- Modify: `viewer/src/ui-contract/__tests__/public-experience.test.ts`

**Interfaces:**
- Consumes: semantic class names from Tasks 3–5.
- Produces: desktop story-rail layout, single-column mobile chapter layout, sticky mobile player, and compact interactive PHY sections.

- [ ] **Step 1: Add failing CSS contracts**

Assert the stylesheet contains `.guided-experience`, `.guided-story`, `.guided-stage`, `.guided-player`, `.system-concept`, `@media (prefers-reduced-motion: reduce)`, and the phone rule `.guided-experience { grid-template-columns: 1fr; }`.

- [ ] **Step 2: Run contract tests and verify RED**

Run: `cd viewer && npm test -- --run src/ui-contract/__tests__/public-experience.test.ts`

Expected: FAIL on missing guided layout rules.

- [ ] **Step 3: Implement the three-level surface hierarchy**

Use existing `--surface-l0`, `--surface-l1`, and `--surface-l2` tokens. Guided desktop is a two-column grid with a 360–420px story rail and a flexible stage. Only active chapter/player actions use L2. Cap reading measure at 68 characters.

- [ ] **Step 4: Implement the mobile composition**

At `max-width: 767px`, use one column in semantic order, keep the visualization at 4:3, hide nonessential canvas labels, and fix the player above the safe-area bottom. Add bottom padding equal to the player height. No horizontally scrolling tab strip is introduced.

- [ ] **Step 5: Make PHY sections compact and interactive**

Replace the screenshot's repeated full-width rows with selectable chips/list items plus one detail surface. Timing bars communicate relative magnitude. On mobile, the signal/classical pipeline is a vertical ordered rail; desktop may use three columns without horizontal scrolling.

- [ ] **Step 6: Add motion and focus safeguards**

Disable nonessential transitions under reduced motion. Add visible `:focus-visible` states and minimum 44px targets. Do not apply `touch-action: none` outside the inset canvas interaction surface.

- [ ] **Step 7: Run contract tests and verify GREEN**

Run: `cd viewer && npm test -- --run src/ui-contract/__tests__/public-experience.test.ts`

Expected: UI contract tests PASS.

- [ ] **Step 8: Commit**

```bash
git add viewer/src/app/globals.css viewer/src/ui-contract/__tests__/public-experience.test.ts
git commit -m "style: establish guided desktop and mobile hierarchy"
```

### Task 7: Related work and expert-feedback handoff

**Files:**
- Create: `viewer/src/lib/related-work.ts`
- Create: `viewer/src/components/Guided/ReviewTheModel.tsx`
- Modify: `viewer/src/components/Guided/GuidedStage.tsx`
- Modify: `viewer/src/components/Simulator/MethodologyPanel.tsx`
- Modify: `viewer/src/ui-contract/__tests__/public-experience.test.ts`

**Interfaces:**
- Produces: `RELATED_WORK` and `ReviewTheModel`.
- Consumes: repository/methodology URLs and the comparison completion state.

- [ ] **Step 1: Write failing source/link contracts**

Verify that related work includes direct primary links for:

```ts
[
  "Microsoft Quantum Resource Estimator",
  "Qualtran",
  "Bench-Q",
  "Stim / Crumble",
  "QEC Explorer",
  "Error Correction Zoo",
]
```

Assert that `ReviewTheModel` asks for feedback on workload compilation, QEC/error fits, physical timing, decoder throughput, omitted noise, and cross-platform comparability, and links to the repository.

- [ ] **Step 2: Run the contract test and verify RED**

Run: `cd viewer && npm test -- --run src/ui-contract/__tests__/public-experience.test.ts`

Expected: FAIL because the related-work and review modules do not exist.

- [ ] **Step 3: Add sourced related-work metadata**

Each entry contains `name`, `url`, `category`, and a one-sentence `lesson`. Use only official documentation or project repositories. Position this project as a guided cross-layer systems explainer, not a replacement for algorithm compilers, circuit-level QEC simulators, or code catalogs.

- [ ] **Step 4: Build the expert-feedback completion card**

Render three actions: **Inspect methods**, **Open source**, and **Share this state**. Show a six-item “What to challenge” checklist. Add a concise related-work disclosure with external links and `rel="noreferrer"`.

- [ ] **Step 5: Add related work to methodology and final guide stage**

The Methodology panel receives a collapsed **Related tools** section. The comparison chapter renders `ReviewTheModel` after an architecture is selected.

- [ ] **Step 6: Run contract tests and verify GREEN**

Run: `cd viewer && npm test -- --run src/ui-contract/__tests__/public-experience.test.ts`

Expected: related-work and review contracts PASS.

- [ ] **Step 7: Commit**

```bash
git add viewer/src/lib/related-work.ts viewer/src/components/Guided/ReviewTheModel.tsx viewer/src/components/Guided/GuidedStage.tsx viewer/src/components/Simulator/MethodologyPanel.tsx viewer/src/ui-contract/__tests__/public-experience.test.ts
git commit -m "feat: invite expert review with related work"
```

### Task 8: Full verification, browser QA, and deployment

**Files:**
- Modify: `.worktrees/shivanknigam.com/scripts/check-site.mjs`
- Regenerate: GitHub Pages export and `.worktrees/shivanknigam.com/oratomic/`

**Interfaces:**
- Consumes: completed guided experience.
- Produces: verified public GitHub Pages and portfolio deployments.

- [ ] **Step 1: Run complete local verification**

Run from `viewer`:

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build:pages
npm run build:site
```

Expected: all tests pass, lint has no tracked-source errors, TypeScript exits 0, and both static exports succeed.

- [ ] **Step 2: Run local browser journeys**

At 1440×900 and 390×844 verify:

- bare URL opens the intro;
- Start advances and Play/Pause works;
- all six named chapters are reachable;
- manual error-rate input pauses and exposes restore/continue;
- noise, bottleneck, and classical-map explainers show one clear focus;
- Surface Code and Walking Cat show illustrative evidence labels;
- no horizontal overflow exists;
- legacy `?a=balanced&p=0.001` opens Explore with the expected values;
- reduced-motion context does not autoplay.

- [ ] **Step 3: Update portfolio deployment checks before synchronization**

Require the exported site to contain `Start guided experiment`, `Architecture explorer and resource estimator`, `Guided`, `Explore`, `Core model`, `Illustrative estimate`, and `What to challenge`. Keep existing mobile, camera, and modeled-constraint checks.

- [ ] **Step 4: Commit any verification-only changes**

```bash
git add viewer docs
git commit -m "test: cover the guided public journey"
```

Skip the commit if no tracked source changed.

- [ ] **Step 5: Merge and push source**

Fast-forward the verified feature branch into `main`, rerun `npm test` on the merged result, and push `origin/main`. Preserve the unrelated untracked scene/widget files.

- [ ] **Step 6: Publish GitHub Pages**

Build with `/oratomic-10k`, synchronize `viewer/out/` into an isolated `gh-pages` worktree, commit the generated export, and push `origin/gh-pages`.

- [ ] **Step 7: Publish the portfolio export**

Build with `/oratomic`, run:

```bash
node scripts/sync-oratomic.mjs /Users/shiva/repos/reading-papers/oratomic-10k/viewer/out
node scripts/check-site.mjs
```

in the `shivanknigam.com` repository, then commit and push its `main` branch.

- [ ] **Step 8: Verify live origins**

Use real browsers against:

- `https://www.shivanknigam.com/oratomic/`
- `https://stannum13.github.io/oratomic-10k/`
- a legacy parameterized portfolio link;
- explicit Walking Cat and Surface Code guided links.

Confirm HTTP 200, the new asset hash, correct entry mode, architecture identity, evidence label, and mobile viewport behavior before reporting completion.
