import { test, expect, type Page } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const SHOTS = path.resolve(__dirname, "../shots");
const CONSOLE_DIR = path.resolve(__dirname, "../console");
const REPORTS = path.resolve(__dirname, "../reports");

// ─── Agent 1: Static Capture ─────────────────────────────

test.describe("Agent 1 — Static capture", () => {
  test("capture all states", async ({ page }) => {
    const findings: string[] = [];
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(3000); // let 3D scene initialize

    // Read mode — each tab
    const tabs = ["Overview", "Architecture", "Codes", "Surgery", "Magic", "Resources", "Simulator"];
    for (const tab of tabs) {
      const tabBtn = page.locator(`button.tab:has-text("${tab}")`);
      if (await tabBtn.count() > 0) {
        await tabBtn.click();
        await page.waitForTimeout(1000);
      }
      await page.screenshot({ path: path.join(SHOTS, `read_${tab.toLowerCase()}.png`), fullPage: false });
    }

    // Simulate mode
    const simBtn = page.locator('button:has-text("Simulate")');
    if (await simBtn.count() > 0) {
      await simBtn.click();
      await page.waitForTimeout(2000);
    }
    await page.screenshot({ path: path.join(SHOTS, `simulate_default.png`), fullPage: false });

    // Capture at different viewports
    for (const vp of [{ w: 1440, h: 900 }, { w: 3440, h: 1440 }]) {
      await page.setViewportSize({ width: vp.w, height: vp.h });
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(SHOTS, `simulate_${vp.w}x${vp.h}.png`), fullPage: false });
    }

    // Reset viewport
    await page.setViewportSize({ width: 2560, height: 1440 });

    // Write report
    const report = [
      "# Agent 1 — Static Capture Report",
      "",
      `Captured ${tabs.length} tab states in Read mode, 1 Simulate default, 2 alternate viewports.`,
      "",
      "## Files",
      ...tabs.map(t => `- \`shots/read_${t.toLowerCase()}.png\``),
      "- `shots/simulate_default.png`",
      "- `shots/simulate_1440x900.png`",
      "- `shots/simulate_3440x1440.png`",
      "",
      "## Findings",
      ...findings,
    ].join("\n");
    fs.writeFileSync(path.join(REPORTS, "agent1-static.md"), report);
  });
});

// ─── Agent 4: Scene Geometry ─────────────────────────────

test.describe("Agent 4 — Scene geometry", () => {
  test("check scene bounds and elements", async ({ page }) => {
    const findings: string[] = [];
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(3000);

    // Screenshot 3D pane in isolation
    const rightPane = page.locator(".pane-right");
    if (await rightPane.count() > 0) {
      await rightPane.screenshot({ path: path.join(SHOTS, "scene_isolated.png") });
      const box = await rightPane.boundingBox();
      if (box) {
        findings.push(`Scene pane bounds: ${box.width}x${box.height} at (${box.x}, ${box.y})`);
      }
    } else {
      findings.push("WARNING: .pane-right not found");
    }

    // Check for cones (cylinder elements in the scene)
    const coneCheck = await page.evaluate(() => {
      const html = document.body.innerHTML;
      return {
        hasCone: html.includes("cylinderGeometry"),
        hasLaserDelivery: html.includes("LaserDelivery"),
      };
    });
    if (coneCheck.hasCone) findings.push("BLOCKER: Cone/cylinder geometry still present in scene DOM");
    if (coneCheck.hasLaserDelivery) findings.push("BLOCKER: LaserDelivery component still referenced");

    // Check watermark
    const watermark = page.locator("text=10,000").first();
    if (await watermark.count() > 0) {
      const wmBox = await watermark.boundingBox();
      if (wmBox) {
        findings.push(`Watermark bounds: ${wmBox.width.toFixed(0)}x${wmBox.height.toFixed(0)} at (${wmBox.x.toFixed(0)}, ${wmBox.y.toFixed(0)})`);
      }
    }

    // Check for floating N badge
    const nBadge = page.locator('[data-nextjs-dialog-overlay], [class*="nextjs"]');
    if (await nBadge.count() > 0) {
      findings.push("MINOR: Next.js dev badge present (expected in dev mode only)");
    }

    const report = [
      "# Agent 4 — Scene Geometry Report",
      "",
      "## Findings",
      ...findings.map(f => `- ${f}`),
    ].join("\n");
    fs.writeFileSync(path.join(REPORTS, "agent4-geometry.md"), report);
  });
});

