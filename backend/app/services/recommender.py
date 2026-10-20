import uuid
from typing import Dict, List, Optional
from backend.app.models.schemas import (
    ActiveIngredient,
    SkincareProduct,
    RoutineStep,
    DailyRoutine,
    RecommendationResponse,
    SkinTypeEnum,
    SeverityLevelEnum
)

# Knowledge Base of Dermatological Active Ingredients
ACTIVE_INGREDIENTS_MAP = {
    "acne": ActiveIngredient(
        name="Benzoyl Peroxide & Azelaic Acid",
        target_condition="Inflammatory Acne (Papules & Pustules)",
        recommended_strength="Benzoyl Peroxide 2.5% - 5% / Azelaic Acid 10%",
        mechanism_of_action="Releases free radical oxygen species to suppress Cutibacterium acnes bacteria while exerting anti-inflammatory downregulation.",
        application_timing="AM (Azelaic Acid) / PM (Benzoyl Peroxide)",
        precaution="Benzoyl peroxide can bleach fabric and cause initial mild peeling. Start with 2.5% concentration as it is clinically proven as effective as 10% with significantly less irritation.",
        barrier_support_pairing="Pair with Panthenol and Ceramide NP moisturizer to prevent stratum corneum moisture depletion."
    ),
    "blackheads": ActiveIngredient(
        name="Salicylic Acid (Beta Hydroxy Acid - BHA)",
        target_condition="Blackheads (Open Comedones)",
        recommended_strength="1.0% - 2.0% Leave-on Liquid or Cleanser",
        mechanism_of_action="Lipophilic beta-hydroxy acid that penetrates through sebum into deep follicular canals to dissolve keratinaceous plugs and oxidized lipids.",
        application_timing="PM (2-3 times per week)",
        precaution="Do not use on compromised or actively sunburned skin. Ensure daily broad-spectrum sunscreen use.",
        barrier_support_pairing="Pair with Hyaluronic Acid and Squalane to restore lipid hydration."
    ),
    "whiteheads": ActiveIngredient(
        name="Glycolic Acid (AHA) & Micro-encapsulated Retinol",
        target_condition="Whiteheads (Closed Comedones)",
        recommended_strength="Glycolic Acid 5% - 7% / Retinol 0.1% - 0.2%",
        mechanism_of_action="Alpha-hydroxy acid dissolves desmosomes in the outer stratum corneum, allowing trapped sebum and cellular debris to desquamate freely.",
        application_timing="PM (Alternate nights)",
        precaution="Never layer AHA and Retinol in the exact same application window. Alternate nights to avoid chemical burn or contact dermatitis.",
        barrier_support_pairing="Pair with Colloidal Oatmeal and Centella Asiatica."
    ),
    "dark_spots": ActiveIngredient(
        name="Tranexamic Acid & Alpha Arbutin",
        target_condition="Dark Spots (Post-Inflammatory Hyperpigmentation)",
        recommended_strength="Tranexamic Acid 3% - 5% / Alpha Arbutin 2%",
        mechanism_of_action="Inhibits plasmin-induced melanogenesis and competitively inhibits tyrosinase enzymes to halt focal melanin clustering.",
        application_timing="Both AM and PM",
        precaution="Safe for both lighter and deeper skin tones (Fitzpatrick Types I-VI) with zero risk of paradoxical rebound hyperpigmentation.",
        barrier_support_pairing="Pair with Vitamin C (Ascorbyl Glucoside) and Niacinamide."
    ),
    "pigmentation": ActiveIngredient(
        name="Azelaic Acid & Broad-Spectrum Mineral SPF 50+",
        target_condition="Diffuse Pigmentation & Melasma",
        recommended_strength="Azelaic Acid 10% - 15% / Zinc Oxide SPF 50+",
        mechanism_of_action="Selectively targets hyperactive abnormal melanocytes without bleaching normal baseline skin pigment, blocking ultraviolet-triggered melanogenesis.",
        application_timing="AM (SPF 50+ mandatory) & PM (Azelaic Acid)",
        precaution="UV radiation immediately reactivates melasma. Reapplication of SPF every 2-3 hours during outdoor exposure is essential.",
        barrier_support_pairing="Pair with Licorice Root Extract and Ceramide Complex."
    ),
    "pores": ActiveIngredient(
        name="Niacinamide (Vitamin B3) & Zinc PCA",
        target_condition="Dilated Follicular Pores",
        recommended_strength="Niacinamide 5% - 10% / Zinc PCA 1%",
        mechanism_of_action="Inhibits sebaceous gland hypersecretion, improves follicular pore elasticity, and strengthens epidermal lipid synthesis.",
        application_timing="Both AM and PM",
        precaution="Concentrations above 10% can cause temporary flushing in sensitive skin. A 5% formula is optimal for maintenance.",
        barrier_support_pairing="Pair with Green Tea Extract (EGCG) for sebum oxidation control."
    ),
    "wrinkles": ActiveIngredient(
        name="Encapsulated Retinaldehyde & Multi-Peptide Complex",
        target_condition="Fine Lines, Wrinkles & Solar Rhytids",
        recommended_strength="Retinal 0.05% - 0.1% / Copper Tripeptide-1",
        mechanism_of_action="Converts directly to retinoic acid in one biological step, upregulating fibroblast collagen type I and III synthesis and hyaluronic acid production.",
        application_timing="PM (Begin 2 nights/week, gradually increase)",
        precaution="Causes teratogenic risk during pregnancy/nursing. Mandatory daily broad-spectrum SPF 50+ during daytime.",
        barrier_support_pairing="Pair with Multi-Ceramide Cream and Phytosterols."
    ),
    "redness": ActiveIngredient(
        name="Centella Asiatica (Madecassoside) & D-Panthenol (Vitamin B5)",
        target_condition="Facial Redness, Rosacea & Barrier Compromise",
        recommended_strength="Panthenol 5% / Madecassoside 0.5%",
        mechanism_of_action="Suppresses pro-inflammatory cytokines (IL-1, TNF-alpha), reduces superficial capillary vasodilation, and accelerates barrier lipid barrier re-assembly.",
        application_timing="Both AM and PM",
        precaution="Avoid physical scrubs, hot showers, and products with denatured alcohol, essential oils, or artificial fragrances.",
        barrier_support_pairing="Pair with Bifida Ferment Lysate and Allantoin."
    )
}

