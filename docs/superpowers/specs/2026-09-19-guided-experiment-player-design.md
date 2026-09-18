# Guided Experiment Player — Design

## Goal

Make the simulator understandable on first contact by replacing the default dense dashboard with a guided, interactive experiment. The experience should answer one question:

> Can a proposed fault-tolerant quantum-computer architecture execute a useful workload under these physical assumptions, and what becomes the bottleneck first?

The guide must work as a coherent two-to-three-minute journey on desktop and mobile, while preserving the complete simulator as an immediately available Explore mode.

## Product truth

The product is an architecture-level resource and feasibility estimator, not a quantum-state emulator and not a gate-by-gate execution of Shor's algorithm.

The current numerical engine models the Oratomic/qLDPC proposal most completely. Walking Cat and Surface Code provide hardware profiles and illustrative comparison estimates; they are not equally complete architecture-specific numerical engines. Guided and Explore modes must label that difference explicitly.

## Compatibility

- Keep the public paths `/oratomic/` and `/oratomic-10k/` unchanged.
- A bare entry URL opens Guided mode.
- Existing parameterized links without guide state continue to open Explore mode and retain their configuration. This protects previously shared job-application links.
- Newly shared links encode the selected architecture and whether the visitor is in Guided or Explore mode.
- The visitor can move between Guided and Explore modes without losing the current configuration.

## Experience principles

1. Every screen has one question, one emphasized result, and one recommended action.
2. Guided mode reveals only the controls and explanations needed by the current chapter.
3. Visual changes always have a text caption and a numerical consequence.
4. Manual interaction pauses playback; the guide never fights the visitor.
5. “Feasible” always means “clears the modeled constraints,” not “demonstrated in hardware.”
6. Modeled, fitted, assumed, and illustrative values remain visibly distinct.
7. The experience never traps page scrolling or browser navigation.

## Entry and playback

First-time visitors see a short opening card:

> **Can this machine do useful work?**
>
> Run one fault-tolerant workload through the qubits, noise, sensing, decoding, and feedback that determine whether it finishes.
>
> Architecture explorer and resource estimator — not a quantum emulator.

The primary action is **Start guided experiment**. Starting begins autoplay. No audio plays. A persistent **Explore freely** action enters the existing full simulator.

Playback provides:

- Back, Play/Pause, and Next controls;
- six named chapters rather than anonymous progress dots;
- restart and exit actions;
- a text caption for the current animated change;
- local progress restoration on the same device;
- URL state for explicitly shared guide chapters;
- automatic pause when the tab is hidden, reduced motion is requested, or the visitor edits a control.

Autoplay pauses at decision beats that require a visitor action. It never advances while focus is inside an interactive control. Returning from Explore resumes at the last guide chapter only when the visitor explicitly chooses **Return to guide**.

## Responsive composition

### Desktop

- Header: architecture identity, Guided/Explore segmented control, share/overflow actions.
- Left story rail: chapter question, concise explanation, one active interaction, and player controls.
- Main stage: synchronized QPU, allocation, noise, or PHY visualization.
- Bottom result strip: physical qubits, logical block error, runtime, and modeled feasibility.
- Named chapter timeline remains visible without covering the visualization.

### Mobile

- Sticky compact header: architecture identity and Guided/Explore control.
- One focused story card: current question, explanation, and active interaction.
- One primary numerical result.
- Relevant visualization directly below, in a fixed scroll-safe frame.
- Compact sticky player: Back, Play/Pause, Next, and chapter count.
- Secondary metrics and explanation behind **See why**.

Mobile does not reproduce the desktop split pane. The scene cannot consume vertical scroll gestures. At most two labels appear on the canvas; the rest appear in an accessible list below it.

## Chapters

### 1. Frame the experiment

Question: **Can this machine do useful work?**

Use ECC-256 and the balanced Oratomic configuration as the baseline. Reveal physical qubits, logical block error, and runtime one at a time. Define each value in plain language.

Result copy:

> Under these assumptions, ECC-256 clears the modeled error budget. Runtime is the pressure point.

Action: **Build the machine**.

### 2. Allocate the physical qubits

Question: **Where do the physical qubits go?**

Fill the allocation bar, then assemble the QPU zones. Selecting memory, processor, operation, or resource highlights the same subsystem in the allocation and spatial views.

Action: inspect at least one subsystem. The guide can proceed without forcing all four.

### 3. Introduce noise

Question: **What damages the computation?**

Introduce gate, transport, idle, measurement, leakage, and correlated noise pathways. Animate a bounded physical-error-rate sweep and connect it to the logical block-error estimate and modeled feasibility boundary.

Action: **Find the error-rate cliff**. The visitor can drag the control; autoplay pauses while they do so.

The guide must not imply that every displayed noise pathway is included in the scalar numerical model. Included, approximated, and not-modeled pathways receive explicit labels.

### 4. Close the correction loop

Question: **How does the machine fight back?**

Trace sensing → analog readout → digitization → syndrome extraction → decoding → feedback. Distinguish denoising from decoding:

- Denoising improves the measured signal before or during state classification.
- Decoding infers the most likely physical error pattern from syndrome information.

Show latency and uncertainty at each stage. Highlight readout, transport, gates, or decoding as the nearest modeled timing bottleneck.

Action: inspect the binding stage.

### 5. Run the workload

Question: **Can it finish before errors win?**

Accumulate the Toffoli requirement against the modeled error budget while runtime advances. Show the constraint margin, not only a binary badge.

Action: change one assumption to recover or improve feasibility. Offer a one-click return to the guided baseline.