// ─── Agent 5: Data Consistency ───────────────────────────

test.describe("Agent 5 — Data consistency", () => {
  test("check number formatting consistency", async ({ page }) => {
    const findings: string[] = [];
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(3000);

    // Switch to simulate mode
    const simBtn = page.locator('button:has-text("Simulate")');
    if (await simBtn.count() > 0) await simBtn.click();
    await page.waitForTimeout(1000);

    // Extract all visible numbers
    const data = await page.evaluate(() => {
      const statusBar = document.querySelector(".status-bar");
      const statusText = statusBar?.textContent || "";

      // Find qubit count mentions
      const allText = document.body.innerText;
      const qubitMatches = allText.match(/\d[\d,.]+k?\s*(?:qubits?|Qubits?)/gi) || [];
      const errorMatches = allText.match(/10[⁻\-]?\d+|1e[+-]?\d+/g) || [];

      return {
        statusBarText: statusText,
        qubitMentions: qubitMatches,
        errorFormats: errorMatches,
        headerText: document.querySelector("header")?.textContent || "",
      };
    });

    findings.push(`Status bar content: "${data.statusBarText.trim().substring(0, 200)}"`);
    findings.push(`Qubit mentions found: ${JSON.stringify(data.qubitMentions)}`);
    findings.push(`Error format variants: ${JSON.stringify(data.errorFormats)}`);

    // Check for format inconsistencies
    if (data.errorFormats.some(e => e.includes("1e")) && data.errorFormats.some(e => e.includes("⁻"))) {
      findings.push("WARNING: Mixed error rate formatting (1e-X vs 10⁻ˣ)");
    }

    const report = [
      "# Agent 5 — Data Consistency Report",
      "",
      "## Findings",
      ...findings.map(f => `- ${f}`),
    ].join("\n");
    fs.writeFileSync(path.join(REPORTS, "agent5-data.md"), report);
  });
});

// ─── Agent 6: Interaction & Accessibility ────────────────

test.describe("Agent 6 — Interaction and accessibility", () => {
  test("check controls and focus", async ({ page }) => {
    const findings: string[] = [];
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(3000);

    // Switch to simulate
    const simBtn = page.locator('button:has-text("Simulate")');
    if (await simBtn.count() > 0) await simBtn.click();
    await page.waitForTimeout(1000);

    // Expand Physical Parameters
    const physicsSection = page.locator('button:has-text("Physical Parameters")');
    if (await physicsSection.count() > 0) {
      await physicsSection.click();
      await page.waitForTimeout(500);
    }

    // Screenshot slider state
    await page.screenshot({ path: path.join(SHOTS, "sliders_state.png") });

    // Check slider elements
    const sliders = page.locator('input[type="range"]');
    const sliderCount = await sliders.count();
    findings.push(`Found ${sliderCount} range inputs`);

    for (let i = 0; i < Math.min(sliderCount, 3); i++) {
      const slider = sliders.nth(i);
      const box = await slider.boundingBox();
      const label = await slider.getAttribute("aria-label");
      if (box) {
        findings.push(`Slider ${i}: "${label}" — ${box.width.toFixed(0)}x${box.height.toFixed(0)} at (${box.x.toFixed(0)}, ${box.y.toFixed(0)})`);
        if (box.height < 10) findings.push(`  WARNING: Slider ${i} track height only ${box.height.toFixed(0)}px`);
      }
    }

    // Tab through elements
    let focusCount = 0;
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press("Tab");
      const focused = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        const styles = getComputedStyle(el);
        return {
          tag: el.tagName,
          text: el.textContent?.substring(0, 30),
          outline: styles.outline,
          outlineColor: styles.outlineColor,
        };
      });
      if (focused) {
        focusCount++;
        if (focused.outline === "none" || focused.outline === "") {
          findings.push(`MINOR: No focus ring on ${focused.tag} "${focused.text}"`);
        }
      }
    }
    findings.push(`Tabbed through ${focusCount} focusable elements`);

    const report = [
      "# Agent 6 — Interaction & Accessibility Report",
      "",
      "## Findings",
      ...findings.map(f => `- ${f}`),
    ].join("\n");
    fs.writeFileSync(path.join(REPORTS, "agent6-a11y.md"), report);
  });
});

