/**
 * Sensitivity analysis via symbolic differentiation.
 * Identifies which parameters dominate each cost metric.
 */

import { type Expr, type Bindings, evaluate, differentiate, simplify, pretty } from "./expr";
import { type Architecture } from "./architecture";

export interface SensitivityResult {
  parameter: string;
  cost: string;
  derivative: Expr;       // symbolic d(cost)/d(param)
  derivativeValue: number; // evaluated at bindings
  elasticity: number;      // (d(cost)/d(param)) * (param/cost) — dimensionless
  pretty: string;          // human-readable derivative
}

/**
 * Compute sensitivity of all costs to all parameters.
 */
export function sensitivityAnalysis(
  arch: Architecture,
  bindings: Bindings,
): SensitivityResult[] {
  const costs: Record<string, Expr> = {
    totalQubits: arch.totalQubits,
    blockErrorRate: arch.blockErrorRate,
    runtimeDays: arch.runtimeDays,
    toffoliBudget: arch.toffoliBudget,
  };

  const params = ["p", "cycleTime", "tauToffMul", "toffoliCount"];
  const results: SensitivityResult[] = [];

  for (const [costName, costExpr] of Object.entries(costs)) {
    for (const paramName of params) {
      if (!(paramName in bindings)) continue;

      const deriv = simplify(differentiate(costExpr, paramName));
      let derivValue: number;
      try {
        derivValue = evaluate(deriv, bindings);
      } catch {
        derivValue = NaN;
      }

      let costValue: number;
      try {
        costValue = evaluate(costExpr, bindings);
      } catch {
        costValue = NaN;
      }

      const paramValue = bindings[paramName];
      const elasticity = (derivValue * paramValue) / costValue;

      results.push({
        parameter: paramName,
        cost: costName,
        derivative: deriv,
        derivativeValue: derivValue,
        elasticity: isFinite(elasticity) ? elasticity : 0,
        pretty: pretty(deriv),
      });
    }
  }

  return results;
}

/**
 * Identify which parameter dominates each cost.
 * Returns the parameter with highest |elasticity| for each cost.
 */
export function bottleneckAnalysis(
  sensitivities: SensitivityResult[],
): Record<string, { parameter: string; elasticity: number }> {
  const byCost: Record<string, SensitivityResult[]> = {};
  for (const s of sensitivities) {
    (byCost[s.cost] ??= []).push(s);
  }

  const result: Record<string, { parameter: string; elasticity: number }> = {};
  for (const [cost, items] of Object.entries(byCost)) {
    const sorted = items.sort((a, b) => Math.abs(b.elasticity) - Math.abs(a.elasticity));
    if (sorted.length > 0) {
      result[cost] = { parameter: sorted[0].parameter, elasticity: sorted[0].elasticity };
    }
  }

  return result;
}
