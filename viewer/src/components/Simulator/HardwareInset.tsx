"use client";

import { useSimulator } from "@/store/simulator";
import { PLATFORM_PRESETS } from "@/compute/lookup-tables";

interface QubitModality {
  qubitType: string;
  qubitDescription: string;
  interconnect: string;
  interconnectDescription: string;
  gateMethod: string;
  readoutMethod: string;
  bottleneck: string;
  diagram: string[]; // ASCII art of the connectivity
}

const MODALITIES: Record<string, QubitModality> = {
  "oratomic-neutral-atom": {
    qubitType: "\u2078\u2077Rb / \u00B9\u2077\u00B9Yb atoms in optical tweezers",
    qubitDescription: "Qubits encoded in hyperfine clock states of individual atoms, each trapped in a focused laser beam (tweezer). Coherence time: seconds to minutes.",
    interconnect: "Reconfigurable AOD transport",
    interconnectDescription: "Atoms physically moved by acousto-optic deflectors. Any-to-any connectivity by rearranging the array. Transport time ~200\u00B5s. This nonlocal connectivity enables qLDPC codes that need weight-10 stabilizers spanning the array.",
    gateMethod: "Rydberg CZ \u2014 200ns pulse, 99.9% fidelity",
    readoutMethod: "Fluorescence imaging \u2014 1ms, destructive",
    bottleneck: "Readout speed. Fluorescence collection requires long exposure. Limits cycle time to ~1ms. Cavity-enhanced readout could reach ~1\u00B5s.",
    diagram: [
      "  \u25CF \u25CF \u25CF \u25CF \u25CF    \u2190 tweezer array",
      "  \u2502 \u2502 \u2502 \u2502 \u2502",
      "  \u25CF\u2500\u25CF\u2500\u25CF\u2500\u25CF\u2500\u25CF    \u2190 atoms rearrange",
      "  \u2195 \u2195 \u2195 \u2195 \u2195      via AOD transport",
      "  \u25CF \u25CF \u25CF \u25CF \u25CF",
      "  \u2502       \u2502",
      "  \u25CF\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u25CF    \u2190 nonlocal gate",
    ],
  },
  "ionq-walking-cat": {
    qubitType: "\u00B9\u2077\u00B9Yb\u207A trapped ions in linear RF trap",
    qubitDescription: "Qubits encoded in hyperfine ground states of ytterbium ions, confined by radio-frequency electric fields. Coherence time: minutes to hours.",
    interconnect: "Ion shuttling + photonic links",
    interconnectDescription: "Ions physically transported between trap zones by modulating electrode voltages. 'Walking cat' architecture uses subsystem codes with ions moving through gate zones. Shuttling time ~50\u00B5s.",
    gateMethod: "M\u00F8lmer-S\u00F8rensen \u2014 10\u00B5s pulse, 99.97% fidelity",
    readoutMethod: "State-dependent fluorescence \u2014 100\u00B5s, non-destructive",
    bottleneck: "Gate speed and ion chain scaling. MS gates require precise control of motional modes. Chains beyond ~30 ions suffer crosstalk. Photonic interconnects can link modules but add loss.",
    diagram: [
      "  \u2295\u2500\u2295\u2500\u2295\u2500\u2295\u2500\u2295    \u2190 ion chain",
      "  \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550      RF trap electrodes",
      "       \u2193 shuttle",
      "  \u2295\u2500\u2295\u2500\u2295\u2500\u2295\u2500\u2295    \u2190 gate zone",
      "  \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550",
      "       \u2193 photonic link",
      "  \u2295\u2500\u2295\u2500\u2295\u2500\u2295\u2500\u2295    \u2190 module 2",
    ],
  },
  "google-surface-code": {
    qubitType: "Transmon superconducting qubit",
    qubitDescription: "Aluminum/niobium Josephson junctions on silicon, operated at 15mK. Fixed frequency, tunable coupler. Coherence time: ~100\u00B5s.",
    interconnect: "Fixed planar grid + tunable couplers",
    interconnectDescription: "Qubits are lithographically defined on a 2D chip. Each qubit connects only to nearest neighbors (degree 4). No reconfiguration possible. This forces surface codes with low encoding rate.",
    gateMethod: "Microwave CZ \u2014 30ns pulse, 99.7% fidelity",
    readoutMethod: "Dispersive readout \u2014 500ns, QND",
    bottleneck: "Connectivity. Fixed grid means only nearest-neighbor gates. Surface codes need ~1000 physical qubits per logical qubit. qLDPC codes require nonlocal connections that this hardware cannot provide.",
    diagram: [
      "  \u25CF\u2500\u25CF\u2500\u25CF\u2500\u25CF\u2500\u25CF    \u2190 transmon grid",
      "  \u2502 \u2502 \u2502 \u2502 \u2502",
      "  \u25CF\u2500\u25CF\u2500\u25CF\u2500\u25CF\u2500\u25CF      nearest-neighbor",
      "  \u2502 \u2502 \u2502 \u2502 \u2502      only",
      "  \u25CF\u2500\u25CF\u2500\u25CF\u2500\u25CF\u2500\u25CF",
      "  \u2502 \u2502 \u2502 \u2502 \u2502",
      "  \u25CF\u2500\u25CF\u2500\u25CF\u2500\u25CF\u2500\u25CF    \u2190 fixed topology",
    ],
  },
};

export function HardwareInset() {
  const hardwarePlatform = useSimulator((s) => s.hardwarePlatform);
  const preset = PLATFORM_PRESETS[hardwarePlatform];
  const modality = MODALITIES[hardwarePlatform];

  if (!modality || !preset) return null;

  return (
    <div>
      {/* Platform header */}
      <div style={{
        fontSize: "var(--fs-label)",
        fontWeight: 500,
        color: "var(--text-primary)",
        marginBottom: "var(--s3)",
      }}>
        {preset.label}
      </div>

      {/* Connectivity diagram */}
      <div style={{
        padding: "var(--s3)",
        background: "var(--bg)",
        borderRadius: 3,
        marginBottom: "var(--s3)",
        overflow: "hidden",
      }}>
        <pre className="mono" style={{
          fontSize: 9,
          lineHeight: 1.4,
          color: "var(--text-secondary)",
          margin: 0,
          whiteSpace: "pre",
        }}>
          {modality.diagram.join("\n")}
        </pre>
      </div>

      {/* Specs grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--s3)" }}>
        {[
          { label: "Qubit", value: modality.qubitType, detail: modality.qubitDescription },
          { label: "Interconnect", value: modality.interconnect, detail: modality.interconnectDescription },
          { label: "Gate", value: modality.gateMethod },
          { label: "Readout", value: modality.readoutMethod },
          { label: "Bottleneck", value: modality.bottleneck },
        ].map(spec => (
          <div key={spec.label}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 2,
            }}>
              <span style={{
                fontSize: 9,
                color: "var(--text-tertiary)",
                letterSpacing: "var(--tracking-label)",
                textTransform: "uppercase",
              }}>
                {spec.label}
              </span>
            </div>
            <div style={{
              fontSize: "var(--fs-label)",
              color: "var(--text-secondary)",
              lineHeight: 1.4,
            }}>
              {spec.value}
            </div>
            {spec.detail && (
              <div style={{
                fontSize: 9,
                color: "var(--text-tertiary)",
                lineHeight: 1.5,
                marginTop: 2,
              }}>
                {spec.detail}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
