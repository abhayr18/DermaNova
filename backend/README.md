# DermaNova AI Clinical Backend

Production-oriented FastAPI backend for **DermaNova**, an AI-assisted facial skin analysis and personalized skincare guidance platform.

---

## 1. System Architecture & Workflow

The backend implements a modular, high-reliability pipeline designed for medical image evaluation and privacy-conscious patient care:

```
[Client / Next.js]
       │
       ▼  Multipart/Form-Data Image Upload
[1. Image Validation Service]  ──► Enforces size (5MB limit), Magic bytes (JPEG, PNG, WebP),
       │                           and Decompression bomb defense (max 25M pixels).
       ▼
[2. Optical Quality Gatekeeper] ──► Laplacian blur check (var >= 65), Illumination [35, 235],
       │                           and Fitzpatrick human skin chrominance cluster (YCrCb).
       ▼
[3. Preprocessing Service]     ──► Bicubic upscaling + LAB CLAHE (clip 2.0, grid 8x8) +
       │                           Target (224x224) + ImageNet float32 normalization.
       ▼
[4. ML Inference Engine]       ──► EfficientNet-B0 Multi-Task Neural Network (PyTorch):
       │                           - 8-class multi-label sigmoid condition probabilities
       │                           - 3-grade ordinal acne severity ranking
       │                           - 5-class biophysical skin-type classification
       │                           - Authentic Grad-CAM attention heatmap backpropagation
       ▼
[5. Post-Processing Service]   ──► Threshold calibration (0.38), health score (0-100),
       │                           lesion localization bounding boxes, and Turbo heatmap overlay.
       ▼
[6. Recommendation Service]    ──► Rule-based active ingredient mapping, routine generation,
       │                           and contraindication filtering (sensitive skin, pregnancy).
       ▼
[7. Persistence & Storage]     ──► PostgreSQL (Supabase) / SQLite local fallback,
       │                           Supabase Object Storage / private local file storage.
       ▼
[Versioned JSON Response]      ──► HTTP 201 Created with structured findings & routine.
```

---

## 2. Directory Structure

```
backend/
  app/
    main.py                           # App creation, lifespan, CORS, and exception handlers
    core/
      config.py                       # Centralized settings and environment validation
      security.py                     # JWT token verification (Supabase/native) and password hashing
      logging.py                      # Privacy-safe structured logger (redacts tokens/PII)
      exceptions.py                   # Domain exception hierarchy and standardized JSON handlers
    api/
      router.py                       # Central v1 router combining all routes
      routes/
        health.py                     # GET /api/v1/health (liveness and readiness)
        model_info.py                 # GET /api/v1/model-info (public metadata & capabilities)
        analyses.py                   # CRUD endpoints for analyses (/api/v1/analyses)
        recommendations.py            # GET /api/v1/recommendations/{analysis_id}
    schemas/
      common.py                       # Error schemas, pagination, and health payloads
      analysis.py                     # Analysis response, condition scores, lesion boxes
      recommendation.py               # Active ingredients, daily routine, curated products
    services/
      analysis_service.py             # End-to-end analysis orchestration
      image_validation_service.py     # Size, magic byte, and decompression bomb verification
      image_quality_service.py        # Blur, exposure, and skin presence verification
      preprocessing_service.py        # LAB CLAHE, bicubic upscaling, and tensor normalization
      prediction_service.py           # Thresholding, health scoring, lesion localization
      recommendation_service.py       # Rule-based skincare guidance and contraindications
      storage_service.py              # Cloud (Supabase) and local private file storage
    ml/
      model_loader.py                 # Singleton lifecycle, weights_only=True, device detection
      model_factory.py                # EfficientNet-B0 multi-task architecture builder
      inference.py                    # Deterministic PyTorch inference & Grad-CAM extraction
      class_mapping.py                # Verified condition labels, metadata, and severity grades
    db/
      client.py                       # Database engine and session factory
      repositories/
        analysis_repository.py        # CRUD database repository with ownership verification
  tests/
    test_health.py                    # Health & model info API tests
    test_image_validation.py          # Format, magic bytes, and optical gatekeeper tests
    test_preprocessing.py             # Tensor conversion, normalization, and CLAHE tests
    test_prediction.py                # PyTorch forward pass, scoring, and recommendation tests
    test_analyses_api.py              # Analyses CRUD, history pagination, and deletion tests
  requirements.txt
  .env.example
  README.md
```

