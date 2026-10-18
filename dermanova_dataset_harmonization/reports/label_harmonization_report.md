# DermaNova Label Harmonization Report

> **Document Type**: Formal Label Harmonization & Taxonomy Design Report
> **Report ID**: `HARM-DS-001-002-2026`
> **Phase**: Post-Dataset-Audit / Pre-Model-Training
> **Date**: August 2026
> **Authors**: DermaNova AI Research Team
> **Status**: ⚠️ PROPOSED — Awaiting Human Approval

---

## 1. Objective

This report documents the complete label harmonization analysis for the DermaNova AI-based facial skin analysis system. The primary objective is to construct a scientifically defensible unified label taxonomy that maps original dataset labels from two independent data sources into a common DermaNova classification vocabulary, enabling consistent multi-dataset training.

This phase is **strictly read-only**. No raw images were modified, renamed, moved, or deleted. No model training was performed. All mapping decisions presented here are **PROPOSED** and require explicit human approval before the dataset cleaning phase begins.

The report strictly distinguishes between:
- **CONFIRMED**: Empirically verified facts from completed audit reports
- **PROPOSED**: Recommended mapping decisions based on available evidence
- **POTENTIAL**: Hypotheses requiring further investigation
- **REQUIRES MANUAL REVIEW**: Decisions that cannot be resolved programmatically

---

## 2. Datasets Inspected

| ID | Dataset Name | Source Platform | License | Raw Images | Raw Classes |
|---|---|---|---|---|---|
| DS-001 | Facial Skin (Acne, Pigmentation, Pores, Wrinkles) | Kaggle / Roboflow | Open Access Research | 4,233 | 8 |
| DS-002 | GlowMix Merged Facial Skincare Dataset (Skin V2) | Kaggle (`drishyatomar`) | MIT License | 9,770 | 5 |
| **TOTAL** | **Combined Corpus** | **Multi-Source** | **✅ Permissive** | **14,003** | **13 unique** |

---

## 3. Dataset Locations

**DS-001 (Facial Skin):**
```
Kaggle mount: /kaggle/input/facial-skin-acne-pigmentation-pores-wrinkles/
Classes:      /kaggle/input/.../inflammatory acne/
              /kaggle/input/.../dark spots/
              /kaggle/input/.../wrinkles/
              /kaggle/input/.../Redness/
              /kaggle/input/.../pores/
              /kaggle/input/.../pigmentation/
              /kaggle/input/.../non inflammatory acne black heads/
              /kaggle/input/.../non inflammatory acne white heads/
```

**DS-002 (GlowMix Skin V2):**
```
Kaggle mount: /kaggle/input/datasets/drishyatomar/
              glowmix-merged-facial-skincare-dataset/
              Skin Issues Dataset/Skin v2/
Classes:      .../Skin v2/acne/
              .../Skin v2/blackheades/
              .../Skin v2/dark spots/
              .../Skin v2/pores/
              .../Skin v2/wrinkles/
```

**Local Output Directory:**
```
d:\DermaNova\dermanova_dataset_harmonization\
```

---

## 4. Original Label Inventory

| # | Dataset | Original Label (exact) | Image Count | Metadata Available |
|---|---|---|---|---|
| 1 | DS-001 | `inflammatory acne` | 603 | ❌ No |
| 2 | DS-001 | `dark spots` | 619 | ❌ No |
| 3 | DS-001 | `wrinkles` | 600 | ❌ No |
| 4 | DS-001 | `Redness` | 600 | ❌ No |
| 5 | DS-001 | `pores` | 600 | ❌ No |
| 6 | DS-001 | `pigmentation` | 599 | ❌ No |
| 7 | DS-001 | `non inflammatory acne black heads` | 312 | ❌ No |
| 8 | DS-001 | `non inflammatory acne white heads` | 300 | ❌ No |
| 9 | DS-002 | `acne` | 2,060 | Partial (MIT License only) |
| 10 | DS-002 | `blackheades` | 1,970 | Partial (MIT License only) |
| 11 | DS-002 | `dark spots` | 2,126 | Partial (MIT License only) |
| 12 | DS-002 | `pores` | 1,632 | Partial (MIT License only) |
| 13 | DS-002 | `wrinkles` | 1,982 | Partial (MIT License only) |
| **TOTAL** | | | **14,003** | |

> **Note**: No README file, annotation file, or label definition document was found in either dataset's accessible directory structure. All definitions are therefore derived from folder names and audit observations only. This is documented explicitly in `label_definitions.md`.

---

## 5. Proposed DermaNova Target Taxonomy

