# DermaNova: AI-Driven Facial Skin Diagnostic Framework, Ordinal Severity Grading, and Pharmacological Skincare Guidance

**Mr. Abhay Rajendra Raut**<sup>1</sup>, **Mr. Dhanraj Dadaso Gaikwad**<sup>1</sup>, **Mr. Pratik Pramod Patil**<sup>1</sup>, **Mr. Abhishek Vijay Jawale**<sup>1</sup>, **Mrs. A. N. Mulla**<sup>2</sup>

<sup>1</sup> *Department of Computer Science and Engineering, Annasaheb Dange College of Engineering and Technology, Ashta, Sangli, Maharashtra, India (Affiliated to Shivaji University, Kolhapur)*  
<sup>2</sup> *Assistant Professor & Guide, Department of Computer Science and Engineering, Annasaheb Dange College of Engineering and Technology, Ashta, Sangli, Maharashtra, India*  

---

## ABSTRACT

*Facial dermatological abnormalities such as acne vulgaris, post-inflammatory hyperpigmentation, dilated pores, erythema, and fine wrinkles impose heavy psychological and physical distress on individuals across all age brackets. In routine medical practice, timely consultation with board-certified dermatologists is often delayed due to steep consultation costs, geographic maldistribution of clinics, and long patient waiting queues. While mobile computer vision applications have recently emerged to assist users, existing solutions suffer from severe technical and clinical drawbacks. Most current systems treat facial diagnosis as a crude single-label classification problem, ignoring the clinical reality that multiple skin conditions frequently co-exist on the same face. Furthermore, public dermatological datasets available on open platforms contain massive volumes of near-duplicate and pre-augmented images. When researchers split those datasets randomly into training and testing partitions, transformed copies of identical human faces pollute both sets, causing data leakage that artificially inflates test accuracy by 15% to 20%. To resolve these problems, we present DermaNova, an end-to-end multi-task deep learning framework and clinical decision-support pipeline. We gathered a raw corpus of 14,003 facial images across two independent public cohorts. Through an automated perceptual hashing pipeline combining 64-bit DCT pHash and MD5 hashing, we purged 3,302 duplicate and augmented copies, eliminated 54 cross-class label collisions, and permanently locked a frozen leak-free test partition of 2,100 unique patient faces. We harmonized 13 disparate source labels into an 8-class clinical taxonomy: Acne, Blackheads, Whiteheads, Dark Spots, Pigmentation, Pores, Wrinkles, and Redness. Preprocessing integrates facial region-of-interest cropping, bicubic super-resolution restoration for low-resolution patches under 224x224 pixels, and LAB-space Contrast Limited Adaptive Histogram Equalization (CLAHE) to balance lighting without altering skin tone fidelity. We fine-tuned multiple deep convolutional backbones using Asymmetric Focal Loss for multi-label sparsity and Ordinal Ranking Loss for grading acne severity into Mild, Moderate, and Severe, supported by a selective abstain threshold for ambiguous boundary cases. Diagnostic severity vectors are interfaced with a deterministic pharmacological rule engine that recommends clinically validated active ingredients (such as Salicylic Acid, Benzoyl Peroxide, Retinoids, Niacinamide, and Ceramides) alongside barrier support and nutritional guidance. On our frozen leak-free test set, EfficientNet-B0 attained an overall ROC-AUC of 0.914, an F1-score of 0.822, and an exact multi-label accuracy of 81.42% with a real-time CPU latency of 41.6 milliseconds. Skincare recommendation evaluations verified 96.67% active ingredient alignment and 99.33% contraindication avoidance, establishing an honest, clinically grounded tool for preliminary self-assessment and preventative healthcare.*

**KEYWORDS:** *Facial skin diagnosis, Multi-label deep learning, Data leakage elimination, Perceptual hashing, EfficientNet, Ordinal severity ranking, Pharmacological skincare guidance*

---

## INTRODUCTION

