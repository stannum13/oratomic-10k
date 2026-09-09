"use client";

import { useSimulator } from "@/store/simulator";
import { PAPER_URL, REPOSITORY_URL } from "@/lib/methodology";

export function ReleaseIntro() {
  return (
    <aside className="release-intro" aria-labelledby="release-intro-title">
      <div className="release-kicker">Interactive research visualization</div>
      <h1 id="release-intro-title">Explore a 10,000-qubit fault-tolerant architecture</h1>
      <p>
        Change physical error rate, cycle time, code choice, and architecture. The model updates qubit allocation,
        logical error, runtime, feasibility, and the 3D system live.
      </p>
      <div className="release-actions">
        <button type="button" onClick={() => useSimulator.getState().setMode("simulate")}>
          Explore simulator
        </button>
        <a href={PAPER_URL} target="_blank" rel="noreferrer">Source paper ↗</a>
        <a href={REPOSITORY_URL} target="_blank" rel="noreferrer">Code ↗</a>
      </div>
      <div className="release-credit">Independent interactive implementation by Shivank</div>
    </aside>
  );
}