> ⚠️ **STATUS: PROPOSED — Not Yet Confirmed**

| # | DermaNova Class | Clinical Description | Source Labels |
|---|---|---|---|
| 1 | **Acne** | Inflammatory acne vulgaris (papules, pustules) | `inflammatory acne` (DS-001), `acne` (DS-002) |
| 2 | **Blackheads** | Open comedones (non-inflammatory, dark plug) | `non inflammatory acne black heads` (DS-001), `blackheades` (DS-002) |
| 3 | **Whiteheads** | Closed comedones (non-inflammatory, covered) | `non inflammatory acne white heads` (DS-001) |
| 4 | **Dark Spots** | Localized melanin deposits / dark spots | `dark spots` (DS-001 + DS-002) |
| 5 | **Pigmentation** | Diffuse pigmentation irregularities | `pigmentation` (DS-001) |
| 6 | **Pores** | Enlarged / dilated skin pores | `pores` (DS-001 + DS-002) |
| 7 | **Wrinkles** | Facial wrinkles and fine lines | `wrinkles` (DS-001 + DS-002) |
| 8 | **Redness** | Erythema / facial redness spectrum | `Redness` (DS-001) |

> **Important architectural note**: The DermaNova model architecture must decide between single-label classification and multi-label prediction BEFORE the label mapping is finalized. Images with cross-class pHash conflicts (acne+blackheads on same image) can only be handled correctly in a multi-label framework. This decision requires human approval.

---

## 6. Label Mapping Table

| Original Label | Dataset | Proposed DermaNova Label | Action | Confidence | Review Required |
|---|---|---|---|---|---|
| `inflammatory acne` | DS-001 | Acne | MAP | HIGH | ❌ No |
| `dark spots` | DS-001 | Dark Spots | REVIEW | MEDIUM | ✅ Yes |
| `wrinkles` | DS-001 | Wrinkles | MAP | HIGH | ❌ No |
| `Redness` | DS-001 | Redness | KEEP | MEDIUM | ✅ Yes |
| `pores` | DS-001 | Pores | MAP | HIGH | ❌ No |
| `pigmentation` | DS-001 | Pigmentation | REVIEW | MEDIUM | ✅ Yes |
| `non inflammatory acne black heads` | DS-001 | Blackheads | MAP | HIGH | ❌ No |
| `non inflammatory acne white heads` | DS-001 | Whiteheads | REVIEW | MEDIUM | ✅ Yes |
| `acne` | DS-002 | Acne | MAP | HIGH | ❌ No |
| `blackheades` | DS-002 | Blackheads | MAP | HIGH | ❌ No |
| `dark spots` | DS-002 | Dark Spots | MAP | MEDIUM | ❌ No |
| `pores` | DS-002 | Pores | MAP | HIGH | ❌ No |
| `wrinkles` | DS-002 | Wrinkles | MAP | HIGH | ❌ No |

---

## 7. High-Confidence Mappings

The following **9 mappings** are PROPOSED as HIGH-CONFIDENCE (8 HIGH + 1 MEDIUM from DS-002 dark spots included here due to low conflict risk):

| Original Label | Dataset | DermaNova Label | Basis |
|---|---|---|---|
| `inflammatory acne` | DS-001 | **Acne** | Label name is clinical definition. No conflicts. |
| `wrinkles` | DS-001 | **Wrinkles** | Identical label in DS-002. No conflicts. |
| `pores` | DS-001 | **Pores** | Identical label in DS-002. No conflicts. |
| `non inflammatory acne black heads` | DS-001 | **Blackheads** | Label name is full clinical description. Corroborated by DS-002. |
| `acne` | DS-002 | **Acne** | Unambiguous. Corroborated by DS-001. (Conflict images flagged separately.) |
| `blackheades` | DS-002 | **Blackheads** | Confirmed misspelling of blackheads. Corroborated by DS-001. |
| `dark spots` | DS-002 | **Dark Spots** | Unambiguous label. Low-risk conflict (1 image). |
| `pores` | DS-002 | **Pores** | Identical label in DS-001. No significant conflicts. |
| `wrinkles` | DS-002 | **Wrinkles** | Identical label in DS-001. No conflicts. |

---

## 8. Ambiguous Mappings (REQUIRES MANUAL REVIEW)

### 8.A. Dark Spots vs Pigmentation — ⚠️ HIGH PRIORITY

> **Status**: POTENTIAL semantic overlap / POTENTIAL annotation inconsistency

