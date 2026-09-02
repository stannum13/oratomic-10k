"use client";

import { useMemo } from "react";
import { useSimulator } from "@/store/simulator";
import { getCircuit, type CircuitNode } from "@/engine/circuit-ir";
import { evaluate, type Bindings } from "@/engine/expr";
import { formatNumber } from "@/lib/format";

function evalExpr(expr: any, bindings: Bindings): number {
  try {
    return evaluate(expr, bindings);
  } catch {
    return 0;
  }
}

function CircuitNodeView({ node, bindings, depth }: { node: CircuitNode; bindings: Bindings; depth: number }) {
  const toffoli = evalExpr(node.resources.toffoliCount, bindings);
  const qubits = evalExpr(node.resources.logicalQubits, bindings);

  return (
    <div style={{ paddingLeft: depth * 16 }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--s3)",
        padding: "var(--s2) 0",
        borderBottom: depth === 0 ? `1px solid var(--border)` : "none",
      }}>
        {/* Connector line */}
        {depth > 0 && (
          <div style={{
            width: 12,
            height: 1,
            background: "var(--border)",
            flexShrink: 0,
          }} />
        )}

        {/* Node info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: depth === 0 ? "var(--fs-body)" : "var(--fs-label)",
            fontWeight: depth === 0 ? 500 : 400,
            color: depth === 0 ? "var(--text-primary)" : "var(--text-secondary)",
          }}>
            {node.name}
          </div>
          {node.type === "primitive" && (
            <span className="mono" style={{
              fontSize: 9,
              color: "var(--text-tertiary)",
            }}>
              {node.gate}
            </span>
          )}
        </div>

        {/* Resource badges */}
        <div style={{ display: "flex", gap: "var(--s3)", flexShrink: 0 }}>
          {toffoli > 0 && (
            <span className="mono" style={{ fontSize: "var(--fs-label)", color: "var(--text-tertiary)" }}>
              {formatNumber(toffoli)} T
            </span>
          )}
          {qubits > 0 && (
            <span className="mono" style={{ fontSize: "var(--fs-label)", color: "var(--text-tertiary)" }}>
              {formatNumber(qubits)} q
            </span>
          )}
        </div>
      </div>

      {/* Children */}
      {node.children && node.children.map((child, i) => {
        const repeatCount = evalExpr(child.repeat, bindings);
        return (
          <div key={i}>
            {repeatCount > 1 && (
              <div style={{
                paddingLeft: (depth + 1) * 16 + 12,
                fontSize: 9,
                color: "var(--text-tertiary)",
                fontFamily: "var(--font-mono)",
                padding: "var(--s1) 0",
              }}>
                ×{formatNumber(repeatCount)}
              </div>
            )}
            <CircuitNodeView node={child.node} bindings={bindings} depth={depth + 1} />
          </div>
        );
      })}
    </div>
  );
}

export function CircuitViewer() {
  const targetProblem = useSimulator((s) => s.targetProblem);

  const circuit = useMemo(() => getCircuit(targetProblem), [targetProblem]);

  const bindings: Bindings = { keyBits: targetProblem === "rsa-2048" ? 2048 : 256 };

  const totalToffoli = evalExpr(circuit.resources.toffoliCount, bindings);
  const totalQubits = evalExpr(circuit.resources.logicalQubits, bindings);
  const totalDepth = evalExpr(circuit.resources.toffoliDepth, bindings);

  return (
    <div>
      {/* Summary */}
      <div style={{
        display: "flex",
        gap: "var(--s5)",
        padding: "var(--s3) 0 var(--s4)",
        borderBottom: `1px solid var(--border)`,
        marginBottom: "var(--s3)",
      }}>
        <div>
          <div className="mono" style={{ fontSize: "var(--fs-body)", fontWeight: 600, color: "var(--text-primary)" }}>
            {formatNumber(totalToffoli)}
          </div>
          <div style={{ fontSize: "var(--fs-label)", color: "var(--text-tertiary)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase" }}>
            Toffoli
          </div>
        </div>
        <div>
          <div className="mono" style={{ fontSize: "var(--fs-body)", fontWeight: 600, color: "var(--text-primary)" }}>
            {formatNumber(totalQubits)}
          </div>
          <div style={{ fontSize: "var(--fs-label)", color: "var(--text-tertiary)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase" }}>
            Logical qubits
          </div>
        </div>
        <div>
          <div className="mono" style={{ fontSize: "var(--fs-body)", fontWeight: 600, color: "var(--text-primary)" }}>
            {formatNumber(totalDepth)}
          </div>
          <div style={{ fontSize: "var(--fs-label)", color: "var(--text-tertiary)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase" }}>
            Toffoli depth
          </div>
        </div>
      </div>

      {/* Circuit tree */}
      <CircuitNodeView node={circuit} bindings={bindings} depth={0} />
    </div>
  );
}
