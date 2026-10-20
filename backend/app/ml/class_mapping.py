"""
DermaNova ML Class Mapping & Clinical Condition Metadata
=========================================================
Verified mapping of multi-task model outputs to dermatological condition identities,
display names, clinical descriptions, severity grades, and skin types.

Class order is strictly verified against the trained checkpoint ('dermanova_best_weights.pth')
and Kaggle training notebook ('01_dermanova_kaggle_gpu_training.ipynb'):
Index 0: Acne
Index 1: Blackheads
Index 2: Whiteheads
Index 3: Dark_Spots
Index 4: Pigmentation
Index 5: Pores
Index 6: Wrinkles
Index 7: Redness
"""

from typing import Dict, List, Any
from enum import Enum


class SeverityLevelEnum(str, Enum):
    CLEAR = "Clear / Minimal"
    MILD = "Mild"
    MODERATE = "Moderate"
    SEVERE = "Severe"
    AMBIGUOUS_RANGE = "Mild-to-Moderate"


class SkinTypeEnum(str, Enum):
    NORMAL = "Normal"
    OILY = "Oily"
    DRY = "Dry"
    COMBINATION = "Combination"
    SENSITIVE = "Sensitive"


# Exact verified class order from checkpoint ['Acne', 'Blackheads', 'Whiteheads', 'Dark_Spots', 'Pigmentation', 'Pores', 'Wrinkles', 'Redness']
CHECKPOINT_CLASS_NAMES: List[str] = [
    "Acne",
    "Blackheads",
    "Whiteheads",
    "Dark_Spots",
    "Pigmentation",
    "Pores",
    "Wrinkles",
    "Redness"
]

# Normalized internal keys for API and code consistency
DERMANOVA_CONDITION_KEYS: List[str] = [
    "acne",
    "blackheads",
    "whiteheads",
    "dark_spots",
    "pigmentation",
    "pores",
    "wrinkles",
    "redness"
]

INDEX_TO_CONDITION_KEY: Dict[int, str] = {
    idx: key for idx, key in enumerate(DERMANOVA_CONDITION_KEYS)
}

CONDITION_KEY_TO_INDEX: Dict[str, int] = {
    key: idx for idx, key in enumerate(DERMANOVA_CONDITION_KEYS)
}

# 3-grade Ordinal Severity Index mapping
INDEX_TO_SEVERITY: Dict[int, SeverityLevelEnum] = {
    0: SeverityLevelEnum.MILD,
    1: SeverityLevelEnum.MODERATE,
    2: SeverityLevelEnum.SEVERE
}

# 5-class Biophysical Skin Type Index mapping
INDEX_TO_SKIN_TYPE: Dict[int, SkinTypeEnum] = {
    0: SkinTypeEnum.NORMAL,
    1: SkinTypeEnum.OILY,
    2: SkinTypeEnum.DRY,
    3: SkinTypeEnum.COMBINATION,
    4: SkinTypeEnum.SENSITIVE
}

# Educational & clinical condition metadata
CONDITION_METADATA: Dict[str, Dict[str, Any]] = {
    "acne": {
        "display_name": "Inflammatory Acne",
        "description": "Active papules and erythematous pustules exhibiting follicular bacterial colonization.",
        "weight": 1.4,
        "default_threshold": 0.38,
        "high_severity_threshold": 0.88
    },
    "blackheads": {
        "display_name": "Blackheads (Open Comedones)",
        "description": "Widened follicular openings containing oxidized sebum and keratinous debris.",
        "weight": 1.0,
        "default_threshold": 0.38,
        "high_severity_threshold": 0.85
    },
    "whiteheads": {
        "display_name": "Whiteheads (Closed Comedones)",
        "description": "Non-inflamed microscopic follicular impactions beneath intact stratum corneum.",
        "weight": 1.0,
        "default_threshold": 0.38,
        "high_severity_threshold": 0.85
    },
    "dark_spots": {
        "display_name": "Dark Spots (Localized PIH)",
        "description": "Focal macules resulting from post-inflammatory melanocyte hyperactivity.",
        "weight": 1.1,
        "default_threshold": 0.38,
        "high_severity_threshold": 0.85
    },
    "pigmentation": {
        "display_name": "Pigmentation (Diffuse Melasma)",
        "description": "Broad mottled hyperchromia triggered by ultraviolet exposure or hormonal shifts.",
        "weight": 1.2,
        "default_threshold": 0.38,
        "high_severity_threshold": 0.85
    },
    "pores": {
        "display_name": "Dilated Pores",
        "description": "Enlarged follicular orifices across T-zone associated with elevated sebum flux.",
        "weight": 0.8,
        "default_threshold": 0.38,
        "high_severity_threshold": 0.85
    },
    "wrinkles": {
        "display_name": "Fine Lines & Wrinkles",
        "description": "Superficial cutaneous creases and solar elastosis from dermal collagen depletion.",
        "weight": 1.1,
        "default_threshold": 0.38,
        "high_severity_threshold": 0.85
    },
    "redness": {
        "display_name": "Facial Redness & Erythema",
        "description": "Microvascular capillary dilation indicating epidermal barrier compromise or rosacea.",
        "weight": 1.3,
        "default_threshold": 0.38,
        "high_severity_threshold": 0.85
    }
}
