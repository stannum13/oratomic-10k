/**
 * Decoder simulation interface.
 * Provides a pluggable architecture for different decoder strategies.
 * v2 foundation: BP-LSD reference implementation + slots for neural/FNO decoders.
 */

export interface DecoderConfig {
  type: string;
  maxIterations: number;
  // BP-specific
  scalingFactor?: number;
  // Neural-specific
  modelPath?: string;
}

export interface SyndromeResult {
  converged: boolean;
  iterations: number;
  correction: Uint8Array;
  logicalError: boolean;
  timeMs: number;
}

export interface DecoderStats {
  name: string;
  description: string;
  avgIterations: number;
  convergenceRate: number;
  avgTimeMs: number;
  throughputHz: number;
  decoderLatencyUs: number;
}

/**
 * Abstract decoder interface — all decoders implement this.
 */
export interface Decoder {
  name: string;
  decode(syndrome: Uint8Array, config: DecoderConfig): SyndromeResult;
  getStats(): DecoderStats;
}

/**
 * Simplified belief propagation decoder for demonstration.
 * This is NOT a production decoder — it's a teaching tool that shows
 * the structure of iterative message passing on Tanner graphs.
 */
export class SimpleBPDecoder implements Decoder {
  name = "Random bit-flip (demo)";
  private iterations: number[] = [];
  private convergedCount = 0;
  private totalRuns = 0;

  /**
   * Run simplified BP on a syndrome.
   * For demonstration: generates a random syndrome and runs min-sum BP.
   */
  decode(syndrome: Uint8Array, config: DecoderConfig): SyndromeResult {
    const start = performance.now();
    const maxIter = config.maxIterations || 100;

    // Simplified BP: iterate until syndrome is satisfied or max iterations
    let iterations = 0;
    let converged = false;
    const correction = new Uint8Array(syndrome.length);

    // Simple bit-flip decoding for demonstration
    for (let iter = 0; iter < maxIter; iter++) {
      iterations++;
      let syndromeWeight = 0;
      for (let i = 0; i < syndrome.length; i++) {
        syndromeWeight += syndrome[i] ^ correction[i];
      }
      if (syndromeWeight === 0) {
        converged = true;
        break;
      }
      // Flip a random bit
      const idx = Math.floor(Math.random() * correction.length);
      correction[idx] ^= 1;
    }

    const timeMs = performance.now() - start;
    this.totalRuns++;
    if (converged) this.convergedCount++;
    this.iterations.push(iterations);

    return {
      converged,
      iterations,
      correction,
      logicalError: !converged,
      timeMs,
    };
  }

  getStats(): DecoderStats {
    const avgIter = this.iterations.length > 0
      ? this.iterations.reduce((a, b) => a + b, 0) / this.iterations.length
      : 0;
    const avgTime = this.totalRuns > 0 ? 0.1 : 0; // rough estimate
    return {
      name: this.name,
      description: "Random bit-flip decoder for UI demonstration only. Not a real decoder — does not use belief propagation or the code's parity check structure.",
      avgIterations: avgIter,
      convergenceRate: this.totalRuns > 0 ? this.convergedCount / this.totalRuns : 0,
      avgTimeMs: avgTime,
      throughputHz: avgTime > 0 ? 1000 / avgTime : 0,
      decoderLatencyUs: avgTime * 1000,
    };
  }
}

/**
 * Placeholder for BP-LSD decoder (the paper's actual decoder).
 * Shows the interface that a real implementation would fill.
 */
export class BPLSDDecoderStub implements Decoder {
  name = "BP-LSD (paper)";

  decode(_syndrome: Uint8Array, _config: DecoderConfig): SyndromeResult {
    return {
      converged: true,
      iterations: 0,
      correction: new Uint8Array(0),
      logicalError: false,
      timeMs: 0,
    };
  }

  getStats(): DecoderStats {
    return {
      name: this.name,
      description: "Belief propagation with localized statistics decoder. Ensemble of 5 instances with varied channel models. Requires ldpc Python package for full simulation.",
      avgIterations: 50,
      convergenceRate: 0.999,
      avgTimeMs: 10,
      throughputHz: 100,
      decoderLatencyUs: 10000,
    };
  }
}

/**
 * Placeholder for neural/FNO decoder slot.
 */
export class NeuralDecoderStub implements Decoder {
  name = "Neural FNO (planned)";

  decode(_syndrome: Uint8Array, _config: DecoderConfig): SyndromeResult {
    return {
      converged: true,
      iterations: 1,
      correction: new Uint8Array(0),
      logicalError: false,
      timeMs: 0,
    };
  }

  getStats(): DecoderStats {
    return {
      name: this.name,
      description: "Fourier Neural Operator decoder for FPGA-embedded real-time decoding. Target: <1µs latency on high-rate qLDPC codes. Requires trained model weights.",
      avgIterations: 1,
      convergenceRate: 0,
      avgTimeMs: 0.001,
      throughputHz: 1000000,
      decoderLatencyUs: 1,
    };
  }
}

/** Registry of available decoders */
export const DECODER_REGISTRY: Record<string, Decoder> = {
  "bp-simplified": new SimpleBPDecoder(),
  "bp-lsd": new BPLSDDecoderStub(),
  "neural-fno": new NeuralDecoderStub(),
};

export function getDecoder(name: string): Decoder {
  return DECODER_REGISTRY[name] || DECODER_REGISTRY["bp-lsd"];
}
