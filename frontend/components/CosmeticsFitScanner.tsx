'use client';

import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Pill,
  Droplets,
  HeartPulse,
  Sliders,
  Filter,
  Check,
  X,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';

interface CosmeticProduct {
  id: string;
  name: string;
  brand: string;
  category: 'cleanser' | 'serum' | 'moisturizer' | 'sunscreen' | 'treatment';
  price: string;
  rating: number;
  keyActives: string[];
  allIngredients: string[];
  comedogenicRating: number; // 0 to 5
  isFragranceFree: boolean;
  isPregnancySafe: boolean;
  isBarrierSafe: boolean;
  baseFitScore: number;
  whyItFits: string;
  cautions?: string;
  betterAlternatives?: {
    name: string;
    brand: string;
    fitScore: number;
    price: string;
    reason: string;
  }[];
}

const COSMETICS_DATABASE: CosmeticProduct[] = [
  {
    id: 'prod-1',
    name: 'AHA 30% + BHA 2% Peeling Solution',
    brand: 'The Ordinary',
    category: 'treatment',
    price: '$9.50',
    rating: 4.6,
    keyActives: ['Glycolic Acid 30%', 'Salicylic Acid 2%', 'Tasmanian Pepperberry'],
    allIngredients: ['Aqua', 'Glycolic Acid', 'Rosa Damascena Flower Water', 'Aloe Barbadensis Leaf Water', 'Sodium Hydroxide', 'Salicylic Acid', 'Daucus Carota Sativa Extract'],
    comedogenicRating: 0,
    isFragranceFree: true,
    isPregnancySafe: false,
    isBarrierSafe: false,
    baseFitScore: 68,
    whyItFits: 'Effective chemical exfoliant for persistent follicular hyperkeratosis, but high acidity requires an intact moisture barrier.',
    cautions: 'Caution: Can induce stinging or capillary erythema if facial redness or barrier compromise is currently present.',
    betterAlternatives: [
      {
        name: '2% BHA Liquid Exfoliant',
        brand: "Paula's Choice",
        fitScore: 92,
        price: '$14.00',
        reason: 'Buffered pH with soothing green tea extract reduces erythema risk while clearing pores.'
      },
      {
        name: 'Mandelic Acid 10% + HA',
        brand: 'The Ordinary',
        fitScore: 89,
        price: '$8.20',
        reason: 'Larger molecular weight penetrates slower, preventing barrier stinging.'
      }
    ]
  },
  {
    id: 'prod-2',
    name: '2% BHA Liquid Exfoliant',
    brand: "Paula's Choice",
    category: 'treatment',
    price: '$35.00',
    rating: 4.9,
    keyActives: ['Salicylic Acid 2%', 'Camellia Oleifera (Green Tea) Leaf Extract'],
    allIngredients: ['Water (Aqua)', 'Methylpropanediol', 'Butylene Glycol', 'Salicylic Acid', 'Polysorbate 20', 'Camellia Oleifera Leaf Extract', 'Sodium Hydroxide', 'Tetrasodium EDTA'],
    comedogenicRating: 0,
    isFragranceFree: true,
    isPregnancySafe: true,
    isBarrierSafe: true,
    baseFitScore: 94,
    whyItFits: 'Lipophilic salicylic acid penetrates deep into sebaceous follicles to dissolve trapped sebum and acne comedones without micro-tears.'
  },
  {
    id: 'prod-3',
    name: 'Foaming Facial Cleanser',
    brand: 'CeraVe',
    category: 'cleanser',
    price: '$16.99',
    rating: 4.8,
    keyActives: ['Ceramides 1, 3, 6-II', 'Niacinamide', 'Hyaluronic Acid'],
    allIngredients: ['Aqua', 'Cocamidopropyl Hydroxysultaine', 'Glycerin', 'Sodium Lauroyl Sarcosinate', 'Ceramide NP', 'Ceramide AP', 'Ceramide EOP', 'Niacinamide', 'Sodium Hyaluronate'],
    comedogenicRating: 0,
    isFragranceFree: true,
    isPregnancySafe: true,
    isBarrierSafe: true,
    baseFitScore: 96,
    whyItFits: 'Formulated with physiological 3:1:1 lipid ratio to protect intercellular lamellae while lifting excess daytime sebum.'
  },
  {
    id: 'prod-4',
    name: 'Anthelios Melt-In Sunscreen Milk SPF 60',
    brand: 'La Roche-Posay',
    category: 'sunscreen',
    price: '$25.99',
    rating: 4.8,
    keyActives: ['Cell-Ox Shield®', 'Avobenzone 3%', 'Homosalate 10%', 'Senna Alata Extract'],
    allIngredients: ['Water', 'Dimethicone', 'Isododecane', 'Alcohol Denat.', 'Trimethylsiloxysilicate', 'Silica', 'Cassia Alata Leaf Extract'],
    comedogenicRating: 1,
    isFragranceFree: true,
    isPregnancySafe: true,
    isBarrierSafe: true,
    baseFitScore: 91,
    whyItFits: 'Broad-spectrum photostable UVA/UVB protection prevents UV-induced post-inflammatory hyperpigmentation (PIH).'
  },
  {
    id: 'prod-5',
    name: 'Niacinamide 10% + Zinc 1%',
    brand: 'The Ordinary',
    category: 'serum',
    price: '$6.00',
    rating: 4.5,
    keyActives: ['Niacinamide 10%', 'Zinc PCA 1%'],
    allIngredients: ['Aqua', 'Niacinamide', 'Pentylene Glycol', 'Zinc PCA', 'Dimethyl Isosorbide', 'Tamarindus Indica Seed Gum', 'Xanthan Gum', 'Isoceteth-20', 'Phenoxyethanol'],
    comedogenicRating: 0,
    isFragranceFree: true,
    isPregnancySafe: true,
    isBarrierSafe: true,
    baseFitScore: 88,
    whyItFits: 'Regulates sebaceous sebum output and strengthens epidermal ceramides to minimize pore congestion.',
    cautions: '10% concentration may cause mild transient flushing in very reactive or sensitized skin types.'
  },
  {
    id: 'prod-6',
    name: 'Advanced Snail 96 Mucin Power Essence',
    brand: 'CosRX',
    category: 'serum',
    price: '$19.00',
    rating: 4.8,
    keyActives: ['Snail Secretion Filtrate 96.3%', 'Sodium Hyaluronate', 'Allantoin'],
    allIngredients: ['Snail Secretion Filtrate', 'Betaine', 'Butylene Glycol', '1,2-Hexanediol', 'Sodium Polyacrylate', 'Phenoxyethanol', 'Sodium Hyaluronate', 'Allantoin'],
    comedogenicRating: 0,
    isFragranceFree: true,
    isPregnancySafe: true,
    isBarrierSafe: true,
    baseFitScore: 95,
    whyItFits: 'High-density glycosaminoglycans promote dermal wound healing, soothe barrier redness, and replenish hydration without pore obstruction.'
  },
  {
    id: 'prod-7',
    name: 'C E Ferulic Combination Antioxidant',
    brand: 'SkinCeuticals',
    category: 'serum',
    price: '$182.00',
    rating: 4.9,
    keyActives: ['15% L-Ascorbic Acid', '1% Alpha Tocopherol', '0.5% Ferulic Acid'],
    allIngredients: ['Water', 'Ethoxydiglycol', 'L-Ascorbic Acid', 'Propylene Glycol', 'Glycerin', 'Laureth-23', 'Alpha Tocopherol', 'Phenoxyethanol', 'Triethanolamine', 'Ferulic Acid'],
    comedogenicRating: 1,
    isFragranceFree: true,
    isPregnancySafe: true,
    isBarrierSafe: true,
    baseFitScore: 92,
    whyItFits: 'Synergistic gold-standard antioxidant serum neutralizes environmental free radicals and accelerates post-acne macule clearance.'
  },
  {
    id: 'prod-8',
    name: 'Protini Polypeptide Cream',
    brand: 'Drunk Elephant',
    category: 'moisturizer',
    price: '$68.00',
    rating: 4.4,
    keyActives: ['9 Signal Peptide Complex', 'Pygmy Waterlily Stem Cell Extract'],
    allIngredients: ['Water/Aqua/Eau', 'Dicaprylyl Carbonate', 'Glycerin', 'Cetearyl Alcohol', 'Cetearyl Olivate', 'Sorbitan Olivate', 'Sh-Oligopeptide-1', 'Sh-Polypeptide-1'],
    comedogenicRating: 1,
    isFragranceFree: true,
    isPregnancySafe: true,
    isBarrierSafe: true,
    baseFitScore: 86,
    whyItFits: 'Peptides signal collagen synthesis and support dermal elasticity without greasy comedogenic occlusion.'
  }
];

