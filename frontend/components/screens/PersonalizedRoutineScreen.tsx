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
  Camera,
  CheckCircle2,
  Clock,
  Beaker
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
      <div className="w-full space-y-6 animate-fade-in py-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 text-center max-w-lg mx-auto space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center mx-auto">
            <FileText className="w-7 h-7" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            No Active Formulation Protocol
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Personalized AM/PM regimens are synthesized directly from neural analysis of your facial scans and local SQLite profile constraints.
          </p>
          {onStartScan && (
            <button
              onClick={onStartScan}
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-semibold transition shadow-xs"
            >
              <Camera className="w-4 h-4 text-teal-400" />
              <span>Initialize Diagnostic Scan</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  const morningSteps = (recommendations.daily_routine?.morning_routine || []).map((step, idx) => ({
    id: `am-${idx + 1}`,
    number: `0${step.step_number || idx + 1}`,
    category: step.product_category || 'Treatment',
    title: step.product_name || step.step_name,
    purpose: step.recommended_action,
    suggestedIngredients: step.key_actives || 'Targeted active formulation',
    instructions: step.recommended_action,
    safetyNote: `Recommended application: ${step.frequency || 'Daily in the morning'}`,
    ingredientDetails: {
      mechanism: recommendations.primary_active_ingredients?.[idx]?.mechanism_of_action || 'Supports cellular epidermal integrity and moisture retention.',
      suitability: recommendations.primary_active_ingredients?.[idx]?.barrier_support_pairing || `Calibrated for ${skinType} cutaneous baseline.`,
    },
  }));

  const eveningSteps = (recommendations.daily_routine?.evening_routine || []).map((step, idx) => ({
    id: `pm-${idx + 1}`,
    number: `0${step.step_number || idx + 1}`,
    category: step.product_category || 'Treatment',
    title: step.product_name || step.step_name,
    purpose: step.recommended_action,
    suggestedIngredients: step.key_actives || 'Restorative active formulation',
    instructions: step.recommended_action,
    safetyNote: `Recommended application: ${step.frequency || 'Nightly before sleep'}`,
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
    <div className="w-full space-y-6 animate-fade-in py-2">
      
      {/* Top Clinical Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-mono font-bold uppercase tracking-wider">
              Formulary Engine
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              Calibrated for {skinType} Baseline
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Prescribed Daily Protocol
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Sequential AM/PM active layers synthesized to address detected biomarkers with zero-contraindication guarantees.
          </p>
        </div>

        {onEditPreferences && (
          <button
            onClick={onEditPreferences}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-mono font-semibold transition flex items-center gap-1.5 shadow-xs self-start sm:self-center"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-teal-600" />
            <span>Preferences</span>
          </button>
        )}
      </div>

      {/* Contraindications Notification if any */}
      {recommendations.contraindications_avoided && recommendations.contraindications_avoided.length > 0 && (
        <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <div className="font-mono text-amber-900 font-bold">
              Contraindications Filtered by Safety Guardrails
            </div>
            <p className="text-amber-800/90 text-[11px] mt-0.5 leading-snug">
              Excluded potentially conflicting actives: {recommendations.contraindications_avoided.join(', ')}.
            </p>
          </div>
        </div>
      )}

      {/* Routine Completion Progress Indicator */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2.5 shadow-xs">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span className="font-bold text-slate-900">Today's Protocol Adherence</span>
          </div>
          <span className="text-teal-700 font-bold">
            {completedCount} of {totalSteps} steps completed ({progressPercent}%)
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-teal-600 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Segmented AM / PM Tabs */}
      <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 max-w-md mx-auto text-xs font-mono">
        <button
          type="button"
          onClick={() => setActiveTab('morning')}
          className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-2 ${
            activeTab === 'morning'
              ? 'bg-white text-slate-900 font-bold shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Sun className="w-3.5 h-3.5 text-amber-500" />
          <span>Morning Protocol ({morningSteps.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('evening')}
          className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-2 ${
            activeTab === 'evening'
              ? 'bg-white text-slate-900 font-bold shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Moon className="w-3.5 h-3.5 text-indigo-500" />
          <span>Evening Protocol ({eveningSteps.length})</span>
        </button>
      </div>

      {/* Step Cards List */}
      <div className="space-y-3">
        {currentSteps.map((step) => {
          const isDone = completedSteps[step.id];
          const isExpanded = expandedIngredients[step.id];

          return (
            <div
              key={step.id}
              className={`rounded-xl border p-4 sm:p-5 space-y-3 transition ${
                isDone
                  ? 'bg-slate-50 border-emerald-200 opacity-90'
                  : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              {/* Top Row: Step Tag, Category & Completion Checkbox */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white text-[10px] font-mono font-bold">
                      STEP {step.number}
                    </span>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-teal-700 font-semibold">
                      {step.category}
                    </span>
                  </div>
                  <h3 className={`text-base font-bold text-slate-900 ${isDone ? 'line-through text-slate-400' : ''}`}>
                    {step.title}
                  </h3>
                </div>

                {/* Mark as Completed Button */}
                <button
                  type="button"
                  onClick={() => toggleComplete(step.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition flex items-center gap-1.5 shrink-0 ${
                    isDone
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                      isDone
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isDone && <Check className="w-2.5 h-2.5" />}
                  </div>
                  <span className="text-[11px]">
                    {isDone ? 'Done' : 'Mark Complete'}
                  </span>
                </button>
              </div>

              {/* Purpose */}
              <p className="text-xs text-slate-600 leading-normal">
                {step.purpose}
              </p>

              {/* Suggested Ingredient Actives */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1 text-xs">
                <div className="font-mono text-slate-800 font-semibold flex items-center justify-between text-[11px]">
                  <span>Active Biochemical Matrix:</span>
                  <button
                    type="button"
                    onClick={() => toggleIngredientExpand(step.id)}
                    className="text-teal-700 hover:underline text-[10px] flex items-center gap-0.5"
                  >
                    <span>{isExpanded ? 'Hide Details' : 'View Pharmacodynamics'}</span>
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>
                <div className="text-slate-900 font-mono text-xs font-medium">
                  {step.suggestedIngredients}
                </div>

                {/* Expandable Scientific Details */}
                {isExpanded && (
                  <div className="pt-2 mt-2 border-t border-slate-200 space-y-1 text-[11px] text-slate-600">
                    <div><strong>Action Mechanism:</strong> {step.ingredientDetails.mechanism}</div>
                    <div><strong>Lipid Pairing:</strong> {step.ingredientDetails.suitability}</div>
                  </div>
                )}
              </div>

              {/* Application Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5 text-xs">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-150">
                  <span className="font-mono text-slate-700 font-bold text-[10px] uppercase block">Usage Instructions</span>
                  <p className="text-slate-600 text-[11px] mt-0.5">{step.instructions}</p>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-150">
                  <span className="font-mono text-teal-800 font-bold text-[10px] uppercase block">Safety / Frequency</span>
                  <p className="text-slate-600 text-[11px] mt-0.5">{step.safetyNote}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dynamic Essential Barrier Protocol */}
      {recommendations.barrier_health_tips && recommendations.barrier_health_tips.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 space-y-2.5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-900 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Essential Cutaneous Barrier Protocol</span>
          </div>
          <ul className="text-xs text-slate-600 leading-normal space-y-1.5 list-disc list-inside">
            {recommendations.barrier_health_tips.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Educational Notice */}
      <div className="p-3.5 rounded-xl border border-slate-200 bg-white text-[11px] text-slate-500 leading-normal flex items-start gap-2 shadow-xs">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <span>
          <strong>Notice:</strong> Regimens are synthesized according to cosmetic dermatological safety thresholds. For prescription acne retinoids or persistent eczema flares, consult a board-certified physician.
        </span>
      </div>
    </div>
  );
};
