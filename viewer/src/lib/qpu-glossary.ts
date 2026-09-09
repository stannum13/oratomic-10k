import type { ProvenanceKind } from "./qpu-profiles";

export type GlossaryTerm =
  | "physical-qubit" | "logical-qubit" | "qec" | "qldpc" | "surface-code"
  | "block-error" | "physical-error" | "cycle-time" | "syndrome" | "decoder"
  | "toffoli" | "resource-factory" | "ecc-256" | "rsa-2048" | "adc-dac"
  | "denoising" | "classification" | "transduction" | "phy" | "feedback"
  | "walking-cat" | "block-error-target" | "toffoli-budget" | "code-notation";

export interface GlossaryEntry {
  label: string;
  definition: string;
  relevance: string;
  sourceLabel: string;
  sourceUrl: string;
  provenance: ProvenanceKind;
}

export const REQUIRED_GLOSSARY_TERMS: readonly GlossaryTerm[] = [
  "physical-qubit", "logical-qubit", "qec", "qldpc", "surface-code", "block-error",
  "physical-error", "cycle-time", "syndrome", "decoder", "toffoli", "resource-factory",
  "ecc-256", "rsa-2048", "adc-dac", "denoising", "classification", "transduction", "phy", "feedback",
  "walking-cat", "block-error-target", "toffoli-budget", "code-notation",
];

const ORATOMIC = "https://arxiv.org/abs/2603.28627";
const WALKING_CAT = "https://arxiv.org/abs/2604.19481";
const SURFACE_CODE = "https://arxiv.org/abs/1208.0928";
const GOOD_QLDPC = "https://arxiv.org/abs/2111.03654";
const SHOR = "https://arxiv.org/abs/quant-ph/9508027";
const RSA = "https://arxiv.org/abs/1905.09749";

function entry(label: string, definition: string, relevance: string, sourceLabel: string, sourceUrl: string, provenance: ProvenanceKind = "Paper-derived"): GlossaryEntry {
  return { label, definition, relevance, sourceLabel, sourceUrl, provenance };
}

