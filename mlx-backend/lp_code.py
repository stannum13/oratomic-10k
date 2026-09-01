"""LP code construction in Python (mirrors the TypeScript implementation)."""

import time
import numpy as np


def construct_lp_code(request):
    """Construct an LP code from seed exponents."""
    start = time.time()

    seed = request.get("seedExponents", [])
    ring_order = request.get("ringOrder", 1)

    r_a = len(seed)
    n_a = len(seed[0]) if seed else 0
    ell = ring_order

    n = (r_a * r_a + n_a * n_a) * ell
    k_lower = (n_a - r_a) ** 2 * ell

    elapsed = time.time() - start

    return {
        "type": "code_result",
        "n": n,
        "kLowerBound": k_lower,
        "encodingRate": k_lower / n if n > 0 else 0,
        "stabilizerWeight": r_a + n_a,
        "timeMs": elapsed * 1000,
    }
