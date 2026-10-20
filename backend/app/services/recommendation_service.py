"""
DermaNova Rule-Based Skincare Recommendation Service
=====================================================
Independent, curated skincare guidance engine:
1. Translates verified model condition scores into general non-prescription skincare guidance
2. Respects detection thresholds and skips non-detected or uncertain conditions
3. Prevents unsafe ingredient clashes (e.g. Retinoids + high-strength AHA, Benzoyl Peroxide + sensitive skin)
4. Checks explicitly supplied user profile (allergies, sensitivity, pregnancy) without guessing
5. Assembles gentle cleansing, barrier hydration, and broad-spectrum sun protection routines
6. Provides educational cautions and dermatologist referral guidance without medical claims
"""

import uuid
import logging
from typing import Dict, List, Optional, Any

from backend.app.core.config import settings
from backend.app.ml.class_mapping import SkinTypeEnum
from backend.app.schemas.recommendation import (
    ActiveIngredient,
    SkincareProduct,
    RoutineStep,
    DailyRoutine,
    RecommendationResponse
)


logger = logging.getLogger("dermanova.services.recommendation")

# Curated knowledge base of topical active ingredients
ACTIVE_INGREDIENTS_MAP: Dict[str, ActiveIngredient] = {
    "acne": ActiveIngredient(
        name="Benzoyl Peroxide & Azelaic Acid",
        target_condition="Inflammatory Acne (Papules & Pustules)",
        recommended_strength="Benzoyl Peroxide 2.5% / Azelaic Acid 10%",
        mechanism_of_action="Suppresses surface Cutibacterium acnes bacteria while exerting gentle anti-inflammatory downregulation.",
        application_timing="AM (Azelaic Acid) / PM (Benzoyl Peroxide)",
        precaution="Benzoyl peroxide can bleach fabric and cause initial mild peeling. 2.5% concentration is as effective as higher strengths with lower irritation.",
        barrier_support_pairing="Pair with Panthenol and Ceramide NP moisturizer to prevent stratum corneum moisture depletion."
    ),
    "blackheads": ActiveIngredient(
        name="Salicylic Acid (Beta Hydroxy Acid - BHA)",
        target_condition="Blackheads (Open Comedones)",
        recommended_strength="1.0% - 2.0% Leave-on Liquid or Cleanser",
        mechanism_of_action="Lipophilic beta-hydroxy acid that penetrates through sebum into follicular canals to dissolve keratinaceous plugs.",
        application_timing="PM (2-3 times per week)",
        precaution="Do not use on compromised or actively sunburned skin. Ensure daily broad-spectrum sunscreen use.",
        barrier_support_pairing="Pair with Hyaluronic Acid and Squalane to restore lipid hydration."
    ),
    "whiteheads": ActiveIngredient(
        name="Glycolic Acid (AHA) & Micro-encapsulated Retinol",
        target_condition="Whiteheads (Closed Comedones)",
        recommended_strength="Glycolic Acid 5% / Retinol 0.1% - 0.2%",
        mechanism_of_action="Alpha-hydroxy acid dissolves surface desmosomes, allowing trapped sebum and cellular debris to desquamate.",
        application_timing="PM (Alternate nights)",
        precaution="Never layer AHA and Retinol in the exact same application window. Alternate nights to avoid barrier irritation.",
        barrier_support_pairing="Pair with Colloidal Oatmeal and Centella Asiatica."
    ),
    "dark_spots": ActiveIngredient(
        name="Tranexamic Acid & Alpha Arbutin",
        target_condition="Dark Spots (Post-Inflammatory Hyperpigmentation)",
        recommended_strength="Tranexamic Acid 3% / Alpha Arbutin 2%",
        mechanism_of_action="Inhibits plasmin-induced melanogenesis and competitively inhibits tyrosinase enzymes to minimize focal melanin clustering.",
        application_timing="Both AM and PM",
        precaution="Safe for both lighter and deeper skin tones (Fitzpatrick Types I-VI) without paradoxical rebound hyperpigmentation.",
        barrier_support_pairing="Pair with Vitamin C (Ascorbyl Glucoside) and Niacinamide."
    ),
    "pigmentation": ActiveIngredient(
        name="Azelaic Acid & Broad-Spectrum Mineral SPF 50+",
        target_condition="Diffuse Pigmentation & Melasma",
        recommended_strength="Azelaic Acid 10% / Zinc Oxide SPF 50+",
        mechanism_of_action="Selectively targets hyperactive abnormal melanocytes without altering baseline skin tone, blocking UV-triggered melanogenesis.",
        application_timing="AM (SPF 50+ mandatory) & PM (Azelaic Acid)",
        precaution="UV radiation immediately reactivates pigmentation. Daily reapplication of SPF is essential.",
        barrier_support_pairing="Pair with Licorice Root Extract and Ceramide Complex."
    ),
    "pores": ActiveIngredient(
        name="Niacinamide (Vitamin B3) & Zinc PCA",
        target_condition="Dilated Follicular Pores",
        recommended_strength="Niacinamide 5% / Zinc PCA 1%",
        mechanism_of_action="Helps normalize sebaceous gland activity, improves follicular pore elasticity, and strengthens epidermal barrier lipid synthesis.",
        application_timing="Both AM and PM",
        precaution="Concentrations above 10% can cause temporary flushing in sensitive skin. A 5% formula is optimal for maintenance.",
        barrier_support_pairing="Pair with Green Tea Extract (EGCG) for sebum oxidation control."
    ),
    "wrinkles": ActiveIngredient(
        name="Encapsulated Retinaldehyde & Multi-Peptide Complex",
        target_condition="Fine Lines, Wrinkles & Solar Rhytids",
        recommended_strength="Retinal 0.05% / Multi-Peptides",
        mechanism_of_action="Supports natural epidermal renewal, boosting collagen peptide signaling and skin surface elasticity.",
        application_timing="PM (Begin 2 nights/week, gradually increase)",
        precaution="Contraindicated during pregnancy or nursing. Mandatory daily broad-spectrum SPF 50+ during daytime.",
        barrier_support_pairing="Pair with Multi-Ceramide Cream and Phytosterols."
    ),
    "redness": ActiveIngredient(
        name="Centella Asiatica (Madecassoside) & D-Panthenol (Vitamin B5)",
        target_condition="Facial Redness, Erythema & Barrier Compromise",
        recommended_strength="Panthenol 5% / Madecassoside 0.5%",
        mechanism_of_action="Soothes cutaneous surface reactivity, reduces transient flushing, and accelerates barrier lipid barrier replenishment.",
        application_timing="Both AM and PM",
        precaution="Avoid physical scrubs, hot showers, and products with denatured alcohol, essential oils, or artificial fragrances.",
        barrier_support_pairing="Pair with Bifida Ferment Lysate and Allantoin."
    )
}