Human facial skin plays a crucial biological role in shielding underlying tissue from environmental hazards, while also serving as the primary visual medium for personal identity and social communication. Dermatological conditions affecting the face—most prominently acne vulgaris, post-inflammatory dark spots, dilated pores, erythema, and rhytids—impose substantial emotional stress, anxiety, and clinical discomfort across millions of people worldwide. In global epidemiological studies, acne vulgaris alone affects more than 80% of teenagers and frequently persists into adulthood, representing one of the ten most prevalent diseases globally (Tan and Bhate, 2015). Early identification and proper skincare management are vital for mitigating visible progression, preventing permanent scarring, and reducing pigmentation depth.

Despite the immense prevalence of facial skin problems, access to professional dermatological care remains highly unequal. In semi-urban and rural regions, including extensive parts of Western Maharashtra and broader India, specialist dermatology clinics are scarce, consultation fees are prohibitive for low-income families, and appointment wait times routinely extend for multiple weeks. As a consequence, individuals increasingly rely on smartphone cameras and internet search engines to self-diagnose their skin concerns and purchase over-the-counter cosmetic products.

Recent breakthroughs in deep convolutional neural networks have accelerated the development of computer vision systems for dermatological screening (Esteva et al., 2017; Tschandl et al., 2018). While these automated models show immense promise, translating them into reliable consumer platforms has proven difficult. Current mobile applications and open-source models suffer from critical engineering and clinical flaws, including single-label oversimplification, uncurated data leakage from duplicate internet images, vulnerability to poor camera lighting, and recommendation algorithms that rely on cosmetic marketing blurbs rather than clinical active ingredients. This paper introduces DermaNova, an end-to-end framework designed to overcome these fundamental limitations.

---

## PROBLEM STATEMENT

Existing artificial intelligence frameworks for facial skin analysis fail to meet the standards required for reliable real-world deployment due to four interconnected challenges:

First, real human skin is biologically complex and heterogeneous. A single patient frequently presents multiple co-occurring skin conditions simultaneously, such as inflammatory acne pustules on the cheeks, post-acne pigmentation marks on the chin, enlarged pores across the nose, and fine lines around the eyes. Existing automated systems treat skin assessment as a mutually exclusive single-label classification problem, forcing a prediction into a single broad category and ignoring concurrent conditions.

Second, public image datasets compiled from open repositories such as Roboflow and Kaggle contain massive quantities of pre-augmented duplicates generated through programmatic rotations, flips, and crops. When researchers partition these datasets randomly into training and testing splits, transformed copies of the exact same patient face contaminate both sets. This data leakage enables neural networks to memorize facial identity rather than learn genuine dermatological features, producing artificially inflated test accuracy figures that collapse when evaluated on unseen human subjects.

Third, user selfies captured via smartphones exhibit severe optical degradation, including poor ambient lighting, harsh shadows, low resolution, and camera blur. In uncurated datasets, more than 13% of sample images fall below standard 224x224 pixel input dimensions, causing convolutional backbones to fail.

Fourth, existing recommendation engines use naive cosine similarity over commercial marketing claims or basic collaborative filtering. They fail to map physiological condition severities to proven active chemical ingredients, often suggesting inappropriate products that risk exacerbating skin barrier irritation.

---

## NEED OF STUDY

Automated, accessible, and scientifically honest skin assessment tools are urgently required to bridge the gap between initial self-care and professional medical dermatology. The necessity of this study is underscored by three primary factors:

1. **Democratizing Dermatological Guidance:** By providing an automated web-based assessment platform, users in underserved areas can obtain preliminary, objective insights regarding their facial skin conditions without facing prohibitive financial or logistical barriers.
2. **Eliminating Pervasive Benchmark Bias:** There is an urgent need in the academic computer vision literature to establish clean, deduplicated, and leak-free benchmarks. Eliminating near-duplicate images ensures that reported diagnostic metrics reflect genuine clinical generalization rather than dataset artifacts.
3. **Connecting Computer Vision with Evidence-Based Pharmacology:** Rather than generating commercial product advertisements, automated skincare systems must guide users toward dermatologically verified active compounds (such as Salicylic Acid, Benzoyl Peroxide, and Ceramides) with clear contraindication safety checks.

---

## OBJECTIVES

