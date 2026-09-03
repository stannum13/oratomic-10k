# Oratomic 10k Architecture Viewer: Technical Review

**Reviewer**: Dr. Aria Chen, Principal Research Scientist & QEC Consultant
**Date**: September 4, 2026
**Scope**: Full codebase review of core compute, visualization, simulation, and MLX backend

---

## A. What's Genuinely Novel or Impressive

**1. Symbolic architecture modeling with autodiff for QEC resource estimation.**
The combination of a tagged-union expression tree (`expr.ts`), symbolic differentiation (`expr.ts:322-388`), and elasticity-based sensitivity analysis (`sensitivity.ts:55`) is, to my knowledge, unique among publicly available QEC tools. Neither Stim, pymatching, Lattice Surgery Compiler, nor Azure QRE provide symbolic differentiation of resource estimates with respect to hardware parameters. The elasticity computation -- `(d(cost)/d(param)) * (param/cost)` at `sensitivity.ts:55` -- is borrowed from economics but is exactly the right metric for identifying bottleneck parameters in architecture exploration. I would cite this approach.

**2. In-browser lifted product code construction.**
The `lp-code.ts` file implements the full lifted-product construction from seed exponents through ring arithmetic to binary parity check matrices, in TypeScript, runnable in a browser. The Kronecker-product structure at lines 79-141 correctly implements the tensor product construction `H_X = [A tensor I | I tensor A^dagger]`, and the ring element expansion via circulant matrices at lines 164-180 is correct. This is not trivial to get right and I have not seen another browser-based implementation.

**3. The polynomial ring implementation is clean and correct.**
`polynomial-ring.ts` implements `F_2[x]/(x^l + 1)` using bigint bit-vectors. The `shift` method (line 37-44) correctly wraps `x^l = 1` (since `x^l + 1 = 0` in `F_2`, i.e., `x^l = -1 = 1`). The `transpose` method (line 47-56) correctly maps `p(x) -> p(x^{-1})` via `x^i -> x^{l-i}`. This is a well-engineered piece of algebraic code.

**4. The motion system's "time telescope" concept.**
`motion.ts:60-67` defines scale stops from gate-level (10^-6 rate) through algorithm-level (10^9 rate), with per-layer visibility that transitions between frozen/discrete/blurring/shimmer modes (`motion.ts:69-82`). This is a genuinely thoughtful approach to the multi-scale visualization problem in QEC. The idea that at algorithm scale the code layer appears as a "shimmer" while individual gates are invisible is physically appropriate and pedagogically effective.

**5. The producer/consumer magic state scheduler.**
`motion.ts:116-162` implements a discrete-event scheduler with stochastic distillation (`pSuccess: 0.35`), buffer management, and stall/resume dynamics. This correctly captures the core operational bottleneck of fault-tolerant quantum computation: magic state production rate vs consumption rate. The visualization of this in `EmissionLayer.tsx` is well-integrated.

**6. The example configs are unusually self-aware.**
`example-configs.json` includes configs like "The Cliff: Error Rate Too High" (line 27) that deliberately break the model to expose its limitations. This is rare in vendor-adjacent tooling and reflects scientific honesty.

---

## B. Scientific Accuracy Assessment

### expr.ts -- CORRECT
The expression tree, evaluator, simplifier, and symbolic differentiator are mathematically correct. The differentiation rules are standard calculus: product rule (line 332), quotient rule (line 339), generalized power rule for `f^g` (line 348), chain rule for `log` (line 362). The choice to return `lit(0)` for `floor`/`ceil`/`min`/`max` derivatives (lines 376-382) is the right pragmatic choice -- these are piecewise constant almost everywhere.

**Minor issue**: The `abs` derivative at line 373 uses `f/|f|` which is undefined at `f=0`. This is technically correct for the subgradient but could produce NaN in practice. Low severity.

