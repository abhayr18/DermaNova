# DermaNova Cloud AI Diagnostic Engine - Production Dockerfile
FROM python:3.10-slim

# Set environment flags to strictly constrain memory & thread stacks on cloud containers
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000 \
    OMP_NUM_THREADS=1 \
    MKL_NUM_THREADS=1 \
    OPENBLAS_NUM_THREADS=1 \
    MALLOC_ARENA_MAX=2

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

# Verify ONNX diagnostic model and YuNet face detector are present
RUN python -c "from pathlib import Path; \
    p1 = Path('/app/ml_pipeline/models/saved_models/dermanova_model.onnx'); \
    p2 = Path('/app/ml_pipeline/models/saved_models/face_detection_yunet_2023mar.onnx'); \
    assert p1.exists(), f'CRITICAL: ONNX model missing at {p1}'; \
    assert p2.exists(), f'CRITICAL: YuNet face detector missing at {p2}'"

# Create uploads directory
RUN mkdir -p /app/uploads

# Expose ports (8000 standard/Render, 10000 Render internal, 7860 fallback)
EXPOSE 8000
EXPOSE 10000
EXPOSE 7860

# Launch FastAPI with dynamic port binding (default 8000 for Render)
CMD ["sh", "-c", "uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
