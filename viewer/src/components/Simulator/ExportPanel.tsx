"use client";

import { useSimulator } from "@/store/simulator";

export function ExportPanel() {
  const state = useSimulator();

  const exportJSON = () => {
    const data = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      parameters: {
        physicalErrorRate: state.physicalErrorRate,
        cycleTime: state.cycleTime,
        architectureType: state.architectureType,
        targetProblem: state.targetProblem,
        memoryCode: state.memoryCode,
        processorCode: state.processorCode,
        decoderType: state.decoderType,
      },
      results: {
        totalQubits: state.computed.totalQubits,
        qubitBreakdown: state.computed.qubitBreakdown,
        blockErrorRate: state.computed.blockErrorRate,
        toffoliCount: state.computed.toffoliCount,
        toffoliBudget: state.computed.toffoliBudget,
        runtimeDays: state.computed.runtimeDays,
        feasible: state.computed.feasible,
      },
      codeParams: state.computed.codeParams,
      assumptions: [
        "Depolarizing circuit-level noise model",
        "Power-law error rate extrapolation from Oratomic paper fits",
        `Physical error rate p = ${state.physicalErrorRate}`,
        `Cycle time = ${state.cycleTime} ms`,
        "Sequential Toffoli execution (space-efficient/balanced)",
      ],
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `oratomic-config-${state.architectureType}-${state.memoryCode}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const headers = ["parameter", "value"];
    const rows = [
      ["physicalErrorRate", state.physicalErrorRate],
      ["cycleTime_ms", state.cycleTime],
      ["architectureType", state.architectureType],
      ["targetProblem", state.targetProblem],
      ["memoryCode", state.memoryCode],
      ["processorCode", state.processorCode],
      ["totalQubits", state.computed.totalQubits],
      ["memory_qubits", state.computed.qubitBreakdown.memory],
      ["processor_qubits", state.computed.qubitBreakdown.processor],
      ["resource_qubits", state.computed.qubitBreakdown.resource],
      ["operation_qubits", state.computed.qubitBreakdown.operation],
      ["blockErrorRate", state.computed.blockErrorRate],
      ["toffoliCount", state.computed.toffoliCount],
      ["toffoliBudget", state.computed.toffoliBudget],
      ["runtimeDays", state.computed.runtimeDays],
      ["feasible", state.computed.feasible],
    ];

    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `oratomic-results-${state.architectureType}-${state.memoryCode}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportParityCheck = () => {
    const liveCode = state.liveCode;
    if (!liveCode) {
      alert("Construct LP code first to export parity check matrices");
      return;
    }

    const data = {
      code: state.memoryCode,
      n: liveCode.n,
      k: liveCode.kLowerBound,
      stabilizerWeightX: liveCode.stabilizerWeightX,
      stabilizerWeightZ: liveCode.stabilizerWeightZ,
      encodingRate: liveCode.encodingRate,
      tannerEdgesX: liveCode.tannerEdgesX,
      tannerEdgesZ: liveCode.tannerEdgesZ,
      computeTimeMs: liveCode.computeTimeMs,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `parity-check-${state.memoryCode}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h3 className="text-[10px] text-[var(--text-quaternary)] uppercase tracking-[0.2em] mb-3">
        Export
      </h3>

      <div className="space-y-1.5">
        <button
          onClick={exportJSON}
          className="w-full py-1.5 px-3 bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] rounded-sm text-[10px] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-all text-left flex justify-between"
        >
          <span>Configuration + Results</span>
          <span className="text-[var(--text-quaternary)]">.json</span>
        </button>

        <button
          onClick={exportCSV}
          className="w-full py-1.5 px-3 bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] rounded-sm text-[10px] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-all text-left flex justify-between"
        >
          <span>Results Table</span>
          <span className="text-[var(--text-quaternary)]">.csv</span>
        </button>

        <button
          onClick={exportParityCheck}
          className="w-full py-1.5 px-3 bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] rounded-sm text-[10px] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-all text-left flex justify-between"
        >
          <span>Parity Check Matrices + Tanner</span>
          <span className="text-[var(--text-quaternary)]">.json</span>
        </button>
      </div>
    </div>
  );
}