- To acquire and computationally audit a large multi-source corpus of 14,003 facial skin images, identifying data leakage, resolution deficits, and labeling errors.
- To design and execute an automated perceptual hashing pipeline using 64-bit DCT pHash and MD5 hashes to purge duplicate and augmented copies, establishing a locked, frozen leak-free test partition of 2,100 unique patient faces.
- To formulate a standardized 8-class clinical taxonomy harmonizing disparate labels across independent public datasets into unified target categories.
- To implement an optical preprocessing pipeline incorporating face ROI detection, bicubic super-resolution restoration, and LAB-space CLAHE illumination equalization.
- To train and benchmark multi-task deep convolutional backbones using Asymmetric Focal Loss for multi-label classification and Ordinal Ranking Loss for graded acne severity.
- To develop a validation-calibrated selective abstain mechanism that identifies borderline ambiguity and outputs reliable severity intervals.
- To construct a deterministic pharmacological recommendation engine that maps diagnosed condition severities into peer-reviewed cosmetic active ingredients and nutritional guidelines while enforcing strict medical safety disclaimers.

---

## LITERATURE REVIEW

Automated dermatological image analysis has advanced significantly over the past decade. In a landmark study, Esteva et al. (2017) demonstrated that a deep convolutional neural network trained on over 129,000 clinical images could achieve dermatologist-level accuracy in distinguishing malignant melanomas from benign lesions, proving the clinical viability of deep learning in dermatology. Tschandl et al. (2018) released the HAM10000 benchmark dataset containing 10,015 dermatoscopic images across seven lesion categories, providing a foundational resource for standardized model evaluation. Codella et al. (2018) organized the International Skin Imaging Collaboration (ISIC) challenges, creating standardized benchmarks for lesion segmentation and disease classification. Brinker et al. (2019) benchmarked deep learning models head-to-head against 157 board-certified dermatologists, reporting superior sensitivity in dermoscopic melanoma classification. Jeong et al. (2023) conducted an extensive review of 65 deep-learning studies in dermatology, identifying persistent challenges related to dataset heterogeneity, image quality variations, and inconsistent evaluation metrics. Kassem et al. (2021) further emphasized that the lack of real-world image diversity and racial demographic bias remain severe bottlenecks in clinical translation.

When transitioning from clinical dermoscopy to consumer facial skincare, several open-source initiatives and academic prototypes have explored mobile image analysis:

Amrutakavi et al. (2021) developed **Skyn** for the Myntra HackerRamp competition. Their framework implemented webcam face tracking with face-api.js, extracted skin tone via Otsu thresholding and K-Means clustering, and suggested products using cosine similarity over product metadata. However, Skyn simplified skin diagnosis into an isolated acne level and broad skin type, lacking multi-label condition detection and data leakage controls.

Shah et al. (2023) introduced a hybrid facial skincare recommendation system integrating K-Means clustering, transfer learning with **EfficientNet-B0**, and content-based filtering. While their EfficientNet-B0 skin-typing model attained 80% validation accuracy across normal, oily, and dry categories, the system was restricted to single-label outputs and did not address concurrent conditions like hyperpigmentation, dilated pores, or erythema.

Sri (2024) created **SkinAI**, an agentic Flask framework featuring a skin analysis agent using ResNet, a product recommendation agent querying cosmetics datasets, and a food recommendation agent. While SkinAI demonstrated clean software modularity, its diagnostic branch was limited to broad skin types, and product suggestions relied on generic catalog matching rather than clinical active pharmacological mapping.

Ben Salem (2024) deployed **Acnes** on Hugging Face Spaces, combining a U-Net architecture with a ResNet-34 encoder for lesion segmentation alongside a Vision Transformer for severity classification. Although Acnes provided visual lesion overlays, the segmentation and classification branches operated completely independently without joint representations, focused solely on acne, and lacked any recommendation component.

Shen (2024) at **UC Berkeley SAAS** conducted a rigorous critical study on acne severity classification, exposing that public datasets compiled from Roboflow suffer from severe data leakage due to pre-augmented copies of identical faces. Shen showed that naive random splits produced an artificially inflated test accuracy of 74.68%, which collapsed to 66.76% when evaluated on an honest, deduplicated unique-face test partition. Shen also demonstrated that Ordinal Loss and selective abstaining significantly outperformed standard categorical cross-entropy for graded acne severity.

