export type ProvenanceKind =
  | "Paper-derived"
  | "Fitted projection"
  | "Model assumption"
  | "Illustrative estimate"
  | "Not modeled";

export interface SignalStage {
  id: string;
  label: string;
  layer: "quantum" | "analog" | "digital" | "feedback";
  description: string;
  classicalAnalogy: string;
}

export interface DiagnosticItem {
  label: string;
  description: string;
  stageId: string;
  modeled: boolean;
}

export interface QpuProfile {
  id: string;
  shortLabel: string;
  medium: string;
  control: string;
  readout: string;
  topology: string;
  signalStages: SignalStage[];
  noise: DiagnosticItem[];
  bottlenecks: DiagnosticItem[];
  sourceUrl: string;
  sourceLabel: string;
}

function stages(copy: {
  qubits: string;
  sensing: string;
  analog: string;
  actuation: string;
}): SignalStage[] {
  return [
    { id: "qpu", label: "Physical qubits", layer: "quantum", description: copy.qubits, classicalAnalogy: "Physical medium + device PHY; unlike bits, unknown quantum states cannot be copied." },
    { id: "readout", label: "Sensing + readout", layer: "analog", description: copy.sensing, classicalAnalogy: "Receiver or sensor front end." },
    { id: "analog", label: "Analog front end", layer: "analog", description: copy.analog, classicalAnalogy: "Amplification, filtering, impedance matching, and signal conditioning." },
    { id: "adc", label: "ADC + transduction", layer: "analog", description: "Convert the conditioned physical signal into sampled digital evidence.", classicalAnalogy: "The analog-to-digital boundary of a mixed-signal computer." },
    { id: "dsp", label: "Filter + denoise", layer: "digital", description: "Filter sampled readout evidence, compensate drift, and integrate observations before classification. This cannot undo a physical quantum error or recover an unmeasured state.", classicalAnalogy: "Digital signal processing before a detector or modem makes a decision." },
    { id: "classify", label: "State classification", layer: "digital", description: "Map a conditioned signal to a discrete measurement outcome and confidence.", classicalAnalogy: "Symbol detection: converting a noisy waveform into a digital symbol." },
    { id: "decode", label: "Syndrome decoder", layer: "digital", description: "Infer a likely physical-error pattern from many parity-check outcomes.", classicalAnalogy: "An error-correcting-code decoder operating on a continuous stream." },
    { id: "schedule", label: "Control + scheduler", layer: "feedback", description: "Choose correction-frame updates and schedule the next operations under hardware constraints.", classicalAnalogy: "Compute/control plane, runtime scheduler, and accelerator command queue." },
    { id: "actuation", label: "DAC + physical actuation", layer: "feedback", description: copy.actuation, classicalAnalogy: "Transmitter and PHY driver turning digital commands back into physical signals." },
  ];
}