export const QPU_GLOSSARY: Record<GlossaryTerm, GlossaryEntry> = {
  "physical-qubit": entry("Physical qubit", "A controllable physical two-level quantum system, such as an atom, ion, or superconducting circuit.", "These are the actual devices counted and allocated across the architecture.", "Cain et al.", ORATOMIC),
  "logical-qubit": entry("Logical qubit", "Quantum information encoded redundantly across many physical qubits so errors can be detected and managed.", "The workload uses logical qubits while the architecture pays the physical-qubit overhead.", "Fowler et al.", SURFACE_CODE),
  qec: entry("Quantum error correction", "Repeated parity measurements reveal error information without directly reading the protected logical state.", "It connects the physical error assumption to reliable logical computation.", "Fowler et al.", SURFACE_CODE),
  qldpc: entry("qLDPC code", "A quantum error-correcting code whose parity checks each touch only a limited number of qubits.", "High-rate qLDPC codes reduce memory overhead but require demanding connectivity and decoding.", "Panteleev & Kalachev", GOOD_QLDPC),
  "surface-code": entry("Surface code", "A local quantum error-correcting code arranged on a two-dimensional nearest-neighbor lattice.", "It suits fixed planar hardware but typically uses more physical qubits per logical qubit.", "Fowler et al.", SURFACE_CODE),
  "block-error": entry("Block error rate", "The modeled probability that an encoded block fails during one relevant correction or operation interval.", "It determines the reliable-operation budget shown by the simulator.", "Cain et al.", ORATOMIC, "Fitted projection"),
  "physical-error": entry("Physical error rate", "The assumed probability that a physical operation fails in the simplified error model.", "Changing it drives the fitted logical-error projection and feasibility result.", "Cain et al.", ORATOMIC, "Model assumption"),
  "cycle-time": entry("Cycle time", "The elapsed time for one repeated error-correction and control round.", "Runtime scales with this assumption and can be limited by readout, transport, or decoding.", "Cain et al.", ORATOMIC, "Model assumption"),
  syndrome: entry("Syndrome", "A pattern of parity-check outcomes that contains evidence about errors but not the protected logical value itself.", "The classical decoder consumes this stream to infer corrections.", "Fowler et al.", SURFACE_CODE),
  decoder: entry("Decoder", "A classical algorithm that infers a likely error pattern or correction frame from syndrome measurements.", "If it cannot keep up with the QPU cycle, a classical backlog becomes the bottleneck.", "Tripier et al.", WALKING_CAT),
  toffoli: entry("Toffoli gate", "A three-qubit controlled-controlled operation used as a common unit when costing fault-tolerant arithmetic.", "The selected cryptographic circuit requires many such logical operations.", "Gidney & Ekerå", RSA),
  "resource-factory": entry("Resource-state factory", "A subsystem that prepares special entangled states consumed to perform expensive non-Clifford operations fault tolerantly.", "Factory throughput and qubit allocation can limit the overall computation rate.", "Cain et al.", ORATOMIC),
  "ecc-256": entry("ECC-256", "A representative 256-bit elliptic-curve discrete-logarithm workload attacked with Shor's algorithm.", "It is the lower-resource cryptographic scenario in this explorer.", "Shor", SHOR, "Model assumption"),
  "rsa-2048": entry("RSA-2048", "Factoring a 2048-bit RSA modulus using a fault-tolerant implementation of Shor's algorithm.", "It provides a larger comparison workload with different circuit and resource costs.", "Gidney & Ekerå", RSA),
  "adc-dac": entry("ADC / DAC", "Converters that digitize analog measurement signals and reconstruct analog control waveforms from digital commands.", "They form the boundary between the QPU physical layer and classical signal processing.", "Tripier et al.", WALKING_CAT, "Not modeled"),
  denoising: entry("Signal denoising", "Classical filtering, integration, and calibration that improve the quality of noisy measurement evidence.", "It happens before or alongside classification and is distinct from quantum error correction.", "Tripier et al.", WALKING_CAT, "Not modeled"),
  classification: entry("State classification", "The decision process that maps a conditioned analog readout signal to a discrete measurement outcome.", "Classification errors become measurement errors delivered to the syndrome pipeline.", "Google Quantum AI", "https://arxiv.org/abs/2408.13687", "Not modeled"),
  transduction: entry("Transduction", "Conversion of information from one physical carrier or signal form into another measurable form.", "Qubit state becomes optical or microwave evidence before it becomes digital data.", "Tripier et al.", WALKING_CAT, "Not modeled"),
  phy: entry("PHY", "The physical layer that turns abstract commands and data into signals carried by real hardware and a physical medium.", "Quantum computers also depend on receivers, converters, timing, wiring, lasers, and actuators below their digital abstractions.", "Cain et al.", ORATOMIC, "Not modeled"),
  feedback: entry("Feedback loop", "A closed path where measurements inform classical decisions that change later physical control actions.", "Fault-tolerant operation depends on completing this loop within the available timing budget.", "Tripier et al.", WALKING_CAT, "Model assumption"),
  "walking-cat": entry("Walking Cat", "A trapped-ion fault-tolerant architecture that uses subsystem-code measurements and cat-state resources while ions move between specialized zones.", "It is a switchable comparison profile for understanding how a different physical medium changes control, readout, routing, and bottlenecks.", "Walking Cat architecture paper", WALKING_CAT),
  "block-error-target": entry("Why such a small block-error target?", "A long fault-tolerant algorithm performs an enormous number of protected operations, so even a tiny failure chance per block or cycle can accumulate into a meaningful total failure risk.", "The displayed value is compared with the workload length to estimate whether the full computation has enough reliable-operation budget.", "Cain et al.", ORATOMIC, "Fitted projection"),
  "toffoli-budget": entry("Toffoli budget", "The estimated number of logical Toffoli operations that can be attempted before the accumulated modeled block-error probability exceeds the selected success criterion.", "Feasibility compares this reliable-operation budget with the Toffoli count required by ECC-256 or RSA-2048.", "Cain et al.", ORATOMIC, "Fitted projection"),
  "code-notation": entry("[[n, k, d]] code notation", "Quantum-code notation where n is the number of physical qubits, k is the number of encoded logical qubits, and d is the code distance or a stated distance bound.", "For [[4,350, 1,224, ≤20]], the simulator uses 4,350 physical qubits to encode 1,224 logical qubits with the displayed distance bound.", "Panteleev & Kalachev", GOOD_QLDPC),
};

export function getGlossaryEntry(term: GlossaryTerm): GlossaryEntry {
  return QPU_GLOSSARY[term];
}