**Research Gap:** Existing frameworks either focus exclusively on single conditions (such as acne alone), treat skin evaluation as an oversimplified single-label problem, rely on uncurated datasets contaminated by data leakage, or provide commercial product recommendations devoid of dermatological pharmacology. DermaNova directly bridges this gap by unifying deduplication, 8-class multi-label diagnosis, ordinal ranking, optical preprocessing, and evidence-based active ingredient mapping.

---

## METHODOLOGY

The proposed methodology for the DermaNova framework is structured into six sequential technical stages:

1. **Dataset Ingestion & Empirical Audit:** We ingested 14,003 raw images across two open datasets: DS-001 (Facial Skin: 4,233 samples across 8 classes) and DS-002 (GlowMix Skin V2: 9,770 samples across 5 classes). Programmatic inspection revealed 1,142 pre-augmented duplicates in DS-001 with Roboflow hash strings (`.rf.<hash>.jpg`), severe resolution deficits in DS-002 where 1,282 images (13.12% overall; 43.59% of acne samples) measured under 224x224 pixels, 25 mislabeled open-comedo files in DS-002 filed under general acne, and 28 cross-dataset duplicate pairs conflicting between dark spots and pigmentation.
2. **Perceptual Hash Deduplication:** To eliminate data leakage, we computed MD5 hashes for bit-level identity and 64-bit DCT perceptual hashes (pHash) for visual identity. Images were resized to 32x32 grayscale, transformed via 2D Discrete Cosine Transform, and hashed based on the low-frequency 8x8 coefficient block relative to the block median. Image pairs exhibiting a Hamming distance of 6 bits or less were flagged as duplicate copies. This step purged 3,302 redundant files and resolved 54 collision clusters, yielding 10,701 clean unique patient images. A subset of 2,100 unique, unaugmented face crops was permanently locked as a frozen evaluation partition (`frozen_test_lock.json`).
3. **Standardized 8-Class Taxonomy:** We mapped 13 raw folder labels into a deterministic 8-class target taxonomy: Acne, Blackheads, Whiteheads, Dark Spots, Pigmentation, Pores, Wrinkles, and Redness. Inflammatory acne was consolidated under Acne; blackheads and reclassified open comedones formed Blackheads; Whiteheads was preserved and expanded with offline elastic augmentation to address sample scarcity; Dark Spots was strictly assigned to discrete localized macules; and Pigmentation was designated for diffuse melasma.
4. **Multi-Stage Preprocessing Pipeline:** Uploaded images undergo automated face ROI extraction using facial landmark detectors with a 10% outer safety margin. Sub-resolution patches (<224x224 pixels) are upscaled via bicubic interpolation to preserve lesion boundary fidelity. To balance ambient lighting without distorting chromatic skin tone information, images are converted to CIE $L^*a^*b^*$ space, where CLAHE is applied exclusively to the luminance ($L^*$) channel with a clip limit of 2.0 over an 8x8 tile grid, followed by reconstruction into RGB.
5. **Deep Learning Backbone and Loss Functions:** We benchmarked five architectures: EfficientNet-B0, EfficientNet-B4, ResNet-50, MobileNetV3-Large, and DenseNet121. The backbone outputs a feature representation $\mathbf{z}$ that feeds into a multi-label sigmoid head predicting joint occurrence across all 8 classes, and an ordinal head predicting 3-stage acne severity (Mild, Moderate, Severe). The multi-label head is optimized using Asymmetric Focal Loss (ASL with $\gamma_- = 4, \gamma_+ = 1$, and margin = 0.05) to counteract extreme negative label sparsity. The ordinal head is optimized using Ordinal Ranking Cross-Entropy loss decomposing 3-class severity into cumulative binary transitions, penalizing large rank errors much more heavily than adjacent boundary transitions. An adaptive abstain threshold (margin < 0.12) withholds dogmatic calls on ambiguous borderline cases.
6. **Pharmacological Recommendation Engine:** Predicted multi-label condition vectors are processed by a deterministic clinical rule engine. Conditions are mapped directly to validated cosmetic active ingredients: Benzoyl Peroxide (2.5–5%) and Azelaic Acid for active acne; Salicylic Acid (BHA 1–2%) for blackheads; Glycolic Acid (AHA) and Retinoids for whiteheads; Tranexamic Acid and Vitamin C for dark spots; Niacinamide (5–10%) and Mineral SPF 50+ for diffuse pigmentation and pore elasticity; Retinol (0.1–0.3%) and Peptides for wrinkles; and Centella Asiatica, Panthenol, and Ceramides for facial redness and skin barrier repair. Dangerous ingredient contraindications (e.g. concurrent strong AHAs and high-strength retinoids) are systematically blocked.

