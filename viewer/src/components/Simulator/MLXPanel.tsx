"use client";

import { useState, useEffect } from "react";
import { useSimulator } from "@/store/simulator";
import { mlxBridge } from "@/compute/mlx-bridge";

function useMLXConnection() {
  const [connected, setConnected] = useState(false);
  useEffect(() => {
    setConnected(mlxBridge.isConnected());
    const unsub = mlxBridge.onConnectionChange(setConnected);
    return () => { unsub(); };
  }, []);
  return connected;
}

// ─── BP Decoder Section ─────────────────────────────────
function BPDecoderPanel() {
  const liveCode = useSimulator((s) => s.liveCode);
  const physicalErrorRate = useSimulator((s) => s.physicalErrorRate);
  const [result, setResult] = useState<any>(null);
  const [sweepResults, setSweepResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const connected = useMLXConnection();

  const handleDecode = async () => {
    if (!liveCode || !connected) return;
    setLoading(true);
    try {
      const res = await mlxBridge.bpDecode({
        edges: liveCode.tannerEdgesX,
        numChecks: liveCode.tannerCheckNodesX,
        numData: liveCode.tannerDataNodes,
        physicalErrorRate,
        maxIterations: 100,
      });
      setResult(res);
    } catch (e: any) {
      setResult({ error: e.message });
    }
    setLoading(false);
  };

  const handleSweep = async () => {
    if (!liveCode || !connected) return;
    setLoading(true);
    try {
      const rates = [0.0005, 0.001, 0.002, 0.005, 0.008, 0.01, 0.015, 0.02];
      const res = await mlxBridge.bpSweep({
        edges: liveCode.tannerEdgesX,
        numChecks: liveCode.tannerCheckNodesX,
        numData: liveCode.tannerDataNodes,
        errorRates: rates,
        trialsPerRate: 10,
      });
      setSweepResults(res);
    } catch (e: any) {
      setSweepResults({ error: e.message });
    }
    setLoading(false);
  };

  const needsCode = !liveCode;

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button
          onClick={handleDecode}
          disabled={loading || !connected || needsCode}
          className="flex-1 py-1.5 bg-[#00d4ff]/10 hover:bg-[#00d4ff]/20 border border-[#00d4ff]/20 rounded-sm text-[10px] text-[#00d4ff] transition-all disabled:opacity-30"
        >
          {loading ? "Decoding..." : "Run BP Decode"}
        </button>
        <button
          onClick={handleSweep}
          disabled={loading || !connected || needsCode}
          className="flex-1 py-1.5 bg-[#6366f1]/10 hover:bg-[#6366f1]/20 border border-[#6366f1]/20 rounded-sm text-[10px] text-[#6366f1] transition-all disabled:opacity-30"
        >
          {loading ? "Sweeping..." : "Error Rate Sweep"}
        </button>
      </div>

      {needsCode && (
        <p className="text-[9px] text-[var(--text-quaternary)]">Construct LP code first</p>
      )}

      {result && !result.error && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-sm p-2 space-y-1">
          <div className="flex justify-between text-[10px]">
            <span className="text-[var(--text-tertiary)]">Status</span>
            <span className={result.converged ? "text-[#22c55e]" : "text-[#ef4444]"}>
              {result.converged ? "CONVERGED" : "FAILED"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[10px]">
            <span className="text-[var(--text-tertiary)]">Iterations</span>
            <span className="text-[var(--text-secondary)]">{result.iterations}</span>
            <span className="text-[var(--text-tertiary)]">Error weight</span>
            <span className="text-[var(--text-secondary)]">{result.errorWeight}</span>
            <span className="text-[var(--text-tertiary)]">Time</span>
            <span className="text-[var(--text-secondary)]">{result.timeMs?.toFixed(1)} ms</span>
            <span className="text-[var(--text-tertiary)]">Backend</span>
            <span className="text-[var(--text-secondary)]">{result.backend}</span>
          </div>
        </div>
      )}

      {sweepResults?.results && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-sm p-2">
          <div className="text-[9px] text-[var(--text-tertiary)] mb-1">
            Convergence vs Error Rate ({sweepResults.totalTimeMs?.toFixed(0)}ms total, {sweepResults.backend})
          </div>
          <div className="flex h-20 items-end gap-[2px]">
            {sweepResults.results.map((r: any, i: number) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                <div
                  className="w-full rounded-t-sm transition-all"
                  style={{
                    height: `${r.successRate * 100}%`,
                    background: r.successRate > 0.9 ? "#22c55e" : r.successRate > 0.5 ? "#eab308" : "#ef4444",
                    opacity: 0.6,
                  }}
                />
                <span className="text-[7px] text-[var(--text-quaternary)] -rotate-45 origin-top-left translate-y-1">
                  {(r.errorRate * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Neural Decoder Section ─────────────────────────────
function NeuralDecoderPanel() {
  const liveCode = useSimulator((s) => s.liveCode);
  const [trainResult, setTrainResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const connected = useMLXConnection();

  const handleTrain = async () => {
    if (!liveCode || !connected) return;
    setLoading(true);
    try {
      const res = await mlxBridge.trainNeural({
        edges: liveCode.tannerEdgesX,
        numChecks: liveCode.tannerCheckNodesX,
        numData: liveCode.tannerDataNodes,
        physicalErrorRate: 0.01,
        numSamples: 500,
        epochs: 15,
      });
      setTrainResult(res);
    } catch (e: any) {
      setTrainResult({ error: e.message });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleTrain}
        disabled={loading || !connected || !liveCode}
        className="w-full py-1.5 bg-[#ff4488]/10 hover:bg-[#ff4488]/20 border border-[#ff4488]/20 rounded-sm text-[10px] text-[#ff4488] transition-all disabled:opacity-30"
      >
        {loading ? "Training..." : "Train Neural Decoder (MLX)"}
      </button>

      {!liveCode && (
        <p className="text-[9px] text-[var(--text-quaternary)]">Construct LP code first</p>
      )}

      {trainResult?.history && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-sm p-2">
          <div className="flex justify-between text-[10px] mb-1">
            <span className="text-[var(--text-tertiary)]">Training Loss</span>
            <span className="text-[var(--text-secondary)]">{trainResult.timeMs?.toFixed(0)}ms / {trainResult.modelParams} params</span>
          </div>
          {/* Loss curve */}
          <div className="flex h-14 items-end gap-px">
            {trainResult.history.map((h: any, i: number) => {
              const maxLoss = Math.max(...trainResult.history.map((x: any) => x.loss));
              const height = maxLoss > 0 ? (h.loss / maxLoss) * 100 : 0;
              return (
                <div
                  key={i}
                  className="flex-1 bg-[#ff4488] rounded-t-sm transition-all"
                  style={{ height: `${height}%`, opacity: 0.5 }}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-[8px] text-[var(--text-quaternary)] mt-0.5">
            <span>epoch 1</span>
            <span>epoch {trainResult.history.length}</span>
          </div>
          <div className="text-[10px] text-[var(--text-tertiary)] mt-1">
            Final loss: {trainResult.finalLoss?.toFixed(6)}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tensor Network Section ─────────────────────────────
function TensorNetworkPanel() {
  const liveCode = useSimulator((s) => s.liveCode);
  const physicalErrorRate = useSimulator((s) => s.physicalErrorRate);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const connected = useMLXConnection();

  const handleContract = async () => {
    if (!liveCode || !connected) return;
    setLoading(true);
    try {
      const res = await mlxBridge.tensorContract({
        n: liveCode.n,
        stabilizerWeight: liveCode.stabilizerWeightX,
        distance: 18, // approximate
        edges: liveCode.tannerEdgesX,
        numChecks: liveCode.tannerCheckNodesX,
        physicalErrorRate,
      });
      setResult(res);
    } catch (e: any) {
      setResult({ error: e.message });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleContract}
        disabled={loading || !connected || !liveCode}
        className="w-full py-1.5 bg-[#ff8a00]/10 hover:bg-[#ff8a00]/20 border border-[#ff8a00]/20 rounded-sm text-[10px] text-[#ff8a00] transition-all disabled:opacity-30"
      >
        {loading ? "Contracting..." : "TN Contract (Small Codes)"}
      </button>

      {!liveCode && (
        <p className="text-[9px] text-[var(--text-quaternary)]">Construct LP code first</p>
      )}

      {result && !result.error && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-sm p-2 grid grid-cols-2 gap-x-4 gap-y-0.5 text-[10px]">
          <span className="text-[var(--text-tertiary)]">Logical Error Rate</span>
          <span className="text-[var(--text-secondary)]">{result.logicalErrorRate?.toExponential(2)}</span>
          <span className="text-[var(--text-tertiary)]">Trials</span>
          <span className="text-[var(--text-secondary)]">{result.trials}</span>
          <span className="text-[var(--text-tertiary)]">Time</span>
          <span className="text-[var(--text-secondary)]">{result.timeMs?.toFixed(0)} ms</span>
          <span className="text-[var(--text-tertiary)]">Method</span>
          <span className="text-[var(--text-secondary)]">{result.method}</span>
        </div>
      )}

      {result?.error && (
        <p className="text-[9px] text-[#ef4444]">{result.error}</p>
      )}
    </div>
  );
}

// ─── Code Search Section ────────────────────────────────
function CodeSearchPanel() {
  const memoryCode = useSimulator((s) => s.memoryCode);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const connected = useMLXConnection();

  const codeConfigs: Record<string, { rA: number; nA: number; ringOrder: number }> = {
    lp16: { rA: 3, nA: 7, ringOrder: 45 },
    lp20: { rA: 3, nA: 7, ringOrder: 75 },
    lp24: { rA: 3, nA: 7, ringOrder: 91 },
  };

  const handleSearch = async () => {
    if (!connected) return;
    setLoading(true);
    const cfg = codeConfigs[memoryCode] || codeConfigs.lp20;
    try {
      const res = await mlxBridge.codeSearch({
        ...cfg,
        numTrials: 200,
        targetDistance: 20,
      });
      setResult(res);
    } catch (e: any) {
      setResult({ error: e.message });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleSearch}
        disabled={loading || !connected}
        className="w-full py-1.5 bg-[#00ff88]/10 hover:bg-[#00ff88]/20 border border-[#00ff88]/20 rounded-sm text-[10px] text-[#00ff88] transition-all disabled:opacity-30"
      >
        {loading ? "Searching..." : `Search Codes (${memoryCode} family)`}
      </button>

      {result?.topCodes && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-sm p-2">
          <div className="text-[9px] text-[var(--text-tertiary)] mb-1">
            Top 5 of {result.totalTrials} trials ({result.timeMs?.toFixed(0)}ms)
          </div>
          <div className="space-y-1">
            {result.topCodes.slice(0, 5).map((code: any, i: number) => (
              <div key={i} className="flex items-center justify-between text-[9px] py-0.5 border-b border-[var(--border-subtle)] last:border-0">
                <span className="text-[var(--text-tertiary)]">#{i + 1}</span>
                <span className="text-[var(--text-secondary)]">
                  [[{code.n}, &ge;{code.kLowerBound}, ~{code.distanceEstimate}]]
                </span>
                <span className="text-[var(--text-tertiary)]">
                  rate {(code.rate * 100).toFixed(1)}%
                </span>
                <span className="text-[#00ff88]/60">
                  fit {code.fitness.toFixed(3)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Panel ─────────────────────────────────────────
export function MLXPanel() {
  const connected = useMLXConnection();
  const [expanded, setExpanded] = useState<string | null>("bp");

  const sections = [
    { id: "bp", label: "BP Decoder", color: "#00d4ff", component: BPDecoderPanel },
    { id: "neural", label: "Neural Decoder", color: "#ff4488", component: NeuralDecoderPanel },
    { id: "tn", label: "Tensor Network", color: "#ff8a00", component: TensorNetworkPanel },
    { id: "search", label: "Code Search", color: "#00ff88", component: CodeSearchPanel },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[10px] text-[var(--text-quaternary)] uppercase tracking-[0.2em]">
          MLX Compute
        </h3>
        <span className={`text-[9px] ${connected ? "text-[#22c55e]" : "text-[var(--text-quaternary)]"}`}>
          {connected ? "connected" : "disconnected"}
        </span>
      </div>

      {!connected && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-sm p-3 mb-3">
          <p className="text-[10px] text-[var(--text-tertiary)] leading-relaxed">
            Start the MLX backend to enable GPU-accelerated decoding, neural training, and code search:
          </p>
          <code className="block mt-2 text-[10px] text-[#6366f1] bg-[var(--bg-surface)] p-2 rounded-sm">
            cd mlx-backend && ./run.sh
          </code>
        </div>
      )}

      <div className="space-y-1">
        {sections.map(({ id, label, color, component: Component }) => (
          <div key={id} className="border border-[var(--border-subtle)] rounded-sm overflow-hidden">
            <button
              onClick={() => setExpanded(expanded === id ? null : id)}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-[var(--bg-surface)] transition-colors"
            >
              <div className="w-1 h-1 rounded-full" style={{ backgroundColor: color, opacity: 0.6 }} />
              <span className="text-[10px] text-[var(--text-secondary)] tracking-wider uppercase flex-1 text-left">
                {label}
              </span>
              <span className="text-[10px] text-[var(--text-quaternary)]">
                {expanded === id ? "\u2212" : "+"}
              </span>
            </button>
            {expanded === id && (
              <div className="px-2.5 pb-2.5">
                <Component />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