PRODUCT_CATALOG = [
    SkincareProduct(
        product_name="Gentle Balancing pH 5.5 Foaming Gel Cleanser",
        category="Cleanser",
        brand="Clinical Formulary",
        key_actives=["Zinc PCA", "Panthenol (2%)", "Green Tea Extract"],
        suitable_for_skin_types=["Normal", "Oily", "Combination", "Sensitive"],
        price_range="$",
        description="Sulfate-free pH 5.5 foaming gel that lifts grime without disrupting stratum corneum acid mantle."
    ),
    SkincareProduct(
        product_name="2% Salicylic Acid (BHA) Pore-Clearing Solution",
        category="Treatment",
        brand="Clinical Formulary",
        key_actives=["Salicylic Acid (2%)", "Tea Tree Terpenes", "Betaine"],
        suitable_for_skin_types=["Oily", "Combination"],
        price_range="$$",
        description="Unclogs congested follicular pores, reduces blackheads, and controls excess oil shine."
    ),
    SkincareProduct(
        product_name="2.5% Micronized Benzoyl Peroxide + Azelaic Acid Emulsion",
        category="Treatment",
        brand="Clinical Formulary",
        key_actives=["Benzoyl Peroxide (2.5%)", "Azelaic Acid (5%)"],
        suitable_for_skin_types=["Oily", "Combination", "Normal"],
        price_range="$$",
        description="Dual-action spot treatment targeting inflamed papules and reducing bacterial colonisation within 48 hours."
    ),
    SkincareProduct(
        product_name="10% Niacinamide + 1% Zinc PCA Sebum Balancing Serum",
        category="Serum",
        brand="Clinical Formulary",
        key_actives=["Niacinamide (10%)", "Zinc PCA (1%)", "Hyaluronic Acid"],
        suitable_for_skin_types=["Normal", "Oily", "Dry", "Combination"],
        price_range="$$",
        description="Refines texture, reduces the appearance of enlarged pores, and balances erratic sebum levels."
    ),
    SkincareProduct(
        product_name="5% Tranexamic Acid + 2% Alpha Arbutin Pigment Corrector",
        category="Serum",
        brand="Clinical Formulary",
        key_actives=["Tranexamic Acid (5%)", "Alpha Arbutin (2%)", "Licorice Extract"],
        suitable_for_skin_types=["Normal", "Dry", "Combination", "Sensitive"],
        price_range="$$$",
        description="Clinically targets stubborn dark spots, post-acne erythema, and diffuse melasma discoloration."
    ),
    SkincareProduct(
        product_name="0.05% Encapsulated Retinaldehyde Cell-Renewal Serum",
        category="Treatment",
        brand="Clinical Formulary",
        key_actives=["Retinaldehyde (0.05%)", "Copper Peptides", "Bisabolol"],
        suitable_for_skin_types=["Normal", "Dry", "Combination"],
        price_range="$$$",
        description="Potent youth-restoring serum smoothing fine lines and accelerating dermal matrix renewal."
    ),
    SkincareProduct(
        product_name="Triple Ceramide (NP, AP, EOP) + 1% Madecassoside Barrier Cream",
        category="Moisturizer",
        brand="Clinical Formulary",
        key_actives=["Madecassoside (1%)", "Ceramides (NP, AP, EOP)", "Colloidal Oatmeal"],
        suitable_for_skin_types=["Normal", "Dry", "Sensitive"],
        price_range="$$",
        description="Intensively soothes facial erythema, calms irritated skin, and seals compromised lipid moisture barrier."
    ),
    SkincareProduct(
        product_name="Broad-Spectrum Mineral Sunscreen SPF 50+ PA++++",
        category="Sunscreen",
        brand="Clinical Formulary",
        key_actives=["Non-nano Zinc Oxide (18%)", "Ectoin", "Vitamin E"],
        suitable_for_skin_types=["Normal", "Oily", "Dry", "Combination", "Sensitive"],
        price_range="$$",
        description="Ultra-lightweight physical sunscreen leaving zero white cast, protecting against UV-induced pigment and aging."
    )
]