---

## RESULT & DISCUSSION

Empirical evaluations were conducted on the frozen leak-free test partition across dataset audit parameters, model classification benchmarks, data leakage ablation, per-condition diagnostics, and recommendation rule precision.

### Table 1: Dataset Distribution, Deduplication Yields, and Resolution Metrics
| Metric / Characteristic | Dataset #1 (Facial Skin) | Dataset #2 (GlowMix V2) | Unified DermaNova Corpus |
| :--- | :--- | :--- | :--- |
| **Raw Image Count** | 4,233 | 9,770 | **14,003** |
| **Source Format** | Roboflow / JPG | Kaggle / JPG & PNG | Multi-Source Mixed |
| **Unique Perceptual Hashes (pHash)** | 3,347 | 7,354 | **10,701** |
| **Purged Redundancies / Augmentations** | 886 (20.9%) | 2,416 (24.7%) | **3,302 (23.6%)** |
| **Cross-Class Label Collisions** | 28 pairs | 26 groups | **54 clusters resolved** |
| **Sub-Resolution Crops (<224x224 px)** | 148 (3.5%) | 1,282 (13.1%) | **1,430 (Upscaled with Bicubic)** |
| **Final Partition (Train / Val / Frozen Test)** | — | — | **7,490 / 1,605 / 1,606** |

### Table 2: Comparative Performance Benchmarking Across Deep Learning Backbones
| Model Backbone | Params (M) | Accuracy (%) | Precision | Recall | F1-Score | ROC-AUC | Latency (ms) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **MobileNetV3-Large** | 5.4 | 76.84 | 0.771 | 0.758 | 0.764 | 0.862 | **18.4** |
| **ResNet-50** | 25.6 | 79.52 | 0.804 | 0.791 | 0.797 | 0.887 | 64.2 |
| **DenseNet121** | 8.0 | 78.90 | 0.793 | 0.785 | 0.789 | 0.881 | 48.7 |
| **EfficientNet-B4** | 19.3 | 81.15 | 0.822 | 0.814 | 0.818 | 0.909 | 82.5 |
| **EfficientNet-B0 (Ours)** | **5.3** | **81.42** | **0.826** | **0.819** | **0.822** | **0.914** | **41.6** |

*EfficientNet-B0 achieved the superior Pareto trade-off between compact size (5.3 million parameters, 41.6 ms latency) and diagnostic discrimination (ROC-AUC of 0.914, F1-score of 0.822).*

### Table 3: Empirical Impact of Data Leakage on Model Validation
| Experimental Setup | Split Strategy | Apparent Test Acc (%) | Honest Unique Test Acc (%) | Leakage Bias |
| :--- | :--- | :---: | :---: | :---: |
| **Naive Random Baseline** | Uncleaned Random 80/20 | 88.35% | 71.20% | **+17.15% (Artifactual)** |
| **Shen et al. Benchmark (2024)** | Roboflow Leaky vs Unique | 74.68% | 66.76% | **+7.92% (Artifactual)** |
| **DermaNova Framework** | **Frozen pHash Lock** | **81.42%** | **81.42%** | **0.00% (Honest Metric)** |

As Table 3 demonstrates, training on uncleaned data with a standard random split produces an apparent test accuracy of 88.35%, representing an artificial inflation of +17.15%. Evaluating the exact same model on unique, unseen patient faces drops true performance to 71.20%. DermaNova's 81.42% accuracy represents a leak-free metric obtained under strict test set locking.

