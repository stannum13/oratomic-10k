# Platform-neutral acceleration follow-up

The public viewer intentionally uses browser-native computation and does not expose the experimental MLX bridge. This keeps Windows, Linux, and macOS behavior consistent while the accelerated implementations remain research code.

Future acceleration should sit behind one capability contract:

```ts
interface AccelerationProvider {
  readonly id: "webgpu" | "cuda" | "directml" | "mlx" | "cpu-worker";
  detect(): Promise<{ available: boolean; reason?: string }>;
  run<TInput, TOutput>(operation: string, input: TInput): Promise<TOutput>;
  cancel(operationId: string): Promise<void>;
}
```

Selection should use runtime capability detection rather than user-agent-only operating-system detection. Prefer a validated WebGPU provider when the required kernels are available, then an explicitly installed native provider (MLX on Apple Silicon, CUDA or DirectML where supported), and always retain a Web Worker CPU fallback.

Every provider must implement the same input/output schemas, numerical tolerances, cancellation behavior, progress events, and error states. The interface should display the selected provider and offer an explicit opt-in; it must never probe localhost or start reconnect loops on initial page load.

Acceleration should remain outside the public component graph until each provider passes identical correctness fixtures and representative performance/parity benchmarks on macOS, Windows, and Linux.