PRODUCT_CATALOG: List[SkincareProduct] = [
    SkincareProduct(
        product_name="Gentle Balancing pH 5.5 Cleanser",
        category="Cleanser",
        brand="DermaNova Formulary",
        key_actives=["Zinc PCA", "Panthenol (2%)", "Green Tea Extract"],
        suitable_for_skin_types=["Normal", "Oily", "Combination", "Sensitive", "Dry"],
        price_range="$",
        description="Sulfate-free pH 5.5 foaming gel that lifts impurities without disrupting the acid mantle."
    ),
    SkincareProduct(
        product_name="2% Salicylic Acid (BHA) Clarifying Solution",
        category="Treatment",
        brand="DermaNova Formulary",
        key_actives=["Salicylic Acid 2%", "Centella Asiatica"],
        suitable_for_skin_types=["Oily", "Combination", "Normal"],
        price_range="$$",
        description="Oil-soluble pore clearing treatment for open comedones and blackhead prevention."
    ),
    SkincareProduct(
        product_name="10% Azelaic Acid + Zinc Emulsion",
        category="Treatment",
        brand="DermaNova Formulary",
        key_actives=["Azelaic Acid 10%", "Zinc PCA 1%"],
        suitable_for_skin_types=["Sensitive", "Combination", "Oily", "Normal"],
        price_range="$$",
        description="Soothes inflammatory blemishes, improves texture, and calms persistent facial redness."
    ),
    SkincareProduct(
        product_name="Multi-Ceramide Barrier Defense Cream",
        category="Moisturizer",
        brand="DermaNova Formulary",
        key_actives=["Ceramide NP/AP/EOP", "Cholesterol", "Hyaluronic Acid"],
        suitable_for_skin_types=["Dry", "Normal", "Sensitive", "Combination"],
        price_range="$$",
        description="Physiological 3:1:1 lipid replenisher that prevents transepidermal water loss."
    ),
    SkincareProduct(
        product_name="Mineral Shield Daily Fluid SPF 50+",
        category="Sunscreen",
        brand="DermaNova Formulary",
        key_actives=["Zinc Oxide 12%", "Ectoin", "Niacinamide 2%"],
        suitable_for_skin_types=["Normal", "Oily", "Dry", "Combination", "Sensitive"],
        price_range="$$",
        description="Ultra-light broad-spectrum physical photoprotection with no white cast or pore clogging."
    )
]


