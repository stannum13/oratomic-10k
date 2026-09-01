# Scientist Review: Oratomic 10k Viewer/Simulator

**Reviewer**: Dr. Elena Vasquez, Quantum Architecture Consultant
**Date**: August 2026
**Background**: Former lead architect at [neutral-atom QC startup], designed qLDPC decoder pipelines, ran syndrome extraction on 2,000+ atom arrays, published on hardware-software codesign for fault-tolerant architectures.

---

## Executive Summary

This tool is a well-executed interactive paper viewer with a compute backbone that captures the high-level structure of the Oratomic paper. It is currently a **good demo** but not yet a **research tool**. The gap is addressable. Below I detail what's scientifically wrong, what's missing for real utility, and what would make this citable.

---

## A. What's Scientifically Wrong or Misleading

### Critical Issues

**1. The timing waterfall is fake.**
`computeTimingWaterfall()` returns fixed percentages (35/25/15/25) regardless of all inputs. This is deeply misleading. In a real neutral-atom QEC cycle:

- **Readout** duration depends on fluorescence collection time (~1ms for state-selective imaging, ~200us with cavity enhancement). It does NOT scale linearly with cycle time.
- **Transport** depends on the number of rows to rearrange, trap depth, and atom temperature. The space-efficient architecture needs more transport because it reuses processor zones.
- **Gates** are dominated by Rydberg pulse duration (~0.5-1us per CZ) multiplied by circuit depth. For qLDPC codes with weight-6 stabilizers, you need at least 6 sequential entangling gates.
- **Decode** time is the real bottleneck and should be called out as such. BP-LSD on a [[144,12,12]] code takes 10-100us per round on GPU. At 1ms cycle times, the 25% allocation is plausible. At 1us cycle times, decoding would consume 100x the cycle time -- the system would stall.

The waterfall should be computed from physical parameters, not assumed as fixed fractions.

**2. Block error rate extrapolation is oversimplified.**
The formula `blockErrorRate = a * p^b` is a phenomenological fit to Monte Carlo simulations at specific physical error rates. Extrapolating it across two orders of magnitude (p = 0.0001 to p = 0.01) using fixed coefficients is dangerous:

- Below p ~ 5e-4, the fit underestimates error rates because it doesn't capture the constant floor from correlated errors (leakage, crosstalk, cosmic rays).
- Above p ~ 3e-3, most qLDPC codes hit their pseudo-threshold and the power-law fit breaks catastrophically -- the actual block error rate approaches 0.5 while the fit still gives small numbers.
- The fit coefficients in the code (`lp20: a=1.0, b=10`) look like they come from ideal circuit-level noise. Real hardware has biased noise (Z errors dominate in neutral atoms), which changes the effective distance.

**Recommendation**: Add a validity range indicator. When p is outside [5e-4, 2e-3], display a warning that the extrapolation is unreliable. Even better, store piecewise fits or interpolation tables from the paper's actual simulation data.

**3. Qubit counts don't vary with target problem.**
`QUBIT_BREAKDOWNS` is keyed only by `architecture|memoryCode`, not by target problem. Both ECC-256 and RSA-2048 produce identical qubit breakdowns for the same architecture. This is wrong:

- RSA-2048 operates on a 2048-bit register vs ECC-256's 256-bit register. The memory zone must scale with register size.
- The paper's Table 2 (or equivalent) shows different qubit counts for different problems. The current model ignores this entirely.

**4. The Toffoli budget calculation looks inverted.**
```
toffoliBudget = Math.log(0.9) / (tauToff * Math.log(1 - blockErrorRate))
```
This computes the maximum number of Toffoli gates achievable with 90% success probability. But the variable name "budget" and its display in the status bar don't clarify whether this is the AVAILABLE budget or the REQUIRED count. When `toffoliBudget < toffoliCount`, the algorithm fails -- this critical feasibility check is never surfaced. There should be a clear pass/fail indicator.

**5. processorCode is accepted as input but never used in computation.**
The `processorCode` parameter (bb18 vs lp-proc) is wired into the UI and store but `computeArchitecture()` ignores it entirely. The processor code determines:
- The logical error rate of Toffoli factories
- The number of physical qubits per factory
- The factory throughput (Toffoli gates per cycle)

This is a load-bearing parameter that currently does nothing.

### Moderate Issues

