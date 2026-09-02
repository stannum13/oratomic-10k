# Design & Motion Audit — Summary

## Key Metrics
- **Load time:** 297ms DOMContentLoaded, 341ms complete
- **Heap:** 29.4MB (healthy)
- **Console errors:** 0
- **Console warnings:** 5 (THREE.Clock deprecation, GPU ReadPixels stall)
- **Runtime:** 264 days for balanced ECC-256 — matches paper

## Findings

| Severity | Area | Finding | Source | Fix |
|---|---|---|---|---|
| Major | Color | 39 hardcoded hue values in chrome files (MLXPanel, ParameterSweep, SensitivityPanel, Math.tsx). Design brief says interface has no hue. | agent3-emission.md | Replace all with `var(--text-*)` or `var(--border)` tokens |
| Major | Color | GateArcs.tsx uses old zone colors (#4fc3f7, #ffa726, #f06292) — should use emission wavelengths or grayscale | GateArcs.tsx:71-85 | Change to `#E8EAED` or emission tokens |
| Major | Color | Apparatus.tsx:52 uses `#1a2a3a` (blue tint) for vacuum chamber | Apparatus.tsx:52 | Change to grayscale |
| Major | Data | KaTeX code params render raw LaTeX alongside formatted version in status bar: `[[4,350,1,224,≤20]]` appears 3 times | agent5-data.md | Fix CodeParams component — likely rendering both raw and formatted |
| Minor | Geometry | Watermark measured at 686×26 — looks like it's rendering at a single text line height, may not match the 72px intended size | agent4-geometry.md | Verify watermark CSS font-size |
| Minor | Runtime | THREE.Clock deprecation warning | console.log | Replace with THREE.Timer |
| Minor | Runtime | GPU stall on ReadPixels (4 occurrences) — caused by Playwright screenshot capture, not a product issue | console.log | No fix needed |
| Minor | A11y | Agent 6 timed out — sliders may have interaction issues at scale | test timeout | Manual verification needed |
| Info | Perf | 29.4MB heap after 15s simulate — no leak detected | agent7-health.md | No action |

## Color Violations (39 instances in chrome)

The design brief states: "Austere everywhere. Atmospheric only inside the viewport."

**Worst offenders:**
1. `MLXPanel.tsx` — 27 hardcoded hex colors (#00d4ff, #6366f1, #22c55e, #ef4444, #ff8a00, #eab308). These are zone/accent colors being used as button backgrounds and status indicators in the UI chrome.
2. `ParameterSweep.tsx` — 5 hex colors in SVG strokes/fills (#6366f1, #22c55e, #f87171, #5a5a5a)
3. `SensitivityPanel.tsx` — 2 hex colors (#ef4444, #22c55e) for elasticity bar fills
4. `Math.tsx:45` — `#6366f1` used as a className on CodeParams (indigo accent on math notation)

**Fix:** Replace all chrome hues with:
- Status colors → `var(--status-ok)`, `var(--status-fail)`, `var(--status-stall)`
- Accent → remove, use `var(--text-primary)` or `var(--text-secondary)`
- SVG strokes → `var(--text-tertiary)` or `var(--border)`

## Scene Color Violations (11 instances)

- `GateArcs.tsx` uses old palette colors (#4fc3f7, #ffa726, #f06292) — should be emission wavelengths or white
- `Apparatus.tsx` vacuum chamber uses blue-tinted gray #1a2a3a — should be neutral gray
- `EmissionLayer.tsx` and `EmissionLegend.tsx` correctly use emission tokens — these are fine

## Data Consistency

- **Runtime now correct:** 264 days for balanced ECC-256 matches paper
- **KaTeX triple-render bug:** Status bar shows code params formatted three ways — raw LaTeX, rendered KaTeX, and plain text brackets all visible simultaneously
- **Qubit count:** "12.0k" in QuickStats — consistent (no conflicting values found)

## What Could Not Be Tested

- **Agent 1 (Static capture):** Timed out during tab switching — only captured 3 of 7 tabs in Read mode
- **Agent 2 (Motion capture):** Not implemented in this run — would require video frame extraction
- **Agent 6 (A11y):** Timed out during slider interaction — slider track rendering not verified programmatically
- **Agent 8 (Prose-scene binding):** Timed out at section 3 — only captured 3 of 7 scroll positions

## Top 10 Fixes by Impact

1. **Strip all hue from MLXPanel.tsx** — 27 color violations in one file. Replace with CSS variable tokens. (S, high impact)
2. **Fix KaTeX CodeParams triple-render** in StatusBar — shows raw LaTeX. (S, high impact)
3. **Replace GateArcs colors** with emission wavelengths or white. (S, medium impact)
4. **Strip hue from ParameterSweep SVG** — use grayscale strokes. (S, medium impact)
5. **Strip hue from SensitivityPanel** — elasticity bars should be grayscale. (S, medium impact)
6. **Fix vacuum chamber color** in Apparatus.tsx:52 — use neutral gray. (S, low effort)
7. **Remove indigo from Math.tsx CodeParams** — math notation should be `var(--text-primary)`. (S, low effort)
8. **Verify watermark renders at 72px** — measured as 26px height suggests CSS issue. (S, low effort)
9. **Replace THREE.Clock** with THREE.Timer to suppress deprecation warning. (S, trivial)
10. **Add timeout resilience to scroll-driven tests** — Agent 8 fails at section 3. (M, testing infrastructure)
