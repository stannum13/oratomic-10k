/**
 * Symbolic code family representation.
 * Encodes qLDPC code families through their algebraic structure
 * rather than isolated matrices.
 */

import { type Expr, type BoolExpr, lit, add, mul, sub, pow, div, symMin } from "./expr";

export interface CodeFamily {
  name: string;
  construction: "lifted-product" | "bivariate-bicycle" | "hypergraph-product";

  // Symbolic parameters
  rA: Expr;        // seed matrix rows
  nA: Expr;        // seed matrix cols
  ell: Expr;       // ring/lift order

  // Derived quantities (symbolic)
  n: Expr;         // physical qubits
  k: Expr;         // logical qubits (lower bound)
  d: Expr;         // distance (upper bound)
  rate: Expr;      // k / n
  stabWeight: Expr; // rA + nA

  // Distance bound constraint
  distanceBound: BoolExpr;

  // Concrete seed matrix (if known)
  seedExponents?: number[][];
  ringOrder?: number;

  // Error model fit coefficients
  fitA?: Expr;     // block error rate = fitA * p^fitB
  fitB?: Expr;
}

/**
 * Construct a symbolic LP code family.
 * All quantities are symbolic expressions over the parameters.
 */
export function lpCodeFamily(
  name: string,
  rA: Expr,
  nA: Expr,
  ell: Expr,
  d: Expr,
  opts?: {
    seedExponents?: number[][];
    ringOrder?: number;
    fitA?: number;
    fitB?: number;
  },
): CodeFamily {
  const n = mul(add(mul(rA, rA), mul(nA, nA)), ell);        // (rA^2 + nA^2) * ell
  const k = mul(pow(sub(nA, rA), lit(2)), ell);              // (nA - rA)^2 * ell
  const rate = div(k, n);
  const stabWeight = add(rA, nA);

  // Distance bound: d <= min((rA+1)^(rA+1), (nA+1)^(nA+1))
  // rough bound, not factorial
  const distanceBound: BoolExpr = {
    tag: "le",
    left: d,
    right: symMin(
      pow(add(rA, lit(1)), add(rA, lit(1))),
      pow(add(nA, lit(1)), add(nA, lit(1))),
    ),
  };

  return {
    name,
    construction: "lifted-product",
    rA, nA, ell,
    n, k, d, rate, stabWeight,
    distanceBound,
    seedExponents: opts?.seedExponents,
    ringOrder: opts?.ringOrder,
    fitA: opts?.fitA !== undefined ? lit(opts.fitA) : undefined,
    fitB: opts?.fitB !== undefined ? lit(opts.fitB) : undefined,
  };
}

/**
 * Construct a symbolic BB code family.
 */
export function bbCodeFamily(
  name: string,
  l: Expr,
  m: Expr,
  d: Expr,
  k: Expr,
  opts?: { fitA?: number; fitB?: number },
): CodeFamily {
  const n = mul(lit(2), mul(l, m));  // n = 2*l*m
  const rate = div(k, n);

  return {
    name,
    construction: "bivariate-bicycle",
    rA: lit(1), nA: lit(1), ell: mul(l, m),
    n, k, d, rate,
    stabWeight: lit(6),  // typical for BB codes
    distanceBound: { tag: "bool_lit", value: true },
    fitA: opts?.fitA !== undefined ? lit(opts.fitA) : undefined,
    fitB: opts?.fitB !== undefined ? lit(opts.fitB) : undefined,
  };
}

// ─── Paper's Concrete Code Instances ────────────────────

export const ORATOMIC_CODES = {
  lp16: lpCodeFamily("lp_16^{3,7}", lit(3), lit(7), lit(45), lit(16), {
    seedExponents: [[29,21,31,15,37,25,27],[13,25,19,26,11,18,29],[31,2,27,32,41,41,18]],
    ringOrder: 45,
    fitA: 14.6, fitB: 7.1,
  }),

  lp20: lpCodeFamily("lp_20^{3,7}", lit(3), lit(7), lit(75), lit(20), {
    seedExponents: [[0,71,73,68,33,50,47],[38,39,60,26,18,1,23],[73,6,5,42,20,22,73]],
    ringOrder: 75,
    fitA: 1.0, fitB: 10,
  }),

  lp24: lpCodeFamily("lp_24^{3,7}", lit(3), lit(7), lit(91), lit(24), {
    seedExponents: [[57,75,42,80,7,67,27],[57,73,34,12,27,50,87],[21,53,70,18,1,3,18]],
    ringOrder: 91,
    fitA: 1.0, fitB: 12,
  }),

  lpProc: lpCodeFamily("lp_20^{3,5}", lit(3), lit(5), lit(33), lit(20), {
    seedExponents: [[0,0,0,0,0],[0,14,19,11,26],[0,13,2,15,21]],
    ringOrder: 33,
    fitA: 18.5, fitB: 10,
  }),

  bb18: bbCodeFamily("bb_18", lit(31), lit(4), lit(18), lit(10), {
    fitA: 15.65, fitB: 9,
  }),
} as const;