### architecture.ts -- APPROXIMATELY CORRECT
The block error rate formula `P_L = fitA * p^fitB` (lines 87-90) is the standard power-law extrapolation used in the Oratomic paper. The Toffoli budget formula at line 99 uses `budget = -log(0.9) / (tauToff * P_L)`, which approximates `log(1 - P_L) ~ -P_L` for small `P_L`. This approximation is valid when `P_L << 1` (which holds for the operating regime of interest).

**Issue**: The `tauToff` computation at lines 93-94 uses `tau_s = 2d/3` where `d` is the processor code distance. This is a rough approximation from the paper that assumes serial Toffoli execution with 2/3 syndrome extraction overlap. The multiplier is then an architecture-dependent factor. The problem is that `processor.d` is a symbolic `Expr` (from code-family), but the actual `d` values used in the concrete architectures are whatever falls out of the `lpCodeFamily` or `bbCodeFamily` construction. This is internally consistent but hard for a user to validate.

**Issue**: The runtime conversion at line 103 divides by `86400000` (ms to days), which is correct. But `cycleTime` is labeled "ms" in the interface (line 26) while the default value in the example configs is `1.0`. If that's 1.0 ms, the conversion is correct. If it's 1.0 seconds (as some text implies), the results are off by 1000x.

### code-family.ts -- APPROXIMATELY CORRECT with one ERROR

**The `n` formula at line 54 is WRONG.**
```typescript
const n = mul(add(mul(rA, rA), mul(nA, nA)), ell);  // (rA^2 + nA^2) * ell
```
For a lifted product code LP(A, A^dagger) where A is `rA x nA` over `F_2[x]/(x^l + 1)`:
- The number of physical qubits is `n = (rA^2 + nA^2) * l` -- this matches the comment.
- But the formula computes `rA * rA` symbolically, which is `rA^2` only if `rA` is scalar. Since `rA` is always passed as `lit(3)` or `lit(1)`, this works numerically, but the formula is conceptually encoding block dimensions rather than the squared dimension count. This happens to give the right answer because `rA` and `nA` here represent the seed matrix dimensions, and `rA^2 + nA^2` gives the number of ring-element columns in `[H_X, H_Z]`, which times `l` gives the physical qubit count. Consistent with `lp-code.ts:67`.

**The `k` formula at line 55 is a LOWER BOUND, not exact.** The code correctly documents this as a lower bound, but the symbolic `CodeFamily` interface calls the field `k` without qualification (line 21), which could mislead users. The actual `k` is `n - rank(H_X) - rank(H_Z)`, which can be substantially larger than `(nA - rA)^2 * l` for some codes.

**The distance bound at lines 61-68 is WRONG.** `d <= min((rA+1)^(rA+1), (nA+1)^(nA+1))` is not a recognized distance bound for lifted product codes. The Singleton-like bound is `d <= n - k + 1`. The percolation-based bounds are more nuanced. This appears to be a placeholder.

### sensitivity.ts -- CORRECT
Elasticity computation is standard. The bottleneck analysis (line 75-92) correctly identifies the parameter with highest absolute elasticity per cost metric. The hardcoded parameter list at line 32 (`["p", "cycleTime", "tauToffMul", "toffoliCount"]`) is limiting but appropriate for the current architecture model.

### circuit-ir.ts -- APPROXIMATELY CORRECT

**Shor RSA-2048** (line 148-168): The `2.7e9` Toffoli count matches Gidney's 2025 estimate. The `1480` logical qubits is reasonable. The 50/50 adder/lookup split and specific parameters are rough but defensible.

**Shor ECC-256** (line 174-193): Uses `1.35e9` Toffoli count here but the lookup tables use `9.0e7` for the same problem (lookup-tables.ts:30). This internal inconsistency is significant -- the circuit IR says one thing and the resource estimation uses another. The `9.0e7` figure is documented as "Compilation (2) from Babbush 2026" which is the low-qubit compilation; the `1.35e9` may be Compilation (1). But the circuit viewer will show `1.35e9` while the architecture explorer uses `9.0e7`.

