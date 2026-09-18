# Simulator Trust Polish

## Goal

Remove the cycle-time unit contradiction and make the simulator's first-read claims easier to interpret without changing the numerical model.

## Decisions

- Cycle time remains stored and edited in milliseconds. Both the formatted readout and numeric input show the same millisecond value; `0.001` is displayed as `0.001 ms`.
- The feasibility summary no longer calls the reliable-operation budget the “closest constraint.” It describes whether that modeled budget is binding. Exact headroom remains available in the expandable detail, while the collapsed strip uses `Budget non-binding` when headroom is enormous.
- Mobile gets one short sentence between the header and metrics: the three values are an estimate for the selected workload and assumptions. This preserves the metrics-first hierarchy while supplying context.
- Desktop QPU framing moves modestly closer and increases scene contrast. Mobile framing remains unchanged.

## Testing

- Add a shared millisecond formatter with numerical unit tests.
- Extend UI contract tests for the new copy and desktop/mobile camera split.
- Run the full test suite, lint, TypeScript, production builds, and live browser checks before deployment.

## Non-goals

- No changes to the runtime equations, URL parameter semantics, scenario presets, or supported architectures.
- No claim that the reliable-operation budget represents every engineering bottleneck.