DIETARY_RECOMMENDATIONS_MAP = {
    "acne": [
        "Lower Dietary Glycemic Load: High glycemic foods (sugary snacks, white flour) spike IGF-1 hormones, triggering sebocyte proliferation and pore obstruction.",
        "Incorporate Zinc-Rich Foods: Pumpkin seeds, lentils, and spinach help regulate inflammatory responses and accelerate acne healing.",
        "Moderate Whey Protein and Skim Dairy: Whey protein supplements can hyper-stimulate mTORC1 pathways, aggravating inflamed breakouts."
    ],
    "pigmentation": [
        "Increase Polyphenols & Lycopene: Tomatoes, pomegranates, and green tea provide internal photoprotective defense against free radical melanin trigger.",
        "Vitamin C Rich Nutrition: Citrus fruits, bell peppers, and amla support endogenous collagen synthesis and assist in pigment clearance."
    ],
    "redness": [
        "Anti-Inflammatory Omega-3 Fatty Acids: Chia seeds, flaxseeds, and walnuts strengthen systemic vascular stability and calm skin flushing.",
        "Limit Vasodilator Triggers: Spicy chili peppers, hot boiling beverages, and excessive alcohol intake directly aggravate facial erythema."
    ],
    "wrinkles": [
        "Antioxidant Hydration: Consume 2.5 - 3 liters of water daily alongside berries, dark leafy greens, and foods rich in vitamin E to defend against dermal collagen breakdown."
    ]
}