**Reference to "Babbush 2026"** (line 179): I cannot verify this reference. Babbush et al. have published on quantum chemistry resource estimation, but I am not aware of a 2026 paper on ECC-256 factoring circuits. This may be a projected/placeholder reference.

### polynomial-ring.ts -- CORRECT
As noted above. The only subtlety: `x^l = -1 = 1` in `F_2`, so `F_2[x]/(x^l + 1) = F_2[x]/(x^l - 1)`. This means the ring decomposes differently than over other fields. For lifted product codes this is fine -- the construction works over any quotient ring.

### lp-code.ts -- CORRECT
The lifted product construction is implemented correctly. The tensor product structure at lines 84-107 (H_X) and 117-141 (H_Z) follows the standard formulation. The circulant expansion at lines 164-180 correctly maps ring-row/ring-col indices to binary indices.

**Minor concern**: The code stores the full sparse entry list, which for the lp24 code (n=5278) produces matrices of size 1365x5278, giving potentially millions of entries. Performance could degrade for interactive use.

### lookup-tables.ts -- APPROXIMATELY CORRECT

**CODE_DETAILS** (lines 53-58): Cross-checking against the symbolic code families:
- `lp20`: `n = (3^2 + 7^2) * 75 = 58 * 75 = 4350`. Matches line 55. CORRECT.
- `lp24`: `n = (9 + 49) * 91 = 5278`. Matches line 56. CORRECT.
- `lp16`: `n = (9 + 49) * 45 = 2610`. Matches line 54. CORRECT.
- `bb18`: `n = 2 * 31 * 4 = 248`. Matches line 57. CORRECT.

**PLATFORM_RESOURCE_ESTIMATES** (lines 118-131): The IonQ and Google estimates are labeled "estimated" with no citation. See Section D.

### decoder.ts -- MISLEADING
The `SimpleBPDecoder` (lines 48-112) is labeled "simplified BP" but is actually **random bit-flip decoding** (line 79: `correction[idx] ^= 1` on a random index). This is not belief propagation in any meaningful sense. It does not use a parity check matrix, does not compute messages on a Tanner graph, and has no relationship to the min-sum or sum-product algorithms. The convergence check at lines 71-76 computes `syndrome XOR correction`, which is not how syndrome checking works (it should be `H @ correction mod 2 == syndrome`).

The `BPLSDDecoderStub` (line 118-142) returns hardcoded statistics. The `10000 us` latency is reasonable for BP-LSD on a CPU for codes of this size.

### engine-compute.ts -- APPROXIMATELY CORRECT with concerns

**Noise model corrections** (lines 146-153): The biased-Z correction factor of `0.3` and circuit-level factor of `2.5` are ad-hoc. For biased noise, the actual advantage depends strongly on the code structure and bias ratio. The comment "~2x improvement in effective distance" does not match the `0.3` multiplier (which would be a 3.3x improvement in block error rate, not distance). For LDPC codes that are not specifically tailored for biased noise, the improvement can be much smaller.

**Timing waterfall** (lines 173-178): The fixed percentage splits (45% readout, 30% transport, 25% gates) are reasonable rough estimates for neutral atom platforms but should vary with architecture type and hardware parameters.

### bp_decoder.py (MLX) -- See Section F

### neural_decoder.py -- MISLEADING
The neural decoder uses MSE loss (`(pred - batch_err) ** 2` at line 95) to predict error patterns from syndromes. This is fundamentally wrong for a binary classification problem. Binary cross-entropy loss should be used. Additionally, an MLP mapping syndrome to correction ignores the code structure entirely -- the Tanner graph is not used. The 128-hidden-dim, 2-layer MLP is far too small to learn useful correction patterns for codes with `n > 200`. This will not converge to anything useful.

---

## C. What's Missing for Real Research Utility

