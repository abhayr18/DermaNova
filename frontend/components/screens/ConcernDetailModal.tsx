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
  AlertTriangle
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl border border-[#E8E8E1] p-6 sm:p-8 space-y-6 shadow-2xl">
        
        {/* Top Header & Close Action */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E8E8E1]">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-mono text-[#777D76] hover:text-[#252923] transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Full Report</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#FAF9F6] text-[#777D76] hover:text-[#252923] transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Concern Title & Real Model Observation */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#E8EFE9] text-[#304D40] text-[11px] font-mono font-medium">
              Clinical Concern Profile
            </span>
            <span className="text-xs font-mono text-[#777D76]">
              {liveProbability !== null
                ? (isDetected
                    ? `Live scan finding: ${liveProbability}% probability (${liveScore?.severity_level || 'Detected'})`
                    : `Live scan finding: ${liveProbability}% probability (Clear / Sub-threshold)`)
                : 'Awaiting facial scan analysis'}
            </span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl text-[#252923] font-normal tracking-tight">
            {concern.name}
          </h2>

          <p className="text-xs sm:text-sm text-[#777D76] leading-relaxed">
            {concern.fullDesc}
          </p>
        </div>

        {/* Localized Visual Crop / Representation */}
        <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E8E8E1] flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-28 h-28 rounded-xl overflow-hidden border border-[#E8E8E1] shrink-0 bg-white flex items-center justify-center">
            {displayImage ? (
              <img
                src={displayImage}
                alt={concern.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Sparkles className="w-8 h-8 text-[#527665]" />
            )}
            <div className="absolute inset-0 border-2 border-[#527665]/40 rounded-xl pointer-events-none" />
          </div>
          <div className="space-y-1 text-xs">
            <div className="font-mono font-semibold text-[#252923]">
              Diagnostic Observation & Morphology
            </div>
            <p className="text-[#777D76] leading-relaxed">
              Assessed via multi-spectral optical feature extraction. Observed manifestation: {concern.shortDesc}. Visual evaluation supports triage and routine calibration; it is not an in-person histological diagnosis.
            </p>
          </div>
        </div>

        {/* Contributing Factors */}
        <div className="space-y-3">
          <h3 className="font-serif text-lg text-[#252923] font-normal">
            Common Contributing Factors
          </h3>
          <ul className="space-y-2 text-xs text-[#777D76]">
            {concern.contributingFactors.map((factor, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#527665] shrink-0 mt-1.5" />
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Ingredient Education (Clinical Actives) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg text-[#252923] font-normal">
              Evidence-Based Active Ingredients
            </h3>
            <span className="text-[11px] font-mono text-[#527665]">
              Formulary standard
            </span>
          </div>

          <div className="space-y-2.5">
            {concern.keyIngredients.map((ing, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-white border border-[#E8E8E1] space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-[#252923]">
                    {ing.name}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FAF9F6] text-[#777D76] border border-[#E8E8E1]">
                    {ing.timing} Application
                  </span>
                </div>
                <div className="text-[11px] text-[#527665] font-mono">
                  {ing.purpose}
                </div>
                <p className="text-[11px] text-[#777D76] leading-relaxed">
                  {ing.mechanism}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Practical At-Home Skincare Tips */}
        <div className="space-y-3">
          <h3 className="font-serif text-lg text-[#252923] font-normal">
            Practical Barrier Guidance
          </h3>
          <div className="space-y-2 text-xs text-[#777D76]">
            {concern.practicalTips.map((tip, idx) => (
              <div key={idx} className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#527665] shrink-0 mt-0.5" />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* When to Consult a Qualified Dermatologist */}
        <div className="p-4 rounded-2xl bg-[#fffaf5] border border-[#fce8d5] space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#b85c3c]">
            <AlertTriangle className="w-4 h-4 text-[#b85c3c]" />
            <span>When to Consult a Qualified Dermatologist</span>
          </div>
          <ul className="space-y-1.5 text-xs text-[#777D76] pl-6 list-disc">
            {concern.whenToConsultDermatologist.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#E8E8E1]">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#E8E8E1] text-[#777D76] hover:text-[#252923] text-xs font-mono transition"
          >
            Back to Report
          </button>

          <button
            onClick={() => {
              onClose();
              onNavigateToRoutine();
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#304D40] hover:bg-[#253d33] text-white text-xs font-mono font-medium flex items-center justify-center gap-2 transition shadow-sm"
          >
            <span>View Routine with Recommended Actives</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
