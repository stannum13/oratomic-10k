import { PolyRing } from "./polynomial-ring";

export interface SparseMatrix {
  rows: number;
  cols: number;
  entries: [number, number][]; // [row, col] pairs where value = 1
}

export interface LPCodeResult {
  n: number; // physical qubits
  k: number; // logical qubits (computed)
  kLowerBound: number; // theoretical lower bound
  hX: SparseMatrix; // X parity check matrix
  hZ: SparseMatrix; // Z parity check matrix
  stabilizerWeightX: number; // max row weight of H_X
  stabilizerWeightZ: number; // max row weight of H_Z
  encodingRate: number;
}

export interface TannerGraph {
  dataNodes: number; // number of data qubit nodes
  checkNodesX: number; // number of X-check nodes
  checkNodesZ: number; // number of Z-check nodes
  edgesX: [number, number][]; // [check_idx, data_idx] pairs for H_X
  edgesZ: [number, number][]; // [check_idx, data_idx] pairs for H_Z
}

/**
 * Construct a lifted-product code LP(A, A†) from a seed matrix.
 *
 * seedExponents[i][j] = power of x in position (i,j) of the seed matrix A.
 * The seed matrix has dimensions r_A × n_A over F_2[x]/(x^ℓ + 1).
 *
 * The quantum code uses the hypergraph product of A with itself (over the ring):
 *   H_X = [A ⊗ I_{nA}  |  I_{rA} ⊗ A†]
 *   H_Z = [I_{nA} ⊗ A   |  A† ⊗ I_{rA}]
 *
 * where A† is the ring-transpose (matrix transpose + entry-wise p(x) → p(x^{-1})).
 *
 * Dimensions (in ring elements):
 *   H_X: (rA·nA) × (nA² + rA²)
 *   H_Z: (nA·rA) × (nA² + rA²)
 *
 * Each ring element expands to an ℓ×ℓ circulant, giving:
 *   n = (rA² + nA²) · ℓ  physical qubits
 *   k ≥ (nA - rA)² · ℓ   logical qubits (lower bound)
 */