**1. No actual decoder.** The TypeScript decoder is random bit-flip, the BP-LSD is a stub, and the MLX BP has convergence issues (see Section F). A postdoc doing architecture exploration needs at minimum a working BP+OSD or BP+LSD decoder to validate logical error rates. Without this, all error rate numbers are from power-law fits, not from simulation.

**2. No circuit-level noise model.** The tool uses phenomenological `P_L = a * p^b` fits. Real architecture exploration requires circuit-level depolarizing noise, measurement errors, idle errors, and leakage. Stim can generate these circuits; this tool cannot.

**3. No lattice surgery or code deformation.** The Toffoli implementation assumes magic state injection but does not model the actual lattice surgery operations. The Lattice Surgery Compiler and related tools provide this. Without it, the `tauToff` multipliers are unjustified constants.

**4. No distance computation.** The code family has `d` as a user-specified parameter, not computed. For custom codes entered via `CustomCodeEntry.tsx`, the user has no way to know the distance of their code. Computing distance exactly is NP-hard, but heuristic methods (random sampling, LP relaxation) exist.

**5. No syndrome extraction circuit.** The syndrome replay (`SyndromeReplay.tsx`) generates random syndromes, not syndromes from an actual extraction circuit. The weight computation at line 45 (`Math.ceil(n / numChecksX)`) is wrong -- it should be the stabilizer weight, not `n/checks`.

**6. No memory error tracking.** The model does not account for idle errors on memory qubits during processing, which is the dominant error source in space-efficient architectures where memory qubits sit idle for many cycles.

**7. No parallelism modeling.** The time-efficient architecture uses hardcoded presets (lookup-tables.ts:48-51) rather than deriving parallelism from resource constraints. Real architecture exploration needs to model factory utilization, routing congestion, and spatial layout.

**8. No connectivity constraints.** Neutral atom architectures have specific connectivity constraints (AOD range, Rydberg blockade radius, zone geometry). The tool does not model these, making the qubit counts aspirational rather than constructive.

---

## D. The IonQ Walking-Cat Comparison: Right and Wrong

### What it gets right

- **Including trapped-ion and superconducting platforms** as comparison points is valuable for contextualizing the qLDPC advantage.
- **The qualitative story is correct**: qLDPC codes trade runtime for qubit count, surface codes trade qubits for speed, and trapped ions sit in between.
- **IonQ's decoder latency of 50 us** (lookup-tables.ts:95) is reasonable -- their recent demonstrations on M4 Max show sub-100us decoding for small subsystem codes.
- **Google's cycle time of 1 us** (lookup-tables.ts:108) is approximately correct for superconducting platforms.

### What it gets wrong

**1. IonQ qubit estimates are fabricated.** `50,000 qubits for ECC-256` and `200,000 for RSA-2048` (lookup-tables.ts:124-125) are marked "estimated" with no methodology or citation. IonQ has published no resource estimates at this scale. Their current largest demonstration is 36 qubits (line 99). These numbers need either a derivation or removal.

**2. Google surface code estimates are internally inconsistent.** `500,000 qubits for ECC-256 with runtime 0.01 days` (lookup-tables.ts:128) implies ~14 minutes to break ECC-256. This does not match any published estimate I am aware of. The `4,000,000 qubits for RSA-2048 in 7 days` roughly matches Gidney's estimates but the ECC-256 figure appears to be interpolated incorrectly.

**3. IonQ error rate of 0.0001** (lookup-tables.ts:93) is aspirational. Their published two-qubit gate fidelities are 99.5-99.8%, not 99.99%. Using their demonstrated rates would dramatically change the comparison.

**4. The comparison uses different code types but the same resource formula.** The Oratomic architecture uses qLDPC codes with specific resource formulas. The IonQ and Google entries use lookup-table presets that don't derive from the same model. This means the comparison is not apples-to-apples -- it's three points from three different models, not a parametric comparison.

**5. No mention of connectivity.** Surface codes require only nearest-neighbor connectivity (planar). qLDPC codes require nonlocal connectivity (which neutral atoms provide but superconducting qubits do not). This fundamental architectural difference is not reflected in the comparison.

