# Mobile-first simulator composition design

## Goal

Replace the compressed desktop split-pane on phones with a deliberate vertical simulator. Preserve one computation state and one set of reusable controls while allowing desktop and mobile to use different information architecture.

## Breakpoints and composition

Desktop retains a two-pane workspace. Its left content order becomes metrics, core controls, scenarios, then explainer and advanced analysis. Its right pane places the QPU/PHY selector in normal document flow above the selected visualization.

At widths up to 767px, the split-pane and pane toggle are removed. A dedicated `MobileSimulator` renders one scrolling document:

1. Sticky compact header
2. Three-metric payoff row
3. Core tuning controls
4. Expandable feasibility strip
5. Guided scenarios
6. Allocation bar
7. QPU/PHY visualization
8. Collapsed “What is this?” explainer

The mobile header shows `Oratomic / 10k` and the Read/Simulate segmented control. Theme and copy-configuration actions move into an overflow menu. Version text is omitted.

## Shared state and component boundaries

Desktop and mobile use the existing Zustand simulator store. They share small semantic components rather than duplicating numerical or interaction logic:

- `MetricsBlock` owns the three headline results.
- `CoreControls` owns workload, physical-error, and cycle-time controls.
- `ScenarioPicker` owns guided presets.
- `FeasibilityStrip` derives the binding constraint and margin.
- `AllocationBar` converts the four-zone qubit breakdown into labeled proportions.
- `VisualizationPanel` owns QPU/PHY selection and the visualization surface.
- `Runtime` formatting comes from one shared formatter.

The existing desktop `ControlPanel` composes the same primitives and adds its advanced analysis sections. `MobileSimulator` composes only the essential journey initially and exposes advanced material through the explainer rather than stacking desktop accordions above the result.

## Content hierarchy

The three headline values—qubits, block error, and runtime—are the largest type in the content pane and stay on one row on phones. Labels may wrap; numerals may not shrink. The hook becomes supporting context rather than the dominant visual object on mobile.

The control journey is grouped with visible spacing or dividers:

1. Target workload
2. Physical assumptions
3. Scenario actions
4. Result interpretation

ECC-256/RSA-2048 is a true segmented control. Physical error and cycle time are sliders paired with editable numeric inputs and visible units. Inputs use at least 16px text on mobile. The workflow strip becomes a non-interactive caption on desktop and is omitted on mobile.

`Pin for comparison` is the sole primary action. `Reset configuration` is text-only. On mobile, the primary action appears first and both actions are full width.

## Surface and type system

Only three surface levels are used:

- L0: page and visualization background
- L1: raised cards and grouped control regions
- L2: active selections and the single primary action

Borders and body text gain one contrast step. L2 is not used for passive cards. Sans-serif is used for headings, body, labels, and buttons. Monospace is limited to numerals, code notation, and the status line. Tracked uppercase is restricted to the status line.

The mobile title steps down by at least two scale positions. Body text and editable controls have a 16px floor. Every interactive target is at least 44 by 44 CSS pixels.

## Selector hierarchy

- Read/Simulate remains a segmented control in the header.
- QPU/PHY becomes an underlined text-tab pair in normal flow.
- Hardware platform remains segmented on desktop and becomes a labeled select on mobile.
- The PHY is a continuous document with anchored sections: signal loop, noise pathways, bottlenecks, and classical map.

No phone selector scrolls horizontally.

## QPU visualization

The phone canvas appears below controls, scenarios, and allocation. It uses a fixed 4:3 aspect ratio, tighter camera framing, mobile DPR capped at 1.5, and no bloom. Rendering pauses when the canvas is off-screen and unmounts outside the QPU selection.

Phone gestures are one-finger rotate and pinch zoom. Pan is disabled. A visible reset-view button restores the mobile camera. The canvas leaves touch-action scroll gutters so normal vertical scrolling does not require crossing the interactive region; the central canvas interaction area does not occupy the full card width.

