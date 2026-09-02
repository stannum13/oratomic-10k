# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: audit.spec.ts >> Agent 8 — Prose-scene binding >> scroll and check cross-pane response
- Location: tests/audit.spec.ts:313:7

# Error details

```
Test timeout of 120000ms exceeded.
```

```
Error: locator.scrollIntoViewIfNeeded: Test timeout of 120000ms exceeded.
Call log:
  - waiting for locator('[data-section="3"]')
    - locator resolved to visible <div data-section="3">…</div>

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - generic [ref=e4]:
        - generic [ref=e5]: Oratomic
        - generic [ref=e6]: /
        - generic [ref=e7]: 10k Architecture
        - generic [ref=e8]: v1.0.0
      - generic [ref=e9]:
        - generic [ref=e10]:
          - button "Read" [ref=e11] [cursor=pointer]
          - button "Simulate" [ref=e12] [cursor=pointer]
        - button "MLX" [ref=e13] [cursor=pointer]
        - button "Share" [ref=e15] [cursor=pointer]
    - generic [ref=e16]:
      - generic [ref=e17]:
        - generic [ref=e18]:
          - button "Overview" [ref=e19] [cursor=pointer]
          - button "Architecture" [ref=e20] [cursor=pointer]
          - button "Codes" [ref=e21] [cursor=pointer]
          - button "Surgery" [ref=e22] [cursor=pointer]
          - button "Magic" [ref=e23] [cursor=pointer]
          - button "Resources" [ref=e24] [cursor=pointer]
          - button "Simulator" [ref=e25] [cursor=pointer]
        - generic [ref=e27]:
          - generic [ref=e30]:
            - heading "Shor's Algorithm with 10,000 Atomic Qubits" [level=2] [ref=e31]
            - paragraph [ref=e32]: Oratomic — Cain, Xu, King, Picard, Levine, Endres, Preskill, Huang, Bluvstein
            - paragraph [ref=e33]: Quantum computers have the potential to perform computational tasks beyond the reach of classical machines. By leveraging advances in high-rate quantum error-correcting codes, efficient logical instruction sets, and circuit design, Shor's algorithm can be executed at cryptographically relevant scales with as few as 10,000 reconfigurable atomic qubits.
            - paragraph [ref=e35]: Five orders of magnitude reduction in qubit requirements over two decades of research.
          - generic [ref=e38]:
            - heading "Neutral-Atom Architecture" [level=2] [ref=e39]
            - paragraph [ref=e40]: The computer is divided into four primary functional zones. The memory zone stores logical quantum information. The processor zone stores quantum information undergoing active computation. The operation zone performs Clifford logical Pauli product measurements (PPMs). The resource zone generates magic states to elevate Clifford PPMs to universal quantum computation.
            - generic [ref=e41]:
              - generic [ref=e42]:
                - generic [ref=e43]: Memory
                - generic [ref=e44]: Stores logical quantum information during computation
              - generic [ref=e45]:
                - generic [ref=e46]: Processor
                - generic [ref=e47]: Active computation on subcircuits
              - generic [ref=e48]:
                - generic [ref=e49]: Operation
                - generic [ref=e50]: Ancillary qubits for code surgery PPMs
              - generic [ref=e51]:
                - generic [ref=e52]: Resource
                - generic [ref=e53]: Magic state generation via cultivation + distillation
            - paragraph [ref=e55]: Reconfigurable atom arrays enable nonlocal connectivity required for high-rate qLDPC codes, with demonstrated arrays exceeding 6,100 qubits.
          - generic [ref=e58]:
            - heading "Codes, Logic, and Compilation" [level=2] [ref=e59]
            - paragraph [ref=e60]: High-rate quantum low-density parity check (qLDPC) codes leverage nonlocality to densely pack many logical qubits into a single code block. We analyze lifted-product codes with encoding rates of approximately 30%, encoding more than 1,000 logical qubits. At p=0.1%, the lp₂₄ code achieves extrapolated per-cycle block failure rates of approximately 10⁻¹¹ — comparable to surface codes with the same distance but 161× fewer physical qubits.
            - generic [ref=e64]:
              - math [ref=e66]:
                - generic [ref=e68]:
                  - generic [ref=e69]: "["
                  - generic: ⁣
                  - generic [ref=e70]: "["
                  - generic [ref=e71]: "n"
                  - generic [ref=e72]: =
                  - generic [ref=e73]: (
                  - generic [ref=e74]:
                    - generic [ref=e75]: r
                    - generic [ref=e76]: A
                    - generic [ref=e77]: "2"
                  - generic [ref=e78]: +
                  - generic [ref=e79]:
                    - generic [ref=e80]: "n"
                    - generic [ref=e81]: A
                    - generic [ref=e82]: "2"
                  - generic [ref=e83]: )
                  - generic [ref=e84]: ⋅
                  - generic [ref=e85]: ℓ
                  - generic [ref=e86]: ","
                  - generic [ref=e87]: k
                  - generic [ref=e88]: ≥
                  - generic [ref=e89]: (
                  - generic [ref=e90]:
                    - generic [ref=e91]: "n"
                    - generic [ref=e92]: A
                  - generic [ref=e93]: −
                  - generic [ref=e94]:
                    - generic [ref=e95]: r
                    - generic [ref=e96]: A
                  - generic [ref=e97]:
                    - generic [ref=e98]: )
                    - generic [ref=e99]: "2"
                  - generic [ref=e100]: ⋅
                  - generic [ref=e101]: ℓ
                  - generic [ref=e102]: ","
                  - generic [ref=e103]: d
                  - generic [ref=e104]: "]"
                  - generic: ⁣
                  - generic [ref=e105]: "]"
              - generic [ref=e106]:
                - generic [ref=e107]: "[ [n ="
                - generic [ref=e108]:
                  - text: (
                  - generic [ref=e109]:
                    - text: r
                    - generic [ref=e113]:
                      - generic [ref=e114]: A
                      - generic [ref=e115]: "2"
                  - text: +
                - generic [ref=e119]:
                  - generic [ref=e120]:
                    - text: "n"
                    - generic [ref=e124]:
                      - generic [ref=e125]: A
                      - generic [ref=e126]: "2"
                  - text: ) ⋅
                - generic [ref=e130]: ℓ, k ≥
                - generic [ref=e131]:
                  - text: (
                  - generic [ref=e132]:
                    - text: "n"
                    - generic [ref=e133]: A
                  - text: −
                - generic [ref=e141]:
                  - generic [ref=e142]:
                    - text: r
                    - generic [ref=e143]: A
                  - generic [ref=e151]:
                    - text: )
                    - generic [ref=e152]: "2"
                  - text: ⋅
                - generic [ref=e157]: ℓ, d] ]
            - paragraph [ref=e159]: LP codes with ~30% encoding rate achieve 161× qubit savings over surface codes at equivalent error suppression.
            - generic [ref=e160]: Click 'Construct LP Code' in Simulate mode to build the Tanner graph
            - generic [ref=e161]:
              - generic [ref=e162]:
                - generic [ref=e163]:
                  - text: Seed Matrix
                  - generic [ref=e165]:
                    - math [ref=e167]:
                      - generic [ref=e168]: A
                    - generic [ref=e171]: A
                  - text: over
                  - generic [ref=e174]:
                    - math [ref=e176]:
                      - generic [ref=e178]:
                        - generic [ref=e179]:
                          - generic [ref=e180]: F
                          - generic [ref=e181]: "2"
                        - generic [ref=e182]: "["
                        - generic [ref=e183]: x
                        - generic [ref=e184]: "]"
                        - generic [ref=e185]: /
                        - generic [ref=e186]: (
                        - generic [ref=e187]:
                          - generic [ref=e188]: x
                          - generic [ref=e189]: "75"
                        - generic [ref=e190]: +
                        - generic [ref=e191]: "1"
                        - generic [ref=e192]: )
                    - generic [ref=e193]:
                      - generic [ref=e194]:
                        - generic [ref=e195]:
                          - text: F
                          - generic [ref=e196]: "2"
                        - text: "[x]/("
                        - generic [ref=e204]:
                          - text: x
                          - generic [ref=e205]: "75"
                        - text: +
                      - generic [ref=e211]: 1)
                - generic [ref=e213]:
                  - math [ref=e215]:
                    - generic [ref=e217]:
                      - generic [ref=e218]: "["
                      - generic: ⁣
                      - generic [ref=e219]: "["
                      - generic [ref=e220]: "4"
                      - generic [ref=e221]: ","
                      - generic [ref=e222]: "350"
                      - generic [ref=e223]: ","
                      - generic [ref=e224]: "1"
                      - generic [ref=e225]: ","
                      - generic [ref=e226]: "224"
                      - generic [ref=e227]: ","
                      - generic [ref=e228]: ≤
                      - generic [ref=e229]: "20"
                      - generic [ref=e230]: "]"
                      - generic: ⁣
                      - generic [ref=e231]: "]"
                  - generic [ref=e232]:
                    - generic [ref=e233]: "[ [4, 350, 1, 224, ≤"
                    - generic [ref=e234]: 20] ]
              - generic [ref=e238]:
                - math [ref=e240]:
                  - generic [ref=e242]:
                    - generic [ref=e243]: A
                    - generic [ref=e244]: =
                    - generic [ref=e245]:
                      - generic [ref=e246]: (
                      - generic [ref=e247]:
                        - generic [ref=e248]:
                          - generic [ref=e251]:
                            - generic [ref=e252]: x
                            - generic [ref=e253]: "0"
                          - generic [ref=e256]:
                            - generic [ref=e257]: x
                            - generic [ref=e258]: "71"
                          - generic [ref=e261]:
                            - generic [ref=e262]: x
                            - generic [ref=e263]: "73"
                          - generic [ref=e266]:
                            - generic [ref=e267]: x
                            - generic [ref=e268]: "68"
                          - generic [ref=e271]:
                            - generic [ref=e272]: x
                            - generic [ref=e273]: "33"
                          - generic [ref=e276]:
                            - generic [ref=e277]: x
                            - generic [ref=e278]: "50"
                          - generic [ref=e281]:
                            - generic [ref=e282]: x
                            - generic [ref=e283]: "47"
                        - generic [ref=e284]:
                          - generic [ref=e287]:
                            - generic [ref=e288]: x
                            - generic [ref=e289]: "38"
                          - generic [ref=e292]:
                            - generic [ref=e293]: x
                            - generic [ref=e294]: "39"
                          - generic [ref=e297]:
                            - generic [ref=e298]: x
                            - generic [ref=e299]: "60"
                          - generic [ref=e302]:
                            - generic [ref=e303]: x
                            - generic [ref=e304]: "26"
                          - generic [ref=e307]:
                            - generic [ref=e308]: x
                            - generic [ref=e309]: "18"
                          - generic [ref=e312]:
                            - generic [ref=e313]: x
                            - generic [ref=e314]: "1"
                          - generic [ref=e317]:
                            - generic [ref=e318]: x
                            - generic [ref=e319]: "23"
                        - generic [ref=e320]:
                          - generic [ref=e323]:
                            - generic [ref=e324]: x
                            - generic [ref=e325]: "73"
                          - generic [ref=e328]:
                            - generic [ref=e329]: x
                            - generic [ref=e330]: "6"
                          - generic [ref=e333]:
                            - generic [ref=e334]: x
                            - generic [ref=e335]: "5"
                          - generic [ref=e338]:
                            - generic [ref=e339]: x
                            - generic [ref=e340]: "42"
                          - generic [ref=e343]:
                            - generic [ref=e344]: x
                            - generic [ref=e345]: "20"
                          - generic [ref=e348]:
                            - generic [ref=e349]: x
                            - generic [ref=e350]: "22"
                          - generic [ref=e353]:
                            - generic [ref=e354]: x
                            - generic [ref=e355]: "73"
                      - generic [ref=e356]: )
                - generic [ref=e357]:
                  - generic [ref=e358]: A =
                  - generic [ref=e373]:
                    - generic [ref=e377]:
                      - generic [ref=e379]:
                        - text: x
                        - generic [ref=e380]: "0"
                      - generic [ref=e387]:
                        - text: x
                        - generic [ref=e388]: "38"
                      - generic [ref=e395]:
                        - text: x
                        - generic [ref=e396]: "73"
                    - generic [ref=e408]:
                      - generic [ref=e410]:
                        - text: x
                        - generic [ref=e411]: "71"
                      - generic [ref=e418]:
                        - text: x
                        - generic [ref=e419]: "39"
                      - generic [ref=e426]:
                        - text: x
                        - generic [ref=e427]: "6"
                    - generic [ref=e439]:
                      - generic [ref=e441]:
                        - text: x
                        - generic [ref=e442]: "73"
                      - generic [ref=e449]:
                        - text: x
                        - generic [ref=e450]: "60"
                      - generic [ref=e457]:
                        - text: x
                        - generic [ref=e458]: "5"
                    - generic [ref=e470]:
                      - generic [ref=e472]:
                        - text: x
                        - generic [ref=e473]: "68"
                      - generic [ref=e480]:
                        - text: x
                        - generic [ref=e481]: "26"
                      - generic [ref=e488]:
                        - text: x
                        - generic [ref=e489]: "42"
                    - generic [ref=e501]:
                      - generic [ref=e503]:
                        - text: x
                        - generic [ref=e504]: "33"
                      - generic [ref=e511]:
                        - text: x
                        - generic [ref=e512]: "18"
                      - generic [ref=e519]:
                        - text: x
                        - generic [ref=e520]: "20"
                    - generic [ref=e532]:
                      - generic [ref=e534]:
                        - text: x
                        - generic [ref=e535]: "50"
                      - generic [ref=e542]:
                        - text: x
                        - generic [ref=e543]: "1"
                      - generic [ref=e550]:
                        - text: x
                        - generic [ref=e551]: "22"
                    - generic [ref=e563]:
                      - generic [ref=e565]:
                        - text: x
                        - generic [ref=e566]: "47"
                      - generic [ref=e573]:
                        - text: x
                        - generic [ref=e574]: "23"
                      - generic [ref=e581]:
                        - text: x
                        - generic [ref=e582]: "73"
              - generic [ref=e602]:
                - generic [ref=e603]:
                  - generic [ref=e605]:
                    - math [ref=e607]:
                      - generic [ref=e608]: "n"
                    - generic [ref=e611]: "n"
                  - text: = 4,350
                - generic [ref=e613]:
                  - generic [ref=e615]:
                    - math [ref=e617]:
                      - generic [ref=e618]: k
                    - generic [ref=e621]: k
                  - text: = 1,224
                - generic [ref=e623]:
                  - generic [ref=e625]:
                    - math [ref=e627]:
                      - generic [ref=e629]:
                        - generic [ref=e630]: d
                        - generic [ref=e631]: ≤
                    - generic [ref=e632]: d ≤
                  - text: "20"
                - generic [ref=e634]: rate = 28.1%
          - generic [ref=e637]:
            - heading "Surgery and Logic" [level=2] [ref=e638]
            - paragraph [ref=e639]: Universal computation is performed by teleporting logical qubits from memory to processor, executing Pauli-based computation with CCZ gate teleportation, then teleporting back. Each sub-circuit C_i involves 4m_i + 4β_i + γ_i PPMs, where m_i is the qubit count, β_i the Toffoli count, and γ_i the mid-circuit measurement count.
            - generic [ref=e643]:
              - math [ref=e645]:
                - generic [ref=e647]:
                  - generic [ref=e648]: τ
                  - generic [ref=e649]: (
                  - generic [ref=e650]:
                    - generic [ref=e651]: C
                    - generic [ref=e652]: i
                  - generic [ref=e653]: )
                  - generic [ref=e654]: =
                  - generic [ref=e655]: (
                  - generic [ref=e656]: "4"
                  - generic [ref=e657]:
                    - generic [ref=e658]: m
                    - generic [ref=e659]: i
                  - generic [ref=e660]: +
                  - generic [ref=e661]: "4"
                  - generic [ref=e662]:
                    - generic [ref=e663]: β
                    - generic [ref=e664]: i
                  - generic [ref=e665]: +
                  - generic [ref=e666]:
                    - generic [ref=e667]: γ
                    - generic [ref=e668]: i
                  - generic [ref=e669]: )
                  - generic [ref=e670]: ⋅
                  - generic [ref=e671]:
                    - generic [ref=e672]: τ
                    - generic [ref=e673]: s
                  - generic [ref=e674]: ","
                  - generic [ref=e675]: w
                  - generic [ref=e676]: h
                  - generic [ref=e677]: e
                  - generic [ref=e678]: r
                  - generic [ref=e679]: e
                  - generic [ref=e680]:
                    - generic [ref=e681]: τ
                    - generic [ref=e682]: s
                  - generic [ref=e683]: ≈
                  - generic [ref=e684]: "2"
                  - generic [ref=e685]: d
                  - generic [ref=e686]: /
                  - generic [ref=e687]: "3"
                  - generic [ref=e688]: c
                  - generic [ref=e689]: "y"
                  - generic [ref=e690]: c
                  - generic [ref=e691]: l
                  - generic [ref=e692]: e
                  - generic [ref=e693]: s
              - generic [ref=e694]:
                - generic [ref=e695]:
                  - text: τ(
                  - generic [ref=e696]:
                    - text: C
                    - generic [ref=e697]: i
                  - text: ) =
                - generic [ref=e705]:
                  - text: (4
                  - generic [ref=e706]:
                    - text: m
                    - generic [ref=e707]: i
                  - text: +
                - generic [ref=e715]:
                  - text: "4"
                  - generic [ref=e716]:
                    - text: β
                    - generic [ref=e717]: i
                  - text: +
                - generic [ref=e725]:
                  - generic [ref=e726]:
                    - text: γ
                    - generic [ref=e727]: i
                  - text: ) ⋅
                - generic [ref=e735]:
                  - generic [ref=e736]:
                    - text: τ
                    - generic [ref=e737]: s
                  - text: ", where"
                  - generic [ref=e745]:
                    - text: τ
                    - generic [ref=e746]: s
                  - text: ≈
                - generic [ref=e754]: 2d/3cycles
            - paragraph [ref=e756]: Computation on smaller processor codes avoids the prohibitive cost of surgery directly on large memory blocks.
          - generic [ref=e759]:
            - heading "Magic State Distillation" [level=2] [ref=e760]
            - paragraph [ref=e761]: High-rate 8T-to-CCZ distillation combines surface-code cultivation with high-rate factory codes. Five bb₁₈ factory blocks produce 10 CCZ states each with error rate ~10⁻¹⁰ at p=0.1%, using 2,565 total qubits in ~120 cycles. The time cost per CCZ state is less than a single surgery cycle.
            - paragraph [ref=e763]: Factory produces 10 CCZ states in 120 cycles (6d_p) — fast enough that magic state generation is never the bottleneck.
          - generic [ref=e766]:
            - heading "Resource Estimates" [level=2] [ref=e767]
            - paragraph [ref=e768]: ECC-256 requires p=0.093% with the lp₂₄ memory, with balanced architecture runtimes of ~264 days (1ms cycle time). The time-efficient architecture with P=130 parallelism achieves ~10 days for ECC-256 using 26,000 qubits. RSA-2048 runtimes are 1-2 orders of magnitude longer due to higher circuit depth.
            - paragraph [ref=e770]: "Architecture choice creates a 100× runtime spread: from years (space-efficient) to days (time-efficient with parallelism)."
          - generic [ref=e773]:
            - heading "Architecture Simulator" [level=2] [ref=e774]
            - paragraph [ref=e775]: Explore the full parameter space of the Oratomic architecture. Adjust physical error rates, select code families, switch between architecture types, and see how qubit counts, error rates, and runtimes respond in real time.
            - paragraph [ref=e777]: Configure your own architecture and understand the design tradeoffs that drive fault-tolerant quantum computing.
      - generic [ref=e778]:
        - generic: 10,000
        - button "?" [ref=e780] [cursor=pointer]
        - generic [ref=e781]:
          - generic: memory5,913
          - generic: processor1,609
          - generic: operation1,874
          - generic: resource2,565
    - generic [ref=e784]:
      - generic [ref=e785]: feasible
      - generic [ref=e787]:
        - generic [ref=e788]: qubits
        - generic "N = N_memory + N_processor + N_resource + N_operation = 5913 + 1609 + 2565 + 1874" [ref=e789]: 12.0k
      - generic [ref=e790]:
        - generic [ref=e791]: block error
        - generic "P_L = a · p^b = 1.0 × (p)^10" [ref=e792]: 10⁻³⁰
      - generic [ref=e793]:
        - generic [ref=e794]: runtime
        - generic "T = N_toffoli × τ_toff × t_cycle / 86400 days" [ref=e795]: 264 days
      - generic [ref=e796]:
        - generic [ref=e797]: toffoli budget
        - generic "Budget = ln(0.9) / (τ_toff × ln(1 - P_L)) at 90% success" [ref=e798]: 4.2 × 10²⁶
      - generic [ref=e801]:
        - math [ref=e803]:
          - generic [ref=e805]:
            - generic [ref=e806]: "["
            - generic: ⁣
            - generic [ref=e807]: "["
            - generic [ref=e808]: "4"
            - generic [ref=e809]: ","
            - generic [ref=e810]: "350"
            - generic [ref=e811]: ","
            - generic [ref=e812]: "1"
            - generic [ref=e813]: ","
            - generic [ref=e814]: "224"
            - generic [ref=e815]: ","
            - generic [ref=e816]: ≤
            - generic [ref=e817]: "20"
            - generic [ref=e818]: "]"
            - generic: ⁣
            - generic [ref=e819]: "]"
        - generic [ref=e820]:
          - generic [ref=e821]: "[ [4, 350, 1, 224, ≤"
          - generic [ref=e822]: 20] ]
  - button "Open Next.js Dev Tools" [ref=e828] [cursor=pointer]
  - alert [ref=e832]
```

