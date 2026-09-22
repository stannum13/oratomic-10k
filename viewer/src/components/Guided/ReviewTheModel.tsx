"use client";

import { useState } from "react";
import { REPOSITORY_URL } from "@/lib/methodology";

const REVIEW_PROMPTS = [
  ["Workload compilation", "Are the logical operation and Toffoli counts credible for this workload?"],
  ["QEC fit", "Is the logical-error fit valid here, and where does extrapolation become unsafe?"],
  ["Control + readout", "Which sensing, transduction, timing, or calibration assumptions are unrealistic?"],
  ["Decoder + feedback", "Can the classical loop sustain this syndrome rate and latency?"],
  ["Missing noise", "Which loss, leakage, correlation, drift, or transport effects must enter the equations next?"],
] as const;

export function ReviewTheModel() {
  const [copied, setCopied] = useState(false);

  const copyReviewLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <section className="review-model" aria-labelledby="review-model-title">
      <div className="review-model__heading">
        <div><span>Review handoff</span><h2 id="review-model-title">Challenge one layer, not the whole demo</h2></div>
        <p>Share this exact state with a domain expert and ask one falsifiable question. Specific corrections make the model useful.</p>
      </div>
      <ol>
        {REVIEW_PROMPTS.map(([title, prompt]) => <li key={title}><strong>{title}</strong><span>{prompt}</span></li>)}
      </ol>
      <div className="review-model__actions">
        <button type="button" onClick={copyReviewLink}>{copied ? "Review link copied" : "Copy this review state"}</button>
        <a href={REPOSITORY_URL} target="_blank" rel="noreferrer">Inspect model code ↗</a>
      </div>
    </section>
  );
}
