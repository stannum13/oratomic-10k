"use client";

import { PLATFORM_PRESETS } from "@/compute/lookup-tables";
import { getQpuProfile } from "@/lib/qpu-profiles";
import { deriveQpuState } from "@/lib/qpu-state";
import { useSimulator } from "@/store/simulator";
import { Term } from "@/components/ui/Term";

export function QpuSystemView() {
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

  return (
    <div className="qpu-system-view">
      <header className="system-hero">
        <div>
          <p className="system-kicker">QPU + mixed-signal PHY</p>
          <h2>{profile.shortLabel}: from physical signal to feedback</h2>
          <p>A diagnostic abstraction of how this machine senses, conditions, interprets, decodes, and acts—not a microscopic noise simulation.</p>
        </div>
        <a href={profile.sourceUrl} target="_blank" rel="noreferrer">Primary architecture source ↗</a>
      </header>

      <label className="platform-select">
        <span>Hardware architecture</span>
        <select value={simulator.hardwarePlatform} onChange={(event) => simulator.setHardwarePlatform(event.target.value)}>
          {Object.entries(PLATFORM_PRESETS).map(([id, preset]) => <option value={id} key={id}>{preset.label}</option>)}
        </select>
      </label>
      <div className="platform-switcher" role="group" aria-label="QPU platform">
        {Object.entries(PLATFORM_PRESETS).map(([id, preset]) => (
          <button key={id} type="button" aria-pressed={simulator.hardwarePlatform === id} onClick={() => simulator.setHardwarePlatform(id)}>
            {preset.label.replace("Oratomic ", "").replace("IonQ ", "").replace("Google ", "")}
          </button>
        ))}
      </div>

      <nav className="system-anchor-nav" aria-label="PHY sections">
        <a href="#signal-loop">Signal loop</a><a href="#noise-pathways">Noise</a><a href="#system-bottlenecks">Bottlenecks</a><a href="#classical-map">Classical map</a>
      </nav>

      <section className="physical-stack" aria-label={`${profile.shortLabel} physical components`}>
        <article><span>Physical medium</span><p>{profile.medium}</p></article>
        <article><span>Control + actuation</span><p>{profile.control}</p></article>
        <article><span>Sensing + readout</span><p>{profile.readout}</p></article>
      </section>

      <section id="signal-loop" className="signal-loop system-document-section" aria-labelledby="signal-loop-title">
        <div className="system-section-heading"><h3 id="signal-loop-title">Signal loop</h3><span>closed feedback topology</span></div>
        <ol>{profile.signalStages.map((stage, index) => <li key={stage.id} data-layer={stage.layer}><span className="signal-stage__index">{String(index + 1).padStart(2, "0")}</span><div><strong>{stage.label}</strong><p>{stage.description}</p></div></li>)}</ol>
      </section>

      <section id="noise-pathways" className="diagnostic-list system-document-section" aria-labelledby="noise-title">
        <div className="system-section-heading"><h3 id="noise-title">Noise pathways</h3><span>physical effects vs numerical scope</span></div>
        {state.activeNoise.map((item) => <article key={item.label} data-modeled={item.modeled}><span className="diagnostic-mark" aria-hidden="true" /><div><strong>{item.label}</strong><p>{item.description}</p></div><span className="provenance-badge">{item.status}</span></article>)}
      </section>

      <section id="system-bottlenecks" className="diagnostic-list system-document-section" aria-labelledby="bottlenecks-title">
        <div className="system-section-heading"><h3 id="bottlenecks-title">Bottlenecks</h3><span>latency, throughput, topology</span></div>
        {profile.bottlenecks.map((item) => <article key={item.label} data-modeled={item.modeled}><span className="bottleneck-mark" aria-hidden="true" /><div><strong>{item.label}</strong><p>{item.description}</p></div><span className="provenance-badge">{item.modeled ? "Included in model" : "Not modeled"}</span></article>)}
      </section>

      <section id="classical-map" className="signal-loop system-document-section" aria-labelledby="classical-map-title">
        <div className="system-section-heading"><h3 id="classical-map-title">Classical-computer correspondence</h3><span>analogy, not equivalence</span></div>
        <ol>{profile.signalStages.map((stage, index) => <li key={stage.id} data-layer={stage.layer}><span className="signal-stage__index">{String(index + 1).padStart(2, "0")}</span><div><strong>{stage.label}</strong><p>{stage.classicalAnalogy}</p></div></li>)}</ol>
        <p className="analogy-limit"><strong>Where the analogy stops:</strong> a qubit is not a classical bit, and measurement does not copy an unknown quantum state.</p>
      </section>

      <section className="state-explainer system-document-section" aria-labelledby="state-explainer-title" aria-live="polite">
        <div className="system-section-heading"><h3 id="state-explainer-title">Explain this state</h3><span>{simulator.computed.feasible ? "feasible" : "infeasible"}</span></div>
        <p className="state-explainer__lead">{state.causalExplanation}</p>
        <div className="timing-grid">{state.timingStages.map((stage) => <div key={stage.label}><span>{stage.label}</span><strong>{stage.value}</strong></div>)}</div>
        <p><strong>Dominant listed stage:</strong> {state.dominantBottleneck.label}. {state.dominantBottleneck.detail}</p>
      </section>

      <aside className="system-terms" aria-label="Key terms">
        <span>Explore</span><Term term="phy" /><Term term="transduction" /><Term term="adc-dac" /><Term term="denoising" /><Term term="classification" /><Term term="syndrome" /><Term term="decoder" /><Term term="feedback" />
      </aside>
      <footer className="diagnostic-disclaimer"><strong>Diagnostic abstraction.</strong> Physical effects marked “Not modeled” do not alter the current resource equations.</footer>
    </div>
  );
}
