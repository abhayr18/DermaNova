---
title: DermaNova AI Skin Diagnostic
emoji: 🔬
colorFrom: blue
colorTo: indigo
sdk: gradio
app_file: app.py
pinned: false
license: mit
---

# DermaNova 🌿🔬
### AI-Driven Facial Skin Analysis & Personalized Skincare Recommendation Framework

![DermaNova Banner](https://img.shields.io/badge/Project-DermaNova-008080?style=for-the-badge&logo=medikit)
![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen?style=for-the-badge)
![Python Version](https://img.shields.io/badge/Python-3.10%2B-blue?style=for-the-badge&logo=python)
![Framework](https://img.shields.io/badge/PyTorch-2.2%2B-EE4C2C?style=for-the-badge&logo=pytorch)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688?style=for-the-badge&logo=fastapi)
![Next.js](https://img.shields.io/badge/Next.js-14.0-000000?style=for-the-badge&logo=next.js)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

---

## 📌 Executive Summary

**DermaNova** is a research-grade, end-to-end artificial intelligence framework engineered for quantitative facial skin analysis, multi-task lesion/condition classification, and automated personalized skincare recommendation synthesis. 

Leveraging state-of-the-art Deep Convolutional Neural Networks (CNNs), Vision Transformers (ViT), and computer vision preprocessing, DermaNova enables objective assessment of skin parameters including acne severity, hyperpigmentation, erythema/redness, pore density, and wrinkle metrics across diverse Fitzpatrick skin types.

---

## 🎯 Project Vision & Core Objectives

1. **Precision Dermatology & CV**: Develop high-accuracy multi-label multi-class computer vision models trained on clinically annotated dermatology datasets.
2. **Algorithmic Fairness**: Audit and mitigate bias across skin tones (Fitzpatrick scales I–VI), ages, and lighting environments to ensure demographically equitable diagnostic performance.
3. **Personalized Skincare Engine**: Map predicted skin condition severity indices to evidence-based active ingredients (e.g., Niacinamide, Salicylic Acid, Retinoids) and synthesized routine recommendations.
4. **Scalable Microservice Architecture**: Provide robust low-latency RESTful microservices powered by FastAPI, asynchronous task handling, and a dynamic modern UI built with Next.js and Tailwind CSS.
5. **Research Transparency**: Maintain rigorous experiment tracking, data provenance, model audit trails, and automated evaluation metrics.

---

## 🏗️ System Architecture & Workflow

```
                        +---------------------------------------+
                        |      Next.js Frontend (TypeScript)    |
                        |   - Web Cam Capture / Image Upload   |
                        |   - Interactive Diagnostic Dashboard  |
                        +-------------------+-------------------+
                                            |
                                  HTTP / REST API Payload
                                            v
                        +-------------------+-------------------+
                        |       FastAPI Backend Service         |
                        |   - Auth & Session Management         |
                        |   - Request Validation & Preprocess  |
                        +-------------------+-------------------+
                                            |
                                            v
                        +-------------------+-------------------+
                        |       Computer Vision Pipeline        |
                        |   - Face Alignment & Segmentation    |
                        |   - ROI Extraction & Normalization    |
                        +-------------------+-------------------+
                                            |
                                            v
                        +-------------------+-------------------+
                        |     Deep Learning Model Server        |
                        |   - CNN Backbone (ResNet/EfficientNet)|
                        |   - Multi-Task Head Classification    |
                        |   - Severity Index Scoring            |
                        +-------------------+-------------------+
                                            |
                                            v
                        +-------------------+-------------------+
                        |  Skincare Recommendation Engine       |
                        |   - Active Ingredient Mapping         |
                        |   - Contraindication Rules            |
                        +---------------------------------------+
```

---

## 📁 Repository Structure Overview

```
DermaNova/
├── README.md                           # Main project document & developer setup guide
├── PROJECT_STATUS.md                   # Live task progress tracker & development milestones
├── RESEARCH_LOG.md                     # Experiment logging ledger & architectural decisions
├── DATASET_AUDIT_TEMPLATE.md           # Standardized clinical audit checklist for dataset intake
├── LICENSE                             # Open source MIT license
├── requirements.txt                    # Python runtime & ML dependency declarations
├── docker-compose.yml                  # Container orchestration for FastAPI, Next.js, Postgres
│
├── docs/                               # Comprehensive architecture & research documentation
│   ├── project_overview.md             # Detailed vision, clinical scope, and ethics
│   ├── architecture.md                 # System diagrams, data schemas, API contracts
│   ├── dataset_audit_reports/          # Completed data quality & demographic audits
│   ├── research_notes/                 # Literature reviews and math derivations
│   └── model_documentation/            # Model cards, hyperparameter configs, loss curves
│
├── datasets/                           # Data repository (Ignored in Git, structured locally)
│   ├── raw/                            # Original un-altered image datasets
│   ├── processed/                      # Cropped, aligned, and normalized images
│   ├── annotations/                    # Ground truth labels, JSON metadata, CSV splits
│   └── dataset_audit/                  # Automated EDA outputs & quality reports
│
├── research/                           # Research sandbox & experimentation
│   ├── notebooks/                      # Jupyter notebooks (Exploration, Training, Eval)
│   ├── experiments/                    # MLflow/TensorBoard experiment logs & artifacts
│   └── papers/                         # Reference academic literature (PDFs/notes)
│
├── ml_pipeline/                        # Production ML & Computer Vision codebase
│   ├── data_ingestion/                 # Data loaders, dataset parsers, split generators
│   ├── preprocessing/                  # Face alignment, landmark detection, illumination fix
│   ├── augmentation/                   # Augmentation strategies (Albumentations)
│   ├── feature_extraction/             # Color histograms, texture descriptors (GLCM)
│   ├── models/                         # CNN architectures, transfer learning wrappers
│   ├── training/                       # Trainer loops, custom loss functions, schedulers
│   ├── evaluation/                     # Confusion matrices, ROC-AUC, F1, fairness metrics
│   └── inference/                      # Optimized ONNX/TorchScript inference pipelines
│
├── backend/                            # FastAPI microservice
│   ├── app/                            # Core FastAPI application package
│   │   ├── main.py                     # API entry point & CORS configuration
│   │   ├── api/                        # Route handlers (v1 endpoints)
│   │   ├── services/                   # Business logic (Inference runner, Recommender)
│   │   ├── models/                     # Pydantic schemas & DB ORM models
│   │   ├── database/                   # DB engine connections & migrations
│   │   ├── authentication/             # JWT auth & security helpers
│   │   └── utils/                      # Helper utilities
│   ├── tests/                          # Pytest suite for API endpoints & services
│   └── Dockerfile                      # Production Docker container definition for backend
│
├── frontend/                           # Next.js web interface
│   ├── app/                            # Next.js App Router (Pages & Layouts)
│   ├── components/                     # Reusable React components (UI elements)
│   ├── hooks/                          # Custom React hooks
│   ├── services/                       # API client services (Axios/Fetch)
│   ├── public/                         # Static assets (Logos, icons)
│   ├── styles/                         # Tailwind CSS configurations & global styles
│   └── package.json                    # Node dependencies & build scripts
│
├── deployment/                         # Infrastructure & Deployment scripts
│   ├── docker/                         # Production Docker container overrides
│   ├── cloud/                          # AWS / GCP deployment manifests
│   └── deployment_notes.md             # DevOps setup & cloud infrastructure guide
│
└── reports/                            # Publication & audit deliverables
    ├── dataset_reports/                # EDA distribution charts & bias evaluations
    ├── model_results/                  # Benchmarks, baseline comparisons, confusion matrices
    ├── performance_metrics/            # Latency, memory footprint, throughput metrics
    └── final_project_report/           # Comprehensive academic research report
```

---

## 🚀 Development Phases

| Phase | Milestone Name | Description | Key Deliverables |
| :--- | :--- | :--- | :--- |
| **Phase 1** | Architecture & Scaffold | Repository setup, schema definitions, documentation standards | Project skeleton, `.gitkeep` trees, baseline docs |
| **Phase 2** | Data Engineering & Audit | Data collection, annotation auditing, face cropping pipeline | Cleaned datasets, audit reports, data loaders |
| **Phase 3** | Model R&D & Benchmarks | CNN backbone evaluation, transfer learning, hyperparameter tuning | Trained PyTorch checkpoints, confusion matrices |
| **Phase 4** | Inference & Recommendation Engine | ONNX optimization, active ingredient knowledge graph mapping | Low-latency inference module, recommendation API |
| **Phase 5** | Full-Stack Integration | FastAPI service & Next.js frontend UI integration | Responsive Web App, web-cam capture, report exporter |
| **Phase 6** | Validation & Deployment | End-to-end integration testing, Docker deployment, cloud CI/CD | Docker container images, final research report |

---

## 🛠️ Technology Stack

* **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, Lucide Icons, Chart.js / Recharts
* **Backend**: Python 3.10+, FastAPI, Uvicorn, Pydantic v2, SQLAlchemy / Motor
* **AI/ML & CV**: PyTorch, Torchvision, OpenCV, Albumentations, Scikit-Learn, NumPy, Pandas, ONNX Runtime
* **Database**: PostgreSQL (Structured User Data & Analysis Logs) / MongoDB (Flexible Recommendation Rules)
* **DevOps & MLOps**: Docker, Docker Compose, MLflow / TensorBoard, Pytest

---

## 📦 Quick Start & Local Setup

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ & npm/yarn
- Docker & Docker Compose (Optional for containerized run)

### 2. Environment Setup

```bash
# Clone the repository
git clone https://github.com/your-org/DermaNova.git
cd DermaNova

# Set up Python virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install backend & ML dependencies
pip install -r requirements.txt
```

### 3. Running Backend (FastAPI)

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
*Access Interactive Swagger API Docs at:* `http://localhost:8000/docs`

### 4. Running Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```
*Access Web Dashboard at:* `http://localhost:3000`

### 5. Running with Docker Compose

```bash
docker-compose up --build
```

---

## ⚖️ License & Ethical Disclaimer

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

> **Important Clinical Disclaimer**: DermaNova is designed exclusively for research, education, and cosmetic skincare optimization purposes. It is **not** a diagnostic medical device and does **not** replace professional advice from a board-certified dermatologist.