### What would make it credible

- Derive all platform estimates from the same parametric model with platform-specific parameters (gate time, transport time, error rate, connectivity, native gate set).
- Use published, not aspirational, hardware parameters.
- Include error bars or parameter ranges rather than point estimates.
- Cite specific papers for each platform's resource estimate.

---

## E. The Symbolic Engine -- Is It Actually Useful?

**Yes, but for a specific audience.**

The symbolic engine solves a real problem: in architecture exploration, you want to understand how resource costs depend on hardware parameters before those parameters are known. The standard approach is to write a Python script that sweeps parameters and generates tables. The symbolic approach has three advantages:

1. **Analytical sensitivity.** You can compute `d(runtime)/d(p)` symbolically and discover that runtime scales as `p^{-10}` (from the block error rate exponent), meaning a 2x improvement in physical error rate gives a 1024x improvement in runtime. This is immediate from the elasticity computation and would take multiple sweep runs to discover numerically.

2. **Pareto computation.** The `pareto` function in `architecture.ts:197-226` is a standard 2D Pareto filter, but combining it with the symbolic sweep lets you generate qubit-vs-runtime Pareto frontiers across architecture families in real time. This is useful for architecture selection.

3. **Expression reuse.** Once you define `blockErrorRate = fitA * p^fitB` symbolically, you can substitute it into `toffoliBudget`, differentiate with respect to `p`, and simplify -- all without rewriting the formula. This composability matters as models grow complex.

**Who would use this?** Graduate students learning resource estimation, industry engineers doing first-pass architecture screening, and paper authors who want to make their resource models interactive. It is not a replacement for detailed simulation tools (Stim, pymatching, Azure QRE) but it fills a gap between "read the paper's tables" and "run Monte Carlo for a week."

**Over-engineering concern:** The `cond`, `min`, `max`, `floor`, `ceil` nodes in the expression tree (expr.ts:17-22) suggest ambitions beyond what the current architecture model uses. The simplifier handles 14 node types but the architecture model primarily uses `add`, `mul`, `div`, and `pow`. This is forward-looking engineering, not over-engineering, if the plan is to support more complex architecture models.

---

## F. The MLX BP Decoder -- Is It Correct?

**The message-passing structure is recognizable but contains several errors that prevent correct decoding.**

### What's right

- The variable-to-check update at `bp_decoder.py:93-94` has the correct structure: `v2c[i,j] = channel_llr[j] + sum_{i' != i} c2v[i',j]`. The self-exclusion via subtraction (`- c2v`) is the standard approach.
- The min-sum approximation structure at lines 98-110 is correct in intent: the check-to-variable message should be the product of signs (excluding self) times the minimum absolute value (excluding self), scaled by `alpha`.
- The scaling factor `alpha = 0.625` (line 17) is a standard normalized min-sum choice.

### What's wrong

**1. The min-of-abs computation does not exclude self (line 108).**
```python
min_vals = mx.min(masked_abs, axis=1, keepdims=True)
```
This takes the global minimum per row, not the minimum excluding position `j`. For the extrinsic message `c2v[i,j]`, you need `min_{j' != j} |v2c[i,j']|`. The standard approach is to track the first and second minimum per row and use the second minimum when `j` is the argmin. Without this, every variable in a row receives the same minimum, which is wrong when `j` is the position achieving the minimum.

**2. The sign exclusion is wrong (line 103).**
```python
sign_excl = all_sign_product * signs
```
This does not achieve self-exclusion. If `signs[i,j] = -1`, then `all_sign_product * signs[i,j] = all_sign_product * (-1)`, which divides out position `j`'s contribution only if you're working multiplicatively. But `all_sign_product` already includes position `j`'s sign, and multiplying by `signs[i,j]` again gives `all_sign_product * signs[i,j]^2 = all_sign_product` when `signs[i,j] = +/-1`. Wait -- actually, in F_2 sign arithmetic, `sign^2 = 1`, so `all_sign_product * sign[i,j]` does give the product of all signs except `j`. This is correct for sign exclusion. I retract this point.