# Test source

```ts
  228 |         }
  229 |       }
  230 |     }
  231 |     findings.push(`Tabbed through ${focusCount} focusable elements`);
  232 | 
  233 |     const report = [
  234 |       "# Agent 6 — Interaction & Accessibility Report",
  235 |       "",
  236 |       "## Findings",
  237 |       ...findings.map(f => `- ${f}`),
  238 |     ].join("\n");
  239 |     fs.writeFileSync(path.join(REPORTS, "agent6-a11y.md"), report);
  240 |   });
  241 | });
  242 | 
  243 | // ─── Agent 7: Runtime Health ─────────────────────────────
  244 | 
  245 | test.describe("Agent 7 — Runtime health", () => {
  246 |   test("capture console and performance", async ({ page }) => {
  247 |     const findings: string[] = [];
  248 |     const consoleMessages: string[] = [];
  249 | 
  250 |     page.on("console", (msg) => {
  251 |       consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
  252 |     });
  253 | 
  254 |     page.on("pageerror", (err) => {
  255 |       consoleMessages.push(`[ERROR] ${err.message}`);
  256 |       findings.push(`BLOCKER: Uncaught error: ${err.message.substring(0, 100)}`);
  257 |     });
  258 | 
  259 |     await page.goto("/", { waitUntil: "networkidle" });
  260 |     await page.waitForTimeout(3000);
  261 | 
  262 |     // Switch to simulate
  263 |     const simBtn = page.locator('button:has-text("Simulate")');
  264 |     if (await simBtn.count() > 0) await simBtn.click();
  265 | 
  266 |     // Let it run for 15 seconds
  267 |     await page.waitForTimeout(15000);
  268 | 
  269 |     // Collect performance metrics
  270 |     const metrics = await page.evaluate(() => {
  271 |       const perf = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
  272 |       return {
  273 |         domContentLoaded: perf?.domContentLoadedEventEnd,
  274 |         loadComplete: perf?.loadEventEnd,
  275 |         heapUsed: (performance as any).memory?.usedJSHeapSize,
  276 |         heapTotal: (performance as any).memory?.totalJSHeapSize,
  277 |       };
  278 |     });
  279 | 
  280 |     findings.push(`DOM content loaded: ${metrics.domContentLoaded?.toFixed(0)}ms`);
  281 |     findings.push(`Load complete: ${metrics.loadComplete?.toFixed(0)}ms`);
  282 |     if (metrics.heapUsed) findings.push(`Heap: ${(metrics.heapUsed / 1e6).toFixed(1)}MB / ${(metrics.heapTotal / 1e6).toFixed(1)}MB`);
  283 | 
  284 |     // Count console errors and warnings
  285 |     const errors = consoleMessages.filter(m => m.startsWith("[error]"));
  286 |     const warnings = consoleMessages.filter(m => m.startsWith("[warning]"));
  287 |     findings.push(`Console errors: ${errors.length}`);
  288 |     findings.push(`Console warnings: ${warnings.length}`);
  289 | 
  290 |     if (errors.length > 0) {
  291 |       findings.push("Error details:");
  292 |       errors.slice(0, 5).forEach(e => findings.push(`  ${e.substring(0, 150)}`));
  293 |     }
  294 | 
  295 |     // Save console log
  296 |     fs.writeFileSync(path.join(CONSOLE_DIR, "console.log"), consoleMessages.join("\n"));
  297 | 
  298 |     const report = [
  299 |       "# Agent 7 — Runtime Health Report",
  300 |       "",
  301 |       "## Findings",
  302 |       ...findings.map(f => `- ${f}`),
  303 |       "",
  304 |       `## Console output: ${consoleMessages.length} messages — see console/console.log`,
  305 |     ].join("\n");
  306 |     fs.writeFileSync(path.join(REPORTS, "agent7-health.md"), report);
  307 |   });
  308 | });
  309 | 
  310 | // ─── Agent 8: Prose-Scene Binding ────────────────────────
  311 | 
  312 | test.describe("Agent 8 — Prose-scene binding", () => {
  313 |   test("scroll and check cross-pane response", async ({ page }) => {
  314 |     const findings: string[] = [];
  315 |     await page.goto("/", { waitUntil: "networkidle" });
  316 |     await page.waitForTimeout(3000);
  317 | 
  318 |     // Scroll through sections in Read mode
  319 |     const leftPane = page.locator(".pane-left");
  320 |     if (await leftPane.count() === 0) {
  321 |       findings.push("BLOCKER: .pane-left not found");
  322 |     } else {
  323 |       const sections = ["overview", "architecture", "codes", "surgery", "magic", "resources", "simulator"];
  324 | 
  325 |       for (let i = 0; i < sections.length; i++) {
  326 |         const section = page.locator(`[data-section="${i}"]`);
  327 |         if (await section.count() > 0) {
> 328 |           await section.scrollIntoViewIfNeeded();
      |                         ^ Error: locator.scrollIntoViewIfNeeded: Test timeout of 120000ms exceeded.
  329 |           await page.waitForTimeout(1500); // wait for camera transition
  330 | 
  331 |           await page.screenshot({
  332 |             path: path.join(SHOTS, `scroll_section_${i}_${sections[i]}.png`),
  333 |           });
  334 |         }
  335 |       }
  336 |     }
  337 | 
  338 |     findings.push("Captured scroll-through of all 7 sections");
  339 |     findings.push("Visual inspection required to verify camera angle changes per section");
  340 | 
  341 |     const report = [
  342 |       "# Agent 8 — Prose-Scene Binding Report",
  343 |       "",
  344 |       "## Findings",
  345 |       ...findings.map(f => `- ${f}`),
  346 |       "",
  347 |       "## Artifacts",
  348 |       "- `shots/scroll_section_0_overview.png` through `scroll_section_6_simulator.png`",
  349 |     ].join("\n");
  350 |     fs.writeFileSync(path.join(REPORTS, "agent8-binding.md"), report);
  351 |   });
  352 | });
  353 | 
  354 | // ─── Agent 3: Emission Audit (code-based) ────────────────
  355 | 
  356 | test.describe("Agent 3 — Emission audit (codebase)", () => {
  357 |   test("check color usage in codebase", async ({ page }) => {
  358 |     const findings: string[] = [];
  359 | 
  360 |     // Grep source for hardcoded colors
  361 |     const srcDir = path.resolve(__dirname, "../../viewer/src");
  362 | 
  363 |     function walkDir(dir: string): string[] {
  364 |       const files: string[] = [];
  365 |       try {
  366 |         for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
  367 |           const full = path.join(dir, entry.name);
  368 |           if (entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "node_modules") {
  369 |             files.push(...walkDir(full));
  370 |           } else if (entry.isFile() && (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts") || entry.name.endsWith(".css"))) {
  371 |             files.push(full);
  372 |           }
  373 |         }
  374 |       } catch {}
  375 |       return files;
  376 |     }
  377 | 
  378 |     const sourceFiles = walkDir(srcDir);
  379 |     const colorPattern = /#[0-9a-fA-F]{6}\b/g;
  380 |     const chromeFiles: string[] = [];
  381 |     const sceneFiles: string[] = [];
  382 | 
  383 |     for (const file of sourceFiles) {
  384 |       const content = fs.readFileSync(file, "utf-8");
  385 |       const matches = content.match(colorPattern);
  386 |       if (matches) {
  387 |         const relPath = path.relative(srcDir, file);
  388 |         const isScene = relPath.includes("Scene/") || relPath.includes("motion");
  389 |         const category = isScene ? "scene" : "chrome";
  390 | 
  391 |         for (const m of matches) {
  392 |           const isGrayscale = m.match(/#([0-9a-fA-F])\1([0-9a-fA-F])\2([0-9a-fA-F])\3/i) ||
  393 |             ["#000000", "#ffffff", "#08090C", "#0E1015", "#0B0D11", "#1A1D24",
  394 |              "#E8EAED", "#9AA0AA", "#5C626C", "#14171D", "#0F1218",
  395 |              "#D0D4DA", "#C0C4CA", "#D8DCDF"].includes(m);
  396 | 
  397 |           if (!isGrayscale) {
  398 |             const line = content.substring(0, content.indexOf(m)).split("\n").length;
  399 |             if (isScene) {
  400 |               sceneFiles.push(`${relPath}:${line} ${m}`);
  401 |             } else {
  402 |               chromeFiles.push(`${relPath}:${line} ${m} — HUE IN CHROME`);
  403 |             }
  404 |           }
  405 |         }
  406 |       }
  407 |     }
  408 | 
  409 |     findings.push(`Scanned ${sourceFiles.length} source files`);
  410 |     findings.push(`Non-grayscale colors in scene files: ${sceneFiles.length}`);
  411 |     findings.push(`Non-grayscale colors in chrome files: ${chromeFiles.length}`);
  412 | 
  413 |     if (chromeFiles.length > 0) {
  414 |       findings.push("");
  415 |       findings.push("## Hue in chrome (should not exist per design brief):");
  416 |       chromeFiles.forEach(f => findings.push(`  - ${f}`));
  417 |     }
  418 | 
  419 |     if (sceneFiles.length > 0) {
  420 |       findings.push("");
  421 |       findings.push("## Colors in scene (should be emission only):");
  422 |       sceneFiles.forEach(f => findings.push(`  - ${f}`));
  423 |     }
  424 | 
  425 |     const report = [
  426 |       "# Agent 3 — Emission Audit Report",
  427 |       "",
  428 |       ...findings,
```