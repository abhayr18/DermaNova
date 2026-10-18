# DermaNova Cloud AI Diagnostic Engine - Production Dockerfile
FROM python:3.10-slim

# Set environment flags
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

# Install required system packages for OpenCV and image operations
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements_docker.txt .
RUN pip install --no-cache-dir -r requirements_docker.txt

# Copy application code, models, and configurations
COPY backend /app/backend
COPY ml_pipeline /app/ml_pipeline
COPY .env.example /app/.env

# Create uploads directory
RUN mkdir -p /app/uploads

# Expose default port
EXPOSE 8000

# Launch FastAPI with dynamic port binding for Render/HuggingFace/Railway
CMD ["sh", "-c", "uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
