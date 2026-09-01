export interface CodeBlock {
  n: number;
  k: number;
  d: number;
  stabilizerWeight: number;
  encodingRate: number;
}

export interface QubitBreakdown {
  memory: number;
  processor: number;
  resource: number;
  operation: number;
}

export interface TimingWaterfall {
  readout: number;
  transport: number;
  gates: number;
  decode: number;
}

export interface ComputeResult {
  totalQubits: number;
  qubitBreakdown: QubitBreakdown;
  blockErrorRate: number;
  toffoliCount: number;
  toffoliBudget: number;
  runtimeDays: number;
  timingWaterfall: TimingWaterfall;
  // NEW fields
  feasible: boolean;            // toffoliBudget >= toffoliCount
  extrapolationWarning: string | null;  // warning if p outside valid range
  codeParams: { n: number; k: number; d: number; rate: number; weight: number };  // active memory code params
  processorParams: { n: number; k: number; d: number; rate: number; weight: number };  // active processor code params
}

export type ArchitectureType = "space-efficient" | "balanced" | "time-efficient";
export type TargetProblem = "ecc-256" | "rsa-2048";
export type MemoryCode = "lp16" | "lp20" | "lp24";
export type ProcessorCode = "bb18" | "lp-proc";

export interface LiveCodeResult {
  n: number;
  k: number;
  kLowerBound: number;
  stabilizerWeightX: number;
  stabilizerWeightZ: number;
  encodingRate: number;
  tannerEdgesX: [number, number][];
  tannerEdgesZ: [number, number][];
  tannerDataNodes: number;
  tannerCheckNodesX: number;
  tannerCheckNodesZ: number;
  computeTimeMs: number;
}
