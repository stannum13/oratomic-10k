# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: audit.spec.ts >> Agent 6 — Interaction and accessibility >> check controls and focus
- Location: tests/audit.spec.ts:174:7

# Error details

```
Test timeout of 120000ms exceeded.
```

```
Error: page.evaluate: Test timeout of 120000ms exceeded.
```

# Test source

```ts
  113 |       "",
  114 |       "## Findings",
  115 |       ...findings.map(f => `- ${f}`),
  116 |     ].join("\n");
  117 |     fs.writeFileSync(path.join(REPORTS, "agent4-geometry.md"), report);
  118 |   });
  119 | });
  120 | 
  121 | // ─── Agent 5: Data Consistency ───────────────────────────
  122 | 
  123 | test.describe("Agent 5 — Data consistency", () => {
  124 |   test("check number formatting consistency", async ({ page }) => {
  125 |     const findings: string[] = [];
  126 |     await page.goto("/", { waitUntil: "networkidle" });
  127 |     await page.waitForTimeout(3000);
  128 | 
  129 |     // Switch to simulate mode
  130 |     const simBtn = page.locator('button:has-text("Simulate")');
  131 |     if (await simBtn.count() > 0) await simBtn.click();
  132 |     await page.waitForTimeout(1000);
  133 | 
  134 |     // Extract all visible numbers
  135 |     const data = await page.evaluate(() => {
  136 |       const statusBar = document.querySelector(".status-bar");
  137 |       const statusText = statusBar?.textContent || "";
  138 | 
  139 |       // Find qubit count mentions
  140 |       const allText = document.body.innerText;
  141 |       const qubitMatches = allText.match(/\d[\d,.]+k?\s*(?:qubits?|Qubits?)/gi) || [];
  142 |       const errorMatches = allText.match(/10[⁻\-]?\d+|1e[+-]?\d+/g) || [];
  143 | 
  144 |       return {
  145 |         statusBarText: statusText,
  146 |         qubitMentions: qubitMatches,
  147 |         errorFormats: errorMatches,
  148 |         headerText: document.querySelector("header")?.textContent || "",
  149 |       };
  150 |     });
  151 | 
  152 |     findings.push(`Status bar content: "${data.statusBarText.trim().substring(0, 200)}"`);
  153 |     findings.push(`Qubit mentions found: ${JSON.stringify(data.qubitMentions)}`);
  154 |     findings.push(`Error format variants: ${JSON.stringify(data.errorFormats)}`);
  155 | 
  156 |     // Check for format inconsistencies
  157 |     if (data.errorFormats.some(e => e.includes("1e")) && data.errorFormats.some(e => e.includes("⁻"))) {
  158 |       findings.push("WARNING: Mixed error rate formatting (1e-X vs 10⁻ˣ)");
  159 |     }
  160 | 
  161 |     const report = [
  162 |       "# Agent 5 — Data Consistency Report",
  163 |       "",
  164 |       "## Findings",
  165 |       ...findings.map(f => `- ${f}`),
  166 |     ].join("\n");
  167 |     fs.writeFileSync(path.join(REPORTS, "agent5-data.md"), report);
  168 |   });
  169 | });
  170 | 
  171 | // ─── Agent 6: Interaction & Accessibility ────────────────
  172 | 
  173 | test.describe("Agent 6 — Interaction and accessibility", () => {
  174 |   test("check controls and focus", async ({ page }) => {
  175 |     const findings: string[] = [];
  176 |     await page.goto("/", { waitUntil: "networkidle" });
  177 |     await page.waitForTimeout(3000);
  178 | 
  179 |     // Switch to simulate
  180 |     const simBtn = page.locator('button:has-text("Simulate")');
  181 |     if (await simBtn.count() > 0) await simBtn.click();
  182 |     await page.waitForTimeout(1000);
  183 | 
  184 |     // Expand Physical Parameters
  185 |     const physicsSection = page.locator('button:has-text("Physical Parameters")');
  186 |     if (await physicsSection.count() > 0) {
  187 |       await physicsSection.click();
  188 |       await page.waitForTimeout(500);
  189 |     }
  190 | 
  191 |     // Screenshot slider state
  192 |     await page.screenshot({ path: path.join(SHOTS, "sliders_state.png") });
  193 | 
  194 |     // Check slider elements
  195 |     const sliders = page.locator('input[type="range"]');
  196 |     const sliderCount = await sliders.count();
  197 |     findings.push(`Found ${sliderCount} range inputs`);
  198 | 
  199 |     for (let i = 0; i < Math.min(sliderCount, 3); i++) {
  200 |       const slider = sliders.nth(i);
  201 |       const box = await slider.boundingBox();
  202 |       const label = await slider.getAttribute("aria-label");
  203 |       if (box) {
  204 |         findings.push(`Slider ${i}: "${label}" — ${box.width.toFixed(0)}x${box.height.toFixed(0)} at (${box.x.toFixed(0)}, ${box.y.toFixed(0)})`);
  205 |         if (box.height < 10) findings.push(`  WARNING: Slider ${i} track height only ${box.height.toFixed(0)}px`);
  206 |       }
  207 |     }
  208 | 
  209 |     // Tab through elements
  210 |     let focusCount = 0;
  211 |     for (let i = 0; i < 20; i++) {
  212 |       await page.keyboard.press("Tab");
> 213 |       const focused = await page.evaluate(() => {
      |                                  ^ Error: page.evaluate: Test timeout of 120000ms exceeded.
  214 |         const el = document.activeElement;
  215 |         if (!el || el === document.body) return null;
  216 |         const styles = getComputedStyle(el);
  217 |         return {
  218 |           tag: el.tagName,
  219 |           text: el.textContent?.substring(0, 30),
  220 |           outline: styles.outline,
  221 |           outlineColor: styles.outlineColor,
  222 |         };
  223 |       });
  224 |       if (focused) {
  225 |         focusCount++;
  226 |         if (focused.outline === "none" || focused.outline === "") {
  227 |           findings.push(`MINOR: No focus ring on ${focused.tag} "${focused.text}"`);
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
```