export const QPU_PROFILES: Record<string, QpuProfile> = {
  "oratomic-neutral-atom": {
    id: "oratomic-neutral-atom",
    shortLabel: "Oratomic",
    medium: "Individually trapped neutral atoms held in optical tweezers inside a vacuum system.",
    control: "Acousto-optic deflectors reposition tweezers; laser pulses drive Rydberg-mediated gates.",
    readout: "State-dependent fluorescence is collected by imaging optics and converted into detector signals.",
    topology: "Reconfigurable memory, processor, operation, and resource zones support nonlocal qLDPC checks.",
    signalStages: stages({
      qubits: "Neutral-atom hyperfine states carry quantum information while optical tweezers define and move the array.",
      sensing: "Fluorescence photons encode a state-dependent measurement signal.",
      analog: "Imaging optics and detector electronics collect, amplify, and condition sparse photon signals.",
      actuation: "Waveform generators drive AODs and lasers to move atoms and apply gates or frame-conditioned operations.",
    }),
    noise: [
      { label: "Gate + control error", description: "Imperfect laser amplitude, phase, detuning, or Rydberg interaction.", stageId: "qpu", modeled: true },
      { label: "Readout error", description: "Overlapping photon-count distributions can produce a wrong discrete outcome.", stageId: "readout", modeled: false },
      { label: "Atom loss", description: "A trapped atom can leave the array and create an erasure-like event.", stageId: "qpu", modeled: false },
      { label: "Transport error", description: "Motion can heat, lose, or dephase atoms during rearrangement.", stageId: "actuation", modeled: false },
      { label: "Decoherence + correlated disturbance", description: "Dephasing and shared laser or field fluctuations can correlate errors.", stageId: "qpu", modeled: false },
    ],
    bottlenecks: [
      { label: "Readout latency", description: "Fluorescence collection can dominate an error-correction cycle.", stageId: "readout", modeled: true },
      { label: "Transport latency", description: "Reconfiguration buys connectivity but adds physical movement time.", stageId: "actuation", modeled: true },
      { label: "Decoder backlog", description: "Syndromes arriving faster than they are decoded stall feedback.", stageId: "decode", modeled: true },
      { label: "Resource-state supply", description: "Non-Clifford operations wait when resource production is too slow.", stageId: "schedule", modeled: true },
      { label: "Physical-qubit capacity", description: "Memory and factories compete for a finite physical-qubit budget.", stageId: "qpu", modeled: true },
    ],
    sourceUrl: "https://arxiv.org/abs/2603.28627",
    sourceLabel: "Cain et al. — Oratomic architecture",
  },
  "ionq-walking-cat": {
    id: "ionq-walking-cat",
    shortLabel: "Walking Cat",
    medium: "Trapped-ion chains and modules confined by radio-frequency electric fields.",
    control: "Laser pulses perform gates while electrode waveforms shuttle ions between memory, gate, and readout regions.",
    readout: "State-dependent ion fluorescence is collected and classified into measurement outcomes.",
    topology: "Subsystem-code blocks, gate zones, cat-state factories, shuttling paths, and modular photonic links.",
    signalStages: stages({
      qubits: "Long-lived ion states carry quantum information in segmented RF traps.",
      sensing: "State-dependent fluorescence produces photon-count evidence for each ion.",
      analog: "Collection optics and photon detectors condition sparse optical signals.",
      actuation: "DAC and RF/laser controllers translate schedules into trap voltages and optical pulses.",
    }),
    noise: [
      { label: "Gate + control error", description: "Laser and motional-mode imperfections reduce gate fidelity.", stageId: "qpu", modeled: true },
      { label: "Readout error", description: "Finite photon statistics can misclassify an ion state.", stageId: "readout", modeled: false },
      { label: "Shuttling error", description: "Transport can heat motional modes or add phase error.", stageId: "actuation", modeled: false },
      { label: "Crosstalk", description: "Control light or collective motion can affect neighboring ions.", stageId: "qpu", modeled: false },
      { label: "Photon loss", description: "Modular optical links can lose heralding photons.", stageId: "readout", modeled: false },
    ],
    bottlenecks: [
      { label: "Gate latency", description: "Entangling-gate duration constrains logical operation rate.", stageId: "qpu", modeled: true },
      { label: "Shuttling + routing", description: "Moving ions between zones adds scheduling pressure.", stageId: "actuation", modeled: true },
      { label: "Decoder throughput", description: "Classical correction must keep pace with syndrome rounds.", stageId: "decode", modeled: true },
      { label: "Cat-state supply", description: "Logical measurements consume distributed resource states.", stageId: "schedule", modeled: false },
      { label: "Module scaling", description: "Trap capacity and inter-module links constrain topology.", stageId: "qpu", modeled: false },
    ],
    sourceUrl: "https://arxiv.org/abs/2604.19481",
    sourceLabel: "Walking Cat architecture paper",
  },
  "google-surface-code": {
    id: "google-surface-code",
    shortLabel: "Surface Code",
    medium: "Superconducting transmon qubits and tunable couplers operated in a cryogenic stack.",
    control: "Room-temperature pulse synthesis drives microwave control lines through cryogenic attenuation and wiring.",
    readout: "Dispersive resonators, amplifiers, ADCs, and FPGA-class processing convert microwave response into outcomes.",
    topology: "A fixed planar nearest-neighbor grid supporting repeated surface-code stabilizer measurements.",
    signalStages: stages({
      qubits: "Lithographic transmons and couplers carry quantum information at millikelvin temperature.",
      sensing: "Readout resonators imprint qubit state onto microwave amplitude and phase.",
      analog: "Cryogenic and room-temperature amplifiers condition the returning microwave signal.",
      actuation: "DAC and microwave electronics synthesize calibrated pulses sent through the cryogenic stack.",
    }),
    noise: [
      { label: "Gate + control error", description: "Pulse, calibration, and coupler imperfections create operation errors.", stageId: "qpu", modeled: true },
      { label: "Relaxation + dephasing", description: "Energy loss and phase diffusion degrade stored states.", stageId: "qpu", modeled: false },
      { label: "Leakage", description: "A transmon can leave the intended two-level computational subspace.", stageId: "qpu", modeled: false },
      { label: "Readout error", description: "Overlapping microwave responses can be classified incorrectly.", stageId: "classify", modeled: false },
      { label: "Crosstalk", description: "Control and coupler activity can disturb nearby qubits.", stageId: "qpu", modeled: false },
    ],
    bottlenecks: [
      { label: "Fixed connectivity", description: "Nearest-neighbor geometry adds routing and code overhead.", stageId: "qpu", modeled: false },
      { label: "Cryogenic I/O", description: "Wiring, heat load, and control bandwidth constrain scale.", stageId: "analog", modeled: false },
      { label: "Calibration load", description: "Many analog channels require continuous characterization.", stageId: "dsp", modeled: false },
      { label: "Decoder throughput", description: "Fast cycles demand equally fast streaming decoding.", stageId: "decode", modeled: true },
      { label: "Code overhead", description: "Planar surface codes trade local connectivity for more physical qubits.", stageId: "qpu", modeled: true },
    ],
    sourceUrl: "https://arxiv.org/abs/2408.13687",
    sourceLabel: "Google Quantum AI — below-threshold surface code",
  },
};

export function getQpuProfile(id: string): QpuProfile {
  return QPU_PROFILES[id] ?? QPU_PROFILES["oratomic-neutral-atom"];
}
