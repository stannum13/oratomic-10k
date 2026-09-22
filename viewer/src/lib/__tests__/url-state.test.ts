import { describe, expect, it } from "vitest";
import { decodeConfig, encodeConfig, resolveInitialExperience, type ShareableConfig } from "../url-state";

const config: ShareableConfig = {
  p: 0.001,
  t: 1,
  a: "balanced",
  prob: "ecc-256",
  mem: "lp20",
  proc: "lp-proc",
  platform: "ionq-walking-cat",
  experience: "explore",
};

describe("shareable simulator state", () => {
  it("round-trips a complete configuration", () => {
    expect(decodeConfig(`?${encodeConfig(config)}`)).toEqual(config);
  });

  it.each(["NaN", "Infinity", "-Infinity", "abc", "0", "0.02"])(
    "ignores invalid physical error rate %s",
    (value) => {
      expect(decodeConfig(`?p=${value}&a=balanced`)).toEqual({ a: "balanced" });
    },
  );

  it.each(["NaN", "Infinity", "-Infinity", "abc", "0", "20"])(
    "ignores invalid cycle time %s",
    (value) => {
      expect(decodeConfig(`?t=${value}&prob=ecc-256`)).toEqual({ prob: "ecc-256" });
    },
  );

  it("accepts numeric values at the supported boundaries", () => {
    expect(decodeConfig("?p=0.0001&t=0.001")).toEqual({ p: 0.0001, t: 0.001 });
    expect(decodeConfig("?p=0.01&t=10")).toEqual({ p: 0.01, t: 10 });
  });

  it("preserves old links while rejecting unknown platform ids", () => {
    expect(decodeConfig("?p=0.001&a=balanced")).toEqual({ p: 0.001, a: "balanced" });
    expect(decodeConfig("?platform=unknown&p=0.001")).toEqual({ p: 0.001 });
  });

  it("opens bare entries as guided and legacy configured links as explore", () => {
    expect(resolveInitialExperience("")).toBe("guided");
    expect(resolveInitialExperience("?p=0.001&a=balanced")).toBe("explore");
    expect(resolveInitialExperience("?platform=ionq-walking-cat")).toBe("explore");
  });

  it("honors explicit experience and validated guide chapters", () => {
    expect(resolveInitialExperience("?experience=guided&chapter=noise&p=0.001")).toBe("guided");
    expect(decodeConfig("?experience=guided&chapter=noise")).toEqual({ experience: "guided", chapter: "noise" });
    expect(decodeConfig("?experience=guided&chapter=unknown")).toEqual({ experience: "guided" });
  });
});
