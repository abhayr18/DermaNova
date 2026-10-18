# DermaNova Label Definitions

> **Document Purpose**: Formal documentation of source label semantics for the DermaNova Label Harmonization System.
> All definitions are derived **only** from available dataset documentation (folder names, Kaggle metadata, audit reports).
> Where no official definition exists, this is **explicitly stated**.
> **No medical definitions have been fabricated.**
>
> **Source Audit Reports**: `AUDIT-DS-001`, `AUDIT-DS-002`, `DERMANOVA_DATASET_COLLECTION_AND_AUDIT_REPORT.md`

---

## Label: `inflammatory acne`

**Dataset**: DS-001 (Facial Skin — Acne, Pigmentation, Pores, Wrinkles)

**Original label**: `inflammatory acne`

**Image count**: 603

**Definition from source**: Definition not available in the accessible dataset documentation. Label is derived from folder name only. Dataset sourced from Roboflow via Kaggle. No README or annotation file with label definitions was accessible.

**Source file**: Folder name; Kaggle dataset page (`shijojohn/facial-skin-acne-pigmentation-pores-wrinkles`)

**Interpretation**: Based on the folder name, this class represents inflammatory acne — the papular and pustular subtype of acne vulgaris. This is a well-established clinical category characterized by red, inflamed papules and pustules resulting from bacterial colonization and immune response in hair follicles. The label is highly specific and unambiguous from a dermatological standpoint. Proposed mapping: **DermaNova `Acne`** class.

**Potential overlap**: None detected in audit. No cross-class near-duplicate pairs involving this label.

**Confidence**: HIGH

**Manual review required**: FALSE

---

## Label: `dark spots`

**Dataset**: DS-001 (Facial Skin — Acne, Pigmentation, Pores, Wrinkles)

**Original label**: `dark spots`

**Image count**: 619

**Definition from source**: Definition not available in the accessible dataset documentation. Label is derived from folder name only. No README or annotation file with label definitions was accessible.

**Source file**: Folder name; Kaggle dataset page

**Interpretation**: Based on the folder name, this class represents localized dark spots on facial skin. Clinically, this could represent post-inflammatory hyperpigmentation (PIH), solar lentigines (sun spots), or other localized melanin deposits. The precise clinical definition as used by the dataset annotator is **not documented**. The critical unresolved question is how this class was distinguished from the `pigmentation` class during annotation. Without source documentation, this distinction cannot be confirmed.

**Potential overlap**: HIGH — 26 cross-class near-duplicate pairs with `pigmentation` class (Hamming distance ≤ 4). These pairs represent images that are visually nearly identical but assigned to different class folders. This is either systematic annotation inconsistency or genuine perceptual similarity between the two conditions. HIGH-PRIORITY manual review required.

**Confidence**: MEDIUM

**Manual review required**: TRUE

---

## Label: `wrinkles`

**Dataset**: DS-001 (Facial Skin — Acne, Pigmentation, Pores, Wrinkles)

**Original label**: `wrinkles`

**Image count**: 600

**Definition from source**: Definition not available in the accessible dataset documentation. Label is derived from folder name only.

**Source file**: Folder name; Kaggle dataset page

**Interpretation**: Based on the folder name, this class represents facial wrinkles — skin creases and fine lines resulting from aging, repetitive facial muscle movement, UV exposure, and reduced collagen/elastin production. The label is unambiguous and corroborated by an identical label name in DS-002 (GlowMix). Proposed mapping: **DermaNova `Wrinkles`** class.

**Potential overlap**: None detected in audit.

**Confidence**: HIGH

**Manual review required**: FALSE

---

## Label: `Redness`

**Dataset**: DS-001 (Facial Skin — Acne, Pigmentation, Pores, Wrinkles)

**Original label**: `Redness`

**Image count**: 600

**Definition from source**: Definition not available in the accessible dataset documentation. Label is derived from folder name only. Note: capitalized label (`Redness` vs `redness`) — exact capitalization preserved.

**Source file**: Folder name; Kaggle dataset page

**Interpretation**: Based on the folder name, this class represents facial redness — a visual presentation that may encompass erythema, rosacea, reactive skin, post-inflammatory erythema, or general skin flushing. This is a **distinct visual presentation** from acne (which also shows redness but in localized inflamed lesion form). **No equivalent class exists in DS-002 GlowMix** — single-source evidence only. Audit findings indicate the class contains non-facial and background images requiring cleaning. The class has 240 same-class near-duplicate pairs (Roboflow augmentations), meaning the post-deduplication unique count is not yet verified.

**Potential overlap**: No cross-class near-duplicate pairs detected. Unique class with no inter-dataset corroboration.

**Confidence**: MEDIUM (single-source; post-dedup count not verified; background images present)

**Manual review required**: TRUE

---

## Label: `pores`

**Dataset**: DS-001 (Facial Skin — Acne, Pigmentation, Pores, Wrinkles)

