#!/usr/bin/env python3
"""
MLX-accelerated compute backend for the Oratomic viewer.
Provides WebSocket API for:
  - Belief propagation decoding on qLDPC codes
  - Tensor network contraction for small codes
  - Neural decoder training and inference
  - Code search / optimization
"""

import asyncio
import json
import time
import traceback

import websockets
import numpy as np

# Lazy import MLX to allow running without it for testing
try:
    import mlx.core as mx
    HAS_MLX = True
except ImportError:
    HAS_MLX = False
    print("WARNING: MLX not available. Using NumPy fallback.")

from bp_decoder import BPDecoder, BPConfig
from lp_code import construct_lp_code
from tensor_network import contract_small_code
from neural_decoder import NeuralDecoder
from code_search import CodeSearcher


async def handle_client(websocket):
    """Handle a single WebSocket client connection."""
    print(f"Client connected: {websocket.remote_address}")

    # Initialize decoders per-connection
    bp_decoder = BPDecoder()
    neural_decoder = NeuralDecoder()
    code_searcher = CodeSearcher()

    try:
        async for message in websocket:
            try:
                request = json.loads(message)
                response = await dispatch(request, bp_decoder, neural_decoder, code_searcher)
                await websocket.send(json.dumps(response))
            except Exception as e:
                error_response = {
                    "type": "error",
                    "error": str(e),
                    "traceback": traceback.format_exc(),
                }
                await websocket.send(json.dumps(error_response))
    except websockets.exceptions.ConnectionClosed:
        print(f"Client disconnected: {websocket.remote_address}")


async def dispatch(request, bp_decoder, neural_decoder, code_searcher):
    """Route request to appropriate handler."""
    req_type = request.get("type")

    if req_type == "ping":
        return {"type": "pong", "mlx_available": HAS_MLX}

    elif req_type == "bp_decode":
        return bp_decoder.decode(request)

    elif req_type == "bp_sweep":
        return bp_decoder.sweep(request)

    elif req_type == "construct_code":
        return construct_lp_code(request)

    elif req_type == "tensor_contract":
        return contract_small_code(request)

    elif req_type == "neural_train":
        return await neural_decoder.train(request)

    elif req_type == "neural_infer":
        return neural_decoder.infer(request)

    elif req_type == "code_search":
        return await code_searcher.search(request)

    else:
        return {"type": "error", "error": f"Unknown request type: {req_type}"}


async def main():
    print("Starting MLX backend on ws://localhost:8765")
    print(f"MLX available: {HAS_MLX}")
    async with websockets.serve(handle_client, "localhost", 8765):
        await asyncio.Future()  # run forever


if __name__ == "__main__":
    asyncio.run(main())
