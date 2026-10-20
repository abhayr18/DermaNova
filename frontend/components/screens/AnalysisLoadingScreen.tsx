'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  X,
  Layers,
  Activity,
  Leaf
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
      title: 'Preparing your image',
      desc: 'Checking illumination uniformity, resolution, and facial alignment.',
    },
    {
      title: 'Analyzing visible skin patterns',
      desc: 'Evaluating 8 core concerns: inflammatory erythema, comedones, pigmentation, and pore density.',
    },
    {
      title: 'Preparing your report',
      desc: 'Synthesizing evidence-based ingredient guidance and balanced AM/PM barrier steps.',
    },
  ];

  // Sequential simulated status message transitions
  useEffect(() => {
    const t1 = setTimeout(() => setCurrentStepIndex(1), 1600);
    const t2 = setTimeout(() => setCurrentStepIndex(2), 3400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto space-y-6 animate-fade-in py-8">
      
      <div className="rounded-3xl bg-white border border-[#E8E8E1] p-6 sm:p-10 text-center space-y-8 shadow-sm relative overflow-hidden">
        
        {/* Soft Ambient Glow */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-[#E8EFE9]/60 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-[#EEEAF5]/50 rounded-full blur-3xl pointer-events-none" />

        {/* Thumbnail Preview with Pulsing Subtle Sage Ring */}
        <div className="relative mx-auto w-36 h-36 flex items-center justify-center">
          
          {/* Subtle Sage Breathing Outer Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-[#527665]/20 animate-ping opacity-60" />
          <div className="absolute -inset-2 rounded-full border border-[#527665]/30 animate-pulse" />

          {/* Indeterminate Rotating Border Ring */}
          <div className="absolute -inset-1 rounded-full border-2 border-transparent border-t-[#527665] border-r-[#527665]/60 animate-spin" />

          {/* Centered Thumbnail */}
          <div className="relative w-28 h-28 rounded-full overflow-hidden bg-[#FAF9F6] border-2 border-white shadow-md">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Analyzing Face Thumbnail"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#527665]">
                <Sparkles className="w-8 h-8" />
              </div>
            )}
          </div>
        </div>

        {/* Status Message */}
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8EFE9] text-[#304D40] text-[11px] font-mono font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#527665] animate-pulse" />
            AI Processing in Progress
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#252923] font-normal tracking-tight transition-all duration-300">
            {steps[currentStepIndex].title}
          </h2>
          <p className="text-xs sm:text-sm text-[#777D76] max-w-md mx-auto leading-relaxed transition-all duration-300">
            {steps[currentStepIndex].desc}
          </p>
        </div>

        {/* Multi-step Sequence Visualizer (No fake percentages) */}
        <div className="space-y-3 max-w-sm mx-auto text-left pt-2 border-t border-[#E8E8E1]">
          {steps.map((st, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <div
                key={st.title}
                className={`flex items-center gap-3 text-xs transition-opacity duration-300 ${
                  isCurrent
                    ? 'text-[#252923] font-medium'
                    : isCompleted
                    ? 'text-[#527665]'
                    : 'text-[#777D76]/50'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 text-[10px] font-mono ${
                    isCompleted
                      ? 'border-[#527665] bg-[#527665] text-white'
                      : isCurrent
                      ? 'border-[#527665] bg-[#E8EFE9] text-[#304D40]'
                      : 'border-[#E8E8E1] bg-white text-[#777D76]'
                  }`}
                >
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <span className="truncate">{st.title}</span>
              </div>
            );
          })}
        </div>

        {/* Brief Explanation */}
        <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#E8E8E1] text-[11px] text-[#777D76] leading-relaxed max-w-md mx-auto">
          DermaNova runs multi-task deep visual architectures to locate observable skin features while safeguarding your privacy.
        </div>

        {/* Cancel Action */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2 rounded-xl text-xs font-mono text-[#777D76] hover:text-[#252923] border border-[#E8E8E1] hover:bg-[#FAF9F6] transition"
          >
            Cancel Analysis
          </button>
        </div>
      </div>
    </div>
  );
};
