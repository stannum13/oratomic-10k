# IonQ Application Visualization Release

**Date:** 2026-09-09  
**Status:** Approved direction, pending written-spec review

## Objective

Publish the existing Oratomic 10k viewer as a credible, self-contained example of an interactive data visualization for an IonQ job application. A reviewer should understand within seconds what can be manipulated, see the outputs react, inspect the scientific basis and assumptions, and open a stable public URL without setup.

## Chosen approach

Polish and release the existing viewer. This preserves the strongest proof of work: the symbolic architecture model, live controls, parameter sweeps, configuration comparison, LP code construction, and synchronized 3D scene.

Two alternatives were considered:

1. Build a narrow standalone chart. This would be quicker to explain, but it would discard most of the project's technical depth.
2. Redesign the project as a broad portfolio case study. This could improve storytelling, but would add scope and delay the application.

The focused release is the best balance of polish, credibility, and speed.

## Reviewer experience

The default page opens in a release-ready state with a short, visible introduction that explains:

- what the visualization models;
- which controls to try first;
- which outputs update in response;
- that the project was personally built by the applicant;
- the source paper and the distinction between paper-derived values, fitted projections, and illustrative cross-platform estimates.

The primary path is:

1. Open the public URL.
2. Read a compact orientation prompt.
3. Enter Simulate mode or follow a direct call to action.
4. Change physical error rate, cycle time, architecture, or target problem.
5. Observe qubit count, block error, feasibility, runtime, 3D allocation, and analysis panels update.
6. Share a configuration-specific URL or inspect methodology and sources.

The full paper-reading experience remains available, but the application reviewer does not need to complete it before finding the interactive controls.

## Interface changes

### Release introduction

Add a compact project-introduction surface near the opening view. It will identify the artifact as an interactive architecture explorer based on the Oratomic paper and offer one clear action such as “Explore the simulator.” It should also point to a brief methodology/source note.

The introduction will avoid unsupported claims about authorship or affiliation. Applicant attribution will use repository-provided identity if one is already present; otherwise it will use neutral wording such as “Independent interactive implementation.”

### Responsive behavior

Desktop retains the split reader/simulator and 3D viewport. On narrow screens, content becomes a single readable column with an explicit switch between controls and the 3D view. Header controls wrap or collapse without horizontal overflow. The status bar remains readable and can scroll horizontally only within its own bounded region if necessary.

### Scientific provenance

Add a concise methodology/source panel that classifies values as:

- reproduced or derived from the Oratomic paper;
- extrapolated from the paper's stated power-law fits;
- interactive model assumptions;
- external or illustrative estimates.

Cross-platform comparisons, especially IonQ values currently described in code as unpublished estimates, must show that qualification in the interface. If a claim cannot be traced to a reliable source or clearly labeled assumption, it will be removed from the public release.

### Sharing

Shared URLs will validate all numeric and enumerated parameters before applying them. The Share action will handle clipboard failures and provide visible feedback. A copied link must reopen the same meaningful configuration in Simulate mode.

## Architecture and data flow

The Next.js application remains a static export. No backend is required for the public demonstration.

User input flows through the Zustand simulator store into the symbolic compute engine. Derived results update the status bar, analysis panels, and scene. URL encoding reads the same store state; URL decoding validates values before invoking store setters. Source and assumption metadata is kept in a small typed module or static data file so labels are consistent wherever numbers appear.

Optional local MLX compute remains visibly optional and does not connect automatically. The public experience must work fully without the local WebSocket service.

Deployment uses GitHub Pages from the public repository through a GitHub Actions workflow. The Next.js export must receive the repository base path in CI while retaining root-path behavior during local development. The workflow builds `viewer/out`, uploads it as a Pages artifact, and deploys it on pushes to `main` plus manual dispatches.

## Error handling

- Invalid or non-finite URL values are ignored and defaults remain intact.
- Clipboard failure leaves the page usable and shows a direct copy fallback or clear error state.
- WebGL failure uses the existing 3D error boundary while preserving controls and computed results.
- Unsupported small-screen layouts show a clear controls/scene switch.
- Optional MLX connection failure affects only the MLX panel.

## Release quality bar

The public release is complete when:

- the static production build succeeds;
- engine tests pass;
- release-touched code introduces no lint failures;
- the full lint backlog is either fixed or explicitly limited to non-release legacy code, with all React correctness errors on the main experience fixed;
- the main interaction works at desktop and 390px mobile widths without page-level horizontal overflow;
- a shared configuration round-trips through a fresh page load;
- visible claims and estimates have source or assumption labels;
- no uncaught page errors appear during the primary interaction;
- the GitHub Pages URL returns the application and is tested from the deployed origin.

## Testing

Add focused unit coverage for URL validation and any new source metadata helpers. Use browser tests for the reviewer path, responsive layout, configuration sharing, and the WebGL fallback boundary where practical. Run the existing engine suite, lint, and production build. After deployment, repeat the primary browser interaction against the public URL and verify that asset paths and reloads work under the repository subpath.

## Scope boundaries

This release does not add new simulation models, a backend service, authentication, analytics, or a portfolio-site redesign. Existing experimental panels may remain when clearly labeled, but inaccurate or unqualified public claims will be corrected or removed. Unrelated user work currently present in untracked scene/widget files is outside this release and will be preserved.

## Application submission copy

Once the deployment is verified, prepare a short response for the application field consisting of the public link and one sentence describing the manipulable parameters and live outputs. The response will state personal authorship only after the applicant confirms the preferred name/credit wording.
