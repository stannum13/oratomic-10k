import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("public simulator experience", () => {
  it("defines reusable mobile and desktop result primitives", () => {
    const metrics = read("src/components/Simulator/MetricsBlock.tsx");
    const controls = read("src/components/Simulator/CoreControls.tsx");
    const scenarios = read("src/components/Simulator/ScenarioPicker.tsx");
    const feasibility = read("src/components/Simulator/FeasibilityStrip.tsx");
    const allocation = read("src/components/Simulator/AllocationBar.tsx");
    const knob = read("src/components/Simulator/Knob.tsx");

    expect(metrics).toContain('aria-live="polite"');
    expect(controls).toContain("Target workload");
    expect(knob).toContain('role="radiogroup"');
    expect(scenarios).toContain("Run a scenario");
    expect(feasibility).toContain("<details");
    expect(feasibility).toContain("Closest constraint");
    expect(allocation).toContain('aria-label="Physical-qubit allocation"');
    expect(knob).toContain('inputMode="decimal"');
  });

  it("defines complete semantic color tokens in both themes", () => {
    const css = read("src/app/globals.css");
    const root = css.match(/:root\s*\{([\s\S]*?)\n\}/)?.[1] ?? "";
    const light = css.match(/\[data-theme="light"\]\s*\{([\s\S]*?)\n\}/)?.[1] ?? "";
    const required = [
      "--bg-hover",
      "--bg-surface",
      "--border-subtle",
      "--text-quaternary",
      "--accent",
      "--accent-muted",
      "--success",
    ];

    for (const token of required) {
      expect(root, `dark theme is missing ${token}`).toContain(`${token}:`);
      expect(light, `light theme is missing ${token}`).toContain(`${token}:`);
    }
  });

  it("does not expose the MLX backend in public components", () => {
    const header = read("src/components/Layout/Header.tsx");
    const controls = read("src/components/Simulator/ControlPanel.tsx");

    expect(header).not.toMatch(/mlxBridge|MLXIndicator/);
    expect(controls).not.toMatch(/MLXPanel|MLX Compute/);
  });

  it("links accordion triggers to their panels", () => {
    const controls = read("src/components/Simulator/ControlPanel.tsx");

    expect(controls).toContain("aria-expanded={expanded}");
    expect(controls).toContain("aria-controls={panelId}");
    expect(controls).toContain("id={panelId}");
  });

  it("offers a guided, layered simulator workflow", () => {
    const controls = read("src/components/Simulator/ControlPanel.tsx");

    expect(controls).toContain("Start with a guided scenario");
    expect(controls).toContain("Minimum qubits");
    expect(controls).toContain("Balanced baseline");
    expect(controls).toContain("Error-rate cliff");
    expect(controls).toContain("Core controls");
    expect(controls).toContain("Advanced analysis");
    expect(controls).toContain('aria-label="Control depth"');
    expect(controls).toContain("Physical error rate is the chance that one operation fails");
  });

  it("makes live results and configuration actions explicit", () => {
    const controls = read("src/components/Simulator/ControlPanel.tsx");
    const header = read("src/components/Layout/Header.tsx");
    const store = read("src/store/simulator.ts");
    const css = read("src/app/globals.css");

    expect(controls).toContain('aria-live="polite"');
    expect(controls).toContain("Independent, research-informed model");
    expect(controls).toContain("Reset configuration");
    expect(header).toContain("Copy configuration");
    expect(store).toContain("resetConfig: () => void");
    expect(css).toContain("@keyframes metric-update");
    expect(controls).not.toContain("qubits demonstrated");
    expect(controls).toContain("timing profile is illustrative");
  });

  it("does not show an unexplained 10,000 watermark in the scene", () => {
    const page = read("src/app/page.tsx");

    expect(page).not.toContain("{/* Watermark */}");
  });

  it("offers synchronized QPU and physical-control views", () => {
    const page = read("src/app/page.tsx");
    const system = read("src/components/Scene/QpuSystemView.tsx");

    expect(page).toContain("QPU architecture");
    expect(page).toContain("PHY + feedback");
    expect(system).toContain("Signal loop");
    expect(system).toContain("Noise pathways");
    expect(system).toContain("Bottlenecks");
    expect(system).toContain("Classical map");
    expect(system).toContain("Explain this state");
    expect(system).toContain("Diagnostic abstraction");
  });

  it("uses definition-first, safely sourced terminology", () => {
    const term = read("src/components/ui/Term.tsx");

    expect(term).toContain("<details");
    expect(term).toContain("<summary");
    expect(term).toContain('target="_blank"');
    expect(term).toContain('rel="noreferrer"');
  });

  it("uses curiosity-led copy and explicit methods", () => {
    const controls = read("src/components/Simulator/ControlPanel.tsx");
    const methods = read("src/components/Simulator/MethodologyPanel.tsx");

    expect(controls).toContain("What can a 10,000-qubit quantum computer actually do?");
    expect(controls).toContain("Run a scenario");
    expect(methods).toContain("Methods for this state");
    for (const kind of ["Paper-derived", "Fitted projection", "Model assumption", "Illustrative estimate", "Not modeled"]) {
      expect(methods).toContain(kind);
    }
  });

  it("optimizes the QPU view for touch and hidden mobile panes", () => {
    const page = read("src/app/page.tsx");
    const viewport = read("src/components/Scene/Viewport.tsx");

    expect(page).toContain("View QPU result");
    expect(page).toContain("Drag to rotate · Pinch to zoom");
    expect(page).toContain('mobilePane === "scene"');
    expect(viewport).toContain("[1, 1.5]");
    expect(viewport).toContain("enableEffects");
  });
});
