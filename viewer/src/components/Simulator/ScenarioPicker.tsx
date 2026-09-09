"use client";

import type { ArchitectureType, MemoryCode, ProcessorCode, TargetProblem } from "@/compute/interface";
import { useSimulator } from "@/store/simulator";
import configsData from "../../../public/data/example-configs.json";

const scenarios = [
  { label: "Minimum qubits", prompt: "Push below the 10k line.", presetIndex: 0 },
  { label: "Balanced baseline", prompt: "Trade qubits for time.", presetIndex: 1 },
  { label: "Error-rate cliff", prompt: "Find where feasibility breaks.", presetIndex: 2 },
] as const;

export function ScenarioPicker() {
  const store = useSimulator();
  const presets = configsData.configs;

  const applyPreset = (preset: typeof presets[number]) => {
    store.pushHistory();
    store.setPhysicalErrorRate(preset.physicalErrorRate);
    store.setCycleTime(preset.cycleTime);
    store.setArchitectureType(preset.architectureType as ArchitectureType);
    store.setTargetProblem(preset.targetProblem as TargetProblem);
    store.setMemoryCode(preset.memoryCode as MemoryCode);
    store.setProcessorCode(preset.processorCode as ProcessorCode);
  };

  return (
    <section className="scenario-picker" aria-labelledby="scenario-picker-title">
      <div className="component-heading">
        <h2 id="scenario-picker-title">Run a scenario</h2>
        <p>Start with a designed edge case, then tune it.</p>
      </div>
      <div className="scenario-picker__grid">
        {scenarios.map((scenario) => (
          <button type="button" key={scenario.label} onClick={() => applyPreset(presets[scenario.presetIndex])}>
            <strong>{scenario.label}</strong>
            <span>{scenario.prompt}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
