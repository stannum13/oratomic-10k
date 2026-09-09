"use client";

import type { ReactNode } from "react";
import { useSimulator } from "@/store/simulator";
import { formatRuntime } from "@/lib/simulator-presentation";
import { MetricsBlock } from "./MetricsBlock";
import { CoreControls } from "./CoreControls";
import { FeasibilityStrip } from "./FeasibilityStrip";
import { ScenarioPicker } from "./ScenarioPicker";
import { AllocationBar } from "./AllocationBar";
import { QpuSystemView } from "@/components/Scene/QpuSystemView";
import { Term } from "@/components/ui/Term";

export function MobileSimulator({
  sceneView,
  onSceneView,
  qpuView,
}: {
  sceneView: "qpu" | "system";
  onSceneView: (view: "qpu" | "system") => void;
  qpuView: ReactNode;
}) {
  const computed = useSimulator((state) => state.computed);
  const resetConfig = useSimulator((state) => state.resetConfig);

  const pin = () => {
    const state = useSimulator.getState();
    state.setPinnedConfig({
      label: `${state.architectureType} / ${state.memoryCode}`,
      computed: { ...state.computed },
      params: {
        physicalErrorRate: state.physicalErrorRate,
        cycleTime: state.cycleTime,
        architectureType: state.architectureType,
        targetProblem: state.targetProblem,
        memoryCode: state.memoryCode,
        processorCode: state.processorCode,
      },
    });
  };

  return (
    <main className="mobile-simulator">
      <div data-mobile-section="metrics"><MetricsBlock /></div>
      <div data-mobile-section="controls">
        <CoreControls compact />
        <div className="configuration-actions mobile-actions">
          <button type="button" className="configuration-actions__primary" onClick={pin}>Pin for comparison</button>
          <button type="button" className="configuration-actions__reset" onClick={resetConfig}>Reset configuration</button>
        </div>
      </div>
      <div data-mobile-section="feasibility"><FeasibilityStrip /></div>
      <div data-mobile-section="scenarios"><ScenarioPicker /></div>
      <div data-mobile-section="allocation"><AllocationBar /></div>
      <section className="mobile-visualization" data-mobile-section="visualization" aria-label="Architecture visualization">
        <div className="scene-view-switcher" role="tablist" aria-label="Visualization view">
          <button type="button" role="tab" aria-selected={sceneView === "qpu"} onClick={() => onSceneView("qpu")}>QPU</button>
          <button type="button" role="tab" aria-selected={sceneView === "system"} onClick={() => onSceneView("system")}>PHY + feedback</button>
        </div>
        <div className="mobile-visualization__body">{sceneView === "qpu" ? qpuView : <QpuSystemView />}</div>
      </section>
      <div className="mobile-explainer" data-mobile-section="explainer">
        <details>
          <summary>What is this?</summary>
          <div>
            <h1>What can a 10,000-qubit quantum computer actually do?</h1>
            <p>Give it ECC-256 or RSA-2048, change the physical assumptions, and inspect how qubit allocation, logical error, runtime, and feasibility respond.</p>
            <p>This is an independent, research-informed architecture model. It distinguishes paper-derived inputs, fitted projections, tunable assumptions, illustrative estimates, and effects that are not modeled.</p>
            <nav className="control-terms" aria-label="Definitions">
              <Term term="block-error-target" />
              <Term term="toffoli-budget" />
              <Term term="code-notation" />
              <Term term="walking-cat" />
            </nav>
          </div>
        </details>
      </div>
      <div className="mobile-status-line" aria-live="polite">
        <span data-state={computed.feasible ? "feasible" : "infeasible"}>{computed.feasible ? "Feasible" : "Infeasible"}</span>
        <strong>{formatRuntime(computed.runtimeDays)}</strong>
      </div>
    </main>
  );
}