Desktop framing is tightened so the zone mass fills the frame. Desktop zone labels remain perspective-anchored and gain leader lines or bounded screen placement. Phone canvas labels are limited to the two largest allocations; all four appear in the allocation legend below the stacked bar.

The wavelength legend is hidden until geometry visibly uses its wavelength and erasure colors. It is not shown merely because the QPU view is active.

All floating labels, including backlog `STALL`, clamp to safe bounds rather than overflow the frame.

## PHY visualization

The QPU/PHY selector occupies normal flow and never overlaps the heading. The PHY view is one vertical explanatory document:

1. Platform selector
2. Physical medium/control/readout overview
3. Signal and feedback loop
4. Noise pathways
5. Bottlenecks
6. Classical-computer correspondence
7. Current-state explanation
8. Terms and method boundary

Each subsection has a sticky subheading where viewport height allows. Anchor links are an optional desktop convenience, not a mobile horizontal tab strip. The underlying profile remains switchable among neutral atom, Walking Cat, and surface code.

## Allocation bar

The allocation bar is the primary proportional readout on phones. It renders memory, resource, operation, and processor as a stacked bar against total qubits, then lists each category with count and percentage. Color is backed by labels and ordering, so meaning never depends on color alone.

## Runtime consistency

One shared runtime formatter is used by headline metrics, the sticky status line, comparison surfaces, and any duplicated runtime readout. The precision rule is:

- under one day: one decimal hour
- one to 364 days: nearest whole day
- 365 days and above: one decimal year

Thus the same state always displays `6.3 hr`, never both `6 hr` and `6.3 hr`.

## Feasibility explanation

The feasibility strip is a button/disclosure, not a hover tooltip. Its collapsed state shows the badge plus the closest constraint. Expanded state shows:

- required workload Toffoli count
- reliable Toffoli budget
- margin as budget divided by requirement
- a direct explanation of which constraint is binding
- any fitted-range warning

For feasible states, margin is shown as `× headroom`. For infeasible states, it is shown as the percentage of required budget available. The language explicitly describes model output rather than hardware certainty.

The phone bottom line is sticky and contains only feasibility plus formatted runtime. The desktop bottom status removes qubits, block error, and runtime because those already appear in `MetricsBlock`; it retains feasibility, Toffoli budget, and code notation.

## Jargon and disclosures

Definitions are added for Walking Cat, why the displayed block-error target is so small, Toffoli budget, and `[[4,350, 1,224, ≤20]]`. Desktop may preview definitions on hover/focus, but every definition must also open by click. Mobile uses tap-to-expand with 44px summary targets. No information is hover-only.

The mobile “What is this?” disclosure contains the curiosity-led framing, workflow explanation, provenance summary, and primary-source links. It starts collapsed after the interactive result.

## Accessibility and error handling

- Structural headings preserve a logical outline in either composition.
- Tabs, segmented controls, disclosures, numeric inputs, and reset-view controls have explicit accessible names and state.
- Focus is never trapped by the canvas or overflow menu.
- Invalid numeric input is clamped on blur to the supported range and does not write `NaN` into simulator state.
- Reduced-motion disables camera drift and animated metric transitions.
- If WebGL fails, the allocation bar and textual QPU/PHY explanation remain available.
- Live metric announcements are grouped to prevent four competing screen-reader updates.

## Verification

Automated tests cover the shared runtime formatter, allocation proportions, feasibility margins, numeric clamping, mobile composition order, selector semantics, minimum-target CSS contracts, and removal of duplicated status values and unused legend.

Production verification covers 390×844 and 430×932 phone layouts plus desktop. Checks include no horizontal overflow, first-viewport access to metrics and controls, vertical scrolling around the canvas, camera reset, QPU/PHY switching, platform selection, disclosure interaction, consistent runtime text, bounded labels, and paused off-screen rendering.

## Deployment

Ship the shared source to `oratomic-10k/main`, publish the `/oratomic-10k` static export to `gh-pages`, rebuild the `/oratomic` export in the separate `shivanknigam.com` repository, and push its `main` branch for Cloudflare deployment. Preserve unrelated untracked scene and widget work.