**Evidence**:
- DS-001 contains BOTH `dark spots` (619 images) AND `pigmentation` (599 images) as separate class folders
- **26 cross-class near-duplicate pairs** detected (Hamming pHash distance ≤ 4)
- These 26 pairs represent images that are visually nearly identical but assigned to different labels
- Neither class has any formal documentation defining how they were distinguished during annotation

**Possible interpretations**:
1. The two classes were annotated by different annotators with no agreed definitions → systematic label inconsistency
2. The classes represent genuinely distinct conditions (e.g., `dark spots` = localized sun spots; `pigmentation` = diffuse melasma) but images were mislabeled in the 26-pair overlap
3. The two classes overlap in clinical presentation and should be unified into a single DermaNova class (e.g., `Hyperpigmentation`)

**PROPOSED (not confirmed)**: Keep as two separate DermaNova classes pending human review of the 26 conflict pairs.

**DO NOT MERGE without human review.** Merging would either eliminate a clinically meaningful distinction (if they are truly different) or introduce noisy multi-label training data (if they are the same condition).

---

### 8.B. Whiteheads — ⚠️ LOW SAMPLE COUNT RISK

> **Status**: Clinically valid class with insufficient training data

**Evidence**:
- DS-001 `non inflammatory acne white heads`: 300 raw images
- No equivalent class exists in DS-002 → cannot supplement from GlowMix
- Roboflow augmentation duplicates estimated at 30–40% → ~180–200 unique images post-dedup
- 180–200 unique images is insufficient for reliable deep learning classification

**Possible resolutions**:
1. Augment to target count (recommend ≥500 unique images for training viability)
2. Merge with Blackheads into a unified `Comedones` class (clinically suboptimal but data-practical)
3. Exclude from training in Phase 1 and add in Phase 2 once supplementary data is sourced

**PROPOSED**: Flag as REVIEW. Human decision required after deduplication count is verified.

---

### 8.C. Redness — ⚠️ SINGLE-SOURCE EVIDENCE

> **Status**: Plausible standalone class — verification needed

**Evidence**:
- DS-001 `Redness`: 600 raw images; ~240 same-class near-duplicate pairs → ~360 unique estimated
- No equivalent class in DS-002 → 360 unique images total across both datasets
- Audit confirmed presence of non-facial and background images contaminating this class
- 360 unique images (if verified) is above minimum threshold but borderline

**PROPOSED**: Retain as standalone DermaNova `Redness` class pending post-dedup count verification and background image removal.

---

### 8.D. Acne Open-Comedo Conflict Images (DS-002) — ⚠️ SEMANTIC MISLABELING

> **Status**: POTENTIAL mislabeling — 25 images require reclassification review

**Evidence**:
- 25 images in DS-002 `acne` folder have `acne-open-comedo-*` filename patterns
- These same images appear in the `blackheades` folder (SAME_IMAGE_DIFFERENT_LABEL)
- Open comedones are clinically classified as blackheads, NOT inflammatory acne
- The filename pattern strongly suggests these are open comedo images assigned to the wrong folder

**PROPOSED**: Reclassify these 25 images from `Acne` to `Blackheads` after manual visual confirmation. Do not auto-reclassify without review.

---

## 9. Cross-Class Conflicts

**CONFIRMED (from audit reports)**:

| Conflict Group | Dataset | Labels Involved | Count | Type | Risk Level |
|---|---|---|---|---|---|
| Acne ↔ Blackheads | DS-002 | `acne` vs `blackheades` | 25 groups / 50 images | SAME_IMAGE_DIFFERENT_LABEL | HIGH |
| Dark Spots ↔ Pigmentation | DS-001 | `dark spots` vs `pigmentation` | 26 pairs / 52 images | POTENTIAL_NEAR_DUPLICATE | HIGH |
| Pores ↔ Blackheads | DS-002 | `pores` vs `blackheades` | 2 groups / 4 images | SAME_IMAGE_DIFFERENT_LABEL | MEDIUM |
| Black Heads ↔ White Heads | DS-001 | `non inflammatory acne black heads` vs `non inflammatory acne white heads` | 2 pairs / 4 images | POTENTIAL_NEAR_DUPLICATE | LOW |
| Acne ↔ Dark Spots | DS-002 | `acne` vs `dark spots` | 1 group / 2 images | SAME_IMAGE_DIFFERENT_LABEL | LOW |

**Total conflict groups**: 56
**Total images in conflicts**: ~112 rows in `cross_class_label_conflicts.csv`

