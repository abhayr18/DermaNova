# DermaNova Research & Experimentation Log 🧪

> **Purpose**: Maintain a chronological, immutable record of dataset exploratory data analysis (EDA), model training experiments, architectural hypotheses, hyperparameter sweeps, ablation studies, and technical decisions.

---

## 📖 Log Format Guidelines
Every entry should adhere to the following schema:
- **Date & Log ID**: `YYYY-MM-DD-EXP-XXX`
- **Author/Researcher**: Lead AI Architect / Research Engineer
- **Hypothesis/Objective**: What are we testing or investigating?
- **Dataset / Subset Version**: Data split and filter parameters used.
- **Model / Architecture**: Backbone, pre-trained weights, loss functions, optimizer.
- **Key Results / Metrics**: Accuracy, Precision, Recall, F1, ROC-AUC, Latency.
- **Decisions & Next Steps**: Did this experiment validate the hypothesis?

---

## 📝 Chronological Research Entries

### Entry `2026-08-07-EXP-001`: Repository Architecture & ML Pipeline Design

* **Date**: 2026-08-07
* **Category**: System Architecture & MLOps Infrastructure
* **Objective**: Establish standard research repository design supporting end-to-end deep learning workflows, dataset auditing, FastAPI microservices, and Next.js frontend integration.
* **Outcome**: Skeleton architecture validated and deployed.

---

### Entry `2026-08-07-EXP-002`: Dataset Audit & Perceptual Hashing of Facial Skin Dataset 1

* **Date**: 2026-08-07
* **Category**: Data Engineering & Quality Audit
* **Dataset Audited**: `facial-skin-acne-pigmentation-pores-wrinkles` (4,233 raw images, 8 classes)
* **Notebook Artifact**: [dermanova-dataset-audit-01.ipynb](file:///d:/DermaNova/research/notebooks/dataset_exploration/dermanova-dataset-audit-01.ipynb)
* **Audit Report**: [01_facial_skin_acne_pigmentation_audit.md](file:///d:/DermaNova/docs/dataset_audit_reports/01_facial_skin_acne_pigmentation_audit.md)
* **Outcome**: Dataset audit completed. Deduplication module deployed.

---

### Entry `2026-08-07-EXP-003`: API Audit & Zero-Disk Storage Strategy for Dataset #2 (GlowMix)

* **Date**: 2026-08-07
* **Category**: Data Engineering & Zero-Disk Storage MLOps
* **Dataset Audited**: `drishyatomar/glowmix-merged-facial-skincare-dataset` (3.81 GB, MIT License)
* **Notebook Artifact**: [glowmix-dataset-audit.ipynb](file:///d:/DermaNova/research/notebooks/dataset_exploration/glowmix-dataset-audit.ipynb)
* **Audit Report**: [02_glowmix_dataset_audit.md](file:///d:/DermaNova/docs/dataset_audit_reports/02_glowmix_dataset_audit.md)
* **Architectural Decisions**:
  1. **Raw Cache Purging**: Deleted 936 MB of partially downloaded files from `~/.cache/kagglehub/datasets/drishyatomar` to maintain 0 MB disk impact.
  2. **API Streaming Module**: Deployed `ml_pipeline/data_ingestion/kaggle_api_ingestion.py` for streaming dataset batches directly via Kaggle API.
* **Outcome**: Dataset #2 audit completed. Local disk space cleaned and saved.

---

### Entry `2026-08-07-EXP-004`: Complete Empirical Audit & Master Dual-Dataset Jury Report Synthesis

* **Date**: 2026-08-07
* **Category**: Computational Exploratory Data Analysis & Jury Presentation Synthesis
* **Dataset Audited**: GlowMix (`DS-002`, 9,770 images) + Facial Skin (`DS-001`, 4,233 images) -> **14,003 Total Raw Images**
* **Notebook Artifact**: [glowmix-dataset-audit.ipynb](file:///d:/DermaNova/research/notebooks/dataset_exploration/glowmix-dataset-audit.ipynb)
* **Master Jury Deliverable**: [DERMANOVA_DATASET_COLLECTION_AND_AUDIT_REPORT.md](file:///d:/DermaNova/reports/dataset_reports/DERMANOVA_DATASET_COLLECTION_AND_AUDIT_REPORT.md)
* **Detailed Audit Report**: [02_glowmix_dataset_audit.md](file:///d:/DermaNova/docs/dataset_audit_reports/02_glowmix_dataset_audit.md)
* **Empirical Results**:
  1. **Redundancy**: Identified 9,463 unique SHA-256 hashes and 7,354 unique pHashes in GlowMix (2,416 redundant copies pruned).
  2. **Label Contamination**: Found 26 cross-class pHash collision groups (56 images, e.g. `acne-open-comedo-*` assigned to both `acne` and `blackheades`). Resolved via multi-label target vectors.
  3. **Resolution Deficit**: Discovered 1,282 sub-224px images (43.59% of acne samples). Deployed CLAHE + Bicubic upscaling pipeline.
* **Outcome**: Master Dual-Dataset Audit Report completed and verified for jury presentation.

---

## 🔬 Dataset Experimentation Ledger

| Exp ID | Date | Dataset Name | Local Disk Size | License | Ingestion Method | Audit Status |
| :--- | :---: | :--- | :---: | :---: | :--- | :---: |
| `DS-001` | 2026-08-07 | Facial Skin (Acne/Pigmentation) | ~1.2 GB | Open | Local Deduplicated | 🟢 Audited |
| `DS-002` | 2026-08-07 | GlowMix Merged Facial Dataset | **0.00 MB (Purged)** | MIT | Kaggle API Stream | 🟢 Audited (9,770 images) |

---

## 🤖 Model Experimentation & Evaluation Ledger

| Exp ID | Backbone | Loss Function | Image Size | Batch Size | Learning Rate | Epochs | F1 Score | Inference Latency | Status |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `MOD-001` | ResNet-50 | CrossEntropy | 224x224 | 32 | 1e-4 | 50 | TBD | TBD | Planned |
| `MOD-002` | EfficientNet-B4 | Focal Loss | 380x380 | 16 | 3e-4 | 50 | TBD | TBD | Planned |
| `MOD-003` | ConvNeXt-Small | Weighted BCE | 384x384 | 16 | 1e-4 | 50 | TBD | TBD | Planned |

