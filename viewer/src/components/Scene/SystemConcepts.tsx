"use client";

import { useMemo, useState } from "react";
import type { ActiveDiagnostic, QpuStateSummary } from "@/lib/qpu-state";
import type { QpuProfile } from "@/lib/qpu-profiles";

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function useSelection<T extends { id: string }>(items: T[], focusId?: string) {
  const initial = items.find((item) => item.id === focusId)?.id ?? items[0]?.id ?? "";
  const [selectedId, setSelectedId] = useState(initial);
  const resolved = items.some((item) => item.id === selectedId) ? selectedId : initial;
  return [resolved, setSelectedId] as const;
}

export function SignalFlowExplorer({
  profile,
  focusId,
  compact = false,
  onSelect,
}: {
  profile: QpuProfile;
  focusId?: string;
  compact?: boolean;
  onSelect?: (id: string) => void;
}) {
  const items = profile.signalStages.map((stage) => ({ ...stage, id: stage.id }));
  const [selectedId, setSelectedId] = useSelection(items, focusId);
  const selected = items.find((item) => item.id === selectedId) ?? items[0];
  const select = (id: string) => { setSelectedId(id); onSelect?.(id); };

  return (
    <div className="system-concept signal-flow-explorer" data-compact={compact}>
      <div className="system-concept__rail" role="list" aria-label="Signal and feedback stages">
        {items.map((stage, index) => (
          <button key={stage.id} type="button" aria-pressed={selectedId === stage.id} onClick={() => select(stage.id)}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{stage.label}</strong>
          </button>
        ))}
      </div>
      <article className="system-concept__detail" data-layer={selected.layer}>
        <div className="system-concept__meta"><span>{selected.layer} layer</span><span>{selectedId === "actuation" ? "loop closes here" : "signal advances →"}</span></div>
        <h4>{selected.label}</h4>
        <p>{selected.description}</p>
        <dl>
          <div><dt>Classical correspondence</dt><dd>{selected.classicalAnalogy}</dd></div>
          <div><dt>Boundary</dt><dd>{selected.layer === "quantum" ? "Quantum state" : selected.layer === "analog" ? "Physical signal" : selected.layer === "digital" ? "Digital evidence" : "Physical command"}</dd></div>
        </dl>
      </article>
    </div>
  );
}

export function NoisePathwaysExplorer({
  items,
  focusId,
  compact = false,
  onSelect,
}: {
  items: ActiveDiagnostic[];
  focusId?: string;
  compact?: boolean;
  onSelect?: (id: string) => void;
}) {
  const normalized = useMemo(() => items.map((item) => ({ ...item, id: slug(item.label) })), [items]);
  const [selectedId, setSelectedId] = useSelection(normalized, focusId);
  const selected = normalized.find((item) => item.id === selectedId) ?? normalized[0];
  const included = normalized.filter((item) => item.modeled).length;
  const select = (id: string) => { setSelectedId(id); onSelect?.(id); };

  return (
    <div className="system-concept diagnostic-explorer" data-compact={compact}>
      <div className="scope-summary" aria-label="Numerical noise scope">
        <strong>{included}</strong><span>included in equations</span>
        <strong>{normalized.length - included}</strong><span>shown, not modeled</span>
      </div>
      <div className="diagnostic-explorer__options" role="list" aria-label="Noise pathways">
        {normalized.map((item) => (
          <button key={item.id} type="button" aria-pressed={selectedId === item.id} onClick={() => select(item.id)}>
            <span className="diagnostic-mark" aria-hidden="true" />
            <span>{item.label}</span>
            <small>{item.status}</small>
          </button>
        ))}
      </div>
      <article className="system-concept__detail" data-modeled={selected.modeled}>
        <div className="system-concept__meta"><span>{selected.status}</span><span>enters near {selected.stageId}</span></div>
        <h4>{selected.label}</h4>
        <p>{selected.description}</p>
        <p className="scope-note">{selected.modeled ? "Changing the aggregate physical-error assumption can affect the resource equations." : "This pathway is physically relevant but does not independently alter the current equations."}</p>
      </article>
    </div>
  );
}

export function BottleneckExplorer({
  profile,
  state,
  compact = false,
  onSelect,
}: {
  profile: QpuProfile;
  state: QpuStateSummary;
  compact?: boolean;
  onSelect?: (id: string) => void;
}) {
  const timing = state.timingStages.map((stage) => ({ ...stage, id: slug(stage.label) }));
  const [selectedId, setSelectedId] = useSelection(timing, slug(state.dominantBottleneck.label.replace(" latency", "")));
  const selected = timing.find((stage) => stage.id === selectedId) ?? timing[0];
  const select = (id: string) => { setSelectedId(id); onSelect?.(id); };

  return (
    <div className="system-concept bottleneck-explorer" data-compact={compact}>
      <div className="timing-bars" aria-label="Relative listed stage latencies">
        {timing.map((stage) => (
          <button key={stage.id} type="button" aria-pressed={selectedId === stage.id} onClick={() => select(stage.id)}>
            <span><strong>{stage.label}</strong><small>{stage.value}</small></span>
            <i style={{ width: `${Math.max(stage.fraction * 100, stage.microseconds === null ? 0 : 2)}%` }} />
          </button>
        ))}
      </div>
      <article className="system-concept__detail">
        <div className="system-concept__meta"><span>{selected.provenance}</span><span>{Math.round(selected.fraction * 100)}% of listed latency</span></div>
        <h4>{selected.label}</h4>
        <p>{selected.value === "Not modeled" ? "No latency value is supplied for this stage in the selected profile." : `${selected.value} in the selected hardware profile. Compare this with the configured QEC cycle before treating it as achievable throughput.`}</p>
      </article>
      {!compact && (
        <details className="system-constraints">
          <summary>Other system constraints</summary>
          <ul>{profile.bottlenecks.map((item) => <li key={item.label}><strong>{item.label}</strong><span>{item.description}</span><small>{item.modeled ? "Included in model" : "Not modeled"}</small></li>)}</ul>
        </details>
      )}
    </div>
  );
}

export function ClassicalMapExplorer({
  profile,
  focusId,
  compact = false,
}: {
  profile: QpuProfile;
  focusId?: string;
  compact?: boolean;
}) {
  const items = profile.signalStages.map((stage) => ({ ...stage, id: stage.id }));
  const [selectedId, setSelectedId] = useSelection(items, focusId);
  const selected = items.find((item) => item.id === selectedId) ?? items[0];

  return (
    <div className="system-concept classical-map-explorer" data-compact={compact}>
      <div className="classical-map-explorer__path" role="list" aria-label="Quantum-to-classical correspondence">
        {items.map((stage, index) => (
          <button key={stage.id} type="button" aria-pressed={selectedId === stage.id} onClick={() => setSelectedId(stage.id)}>
            <span>{String(index + 1).padStart(2, "0")}</span><strong>{stage.label}</strong>
          </button>
        ))}
      </div>
      <article className="system-concept__detail">
        <div className="correspondence-pair"><div><span>Quantum system</span><p>{selected.description}</p></div><div><span>Classical analogy</span><p>{selected.classicalAnalogy}</p></div></div>
        <p className="analogy-limit"><strong>Where the analogy stops:</strong> a qubit is not a classical bit, and measurement does not copy an unknown quantum state.</p>
      </article>
    </div>
  );
}
