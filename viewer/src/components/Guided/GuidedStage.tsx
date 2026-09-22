"use client";

import { useState, type ReactNode } from "react";
import { PLATFORM_PRESETS } from "@/compute/lookup-tables";
import type { GuideBeat } from "@/lib/guided-experience";
import { getQpuProfile } from "@/lib/qpu-profiles";
import { deriveQpuState } from "@/lib/qpu-state";
import { formatNumber } from "@/lib/format";
import { formatMilliseconds, formatRuntime } from "@/lib/simulator-presentation";
import { useSimulator } from "@/store/simulator";
import { AllocationBar } from "@/components/Simulator/AllocationBar";
import { FeasibilityStrip } from "@/components/Simulator/FeasibilityStrip";
import { MetricsBlock } from "@/components/Simulator/MetricsBlock";
import { BottleneckExplorer, ClassicalMapExplorer, NoisePathwaysExplorer, SignalFlowExplorer } from "@/components/Scene/SystemConcepts";
import { ReviewTheModel } from "./ReviewTheModel";

const zoneCopy = {
  memory: "Protects logical state while other parts of the machine work.",
  processor: "Hosts the logical operations used by the compiled workload.",
  operation: "Provides room for syndrome extraction and logical movement.",
  resource: "Produces the non-Clifford resource states needed by Toffoli gates.",
} as const;

