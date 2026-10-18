# DermaNova Technical & System Architecture Specification 🏗️

## 1. Architectural Layers

DermaNova follows a decoupled, microservices-oriented architecture designed for scalability, low-latency inference, and seamless developer iteration.

```
+-----------------------------------------------------------------------+
|                         PRESENTATION LAYER                            |
|    Next.js 14 App Router | React | Tailwind CSS | TypeScript Client   |
+-----------------------------------++----------------------------------+
                                    || HTTP / JSON / Multipart
                                    v
+-----------------------------------------------------------------------+
|                          APPLICATION LAYER                            |
|             FastAPI Server (Python 3.10) | Uvicorn ASGI               |
|  - Auth & Security (JWT)             - Input Validation (Pydantic)    |
|  - Rate Limiting & Middleware        - Background Inference Runner    |
+-----------------------------------++----------------------------------+
                                    || Async IPC / Direct Call
                                    v
+-----------------------------------------------------------------------+
|                    COMPUTER VISION & ML ENGINE                        |
|       MediaPipe Face Alignment | OpenCV Preprocessing | PyTorch       |
|  - Image Quality Inspector           - ROI Cropper & Normalizer       |
|  - Multi-Task CNN Backbone           - Grad-CAM Heatmap Generator     |
+-----------------------------------++----------------------------------+
                                    ||
                                    v
+-----------------------------------------------------------------------+
|                    RECOMMENDATION & DATA LAYER                        |
|  - Active Ingredient Rule Engine     - Relational Database (PostgreSQL)|
|  - Contraindication Evaluator       - ML Artifact Store (Saved Models)|
+-----------------------------------------------------------------------+
```

---

## 2. ML Pipeline Component Detail (`ml_pipeline/`)

1. **`data_ingestion/`**: Loads raw images and metadata annotations from `datasets/raw/`. Formats dataset splits into standard PyTorch `Dataset` and `DataLoader` instances.
2. **`preprocessing/`**:
   - `face_alignment.py`: Detects 68 facial landmarks to align eyes/nose horizontally.
   - `roi_extraction.py`: Isolates sub-regions (Left Cheek, Right Cheek, Forehead, Nose, Chin).
   - `color_normalization.py`: Adjusts illumination variations using LAB color space histogram matching.
3. **`augmentation/`**: Albumentations pipeline providing random affine transforms, Gaussian noise, color jitter, and CLAHE contrast adjustment.
4. **`models/`**:
   - `cnn/`: Custom CNN backbones and pre-trained weights wrappers (ResNet, EfficientNet).
   - `transfer_learning/`: ConvNeXt and Swin Transformer adaptation layers.
   - `saved_models/`: Serialized model checkpoints (`.pth`, `.onnx`).
5. **`training/`**: Modular trainer class with learning rate scheduling, mixed precision (AMP), and loss calculation.
6. **`evaluation/`**: Evaluates model checkpoints against hold-out test sets, calculating F1, ROC-AUC, and demographic equity metrics.
7. **`inference/`**: High-performance ONNX Runtime wrapper executing asynchronous batch inference.

---

## 3. FastAPI Backend Design (`backend/app/`)

- **`main.py`**: Initializes the FastAPI app, mounts router endpoints, configures CORS origins, and registers exception handlers.
- **`api/v1/`**:
  - `/analysis/predict`: Accepts uploaded facial image (`multipart/form-data`), runs ML pipeline, returns diagnostic score JSON.
  - `/recommendation/generate`: Accepts skin severity index, returns curated active ingredient routine.
  - `/auth/`: User registration, login, and JWT generation endpoints.
- **`services/`**:
  - `cv_service.py`: Interface to the Computer Vision pipeline.
  - `recommender.py`: Rule-based recommendation engine mapping skin conditions to active ingredients.
- **`models/`**: Pydantic schemas for request/response validation and ORM data classes.

---

## 4. Next.js Frontend Design (`frontend/`)

- **`app/`**: Next.js App Router containing route pages (`/dashboard`, `/upload`, `/results`, `/history`).
- **`components/`**:
  - `CameraCapture.tsx`: WebCam stream component for live snapshot capture.
  - `SkinAnalysisReport.tsx`: Visual breakdown of scores, skin radar chart, and Grad-CAM overlay viewer.
  - `RecommendationCard.tsx`: Display card for active ingredients, morning/evening routine steps, and usage frequency warnings.
- **`services/api.ts`**: Axios/Fetch client wrapper handling API communication with the backend.

---

## 5. Data Flow Sequence

1. User captures image via `CameraCapture.tsx` or uploads JPEG/PNG.
2. Frontend posts image binary payload to FastAPI endpoint POST `/api/v1/analysis/predict`.
3. Backend validates image headers and passes buffer to `cv_service.py`.
4. `cv_service.py` runs alignment, ROI crop, and passes normalized tensor to PyTorch/ONNX inference model.
5. Model produces multi-task output vector: `[Acne: 0.72, Hyperpigmentation: 0.34, Redness: 0.58, Wrinkles: 0.12, Pores: 0.45]`.
6. Output vector is passed to `recommender.py` to synthesize morning & evening skincare routine.
7. Diagnostic payload + recommendation object saved to PostgreSQL database.
8. Complete JSON response returned to Next.js frontend and rendered dynamically.
