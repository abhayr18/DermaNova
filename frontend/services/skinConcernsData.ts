export interface SkinConcernInfo {
  id: string;
  name: string;
  shortDesc: string;
  fullDesc: string;
  sampleConfidence: number;
  sampleSeverity: 'Mild' | 'Moderate' | 'Low Probability' | 'Clear';
  isDetectedInDemo: boolean;
  contributingFactors: string[];
  keyIngredients: {
    name: string;
    purpose: string;
    mechanism: string;
    timing: 'Morning' | 'Evening' | 'Both';
  }[];
  practicalTips: string[];
  whenToConsultDermatologist: string[];
  locationInDemo?: { x: number; y: number; width: number; height: number };
}

export const SKIN_CONCERNS_DATA: Record<string, SkinConcernInfo> = {
  acne: {
    id: 'acne',
    name: 'Acne (Papules & Pustules)',
    shortDesc: 'Superficial inflammation and microcomedones in follicular units.',
    fullDesc: 'Acne develops when hair follicles become plugged with sebum and desquamated corneocytes, creating an anaerobic microenvironment where Cutibacterium acnes can proliferate and provoke localized immune responses.',
    sampleConfidence: 74,
    sampleSeverity: 'Mild',
    isDetectedInDemo: true,
    locationInDemo: { x: 58, y: 38, width: 14, height: 14 },
    contributingFactors: [
      'Elevated androgen-mediated sebum production',
      'Abnormal follicular hyperkeratinization',
      'C. acnes proliferation within clogged pores',
      'Disrupted epidermal barrier from harsh stripping cleansers',
      'Friction from masks or phone screens (acne mechanica)'
    ],
    keyIngredients: [
      {
        name: 'Azelaic Acid (10–15%)',
        purpose: 'Anti-inflammatory & antimicrobial',
        mechanism: 'Reduces follicular keratinization and inhibits C. acnes without bacterial resistance.',
        timing: 'Morning'
      },
      {
        name: 'Salicylic Acid (BHA 1–2%)',
        purpose: 'Lipophilic pore exfoliation',
        mechanism: 'Penetrates oil-filled pores to dissolve cellular debris and calm swelling.',
        timing: 'Evening'
      },
      {
        name: 'Zinc PCA (1%)',
        purpose: 'Sebum regulation',
        mechanism: 'Suppresses 5-alpha reductase to decrease excess oiliness while supporting barrier healing.',
        timing: 'Both'
      }
    ],
    practicalTips: [
      'Cleanse twice daily with a non-foaming or low-pH gentle cleanser.',
      'Never pick, pop, or squeeze active blemishes to avoid post-inflammatory erythema.',
      'Always patch test new active spot treatments for 24 hours behind the ear.',
      'Use non-comedogenic and fragrance-free moisturizers to maintain lipid integrity.'
    ],
    whenToConsultDermatologist: [
      'Presence of deep, painful, or persistent cysts / nodules under the skin.',
      'Scarring (ice-pick, boxcar, or rolling depressions) following breakouts.',
      'Lack of improvement after 8 to 12 weeks of consistent non-prescription care.',
      'Significant emotional distress or social discomfort caused by flare-ups.'
    ]
  },
  blackheads: {
    id: 'blackheads',
    name: 'Blackheads (Open Comedones)',
    shortDesc: 'Pores filled with sebum and cellular debris darkened by oxidation.',
    fullDesc: 'Open comedones are non-inflammatory follicular plugs. The dark appearance is caused by melanin and lipid oxidation upon contact with atmospheric oxygen, not trapped dirt.',
    sampleConfidence: 62,
    sampleSeverity: 'Mild',
    isDetectedInDemo: true,
    locationInDemo: { x: 46, y: 44, width: 10, height: 10 },
    contributingFactors: [
      'Sluggish cellular turnover in follicular lining',
      'Oxidation of squalene and wax esters in sebum',
      'Use of comedogenic or heavy occlusive oils in the T-zone',
      'Hot and humid environmental conditions'
    ],
    keyIngredients: [
      {
        name: 'Salicylic Acid (BHA 2%)',
        purpose: 'Deep pore unclogging',
        mechanism: 'Oil-soluble beta-hydroxy acid that dissolves keratin plugs from the inside out.',
        timing: 'Evening'
      },
      {
        name: 'Niacinamide (2–5%)',
        purpose: 'Sebum balance & pore refinement',
        mechanism: 'Regulates sebaceous lipid production and improves pore wall elasticity.',
        timing: 'Both'
      }
    ],
    practicalTips: [
      'Avoid harsh nose pore strips which can cause micro-tears and dilated capillaries.',
      'Use chemical exfoliants 2-3 times weekly instead of abrasive physical scrubs.',
      'Double cleanse in the evening if wearing waterproof sunscreen or makeup.'
    ],
    whenToConsultDermatologist: [
      'Comedones resist multi-month topical retinoid or BHA protocols.',
      'Signs of severe follicular distension or scarring around nasal folds.',
      'Consideration for professional dermatological ultrasonic extractions.'
    ]
  },
  whiteheads: {
    id: 'whiteheads',
    name: 'Whiteheads (Closed Comedones)',
    shortDesc: 'Microscopic plugs trapped beneath a thin layer of skin.',
    fullDesc: 'Closed comedones occur when sebum and dead skin cells accumulate inside a follicle whose microscopic pore opening is completely covered by a thin layer of stratum corneum cells.',
    sampleConfidence: 45,
    sampleSeverity: 'Low Probability',
    isDetectedInDemo: false,
    locationInDemo: { x: 38, y: 35, width: 8, height: 8 },
    contributingFactors: [
      'Impaired desquamation retaining dead corneocytes over pore openings',
      'Overly rich or waxy cosmetic formulations trapping sebum',
      'Dehydrated skin overproducing oil to compensate for moisture loss'
    ],
    keyIngredients: [
      {
        name: 'Mandelic Acid or Lactic Acid (AHA 5–10%)',
        purpose: 'Gentle surface dead cell release',
        mechanism: 'Weakens bonds between dead surface cells without provoking barrier irritation.',
        timing: 'Evening'
      },
      {
        name: 'Gentle Retinoid (Granactive or Retinol 0.2%)',
        purpose: 'Cellular renewal acceleration',
        mechanism: 'Normalizes keratinocyte differentiation and prevents closed pore capping.',
        timing: 'Evening'
      }
    ],
    practicalTips: [
      'Do not attempt to squeeze closed comedones, as rupturing beneath the skin causes inflamed cysts.',
      'Maintain adequate hydration with lightweight humectants such as hyaluronic acid and glycerin.',
      'Introduce exfoliating acids gradually, starting 1-2 evenings per week.'
    ],
    whenToConsultDermatologist: [
      'Dense clusters of closed comedones that transform frequently into inflamed papules.',
      'Evaluation for prescription topical retinoids (such as adapalene or tretinoin).'
    ]
  },
  darkSpots: {
    id: 'darkSpots',
    name: 'Dark Spots (Post-Inflammatory Hyperpigmentation)',
    shortDesc: 'Localized melanin deposits following inflammation or minor trauma.',
    fullDesc: 'Post-inflammatory hyperpigmentation (PIH) occurs when melanocytes produce excess melanin in response to inflammatory mediators triggered by acne lesions, scratches, or aggressive extractions.',
    sampleConfidence: 68,
    sampleSeverity: 'Mild',
    isDetectedInDemo: true,
    locationInDemo: { x: 62, y: 52, width: 12, height: 12 },
    contributingFactors: [
      'Melanocyte activation following acne or barrier disruption',
      'Unprotected ultraviolet (UV) and blue light exposure stimulating melanin synthesis',
      'Manual trauma from squeezing or picking blemishes',
      'Higher baseline melanin levels (Fitzpatrick III–VI)'
    ],
    keyIngredients: [
      {
        name: 'Tranexamic Acid (2–3%)',
        purpose: 'Melanogenesis inhibition',
        mechanism: 'Interferes with plasminogen pathways that activate melanocytes following inflammation.',
        timing: 'Morning'
      },
      {
        name: 'Broad-Spectrum SPF 50+ Sunscreen',
        purpose: 'UV defense',
        mechanism: 'Prevents UV-A and UV-B radiation from darkening existing spots and sparking new pigment.',
        timing: 'Morning'
      },
      {
        name: 'Alpha Arbutin (1–2%)',
        purpose: 'Tyrosinase regulation',
        mechanism: 'Reversibly inhibits tyrosinase activity to reduce melanin production.',
        timing: 'Evening'
      }
    ],
    practicalTips: [
      'Daily sunscreen application is the single most effective intervention for fading spots.',
      'Reapply sunscreen every 2 hours if outdoors or sitting near windows.',
      'Patience is essential: post-inflammatory marks naturally take 8 to 24 weeks to remodel.'
    ],
    whenToConsultDermatologist: [
      'Spots that change color, develop asymmetric borders, or grow in diameter (ABCDE criteria).',
      'Pigmentation that fails to improve with compliant topical care over 6 months.',
      'In-office options like specialized superficial peels or non-ablative laser therapy.'
    ]
  },
  pigmentation: {
    id: 'pigmentation',
    name: 'Pigmentation & Uneven Tone',
    shortDesc: 'Diffuse variations in epidermal melanin distribution and sun exposure.',
    fullDesc: 'Generalized uneven skin tone reflects cumulative ultraviolet exposure, mild solar lentigines, and uneven epidermal turnover across different facial zones (forehead, cheeks, and perioral areas).',
    sampleConfidence: 55,
    sampleSeverity: 'Mild',
    isDetectedInDemo: true,
    locationInDemo: { x: 30, y: 40, width: 15, height: 15 },
    contributingFactors: [
      'Chronic cumulative photo-exposure without adequate broad-spectrum defense',
      'Hormonal influences and heat exposure',
      'Slowed stratum corneum desquamation leading to dullness',
      'Urban air particulate pollution depositing free radicals'
    ],
    keyIngredients: [
      {
        name: 'Vitamin C (Ascorbyl Glucoside or L-Ascorbic 10%)',
        purpose: 'Antioxidant brightening',
        mechanism: 'Neutralizes free radicals and inhibits tyrosinase enzyme cascade.',
        timing: 'Morning'
      },
      {
        name: 'Licorice Root Extract (Glabridin)',
        purpose: 'Calming pigment balance',
        mechanism: 'Disperses existing melanin and soothes cutaneous micro-stress.',
        timing: 'Both'
      }
    ],
    practicalTips: [
      'Pair morning antioxidant serums with broad-spectrum SPF for synergistic UV protection.',
      'Wear wide-brimmed hats during peak UV hours (10 AM to 4 PM).',
      'Keep skin hydrated to reflect ambient light uniformly, improving visible radiance.'
    ],
    whenToConsultDermatologist: [
      'Irregular, dark, or rapidly evolving pigmented patches.',
      'Evaluation for melasma management, which requires specialized non-irritating clinical protocols.'
    ]
  },
  visiblePores: {
    id: 'visiblePores',
    name: 'Visible & Dilated Pores',
    shortDesc: 'Enlarged follicular openings in the central facial zone.',
    fullDesc: 'Pore diameter is determined by genetic follicle size, sebaceous volume, and dermal elasticity around the follicle wall. As elasticity decreases or sebum flow increases, pore openings become more noticeable.',
    sampleConfidence: 71,
    sampleSeverity: 'Mild',
    isDetectedInDemo: true,
    locationInDemo: { x: 42, y: 48, width: 16, height: 12 },
    contributingFactors: [
      'Higher sebaceous output expanding pore orifices',
      'Loss of peri-follicular collagen and elastin support from chronological aging or sun damage',
      'Accumulation of oxidized keratinocytes around pore rims',
      'Genetic predisposition'
    ],
    keyIngredients: [
      {
        name: 'Niacinamide (3–5%)',
        purpose: 'Pore rim tightening & elasticity',
        mechanism: 'Strengthens dermal protein scaffolding and modulates sebum flow.',
        timing: 'Morning'
      },
      {
        name: 'Green Tea Extract (EGCG)',
        purpose: 'Sebum reduction & antioxidant',
        mechanism: 'Downregulates lipogenesis in sebocytes and protects extracellular matrix proteins.',
        timing: 'Evening'
      }
    ],
    practicalTips: [
      'Pores are a natural, necessary anatomical feature of human skin; they cannot be erased or closed.',
      'Avoid high-alcohol astringents that temporarily tighten pores by irritating and swelling surrounding tissue.',
      'Use lightweight gel or fluid moisturizers on the T-zone.'
    ],
    whenToConsultDermatologist: [
      'Severe structural loss around the nasolabial region.',
      'Interest in evidence-based procedural options such as microneedling or fractional lasers.'
    ]
  },
  wrinkles: {
    id: 'wrinkles',
    name: 'Fine Lines & Wrinkles',
    shortDesc: 'Superficial skin indentations related to hydration and dermal elasticity.',
    fullDesc: 'Fine lines commonly appear around areas of repeated expression (periorbital and perioral zones). Early lines often result from epidermal dehydration, while deeper lines reflect gradual collagen depletion.',
    sampleConfidence: 38,
    sampleSeverity: 'Low Probability',
    isDetectedInDemo: false,
    locationInDemo: { x: 68, y: 32, width: 12, height: 8 },
    contributingFactors: [
      'Transepidermal water loss (TEWL) temporarily accentuating micro-creases',
      'UV-induced breakdown of dermal collagen type I and III',
      'Repetitive facial biomechanical movements',
      'Natural decline in hyaluronic acid synthesis over time'
    ],
    keyIngredients: [
      {
        name: 'Multi-Molecular Hyaluronic Acid & Glycerin',
        purpose: 'Immediate stratum corneum plumping',
        mechanism: 'Attracts water molecules into the upper epidermis to smooth superficial dehydration lines.',
        timing: 'Both'
      },
      {
        name: 'Peptides (Palmitoyl Tripeptide-1 & 7)',
        purpose: 'Extracellular matrix signaling',
        mechanism: 'Supports healthy collagen renewal and dermal resilience.',
        timing: 'Evening'
      },
      {
        name: 'Ceramides NP, AP, EOP',
        purpose: 'Lipid barrier replenishment',
        mechanism: 'Locks in moisture to prevent dehydration-induced crease lines.',
        timing: 'Both'
      }
    ],
    practicalTips: [
      'Apply humectant serums immediately onto damp skin to lock in maximum hydration.',
      'Never skip daily SPF 50+, as photoaging accounts for up to 80% of premature collagen loss.',
      'Ensure adequate restorative sleep to allow nighttime cellular repair pathways to function.'
    ],
    whenToConsultDermatologist: [
      'Rapid onset of deep facial creases inconsistent with your age.',
      'Guidance on prescription retinoids, prescription barrier therapies, or neuromodulators.'
    ]
  },
  redness: {
    id: 'redness',
    name: 'Redness & Erythema',
    shortDesc: 'Cutaneous vascular dilation and micro-vessel reactivity.',
    fullDesc: 'Facial redness (erythema) results from increased blood flow in dilated superficial dermal capillaries. It is frequently accompanied by a feeling of warmth, tingling, or barrier vulnerability.',
    sampleConfidence: 82,
    sampleSeverity: 'Moderate',
    isDetectedInDemo: true,
    locationInDemo: { x: 34, y: 50, width: 18, height: 16 },
    contributingFactors: [
      'Compromised stratum corneum lipid barrier permitting irritant penetration',
      'Vasomotor flushing triggered by spicy foods, temperature shifts, or stress',
      'Overuse of exfoliating acids or irritating botanical fragrances',
      'Underlying rosacea or sensitive skin diathesis'
    ],
    keyIngredients: [
      {
        name: 'Centella Asiatica (Madecassoside & Asiaticoside)',
        purpose: 'Calming micro-circulation',
        mechanism: 'Suppresses inflammatory cytokines (IL-6, TNF-alpha) and accelerates barrier healing.',
        timing: 'Both'
      },
      {
        name: 'Colloidal Oat & Beta-Glucan',
        purpose: 'Pruritus and burning relief',
        mechanism: 'Provides soothing protective colloid matrix that restores skin comfort.',
        timing: 'Morning'
      },
      {
        name: 'Panthenol (Pro-Vitamin B5 5%)',
        purpose: 'Epidermal repair',
        mechanism: 'Stimulates fibroblast proliferation and repairs damaged lipid bilayers.',
        timing: 'Both'
      }
    ],
    practicalTips: [
      'Wash face with lukewarm water only—avoid hot water which triggers capillary dilation.',
      'Pause all active exfoliating acids (AHA/BHA) and retinoids until barrier calms completely.',
      'Use mineral (Zinc Oxide) sunscreens which are naturally soothing and less irritating for reactive skin.'
    ],
    whenToConsultDermatologist: [
      'Persistent facial flushing that does not fade after several hours.',
      'Appearance of small visible thread veins (telangiectasias) or stinging burning sensations.',
      'Rule out rosacea, seborrheic dermatitis, or contact dermatitis requiring prescription interventions.'
    ]
  }
};
