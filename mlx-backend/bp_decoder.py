"""
Belief propagation decoder using MLX for acceleration.
Implements min-sum BP on the Tanner graph of a qLDPC code.
"""

import time
import numpy as np

try:
    import mlx.core as mx
    HAS_MLX = True
except ImportError:
    HAS_MLX = False


class BPConfig:
    def __init__(self, max_iterations=100, scaling_factor=0.625, ensemble_size=1):
        self.max_iterations = max_iterations
        self.scaling_factor = scaling_factor
        self.ensemble_size = ensemble_size


class BPDecoder:
    """Min-sum belief propagation decoder."""

    def __init__(self):
        self._cached_code = None
        self._cached_h = None

    def _build_check_matrix(self, edges, num_checks, num_data):
        """Build sparse check matrix from edge list."""
        if HAS_MLX:
            # Build as dense matrix on MLX (sparse support limited)
            h = mx.zeros((num_checks, num_data))
            for check_idx, data_idx in edges:
                if check_idx < num_checks and data_idx < num_data:
                    h[check_idx, data_idx] = 1.0
            return h
        else:
            h = np.zeros((num_checks, num_data), dtype=np.float32)
            for check_idx, data_idx in edges:
                if check_idx < num_checks and data_idx < num_data:
                    h[check_idx, data_idx] = 1.0
            return h

    def _generate_random_error(self, n, p):
        """Generate a random error pattern with physical error rate p."""
        if HAS_MLX:
            return (mx.random.uniform(shape=(n,)) < p).astype(mx.float32)
        else:
            return (np.random.random(n) < p).astype(np.float32)

    def _compute_syndrome(self, h, error):
        """Compute syndrome = H @ error mod 2."""
        if HAS_MLX:
            return mx.remainder(h @ error, 2)
        else:
            return np.mod(h @ error, 2).astype(np.float32)

    def _bp_decode(self, h, syndrome, config, physical_error_rate=0.001):
        """
        Run min-sum belief propagation.

        Messages flow between variable nodes (data qubits) and
        check nodes (stabilizers) along the Tanner graph edges.
        """
        if HAS_MLX:
            return self._bp_decode_mlx(h, syndrome, config, physical_error_rate)
        else:
            return self._bp_decode_numpy(h, syndrome, config, physical_error_rate)

    def _bp_decode_mlx(self, h, syndrome, config, physical_error_rate=0.001):
        """MLX-accelerated BP."""
        num_checks, num_vars = h.shape
        alpha = config.scaling_factor

        # Channel LLR: log((1-p)/p) for depolarizing channel
        p_channel = physical_error_rate if physical_error_rate > 0 else 0.001
        channel_llr = mx.full((num_vars,), float(np.log((1 - p_channel) / p_channel)))

        # Variable-to-check messages
        v2c = mx.zeros((num_checks, num_vars))
        # Check-to-variable messages
        c2v = mx.zeros((num_checks, num_vars))

        # Initialize check parity from syndrome (done once before the loop)
        check_parity = mx.where(syndrome > 0.5, -mx.ones_like(syndrome), mx.ones_like(syndrome))

        converged = False
        iterations = 0

        for it in range(config.max_iterations):
            iterations = it + 1

            # Variable to check: v2c[i,j] = channel_llr[j] + sum_{i' != i} c2v[i',j]
            total_incoming = mx.sum(c2v * h, axis=0)  # sum over checks for each var
            v2c = h * (channel_llr[None, :] + total_incoming[None, :] - c2v)

            # Check to variable: min-sum approximation
            # For each check i, c2v[i,j] = prod_{j'!=j} sign(v2c[i,j']) * min_{j'!=j} |v2c[i,j']|
            signs = mx.where(v2c >= 0, mx.ones_like(v2c), -mx.ones_like(v2c))
            abs_v2c = mx.abs(v2c) + 1e-10  # avoid zero

            # Product of signs (excluding self)
            all_sign_product = mx.prod(mx.where(h > 0, signs, mx.ones_like(signs)), axis=1, keepdims=True)
            sign_excl = all_sign_product * signs  # self-exclusion via division

            # Min of abs values (excluding self) via first/second minimum
            masked_abs = mx.where(h > 0, abs_v2c, mx.full_like(abs_v2c, 1e10))
            sorted_abs = mx.sort(masked_abs, axis=1)
            min1 = sorted_abs[:, 0:1]  # smallest
            min2 = sorted_abs[:, 1:2]  # second smallest

            # For each position j: use min2 if j is the argmin, else use min1
            is_argmin = (masked_abs <= min1 + 1e-10)
            min_excl_self = mx.where(is_argmin, min2, min1)

            c2v = h * alpha * sign_excl * min_excl_self

            # Syndrome enters as check parity: flip c2v sign for checks with syndrome=1
            c2v = c2v * check_parity[:, None]

            # Hard decision
            total_llr = channel_llr + mx.sum(c2v * h, axis=0)
            hard_decision = mx.where(total_llr < 0, mx.ones_like(total_llr), mx.zeros_like(total_llr))

            # Check if syndrome is satisfied
            residual_syndrome = mx.remainder(h @ hard_decision, 2)
            target_syndrome = syndrome
            if mx.array_equal(residual_syndrome, target_syndrome):
                converged = True
                break

        mx.eval(hard_decision)  # force computation
        return hard_decision, converged, iterations

    def _bp_decode_numpy(self, h, syndrome, config, physical_error_rate=0.001):
        """NumPy fallback BP."""
        num_checks, num_vars = h.shape
        alpha = config.scaling_factor

        # Channel LLR: log((1-p)/p) for depolarizing channel
        p_channel = physical_error_rate if physical_error_rate > 0 else 0.001
        channel_llr = np.full(num_vars, np.log((1 - p_channel) / p_channel), dtype=np.float32)
        v2c = np.zeros((num_checks, num_vars), dtype=np.float32)
        c2v = np.zeros((num_checks, num_vars), dtype=np.float32)

        # Initialize check parity from syndrome (done once before the loop)
        check_parity = np.where(syndrome > 0.5, -1.0, 1.0).reshape(-1, 1)

        converged = False
        iterations = 0

        for it in range(config.max_iterations):
            iterations = it + 1

            # Variable to check
            total_incoming = np.sum(c2v * h, axis=0)
            v2c = h * (channel_llr[None, :] + total_incoming[None, :] - c2v)

            # Check to variable (min-sum)
            signs = np.where(v2c >= 0, 1.0, -1.0)
            abs_v2c = np.abs(v2c) + 1e-10

            all_sign_product = np.prod(np.where(h > 0, signs, 1.0), axis=1, keepdims=True)
            sign_excl = all_sign_product * signs

            # Min of abs values (excluding self) via first/second minimum
            masked_abs = np.where(h > 0, abs_v2c, 1e10)
            sorted_abs = np.sort(masked_abs, axis=1)
            min1 = sorted_abs[:, 0:1]  # smallest
            min2 = sorted_abs[:, 1:2]  # second smallest

            # For each position j: use min2 if j is the argmin, else use min1
            is_argmin = (masked_abs <= min1 + 1e-10)
            min_excl_self = np.where(is_argmin, min2, min1)

            c2v = h * alpha * sign_excl * min_excl_self

            # Syndrome enters as check parity: flip c2v sign for checks with syndrome=1
            c2v = c2v * check_parity

            # Hard decision
            total_llr = channel_llr + np.sum(c2v * h, axis=0)
            hard_decision = np.where(total_llr < 0, 1.0, 0.0).astype(np.float32)

            residual = np.mod(h @ hard_decision, 2)
            if np.array_equal(residual, syndrome):
                converged = True
                break

        return hard_decision, converged, iterations

    def decode(self, request):
        """Handle a single decode request."""
        start = time.time()

        edges = request.get("edges", [])
        num_checks = request.get("numChecks", 0)
        num_data = request.get("numData", 0)
        physical_error_rate = request.get("physicalErrorRate", 0.001)
        max_iterations = request.get("maxIterations", 100)
        scaling_factor = request.get("scalingFactor", 0.625)

        config = BPConfig(
            max_iterations=max_iterations,
            scaling_factor=scaling_factor,
        )

        # Build check matrix
        h = self._build_check_matrix(edges, num_checks, num_data)

        # Generate random error and syndrome
        error = self._generate_random_error(num_data, physical_error_rate)
        syndrome = self._compute_syndrome(h, error)

        # Run BP
        correction, converged, iterations = self._bp_decode(h, syndrome, config, physical_error_rate)

        elapsed = time.time() - start

        # Check if correction matches error (logical success)
        if HAS_MLX:
            residual = mx.sum(mx.abs(correction - error)).item()
        else:
            residual = float(np.sum(np.abs(correction - error)))

        return {
            "type": "bp_result",
            "converged": converged,
            "iterations": iterations,
            "residualWeight": float(residual),
            "syndromeWeight": int(np.sum(syndrome) if not HAS_MLX else mx.sum(syndrome).item()),
            "errorWeight": int(np.sum(error) if not HAS_MLX else mx.sum(error).item()),
            "timeMs": elapsed * 1000,
            "backend": "mlx" if HAS_MLX else "numpy",
        }

    def sweep(self, request):
        """Run BP across multiple error rates and return convergence data."""
        start = time.time()

        edges = request.get("edges", [])
        num_checks = request.get("numChecks", 0)
        num_data = request.get("numData", 0)
        error_rates = request.get("errorRates", [0.001, 0.005, 0.01])
        trials_per_rate = request.get("trialsPerRate", 10)
        max_iterations = request.get("maxIterations", 50)

        config = BPConfig(max_iterations=max_iterations)
        h = self._build_check_matrix(edges, num_checks, num_data)

        results = []
        for p in error_rates:
            successes = 0
            total_iterations = 0
            for _ in range(trials_per_rate):
                error = self._generate_random_error(num_data, p)
                syndrome = self._compute_syndrome(h, error)
                _, converged, iters = self._bp_decode(h, syndrome, config, p)
                if converged:
                    successes += 1
                total_iterations += iters

            results.append({
                "errorRate": p,
                "successRate": successes / trials_per_rate,
                "avgIterations": total_iterations / trials_per_rate,
            })

        elapsed = time.time() - start
        return {
            "type": "bp_sweep_result",
            "results": results,
            "totalTimeMs": elapsed * 1000,
            "backend": "mlx" if HAS_MLX else "numpy",
        }
