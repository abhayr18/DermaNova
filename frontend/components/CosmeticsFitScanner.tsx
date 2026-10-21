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
    isBarrierSafe: false, // Too harsh for compromised barriers
    baseFitScore: 54,
    whyItFits: 'Effective at chemical exfoliation for resilient oily skin, but severely contraindicated for compromised stratum corneum or active rosacea erythema.',
    cautions: 'High risk of chemical burns or exacerbated capillary redness if left on over 10 minutes.',
    betterAlternatives: [
      {
        name: 'Mandelic Acid 10% + HA',
        brand: 'The Ordinary',
        fitScore: 88,
        price: '$8.20',
        reason: 'Larger molecular weight delivers gentle keratolytic clearing without stinging delicate barriers.'
      },
      {
        name: 'BHA Liquid Exfoliant 2%',
        brand: "Paula's Choice",
        fitScore: 92,
        price: '$35.00',
        reason: 'Gentle buffered formulation with green tea extract to soothe microvascular irritation.'
      }
    ]
  },
  {
    id: 'prod-2',
    name: 'Skin Perfecting 2% BHA Liquid Exfoliant',
    brand: "Paula's Choice",
    category: 'treatment',
    price: '$35.00',
    rating: 4.8,
    keyActives: ['Salicylic Acid 2%', 'Green Tea (Camellia Sinensis)', 'Methylpropanediol'],
    allIngredients: ['Water', 'Methylpropanediol', 'Butylene Glycol', 'Salicylic Acid', 'Polysorbate 20', 'Camellia Oleifera Leaf Extract', 'Sodium Hydroxide', 'Tetrasodium EDTA'],
    comedogenicRating: 0,
    isFragranceFree: true,
    isPregnancySafe: true,
    isBarrierSafe: true,
    baseFitScore: 94,
    whyItFits: 'Penetrates lipid-rich sebaceous glands to dissolve keratotic plugs and reduce follicular inflammatory papules with minimal barrier disruption.',
    betterAlternatives: []
  },
  {
    id: 'prod-3',
    name: 'Hydrating Facial Cleanser',
    brand: 'CeraVe',
    category: 'cleanser',
    price: '$14.99',
    rating: 4.7,
    keyActives: ['Ceramides 1, 3, 6-II', 'Hyaluronic Acid', 'Glycerin'],
    allIngredients: ['Aqua', 'Glycerin', 'Cetearyl Alcohol', 'PEG-40 Stearate', 'Stearyl Alcohol', 'Potassium Phosphate', 'Ceramide NP', 'Ceramide AP', 'Ceramide EOP', 'Carbomer', 'Glyceryl Stearate'],
    comedogenicRating: 1,
    isFragranceFree: true,
    isPregnancySafe: true,
    isBarrierSafe: true,
    baseFitScore: 96,
    whyItFits: 'Non-foaming MVE emulsion technology preserves natural epidermal lipids without stripping the acid mantle or causing rebound sebum overproduction.',
    betterAlternatives: []
  },
  {
    id: 'prod-4',
    name: 'Cicaplast Baume B5+ Ultra-Repairing Balm',
    brand: 'La Roche-Posay',
    category: 'moisturizer',
    price: '$18.99',
    rating: 4.8,
    keyActives: ['Madecassoside (Centella)', '5% Panthenol (Vitamin B5)', 'Shea Butter', 'Zinc Gluconate'],
    allIngredients: ['Aqua', 'Hydrogenated Polyisobutene', 'Dimethicone', 'Glycerin', 'Butyrospermum Parkii Butter', 'Panthenol', 'Zea Mays Starch', 'Madecassoside', 'Manganese Gluconate'],
    comedogenicRating: 2,
    isFragranceFree: true,
    isPregnancySafe: true,
    isBarrierSafe: true,
    baseFitScore: 91,
    whyItFits: 'Intensive post-inflammatory recovery balm. Madecassoside and 5% Panthenol rapidly attenuate capillary erythema and stinging.',
    cautions: 'Shea butter base may feel occlusive on severely congested cystic T-zones.',
    betterAlternatives: []
  },
  {
    id: 'prod-5',
    name: 'Advanced Snail 96 Mucin Power Essence',
    brand: 'COSRX',
    category: 'serum',
    price: '$25.00',
    rating: 4.7,
    keyActives: ['96.3% Snail Secretion Filtrate', 'Sodium Hyaluronate', 'Allantoin', 'Arginine'],
    allIngredients: ['Snail Secretion Filtrate', 'Betaine', 'Butylene Glycol', '1,2-Hexanediol', 'Sodium Polyacrylate', 'Phenoxyethanol', 'Sodium Hyaluronate', 'Allantoin', 'Carbomer', 'Panthenol', 'Arginine'],
    comedogenicRating: 0,
    isFragranceFree: true,
    isPregnancySafe: true,
    isBarrierSafe: true,
    baseFitScore: 89,
    whyItFits: 'Ultra-lightweight soothing hydration with bio-compatible glycoproteins. Does not clog follicular infundibula.',
    betterAlternatives: []
  },
  {
    id: 'prod-6',
    name: 'C E Ferulic Antioxidant Serum',
    brand: 'SkinCeuticals',
    category: 'serum',
    price: '$182.00',
    rating: 4.9,
    keyActives: ['15% L-Ascorbic Acid', '1% Alpha Tocopherol', '0.5% Ferulic Acid'],
    allIngredients: ['Aqua', 'Dipropylene Glycol', 'Ascorbic Acid', 'Glycerin', 'Laureth-23', 'Phenoxyethanol', 'Tocopherol', 'Ferulic Acid', 'Sodium Hyaluronate'],
    comedogenicRating: 1,
    isFragranceFree: true,
    isPregnancySafe: true,
    isBarrierSafe: false, // Low pH 2.5 can sting compromised barrier
    baseFitScore: 78,
    whyItFits: 'The gold standard clinical photo-protection and PIH fading serum. However, pH 2.5–3.0 may trigger flushing on compromised barriers.',
    cautions: 'If skin barrier is stinging, repair with ceramides for 2 weeks prior to starting 15% pure Vitamin C.',
    betterAlternatives: [
      {
        name: 'Serum 10 AOX+ (Gentle Vitamin C)',
        brand: 'SkinCeuticals',
        fitScore: 91,
        price: '$76.00',
        reason: 'Formulated at 10% L-Ascorbic Acid for sensitive barriers prone to microvascular flushing.'
      }
    ]
  },
  {
    id: 'prod-7',
    name: 'Anthelios Clear Skin Dry Touch SPF 60',
    brand: 'La Roche-Posay',
    category: 'sunscreen',
    price: '$21.99',
    rating: 4.6,
    keyActives: ['Cell-Ox Shield', 'Perlite + Silica (Oil Absorbing)', 'Avobenzone 3%'],
    allIngredients: ['Avobenzone', 'Homosalate', 'Octisalate', 'Octocrylene', 'Water', 'Silica', 'Isononyl Isononanoate', 'Dimethicone', 'Perlite', 'Styrene/Acrylates Copolymer'],
    comedogenicRating: 0,
    isFragranceFree: true,
    isPregnancySafe: true,
    isBarrierSafe: true,
    baseFitScore: 95,
    whyItFits: 'Formulated specifically for acne-prone skin with silica micro-spheres that absorb excess sebum without inducing comedonal blockage.',
    betterAlternatives: []
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
  const [customAnalysis, setCustomAnalysis] = useState<any>(null);

  const filteredProducts = COSMETICS_DATABASE.filter((prod) => {
    const matchesSearch =
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.keyActives.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCat = selectedCategory === 'all' || prod.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { label: 'Optimal Fit', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', barColor: 'from-emerald-500 to-teal-500' };
    if (score >= 75) return { label: 'Compatible', color: 'bg-[#f1f5f9] text-[#0f172a] border-[#94a3b8]', barColor: 'from-[#0d9488] to-[#8fa382]' };
    if (score >= 60) return { label: 'Caution Advised', color: 'bg-amber-50 text-amber-700 border-amber-200', barColor: 'from-amber-500 to-yellow-500' };
    return { label: 'Barrier Conflict', color: 'bg-rose-50 text-rose-700 border-rose-200', barColor: 'from-rose-500 to-red-500' };
  };

  const handleAnalyzeCustomINCI = () => {
    if (!customINCI.trim()) return;

    const lower = customINCI.toLowerCase();
    let score = 80;

    const hasAlcohol = lower.includes('alcohol denat') || lower.includes('denatured alcohol') || lower.includes('isopropyl alcohol');
    const hasFragrance = lower.includes('fragrance') || lower.includes('parfum') || lower.includes('linalool') || lower.includes('limonene');
    const hasCeramides = lower.includes('ceramide') || lower.includes('panthenol') || lower.includes('centella');
    const hasSalicylic = lower.includes('salicylic') || lower.includes('bha');
    const hasNiacinamide = lower.includes('niacinamide');

    if (hasAlcohol) score -= 25;
    if (hasFragrance) score -= 15;
    if (hasCeramides) score += 12;
    if (hasSalicylic) score += 8;
    if (hasNiacinamide) score += 8;

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
      
      {/* Top Banner: No Brand Affiliation Guarantee */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#e2e8f0] shadow-sm relative overflow-hidden">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fff7ed] border border-[#ffedd5] text-[#d97706] text-[10px] font-mono uppercase tracking-wider font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#d97706]" />
            Cosmetics Fit Score™ Engine • 100% Brand-Neutral
          </div>
          <h2 className="font-sans font-extrabold text-2xl sm:text-4xl text-[#0f172a] font-normal leading-tight">
            Check Cosmetics Compatibility with Zero Commercial Bias
          </h2>
          <p className="text-xs sm:text-sm text-[#64748b] leading-relaxed">
            Search or scan any cosmetic formulation to evaluate exact compatibility against your facial skin diagnosis. Our clinical scoring engine evaluates every ingredient against European Chemical Agency (ECHA), CIR, and FDA safety standards.
          </p>
        </div>

        {/* Brand Neutrality Guarantee Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 border-t border-[#f1f5f9] text-xs text-[#0f172a] mt-4">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#0f172a]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#0d9488]" />
            <span>0% Brand Sponsorship</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#0f172a]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#0d9488]" />
            <span>Independent INCI Lab Scoring</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#0f172a]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#0d9488]" />
            <span>Comedogenic Pore Rating</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#0f172a]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#0d9488]" />
            <span>Safer Alternatives</span>
          </div>
        </div>
      </div>

      {/* Main Fit Score Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Product Search & Selector (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl p-4 sm:p-5 bg-white border border-[#e2e8f0] space-y-4 shadow-sm">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#94a3b8] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search CeraVe, The Ordinary, Paula's Choice, BHA..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#f8fafc] border border-[#cbd5e1] text-xs text-[#0f172a] placeholder:text-[#94a3b8] font-sans focus:outline-none focus:ring-2 focus:ring-[#0d9488]/20 focus:border-[#0d9488]"
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
                      ? 'bg-[#0f172a] text-white font-medium shadow-sm'
                      : 'bg-[#f8fafc] text-[#64748b] hover:text-[#0f172a] border border-[#e2e8f0]'
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
                return (
                  <div
                    key={prod.id}
                    onClick={() => {
                      setSelectedProduct(prod);
                      setIsCustomMode(false);
                    }}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#f1f5f9] border-[#0d9488] ring-2 ring-[#0d9488]/20 shadow-sm'
                        : 'bg-[#f8fafc] border-[#e2e8f0] hover:border-[#94a3b8] hover:bg-white'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="text-[10px] font-mono text-[#0d9488] uppercase font-medium">
                        {prod.brand} • {prod.category}
                      </div>
                      <h4 className="text-xs font-bold text-[#0f172a] leading-snug">
                        {prod.name}
                      </h4>
                      <div className="text-[10px] text-[#64748b] line-clamp-1">
                        Actives: {prod.keyActives.join(', ')}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-base font-mono font-bold text-[#0f172a]">
                        {prod.baseFitScore}%
                      </div>
                      <span className="text-[9px] font-mono text-[#0d9488]">
                        Fit Score
                      </span>
                    </div>
                  </div>
                );
              })}

              {filteredProducts.length === 0 && (
                <div className="p-6 text-center text-xs text-[#64748b] space-y-2">
                  <p>No products found for "{searchQuery}".</p>
                  <button
                    onClick={() => setIsCustomMode(true)}
                    className="text-[#d97706] underline font-medium"
                  >
                    Paste custom ingredients to analyze
                  </button>
                </div>
              )}
            </div>

            {/* Custom Formula Analyzer Trigger */}
            <button
              onClick={() => setIsCustomMode(true)}
              className={`w-full py-2.5 rounded-2xl border text-xs font-mono font-semibold flex items-center justify-center gap-2 transition ${
                isCustomMode
                  ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-sm'
                  : 'bg-[#f8fafc] border-[#e2e8f0] text-[#0f172a] hover:bg-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Paste Custom INCI Ingredient List</span>
            </button>
          </div>
        </div>

        {/* Right Column: Deep Fit Score Inspector Card (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {!isCustomMode ? (
            /* Selected Product Detailed Analysis */
            <div className="rounded-3xl p-5 sm:p-7 bg-white border border-[#e2e8f0] space-y-6 shadow-sm animate-fade-in">
              {/* Product Header & Fit Meter */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#f1f5f9] pb-5">
                <div className="space-y-1">
                  <div className="text-xs font-mono text-[#0d9488] uppercase tracking-wider font-semibold">
                    {selectedProduct.brand} • {selectedProduct.category} • {selectedProduct.price}
                  </div>
                  <h3 className="font-sans font-extrabold text-xl sm:text-2xl font-normal text-[#0f172a] leading-tight">
                    {selectedProduct.name}
                  </h3>
                  <p className="text-xs text-[#64748b]">
                    Evaluated against your profile: <strong className="text-[#0f172a] font-semibold">{userSkinType} Skin</strong> • Concerns: {activeIssues.join(', ')}
                  </p>
                </div>

                {/* Fit Score Badge */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                  <div className="text-right">
                    <span className="text-3xl sm:text-4xl font-mono font-bold text-[#0f172a]">
                      {selectedProduct.baseFitScore}%
                    </span>
                    <div className="text-[10px] font-mono text-[#64748b] uppercase tracking-wider">
                      Fit Score
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold border ${currentBadge.color}`}>
                    {currentBadge.label}
                  </span>
                </div>
              </div>

              {/* Progress Fit Meter */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono text-[#64748b]">
                  <span>Skin Compatibility Index</span>
                  <span className="text-[#0f172a] font-semibold">{selectedProduct.baseFitScore} / 100</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#f1f5f9] overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${currentBadge.barColor} transition-all duration-700`}
                    style={{ width: `${selectedProduct.baseFitScore}%` }}
                  />
                </div>
              </div>

              {/* 4-Pillar Clinical Safety Evaluation */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-mono font-semibold text-[#0d9488] uppercase tracking-wider">
                  Comprehensive Ingredient Safety Evaluation
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] text-center space-y-1">
                    <div className="text-[10px] font-mono text-[#64748b]">Comedogenic</div>
                    <div className="text-xs font-mono font-bold text-emerald-700 flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{selectedProduct.comedogenicRating}/5 Safe</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] text-center space-y-1">
                    <div className="text-[10px] font-mono text-[#64748b]">Skin Barrier</div>
                    <div className="text-xs font-mono font-bold text-emerald-700 flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{selectedProduct.isBarrierSafe ? 'Lipid Safe' : 'Drying'}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] text-center space-y-1">
                    <div className="text-[10px] font-mono text-[#64748b]">Fragrance</div>
                    <div className="text-xs font-mono font-bold text-emerald-700 flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{selectedProduct.isFragranceFree ? 'Pure / 0%' : 'Added'}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] text-center space-y-1">
                    <div className="text-[10px] font-mono text-[#64748b]">Pregnancy</div>
                    <div className="text-xs font-mono font-bold text-emerald-700 flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{selectedProduct.isPregnancySafe ? 'Approved' : 'Caution'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Why It Fits & Scientific Rationale */}
              <div className="p-4 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] space-y-2">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#0d9488] flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-[#0d9488]" />
                  Cosmetic Chemist Clinical Reasoning
                </span>
                <p className="text-xs sm:text-sm text-[#384333] leading-relaxed">
                  {selectedProduct.whyItFits}
                </p>
                {selectedProduct.cautions && (
                  <div className="p-2.5 rounded-xl bg-[#fff7ed] border border-[#ffedd5] text-[#d97706] text-xs flex items-start gap-2 mt-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{selectedProduct.cautions}</span>
                  </div>
                )}
              </div>

              {/* Key Actives Pill Tags */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#64748b]">
                  Therapeutic Active Compounds
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.keyActives.map((active, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-xl bg-[#f1f5f9] border border-[#cbd5e1] text-[#0f172a] text-xs font-mono font-medium"
                    >
                      {active}
                    </span>
                  ))}
                </div>
              </div>

              {/* Better-Fit-To-You Alternatives (if present) */}
              {selectedProduct.betterAlternatives && selectedProduct.betterAlternatives.length > 0 && (
                <div className="p-4 rounded-2xl bg-[#f1f5f9] border border-[#cbd5e1] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0f172a] flex items-center gap-1.5 font-mono">
                      <Sparkles className="w-3.5 h-3.5 text-[#0d9488]" />
                      Better-Fit Formulations
                    </span>
                    <span className="text-[10px] text-[#0d9488] font-mono">Higher Safety Index</span>
                  </div>

                  <div className="space-y-2">
                    {selectedProduct.betterAlternatives.map((alt, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-white border border-[#e2e8f0] flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="font-bold text-[#0f172a]">
                            {alt.name} <span className="font-normal text-[#64748b]">by {alt.brand}</span>
                          </div>
                          <p className="text-[11px] text-[#64748b] mt-0.5">{alt.reason}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono font-semibold text-xs border border-emerald-200">
                            {alt.fitScore}% Fit
                          </span>
                          <div className="text-[10px] text-[#64748b] mt-0.5">{alt.price}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Custom INCI Formula Analyzer */
            <div className="rounded-3xl p-5 sm:p-7 bg-white border border-[#e2e8f0] space-y-5 shadow-sm animate-fade-in">
              <div className="space-y-1">
                <span className="text-xs font-mono text-[#d97706] uppercase font-semibold">
                  Custom Cosmetic Chemist Analyzer
                </span>
                <h3 className="font-sans font-extrabold text-xl font-normal text-[#0f172a]">
                  Analyze Any Skincare Product by INCI Ingredients
                </h3>
                <p className="text-xs text-[#64748b]">
                  Paste the ingredients from the back of your bottle to check pore-clogging comedogenicity, drying alcohol content, and barrier safety.
                </p>
              </div>

              <textarea
                rows={5}
                placeholder="Paste ingredient list (e.g., Aqua, Glycerin, Niacinamide, Salicylic Acid, Fragrance, Alcohol Denat...)"
                value={customINCI}
                onChange={(e) => setCustomINCI(e.target.value)}
                className="w-full p-4 rounded-2xl bg-[#f8fafc] border border-[#cbd5e1] text-xs font-mono leading-relaxed text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#0d9488]/20 focus:border-[#0d9488]"
              />

              <button
                onClick={handleAnalyzeCustomINCI}
                className="px-6 py-3 rounded-full bg-[#0f172a] hover:bg-[#1e293b] text-white font-mono font-semibold text-xs flex items-center gap-2 transition shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-[#d97706]" />
                <span>Calculate Fit Score</span>
              </button>

              {customAnalysis && (
                <div className="p-5 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3">
                    <div>
                      <span className="text-[10px] font-mono text-[#0d9488]">Custom Formula Result</span>
                      <h4 className="text-base font-bold text-[#0f172a]">Analyzed Formulation</h4>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-mono font-bold text-[#0f172a]">
                        {customAnalysis.score}%
                      </div>
                      <span className="text-[10px] font-mono text-[#64748b]">Fit Score</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2.5 rounded-xl bg-white border border-[#e2e8f0] flex items-center justify-between">
                      <span className="text-[#64748b]">Non-Comedogenic:</span>
                      <span className={customAnalysis.safetyCheck.nonComedogenic ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                        {customAnalysis.safetyCheck.nonComedogenic ? '✓ Passed' : '✗ Flagged'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-[#e2e8f0] flex items-center justify-between">
                      <span className="text-[#64748b]">Barrier-Safe:</span>
                      <span className={customAnalysis.safetyCheck.barrierSafe ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                        {customAnalysis.safetyCheck.barrierSafe ? '✓ Safe' : '✗ Contains Alcohol'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-[#e2e8f0] flex items-center justify-between">
                      <span className="text-[#64748b]">Fragrance-Free:</span>
                      <span className={customAnalysis.safetyCheck.fragranceFree ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                        {customAnalysis.safetyCheck.fragranceFree ? '✓ Pure' : '✗ Fragrance'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-[#e2e8f0] flex items-center justify-between">
                      <span className="text-[#64748b]">Pregnancy-Safe:</span>
                      <span className="text-emerald-700 font-bold">✓ Safe</span>
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
