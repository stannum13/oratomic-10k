/**
 * WebSocket bridge to the MLX Python backend.
 * Falls back gracefully when backend is unavailable.
 */

type MessageHandler = (response: any) => void;

class MLXBridge {
  private ws: WebSocket | null = null;
  private connected = false;
  private pendingRequests: Map<string, MessageHandler> = new Map();
  private requestId = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private listeners: Set<(connected: boolean) => void> = new Set();
  private _userRequested = false;

  connect(url = "ws://localhost:8765") {
    this._userRequested = true;
    if (this.ws?.readyState === WebSocket.OPEN) return;

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.connected = true;
        this.notifyListeners();
        // Ping to check MLX availability
        this.send({ type: "ping" }).then((_r) => {
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // Route to pending request handler
          const handler = this.pendingRequests.values().next().value;
          if (handler) {
            const key = this.pendingRequests.keys().next().value;
            if (key) this.pendingRequests.delete(key);
            handler(data);
          }
        } catch (e) {
          console.error("[MLX] Parse error:", e);
        }
      };

      this.ws.onclose = () => {
        this.connected = false;
        this.notifyListeners();
        // Only reconnect if the user explicitly requested the connection
        if (this._userRequested) {
          this.reconnectTimer = setTimeout(() => {
            // Don't set _userRequested again — preserve the flag from the original connect call
            if (this._userRequested) this.connect(url);
          }, 5000);
        }
      };

      this.ws.onerror = () => {
        this.connected = false;
        this.notifyListeners();
      };
    } catch {
      this.connected = false;
      this.notifyListeners();
    }
  }

  disconnect() {
    this._userRequested = false;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
    this.ws = null;
    this.connected = false;
    this.notifyListeners();
  }

  isConnected(): boolean {
    return this.connected;
  }

  onConnectionChange(listener: (connected: boolean) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach((l) => l(this.connected));
  }

  send<T = any>(request: Record<string, any>): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error("Not connected to MLX backend"));
        return;
      }

      const id = `req-${++this.requestId}`;
      this.pendingRequests.set(id, resolve as MessageHandler);

      this.ws.send(JSON.stringify(request));

      // Timeout after 30s
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error("Request timed out"));
        }
      }, 30000);
    });
  }

  /** Run BP decode on the backend */
  async bpDecode(params: {
    edges: [number, number][];
    numChecks: number;
    numData: number;
    physicalErrorRate: number;
    maxIterations?: number;
  }) {
    return this.send({
      type: "bp_decode",
      ...params,
    });
  }

  /** Run BP sweep across error rates */
  async bpSweep(params: {
    edges: [number, number][];
    numChecks: number;
    numData: number;
    errorRates: number[];
    trialsPerRate?: number;
  }) {
    return this.send({
      type: "bp_sweep",
      ...params,
    });
  }

  /** Train neural decoder */
  async trainNeural(params: {
    edges: [number, number][];
    numChecks: number;
    numData: number;
    physicalErrorRate: number;
    numSamples?: number;
    epochs?: number;
  }) {
    return this.send({
      type: "neural_train",
      ...params,
    });
  }

  /** Contract tensor network for small code */
  async tensorContract(params: {
    n: number;
    stabilizerWeight: number;
    distance: number;
    edges: [number, number][];
    numChecks: number;
    physicalErrorRate: number;
  }) {
    return this.send({
      type: "tensor_contract",
      ...params,
    });
  }

  /** Search for optimal code seed matrices */
  async codeSearch(params: {
    rA: number;
    nA: number;
    ringOrder: number;
    numTrials?: number;
    targetDistance?: number;
  }) {
    return this.send({
      type: "code_search",
      ...params,
    });
  }
}

export const mlxBridge = new MLXBridge();
