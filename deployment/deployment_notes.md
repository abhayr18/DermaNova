# DermaNova Deployment & Infrastructure Guide 🚀

## 1. Containerization Strategy

DermaNova utilizes Docker and Docker Compose for production deployment, ensuring environment parity between local development and cloud hosting environments.

### Services Architecture in `docker-compose.yml`:
1. **`backend`**: FastAPI application container running Python 3.10 runtime on Uvicorn.
2. **`frontend`**: Next.js Node.js container serving optimized production SSR pages.
3. **`db`**: PostgreSQL 15 container for relational storage (users, analysis history, product catalog).
4. **`redis`**: In-memory store for rate-limiting, session caching, and background job queuing.

---

## 2. Environment Configuration (.env)

Create a `.env` file in the project root with the following mandatory variables:

```env
# General System Config
PROJECT_NAME=DermaNova
ENVIRONMENT=production
SECRET_KEY=your-super-secret-jwt-key-change-in-production

# Database Configuration
POSTGRES_USER=dermanova_admin
POSTGRES_PASSWORD=dermanova_secure_password
POSTGRES_DB=dermanova_db
POSTGRES_HOST=db
POSTGRES_PORT=5432
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}

# Backend Service Config
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
ALLOWED_CORS_ORIGINS=http://localhost:3000,https://dermanova.app

# ML Model Configuration
MODEL_CHECKPOINT_PATH=ml_pipeline/models/saved_models/dermanova_multitask_v1.onnx
USE_GPU=true
MAX_INFERENCE_BATCH_SIZE=8

# Frontend Config
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

---

## 3. Local Docker Deployment Command

```bash
# Build and launch all services in detached mode
docker-compose up --build -d

# Inspect running container logs
docker-compose logs -f backend

# Stop services
docker-compose down -d
```

---

## 4. Cloud Infrastructure Deployment Recommendations

### 4.1 AWS Architecture
- **Frontend**: AWS Amplify or AWS S3 + CloudFront CDN.
- **Backend Service**: AWS ECS (Elastic Container Service) running Fargate or EC2 GPU instances (`g4dn.xlarge`) for accelerated model inference.
- **Database**: AWS RDS PostgreSQL.
- **Model Checkpoints**: AWS S3 bucket mounted or fetched at container startup.

### 4.2 GCP Architecture
- **Frontend & API Gateway**: GCP Cloud Run.
- **Inference Engine**: GCP Vertex AI Endpoint or Cloud Run with GPU support.
- **Database**: Cloud SQL for PostgreSQL.

---

## 5. Security & Compliance Checklist

- [ ] **HTTPS / TLS Encryption**: Enforce TLS 1.3 across public endpoints via NGINX reverse proxy or Cloudflare.
- [ ] **Payload Sanitization**: Restrict uploaded image file formats to `image/jpeg`, `image/png`, and cap file size to 10 MB.
- [ ] **PHI / Privacy Masking**: Images processed in memory; temporary files auto-purged post-inference.
- [ ] **CORS Policy**: Explicit domain whitelist enforced in `backend/app/main.py`.