**3. The syndrome incorporation is wrong (lines 113-114).**
```python
syndrome_sign = mx.where(syndrome > 0.5, -mx.ones(...), mx.ones(...))
c2v = c2v * syndrome_sign
```
This flips the sign of all messages from unsatisfied checks, but this is not how syndrome information enters BP decoding. The syndrome should modify the channel LLRs or be incorporated into the check node constraint. In standard formulations, the syndrome bit `s_i` means the parity constraint at check `i` is `sum_j H[i,j] * x_j = s_i` (mod 2). This is handled by initializing the check nodes with the syndrome value, not by flipping message signs post-hoc. The current approach may sometimes converge to the right answer but is not a correct implementation.

**4. Channel LLRs are zero (line 79).**
```python
channel_llr = mx.zeros((num_vars,))
```
Zero channel LLRs means the decoder has no prior information about error probability. For a depolarizing channel with error rate `p`, the channel LLR should be `log((1-p)/p)`. Without this, the decoder is severely handicapped -- it starts with maximum uncertainty and must infer everything from the syndrome alone.

**5. Convergence check is correct but slow.** Lines 121-125 check `H @ hard_decision mod 2 == syndrome` each iteration. This is correct but the dense matrix multiply is O(checks * vars) per iteration. For production use, sparse operations are essential.

### Verdict

The decoder will not converge reliably for codes beyond trivial size. The zero channel LLR and incorrect syndrome incorporation are the most severe issues. With fixes to these two issues and proper min-excluding-self computation, it would be a functional (though slow) min-sum BP decoder.

---

## G. Prioritized Improvements for v2.0

**1. Integrate a real BP-OSD decoder via WASM or Python bridge.**
*Enables*: Actual logical error rate simulation, validation of power-law fits, custom code evaluation.
*Effort*: 2-3 weeks. Port ldpc-v2 (Roffe) to WASM or use PyO3 bridge.
*Why first*: Without a working decoder, all error rate numbers are unvalidated fits. This is the single biggest credibility gap.

**2. Fix the MLX BP decoder (Section F issues).**
*Enables*: On-device decoding benchmarks, decoder comparison studies on Apple Silicon.
*Effort*: 3-5 days. Fix channel LLR initialization, syndrome incorporation, and min-excluding-self.
*Why*: Low effort, high payoff. A correct BP decoder on MLX would be genuinely useful for the community.

**3. Add circuit-level noise model via Stim integration.**
*Enables*: Realistic error rate estimation, measurement error modeling, hook errors.
*Effort*: 3-4 weeks. Generate Stim circuits from code structure, sample detection events.
*Why*: The phenomenological `a * p^b` model is the weakest link in the resource estimation pipeline.

**4. Compute code distance (heuristic).**
*Enables*: Custom code evaluation, distance verification for paper codes.
*Effort*: 1-2 weeks. Implement random information set decoding or LP relaxation.
*Why*: Users entering custom codes via `CustomCodeEntry.tsx` currently have no way to know if their code is any good.

**5. Derive platform comparison estimates from the same parametric model.**
*Enables*: Fair cross-platform comparison, parameter sensitivity across platforms.
*Effort*: 1-2 weeks. Extend `balancedArchitecture` to accept platform-specific parameters.
*Why*: The current comparison uses fabricated estimates (Section D). A parametric model would be both more honest and more useful.

**6. Add lattice surgery / Toffoli implementation model.**
*Enables*: Justified `tauToff` values instead of lookup constants, exploration of surgery scheduling.
*Effort*: 4-6 weeks. This is a substantial compiler problem.
*Why*: The `tauToff` multipliers are the most opaque part of the current model.