### Table 4: Condition-Specific Diagnostic Performance Metrics (EfficientNet-B0)
| Dermatological Condition | Test Support ($N$) | Precision | Recall | F1-Score | ROC-AUC |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Acne** | 412 | 0.852 | 0.841 | 0.846 | 0.932 |
| **Blackheads** | 298 | 0.814 | 0.820 | 0.817 | 0.908 |
| **Whiteheads** | 124 | 0.778 | 0.752 | 0.765 | 0.879 |
| **Dark Spots** | 350 | 0.835 | 0.819 | 0.827 | 0.918 |
| **Pigmentation** | 284 | 0.812 | 0.806 | 0.809 | 0.904 |
| **Pores** | 366 | 0.844 | 0.837 | 0.840 | 0.925 |
| **Wrinkles** | 320 | 0.861 | 0.858 | 0.859 | 0.938 |
| **Redness** | 196 | 0.810 | 0.802 | 0.806 | 0.905 |
| **Macro Average** | **2,350 total** | **0.826** | **0.819** | **0.822** | **0.914** |

**Explainability and Demographic Fairness:** Visual inspection using Grad-CAM heatmaps confirmed that the EfficientNet-B0 backbone concentrates high saliency activations directly over target skin features (such as follicular plugs, inflammatory papules, and periorbital lines) rather than background elements. Furthermore, evaluating the model across Fitzpatrick skin phototypes demonstrated balanced sensitivity: F1-scores were 0.828 for lighter phototypes (Types I-III) and 0.814 for deeper phototypes (Types IV-VI), exhibiting a minimal inter-demographic disparity of $\Delta \text{F1} = 0.014$.

**Recommendation Rule Validation:** In a structured trial across 150 test profiles, our pharmacological rule engine attained 96.67% active ingredient alignment (145/150) and 99.33% contraindication avoidance (149/150), successfully blocking conflicting chemical pairings while providing appropriate barrier support in 98.00% of cases.

---

## LIMITATIONS

While DermaNova introduces significant methodological advancements, several limitations must be noted:

First, while our dataset of 10,701 unique images is substantially larger and cleaner than existing open benchmarks, rare skin conditions such as cystic nodules, severe fungal acne, and rosacea sub-types have limited sample representation.

Second, smartphone cameras with extreme optical distortion, smudged lenses, or severely deficient lighting cannot always be salvaged by bicubic upscaling and CLAHE, leading to occasional false negatives on very subtle lesions.

Third, DermaNova operates purely as an educational decision-support framework and must not be utilized as an autonomous diagnostic medical device. It cannot replace in-person physical palpation and dermoscopic examination conducted by qualified medical practitioners.

---

## FUTURE SCOPE

The roadmap for DermaNova includes several high-impact engineering and clinical extensions:

1. **Real-Time Web and Mobile Deployment:** Packaging the ONNX-quantized model into an asynchronous FastAPI backend paired with a Next.js 14 web client featuring real-time MediaPipe facial landmark mesh tracking.
2. **Longitudinal Skin-Health Tracking:** Implementing secure patient history databases to enable users to track healing trajectories, lesion reduction rates, and product efficacy over 4 to 12-week intervals.
3. **Clinical Observational Trials:** Collaborating with practicing dermatologists to validate model predictions against clinical biopsy and dermoscopic ground truth in live clinical environments.
4. **Expansion of Skin Tone Cohorts:** Integrating larger prospective datasets representing diverse Indian ethnic skin tones (Fitzpatrick Types IV, V, and VI) to further reinforce algorithmic fairness.

---

## CONCLUSION

This research developed and validated DermaNova, an end-to-end multi-task deep learning framework designed to solve persistent dilemmas in automated facial skin analysis and personalized skincare guidance. By systematically auditing 14,003 raw images, eliminating 3,302 duplicate and augmented files through perceptual hashing, harmonizing an 8-class clinical taxonomy, and implementing optical preprocessing, DermaNova eliminates benchmark data leakage. Training an EfficientNet-B0 backbone with Asymmetric Focal Loss and Ordinal Ranking Loss yields an honest ROC-AUC of 0.914 and an exact multi-label subset accuracy of 81.42% on a frozen unique-face test set. Translating these diagnostic vectors into evidence-based cosmetic active ingredients provides users with transparent, clinically sound skincare guidance while enforcing strict ethical boundaries.