**6. `processorD` is hardcoded.**
Line 77 of js-compute.ts: `const processorD = architectureType === "space-efficient" ? 18 : 20`. The code distance should be derived from the code parameters, not hardcoded per architecture.

**7. Time-efficient mode uses percentage-based qubit splits.**
Lines 35-38: `memory: Math.round(preset.qubits * 0.4)` etc. These percentages are made up. The paper specifies actual breakdowns for time-efficient configurations.

**8. Zone visualization caps don't match actual counts.**
`ZoneLayout.ts` caps atom counts at 6000/2000/2000/3000. When the time-efficient architecture reports 102k qubits, the visualization shows ~13k atoms. This is fine for performance but the discrepancy should be noted in the UI.

---

## B. What's Missing for Real Research Utility

### Must-Have for Research Tool Status

**1. Feasibility verdict.**
The single most important output is: "Can this configuration actually run Shor's algorithm to completion?" That means `toffoliBudget >= toffoliCount`. Display a clear green/red indicator. A researcher scanning parameter space needs to instantly see where the feasible region ends.

**2. Code parameter display.**
Show [[n, k, d]] for the selected codes. Researchers think in terms of encoding rate k/n and minimum distance d, not abstract labels like "lp20". Display the Tanner graph properties: stabilizer weight, column weight, girth.

**3. Sensitivity analysis / parameter sweep.**
Let the user sweep one parameter while fixing others and plot the output curve. Example: "How does runtime vary with physical error rate from 1e-4 to 1e-2?" This is the bread and butter of architecture exploration. A single-point calculator is useful for 5 minutes; a sweep tool is useful for a PhD.

**4. Comparison mode.**
Let the user pin a configuration and compare it side-by-side with the current one. "How much does switching from lp20 to lp24 cost in qubits and buy in error rate?" Currently the user has to remember numbers and toggle back and forth.

**5. Export / shareable URLs.**
Encode the configuration in the URL query string so researchers can share specific configurations. "Look at this parameter regime" should be a link, not a set of instructions.

**6. Algorithm-level parameters.**
The Toffoli count is a fixed lookup. Researchers need to understand:
- Windowed arithmetic parameters (window size w)
- Number of modular multiplications
- Circuit depth vs width tradeoff
- How Toffoli count changes with window size

**7. Decoder throughput modeling.**
Add a decoder throughput parameter (Toffoli gates decoded per second) and show where the decoder becomes the bottleneck. This is THE critical open problem in fault-tolerant QC and the tool should surface it.

### Nice-to-Have for Research Differentiation

**8. Noise model selector.**
Let the user choose between depolarizing, biased (Z-dominated), and circuit-level noise models. Neutral atoms have strongly biased noise (~100:1 Z:X ratio for Rydberg gates), which changes effective code distances.

**9. Atom loss / reloading overhead.**
Neutral-atom platforms lose atoms. Typical loss rates are 0.1-1% per cycle. The tool should model how many spare atoms and how much reloading time is needed. This is a uniquely neutral-atom concern that no surface-code tool handles.

**10. Connectivity map visualization.**
Show the Tanner graph of the qLDPC code overlaid on the atom array. The key insight of the Oratomic paper is that reconfigurable atom arrays can implement non-local stabilizers that would be impossible on a fixed grid. SHOW THIS. Render the actual stabilizer connectivity as edges between atoms.

**11. Magic state factory detail.**
The resource state factory is where most of the engineering complexity lives. Show the factory layout, its output rate, and how it feeds Toffoli gates to the processor zone. Currently "resource" is just a colored blob.

**12. Log-scale runtime plot.**
Show where the current configuration sits on a log-log plot of qubits vs runtime. Overlay the space/balanced/time-efficient Pareto frontier from the paper. This is the paper's key figure and the tool should let users place their own points on it.

---

## C. What Would Maximize GitHub Showcase Value (While Staying Honest)

### High Impact, Scientifically Sound

1. **Animated atom rearrangement.** Show atoms physically moving between zones during a syndrome extraction cycle. This is what makes neutral atoms DIFFERENT from superconducting qubits. Even a schematic animation (not physically accurate trajectories) would be compelling. Label it as illustrative.

2. **The "10k qubit boundary" visualization.** Draw a visual threshold line or glow effect when the total qubit count crosses 10,000. This is the paper's headline and making it visceral in the 3D view would be memorable.

