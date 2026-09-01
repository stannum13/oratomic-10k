/**
 * Symbolic architecture representation.
 * Encodes the Oratomic paper's architectures as symbolic expressions.
 */

import {
  type Expr, type BoolExpr, type Bindings,
  param, lit, mul, div, pow, sum,
  evaluate, evaluateBool, freeParams,
} from "./expr";
import { type CodeFamily, ORATOMIC_CODES } from "./code-family";

export interface Architecture {
  name: string;

  // Code assignments
  memoryCode: CodeFamily;
  processorCode: CodeFamily;
  factoryCode: CodeFamily;

  // Hardware parameters (symbolic)
  hardware: {
    p: Expr;              // physical error rate
    cycleTime: Expr;      // ms
    gateTime: Expr;       // us
    measurementTime: Expr; // us
    transportTime: Expr;   // us
    decoderLatency: Expr;  // us
  };

  // Zone qubit counts (symbolic)
  zones: {
    memory: Expr;
    processor: Expr;
    resource: Expr;
    operation: Expr;
  };
  totalQubits: Expr;

  // Performance metrics (symbolic)
  blockErrorRate: Expr;
  tauToff: Expr;          // amortized cycles per Toffoli
  toffoliCount: Expr;
  toffoliBudget: Expr;    // max Toffoli at 90% success
  runtimeCycles: Expr;
  runtimeDays: Expr;

  // Feasibility
  feasible: BoolExpr;

  // All constraints
  constraints: BoolExpr[];
}

export interface ArchitectureResult {
  totalQubits: number;
  qubitBreakdown: { memory: number; processor: number; resource: number; operation: number };
  blockErrorRate: number;
  tauToff: number;
  toffoliCount: number;
  toffoliBudget: number;
  runtimeDays: number;
  feasible: boolean;
  allConstraintsMet: boolean;
  freeParameters: string[];
}

// ─── Architecture Constructors ──────────────────────────

const p = param("p");
const cycleTime = param("cycleTime");
const toffoliCountParam = param("toffoliCount");

/**
 * Build a symbolic architecture matching the Oratomic paper's balanced design.
 */
export function balancedArchitecture(
  memory: CodeFamily,
  processor: CodeFamily,
  factory: CodeFamily,
  tauToffMultiplier: Expr,
  zoneQubits: { memory: Expr; processor: Expr; resource: Expr; operation: Expr },
): Architecture {
  const totalQubits = sum(zoneQubits.memory, zoneQubits.processor, zoneQubits.resource, zoneQubits.operation);

  // Block error rate: fitA * p^fitB
  const blockErrorRate = mul(
    memory.fitA || lit(1),
    pow(p, memory.fitB || lit(10)),
  );

  // tau_Toff = multiplier * (2d/3)
  const tauS = div(mul(lit(2), processor.d), lit(3));
  const tauToff = mul(tauToffMultiplier, tauS);

  // Toffoli budget: log(0.9) / (tau_Toff * log(1 - P_L))
  // Since log(1 - P_L) ~ -P_L for small P_L:
  // budget ~ -log(0.9) / (tau_Toff * P_L) = 0.10536 / (tau_Toff * P_L)
  const toffoliBudget = div(lit(-Math.log(0.9)), mul(tauToff, blockErrorRate));

  // Runtime
  const runtimeCycles = mul(toffoliCountParam, tauToff);
  const runtimeDays = div(mul(runtimeCycles, cycleTime), lit(86400000)); // ms to days

  // Feasibility
  const feasible: BoolExpr = { tag: "ge", left: toffoliBudget, right: toffoliCountParam };

  return {
    name: `${memory.name} / ${processor.name}`,
    memoryCode: memory,
    processorCode: processor,
    factoryCode: factory,
    hardware: {
      p,
      cycleTime,
      gateTime: param("gateTime"),
      measurementTime: param("measurementTime"),
      transportTime: param("transportTime"),
      decoderLatency: param("decoderLatency"),
    },
    zones: zoneQubits,
    totalQubits,
    blockErrorRate,
    tauToff,
    toffoliCount: toffoliCountParam,
    toffoliBudget,
    runtimeCycles,
    runtimeDays,
    feasible,
    constraints: [feasible],
  };
}

