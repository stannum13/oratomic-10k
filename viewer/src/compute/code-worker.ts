import {
  constructLPCode,
  extractTannerGraph,
} from "./lp-code";

export interface CodeWorkerRequest {
  type: "construct";
  seedExponents: number[][];
  ringOrder: number;
}

export interface CodeWorkerResponse {
  type: "result";
  code: {
    n: number;
    k: number;
    kLowerBound: number;
    stabilizerWeightX: number;
    stabilizerWeightZ: number;
    encodingRate: number;
  };
  tanner: {
    dataNodes: number;
    checkNodesX: number;
    checkNodesZ: number;
    edgesXCount: number;
    edgesZCount: number;
    // Sample edges for visualization (limit to prevent huge transfers)
    sampleEdgesX: [number, number][];
    sampleEdgesZ: [number, number][];
  };
  computeTimeMs: number;
}

/**
 * Run LP code construction synchronously (for use in main thread or worker).
 * For codes with ringOrder > 50, this can take 100ms+, so prefer running in a worker.
 */
export function computeCodeSync(req: CodeWorkerRequest): CodeWorkerResponse {
  const start = performance.now();

  const code = constructLPCode(req.seedExponents, req.ringOrder);
  const tanner = extractTannerGraph(code);

  // Sample edges for visualization (cap at 500 per type)
  const maxEdges = 500;
  const sampleEdgesX =
    tanner.edgesX.length <= maxEdges
      ? tanner.edgesX
      : sampleArray(tanner.edgesX, maxEdges);
  const sampleEdgesZ =
    tanner.edgesZ.length <= maxEdges
      ? tanner.edgesZ
      : sampleArray(tanner.edgesZ, maxEdges);

  const computeTimeMs = performance.now() - start;

  return {
    type: "result",
    code: {
      n: code.n,
      k: code.k,
      kLowerBound: code.kLowerBound,
      stabilizerWeightX: code.stabilizerWeightX,
      stabilizerWeightZ: code.stabilizerWeightZ,
      encodingRate: code.encodingRate,
    },
    tanner: {
      dataNodes: tanner.dataNodes,
      checkNodesX: tanner.checkNodesX,
      checkNodesZ: tanner.checkNodesZ,
      edgesXCount: tanner.edgesX.length,
      edgesZCount: tanner.edgesZ.length,
      sampleEdgesX,
      sampleEdgesZ,
    },
    computeTimeMs,
  };
}

function sampleArray<T>(arr: T[], count: number): T[] {
  if (arr.length <= count) return arr;
  const step = arr.length / count;
  const result: T[] = [];
  for (let i = 0; i < count; i++) {
    result.push(arr[Math.floor(i * step)]);
  }
  return result;
}