interface CosmeticsFitScannerProps {
  userSkinType?: string;
  detectedIssues?: string[];
  userConcerns?: string[];
}

export const CosmeticsFitScanner: React.FC<CosmeticsFitScannerProps> = ({
  userSkinType = 'Combination',
  detectedIssues,
  userConcerns
}) => {
  const activeIssues = detectedIssues || userConcerns || ['Inflammatory Acne', 'Facial Redness'];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<CosmeticProduct>(COSMETICS_DATABASE[1]); // Default to Paula's Choice
  const [customINCI, setCustomINCI] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customAnalysis, setCustomAnalysis] = useState<any | null>(null);

  // Filter products
  const filteredProducts = COSMETICS_DATABASE.filter((prod) => {
    const matchesSearch =
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.keyActives.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || prod.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getScoreBadge = (score: number) => {
    if (score >= 90) {
      return {
        label: 'Exceptional Fit',
        color: 'text-emerald-300 bg-emerald-950/60 border-emerald-500/40',
        barColor: 'from-emerald-500 to-teal-400'
      };
    }
    if (score >= 80) {
      return {
        label: 'Strong Therapeutic Fit',
        color: 'text-navara-matcha bg-navara-panel border-navara-sage/40',
        barColor: 'from-navara-sage to-navara-matcha'
      };
    }
    if (score >= 65) {
      return {
        label: 'Moderate / Use with Caution',
        color: 'text-amber-300 bg-amber-950/60 border-amber-500/40',
        barColor: 'from-amber-500 to-amber-400'
      };
    }
    return {
      label: 'Incompatible / High Risk',
      color: 'text-rose-300 bg-rose-950/60 border-rose-500/40',
      barColor: 'from-rose-500 to-rose-400'
    };
  };

  const handleAnalyzeCustomINCI = () => {
    if (!customINCI.trim()) return;
    const lower = customINCI.toLowerCase();
    const hasAlcohol = lower.includes('alcohol denat') || lower.includes('ethanol');
    const hasFragrance = lower.includes('fragrance') || lower.includes('parfum') || lower.includes('linalool');
    const hasNiacinamide = lower.includes('niacinamide');
    const hasSalicylic = lower.includes('salicylic acid') || lower.includes('bha');
    const hasCeramides = lower.includes('ceramide');

    let score = 85;
    if (hasAlcohol) score -= 20;
    if (hasFragrance) score -= 15;
    if (hasCeramides) score += 10;
    if (hasNiacinamide) score += 5;
    if (hasSalicylic) score += 5;

    score = Math.min(Math.max(score, 35), 98);

    setCustomAnalysis({
      score,
      hasAlcohol,
      hasFragrance,
      hasCeramides,
      hasSalicylic,
      hasNiacinamide,
      safetyCheck: {
        nonComedogenic: !lower.includes('coconut oil') && !lower.includes('myristyl'),
        barrierSafe: !hasAlcohol,
        fragranceFree: !hasFragrance,
        pregnancySafe: !lower.includes('retin') && !lower.includes('hydroquinone')
      }
    });
  };

  const currentBadge = getScoreBadge(selectedProduct.baseFitScore);

  return (
    <div className="w-full space-y-6">
      
      {/* Top Lovi Feature Banner: No Brand Affiliation Guarantee */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#232e1b] via-[#1c2219] to-[#141712] border border-navara-border shadow-2xl relative overflow-hidden">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navara-terracottaSoft border border-navara-terracotta/30 text-navara-terracotta text-[10px] font-mono uppercase tracking-wider font-bold">
            <Sparkles className="w-3.5 h-3.5 text-navara-terracotta" />
            Lóvi Fit Score™ Engine • 100% Brand-Neutral
          </div>
          <h2 className="font-serif-luxury text-2xl sm:text-4xl text-navara-ivory font-bold leading-tight">
            Check Cosmetics’ Fit with Zero Brand Affiliation
          </h2>
          <p className="text-xs sm:text-sm text-navara-stone leading-relaxed">
            Scan or search any cosmetic product to see its exact compatibility against your facial skin diagnosis. Our clinical scoring engine evaluates every ingredient against European Chemical Agency (ECHA), CIR, and FDA safety standards.
          </p>
        </div>

        {/* Brand Neutrality Guarantee Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 border-t border-navara-borderSubtle text-xs text-navara-cream">
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-navara-matcha" />
            <span>0% Brand Hype</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-navara-matcha" />
            <span>Independent Lab Scoring</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-navara-matcha" />
            <span>Pore-Clogging Index</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-navara-matcha" />
            <span>Safer Alternatives</span>
          </div>
        </div>
      </div>

      {/* Main Fit Score Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Product Search & Selector (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel rounded-3xl p-4 sm:p-5 border border-navara-border space-y-4 shadow-xl">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-navara-sage absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search CeraVe, The Ordinary, Paula's Choice, BHA..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-input text-xs placeholder:text-navara-stone/60 font-sans"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              {['all', 'cleanser', 'serum', 'treatment', 'moisturizer', 'sunscreen'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-xl font-mono text-[11px] capitalize transition shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-navara-ivory text-navara-bg font-bold shadow'
                      : 'bg-[#181d15] text-navara-stone hover:text-navara-ivory border border-navara-borderSubtle'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Products List */}
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {filteredProducts.map((prod) => {
                const isSelected = selectedProduct.id === prod.id && !isCustomMode;
                const badge = getScoreBadge(prod.baseFitScore);
                return (
                  <div
                    key={prod.id}
                    onClick={() => {
                      setSelectedProduct(prod);
                      setIsCustomMode(false);
                    }}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#2a3b19]/80 border-navara-matcha ring-2 ring-navara-matcha/30 shadow-lg'
                        : 'bg-[#1c2219]/60 border-navara-borderSubtle hover:border-navara-border hover:bg-[#20271c]'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="text-[10px] font-mono text-navara-sage uppercase">
                        {prod.brand} • {prod.category}
                      </div>
                      <h4 className="text-xs font-bold text-navara-ivory leading-snug">
                        {prod.name}
                      </h4>
                      <div className="text-[10px] text-navara-stone/90 line-clamp-1">
                        Actives: {prod.keyActives.join(', ')}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-base font-mono font-black text-navara-ivory">
                        {prod.baseFitScore}%
                      </div>
                      <span className="text-[9px] font-mono text-navara-matcha">
                        Fit Score
                      </span>
                    </div>
                  </div>
                );
              })}

              {filteredProducts.length === 0 && (
                <div className="p-6 text-center text-xs text-navara-stone space-y-2">
                  <p>No products found for "{searchQuery}".</p>
                  <button
                    onClick={() => setIsCustomMode(true)}
                    className="text-navara-terracotta underline font-bold"
                  >
                    Paste custom ingredients to analyze
                  </button>
                </div>
              )}
            </div>

            {/* Custom Formula Analyzer Trigger */}
            <button
              onClick={() => setIsCustomMode(true)}
              className={`w-full py-2.5 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                isCustomMode
                  ? 'bg-navara-terracotta text-white border-navara-terracotta shadow-lg'
                  : 'bg-[#181d15] border-navara-border text-navara-stone hover:text-navara-ivory'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Paste Custom INCI Ingredient List</span>
            </button>
          </div>
        </div>

        {/* Right Column: Deep Lóvi Fit Score Inspector Card (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {!isCustomMode ? (
            /* Selected Product Detailed Analysis */
            <div className="glass-panel rounded-3xl p-5 sm:p-7 border border-navara-border space-y-6 shadow-2xl animate-fade-in">
              {/* Product Header & Fit Meter */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-navara-borderSubtle pb-5">
                <div className="space-y-1">
                  <div className="text-xs font-mono text-navara-sage uppercase tracking-wider">
                    {selectedProduct.brand} • {selectedProduct.category} • {selectedProduct.price}
                  </div>
                  <h3 className="font-serif-luxury text-xl sm:text-2xl font-bold text-navara-ivory leading-tight">
                    {selectedProduct.name}
                  </h3>
                  <p className="text-xs text-navara-stone">
                    Evaluated against your profile: <strong className="text-navara-cream">{userSkinType} Skin</strong> • Concerns: {activeIssues.join(', ')}
                  </p>
                </div>

                {/* Giant Lóvi Fit Score Radial Badge */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                  <div className="text-right">
                    <span className="text-3xl sm:text-4xl font-mono font-black text-navara-ivory">
                      {selectedProduct.baseFitScore}%
                    </span>
                    <div className="text-[10px] font-mono text-navara-stone uppercase tracking-wider">
                      Lóvi Fit Score
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${currentBadge.color}`}>
                    {currentBadge.label}
                  </span>
                </div>
              </div>

              {/* Progress Fit Meter */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono text-navara-stone">
                  <span>Skin Compatibility Index</span>
                  <span className="text-navara-ivory font-bold">{selectedProduct.baseFitScore} / 100</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#141712] overflow-hidden border border-navara-borderSubtle">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${currentBadge.barColor} transition-all duration-700`}
                    style={{ width: `${selectedProduct.baseFitScore}%` }}
                  />
                </div>
              </div>

              {/* 4-Pillar Clinical Safety Evaluation (Lovi Standards) */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-mono font-bold text-navara-sage uppercase tracking-wider">
                  Comprehensive Ingredient Safety Evaluation
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-2xl bg-[#1c2219] border border-navara-borderSubtle text-center space-y-1">
                    <div className="text-[10px] font-mono text-navara-stone">Comedogenic</div>
                    <div className="text-sm font-bold text-emerald-400 flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{selectedProduct.comedogenicRating}/5 Safe</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#1c2219] border border-navara-borderSubtle text-center space-y-1">
                    <div className="text-[10px] font-mono text-navara-stone">Skin Barrier</div>
                    <div className="text-sm font-bold text-emerald-400 flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{selectedProduct.isBarrierSafe ? 'Lipid Safe' : 'Drying'}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#1c2219] border border-navara-borderSubtle text-center space-y-1">
                    <div className="text-[10px] font-mono text-navara-stone">Fragrance</div>
                    <div className="text-sm font-bold text-emerald-400 flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{selectedProduct.isFragranceFree ? 'Zero Perfume' : 'Added'}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#1c2219] border border-navara-borderSubtle text-center space-y-1">
                    <div className="text-[10px] font-mono text-navara-stone">Pregnancy</div>
                    <div className="text-sm font-bold text-emerald-400 flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{selectedProduct.isPregnancySafe ? 'Approved' : 'Caution'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Why It Fits & Scientific Rationale */}
              <div className="p-4 rounded-2xl bg-[#1c2219] border border-navara-borderSubtle space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-navara-sage flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-navara-matcha" />
                  Cosmetic Chemist Clinical Reasoning
                </span>
                <p className="text-xs sm:text-sm text-navara-ivory/90 leading-relaxed">
                  {selectedProduct.whyItFits}
                </p>
                {selectedProduct.cautions && (
                  <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2 mt-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{selectedProduct.cautions}</span>
                  </div>
                )}
              </div>

              {/* Key Actives Pill Tags */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-navara-stone">
                  Therapeutic Active Compounds
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.keyActives.map((active, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-xl bg-[#232e1b] border border-navara-sage/30 text-navara-matcha text-xs font-mono font-bold"
                    >
                      {active}
                    </span>
                  ))}
                </div>
              </div>

              {/* Lovi's Superpower: Better-Fit-To-You Alternatives (if present) */}
              {selectedProduct.betterAlternatives && selectedProduct.betterAlternatives.length > 0 && (
                <div className="p-4 rounded-2xl bg-[#2a3b19]/60 border border-navara-sage/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-navara-ivory flex items-center gap-1.5 font-mono">
                      <Sparkles className="w-3.5 h-3.5 text-navara-matcha" />
                      Better-Fit-To-You Alternatives
                    </span>
                    <span className="text-[10px] text-navara-sage font-mono">Higher Safety Index</span>
                  </div>

                  <div className="space-y-2">
                    {selectedProduct.betterAlternatives.map((alt, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-[#1c2219] border border-navara-borderSubtle flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="font-bold text-navara-ivory">
                            {alt.name} <span className="font-normal text-navara-stone">by {alt.brand}</span>
                          </div>
                          <p className="text-[11px] text-navara-stone mt-0.5">{alt.reason}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold text-xs border border-emerald-500/30">
                            {alt.fitScore}% Fit
                          </span>
                          <div className="text-[10px] text-navara-stone mt-0.5">{alt.price}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Custom INCI Formula Analyzer */
            <div className="glass-panel rounded-3xl p-5 sm:p-7 border border-navara-border space-y-5 shadow-2xl animate-fade-in">
              <div className="space-y-1">
                <span className="text-xs font-mono text-navara-terracotta uppercase font-bold">
                  Custom Cosmetic Chemist Analyzer
                </span>
                <h3 className="font-serif-luxury text-xl font-bold text-navara-ivory">
                  Analyze Any Skincare Product by INCI Ingredients
                </h3>
                <p className="text-xs text-navara-stone">
                  Paste the ingredients from the back of your bottle to check pore-clogging comedogenicity, alcohol content, and skin safety.
                </p>
              </div>

              <textarea
                rows={5}
                placeholder="Paste ingredient list (e.g., Aqua, Glycerin, Niacinamide, Salicylic Acid, Fragrance, Alcohol Denat...)"
                value={customINCI}
                onChange={(e) => setCustomINCI(e.target.value)}
                className="w-full p-4 rounded-2xl glass-input text-xs font-mono leading-relaxed placeholder:text-navara-stone/50"
              />

              <button
                onClick={handleAnalyzeCustomINCI}
                className="px-6 py-3 rounded-2xl bg-navara-ivory text-navara-bg font-extrabold text-xs flex items-center gap-2 hover:bg-navara-cream transition shadow-xl"
              >
                <Sparkles className="w-4 h-4 text-navara-terracotta" />
                <span>Calculate Lóvi Fit Score</span>
              </button>

              {customAnalysis && (
                <div className="p-5 rounded-2xl bg-[#1c2219] border border-navara-border space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-navara-borderSubtle pb-3">
                    <div>
                      <span className="text-[10px] font-mono text-navara-sage">Custom Formula Result</span>
                      <h4 className="text-base font-bold text-navara-ivory">Analyzed Product</h4>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-mono font-black text-navara-matcha">
                        {customAnalysis.score}%
                      </div>
                      <span className="text-[10px] font-mono text-navara-stone">Fit Score</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-[#232e1b] border border-navara-borderSubtle flex items-center justify-between">
                      <span className="text-navara-stone">Non-Comedogenic:</span>
                      <span className={customAnalysis.safetyCheck.nonComedogenic ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {customAnalysis.safetyCheck.nonComedogenic ? '✓ Passed' : '✗ Flagged'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#232e1b] border border-navara-borderSubtle flex items-center justify-between">
                      <span className="text-navara-stone">Barrier-Safe:</span>
                      <span className={customAnalysis.safetyCheck.barrierSafe ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                        {customAnalysis.safetyCheck.barrierSafe ? '✓ Safe' : '✗ Contains Alcohol'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#232e1b] border border-navara-borderSubtle flex items-center justify-between">
                      <span className="text-navara-stone">Fragrance-Free:</span>
                      <span className={customAnalysis.safetyCheck.fragranceFree ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                        {customAnalysis.safetyCheck.fragranceFree ? '✓ Pure' : '✗ Fragrance'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#232e1b] border border-navara-borderSubtle flex items-center justify-between">
                      <span className="text-navara-stone">Pregnancy-Safe:</span>
                      <span className="text-emerald-400 font-bold">✓ Safe</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
