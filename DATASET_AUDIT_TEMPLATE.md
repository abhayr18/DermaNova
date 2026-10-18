# DermaNova Dermatology Dataset Audit Template 📋

> **Instructions**: Complete this audit report for every external or internal dataset prior to ingesting images into `datasets/raw/` or training pipelines. This document ensures data provenance, medical annotation reliability, demographic representation, and algorithmic fairness.

---

## 1. General Dataset Metadata

| Field | Details |
| :--- | :--- |
| **Dataset Title** | *e.g., Fitzpatrick 17k / SCIN / DermNet / Internal Clinical Dataset* |
| **Audit Date** | `YYYY-MM-DD` |
| **Auditor(s)** | *Name & Role of AI Research Engineer / Clinical Lead* |
| **Source URL / Repository** | *[Link / DOI]* |
| **License Type** | *e.g., CC BY-NC 4.0, MIT, Open Database License, Proprietary* |
| **Total Sample Count** | *Number of total images* |
| **Image Resolution Range** | *e.g., 512x512 to 4000x3000 pixels* |
| **Storage Size (GB)** | *Size in Gigabytes* |

---

## 2. Clinical Annotation & Label Integrity

### 2.1 Medical Ground Truth Provenance
- [ ] Annotations provided by Board-Certified Dermatologists
- [ ] Annotations provided by General Practitioners
- [ ] Self-reported / Crowd-sourced labels
- [ ] Algorithmic / Pseudo-labels

### 2.2 Target Skin Condition Coverage & Class Distribution

| Condition Class | Sample Count | Class Ratio (%) | Annotation Format (Bounding Box / Mask / Image Label) | Severity Grading System Used |
| :--- | :---: | :---: | :--- | :--- |
| **Acne Vulgaris** | | | Image Level / Bounding Box | GAGS (Global Acne Grading System) |
| **Hyperpigmentation** | | | Segmentation Mask | Melanin Index / Spot Count |
| **Erythema / Redness** | | | Image Level | EASI / Visual Analog Scale |
| **Fine Lines / Wrinkles**| | | Bounding Box | Wrinkle Severity Rating Scale (WSRS)|
| **Enlarged Pores** | | | Micro-crop / Mask | Density Index |
| **Normal / Healthy Skin**| | | Image Level | N/A |

---

## 3. Demographic & Fitzpatrick Skin Tone Balance

### 3.1 Fitzpatrick Scale Representation (Skin Types I–VI)

| Skin Type | Description | Sample Count | Percentage (%) | Representation Status (Under/Balanced/Over) |
| :---: | :--- | :---: | :---: | :---: |
| **Type I** | Pale white skin, always burns, never tans | | | |
| **Type II** | White skin, burns easily, tans minimally | | | |
| **Type III**| White/Olive skin, burns moderately, tans gradually | | | |
| **Type IV** | Light brown/Olive skin, burns minimally, tans well | | | |
| **Type V**  | Brown skin, rarely burns, tans profusely | | | |
| **Type VI** | Dark brown/Black skin, never burns, deeply pigmented | | | |
| **Unlabeled**| Skin tone metadata missing | | | |

> ⚠️ **Bias Mitigation Threshold**: Datasets where any single Fitzpatrick type constitutes < 10% of total samples must undergo synthetic augmentation or re-balancing before training.

### 3.2 Age & Gender Distribution
- **Age Range**: *Min - Max years (e.g., 18 - 65)*
- **Gender Balance**: *Female (%) / Male (%) / Non-binary (%) / Unspecified (%)*

---

## 4. Image Quality & Optical Artifact Audit

| Quality Parameter | Status / Ratio (%) | Assessment Methodology & Thresholds |
| :--- | :---: | :--- |
| **Blur & Defocus Rate** | | Laplacian Variance threshold < 100 |
| **Over/Under Exposure** | | Luminance histogram truncation |
| **Color Cast / White Balance Distortion** | | CIELAB color space distribution audit |
| **Obstructions (Hair, Jewelry, Makeup)**| | Manual visual inspection of 5% sample |
| **Watermarks / Overlay Text** | | Automated text region detection |
| **Flash / Specular Reflection Artifacts**| | Highlight saturation pixel percentage |

---

## 5. Ethics, Privacy & Legal Compliance

- [ ] **IRB Approval**: Institutional Review Board approval documented (Protocol #_______)
- [ ] **Patient Consent**: Explicit written consent for medical image usage & research sharing
- [ ] **De-identification**: All HIPAA/GDPR Protected Health Information (PHI) stripped (No metadata EXIF, names, IDs)
- [ ] **Anonymization Verification**: Facial features obscured or cropped to exclude non-skin diagnostic regions where applicable
- [ ] **Commercial Usage Rights**: Dataset permits commercial application & deployment

---

## 6. Train / Validation / Test Splitting Protocol

- **Target Split Ratio**: 70% Train / 15% Validation / 15% Test
- **Splitting Strategy**: Stratified Group K-Fold (Ensuring zero patient overlap across splits to prevent data leakage)
- **Grouping Key**: `patient_id` / `subject_id`

---

## 7. Final Audit Recommendation & Sign-off

- [ ] **ACCEPTED**: Dataset meets clinical, technical, and ethical standards for direct integration.
- [ ] **ACCEPTED WITH CONDITIONS**: Dataset requires cleaning, cropping, or re-balancing before training.
- [ ] **REJECTED**: Dataset fails safety, ethical, quality, or demographic requirements.

**Auditor Signature**: ___________________________  
**Date**: `YYYY-MM-DD`
