import { describe, expect, it } from "vitest";
import { PLATFORM_PRESETS } from "@/compute/lookup-tables";
import { getQpuProfile, QPU_PROFILES } from "../qpu-profiles";

describe("QPU platform profiles", () => {
  it("covers every selectable platform with a complete physical stack", () => {
    expect(Object.keys(QPU_PROFILES).sort()).toEqual(Object.keys(PLATFORM_PRESETS).sort());

    for (const id of Object.keys(PLATFORM_PRESETS)) {
      const profile = getQpuProfile(id);
      expect(profile.id).toBe(id);
      expect(profile.medium.length).toBeGreaterThan(10);
      expect(profile.control.length).toBeGreaterThan(10);
      expect(profile.readout.length).toBeGreaterThan(10);
      expect(profile.topology.length).toBeGreaterThan(10);
      expect(profile.signalStages.length).toBeGreaterThanOrEqual(8);
      expect(profile.signalStages.some((stage) => stage.layer === "analog")).toBe(true);
      expect(profile.signalStages.some((stage) => stage.layer === "digital")).toBe(true);
      expect(profile.signalStages.every((stage) => stage.classicalAnalogy.length > 0)).toBe(true);
      expect(profile.noise.length).toBeGreaterThanOrEqual(5);
      expect(profile.bottlenecks.length).toBeGreaterThanOrEqual(4);
      expect(profile.sourceUrl).toMatch(/^https:\/\/arxiv\.org\/abs\//);
    }
  });

  it("falls back to the Oratomic profile for unknown IDs", () => {
    expect(getQpuProfile("unknown").id).toBe("oratomic-neutral-atom");
  });
});
