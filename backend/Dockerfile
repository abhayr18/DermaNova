FROM python:3.10-slim

WORKDIR /app

# Install system dependencies for OpenCV and C extensions
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libgomp1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy and install core Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application and ML pipeline packages
COPY backend /app/backend
COPY ml_pipeline /app/ml_pipeline

# Ensure /app is in Python path for absolute imports
ENV PYTHONPATH=/app

EXPOSE 8000

CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