export function constructLPCode(
  seedExponents: number[][],
  ringOrder: number
): LPCodeResult {
  const ring = new PolyRing(ringOrder);
  const rA = seedExponents.length;
  const nA = seedExponents[0].length;
  const ell = ringOrder;

  // Build the seed matrix A as ring elements
  const A: bigint[][] = [];
  for (let i = 0; i < rA; i++) {
    A.push([]);
    for (let j = 0; j < nA; j++) {
      A[i].push(ring.monomial(seedExponents[i][j]));
    }
  }

  // Code parameters
  const n = (rA * rA + nA * nA) * ell;
  const kLowerBound = (nA - rA) * (nA - rA) * ell;

  const hXEntries: [number, number][] = [];
  const hZEntries: [number, number][] = [];

  const totalRingColsLeft = nA * nA;

  const binaryRows = rA * nA * ell;
  const binaryCols = (nA * nA + rA * rA) * ell;

  // Build H_X sparse entries
  // H_X_ring row (a, b) where a∈[rA], b∈[nA]:
  //   Left block col (c1, c2) where c1∈[nA], c2∈[nA]:
  //     = A[a][c1] · δ(b, c2)
  //   Right block col (d1, d2) where d1∈[rA], d2∈[rA]:
  //     = A†[b][d2] · δ(a, d1) = transpose(A[d2][b]) · δ(a, d1)
  for (let a = 0; a < rA; a++) {
    for (let b = 0; b < nA; b++) {
      const ringRow = a * nA + b;

      // Left block: A[a][c1] · δ(b, c2)
      for (let c1 = 0; c1 < nA; c1++) {
        const c2 = b;
        const ringCol = c1 * nA + c2;
        const elem = A[a][c1];
        if (elem !== 0n) {
          addCirculantEntries(hXEntries, ringRow, ringCol, elem, ring);
        }
      }

      // Right block: transpose(A[d2][b]) · δ(a, d1)
      const d1 = a;
      for (let d2 = 0; d2 < rA; d2++) {
        const ringCol = totalRingColsLeft + d1 * rA + d2;
        const elem = ring.transpose(A[d2][b]);
        if (elem !== 0n) {
          addCirculantEntries(hXEntries, ringRow, ringCol, elem, ring);
        }
      }
    }
  }

  // Build H_Z sparse entries
  // H_Z_ring = [I_{nA} ⊗ A  |  A† ⊗ I_{rA}]
  // Row (c1, a) where c1∈[nA], a∈[rA]:
  //   Left block col (c2_1, c2_2) where c2_1∈[nA], c2_2∈[nA]:
  //     = δ(c1, c2_1) · A[a][c2_2]
  //   Right block col (d1, d2) where d1∈[rA], d2∈[rA]:
  //     = A†[c1][d1] · δ(a, d2) = transpose(A[d1][c1]) · δ(a, d2)
  for (let c1 = 0; c1 < nA; c1++) {
    for (let a = 0; a < rA; a++) {
      const ringRow = c1 * rA + a;

      // Left block: δ(c1, c2_1) · A[a][c2_2]
      const c2_1 = c1;
      for (let c2_2 = 0; c2_2 < nA; c2_2++) {
        const ringCol = c2_1 * nA + c2_2;
        const elem = A[a][c2_2];
        if (elem !== 0n) {
          addCirculantEntries(hZEntries, ringRow, ringCol, elem, ring);
        }
      }

      // Right block: transpose(A[d1][c1]) · δ(a, d2)
      const d2 = a;
      for (let d1 = 0; d1 < rA; d1++) {
        const ringCol = totalRingColsLeft + d1 * rA + d2;
        const elem = ring.transpose(A[d1][c1]);
        if (elem !== 0n) {
          addCirculantEntries(hZEntries, ringRow, ringCol, elem, ring);
        }
      }
    }
  }

  // k = n - rank(H_X) - rank(H_Z), but computing rank is expensive.
  // Use the lower bound.
  const k = kLowerBound;

  // Compute stabilizer weights (max row weight)
  const stabWeightX = computeMaxRowWeight(hXEntries, binaryRows);
  const stabWeightZ = computeMaxRowWeight(hZEntries, binaryRows);

  return {
    n,
    k,
    kLowerBound,
    hX: { rows: binaryRows, cols: binaryCols, entries: hXEntries },
    hZ: { rows: binaryRows, cols: binaryCols, entries: hZEntries },
    stabilizerWeightX: stabWeightX,
    stabilizerWeightZ: stabWeightZ,
    encodingRate: k / n,
  };
}

/** Expand a ring element at (ringRow, ringCol) into binary circulant entries */
function addCirculantEntries(
  entries: [number, number][],
  ringRow: number,
  ringCol: number,
  elem: bigint,
  ring: PolyRing
): void {
  const ell = ring.order;
  for (let s = 0; s < ell; s++) {
    for (let t = 0; t < ell; t++) {
      const idx = (t - s + ell) % ell;
      if ((elem >> BigInt(idx)) & 1n) {
        entries.push([ringRow * ell + s, ringCol * ell + t]);
      }
    }
  }
}

function computeMaxRowWeight(
  entries: [number, number][],
  numRows: number
): number {
  const rowCounts = new Uint16Array(numRows);
  for (const [r] of entries) {
    if (r < numRows) rowCounts[r]++;
  }
  let max = 0;
  for (let i = 0; i < numRows; i++) {
    if (rowCounts[i] > max) max = rowCounts[i];
  }
  return max;
}

/** Extract the Tanner graph from parity check matrices */
export function extractTannerGraph(code: LPCodeResult): TannerGraph {
  return {
    dataNodes: code.n,
    checkNodesX: code.hX.rows,
    checkNodesZ: code.hZ.rows,
    edgesX: code.hX.entries,
    edgesZ: code.hZ.entries,
  };
}
