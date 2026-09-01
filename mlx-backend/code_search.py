"""
Code search: find good LP code seed matrices by optimizing
over the polynomial exponent space.
"""

import time
import numpy as np

try:
    import mlx.core as mx
    HAS_MLX = True
except ImportError:
    HAS_MLX = False


class CodeSearcher:
    """Search for optimal LP code seed matrices."""

    def __init__(self):
        self.best_codes = []

    async def search(self, request):
        """
        Run random search over seed matrix exponents.
        Evaluate fitness = distance_estimate / n (maximize encoding efficiency).
        """
        start = time.time()

        r_a = request.get("rA", 3)
        n_a = request.get("nA", 7)
        ring_order = request.get("ringOrder", 45)
        num_trials = request.get("numTrials", 100)
        target_distance = request.get("targetDistance", 16)

        results = []

        for trial in range(num_trials):
            # Random seed matrix exponents
            seed = np.random.randint(0, ring_order, size=(r_a, n_a)).tolist()

            # Compute code parameters
            n = (r_a ** 2 + n_a ** 2) * ring_order
            k_lower = (n_a - r_a) ** 2 * ring_order
            rate = k_lower / n

            # Estimate distance (heuristic: related to minimum weight of random codewords)
            # Full distance computation requires BP-OSD which is expensive
            # Use a fast heuristic based on column weights and randomness
            stab_weight = r_a + n_a

            # Heuristic distance estimate based on ring order and matrix structure
            # Real codes need proper distance estimation via BP-OSD
            unique_exponents = len(set(tuple(row) for row in seed))
            diversity_score = unique_exponents / r_a  # higher = more diverse = likely better distance

            # Simple fitness: penalize if diversity is low
            d_estimate = min(target_distance, int(stab_weight * diversity_score))
            fitness = d_estimate * rate

            results.append({
                "trial": trial,
                "seedExponents": seed,
                "n": n,
                "kLowerBound": k_lower,
                "rate": rate,
                "distanceEstimate": d_estimate,
                "fitness": fitness,
            })

        # Sort by fitness
        results.sort(key=lambda x: x["fitness"], reverse=True)
        top_results = results[:10]

        elapsed = time.time() - start

        return {
            "type": "code_search_result",
            "topCodes": top_results,
            "totalTrials": num_trials,
            "timeMs": elapsed * 1000,
            "backend": "mlx" if HAS_MLX else "numpy",
        }
