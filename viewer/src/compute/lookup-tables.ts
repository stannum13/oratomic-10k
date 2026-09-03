import type { QubitBreakdown } from "./interface";

export const QUBIT_BREAKDOWNS: Record<string, { breakdown: QubitBreakdown; total: number }> = {
  "space-efficient|lp20": {
    breakdown: { memory: 5913, processor: 367, resource: 2565, operation: 894 },
    total: 9739,
  },
  "space-efficient|lp24": {
    breakdown: { memory: 7177, processor: 367, resource: 2565, operation: 924 },
    total: 11033,
  },
  "balanced|lp20": {
    breakdown: { memory: 5913, processor: 1609, resource: 2565, operation: 1874 },
    total: 11961,
  },
  "balanced|lp24": {
    breakdown: { memory: 7177, processor: 1609, resource: 2565, operation: 1904 },
    total: 13255,
  },
};

export const TAU_TOFF_MULTIPLIERS: Record<string, Record<string, number>> = {
  "space-efficient": { "rsa-2048": 43, "ecc-256": 72 },
  balanced: { "rsa-2048": 10, "ecc-256": 19 },
  "time-efficient": { "rsa-2048": 3, "ecc-256": 3 },
};

export const TOFFOLI_COUNTS: Record<string, number> = {
  "rsa-2048": 2.7e9,
  "ecc-256": 9.0e7,  // Compilation (2) from Babbush 2026 — paper's headline
};

// Add the alternative for reference
export const TOFFOLI_COUNTS_ALT: Record<string, { count: number; label: string }> = {
  "ecc-256-compilation1": { count: 1.35e9, label: "ECC-256 high-qubit compilation" },
  "ecc-256-compilation2": { count: 9.0e7, label: "ECC-256 low-qubit compilation (paper default)" },
  "rsa-2048-gidney": { count: 2.7e9, label: "RSA-2048 (Gidney 2025)" },
};

export const ERROR_FIT_COEFFICIENTS: Record<string, { a: number; b: number }> = {
  lp16: { a: 14.6, b: 7.1 },
  lp20: { a: 1.0, b: 10 },
  lp24: { a: 1.0, b: 12 },
  bb18: { a: 15.65, b: 9 },
  "lp-proc": { a: 18.5, b: 10 },
};

export const TIME_EFFICIENT_PRESETS: Record<string, { qubits: number; runtimeDays: number; parallelism: number }> = {
  "ecc-256": { qubits: 26000, runtimeDays: 10, parallelism: 130 },
  "rsa-2048": { qubits: 102000, runtimeDays: 97, parallelism: 1160 },
};

export const CODE_DETAILS: Record<string, { n: number; k: number; d: number; rate: number; weight: number }> = {
  lp16: { n: 2610, k: 744, d: 16, rate: 0.285, weight: 10 },
  lp20: { n: 4350, k: 1224, d: 20, rate: 0.281, weight: 10 },
  lp24: { n: 5278, k: 1480, d: 24, rate: 0.280, weight: 10 },
  bb18: { n: 248, k: 10, d: 18, rate: 0.04, weight: 6 },
  "lp-proc": { n: 1122, k: 148, d: 20, rate: 0.132, weight: 8 },
};

export const EXTRAPOLATION_VALID_RANGE = { min: 0.0005, max: 0.002 };

export const PLATFORM_PRESETS: Record<string, {
  label: string;
  description: string;
  platform: string;
  defaultErrorRate: number;
  defaultCycleTime: number; // ms
  decoderLatencyUs: number;
  gateTimeUs: number;
  transportTimeUs: number;
  readoutTimeUs: number;
  maxQubitsDemo: number; // demonstrated in lab
  codeType: string;
}> = {
  "oratomic-neutral-atom": {
    label: "Oratomic Neutral Atom",
    description: "Reconfigurable atom arrays with qLDPC codes. Nonlocal connectivity via optical tweezers enables high-rate encoding.",
    platform: "neutral-atom",
    defaultErrorRate: 0.001,
    defaultCycleTime: 1.0,
    decoderLatencyUs: 10000, // BP-LSD
    gateTimeUs: 0.2,
    transportTimeUs: 200,
    readoutTimeUs: 1000,
    maxQubitsDemo: 6100,
    codeType: "qLDPC (lifted product)",
  },
  "ionq-walking-cat": {
    label: "IonQ Walking Cat",
    description: "Trapped-ion architecture with subsystem codes. MegaQuOp-scale decoding demonstrated on Apple M4 Max with <0.3% overhead at p=0.01%.",
    platform: "trapped-ion",
    defaultErrorRate: 0.0001,
    defaultCycleTime: 0.1,
    decoderLatencyUs: 50, // demonstrated on M4 Max
    gateTimeUs: 10,
    transportTimeUs: 50,
    readoutTimeUs: 100,
    maxQubitsDemo: 36,
    codeType: "Subsystem / walking cat",
  },
  "google-surface-code": {
    label: "Google Surface Code",
    description: "Superconducting qubits with planar surface codes. Fixed grid connectivity. Willow processor demonstrated below-threshold operation.",
    platform: "superconducting",
    defaultErrorRate: 0.003,
    defaultCycleTime: 0.001,
    decoderLatencyUs: 1, // FPGA / ASIC
    gateTimeUs: 0.03,
    transportTimeUs: 0, // no transport
    readoutTimeUs: 0.5,
    maxQubitsDemo: 105,
    codeType: "Surface code (planar)",
  },
};

// Qubit estimates for different platforms at RSA-2048 and ECC-256
export const PLATFORM_RESOURCE_ESTIMATES: Record<string, Record<string, { qubits: number; runtimeDays: number }>> = {
  "oratomic-neutral-atom": {
    "ecc-256": { qubits: 9739, runtimeDays: 264 },
    "rsa-2048": { qubits: 13255, runtimeDays: 3958 },
  },
  "ionq-walking-cat": {
    "ecc-256": { qubits: 50000, runtimeDays: 30 }, // estimated
    "rsa-2048": { qubits: 200000, runtimeDays: 365 }, // estimated
  },
  "google-surface-code": {
    "ecc-256": { qubits: 500000, runtimeDays: 0.01 }, // Babbush 2026 at 1µs cycle
    "rsa-2048": { qubits: 4000000, runtimeDays: 7 }, // Gidney 2025
  },
};
