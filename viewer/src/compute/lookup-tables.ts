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
