"use client";

import { useSimulator } from "@/store/simulator";
import { deriveFeasibility } from "@/lib/simulator-presentation";
import { formatNumber } from "@/lib/format";

export function FeasibilityStrip() {
  const computed = useSimulator((state) => state.computed);
  const summary = deriveFeasibility(computed);

  return (
    <details className="feasibility-strip" data-state={summary.feasible ? "feasible" : "infeasible"}>
      <summary>
        <span className="feasibility-strip__badge">{summary.feasible ? "Feasible" : "Infeasible"}</span>
        <span><b>Closest constraint:</b> {summary.bindingLabel}</span>
        <strong>{summary.marginLabel}</strong>
      </summary>
      <div className="feasibility-strip__detail">
        <p>{summary.explanation}</p>
        <dl>
          <div><dt>Required workload</dt><dd>{formatNumber(computed.toffoliCount)} Toffolis</dd></div>
          <div><dt>Reliable budget</dt><dd>{formatNumber(computed.toffoliBudget)} Toffolis</dd></div>
        </dl>
        {summary.warning && <p className="feasibility-strip__warning">Fit warning: {summary.warning}</p>}
      </div>
    </details>
  );
}
