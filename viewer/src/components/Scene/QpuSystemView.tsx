"use client";

import { useState } from "react";
import { PLATFORM_PRESETS } from "@/compute/lookup-tables";
import { getQpuProfile } from "@/lib/qpu-profiles";
import { deriveQpuState } from "@/lib/qpu-state";
import { useSimulator } from "@/store/simulator";
import { Term } from "@/components/ui/Term";

type Layer = "signal" | "noise" | "bottlenecks" | "classical";

export function QpuSystemView() {
  const [layer, setLayer] = useState<Layer>("signal");
  const simulator = useSimulator();
  const profile = getQpuProfile(simulator.hardwarePlatform);
  const state = deriveQpuState({
    hardwarePlatform: simulator.hardwarePlatform,
    physicalErrorRate: simulator.physicalErrorRate,
    cycleTime: simulator.cycleTime,
    noiseModel: simulator.noiseModel,
    targetProblem: simulator.targetProblem,
    computed: simulator.computed,
  });

  const layers: Array<{ id: Layer; label: string }> = [
    { id: "signal", label: "Signal loop" },
    { id: "noise", label: "Noise pathways" },
    { id: "bottlenecks", label: "Bottlenecks" },
    { id: "classical", label: "Classical map" },
  ];

  return (
    <div className="qpu-system-view">
      <header className="system-hero">
        <div>
          <div className="system-kicker">QPU + mixed-signal PHY</div>
          <h2>{profile.shortLabel}: from physical signal to feedback</h2>
          <p>A diagnostic abstraction of how this machine senses, cleans, interprets, decodes, and acts—not a microscopic noise simulation.</p>
        </div>
        <a href={profile.sourceUrl} target="_blank" rel="noreferrer">Primary architecture source ↗</a>
      </header>

      <div className="platform-switcher" role="group" aria-label="QPU platform">
        {Object.entries(PLATFORM_PRESETS).map(([id, preset]) => (
          <button key={id} type="button" aria-pressed={simulator.hardwarePlatform === id} onClick={() => simulator.setHardwarePlatform(id)}>
            {preset.label.replace("Oratomic ", "").replace("IonQ ", "").replace("Google ", "")}
          </button>
        ))}
      </div>

      <section className="physical-stack" aria-label={`${profile.shortLabel} physical components`}>
        <article><span>Physical medium</span><p>{profile.medium}</p></article>
        <article><span>Control + actuation</span><p>{profile.control}</p></article>
        <article><span>Sensing + readout</span><p>{profile.readout}</p></article>
      </section>

      <div className="system-layer-switcher" role="group" aria-label="System explanation layer">
        {layers.map((item) => (
          <button key={item.id} type="button" aria-pressed={layer === item.id} onClick={() => setLayer(item.id)}>{item.label}</button>
        ))}
      </div>

      {(layer === "signal" || layer === "classical") && (
        <section className="signal-loop" aria-labelledby="signal-loop-title">
          <div className="system-section-heading">
            <h3 id="signal-loop-title">{layer === "signal" ? "Signal loop" : "Classical-computer correspondence"}</h3>
            <span>closed feedback topology</span>
          </div>
          <ol>
            {profile.signalStages.map((stage, index) => (
              <li key={stage.id} data-layer={stage.layer}>
                <span className="signal-stage__index">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{stage.label}</strong>
                  <p>{layer === "classical" ? stage.classicalAnalogy : stage.description}</p>
                </div>
              </li>
            ))}
          </ol>
          {layer === "classical" && <p className="analogy-limit"><strong>Where the analogy stops:</strong> a qubit is not a classical bit, and measurement does not copy an unknown quantum state.</p>}
        </section>
      )}

      {layer === "noise" && (
        <section className="diagnostic-list" aria-labelledby="noise-title">
          <div className="system-section-heading"><h3 id="noise-title">Noise pathways</h3><span>physical effects vs numerical scope</span></div>
          {state.activeNoise.map((item) => (
            <article key={item.label} data-modeled={item.modeled}>
              <span className="diagnostic-mark" aria-hidden="true" />
              <div><strong>{item.label}</strong><p>{item.description}</p></div>
              <span className="provenance-badge">{item.status}</span>
            </article>
          ))}
        </section>
      )}

      {layer === "bottlenecks" && (
        <section className="diagnostic-list" aria-labelledby="bottlenecks-title">
          <div className="system-section-heading"><h3 id="bottlenecks-title">Bottlenecks</h3><span>latency, throughput, topology</span></div>
          {profile.bottlenecks.map((item) => (
            <article key={item.label} data-modeled={item.modeled}>
              <span className="bottleneck-mark" aria-hidden="true" />
              <div><strong>{item.label}</strong><p>{item.description}</p></div>
              <span className="provenance-badge">{item.modeled ? "Included in model" : "Not modeled"}</span>
            </article>
          ))}
        </section>
      )}

      <section className="state-explainer" aria-labelledby="state-explainer-title" aria-live="polite">
        <div className="system-section-heading"><h3 id="state-explainer-title">Explain this state</h3><span>{simulator.computed.feasible ? "feasible" : "infeasible"}</span></div>
        <p className="state-explainer__lead">{state.causalExplanation}</p>
        <div className="timing-grid">
          {state.timingStages.map((stage) => <div key={stage.label}><span>{stage.label}</span><strong>{stage.value}</strong></div>)}
        </div>
        <p><strong>Dominant listed stage:</strong> {state.dominantBottleneck.label}. {state.dominantBottleneck.detail}</p>
      </section>

      <aside className="system-terms" aria-label="Key terms">
        <span>Explore:</span>
        <Term term="phy" />
        <Term term="transduction" />
        <Term term="adc-dac" />
        <Term term="denoising" />
        <Term term="classification" />
        <Term term="syndrome" />
        <Term term="decoder" />
        <Term term="feedback" />
      </aside>

      <footer className="diagnostic-disclaimer"><strong>Diagnostic abstraction.</strong> Listed physical effects marked “Not modeled” do not alter the current resource equations.</footer>
    </div>
  );
}