**Original label**: `pores`

**Image count**: 600

**Definition from source**: Definition not available in the accessible dataset documentation. Label is derived from folder name only.

**Source file**: Folder name; Kaggle dataset page

**Interpretation**: Based on the folder name, this class represents enlarged skin pores — visibly dilated follicular openings on facial skin, typically concentrated on the nose, cheeks, and chin. The label is corroborated by an identical label name in DS-002 (GlowMix), providing cross-dataset consistency. Proposed mapping: **DermaNova `Pores`** class.

**Potential overlap**: None detected in audit.

**Confidence**: HIGH

**Manual review required**: FALSE

---

## Label: `pigmentation`

**Dataset**: DS-001 (Facial Skin — Acne, Pigmentation, Pores, Wrinkles)

**Original label**: `pigmentation`

**Image count**: 599

**Definition from source**: Definition not available in the accessible dataset documentation. Label is derived from folder name only.

**Source file**: Folder name; Kaggle dataset page

**Interpretation**: Based on the folder name, this class represents skin pigmentation irregularities. Clinically this could represent melasma, post-inflammatory hyperpigmentation (PIH), diffuse pigmentation patterns, or other melanin-related skin conditions. The precise definition as used by the annotator is **not documented**. The critical unresolved question is how this class was distinguished from `dark spots` during annotation. Without source documentation, this distinction cannot be confirmed and should not be assumed.

**Potential overlap**: HIGH — 26 cross-class near-duplicate pairs with `dark spots` class (Hamming distance ≤ 4). These pairs may represent the same images annotated inconsistently across the two class folders. This constitutes a HIGH-PRIORITY label integrity risk.

**Confidence**: MEDIUM

**Manual review required**: TRUE

---

## Label: `non inflammatory acne black heads`

**Dataset**: DS-001 (Facial Skin — Acne, Pigmentation, Pores, Wrinkles)

**Original label**: `non inflammatory acne black heads`

**Image count**: 312

**Definition from source**: Definition not available in separate documentation. However, the label name itself constitutes a clinical description. No README or annotation file was accessible.

**Source file**: Folder name (full clinical description); Kaggle dataset page

**Interpretation**: This label explicitly identifies non-inflammatory acne blackheads — open comedones (clogged hair follicles) with a widened follicular opening and a dark-colored plug formed by oxidized sebum. This is a well-defined clinical entity distinct from inflammatory acne (no erythema, no immune response). The label name is the most clinically descriptive in either dataset. Proposed mapping: **DermaNova `Blackheads`** class. Corroborated by DS-002 `blackheades` class.

**Potential overlap**: LOW — 2 near-duplicate pairs with `non inflammatory acne white heads` class detected. Possibly augmentation artifacts rather than true semantic mislabeling. Minimal risk.

**Confidence**: HIGH

**Manual review required**: FALSE (overall class). The 2 cross-class pairs with white heads require verification.

---

## Label: `non inflammatory acne white heads`

**Dataset**: DS-001 (Facial Skin — Acne, Pigmentation, Pores, Wrinkles)

**Original label**: `non inflammatory acne white heads`

**Image count**: 300

**Definition from source**: Definition not available in separate documentation. The label name constitutes a clinical description.

**Source file**: Folder name (full clinical description); Kaggle dataset page

**Interpretation**: This label explicitly identifies non-inflammatory acne whiteheads — closed comedones where the follicular opening is covered by a thin layer of skin, trapping sebum and dead skin cells beneath. Clinically distinct from blackheads (open comedones) and from inflammatory acne. The label name is self-defining from a clinical standpoint. **Critical concern**: Only 300 raw images exist. After Roboflow augmentation deduplication, the effective unique image count may fall to approximately 150–200 unique images — insufficient for reliable deep learning classification without additional augmentation. No equivalent class exists in DS-002.

**Potential overlap**: LOW — 2 near-duplicate pairs with `non inflammatory acne black heads` class. More significant concern is the low sample count.

**Confidence**: MEDIUM

**Manual review required**: TRUE (post-dedup count verification required; augmentation or class redefinition may be needed)

---

## Label: `acne`

**Dataset**: DS-002 (GlowMix Merged Facial Skincare Dataset — Skin V2)

**Original label**: `acne`

**Image count**: 2,060

**Definition from source**: Definition not available in the accessible dataset documentation. Label is derived from folder name only. MIT License metadata is available but contains no label definitions. GlowMix is a merged dataset compiled by Drishya Tomar from multiple open-source Roboflow datasets.

**Source file**: Folder name; MIT License metadata; Kaggle page (`drishyatomar/glowmix-merged-facial-skincare-dataset`)

**Interpretation**: Based on the folder name and audit findings, this class represents acne — likely a mix of inflammatory and non-inflammatory presentations given the presence of Roboflow filenames including `acne-open-comedo-*` patterns. The open-comedo filenames suggest that some images in this folder may represent open comedones (blackheads) rather than inflammatory acne, constituting a semantic mislabeling risk for those specific images. **43.59% of images in this class are below the 224px resolution threshold**, the highest low-resolution rate of any class in either dataset.

