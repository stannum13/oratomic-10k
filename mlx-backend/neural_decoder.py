"""
Neural decoder for qLDPC codes.
Architecture: small transformer/MLP mapping syndrome → correction.
Training data generated from the code's parity check matrix.
"""

import time
import numpy as np

try:
    import mlx.core as mx
    import mlx.nn as nn
    import mlx.optimizers as optim
    HAS_MLX = True
except ImportError:
    HAS_MLX = False


class SyndromeDecoder(nn.Module if HAS_MLX else object):
    """Simple MLP decoder: syndrome → correction."""

    def __init__(self, syndrome_dim, correction_dim, hidden_dim=256):
        if HAS_MLX:
            super().__init__()
            self.layers = [
                nn.Linear(syndrome_dim, hidden_dim),
                nn.ReLU(),
                nn.Linear(hidden_dim, hidden_dim),
                nn.ReLU(),
                nn.Linear(hidden_dim, correction_dim),
            ]

    def __call__(self, x):
        for layer in self.layers:
            x = layer(x)
        return x


class NeuralDecoder:
    """Neural decoder manager — handles training and inference."""

    def __init__(self):
        self.model = None
        self.training_history = []

    async def train(self, request):
        """Train a neural decoder on generated syndrome data."""
        start = time.time()

        if not HAS_MLX:
            return {
                "type": "neural_train_result",
                "error": "MLX required for neural decoder training",
                "backend": "none",
            }

        num_checks = request.get("numChecks", 100)
        num_data = request.get("numData", 248)
        edges = request.get("edges", [])
        physical_error_rate = request.get("physicalErrorRate", 0.01)
        num_samples = request.get("numSamples", 1000)
        epochs = request.get("epochs", 20)
        batch_size = request.get("batchSize", 64)
        learning_rate = request.get("learningRate", 1e-3)

        # Build check matrix
        h = np.zeros((num_checks, num_data), dtype=np.float32)
        for check_idx, data_idx in edges:
            if check_idx < num_checks and data_idx < num_data:
                h[check_idx, data_idx] = 1.0

        # Generate training data
        errors = (np.random.random((num_samples, num_data)) < physical_error_rate).astype(np.float32)
        syndromes = np.mod(errors @ h.T, 2).astype(np.float32)

        syndromes_mx = mx.array(syndromes)
        errors_mx = mx.array(errors)

        # Initialize model
        self.model = SyndromeDecoder(num_checks, num_data, hidden_dim=128)
        optimizer = optim.Adam(learning_rate=learning_rate)

        # Training loop
        history = []
        for epoch in range(epochs):
            epoch_loss = 0.0
            num_batches = 0

            for i in range(0, num_samples, batch_size):
                batch_syn = syndromes_mx[i:i+batch_size]
                batch_err = errors_mx[i:i+batch_size]

                def loss_fn(model):
                    pred = model(batch_syn)
                    # Binary cross-entropy loss (not MSE)
                    pred_clamp = mx.clip(pred, 1e-7, 1 - 1e-7)
                    bce = -(batch_err * mx.log(pred_clamp) + (1 - batch_err) * mx.log(1 - pred_clamp))
                    return mx.mean(bce)

                loss, grads = mx.value_and_grad(loss_fn)(self.model)
                optimizer.update(self.model, grads)
                mx.eval(self.model.parameters(), optimizer.state)

                epoch_loss += loss.item()
                num_batches += 1

            avg_loss = epoch_loss / max(num_batches, 1)
            history.append({"epoch": epoch + 1, "loss": avg_loss})

        elapsed = time.time() - start
        self.training_history = history

        return {
            "type": "neural_train_result",
            "history": history,
            "finalLoss": history[-1]["loss"] if history else 0,
            "modelParams": sum(p.size for p in self.model.parameters()) if self.model else 0,
            "timeMs": elapsed * 1000,
            "backend": "mlx",
        }

    def infer(self, request):
        """Run inference with trained neural decoder."""
        start = time.time()

        if not HAS_MLX or self.model is None:
            return {
                "type": "neural_infer_result",
                "error": "No trained model available. Run training first.",
            }

        syndrome = request.get("syndrome", [])
        syndrome_mx = mx.array(np.array(syndrome, dtype=np.float32).reshape(1, -1))

        prediction = self.model(syndrome_mx)
        correction = mx.where(prediction > 0.5, mx.ones_like(prediction), mx.zeros_like(prediction))
        mx.eval(correction)

        elapsed = time.time() - start

        return {
            "type": "neural_infer_result",
            "correction": correction[0].tolist(),
            "timeMs": elapsed * 1000,
            "backend": "mlx",
        }
