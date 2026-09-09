"use client";

import { PAPER_URL, REPOSITORY_URL } from "@/lib/methodology";
import { getQpuProfile } from "@/lib/qpu-profiles";
import { deriveQpuState } from "@/lib/qpu-state";
import { useSimulator } from "@/store/simulator";

export function MethodologyPanel() {
  const state = useSimulator();
  const profile = getQpuProfile(state.hardwarePlatform);
  const qpuState = deriveQpuState({
    hardwarePlatform: state.hardwarePlatform,
    physicalErrorRate: state.physicalErrorRate,
    cycleTime: state.cycleTime,
    noiseModel: state.noiseModel,
    targetProblem: state.targetProblem,
    computed: state.computed,
  });
  const unmodeled = qpuState.activeNoise.filter((item) => !item.modeled).map((item) => item.label);
  const methods = [
    {
      kind: "Paper-derived",
      title: "Architecture and code baseline",
      detail: `${profile.shortLabel} supplies the physical medium, control/readout topology, and architecture context. Oratomic code parameters and headline resource scenarios follow Cain et al.`,
    },
    {
      kind: "Fitted projection",
      title: "Logical block-error estimate",
      detail: `The selected code's fitted power law maps the ${(state.physicalErrorRate * 100).toFixed(3)}% physical-error assumption to a logical block-error estimate. The fitted range is 0.05%–0.20%.${state.computed.extrapolationWarning ? ` Warning: ${state.computed.extrapolationWarning}` : " This state lies inside that input range."}`,
    },
    {
      kind: "Model assumption",
      title: "Your tunable state",
      detail: `${state.targetProblem.toUpperCase()}, ${state.architectureType} allocation, ${state.memoryCode} memory, ${state.processorCode} processor, ${state.noiseModel} noise, and a ${(state.cycleTime * 1000).toLocaleString()} µs cycle are current inputs—not measured hardware claims.`,
    },
    {
      kind: "Illustrative estimate",
      title: "Timing and cross-platform orientation",
      detail: `${qpuState.dominantBottleneck.label} is the largest listed stage in this profile (${qpuState.dominantBottleneck.detail}). Platform rows are not equivalent published benchmarks.`,
    },
    {
      kind: "Not modeled",
      title: "PHY effects shown diagnostically",
      detail: `${unmodeled.join(", ")} are communicated in the system diagram but do not alter the present resource equations. Analog filtering, denoising, classification confidence, calibration drift, and feedback stability are also outside this scalar model.`,
    },
  ] as const;

  return (
    <div className="methodology-panel">
      <div className="methodology-heading">
        <h3>Methods for this state</h3>
        <p>Each statement below says whether it comes from a paper, a fit, an input you can tune, an orientation estimate, or an explicitly excluded effect.</p>
      </div>
      {methods.map((item) => (
        <div className="methodology-item" key={item.kind}>
          <div className="methodology-kind">{item.kind}</div>
          <div className="methodology-title">{item.title}</div>
          <p>{item.detail}</p>
        </div>
      ))}
      <div className="methodology-links">
        <a href={profile.sourceUrl} target="_blank" rel="noreferrer">{profile.sourceLabel} ↗</a>
        <a href={PAPER_URL} target="_blank" rel="noreferrer">Cain et al., arXiv:2603.28627 ↗</a>
        <a href={REPOSITORY_URL} target="_blank" rel="noreferrer">Implementation and model code ↗</a>
      </div>
    </div>
  );
}