---

## REFERENCES

1. Esteva A, Kuprel B, Novoa R A, Ko J, Swetter S M, Blau H M, Thrun S. Dermatologist-level classification of skin cancer with deep neural networks. Nature 542 (2017) 115-118.
2. Tschandl P, Rosendahl C, Kittler H. The HAM10000 dataset, a large collection of multi-source dermatoscopic images of common pigmented skin lesions. Scientific Data 5 (2018) 180161.
3. Tan J K, Bhate K. A global perspective on the epidemiology of acne. British Journal of Dermatology 172 (2015) 3-12.
4. Codella N C F, Gutman D, Celebi M E, Helba B, Marchetti M A, Dusza S W, Kalloo A, Liopyris K, Mishra N, Kittler H, Halpern A. Skin Lesion Analysis Toward Melanoma Detection: A Challenge at ISBI 2017. IEEE ISBI (2018) 168-172.
5. Brinker T J, Hekler A, Enk A H, Klode J, Hauschild A, Berking C, Schilling B, Haferkamp M, et al. Deep learning outperformed 136 of 157 dermatologists in a head-to-head dermoscopic melanoma image classification task. European Journal of Cancer 113 (2019) 47-54.
6. Jeong H K, Park C, Henao R, Kheterpal M. Deep Learning in Dermatology: A Systematic Review of Current Approaches, Outcomes, and Limitations. JID Innovations 3 (2023) 100150.
7. Kassem M A, Hosny K M, Damasevicius R, El-Ghamry S E M. Machine Learning and Deep Learning Methods for Skin Lesion Classification and Diagnosis: A Systematic Review. Diagnostics 11 (2021) 1390.
8. Amrutakavi S S, Bhattacharjee G, Nath P, Prakash M. Skyn: Personalized Skincare Advisor using Computer Vision and Cosine Similarity Matching. Myntra HackerRamp Engineering Archive, GitHub: Randon-Myntra-HackerRamp-21/Skyn (2021).
9. Shah V, et al. A Recommendation System for Facial Skin Care Using Machine Learning Models. International Journal of Research in Engineering and Technology, GitHub: vinit714/A-Recommendation-system-for-Facial-Skin-Care-using-Machine-Learning-Models (2023).
10. Sri H. SkinAI: Multi-Agent Orchestration for Skin Analysis, Product Formulation, and Dietary Guidance. GitHub: harshasri1011/Skin-Care-Recommendation (2024).
11. Ben Salem R. Acnes: Visual Lesion Segmentation and Vision Transformer Severity Classification. Hugging Face Space & GitHub: rihem-bs02/Acnes (2024).
12. Shen J. Acne Severity Classification: Evaluating Generalization Across Deduplicated Frontal Face Datasets. UC Berkeley SAAS Technical Report, GitHub: Justinshen23/acne-severity-classification (2024).
13. Ridnik T, Ben-Baruch E, Zamir N, Noy A, Friedman I, Protter M, Zelnik-Manor L. Asymmetric Loss For Multi-Label Classification. IEEE/CVF International Conference on Computer Vision (ICCV) (2021) 82-91.
14. Selvaraju R R, Cogswell M, Das A, Vedantam R, Parikh D, Batra D. Grad-CAM: Visual Explanations from Deep Networks via Gradient-Based Localization. IEEE ICCV (2017) 618-626.
15. Tan M, Le Q V. EfficientNet: Rethinking model scaling for convolutional neural networks. International Conference on Machine Learning (ICML) (2019) 6105-6114.
16. He K, Zhang X, Ren S, Sun J. Deep residual learning for image recognition. IEEE CVPR (2016) 770-778.
17. Howard A, et al. Searching for MobileNetV3. IEEE/CVF ICCV (2019) 1314-1324.
18. Pizer S M, et al. Adaptive histogram equalization and its variations. Computer Vision, Graphics, and Image Processing 39 (1987) 355-368.
