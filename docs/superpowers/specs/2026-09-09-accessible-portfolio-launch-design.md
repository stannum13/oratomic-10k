# Accessible Simulator and Portfolio Launch Design

## Goal

Ship the complete Oratomic simulator as a fast, readable, keyboard-accessible portfolio artifact that opens through `shivanknigam.com` and provides the same public experience on Windows, Linux, and macOS.

## Scope

This release changes two repositories:

- `stannum13/oratomic-10k` owns the simulator, its accessibility improvements, and its GitHub Pages deployment.
- `stannum13/shivanknigam.com` owns the portfolio entry and full-screen launcher. It remains a single-file static site deployed through Cloudflare Pages.

No new domain, paid hosting service, reverse proxy, or framework migration is required.

## Simulator Information Architecture

The complete simulator remains available; no scientific controls or analysis views are reduced to a teaser. Simulate mode receives a short, persistent orientation block that presents the workflow as:

1. Choose a platform or preset.
2. Tune the physical and architectural parameters.
3. Observe feasibility, qubit allocation, error, and runtime changes.
4. Pin or compare configurations when useful.

Primary outputs remain visible above the accordion. The controls must make their expanded state, tunable purpose, and relationship to the live scene apparent without requiring prior familiarity with the project.

## Readability and Accessibility

The dark and light themes will define every semantic color token consumed by components. Text, controls, focus indicators, and meaningful boundaries will target WCAG 2.2 AA contrast. Body and control copy will not rely on the current 8–9 px labels; secondary copy will use a readable minimum size, while decorative text may remain visually subdued only when it conveys no required information.

Accordion triggers will expose `aria-expanded` and `aria-controls`, use stable panel IDs, retain visible keyboard focus, and have comfortable pointer targets. Icon-only controls will have accessible names. Motion will continue to respect `prefers-reduced-motion`.

The 3D view will use higher-contrast substrate edges and zone markings. Zone names and counts will appear in compact, opaque or strongly translucent HTML badges so they remain legible over geometry. A visible hint will identify rotate, pan, and zoom interaction. Labels must not depend on color alone to communicate zone identity or state.

## Public Platform Parity

The public viewer will remove the MLX connection indicator and MLX control panel. It will not attempt to discover or connect to a localhost MLX service, and the public documentation will not advertise MLX as part of the shipped experience. Browser-native code construction and the rest of the simulator remain unchanged.

The existing backend source may remain in the repository as dormant research code, but it must not be imported by the public application path. A tracked follow-up note will describe reintroducing optional acceleration through capability detection and a platform-neutral backend interface that can select an available implementation on macOS, Windows, or Linux.

## Portfolio Launch Experience

The portfolio will add Oratomic as an interactive project with a clear `Open interactive simulator` action. Activating it opens a full-viewport accessible dialog containing the complete GitHub Pages application in a lazily created iframe. The dialog will include:

- A visible title and short context sentence.
- A loading state while the simulator initializes.
- A prominent close button and Escape-key support.
- Focus placement on open and restoration to the invoking control on close.
- Background scroll locking while open.
- A direct `Open in new tab` fallback.
- An iframe `title` and a conservative `allow` policy.

The iframe source will not be requested until the visitor explicitly opens the simulator. Closing the dialog removes or clears the iframe so the homepage does not retain the WebGL workload. A failed or slow embed cannot trap the visitor; the direct link remains usable.

GitHub Pages currently permits framing this application because it sends no `X-Frame-Options` or restrictive `frame-ancestors` header. The direct link remains the resilience path if that hosting policy changes.

## Data Flow and Deployment

The portfolio launcher passes no private data to the simulator. The simulator remains a static client-side application, and shareable configuration state continues to live in its URL query parameters.

Changes to `oratomic-10k` are built with its Pages base path and published to the existing `gh-pages` deployment. Changes to `shivanknigam.com` are pushed to its default branch for the existing Cloudflare Pages integration to deploy. The public entry URL remains `https://www.shivanknigam.com`; the embedded application remains `https://stannum13.github.io/oratomic-10k/`.

## Failure Handling

- If WebGL initialization fails, the simulator retains its existing error boundary and presents a readable unavailable state.
- If the iframe is slow, the launcher continues to show a loading message and direct-link fallback.
- If the iframe cannot be displayed, the new-tab action still opens the simulator directly.
- Unsupported platform acceleration is not exposed in this release, preventing a macOS-only affordance from appearing broken elsewhere.

## Verification

Implementation will use test-first changes where behavior is testable. Verification must include:

- Tests that required semantic design tokens exist in both themes.
- Component or source-level assertions that the public UI has no MLX entry point.
- Accessibility checks for accordion state, launcher dialog semantics, keyboard close, focus restoration, and iframe title.
- Regression tests for existing URL sharing and simulator computation.
- Production lint, test, and Pages builds for the simulator.
- The portfolio repository's existing static-site checks.
- Browser verification at representative desktop and mobile widths, including interaction with controls, the 3D scene, launcher open/close, and the direct-link fallback.
- Post-deployment HTTP and browser checks against both public sites.

## Non-Goals

- Rewriting the portfolio in React or another framework.
- Moving the simulator deployment away from GitHub Pages.
- Creating a new domain or Cloudflare Worker reverse proxy.
- Generalizing hardware acceleration in this release.
- Reworking the scientific model or adding new simulation features.
