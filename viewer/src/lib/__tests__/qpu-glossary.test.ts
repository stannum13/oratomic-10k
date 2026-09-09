import { describe, expect, it } from "vitest";
import { getGlossaryEntry, QPU_GLOSSARY, REQUIRED_GLOSSARY_TERMS } from "../qpu-glossary";

describe("QPU glossary", () => {
  it("provides definition-first primary sources for every required term", () => {
    expect(Object.keys(QPU_GLOSSARY).sort()).toEqual([...REQUIRED_GLOSSARY_TERMS].sort());

    for (const term of REQUIRED_GLOSSARY_TERMS) {
      const entry = getGlossaryEntry(term);
      expect(entry.definition.length).toBeGreaterThan(20);
      expect(entry.relevance.length).toBeGreaterThan(20);
      expect(entry.sourceLabel.length).toBeGreaterThan(3);
      expect(entry.sourceUrl).toMatch(/^https:\/\/arxiv\.org\/abs\//);
      expect(["Paper-derived", "Fitted projection", "Model assumption", "Illustrative estimate", "Not modeled"]).toContain(entry.provenance);
    }
  });

  it("defines mobile-critical architecture and result jargon", () => {
    for (const term of ["walking-cat", "block-error-target", "toffoli-budget", "code-notation"] as const) {
      expect(REQUIRED_GLOSSARY_TERMS).toContain(term);
      expect(getGlossaryEntry(term).definition.length).toBeGreaterThan(30);
      expect(getGlossaryEntry(term).sourceUrl).toMatch(/^https:\/\/arxiv\.org\/abs\//);
    }
  });
});
