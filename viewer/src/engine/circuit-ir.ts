/**
 * Hierarchical circuit IR with symbolic resource tracking.
 * Encodes Shor's algorithm circuits as nested structures with
 * symbolic gate counts that depend on key size and architecture.
 */

import { type Expr, lit, add, mul, div, param, floor, log10, pow } from "./expr";

export interface CircuitNode {
  name: string;
  type: "primitive" | "composite" | "repeat";

  // For primitives
  gate?: string;

  // For composites
  children?: { node: CircuitNode; repeat: Expr }[];

  // Symbolic resource counts
  resources: {
    logicalQubits: Expr;
    toffoliCount: Expr;
    toffoliDepth: Expr;
    measurements: Expr;
  };
}

// --- Primitive Gates ---

export function toffoli(): CircuitNode {
  return {
    name: "Toffoli",
    type: "primitive",
    gate: "toffoli",
    resources: {
      logicalQubits: lit(3),
      toffoliCount: lit(1),
      toffoliDepth: lit(1),
      measurements: lit(0),
    },
  };
}

export function measurement(): CircuitNode {
  return {
    name: "Measure",
    type: "primitive",
    gate: "measure",
    resources: {
      logicalQubits: lit(1),
      toffoliCount: lit(0),
      toffoliDepth: lit(0),
      measurements: lit(1),
    },
  };
}

// --- Composite Circuits ---

/**
 * Ripple-carry adder on n-bit numbers.
 * From Gidney 2018: n Toffoli gates, n mid-circuit measurements, 3n qubits.
 */
export function rippleCarryAdder(n: Expr): CircuitNode {
  return {
    name: "Ripple-Carry Adder",
    type: "composite",
    children: [
      { node: toffoli(), repeat: n },
      { node: measurement(), repeat: n },
    ],
    resources: {
      logicalQubits: mul(lit(3), n),
      toffoliCount: n,
      toffoliDepth: n,
      measurements: n,
    },
  };
}

/**
 * Controlled ripple-carry adder.
 * 2n Toffoli gates, 2n measurements.
 */
export function controlledAdder(n: Expr): CircuitNode {
  return {
    name: "Controlled Adder",
    type: "composite",
    children: [
      { node: toffoli(), repeat: mul(lit(2), n) },
      { node: measurement(), repeat: mul(lit(2), n) },
    ],
    resources: {
      logicalQubits: add(mul(lit(3), n), lit(1)),
      toffoliCount: mul(lit(2), n),
      toffoliDepth: mul(lit(2), n),
      measurements: mul(lit(2), n),
    },
  };
}

/**
 * Carry-lookahead adder on n-bit numbers (logarithmic depth).
 * ~5n Toffoli gates, ~4*log2(n) Toffoli depth.
 */
export function carryLookaheadAdder(n: Expr): CircuitNode {
  const logN = div(log10(n), log10(lit(2))); // log2(n)
  return {
    name: "Carry-Lookahead Adder",
    type: "composite",
    resources: {
      logicalQubits: mul(lit(4), n), // needs ancillae
      toffoliCount: mul(lit(5), n),
      toffoliDepth: mul(lit(4), logN),
      measurements: lit(0),
    },
  };
}

function pow2(e: Expr): Expr {
  return pow(lit(2), e);
}

/**
 * Unary lookup table.
 * 2^q_a Toffoli gates for q_a address bits and q_w word bits.
 */
export function unaryLookup(addressBits: Expr, wordBits: Expr): CircuitNode {
  const tableSize = pow2(addressBits);
  return {
    name: "Unary Lookup",
    type: "composite",
    resources: {
      logicalQubits: add(mul(lit(2), addressBits), wordBits),
      toffoliCount: tableSize,
      toffoliDepth: tableSize,
      measurements: tableSize,
    },
  };
}

// --- Shor's Algorithm Circuits ---

/**
 * Shor's algorithm for RSA-2048 (Gidney 2025 circuit).
 * ~50% adders on 33 bits, ~50% lookups on 6 address bits.
 */
export function shorRSA(): CircuitNode {
  const adderBits = lit(33);
  const lookupAddr = lit(6);
  const lookupWord = lit(33);
  const totalToffoli = lit(2.7e9);

  return {
    name: "Shor RSA-2048 (Gidney 2025)",
    type: "composite",
    children: [
      { node: rippleCarryAdder(adderBits), repeat: div(totalToffoli, mul(lit(2), adderBits)) },
      { node: unaryLookup(lookupAddr, lookupWord), repeat: div(totalToffoli, mul(lit(2), pow2(lookupAddr))) },
    ],
    resources: {
      logicalQubits: lit(1480), // fits in lp24
      toffoliCount: totalToffoli,
      toffoliDepth: totalToffoli, // serial
      measurements: totalToffoli,
    },
  };
}

/**
 * Shor's algorithm for ECC-256 (Babbush 2026 circuit).
 * 40% 256-bit adders, 50% controlled adders, 10% lookups.
 */
export function shorECC(): CircuitNode {
  const bits = lit(256);
  // Compilation (2) from Babbush 2026 — lower Toffoli count, the paper's headline
  const totalToffoli = lit(9.0e7);

  return {
    name: "Shor ECC-256 (Babbush 2026)",
    type: "composite",
    children: [
      { node: rippleCarryAdder(bits), repeat: floor(div(mul(lit(0.4), totalToffoli), bits)) },
      { node: controlledAdder(bits), repeat: floor(div(mul(lit(0.5), totalToffoli), mul(lit(2), bits))) },
      { node: unaryLookup(lit(16), bits), repeat: floor(div(mul(lit(0.1), totalToffoli), pow2(lit(16)))) },
    ],
    resources: {
      logicalQubits: lit(1224), // fits in lp20
      toffoliCount: totalToffoli,
      toffoliDepth: totalToffoli,
      measurements: totalToffoli,
    },
  };
}

/** Get circuit for a target problem */
export function getCircuit(problem: string): CircuitNode {
  return problem === "rsa-2048" ? shorRSA() : shorECC();
}
