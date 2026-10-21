'use client';

import React from 'react';
import {
  X,
  ChevronLeft,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Check,
  Info,
  Clock,
  ArrowRight,
  BookOpen,
  AlertTriangle,
  Beaker
} from 'lucide-react';
import { SKIN_CONCERNS_DATA, SkinConcernInfo } from '../../services/skinConcernsData';
import { AnalysisResponse } from '../../services/api';

interface ConcernDetailModalProps {
  concernId: string | null;
  analysis?: AnalysisResponse | null;
  displayImage?: string | null;
  onClose: () => void;
  onNavigateToRoutine: () => void;
}

export const ConcernDetailModal: React.FC<ConcernDetailModalProps> = ({
  concernId,
  analysis,
  displayImage,
  onClose,
  onNavigateToRoutine,
}) => {
  if (!concernId) return null;

  const concern: SkinConcernInfo =
    SKIN_CONCERNS_DATA[concernId] || SKIN_CONCERNS_DATA.acne;

  const liveScore = concernId && analysis?.conditions ? analysis.conditions[concernId] : null;
  const liveProbability = liveScore ? Math.round(liveScore.probability * 100) : null;
  const isDetected = liveScore ? liveScore.is_detected : false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 space-y-5 shadow-2xl">
        
        {/* Top Header & Close Action */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-500 hover:text-slate-900 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Telemetry Overview</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Concern Title & Real Model Observation */}
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-mono font-bold uppercase tracking-wider">
              Biomarker Profile
            </span>
            <span className="text-xs font-mono font-medium text-slate-600">
              {liveProbability !== null
                ? (isDetected
                    ? `Live Assessment: ${liveProbability}% Probability • ${liveScore?.severity_level || 'Detected'}`
                    : `Live Assessment: ${liveProbability}% Probability • Sub-Threshold / Clear`)
                : 'Awaiting Facial Scan Analysis'}
            </span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {concern.name}
          </h2>

          <p className="text-xs text-slate-600 leading-relaxed">
            {concern.fullDesc}
          </p>
        </div>

        {/* Localized Visual Crop / Representation */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-900 flex items-center justify-center">
            {displayImage ? (
              <img
                src={displayImage}
                alt={concern.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Sparkles className="w-7 h-7 text-teal-400" />
            )}
            <div className="absolute inset-0 border border-teal-400/40 rounded-lg pointer-events-none" />
          </div>
          <div className="space-y-1 text-xs">
            <div className="font-mono font-bold text-slate-900">
              Cutaneous Morphology & Optical Profile
            </div>
            <p className="text-slate-500 leading-relaxed text-[11px]">
              Assessed via multi-spectral feature extraction. Manifestation: {concern.shortDesc}. Calibrated for localized formulation targeting without stripping surrounding barrier lipids.
            </p>
          </div>
        </div>

        {/* Evidence-Based Active Ingredients */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-900 font-bold flex items-center gap-1.5">
              <Beaker className="w-3.5 h-3.5 text-teal-600" />
              <span>Evidence-Based Active Ingredients</span>
            </h3>
            <span className="text-[10px] font-mono text-teal-700 font-semibold">
              Formulary Standard
            </span>
          </div>

          <div className="space-y-2">
            {concern.keyIngredients.map((ing, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-white border border-slate-200 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-900">
                    {ing.name}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                    {ing.timing} Protocol
                  </span>
                </div>
                <div className="text-[11px] text-teal-700 font-mono font-medium">
                  {ing.purpose}
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  {ing.mechanism}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Practical At-Home Barrier Guidance */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-900 font-bold">
            Targeted Barrier Recommendations
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
            {concern.practicalTips.map((tip, idx) => (
              <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 border border-slate-150">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-[11px] leading-snug">{tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* When to Consult a Qualified Dermatologist */}
        <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-900">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
            <span>Clinical Escalation Criteria</span>
          </div>
          <ul className="space-y-1 text-[11px] text-amber-800/90 pl-5 list-disc">
            {concern.whenToConsultDermatologist.map((item, idx) => (
              <li key={idx} className="leading-snug">
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-mono font-semibold transition"
          >
            Dismiss
          </button>

          <button
            onClick={() => {
              onClose();
              onNavigateToRoutine();
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-semibold flex items-center justify-center gap-2 transition shadow-xs"
          >
            <span>Generate Targeted Regimen</span>
            <ArrowRight className="w-3.5 h-3.5 text-teal-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