> ⚠️ **Critical distinction**: DS-002 conflicts are SAME_IMAGE_DIFFERENT_LABEL (confirmed same file in two folders). DS-001 conflicts are POTENTIAL_NEAR_DUPLICATE (Hamming distance ≤ 4, not SHA-256 confirmed identical). These are fundamentally different problem types requiring different remediation approaches.

---

## 10. Potential Data Leakage Concerns

### 10.1 Roboflow Augmentation Leakage (DS-001) — CONFIRMED RISK

DS-001 was sourced through Roboflow and contains pre-augmented variants identified by `.rf.<hash>.jpg` filename suffixes. If the original source image and its Roboflow augmented variants are split across training, validation, and test sets, this constitutes **data leakage** — the model will have seen transformations of the same face in all three splits.

**Remediation (PROPOSED)**: Group all `.rf.<hash>.jpg` variants under their base source filename before split assignment. Use `base_filename` as the grouping key in stratified group k-fold splitting.

### 10.2 Cross-Dataset Duplicate Risk — POTENTIAL

It is POSSIBLE (but not verified) that some images appear in both DS-001 and DS-002, given that both datasets aggregated from Roboflow open-source repositories. No cross-dataset pHash analysis has been performed.

**Remediation (PROPOSED)**: Run cross-dataset pHash analysis in Phase 3 (dataset cleaning) before finalizing the combined training set. This is NOT done in the current harmonization phase.

### 10.3 Cross-Class Training Contamination — CONFIRMED RISK (56 groups)

All 56 confirmed cross-class conflict groups represent images that appear under multiple class labels. Including these images in training with conflicting single labels will introduce gradient corruption. Options: (A) exclude from training, (B) assign multi-label vectors, (C) assign canonical single label after manual review.

---

## 11. Labels Requiring Manual Review

The following **5 label decisions** require human review before Phase 3 (Dataset Cleaning) begins:

| Priority | Label | Dataset | Core Issue | Blocking Decision |
|---|---|---|---|---|
| 🔴 HIGH | `dark spots` | DS-001 | 26 cross-class pairs with `pigmentation` — same images, different labels | Merge or keep separate? |
| 🔴 HIGH | `pigmentation` | DS-001 | 26 cross-class pairs with `dark spots` — same images, different labels | Merge or keep separate? |
| 🟡 MEDIUM | `Redness` | DS-001 | Single-source; background images; post-dedup count unknown | Verify count ≥ 350 unique |
| 🟡 MEDIUM | `non inflammatory acne white heads` | DS-001 | 300 raw images → ~180–200 post-dedup; too few for reliable training | Augment or merge with Blackheads? |
| 🟡 MEDIUM | `acne` (25 open-comedo images) | DS-002 | acne-open-comedo-* filenames may be blackheads mislabeled as acne | Reclassify to Blackheads? |

---

## 12. Recommended Cleaning Actions

> ⚠️ These are RECOMMENDATIONS for Phase 3 — NOT executed in this phase.

1. **Deduplicate Roboflow augmentations** in DS-001: Group by base filename, keep canonical copy per group. Expected reduction: ~15–20% of DS-001 images.

2. **Deduplicate same-class pHash duplicates** in DS-002: Remove redundant copies from 1,651 repeated pHash groups. Expected reduction: ~2,416 images (24.7% of DS-002).

3. **Resolve 26 dark spots/pigmentation conflict pairs** (DS-001): Manual visual inspection → assign canonical label.

4. **Reclassify 25 open-comedo images** (DS-002 acne folder) → Blackheads, after manual confirmation.

5. **Remove non-facial and background images** from DS-001 `Redness` class.

6. **Remove quality outliers**: 41 blurry images, 23 very dark images, 20 very bright images, 23 low-contrast images (all DS-002).

7. **Apply bicubic super-resolution** to 1,282 sub-224px images (DS-002 acne: 898, blackheades: 384).

8. **Augment Whiteheads class** if post-dedup count < 250 unique images.

---

## 13. Dataset Counts Before Harmonization

| Dataset | Class | Raw Images |
|---|---|---|
| DS-001 | `inflammatory acne` | 603 |
| DS-001 | `dark spots` | 619 |
| DS-001 | `wrinkles` | 600 |
| DS-001 | `Redness` | 600 |
| DS-001 | `pores` | 600 |
| DS-001 | `pigmentation` | 599 |
| DS-001 | `non inflammatory acne black heads` | 312 |
| DS-001 | `non inflammatory acne white heads` | 300 |
| **DS-001 TOTAL** | **8 classes** | **4,233** |
| DS-002 | `dark spots` | 2,126 |
| DS-002 | `acne` | 2,060 |
| DS-002 | `wrinkles` | 1,982 |
| DS-002 | `blackheades` | 1,970 |
| DS-002 | `pores` | 1,632 |
| **DS-002 TOTAL** | **5 classes** | **9,770** |
| **GRAND TOTAL** | **13 original classes** | **14,003** |

