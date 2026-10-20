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
  FileText,
  Camera
} from 'lucide-react';
import { RecommendationResponse } from '../../services/api';

interface PersonalizedRoutineScreenProps {
  recommendations: RecommendationResponse | null;
  skinType?: string;
  onEditPreferences?: () => void;
  onStartScan?: () => void;
}

export const PersonalizedRoutineScreen: React.FC<PersonalizedRoutineScreenProps> = ({
  recommendations,
  skinType = 'Combination',
  onEditPreferences,
  onStartScan,
}) => {
  const [activeTab, setActiveTab] = useState<'morning' | 'evening'>('morning');
  const [expandedIngredients, setExpandedIngredients] = useState<Record<string, boolean>>({});
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

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

  if (!recommendations || (!recommendations.daily_routine?.morning_routine?.length && !recommendations.daily_routine?.evening_routine?.length)) {
    return (
      <div className="w-full space-y-8 animate-fade-in py-8">
        <div className="rounded-3xl border border-[#E8E8E1] bg-white p-8 sm:p-12 text-center max-w-xl mx-auto space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-[#E8EFE9] text-[#304D40] flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8 text-[#527665]" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#252923]">
            No Routine Protocol Calibrated
          </h2>
          <p className="text-xs sm:text-sm text-[#777D76] leading-relaxed">
            Your personalized morning and evening skincare regimens are formulated directly from clinical AI analysis of your facial scans. Please complete a scan first to generate your custom regimen.
          </p>
          {onStartScan && (
            <button
              onClick={onStartScan}
              className="mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#527665] hover:bg-[#304D40] text-white text-xs font-mono tracking-wider uppercase font-semibold transition shadow-sm"
            >
              <Camera className="w-4 h-4" />
              <span>Start Skin Analysis Scan</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  const morningSteps = (recommendations.daily_routine?.morning_routine || []).map((step, idx) => ({
    id: `am-${idx + 1}`,
    number: `STEP 0${step.step_number || idx + 1}`,
    category: step.product_category || 'Treatment',
    title: step.product_name || step.step_name,
    purpose: step.recommended_action,
    suggestedIngredients: step.key_actives || 'Targeted active formulation',
    instructions: step.recommended_action,
    safetyNote: `Recommended application frequency: ${step.frequency || 'Daily in the morning'}`,
    ingredientDetails: {
      mechanism: recommendations.primary_active_ingredients?.[idx]?.mechanism_of_action || 'Supports cellular epidermal integrity and moisture retention.',
      suitability: recommendations.primary_active_ingredients?.[idx]?.barrier_support_pairing || `Calibrated for ${skinType} cutaneous baseline.`,
    },
  }));

  const eveningSteps = (recommendations.daily_routine?.evening_routine || []).map((step, idx) => ({
    id: `pm-${idx + 1}`,
    number: `STEP 0${step.step_number || idx + 1}`,
    category: step.product_category || 'Treatment',
    title: step.product_name || step.step_name,
    purpose: step.recommended_action,
    suggestedIngredients: step.key_actives || 'Restorative active formulation',
    instructions: step.recommended_action,
    safetyNote: `Recommended application frequency: ${step.frequency || 'Nightly before sleep'}`,
    ingredientDetails: {
      mechanism: recommendations.primary_active_ingredients?.[idx]?.mechanism_of_action || 'Facilitates nocturnal cellular regeneration and barrier replenishment.',
      suitability: recommendations.primary_active_ingredients?.[idx]?.precaution || 'Patch test before first application.',
    },
  }));

  const currentSteps = activeTab === 'morning' ? morningSteps : eveningSteps;
  const totalSteps = morningSteps.length + eveningSteps.length;
  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

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
            Calibrated for {skinType} skin based on your latest clinical AI scan results.
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

      {/* Contraindications Notification if any */}
      {recommendations.contraindications_avoided && recommendations.contraindications_avoided.length > 0 && (
        <div className="p-4 rounded-2xl bg-[#FFFBF0] border border-[#FDE68A] text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
          <div>
            <div className="font-mono text-[#92400E] font-semibold">
              Contraindications Filtered for Your Skin Profile
            </div>
            <p className="text-[#78350F] text-[11px] mt-0.5">
              The formulation engine excluded potentially sensitizing ingredients: {recommendations.contraindications_avoided.join(', ')}.
            </p>
          </div>
        </div>
      )}

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
          <span>Morning Routine (AM) ({morningSteps.length})</span>
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
          <span>Evening Routine (PM) ({eveningSteps.length})</span>
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
                  <span>Suggested Actives & Formulation:</span>
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
                    <div><strong>Barrier Pairing:</strong> {step.ingredientDetails.suitability}</div>
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
                  <span className="font-mono text-[#527665] font-semibold text-[11px]">Application Protocol:</span>
                  <p className="text-[#777D76] leading-relaxed">{step.safetyNote}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dynamic Essential Barrier Protocol from API */}
      {recommendations.barrier_health_tips && recommendations.barrier_health_tips.length > 0 && (
        <div className="p-6 rounded-3xl bg-[#FAF9F6] border border-[#E8E8E1] space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#304D40] font-semibold">
            <ShieldCheck className="w-4 h-4 text-[#527665]" />
            DermaNova Clinical Barrier Protocol
          </div>
          <ul className="text-xs text-[#777D76] leading-relaxed space-y-2 list-disc list-inside">
            {recommendations.barrier_health_tips.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

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