**7. Implement GF(4) rank computation for exact k.**
*Enables*: Exact logical qubit count for custom codes, validation of lower bounds.
*Effort*: 1 week. Gaussian elimination over GF(2) on the parity check matrices.
*Why*: The current `k` is a lower bound that can be substantially loose.

**8. Add correlated error modeling.**
*Enables*: Realistic assessment of error floors, crosstalk effects in dense atom arrays.
*Effort*: 2-3 weeks. Requires modifications to error generation and decoder.
*Why*: The paper's extrapolation warning at `engine-compute.ts:50` correctly notes that correlated errors are not captured. Making this concrete would strengthen the tool.

**9. Spatial layout optimizer for zone geometry.**
*Enables*: Constructive proof that atom arrays can physically realize the proposed layouts.
*Effort*: 3-4 weeks. Constraint satisfaction over AOD ranges and Rydberg blockade radii.
*Why*: Currently the tool assumes arbitrary qubit placement. Real neutral atom arrays have geometric constraints.

**10. Export to OpenQASM / Stim circuit format.**
*Enables*: Integration with existing QEC toolchains, reproducibility of results.
*Effort*: 1 week. Map circuit-ir.ts nodes to OpenQASM3 or Stim circuit format.
*Why*: Interoperability with Stim, pymatching, and other tools would make this tool part of a research workflow rather than a standalone explorer.

---

## H. Publication Potential

**1. The symbolic resource estimation framework (expr.ts + architecture.ts + sensitivity.ts).**
*Venue*: Quantum Science and Technology (methods paper) or a workshop paper at QIP/TQC.
*What would need to change*: (a) Extend to at least 3-4 architecture families beyond Oratomic (surface code, color code, Floquet code). (b) Validate sensitivity predictions against Monte Carlo sweeps. (c) Formalize the symbolic architecture model as a DSL with clear semantics. (d) Compare to Azure QRE and show what insights the symbolic approach provides that numerical sweeps do not.
*Strength*: The autodiff + elasticity approach is genuinely novel for QEC resource estimation.

**2. The in-browser qLDPC code explorer (lp-code.ts + polynomial-ring.ts + CustomCodeEntry.tsx).**
*Venue*: Software/tools track at IEEE QCE or a companion paper to a codes paper.
*What would need to change*: (a) Add a working decoder. (b) Add distance estimation. (c) Support more code families (BB codes, fiber bundle codes, balanced product codes). (d) Performance benchmarks showing the browser-based approach is practical for codes up to n ~ 10,000.
*Strength*: Interactive code exploration lowers the barrier to entry for the qLDPC community.

**3. The time telescope visualization concept (motion.ts + EmissionLayer.tsx).**
*Venue*: IEEE VIS or a visualization workshop at a quantum computing conference.
*What would need to change*: (a) User study showing the multi-scale visualization improves understanding. (b) Extend to other QEC protocols beyond the Oratomic architecture. (c) Formalize the layer/visibility model.
*Strength*: The idea of smoothly transitioning between physical and logical time scales is not just pretty -- it addresses a genuine comprehension challenge in QEC.

**4. NOT publishable as-is: the MLX BP decoder or the neural decoder.**
Both have correctness issues (Section F, Section B) that would not survive peer review. The MLX BP decoder could become publishable with fixes if accompanied by thorough benchmarking against pymatching/ldpc on the same codes, demonstrating the Apple Silicon acceleration advantage.

---

## Summary

This tool is substantially more ambitious and more interesting than a typical paper companion viewer. The symbolic engine, the lifted product construction, and the time telescope visualization are each genuinely novel contributions. The main weaknesses are: (1) no working decoder, which means all error rates are unvalidated power-law extrapolations; (2) fabricated platform comparison estimates that undermine the cross-architecture story; and (3) the MLX BP decoder has correctness issues that prevent it from being a real decoder. Fixing items 1-3 from the improvement list (real decoder, fix MLX BP, circuit-level noise) would transform this from an impressive demo into a credible research tool.
