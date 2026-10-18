# Dataset Audit Report: Facial Skin (Acne, Pigmentation, Pores, Wrinkles) 📊

> **Audit Report ID**: `AUDIT-DS-001`  
> **Source Dataset**: `facial-skin-acne-pigmentation-pores-wrinkles` (Shijo John / Kaggle / Roboflow)  
> **Audit Date**: 2026-08-07  
> **Auditor**: Senior AI Research Engineer & ML Architect

---

## 1. Executive Summary & Audit Findings

An exhaustive audit of the `facial-skin-acne-pigmentation-pores-wrinkles` dataset was performed using MD5 hashing, ImageHash perceptual hashing, and class distribution verification.

### 🚨 Major Integrity Risks Identified:
1. **Roboflow Pre-Augmentation Leakage**: The raw dataset contains Roboflow augmented copies (identified by `.rf.<hash>.jpg` suffixes). Uncleaned splitting will cause extreme data leakage between train, validation, and test sets.
2. **Cross-Class Near-Duplicates**: 28 pairs of cross-class near-duplicates were detected (e.g., images labeled as both `dark spots` and `pigmentation`, or `white heads` and `black heads`).
3. **Same-Class Redundancy**: 858 same-class near-duplicate pairs exist due to minor rotation/crop augmentations.
4. **Class Imbalance**: Severe 2:1 imbalance between high-sample classes (`dark spots`: 619) and low-sample classes (`black heads`: 312, `white heads`: 300).

---

## 2. Quantitative Dataset Breakdown

| Metric | Raw Dataset Value | Deduplicated Clean Target |
| :--- | :---: | :---: |
| **Total Images Analyzed** | 4,233 | ~3,752 unique hashes |
| **Unique Perceptual Hashes** | 3,752 | 3,752 |
| **Total Near-Duplicate Pairs** | 886 | 0 (Purged) |
| **Cross-Class Duplicates** | 28 pairs | 0 (Re-labeled or Purged) |
| **Same-Class Duplicates** | 858 pairs | Purged to single canonical instance |
| **Average Image Resolution** | $710 \times 693$ px | Standardized $512 \times 512$ px |
| **Min / Max Resolution** | $150 \times 149$ to $6900 \times 5312$ px | Crop / Resized |

---

## 3. Class Distribution & Sample Breakdown

| Class Name | Raw Sample Count | Raw Ratio (%) | Cleaning Action |
| :--- | :---: | :---: | :--- |
| **dark spots** | 619 | 14.62% | Deduplicate & merge overlapping `pigmentation` labels |
| **inflammatory acne** | 603 | 14.25% | Deduplicate Roboflow copies |
| **wrinkles** | 600 | 14.17% | Deduplicate Roboflow copies |
| **Redness** | 600 | 14.17% | Remove background/non-facial images |
| **pores** | 600 | 14.17% | Filter low-contrast images |
| **pigmentation** | 599 | 14.15% | Resolve overlap with `dark spots` |
| **non inflammatory acne black heads** | 312 | 7.37% | Synthetic augmentation required |
| **non inflammatory acne white heads** | 300 | 7.09% | Synthetic augmentation required |
| **TOTAL** | **4,233** | **100.0%** | **Target clean count: ~3,500 unique frames** |

---

## 4. Perceptual Hashing & Duplicate Analysis

The audit executed ImageHash difference hashing (`phash` / `dhash`) across all 4,233 samples:
- **Total near-duplicate pairs (Hamming distance $\le 4$)**: 886
- **Breakdown of Top Duplicate Pairs**:
  - `('dark spots', 'dark spots')`: 283 pairs
  - `('Redness', 'Redness')`: 240 pairs
  - `('wrinkles', 'wrinkles')`: 98 pairs
  - `('inflammatory acne', 'inflammatory acne')`: 84 pairs
  - `('dark spots', 'pigmentation')`: 26 cross-class pairs ⚠️
  - `('black heads', 'white heads')`: 2 cross-class pairs ⚠️

---

## 5. Remediation Strategy & Action Plan

1. **Deduplication Script**: Deploy `ml_pipeline/data_ingestion/clean_dataset.py` to prune duplicate hashes.
2. **Canonical Grouping**: Group Roboflow `.rf.` variants under their root source filename before performing train/val/test splits to guarantee zero patient/image leakage.
3. **Label Hierarchy Standardization**: Map `dark spots` and `pigmentation` into a unified `hyperpigmentation` multi-label representation or distinct sub-severity grades.
4. **Stratified Group Split**: Implement 70/15/15 train/val/test split grouped by image hash ID.