---

## 14. Estimated Counts by Proposed DermaNova Class

> ⚠️ These are **RAW PRE-DEDUPLICATION** counts. Actual training counts will be lower after cleaning.

| DermaNova Class | Source Labels | Raw Count | Notes |
|---|---|---|---|
| **Acne** | DS-001 `inflammatory acne` + DS-002 `acne` | **2,663** | Minus ~25 open-comedo images if reclassified → ~2,638 |
| **Blackheads** | DS-001 `non inflammatory acne black heads` + DS-002 `blackheades` | **2,282** | Plus ~25 reclassified acne images → ~2,307 |
| **Whiteheads** | DS-001 `non inflammatory acne white heads` only | **300** | ⚠️ LOW COUNT — single source; augmentation required |
| **Dark Spots** | DS-001 `dark spots` + DS-002 `dark spots` | **2,745** | 26-pair overlap with Pigmentation (DS-001 only) |
| **Pigmentation** | DS-001 `pigmentation` only | **599** | ⚠️ Single source; 26-pair overlap with Dark Spots |
| **Pores** | DS-001 `pores` + DS-002 `pores` | **2,232** | Strong cross-dataset consistency |
| **Wrinkles** | DS-001 `wrinkles` + DS-002 `wrinkles` | **2,582** | Strong cross-dataset consistency |
| **Redness** | DS-001 `Redness` only | **600** | ⚠️ Single source; background images present; post-dedup TBD |
| **TOTAL (RAW)** | | **14,003** | ✅ Matches grand total |

**Post-dedup estimated total**: ~10,500–11,500 images (rough estimate based on known redundancy rates)

---

## 15. Limitations

1. **No official label definitions**: Neither dataset provides documented label definitions. All interpretations are derived from folder names and audit findings only. This is the primary source of uncertainty in this harmonization.

2. **pHash values not recomputed**: Master metadata pHash columns are blank to avoid redundant recomputation of completed analysis. Per-image pHash values would require a full re-scan in the Kaggle environment.

3. **Cross-dataset duplicate check not performed**: It is possible that some images appear in both DS-001 and DS-002 (both sourced from Roboflow). This has not been verified and represents a potential data leakage risk.

4. **DS-001 actual mount path uncertain**: The exact Kaggle mount path for DS-001 must be verified at runtime. The `run_harmonization.py` script includes a discovery mechanism to locate it.

5. **GlowMix sub-datasets not assessed**: The GlowMix archive likely contains additional sub-datasets (PAD-UFES-20, fitzpatrick17k-main, scin-main, 4788-images-Human-Facial-Skin-Defects-Data-main) beyond Skin V2. These have not been assessed in this harmonization phase. They are documented as out-of-scope for Phase 3.

6. **Multi-label vs single-label architecture decision pending**: The correct handling of cross-class conflict images (e.g., acne + blackheads) depends on the model architecture decision. This must be confirmed by the research team before cleaning proceeds.

---

## 16. Next Recommended Step

> ⚠️ **STOP: Human Review Required**

**Immediate actions before Phase 3 (Dataset Cleaning) can begin**:

1. **DECISION REQUIRED — Dark Spots vs Pigmentation**: Review the 26 conflict pairs manually. Decide: (A) keep as two separate DermaNova classes, or (B) merge into `Hyperpigmentation`. This is the single most important label decision in the entire harmonization.

2. **DECISION REQUIRED — Model architecture**: Single-label or multi-label classifier? This determines how conflict images are handled.

3. **DECISION REQUIRED — Whiteheads**: After running `run_harmonization.py` in Kaggle to get post-dedup unique count, decide whether to proceed with Whiteheads as standalone class or merge with Blackheads.

4. **DECISION REQUIRED — Redness viability**: Verify post-dedup unique count after background image removal.

5. **Run `run_harmonization.py` in Kaggle**: This will generate the complete `master_metadata.csv` (14,003 rows) with actual file paths, image dimensions, and quality flags.

6. **After all decisions are approved**: Proceed to Phase 3 — Dataset Cleaning and Deduplication (`ml_pipeline/data_ingestion/clean_dataset.py`).

---

*DermaNova Label Harmonization Report | HARM-DS-001-002-2026 | August 2026*
*Prepared by: DermaNova AI Research Team*
*Status: PROPOSED — Awaiting Human Approval*