export function GuidedStage({
  beat,
  qpuView,
  markModified,
  completeAction,
}: {
  beat: GuideBeat;
  qpuView: ReactNode;
  markModified: () => void;
  completeAction: () => void;
}) {
  const simulator = useSimulator();
  const [selectedZone, setSelectedZone] = useState<keyof typeof zoneCopy>("memory");
  const profile = getQpuProfile(simulator.hardwarePlatform);
  const qpuState = deriveQpuState({
    hardwarePlatform: simulator.hardwarePlatform,
    physicalErrorRate: simulator.physicalErrorRate,
    cycleTime: simulator.cycleTime,
    noiseModel: simulator.noiseModel,
    targetProblem: simulator.targetProblem,
    computed: simulator.computed,
  });
  const budgetRatio = simulator.computed.toffoliCount > 0 ? simulator.computed.toffoliBudget / simulator.computed.toffoliCount : 0;

  const setErrorRate = (value: number) => {
    markModified();
    simulator.setPhysicalErrorRate(value);
  };
  const setCycleTime = (value: number) => {
    markModified();
    simulator.setCycleTime(value);
  };

  return (
    <section className="guided-stage" data-stage={beat.stage} aria-label={`${beat.question} interactive stage`}>
      <div className="guided-primary-result" aria-live="polite">
        <span>{beat.stage === "feedback" ? "Dominant listed stage" : beat.stage === "comparison" ? "Selected architecture" : beat.stage === "workload" ? "Modeled operation margin" : beat.stage === "noise" ? "Logical block-error estimate" : beat.stage === "allocation" ? "Physical-qubit budget" : "Current modeled result"}</span>
        <strong>
          {beat.stage === "feedback" ? qpuState.dominantBottleneck.label
            : beat.stage === "comparison" ? profile.shortLabel
            : beat.stage === "workload" ? (budgetRatio >= 100 ? "Budget non-binding" : `${budgetRatio.toFixed(1)}×`)
            : beat.stage === "noise" ? simulator.computed.blockErrorRate.toExponential(1)
            : beat.stage === "allocation" ? formatNumber(simulator.computed.totalQubits)
            : `${formatNumber(simulator.computed.totalQubits)} qubits · ${formatRuntime(simulator.computed.runtimeDays)}`}
        </strong>
      </div>

      {beat.stage === "metrics" && <MetricsBlock />}

      {beat.stage === "allocation" && (
        <div className="guided-allocation">
          <AllocationBar />
          <div className="zone-selector" role="group" aria-label="QPU subsystems">
            {(Object.keys(zoneCopy) as Array<keyof typeof zoneCopy>).map((zone) => (
              <button key={zone} type="button" aria-pressed={selectedZone === zone} onClick={() => { setSelectedZone(zone); completeAction(); }}>
                <strong>{zone}</strong><span>{simulator.computed.qubitBreakdown[zone].toLocaleString()}</span>
              </button>
            ))}
          </div>
          <p className="zone-explanation"><strong>{selectedZone}:</strong> {zoneCopy[selectedZone]}</p>
          <div className="guided-qpu-view">{qpuView}</div>
        </div>
      )}

      {beat.stage === "noise" && (
        <div className="guided-noise">
          <label className="guided-parameter">
            <span><strong>Physical error rate</strong><output>{(simulator.physicalErrorRate * 100).toFixed(2)}%</output></span>
            <input type="range" min="0.0001" max="0.01" step="0.0001" value={simulator.physicalErrorRate} onChange={(event) => setErrorRate(Number(event.target.value))} />
          </label>
          <NoisePathwaysExplorer items={qpuState.activeNoise} focusId={beat.focusId} compact onSelect={beat.awaitAction ? completeAction : undefined} />
        </div>
      )}

      {beat.stage === "feedback" && (
        <div className="guided-feedback">
          {beat.id === "feedback-signal"
            ? <><SignalFlowExplorer profile={profile} focusId={beat.focusId} compact /><ClassicalMapExplorer profile={profile} focusId={beat.focusId} compact /></>
            : <BottleneckExplorer profile={profile} state={qpuState} compact onSelect={completeAction} />}
        </div>
      )}

      {beat.stage === "workload" && (
        <div className="guided-workload">
          <FeasibilityStrip />
          <div className="budget-comparison" aria-label="Required workload and reliable operation budget">
            <div><span>Required workload</span><strong>{formatNumber(simulator.computed.toffoliCount)}</strong><small>Toffolis</small></div>
            <div><span>Reliable budget</span><strong>{formatNumber(simulator.computed.toffoliBudget)}</strong><small>modeled Toffolis</small></div>
          </div>
          <label className="guided-parameter">
            <span><strong>Cycle time</strong><output>{formatMilliseconds(simulator.cycleTime)}</output></span>
            <input type="range" min="0.001" max="10" step="0.001" value={simulator.cycleTime} onChange={(event) => setCycleTime(Number(event.target.value))} />
          </label>
        </div>
      )}

      {beat.stage === "comparison" && (
        <div className="guided-comparison">
          {beat.id === "compare-finish" ? <ReviewTheModel /> : <>
          <div className="architecture-cards" role="group" aria-label="Compare hardware architectures">
            {Object.entries(PLATFORM_PRESETS).map(([id, preset]) => {
              const itemProfile = getQpuProfile(id);
              const core = id === "oratomic-neutral-atom";
              return (
                <button key={id} type="button" aria-pressed={simulator.hardwarePlatform === id} onClick={() => { markModified(); simulator.setHardwarePlatform(id); completeAction(); }}>
                  <span className="evidence-badge">{core ? "Core model" : "Illustrative estimate"}</span>
                  <strong>{itemProfile.shortLabel}</strong>
                  <small>{itemProfile.platformLabel} · {preset.codeType}</small>
                  <p>{itemProfile.topology}</p>
                </button>
              );
            })}
          </div>
          <div className="architecture-disclosure"><strong>{simulator.hardwarePlatform === "oratomic-neutral-atom" ? "Core model" : "Illustrative estimate"}</strong><p>{simulator.hardwarePlatform === "oratomic-neutral-atom" ? "The current symbolic resource equations implement the Oratomic/qLDPC proposal." : "This profile changes the physical and timing story, but does not yet substitute an equally complete architecture-specific resource engine."}</p></div>
          </>}
        </div>
      )}
    </section>
  );
}
