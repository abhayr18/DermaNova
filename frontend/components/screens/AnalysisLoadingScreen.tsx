'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  X,
  Layers,
  Activity,
  Cpu
} from 'lucide-react';

interface AnalysisLoadingScreenProps {
  imagePreview: string | null;
  onCancel: () => void;
}

export const AnalysisLoadingScreen: React.FC<AnalysisLoadingScreenProps> = ({
  imagePreview,
  onCancel,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const steps = [
    {
      title: 'Biometric Alignment & CIELAB Calibration',
      desc: 'Normalizing illumination delta and identifying 68 anatomical facial anchor points.',
    },
    {
      title: 'Executing Multi-Task Neural Inference',
      desc: 'Evaluating 8 clinical biomarker heads: acne, comedones, erythema, pores, and melanin distribution.',
    },
    {
      title: 'Synthesizing Contraindication-Safe Protocol',
      desc: 'Generating sub-millimeter lesion telemetry and active ingredient pairing rules.',
    },
  ];

  useEffect(() => {
    const t1 = setTimeout(() => setCurrentStepIndex(1), 1600);
    const t2 = setTimeout(() => setCurrentStepIndex(2), 3400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="w-full max-w-lg mx-auto space-y-6 animate-fade-in py-8">
      
      <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 text-center space-y-6 shadow-xs relative overflow-hidden">
        
        {/* Soft Ambient Glow */}
        <div className="absolute top-0 right-1/4 w-60 h-60 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Thumbnail Preview with Pulsing Scanner Ring */}
        <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
          
          {/* Rotating Laser Pulse */}
          <div className="absolute inset-0 rounded-full border border-teal-500/30 animate-ping opacity-50" />
          <div className="absolute -inset-2 rounded-full border border-teal-500/40 animate-pulse" />
          <div className="absolute -inset-1 rounded-full border-2 border-transparent border-t-teal-600 border-r-teal-500 animate-spin" />

          {/* Centered Thumbnail */}
          <div className="relative w-24 h-24 rounded-full overflow-hidden bg-slate-950 border-2 border-white shadow-md">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Analyzing Face Thumbnail"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-teal-400">
                <Cpu className="w-8 h-8" />
              </div>
            )}
          </div>
        </div>

        {/* Status Message */}
        <div className="space-y-1.5 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-mono font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-pulse" />
            <span>Neural Inference Running</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight transition-all duration-300">
            {steps[currentStepIndex].title}
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed transition-all duration-300">
            {steps[currentStepIndex].desc}
          </p>
        </div>

        {/* Step Progression Indicators */}
        <div className="space-y-2 max-w-sm mx-auto text-left pt-2 border-t border-slate-100">
          {steps.map((st, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <div
                key={st.title}
                className={`flex items-center gap-2.5 text-xs transition-opacity duration-300 ${
                  isCurrent
                    ? 'text-slate-900 font-bold'
                    : isCompleted
                    ? 'text-teal-700 font-medium'
                    : 'text-slate-400'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 text-[9px] font-mono ${
                    isCompleted
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : isCurrent
                      ? 'border-teal-600 bg-teal-50 text-teal-800 font-bold'
                      : 'border-slate-200 bg-slate-50 text-slate-400'
                  }`}
                >
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <span className="truncate text-[11px]">{st.title}</span>
              </div>
            );
          })}
        </div>

        {/* Local Processing Tag */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 font-mono leading-normal max-w-sm mx-auto flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Local CPU/GPU Inference • Zero Cloud Image Persistence</span>
        </div>

        {/* Cancel Action */}
        <div className="pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-mono font-semibold text-slate-500 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 transition"
          >
            Cancel Ingestion
          </button>
        </div>
      </div>
    </div>
  );
};