// ─── Paper's Concrete Architectures ─────────────────────

export const ORATOMIC_ARCHITECTURES = {
  "space-efficient-lp20": balancedArchitecture(
    ORATOMIC_CODES.lp20, ORATOMIC_CODES.bb18, ORATOMIC_CODES.bb18,
    param("tauToffMul"),
    { memory: lit(5913), processor: lit(367), resource: lit(2565), operation: lit(894) },
  ),
  "space-efficient-lp24": balancedArchitecture(
    ORATOMIC_CODES.lp24, ORATOMIC_CODES.bb18, ORATOMIC_CODES.bb18,
    param("tauToffMul"),
    { memory: lit(7177), processor: lit(367), resource: lit(2565), operation: lit(924) },
  ),
  "balanced-lp20": balancedArchitecture(
    ORATOMIC_CODES.lp20, ORATOMIC_CODES.lpProc, ORATOMIC_CODES.bb18,
    param("tauToffMul"),
    { memory: lit(5913), processor: lit(1609), resource: lit(2565), operation: lit(1874) },
  ),
  "balanced-lp24": balancedArchitecture(
    ORATOMIC_CODES.lp24, ORATOMIC_CODES.lpProc, ORATOMIC_CODES.bb18,
    param("tauToffMul"),
    { memory: lit(7177), processor: lit(1609), resource: lit(2565), operation: lit(1904) },
  ),
};

// ─── Instantiation ──────────────────────────────────────

export function instantiate(arch: Architecture, bindings: Bindings): ArchitectureResult {
  return {
    totalQubits: evaluate(arch.totalQubits, bindings),
    qubitBreakdown: {
      memory: evaluate(arch.zones.memory, bindings),
      processor: evaluate(arch.zones.processor, bindings),
      resource: evaluate(arch.zones.resource, bindings),
      operation: evaluate(arch.zones.operation, bindings),
    },
    blockErrorRate: evaluate(arch.blockErrorRate, bindings),
    tauToff: evaluate(arch.tauToff, bindings),
    toffoliCount: evaluate(arch.toffoliCount, bindings),
    toffoliBudget: evaluate(arch.toffoliBudget, bindings),
    runtimeDays: evaluate(arch.runtimeDays, bindings),
    feasible: evaluateBool(arch.feasible, bindings),
    allConstraintsMet: arch.constraints.every(c => evaluateBool(c, bindings)),
    freeParameters: [...freeParams(arch.totalQubits)],
  };
}

// ─── Sweep ──────────────────────────────────────────────

export function sweep(
  arch: Architecture,
  paramName: string,
  values: number[],
  fixed: Bindings,
): { paramValue: number; result: ArchitectureResult }[] {
  return values.map(v => ({
    paramValue: v,
    result: instantiate(arch, { ...fixed, [paramName]: v }),
  }));
}

// ─── Pareto Frontier ────────────────────────────────────

export function pareto(
  points: { bindings: Bindings; result: ArchitectureResult }[],
  costX: (r: ArchitectureResult) => number,
  costY: (r: ArchitectureResult) => number,
): { frontier: typeof points; dominated: typeof points } {
  const frontier: typeof points = [];
  const dominated: typeof points = [];

  for (const point of points) {
    const x = costX(point.result);
    const y = costY(point.result);

    const isDominated = points.some(other => {
      if (other === point) return false;
      return costX(other.result) <= x && costY(other.result) <= y &&
             (costX(other.result) < x || costY(other.result) < y);
    });

    if (isDominated) {
      dominated.push(point);
    } else {
      frontier.push(point);
    }
  }

  // Sort frontier by costX
  frontier.sort((a, b) => costX(a.result) - costX(b.result));

  return { frontier, dominated };
}
