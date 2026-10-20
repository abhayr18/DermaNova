'use client';

import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Sparkles,
  Check,
  ShieldCheck,
  Info,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  HelpCircle,
  SlidersHorizontal,
  FileText
} from 'lucide-react';
import { RecommendationResponse } from '../../services/api';

interface PersonalizedRoutineScreenProps {
  recommendations: RecommendationResponse | null;
  skinType?: string;
  onEditPreferences?: () => void;
}

export const PersonalizedRoutineScreen: React.FC<PersonalizedRoutineScreenProps> = ({
  recommendations,
  skinType = 'Combination',
  onEditPreferences,
}) => {
  const [activeTab, setActiveTab] = useState<'morning' | 'evening'>('morning');
  const [expandedIngredients, setExpandedIngredients] = useState<Record<string, boolean>>({});

  // Interactive Completion Checkbox State
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({
    'am-1': true,
    'am-2': true,
    'am-3': false,
    'pm-1': false,
    'pm-2': false,
    'pm-3': false,
  });

  const toggleComplete = (stepId: string) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepId]: !prev[stepId],
    }));
  };

  const toggleIngredientExpand = (key: string) => {
    setExpandedIngredients((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const morningSteps = [
    {
      id: 'am-1',
      number: 'STEP 01',
      category: 'Gentle Cleanser',
      title: 'Lipid-Preserving Water Gel Cleanse',
      purpose: 'Removes overnight sweat, sebum, and desquamated cells without disturbing the acid mantle.',
      suggestedIngredients: 'Glycerin, Panthenol (B5), Oat Extract, Mild Non-Ionic Surfactants',
      instructions: 'Splash lukewarm water onto face. Apply 1 pump, massage gently in circular motions for 30 seconds. Rinse thoroughly with water; pat dry with a clean towel.',
      safetyNote: 'Do not use hot water, which can trigger facial capillary dilation and dehydration.',
      ingredientDetails: {
        mechanism: 'Maintains stratum corneum barrier lipids while removing surface impurities.',
        suitability: 'Formulated at pH 5.5 to protect the microbiome.',
      },
    },
    {
      id: 'am-2',
      number: 'STEP 02',
      category: 'Moisturizer',
      title: 'Barrier Support Daily Emulsion',
      purpose: 'Restores essential physiological ceramides and seals in transepidermal hydration.',
      suggestedIngredients: 'Ceramides NP & AP, Squalane, Hyaluronic Acid, Centella Asiatica',
      instructions: 'Smooth a nickel-sized amount evenly over face and neck while skin is slightly damp from cleansing.',
      safetyNote: 'Allow 60 seconds to absorb before applying sunscreen.',
      ingredientDetails: {
        mechanism: 'Replenishes intercellular lipid matrix to strengthen the cutaneous protective barrier.',
        suitability: 'Non-comedogenic, fragrance-free, suitable for reactive or acne-prone skin.',
      },
    },
    {
      id: 'am-3',
      number: 'STEP 03',
      category: 'Sunscreen',
      title: 'Broad Spectrum SPF 50+ Daily Shield',
      purpose: 'Shields skin from UVA (aging) and UVB (burning) rays to prevent post-inflammatory hyperpigmentation and photo-damage.',
      suggestedIngredients: 'Zinc Oxide, Titanium Dioxide, Ectoin, Niacinamide (2%)',
      instructions: 'Apply two full finger lengths across entire face, neck, and ears 15 minutes before daylight exposure. Reapply every 2 hours if outdoors.',
      safetyNote: 'Essential daily defense even on overcast days or while working near windows.',
      ingredientDetails: {
        mechanism: 'Physical mineral micro-dispersion reflects UV radiation without chemical absorption heat.',
        suitability: 'Calms sensitive, red-prone skin while preventing dark spot recurrence.',
      },
    },
  ];

  const eveningSteps = [
    {
      id: 'pm-1',
      number: 'STEP 01',
      category: 'Gentle Cleanser',
      title: 'Purifying Barrier Evening Cleanse',
      purpose: 'Dissolves all traces of SPF, environmental particulate pollutants, and daily sebum accumulation.',
      suggestedIngredients: 'Gentle micellar amino-acid surfactants, Allantoin, Chamomile',
      instructions: 'Massage onto dry or slightly damp skin for 45 seconds to break down sunscreen film. Rinse with tepid water.',
      safetyNote: 'Avoid aggressive scrubbing or physical abrasive sponges.',
      ingredientDetails: {
        mechanism: 'Low-friction cleansing preserves cutaneous barrier integrity while ensuring thorough pore clarity.',
        suitability: 'Safe for daily evening use across all Fitzpatrick phototypes.',
      },
    },
    {
      id: 'pm-2',
      number: 'STEP 02',
      category: 'Targeted Treatment',
      title: 'Calming Active Serum (Azelaic Acid 10% / Mild BHA)',
      purpose: 'Targets active acne blemishes, calms facial erythema, and gently unclogs pore channels overnight.',
      suggestedIngredients: 'Azelaic Acid (10%), Zinc PCA (1%), Green Tea (EGCG)',
      instructions: 'Apply a pea-sized amount over areas of visible concern (T-zone and cheeks). Begin 2-3 nights per week to assess tolerance before daily use.',
      safetyNote: 'Avoid immediate contact with eyelids and corners of the lips. Patch test first.',
      ingredientDetails: {
        mechanism: 'Inhibits microcomedone formation and reduces inflammatory mediator cytokines.',
        suitability: 'Clinically verified for sensitive skin prone to both breakouts and redness.',
      },
    },
    {
      id: 'pm-3',
      number: 'STEP 03',
      category: 'Moisturizer',
      title: 'Restorative Overnight Barrier Cream',
      purpose: 'Supports the natural nocturnal skin renewal cycle with intensive lipid nourishment.',
      suggestedIngredients: 'Shea esters, Phytosterols, Multi-Peptides, Madecassoside',
      instructions: 'Warm between fingertips and gently press over face and neck as the final sealing step.',
      safetyNote: 'Prevents transepidermal water loss (TEWL) during air-conditioned sleep.',
      ingredientDetails: {
        mechanism: 'Enhances nighttime lipid synthesis and soothes daytime environmental stressors.',
        suitability: 'Enveloping yet non-comedogenic texture.',
      },
    },
  ];

  const currentSteps = activeTab === 'morning' ? morningSteps : eveningSteps;

  // Calculate daily completion
  const totalSteps = morningSteps.length + eveningSteps.length;
  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / totalSteps) * 100);

  return (
    <div className="w-full space-y-8 animate-fade-in py-2">
      
      {/* =======================================================================
          TOP SECTION: Heading & Personalization Summary
         ======================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#E8E8E1]">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#527665] font-semibold">
            Formulation Protocol
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#252923] font-normal tracking-tight">
            Your Daily Skincare Routine
          </h1>
          <p className="text-xs text-[#777D76] mt-0.5">
            Calibrated for {skinType} skin with a focus on barrier defense and redness calming.
          </p>
        </div>

        {onEditPreferences && (
          <button
            onClick={onEditPreferences}
            className="px-4 py-2 rounded-xl bg-white hover:bg-[#FAF9F6] border border-[#E8E8E1] text-[#252923] text-xs font-mono transition flex items-center gap-1.5 shadow-sm self-start sm:self-center"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#527665]" />
            <span>Edit Preferences</span>
          </button>
        )}
      </div>

      {/* Routine Completion Progress Indicator */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#E8E8E1] space-y-3 shadow-sm">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#527665]" />
            <span className="font-medium text-[#252923]">Today's Routine Completion</span>
          </div>
          <span className="text-[#527665] font-semibold">
            {completedCount} of {totalSteps} steps completed ({progressPercent}%)
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-[#FAF9F6] border border-[#E8E8E1] overflow-hidden">
          <div
            className="h-full bg-[#527665] rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Segmented AM / PM Tabs */}
      <div className="flex rounded-2xl bg-[#FAF9F6] p-1.5 border border-[#E8E8E1] max-w-md mx-auto text-xs font-mono">
        <button
          type="button"
          onClick={() => setActiveTab('morning')}
          className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${
            activeTab === 'morning'
              ? 'bg-white text-[#252923] font-semibold shadow-sm border border-[#E8E8E1]'
              : 'text-[#777D76] hover:text-[#252923]'
          }`}
        >
          <Sun className="w-4 h-4 text-amber-600" />
          <span>Morning Routine (AM)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('evening')}
          className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${
            activeTab === 'evening'
              ? 'bg-white text-[#252923] font-semibold shadow-sm border border-[#E8E8E1]'
              : 'text-[#777D76] hover:text-[#252923]'
          }`}
        >
          <Moon className="w-4 h-4 text-[#304D40]" />
          <span>Evening Routine (PM)</span>
        </button>
      </div>

      {/* Step Cards List */}
      <div className="space-y-4">
        {currentSteps.map((step) => {
          const isDone = completedSteps[step.id];
          const isExpanded = expandedIngredients[step.id];

          return (
            <div
              key={step.id}
              className={`rounded-3xl border p-6 sm:p-7 space-y-4 transition ${
                isDone
                  ? 'bg-white/70 border-[#d6e0ce]'
                  : 'bg-white border-[#E8E8E1] shadow-sm'
              }`}
            >
              {/* Top Row: Step Tag, Category & Completion Checkbox */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#E8EFE9] text-[#304D40] text-[10px] font-mono font-semibold">
                      {step.number}
                    </span>
                    <span className="text-xs font-mono uppercase tracking-wider text-[#777D76]">
                      {step.category}
                    </span>
                  </div>
                  <h3 className={`font-serif text-xl sm:text-2xl text-[#252923] font-normal ${isDone ? 'line-through text-[#777D76]' : ''}`}>
                    {step.title}
                  </h3>
                </div>

                {/* Interactive "Mark as Completed" Checkbox */}
                <button
                  type="button"
                  onClick={() => toggleComplete(step.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition flex items-center gap-2 shrink-0 ${
                    isDone
                      ? 'bg-[#E8EFE9] text-[#304D40] border border-[#d6e0ce]'
                      : 'bg-[#FAF9F6] text-[#777D76] hover:text-[#252923] border border-[#E8E8E1]'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                      isDone
                        ? 'bg-[#527665] border-[#527665] text-white'
                        : 'border-[#E8E8E1] bg-white'
                    }`}
                  >
                    {isDone && <Check className="w-3 h-3" />}
                  </div>
                  <span className="hidden sm:inline">
                    {isDone ? 'Completed' : 'Mark as Done'}
                  </span>
                </button>
              </div>

              {/* Purpose */}
              <p className="text-xs sm:text-sm text-[#777D76] leading-relaxed">
                {step.purpose}
              </p>

              {/* Suggested Ingredient Categories */}
              <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#E8E8E1] space-y-1 text-xs">
                <div className="font-mono text-[#304D40] font-medium flex items-center justify-between">
                  <span>Suggested Ingredient Categories:</span>
                  <button
                    type="button"
                    onClick={() => toggleIngredientExpand(step.id)}
                    className="text-[#527665] hover:underline text-[11px] flex items-center gap-1"
                  >
                    <span>{isExpanded ? 'Hide Details' : 'Scientific Details'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="text-[#252923] font-mono text-xs">
                  {step.suggestedIngredients}
                </div>

                {/* Expandable Scientific Details */}
                {isExpanded && (
                  <div className="pt-2 mt-2 border-t border-[#E8E8E1] space-y-1 text-[11px] text-[#777D76]">
                    <div><strong>Mechanism:</strong> {step.ingredientDetails.mechanism}</div>
                    <div><strong>Barrier Note:</strong> {step.ingredientDetails.suitability}</div>
                  </div>
                )}
              </div>

              {/* Instructions & Safety Note */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                <div className="space-y-1">
                  <span className="font-mono text-[#252923] font-semibold text-[11px]">Instructions for Use:</span>
                  <p className="text-[#777D76] leading-relaxed">{step.instructions}</p>
                </div>
                <div className="space-y-1">
                  <span className="font-mono text-[#b85c3c] font-semibold text-[11px]">Safety & Sensitivity Note:</span>
                  <p className="text-[#777D76] leading-relaxed">{step.safetyNote}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Essential Patch-Test Protocol Box */}
      <div className="p-6 rounded-3xl bg-[#FAF9F6] border border-[#E8E8E1] space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#304D40] font-semibold">
          <ShieldCheck className="w-4 h-4 text-[#527665]" />
          DermaNova Essential Patch-Test Protocol
        </div>
        <p className="text-xs text-[#777D76] leading-relaxed">
          Before applying any newly introduced active ingredient (such as Azelaic Acid, BHA, or Vitamin C) to your face, apply a dime-sized amount to the clean skin behind your ear or inner forearm. Observe for 24 hours. If burning, persistent redness, or pruritus occurs, wash off immediately and discontinue use.
        </p>
      </div>

      {/* Educational Disclaimer Banner */}
      <div className="p-4 rounded-2xl border border-[#E8E8E1] bg-white text-[11px] text-[#777D76] leading-relaxed flex items-start gap-2.5">
        <Info className="w-4 h-4 text-[#527665] shrink-0 mt-0.5" />
        <span>
          <strong>General Guidance Notice:</strong> These routines are educational suggestions designed around non-prescription cosmetic principles and barrier maintenance. They are not pharmaceutical prescriptions or personalized medical diagnoses.
        </span>
      </div>
    </div>
  );
};
