#!/bin/bash

# Activate virtual environment
source venv/bin/activate

# Set default port (can be overridden with PORT environment variable)
export PORT=${PORT:-8080}

echo "Starting webhook API on port $PORT..."

# Start the Flask application
python app.py 