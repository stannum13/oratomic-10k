"use client";

import type { ArchitectureType, NoiseModel, TargetProblem } from "@/compute/interface";
import { useSimulator } from "@/store/simulator";
import { SliderKnob, ToggleKnob } from "./Knob";

export function CoreControls({ compact = false }: { compact?: boolean }) {
  const state = useSimulator();

  return (
    <section className="core-controls" aria-labelledby="core-controls-title">
      <div className="component-heading">
        <h2 id="core-controls-title">Tune the machine</h2>
        <p>Change one assumption and follow what moves.</p>
      </div>
      <ToggleKnob<TargetProblem>
        label="Target workload"
        value={state.targetProblem}
        options={[{ value: "ecc-256", label: "ECC-256" }, { value: "rsa-2048", label: "RSA-2048" }]}
        onChange={state.setTargetProblem}
      />
      <SliderKnob label="Physical error rate" value={state.physicalErrorRate} min={0.0001} max={0.01} step={0.0001} logarithmic inputUnit="probability" formatValue={(value) => `${(value * 100).toFixed(2)}%`} onChange={state.setPhysicalErrorRate} />
      <SliderKnob label="Cycle time" value={state.cycleTime} min={0.001} max={10} step={0.001} unit="ms" inputUnit="ms" logarithmic formatValue={(value) => value >= 1 ? value.toFixed(1) : (value * 1000).toFixed(0)} onChange={state.setCycleTime} />
      {!compact && (
        <div className="secondary-controls">
          <ToggleKnob<ArchitectureType> label="Allocation strategy" value={state.architectureType} options={[{ value: "space-efficient", label: "Space" }, { value: "balanced", label: "Balanced" }, { value: "time-efficient", label: "Time" }]} onChange={state.setArchitectureType} />
          <ToggleKnob<NoiseModel> label="Noise model" value={state.noiseModel} options={[{ value: "depolarizing", label: "Depolarizing" }, { value: "biased-z", label: "Biased Z" }, { value: "circuit-level", label: "Circuit" }]} onChange={state.setNoiseModel} />
        </div>
      )}
    </section>
  );
}
