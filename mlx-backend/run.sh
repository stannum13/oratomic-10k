#!/bin/bash
set -e

cd "$(dirname "$0")"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "Python 3 required"
    exit 1
fi

# Install deps if needed
if ! python3 -c "import websockets" 2>/dev/null; then
    echo "Installing dependencies..."
    pip3 install -r requirements.txt
fi

echo "Starting MLX backend..."
python3 server.py