// ─── Agent 7: Runtime Health ─────────────────────────────

test.describe("Agent 7 — Runtime health", () => {
  test("capture console and performance", async ({ page }) => {
    const findings: string[] = [];
    const consoleMessages: string[] = [];

    page.on("console", (msg) => {
      consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
    });

    page.on("pageerror", (err) => {
      consoleMessages.push(`[ERROR] ${err.message}`);
      findings.push(`BLOCKER: Uncaught error: ${err.message.substring(0, 100)}`);
    });

    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(3000);

    // Switch to simulate
    const simBtn = page.locator('button:has-text("Simulate")');
    if (await simBtn.count() > 0) await simBtn.click();

    // Let it run for 15 seconds
    await page.waitForTimeout(15000);

    // Collect performance metrics
    const metrics = await page.evaluate(() => {
      const perf = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: perf?.domContentLoadedEventEnd,
        loadComplete: perf?.loadEventEnd,
        heapUsed: (performance as any).memory?.usedJSHeapSize,
        heapTotal: (performance as any).memory?.totalJSHeapSize,
      };
    });

    findings.push(`DOM content loaded: ${metrics.domContentLoaded?.toFixed(0)}ms`);
    findings.push(`Load complete: ${metrics.loadComplete?.toFixed(0)}ms`);
    if (metrics.heapUsed) findings.push(`Heap: ${(metrics.heapUsed / 1e6).toFixed(1)}MB / ${(metrics.heapTotal / 1e6).toFixed(1)}MB`);

    // Count console errors and warnings
    const errors = consoleMessages.filter(m => m.startsWith("[error]"));
    const warnings = consoleMessages.filter(m => m.startsWith("[warning]"));
    findings.push(`Console errors: ${errors.length}`);
    findings.push(`Console warnings: ${warnings.length}`);

    if (errors.length > 0) {
      findings.push("Error details:");
      errors.slice(0, 5).forEach(e => findings.push(`  ${e.substring(0, 150)}`));
    }

    // Save console log
    fs.writeFileSync(path.join(CONSOLE_DIR, "console.log"), consoleMessages.join("\n"));

    const report = [
      "# Agent 7 — Runtime Health Report",
      "",
      "## Findings",
      ...findings.map(f => `- ${f}`),
      "",
      `## Console output: ${consoleMessages.length} messages — see console/console.log`,
    ].join("\n");
    fs.writeFileSync(path.join(REPORTS, "agent7-health.md"), report);
  });
});

// ─── Agent 8: Prose-Scene Binding ────────────────────────

