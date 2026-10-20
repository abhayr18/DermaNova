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
    <div className="rounded-3xl bg-white border border-[#e6e2d8] p-4 sm:p-6 space-y-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-xl bg-[#f4f6f1] border border-[#d6e0ce] text-[#425335]">
            <ArrowLeftRight className="w-4 h-4" />
          </span>
          <div>
            <h4 className="font-serif-luxury text-base text-[#1a2217] tracking-tight flex items-center gap-2">
              Photographic Healing Progression
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-clinical bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold">
                +{afterScore - beforeScore} pts
              </span>
            </h4>
            <p className="text-xs text-[#6b7764]">
              Drag clinical divider to inspect barrier recovery & follicular clearing
            </p>
          </div>
        </div>

        {/* Delta Badges */}
        <div className="flex items-center gap-2 text-xs font-mono-clinical">
          <div className="px-3 py-1.5 rounded-xl bg-[#fbf0eb] border border-[#f3d3c7] text-[#b85c3c]">
            <span className="font-semibold">{beforeDate}: {beforeScore}/100</span>
          </div>
          <span className="text-[#8b9784]">→</span>
          <div className="px-3 py-1.5 rounded-xl bg-[#f4f6f1] border border-[#cbd7c1] text-[#425335]">
            <span className="font-semibold">{afterDate}: {afterScore}/100</span>
          </div>
        </div>
      </div>

      {/* Main Slider Canvas */}
      <div
        ref={containerRef}
        className="relative w-full h-72 sm:h-96 rounded-2xl overflow-hidden select-none cursor-ew-resize border border-[#e6e2d8] shadow-inner group"
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
        <div className="absolute top-3 right-3 z-10 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-emerald-200 text-[11px] font-mono-clinical font-semibold text-emerald-700 shadow-sm">
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
          <div className="absolute top-3 left-3 z-10 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-[#f3d3c7] text-[11px] font-mono-clinical font-semibold text-[#b85c3c] shadow-sm">
            {beforeLabel} ({beforeScore}/100)
          </div>
        </div>

        {/* DRAGGABLE VERTICAL DIVIDER LINE */}
        <div
          className="absolute top-0 bottom-0 z-20 pointer-events-none"
          style={{ left: `${sliderPos}%` }}
        >
          {/* Vertical Glowing Line */}
          <div className="absolute top-0 bottom-0 -ml-[1px] w-[2px] bg-gradient-to-b from-[#637852] via-white to-[#637852] shadow-[0_0_12px_rgba(99,120,82,0.6)]" />

          {/* Centered Circular Handle */}
          <div className="absolute top-1/2 -mt-5 -ml-5 w-10 h-10 rounded-full bg-white border-2 border-[#1c2417] text-[#1c2417] shadow-xl flex items-center justify-center pointer-events-auto cursor-grab active:cursor-grabbing backdrop-blur-md transition-transform group-hover:scale-110">
            <ArrowLeftRight className="w-4 h-4 text-[#1c2417]" />
          </div>
        </div>

        {/* Micro Hint at bottom */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 px-3.5 py-1 rounded-full bg-white/90 backdrop-blur-md border border-[#e6e2d8] text-[10px] text-[#556050] font-mono-clinical pointer-events-none shadow-sm">
          Drag horizontally to compare
        </div>
      </div>

      {/* Clinical Biomarker Progression Indicators */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center pt-1">
        <div className="p-3 rounded-2xl bg-[#faf9f5] border border-[#e6e2d8]">
          <div className="text-[10px] font-mono-clinical uppercase text-[#6b7764] tracking-wider font-semibold">Acne Clearance</div>
          <div className="text-sm font-semibold text-emerald-700 mt-1 font-mono-clinical">-68% Papules</div>
        </div>
        <div className="p-3 rounded-2xl bg-[#faf9f5] border border-[#e6e2d8]">
          <div className="text-[10px] font-mono-clinical uppercase text-[#6b7764] tracking-wider font-semibold">Barrier Moisture</div>
          <div className="text-sm font-semibold text-[#425335] mt-1 font-mono-clinical">+42% Hydration</div>
        </div>
        <div className="p-3 rounded-2xl bg-[#faf9f5] border border-[#e6e2d8]">
          <div className="text-[10px] font-mono-clinical uppercase text-[#6b7764] tracking-wider font-semibold">Erythema Calm</div>
          <div className="text-sm font-semibold text-emerald-700 mt-1 font-mono-clinical">-55% Redness</div>
        </div>
      </div>
    </div>
  );
};
