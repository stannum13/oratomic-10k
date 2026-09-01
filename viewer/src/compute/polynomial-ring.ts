/**
 * Polynomial ring arithmetic over F_2[x]/(x^ℓ + 1).
 * Elements are represented as bigints where bit i = coefficient of x^i.
 */

export class PolyRing {
  readonly order: number; // ℓ
  readonly mask: bigint; // (1n << ℓ) - 1n

  constructor(order: number) {
    this.order = order;
    this.mask = (1n << BigInt(order)) - 1n;
  }

  /** Create element x^power */
  monomial(power: number): bigint {
    return 1n << BigInt(power % this.order);
  }

  /** Addition in F_2: XOR */
  add(a: bigint, b: bigint): bigint {
    return (a ^ b) & this.mask;
  }

  /** Multiplication: polynomial multiply mod (x^ℓ + 1) */
  mul(a: bigint, b: bigint): bigint {
    let result = 0n;
    for (let i = 0; i < this.order; i++) {
      if ((b >> BigInt(i)) & 1n) {
        result = this.add(result, this.shift(a, i));
      }
    }
    return result;
  }

  /** Shift polynomial by k positions mod (x^ℓ + 1) */
  private shift(a: bigint, k: number): bigint {
    if (k === 0) return a;
    const shifted = a << BigInt(k);
    const lo = shifted & this.mask;
    const hi = shifted >> BigInt(this.order);
    // x^ℓ ≡ 1 mod (x^ℓ + 1) in F_2, so wrap around with XOR
    return (lo ^ hi) & this.mask;
  }

  /** Transpose: p(x) → p(x^{-1}) mod (x^ℓ + 1) = p(x^{ℓ-1}) since x^ℓ = 1 */
  transpose(a: bigint): bigint {
    let result = 0n;
    for (let i = 0; i < this.order; i++) {
      if ((a >> BigInt(i)) & 1n) {
        const newPow = (this.order - i) % this.order;
        result ^= 1n << BigInt(newPow);
      }
    }
    return result & this.mask;
  }

  /** Convert to ℓ×ℓ circulant binary matrix (as flat Uint8Array, row-major) */
  toCirculant(a: bigint): Uint8Array {
    const n = this.order;
    const mat = new Uint8Array(n * n);
    for (let row = 0; row < n; row++) {
      for (let col = 0; col < n; col++) {
        const idx = (col - row + n) % n;
        if ((a >> BigInt(idx)) & 1n) {
          mat[row * n + col] = 1;
        }
      }
    }
    return mat;
  }

  /** Identity element */
  one(): bigint {
    return 1n;
  }

  /** Zero element */
  zero(): bigint {
    return 0n;
  }
}