3. **Preset scenario buttons.** Load the example configurations I've provided with one click. Researchers hate fiddling with sliders; they want to jump to interesting regimes and then fine-tune.

4. **Real-time Pareto frontier.** As the user adjusts parameters, show a dot moving on the qubit-vs-runtime tradeoff curve. Overlay the surface code baseline. The visual argument that qLDPC codes are 100x better than surface codes is the paper's core contribution.

5. **Comparison to other approaches.** Show where Google's surface-code estimate (4M qubits for RSA-2048) sits relative to the Oratomic result. This context is what makes the result meaningful.

### Medium Impact

6. **Syndrome extraction cycle animation.** Step through one QEC round: measure stabilizers, extract syndrome, decode, correct. Even as a 2D schematic overlay it would teach readers what's actually happening.

7. **Dark mode atom traps.** The current visualization has atoms floating in space. Show the optical tweezer array as a grid of potential wells. This grounds the visualization in physical reality.

8. **Code block structure visualization.** For the selected qLDPC code, show the parity check matrix H as a sparse matrix heatmap. Researchers can visually assess code structure.

---

## D. What Would Make This Tool Citable

For this tool to be referenced in an academic paper, it needs:

1. **Reproducible computation.** Every number displayed must be traceable to a specific equation or table in the Oratomic paper. Add a "methodology" page or info tooltips citing equation numbers.

2. **Validation against paper figures.** The tool should reproduce the key figures from the paper when given the paper's input parameters. If it doesn't (and right now it won't, due to the simplifications above), it's a demo, not a tool.

3. **Input/output logging.** Let users export a JSON or CSV of all inputs and computed outputs. "Generated using Oratomic Viewer v1.2 with parameters: ..." in a paper's methods section.

4. **Uncertainty quantification.** Display error bars or confidence ranges on extrapolated quantities. The block error rate from a power-law fit has uncertainty; showing a point estimate implies false precision.

5. **DOI or permanent versioning.** Archive releases on Zenodo for citability.

---

## Prioritized Improvement Roadmap

### Phase 1: Scientific Correctness (1-2 weeks)
- [ ] Fix timing waterfall to compute from physical parameters
- [ ] Add validity range warnings on error rate extrapolation
- [ ] Make qubit breakdowns depend on target problem
- [ ] Wire processorCode into the compute pipeline
- [ ] Add feasibility check (budget vs required Toffoli count)
- [ ] Fix time-efficient breakdown percentages to use paper values

### Phase 2: Research Utility (2-4 weeks)
- [ ] Add parameter sweep / sensitivity analysis plots
- [ ] Add comparison mode (pin + compare)
- [ ] Encode config in URL for shareability
- [ ] Add code parameter display ([[n,k,d]], rate, distance)
- [ ] Add preset scenario buttons with the example configs
- [ ] Add decoder throughput as a configurable parameter
- [ ] Add export functionality (JSON/CSV of results)

### Phase 3: Visual Impact (2-3 weeks)
- [ ] Animate atom rearrangement between zones
- [ ] Add Pareto frontier overlay (qubits vs runtime)
- [ ] Show surface-code comparison point
- [ ] Add 10k-qubit threshold visual indicator
- [ ] Add connectivity/Tanner graph visualization
- [ ] Improve atom visualization with tweezer grid structure

### Phase 4: Citability (1-2 weeks)
- [ ] Add methodology documentation with equation references
- [ ] Validate outputs against paper's tables and figures
- [ ] Add uncertainty/confidence indicators
- [ ] Add versioned releases and DOI

---

## Final Assessment

The current tool demonstrates solid engineering taste -- the split-pane layout, the Zustand store architecture, the Three.js atom visualization, and the reactive computation pipeline are all well-designed. The problem is that the compute layer is a sketch, not a model. The timing waterfall is cosmetic, the error rate extrapolation is unconstrained, and critical parameters (processor code, target problem size) don't flow through to results.

The gap between "impressive demo" and "research tool" is approximately 4-6 weeks of focused work by someone who understands both the physics and the frontend. The most impactful single change would be adding a feasibility check -- a green/red indicator showing whether the current configuration can actually complete Shor's algorithm. Everything else follows from there.

This has genuine potential. Fix the science, add sweeps and comparison, and you have something I'd actually recommend to my grad students.