### 6. Compare architectures honestly

Question: **Would another architecture behave differently?**

Compare Oratomic, Walking Cat, and Surface Code by physical medium, connectivity, code family, cycle time, control stack, readout, and evidence quality.

Oratomic output is labeled **core model**. Walking Cat and Surface Code resource comparisons are labeled **illustrative estimate** until dedicated engines exist. Switching architecture updates the visible hardware/PHY story but must not silently present the Oratomic symbolic output as an architecture-specific result.

Action: select an architecture, then replay or enter Explore mode.

Final copy:

> The answer is not simply “10,000 qubits.” It depends on what those qubits can do, how reliably they can be measured and controlled, how quickly classical feedback responds, and which assumptions the estimate rests on.

## Component architecture

The guide is a presentation layer over the existing simulator store and compute engine.

### Declarative guide model

A guide-definition module owns chapter and beat data. Each beat declares:

- stable chapter and beat IDs;
- question, explanation, caption, and action copy;
- duration and whether autoplay may advance;
- relevant stage view and visual focus;
- optional parameter transition;
- evidence/provenance label;
- required visitor action, if any.

Copy and behavior should not be embedded across rendering components.

### Player controller

A focused player state machine owns:

- `intro | playing | paused | awaiting-action | complete` status;
- current chapter and beat;
- baseline configuration snapshot;
- whether the visitor modified the experiment;
- reduced-motion and document-visibility pauses;
- navigation, restart, return-to-baseline, and enter-Explore events.

The controller applies transitions through existing store actions. It does not duplicate resource calculations.

### Presentation components

- `GuidedExperience`: chooses responsive composition and coordinates player/state.
- `GuidedHeader`: architecture identity plus Guided/Explore switch.
- `StoryCard`: current question, explanation, provenance, and action.
- `ChapterTimeline`: named progress and direct chapter navigation.
- `PlayerControls`: accessible playback and navigation controls.
- `GuidedStage`: selects allocation, QPU, noise, PHY loop, workload, or comparison presentation.
- `PrimaryResult`: one chapter-specific result with a definition and live region.
- `ExperimentChanged`: explains that manual input paused playback and offers continue or restore.

Desktop and mobile use the same semantic component order. CSS changes placement so keyboard and screen-reader order remains predictable.

## State and URL flow

- Bare URL: Guided intro with default baseline.
- Legacy URL containing simulator parameters but no `experience` value: Explore mode with decoded configuration.
- New Guided share URL: `experience=guided&chapter=<id>&platform=<id>` plus relevant configuration.
- New Explore share URL: `experience=explore` plus the complete configuration.
- Invalid guide state falls back to the intro without discarding valid simulator parameters.
- Local progress is subordinate to explicit URL state.

The baseline snapshot is captured when the guide starts. A manual change marks the experiment as modified and pauses the player. Restoring the baseline uses the public simulator actions so computed output stays consistent.

## Accessibility and interaction

- Minimum 44px controls.
- Buttons have visible text or accessible names; Play and Pause expose the current action.
- Chapter changes move focus to the chapter heading only for explicit Back/Next navigation, not during autoplay.
- Metric updates use restrained `aria-live="polite"` announcements.
- Autoplay stops when reduced motion is enabled; the visitor advances discrete beats manually.
- Animated color is never the only indicator; labels, patterns, and captions carry the same meaning.
- All canvas information needed to understand a chapter is repeated in HTML.
- Escape pauses playback; Space toggles playback unless focus is inside an input.

## Error handling and resilience

- If WebGL fails, the allocation bar, subsystem list, captions, and PHY diagram preserve the complete conceptual journey.
- If local storage is unavailable, the session works without persistence.
- If a guide transition cannot apply an expected parameter, pause with a recoverable message and retain the current configuration.
- Timers are cancelled on navigation, unmount, document hide, and manual interaction.
- A late dynamic import cannot advance a stale beat.

## Performance

- Add no animation framework dependency.
- Reuse the existing Three.js stage and device-pixel-ratio caps.
- Pause rendering while the canvas is off-screen or the document is hidden.
- Animate store parameters at a bounded cadence rather than recomputing every animation frame.
- Load Explore-only advanced panels only after the visitor enters Explore mode.

## Testing and release gates

### Unit tests

- player state transitions and chapter bounds;
- autoplay pause/resume and timer cleanup;
- manual-edit detection and baseline restoration;
- reduced-motion and visibility behavior;
- legacy and new URL decoding;
- evidence labels for architecture comparison.

### Component and contract tests

- one primary question and result per chapter;
- accessible player labels and focus behavior;
- responsive component order;
- fallback content without the canvas;
- Guided/Explore switching preserves configuration.

### Browser tests

- complete desktop journey;
- complete 390px mobile journey without horizontal overflow or scroll trapping;
- manual edit pauses autoplay;
- old job-application links open Explore with the same values;
- bare portfolio and GitHub Pages links open Guided mode;
- explicit architecture links show the correct identity and evidence label.

### Deployment

Run the full test suite, lint, TypeScript, both static builds, and local browser checks. Publish source `main`, GitHub Pages `/oratomic-10k/`, and the portfolio `/oratomic/` export. Verify all three public entry paths and an existing legacy parameterized link before reporting completion.

## Deferred work

- Architecture-specific numerical engines for Walking Cat and Surface Code.
- Audio narration.
- User-authored tours.
- Server-side analytics or saved accounts.
- Automatic claims about hardware feasibility beyond the model's stated evidence.
