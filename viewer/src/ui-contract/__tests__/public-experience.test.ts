import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("public simulator experience", () => {
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
});
