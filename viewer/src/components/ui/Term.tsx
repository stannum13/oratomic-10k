"use client";

import type { ReactNode } from "react";
import { getGlossaryEntry, type GlossaryTerm } from "@/lib/qpu-glossary";

export function Term({ term, children }: { term: GlossaryTerm; children?: ReactNode }) {
  const entry = getGlossaryEntry(term);

  return (
    <details className="term">
      <summary>{children ?? entry.label}</summary>
      <div className="term__popover">
        <strong>{entry.label}</strong>
        <p>{entry.definition}</p>
        <p><b>Why it matters here:</b> {entry.relevance}</p>
        <div className="term__footer">
          <span className="provenance-badge">{entry.provenance}</span>
          <a href={entry.sourceUrl} target="_blank" rel="noreferrer">{entry.sourceLabel} ↗</a>
        </div>
      </div>
    </details>
  );
}
