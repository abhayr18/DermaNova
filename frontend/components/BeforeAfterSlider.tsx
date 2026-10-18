'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Sparkles, Sliders, Eye, Flame, ShieldAlert, ArrowLeftRight } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeImage?: string;
  afterImage?: string;
  beforeLabel?: string;
  afterLabel?: string;
  beforeScore?: number;
  afterScore?: number;
  beforeDate?: string;
  afterDate?: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage = 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80',
  afterImage = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
  beforeLabel = 'Baseline (Week 0)',
  afterLabel = 'Current (Week 4)',
  beforeScore = 58,
  afterScore = 86,
  beforeDate = 'Day 1',
  afterDate = 'Day 28'
}) => {
  const [sliderPos, setSliderPos] = useState<number>(50); // percentage 0 - 100
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const clampedPct = Math.min(Math.max((x / rect.width) * 100, 0), 100);
    setSliderPos(clampedPct);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  return (
    <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4 sm:p-6 space-y-4 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400">
            <ArrowLeftRight className="w-4 h-4" />
          </span>
          <div>
            <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              Interactive Healing Comparison
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                +{afterScore - beforeScore} pts
              </span>
            </h4>
            <p className="text-xs text-slate-400">
              Drag the clinical divider to inspect follicular clearance and barrier restoration
            </p>
          </div>
        </div>

        {/* Delta Badges */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400">
            <span className="text-rose-400 font-semibold">{beforeDate}: {beforeScore}/100</span>
          </div>
          <span className="text-slate-600">→</span>
          <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-brand-500/30 text-slate-300">
            <span className="text-emerald-400 font-bold">{afterDate}: {afterScore}/100</span>
          </div>
        </div>
      </div>

      {/* Main Slider Canvas */}
      <div
        ref={containerRef}
        className="relative w-full h-72 sm:h-96 rounded-xl overflow-hidden select-none cursor-ew-resize border border-slate-800 shadow-inner group"
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={handleMouseMove}
        onTouchStart={() => setIsDragging(true)}
        onTouchEnd={() => setIsDragging(false)}
        onTouchMove={handleTouchMove}
      >
        {/* RIGHT IMAGE (AFTER / HEALED) */}
        <img
          src={afterImage}
          alt="After treatment"
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
        />
        <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md border border-emerald-500/30 text-[11px] font-bold text-emerald-400 shadow">
          {afterLabel} ({afterScore}/100)
        </div>

        {/* LEFT IMAGE (BEFORE / BASELINE) - CLIPPED */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none transition-all duration-75"
          style={{ width: `${sliderPos}%` }}
        >
          <img
            src={beforeImage}
            alt="Before treatment"
            className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
            style={{ width: containerRef.current?.offsetWidth || '100%', maxWidth: 'none' }}
          />
          <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md border border-rose-500/30 text-[11px] font-bold text-rose-400 shadow">
            {beforeLabel} ({beforeScore}/100)
          </div>
        </div>

        {/* DRAGGABLE VERTICAL DIVIDER LINE */}
        <div
          className="absolute top-0 bottom-0 z-20 pointer-events-none"
          style={{ left: `${sliderPos}%` }}
        >
          {/* Vertical Glowing Line */}
          <div className="absolute top-0 bottom-0 -ml-[1px] w-[2px] bg-gradient-to-b from-brand-400 via-white to-brand-400 shadow-[0_0_10px_rgba(20,184,166,0.8)]" />

          {/* Centered Circular Handle */}
          <div className="absolute top-1/2 -mt-5 -ml-5 w-10 h-10 rounded-full bg-slate-950/90 border-2 border-brand-400 text-brand-300 shadow-2xl flex items-center justify-center pointer-events-auto cursor-grab active:cursor-grabbing backdrop-blur-md transition-transform group-hover:scale-110">
            <ArrowLeftRight className="w-4 h-4 text-brand-300 animate-pulse" />
          </div>
        </div>

        {/* Micro Hint at bottom */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 px-3 py-1 rounded-full bg-slate-950/70 backdrop-blur-md border border-slate-700/60 text-[10px] text-slate-300 pointer-events-none">
          Drag horizontally to compare
        </div>
      </div>

      {/* Clinical Biomarker Progression Indicators */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center pt-1">
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="text-[10px] font-mono uppercase text-slate-400">Inflammatory Acne</div>
          <div className="text-sm font-bold text-emerald-400 mt-0.5">-68% Clearance</div>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="text-[10px] font-mono uppercase text-slate-400">Barrier Lipid Index</div>
          <div className="text-sm font-bold text-brand-400 mt-0.5">+42% Hydration</div>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="text-[10px] font-mono uppercase text-slate-400">Erythema Variance</div>
          <div className="text-sm font-bold text-emerald-400 mt-0.5">-55% Calm</div>
        </div>
      </div>
    </div>
  );
};