**Potential overlap**: 25 images with `acne-open-comedo-*` filenames have cross-class pHash collisions with the `blackheades` folder — SAME_IMAGE_DIFFERENT_LABEL conflict. 1 image (GettyImages-902372188) has pHash collision with `dark spots` folder.

**Confidence**: HIGH (overall class). Individual open-comedo images require reclassification review.

**Manual review required**: FALSE (overall class mapping to Acne). TRUE for the 25 + 1 conflict images.

---

## Label: `blackheades`

**Dataset**: DS-002 (GlowMix Merged Facial Skincare Dataset — Skin V2)

**Original label**: `blackheades`

**Image count**: 1,970

**Definition from source**: Definition not available in the accessible dataset documentation. Label is derived from folder name only. MIT License metadata contains no label definitions. **Important**: `blackheades` is a confirmed misspelling of `blackheads` in the source dataset, as confirmed in audit report AUDIT-DS-002.

**Source file**: Folder name (misspelling confirmed); MIT License metadata; audit AUDIT-DS-002

**Interpretation**: Despite the misspelling, this class represents blackheads (open comedones) — confirmed by the original label name intent and corroboration with DS-001 `non inflammatory acne black heads`. **The original spelling `blackheades` is preserved exactly in the `original_label` column** per data integrity rules. Proposed mapping: **DermaNova `Blackheads`** class. Quality concerns: 19.49% low-resolution images, 31 blurry images, 22 low-contrast images.

**Potential overlap**: 25 images share pHash with `acne` class (SAME_IMAGE_DIFFERENT_LABEL). 2 images share pHash with `pores` class (SAME_IMAGE_DIFFERENT_LABEL).

**Confidence**: HIGH

**Manual review required**: FALSE (overall class). TRUE for the 27 conflict images.

---

## Label: `dark spots`

**Dataset**: DS-002 (GlowMix Merged Facial Skincare Dataset — Skin V2)

**Original label**: `dark spots`

**Image count**: 2,126

**Definition from source**: Definition not available in the accessible dataset documentation. Label is derived from folder name only. MIT License metadata contains no label definitions.

**Source file**: Folder name; MIT License metadata; audit AUDIT-DS-002

**Interpretation**: Based on the folder name, this class represents dark spots on facial skin. This is the same label name as DS-001 `dark spots` and is presumed to represent a consistent class concept. This class has the best optical quality metrics of all GlowMix classes (highest average sharpness: Laplacian variance 215.22). No low-resolution deficit. Note: the dark spots vs pigmentation ambiguity that exists in DS-001 does not directly affect this class, as no `pigmentation` class exists in DS-002. However, cross-dataset consistency between DS-001 and DS-002 `dark spots` images should be verified during cleaning.

**Potential overlap**: Minimal — 1 image (GettyImages-902372188) has SAME_IMAGE_DIFFERENT_LABEL collision with `acne` class.

**Confidence**: MEDIUM (inter-dataset semantic consistency with DS-001 dark spots not formally verified)

**Manual review required**: FALSE

---

## Label: `pores`

**Dataset**: DS-002 (GlowMix Merged Facial Skincare Dataset — Skin V2)

**Original label**: `pores`

**Image count**: 1,632

**Definition from source**: Definition not available in the accessible dataset documentation. Label is derived from folder name only. MIT License metadata contains no label definitions.

**Source file**: Folder name; MIT License metadata; audit AUDIT-DS-002

**Interpretation**: Based on the folder name, this class represents enlarged facial skin pores. Corroborated by DS-001 `pores` class using identical label name. Highest average brightness of all GlowMix classes (156.25 — consistent with pore close-up photography lighting conditions). No low-resolution deficit.

**Potential overlap**: Minimal — 2 images share pHash with `blackheades` class (SAME_IMAGE_DIFFERENT_LABEL).

**Confidence**: HIGH

**Manual review required**: FALSE

---

## Label: `wrinkles`

**Dataset**: DS-002 (GlowMix Merged Facial Skincare Dataset — Skin V2)

**Original label**: `wrinkles`

**Image count**: 1,982

**Definition from source**: Definition not available in the accessible dataset documentation. Label is derived from folder name only. MIT License metadata contains no label definitions.

**Source file**: Folder name; MIT License metadata; audit AUDIT-DS-002

**Interpretation**: Based on the folder name, this class represents facial wrinkles. Corroborated by DS-001 `wrinkles` class using identical label name. Quality outliers: 12 very dark images and 5 very bright images noted in audit. No cross-class conflicts detected.

**Potential overlap**: None detected in cross-class audit.

**Confidence**: HIGH

**Manual review required**: FALSE

---

*End of Label Definitions — DermaNova Harmonization System | August 2026*