---

## 3. Verified Model Architecture & Semantics

- **Framework**: PyTorch (`torch>=2.2.0`, `torchvision>=0.17.0`)
- **Backbone**: `torchvision.models.efficientnet_b0` (Feature maps: 1280)
- **Shared Dense Projector**: `Dropout(0.3) -> Linear(1280, 512) -> BatchNorm1d(512) -> SiLU()`
- **Classification Heads**:
  - `head_conditions`: `Linear(512, 8)` with Sigmoid activation (Multi-Label task trained with Asymmetric Focal Loss).
  - `head_severity`: `Linear(512, 3)` with Ordinal Ranking (Mild, Moderate, Severe).
  - `head_skin_type`: `Linear(512, 5)` with Cross-Entropy (Normal, Oily, Dry, Combination, Sensitive).
- **Verified Condition Class Order**:
  1. `acne` (Inflammatory Acne)
  2. `blackheads` (Open Comedones)
  3. `whiteheads` (Closed Comedones)
  4. `dark_spots` (Localized PIH)
  5. `pigmentation` (Diffuse Melasma)
  6. `pores` (Dilated Follicular Orifices)
  7. `wrinkles` (Fine Lines & Wrinkles)
  8. `redness` (Facial Erythema & Microvascular Dilation)
- **Checkpoint Location**: `ml_pipeline/models/saved_models/dermanova_best_weights.pth`
- **Deserialization**: Safe loading via `torch.load(..., weights_only=True, map_location=device)` with `strict=True`.

---

## 4. API Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/health` | Liveness & Readiness check (DB & Model status) | No |
| `GET` | `/api/v1/model-info` | Safe ML model architecture & capability metadata | No |
| `POST` | `/api/v1/analyses` | Upload image for multi-task diagnosis (multipart) | Optional |
| `GET` | `/api/v1/analyses` | Paginated analysis history for authenticated user | Yes |
| `GET` | `/api/v1/analyses/{id}` | Retrieve single analysis assessment by ID | Yes |
| `DELETE`| `/api/v1/analyses/{id}` | Delete analysis record and linked cloud images | Yes |
| `GET` | `/api/v1/recommendations/{id}`| Retrieve curated skincare guidance for analysis | Yes |

*Note: Backward-compatible legacy endpoints `/api/v1/analyze`, `/api/v1/recommend`, and `/api/v1/history` remain active.*

---

## 5. Getting Started

### Prerequisites

- Python 3.10+ (or Python 3.14)
- Node.js 18+ and npm (for frontend)
- (Optional) CUDA-capable GPU for accelerated PyTorch inference

### Backend Setup

```bash
# 1. Navigate to repository root
cd DermaNova

# 2. Install dependencies
pip install -r backend/requirements.txt

# 3. Configure environment
cp backend/.env.example .env

# 4. Start FastAPI server
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

The interactive OpenAPI documentation will be accessible at:
- `http://localhost:8000/docs`
- `http://localhost:8000/redoc`

### Frontend Setup

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install Node dependencies
npm install

# 3. Start Next.js development server
npm run dev
```

The application UI will be accessible at `http://localhost:3000`.

---

## 6. Running Tests

Run the complete test suite using pytest:

```bash
# Run new modular backend tests (23 tests)
python -m pytest backend/tests/ -v

# Run legacy regression suite (14 tests)
python -m pytest tests/ -v

# Run all test suites together (37 tests)
python -m pytest backend/tests/ tests/
```

---

## 7. Medical & Ethical Disclaimer

**DermaNova is an educational and informational skin analysis tool.** It does not provide medical diagnosis, clinical prognosis, or prescription medications. Users with severe, worsening, painful, bleeding, or rapidly changing skin lesions are instructed to seek professional evaluation from a board-certified dermatologist. Facial photographs are retained only when explicitly consented to and can be permanently deleted by the user at any time.