test.describe("Agent 8 — Prose-scene binding", () => {
  test("scroll and check cross-pane response", async ({ page }) => {
    const findings: string[] = [];
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(3000);

    // Scroll through sections in Read mode
    const leftPane = page.locator(".pane-left");
    if (await leftPane.count() === 0) {
      findings.push("BLOCKER: .pane-left not found");
    } else {
      const sections = ["overview", "architecture", "codes", "surgery", "magic", "resources", "simulator"];

      for (let i = 0; i < sections.length; i++) {
        const section = page.locator(`[data-section="${i}"]`);
        if (await section.count() > 0) {
          await section.scrollIntoViewIfNeeded();
          await page.waitForTimeout(1500); // wait for camera transition

          await page.screenshot({
            path: path.join(SHOTS, `scroll_section_${i}_${sections[i]}.png`),
          });
        }
      }
    }

    findings.push("Captured scroll-through of all 7 sections");
    findings.push("Visual inspection required to verify camera angle changes per section");

    const report = [
      "# Agent 8 — Prose-Scene Binding Report",
      "",
      "## Findings",
      ...findings.map(f => `- ${f}`),
      "",
      "## Artifacts",
      "- `shots/scroll_section_0_overview.png` through `scroll_section_6_simulator.png`",
    ].join("\n");
    fs.writeFileSync(path.join(REPORTS, "agent8-binding.md"), report);
  });
});

// ─── Agent 3: Emission Audit (code-based) ────────────────

test.describe("Agent 3 — Emission audit (codebase)", () => {
  test("check color usage in codebase", async ({ page }) => {
    const findings: string[] = [];

    // Grep source for hardcoded colors
    const srcDir = path.resolve(__dirname, "../../viewer/src");

    function walkDir(dir: string): string[] {
      const files: string[] = [];
      try {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "node_modules") {
            files.push(...walkDir(full));
          } else if (entry.isFile() && (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts") || entry.name.endsWith(".css"))) {
            files.push(full);
          }
        }
      } catch {}
      return files;
    }

    const sourceFiles = walkDir(srcDir);
    const colorPattern = /#[0-9a-fA-F]{6}\b/g;
    const chromeFiles: string[] = [];
    const sceneFiles: string[] = [];

    for (const file of sourceFiles) {
      const content = fs.readFileSync(file, "utf-8");
      const matches = content.match(colorPattern);
      if (matches) {
        const relPath = path.relative(srcDir, file);
        const isScene = relPath.includes("Scene/") || relPath.includes("motion");
        const category = isScene ? "scene" : "chrome";

        for (const m of matches) {
          const isGrayscale = m.match(/#([0-9a-fA-F])\1([0-9a-fA-F])\2([0-9a-fA-F])\3/i) ||
            ["#000000", "#ffffff", "#08090C", "#0E1015", "#0B0D11", "#1A1D24",
             "#E8EAED", "#9AA0AA", "#5C626C", "#14171D", "#0F1218",
             "#D0D4DA", "#C0C4CA", "#D8DCDF"].includes(m);

          if (!isGrayscale) {
            const line = content.substring(0, content.indexOf(m)).split("\n").length;
            if (isScene) {
              sceneFiles.push(`${relPath}:${line} ${m}`);
            } else {
              chromeFiles.push(`${relPath}:${line} ${m} — HUE IN CHROME`);
            }
          }
        }
      }
    }

    findings.push(`Scanned ${sourceFiles.length} source files`);
    findings.push(`Non-grayscale colors in scene files: ${sceneFiles.length}`);
    findings.push(`Non-grayscale colors in chrome files: ${chromeFiles.length}`);

    if (chromeFiles.length > 0) {
      findings.push("");
      findings.push("## Hue in chrome (should not exist per design brief):");
      chromeFiles.forEach(f => findings.push(`  - ${f}`));
    }

    if (sceneFiles.length > 0) {
      findings.push("");
      findings.push("## Colors in scene (should be emission only):");
      sceneFiles.forEach(f => findings.push(`  - ${f}`));
    }

    const report = [
      "# Agent 3 — Emission Audit Report",
      "",
      ...findings,
    ].join("\n");
    fs.writeFileSync(path.join(REPORTS, "agent3-emission.md"), report);
  });
});
