"use client";

import { useState } from "react";
import { useSimulator } from "@/store/simulator";

export function CustomCodeEntry() {
  const computeLiveCode = useSimulator((s) => s.computeLiveCode);
  const liveCodeLoading = useSimulator((s) => s.liveCodeLoading);

  const [ringOrder, setRingOrder] = useState("45");
  const [matrixText, setMatrixText] = useState(
    "29,21,31,15,37,25,27\n13,25,19,26,11,18,29\n31,2,27,32,41,41,18"
  );
  const [error, setError] = useState("");

  const handleConstruct = () => {
    try {
      const order = parseInt(ringOrder);
      if (isNaN(order) || order < 2) {
        setError("Ring order must be >= 2");
        return;
      }

      const entries = matrixText
        .trim()
        .split("\n")
        .map(line => line.split(",").map(s => {
          const n = parseInt(s.trim());
          if (isNaN(n)) throw new Error(`Invalid number: ${s}`);
          return n;
        }));

      if (entries.length === 0 || entries[0].length === 0) {
        setError("Matrix cannot be empty");
        return;
      }

      const cols = entries[0].length;
      if (!entries.every(row => row.length === cols)) {
        setError("All rows must have the same number of columns");
        return;
      }

      // Validate exponents are in range
      for (const row of entries) {
        for (const val of row) {
          if (val < 0 || val >= order) {
            setError(`Exponent ${val} out of range [0, ${order - 1}]`);
            return;
          }
        }
      }

      setError("");

      // Store custom seed matrix and construct
      import("@/compute/code-worker").then(({ computeCodeSync }) => {
        const result = computeCodeSync({
          type: "construct",
          seedExponents: entries,
          ringOrder: order,
        });

        useSimulator.setState({
          liveCode: {
            n: result.code.n,
            k: result.code.k,
            kLowerBound: result.code.kLowerBound,
            stabilizerWeightX: result.code.stabilizerWeightX,
            stabilizerWeightZ: result.code.stabilizerWeightZ,
            encodingRate: result.code.encodingRate,
            tannerEdgesX: result.tanner.sampleEdgesX,
            tannerEdgesZ: result.tanner.sampleEdgesZ,
            tannerDataNodes: result.tanner.dataNodes,
            tannerCheckNodesX: result.tanner.checkNodesX,
            tannerCheckNodesZ: result.tanner.checkNodesZ,
            computeTimeMs: result.computeTimeMs,
          },
          liveCodeLoading: false,
        });
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "var(--s3)" }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "var(--s2)",
        }}>
          <span style={{ fontSize: "var(--fs-label)", color: "var(--text-tertiary)" }}>
            Ring order l
          </span>
          <input
            type="number"
            value={ringOrder}
            onChange={e => setRingOrder(e.target.value)}
            style={{
              width: 60,
              padding: "var(--s1) var(--s2)",
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: 3,
              color: "var(--text-primary)",
              fontFamily: "var(--font-mono)",
              fontSize: "var(--fs-mono-sm)",
              textAlign: "right",
            }}
          />
        </div>

        <div style={{ marginBottom: "var(--s2)" }}>
          <span style={{
            fontSize: "var(--fs-label)",
            color: "var(--text-tertiary)",
            display: "block",
            marginBottom: "var(--s1)",
          }}>
            Seed matrix exponents (comma-separated rows)
          </span>
          <textarea
            value={matrixText}
            onChange={e => setMatrixText(e.target.value)}
            rows={4}
            style={{
              width: "100%",
              padding: "var(--s2)",
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: 3,
              color: "var(--text-primary)",
              fontFamily: "var(--font-mono)",
              fontSize: "var(--fs-mono-sm)",
              resize: "vertical",
              lineHeight: 1.5,
            }}
          />
        </div>
      </div>

      {error && (
        <div style={{
          fontSize: "var(--fs-label)",
          color: "var(--status-fail)",
          marginBottom: "var(--s2)",
        }}>
          {error}
        </div>
      )}

      <button
        onClick={handleConstruct}
        disabled={liveCodeLoading}
        style={{
          width: "100%",
          padding: "var(--s2) var(--s3)",
          background: "var(--bg-elevated)",
          border: "1px solid var(--border)",
          borderRadius: 3,
          color: "var(--text-secondary)",
          fontSize: "var(--fs-label)",
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        {liveCodeLoading ? "Constructing..." : "Construct custom code"}
      </button>
    </div>
  );
}