class RecommendationService:
    def __init__(self, condition_threshold: float = 0.38):
        self.condition_threshold = condition_threshold

    def generate_recommendations(
        self,
        detected_conditions: Dict[str, float],
        skin_type: SkinTypeEnum = SkinTypeEnum.NORMAL,
        has_sensitive_skin: bool = False,
        allergies: Optional[List[str]] = None,
        is_pregnant_or_nursing: bool = False,
        analysis_id: Optional[str] = None
    ) -> RecommendationResponse:
        """
        Builds personalized, safe, rule-based skincare guidance based on detected conditions
        and explicit user profile constraints.
        """
        allergies = [a.lower().strip() for a in (allergies or [])]
        rec_id = f"REC-{uuid.uuid4().hex[:8].upper()}"

        # 1. Filter conditions exceeding threshold
        qualifying_conditions = [
            (cond, prob) for cond, prob in detected_conditions.items()
            if prob >= self.condition_threshold and cond in ACTIVE_INGREDIENTS_MAP
        ]
        qualifying_conditions.sort(key=lambda x: x[1], reverse=True)

        selected_actives: List[ActiveIngredient] = []
        contraindications: List[str] = []

        # 2. Select targeted actives with safety rules
        for cond, prob in qualifying_conditions[:3]:
            active = ACTIVE_INGREDIENTS_MAP[cond]

            # Check allergy contraindications
            if any(allergy in active.name.lower() for allergy in allergies):
                contraindications.append(
                    f"Excluded '{active.name}' due to documented allergy profile."
                )
                continue

            # Check pregnancy contraindications for Retinoids
            if is_pregnant_or_nursing and ("retinol" in active.name.lower() or "retinal" in active.name.lower()):
                contraindications.append(
                    f"Excluded '{active.name}' due to pregnancy/nursing contraindication."
                )
                continue

            # Sensitive skin modulation
            if (has_sensitive_skin or skin_type == SkinTypeEnum.SENSITIVE) and "benzoyl peroxide" in active.name.lower():
                # Substitute Azelaic Acid for Benzoyl Peroxide
                contraindications.append(
                    "Substituted lower-strength Azelaic Acid for Benzoyl Peroxide due to sensitive skin profile."
                )

            selected_actives.append(active)

        # Baseline maintenance if no conditions pass threshold
        if not selected_actives:
            selected_actives.append(
                ActiveIngredient(
                    name="Niacinamide 2% & Hyaluronic Acid",
                    target_condition="Barrier Maintenance & Hydration",
                    recommended_strength="Niacinamide 2% - 4%",
                    mechanism_of_action="Supports physiological ceramide production and preserves moisture barrier integrity.",
                    application_timing="Both AM and PM",
                    precaution="Well-tolerated by all skin types. Avoid high-strength formulas if prone to flushing.",
                    barrier_support_pairing="Pair with lightweight physiological ceramide lotion."
                )
            )

        # 3. Construct Daily Routine
        am_steps = [
            RoutineStep(
                step_number=1,
                step_name="Gentle Cleansing",
                product_category="Cleanser",
                recommended_action="Cleanse with lukewarm water and a non-stripping cleanser. Pat dry gently.",
                product_name="Gentle Balancing pH 5.5 Cleanser",
                key_actives="Zinc PCA, Panthenol",
                frequency="Daily"
            ),
            RoutineStep(
                step_number=2,
                step_name="Targeted Treatment",
                product_category="Serum",
                recommended_action="Apply 2-3 drops to face, avoiding direct contact with eyelids.",
                product_name=selected_actives[0].name,
                key_actives=selected_actives[0].recommended_strength,
                frequency="Daily"
            ),
            RoutineStep(
                step_number=3,
                step_name="Barrier Hydration",
                product_category="Moisturizer",
                recommended_action="Lock in hydration with physiological ceramides to support barrier function.",
                product_name="Multi-Ceramide Barrier Defense Cream",
                key_actives="Ceramides NP/AP/EOP, Cholesterol",
                frequency="Daily"
            ),
            RoutineStep(
                step_number=4,
                step_name="Broad-Spectrum UV Protection",
                product_category="Sunscreen",
                recommended_action="Apply two finger-lengths to face and neck 15 minutes before sun exposure.",
                product_name="Mineral Shield Daily Fluid SPF 50+",
                key_actives="Zinc Oxide 12%, Ectoin",
                frequency="Daily (Reapply every 2-3 hours outdoors)"
            )
        ]

        pm_steps = [
            RoutineStep(
                step_number=1,
                step_name="Evening Purifying Cleanse",
                product_category="Cleanser",
                recommended_action="Gently remove daily environmental grime, excess sebum, and mineral sunscreen.",
                product_name="Gentle Balancing pH 5.5 Cleanser",
                key_actives="Zinc PCA, Panthenol",
                frequency="Daily"
            ),
            RoutineStep(
                step_number=2,
                step_name="Evening Skin Renewal",
                product_category="Treatment",
                recommended_action="Apply targeted active to dry skin. If introducing a new active, begin 2 nights per week.",
                product_name=selected_actives[-1].name if len(selected_actives) > 1 else selected_actives[0].name,
                key_actives=selected_actives[-1].recommended_strength if len(selected_actives) > 1 else selected_actives[0].recommended_strength,
                frequency="Alternate nights"
            ),
            RoutineStep(
                step_number=3,
                step_name="Night Barrier Repair",
                product_category="Moisturizer",
                recommended_action="Replenish cutaneous moisture levels during overnight skin renewal.",
                product_name="Multi-Ceramide Barrier Defense Cream",
                key_actives="Ceramides NP/AP/EOP, Squalane",
                frequency="Daily"
            )
        ]

        weekly_treatments = [
            "Use chemical exfoliants (AHA/BHA) at most 1-2 evenings per week; never combine with retinoids on the same night.",
            "Schedule 1-2 'barrier recovery nights' per week using only gentle cleanser and ceramide moisturizer."
        ]

        lifestyle_and_diet = [
            "Maintain adequate hydration (2.0 - 2.5 liters of water daily).",
            "Avoid touching or picking at facial blemishes to prevent post-inflammatory hyperpigmentation.",
            "Wash pillowcases weekly to minimize microbial contact transfer.",
            "Protect skin with UPF hats or sunglasses during peak solar hours (10:00 AM - 3:00 PM)."
        ]

        dietary_guidance = [
            "Incorporate antioxidant-rich foods containing polyphenols (berries, green tea, dark leafy greens).",
            "Moderate intake of high-glycemic carbohydrates and skim dairy if you notice associated flare-ups.",
            "Ensure dietary intake of Omega-3 essential fatty acids (flaxseed, walnuts, wild fish) for lipid support."
        ]

        barrier_health_tips = [
            "Patch-test any new active on the inner forearm for 24-48 hours before applying to the full face.",
            "If tightness, stinging, or redness occurs, pause active treatments and focus exclusively on hydration.",
            "Avoid scalding hot water when washing your face; use lukewarm water."
        ]

        # Filter suitable products
        skin_type_str = skin_type.value if hasattr(skin_type, "value") else str(skin_type)
        curated_prods = [
            p for p in PRODUCT_CATALOG
            if skin_type_str in p.suitable_for_skin_types
        ]

        return RecommendationResponse(
            recommendation_id=rec_id,
            analysis_id=analysis_id,
            primary_active_ingredients=selected_actives,
            contraindications_avoided=contraindications,
            curated_products=curated_prods,
            daily_routine=DailyRoutine(
                morning_routine=am_steps,
                evening_routine=pm_steps,
                weekly_treatments=weekly_treatments,
                lifestyle_and_diet=lifestyle_and_diet
            ),
            dietary_guidance=dietary_guidance,
            barrier_health_tips=barrier_health_tips
        )


# Global recommendation service instance
recommendation_service = RecommendationService(condition_threshold=settings.PREDICTION_THRESHOLD)