class SkincareRecommenderEngine:
    """
    Deterministic Pharmacological Skincare Recommendation Engine.
    Maps quantitative clinical condition scores into evidence-based cosmetic active ingredients,
    avoids chemical contraindications, and structures AM/PM routines.
    """

    def generate_recommendations(
        self,
        detected_conditions: Dict[str, float],
        skin_type: SkinTypeEnum = SkinTypeEnum.NORMAL,
        has_sensitive_skin: bool = False,
        allergies: Optional[List[str]] = None
    ) -> RecommendationResponse:
        rec_id = f"REC-{uuid.uuid4().hex[:8].upper()}"

        # 1. Identify primary conditions exceeding detection threshold (>= 0.40)
        active_conditions = [
            cond for cond, prob in detected_conditions.items()
            if prob >= 0.40 and cond in ACTIVE_INGREDIENTS_MAP
        ]

        if not active_conditions:
            # Default to baseline skin maintenance (Pores / Redness barrier support)
            active_conditions = ["pores"]

        # Sort conditions by severity score descending
        active_conditions.sort(key=lambda c: detected_conditions.get(c, 0.0), reverse=True)

        # 2. Extract primary active ingredients
        primary_actives: List[ActiveIngredient] = []
        for cond in active_conditions[:3]:  # Top 3 primary concerns
            primary_actives.append(ACTIVE_INGREDIENTS_MAP[cond])

        # 3. Detect and enforce chemical contraindications
        contraindications_avoided: List[str] = []
        has_acne = detected_conditions.get("acne", 0.0) >= 0.45
        has_wrinkles = detected_conditions.get("wrinkles", 0.0) >= 0.45
        has_redness = detected_conditions.get("redness", 0.0) >= 0.40

        if has_acne and has_wrinkles:
            contraindications_avoided.append(
                "Prevented concurrent application of strong Benzoyl Peroxide and high-dose Retinoids in the same PM session. Split into AM (Acne) and PM (Retinol alternate nights)."
            )
        if has_redness:
            contraindications_avoided.append(
                "Eliminated aggressive physical scrubs and high-concentration glycolic acid (AHA) to safeguard compromised erythema barrier."
            )
        if has_sensitive_skin:
            contraindications_avoided.append(
                "Substituted high-strength exfoliating acids with soothing Azelaic Acid (10%) and barrier Ceramides."
            )

        # 4. Filter Curated Products
        curated_products: List[SkincareProduct] = []
        # Always add gentle cleanser and sunscreen
        curated_products.append(PRODUCT_CATALOG[0])  # Cleanser
        
        # Add targeted treatments
        if detected_conditions.get("acne", 0.0) >= 0.40:
            curated_products.append(PRODUCT_CATALOG[2])  # Benzoyl/Azelaic Emulsion
        elif detected_conditions.get("blackheads", 0.0) >= 0.40 or detected_conditions.get("pores", 0.0) >= 0.45:
            curated_products.append(PRODUCT_CATALOG[1])  # 2% Salicylic BHA
            curated_products.append(PRODUCT_CATALOG[3])  # Niacinamide 10%

        if detected_conditions.get("dark_spots", 0.0) >= 0.40 or detected_conditions.get("pigmentation", 0.0) >= 0.40:
            curated_products.append(PRODUCT_CATALOG[4])  # Tranexamic Pigment Corrector

        if detected_conditions.get("wrinkles", 0.0) >= 0.40 and not has_sensitive_skin:
            curated_products.append(PRODUCT_CATALOG[5])  # Retinaldehyde 0.05%

        # Always add barrier moisturizer and SPF
        curated_products.append(PRODUCT_CATALOG[6])  # Cica Barrier Cream
        curated_products.append(PRODUCT_CATALOG[7])  # Mineral SPF 50+

        # Deduplicate products by name
        seen_names = set()
        unique_products = []
        for p in curated_products:
            if p.product_name not in seen_names:
                unique_products.append(p)
                seen_names.add(p.product_name)

        # 5. Build Morning (AM) and Evening (PM) Step-by-Step Routines
        am_steps: List[RoutineStep] = [
            RoutineStep(
                step_number=1,
                step_name="Cleanse",
                product_category="Cleanser",
                recommended_action="Wash gently with lukewarm water. Pat skin dry with a clean towel without harsh rubbing.",
                product_name="DermaNova Pure Balance Gentle Gel Cleanser",
                key_actives="Zinc PCA, Panthenol",
                frequency="Daily"
            ),
            RoutineStep(
                step_number=2,
                step_name="Treat & Balance",
                product_category="Serum",
                recommended_action="Apply 3-4 drops across face and neck. Gently press into skin.",
                product_name="DermaNova Clinical 10% Niacinamide + Zinc Serum" if detected_conditions.get("pores", 0) >= 0.4 else "DermaNova Fade-Bright Tranexamic Pigment Corrector",
                key_actives="Niacinamide (10%) or Tranexamic Acid (5%)",
                frequency="Daily"
            ),
            RoutineStep(
                step_number=3,
                step_name="Moisturize",
                product_category="Moisturizer",
                recommended_action="Apply a light layer to lock in hydration and reinforce epidermal lipid bilayer.",
                product_name="DermaNova Barrier Calm Cica-Repair Cream",
                key_actives="Madecassoside, 3 Essential Ceramides",
                frequency="Daily"
            ),
            RoutineStep(
                step_number=4,
                step_name="Protect (Crucial)",
                product_category="Sunscreen",
                recommended_action="Apply two finger-lengths generously across entire face and neck as final morning step.",
                product_name="DermaNova Ultra-Shield Invisible Mineral SPF 50+ PA++++",
                key_actives="Non-Nano Zinc Oxide 18%, Ectoin",
                frequency="Daily every morning (reapply every 3h outdoors)"
            )
        ]

        pm_steps: List[RoutineStep] = [
            RoutineStep(
                step_number=1,
                step_name="Deep Cleanse",
                product_category="Cleanser",
                recommended_action="Remove pollution, sweat, and sunscreen thoroughly.",
                product_name="DermaNova Pure Balance Gentle Gel Cleanser",
                key_actives="Zinc PCA, Green Tea Extract",
                frequency="Daily every night"
            ),
            RoutineStep(
                step_number=2,
                step_name="Active Treatment",
                product_category="Targeted Treatment",
                recommended_action="Apply a pea-sized amount directly over concern areas. Avoid eye contour.",
                product_name="DermaNova Rapid Acne Clearing Emulsion" if has_acne else ("DermaNova Clarifying 2% Salicylic BHA" if detected_conditions.get("blackheads", 0) >= 0.4 else "DermaNova Age-Renewal Retinal 0.05%"),
                key_actives="Benzoyl Peroxide / BHA / Retinaldehyde",
                frequency="Nightly or alternate nights based on skin tolerance"
            ),
            RoutineStep(
                step_number=3,
                step_name="Barrier Recovery",
                product_category="Night Moisturizer",
                recommended_action="Seal skin with a generous layer of ceramide cream to facilitate nocturnal barrier cellular repair.",
                product_name="DermaNova Barrier Calm Cica-Repair Cream",
                key_actives="Ceramides NP/AP/EOP, Colloidal Oatmeal",
                frequency="Daily every night"
            )
        ]

        # 6. Synthesize Dietary and Lifestyle Guidance
        dietary_guidance: List[str] = [
            "Maintain baseline water intake of 2.5 - 3.0 Liters daily to support dermal turgor and cellular waste clearance."
        ]
        for cond in active_conditions:
            if cond in DIETARY_RECOMMENDATIONS_MAP:
                dietary_guidance.extend(DIETARY_RECOMMENDATIONS_MAP[cond][:2])

        barrier_tips: List[str] = [
            "Always patch-test any new cosmetic active ingredient on your inner wrist or jawline for 24 hours prior to full facial application.",
            "Never pick, pop, or physically squeeze comedones or acne lesions to prevent dermal tear and permanent post-inflammatory hyperpigmentation.",
            "Wash pillowcases and clean smartphone screens weekly with mild disinfectant to avoid transferring external pathogenic bacteria to the face."
        ]

        return RecommendationResponse(
            recommendation_id=rec_id,
            primary_active_ingredients=primary_actives,
            contraindications_avoided=contraindications_avoided,
            curated_products=unique_products,
            daily_routine=DailyRoutine(
                morning_routine=am_steps,
                evening_routine=pm_steps,
                weekly_treatments=[
                    "Weekly gentle clay or enzyme mask for congested T-zones (optional)",
                    "Nightly barrier slugging with pure squalane oil if experiencing severe seasonal dryness"
                ],
                lifestyle_and_diet=dietary_guidance
            ),
            dietary_guidance=dietary_guidance,
            barrier_health_tips=barrier_tips
        )


# Global singleton recommender instance
recommender_service = SkincareRecommenderEngine()
