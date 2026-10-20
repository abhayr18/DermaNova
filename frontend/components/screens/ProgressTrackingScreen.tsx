'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Sparkles,
  Sliders,
  CheckCircle2,
  ChevronRight,
  Plus,
  MessageSquare,
  Info,
  ShieldCheck,
  Columns,
  Layers,
  ArrowRight
} from 'lucide-react';

interface JournalNote {
  id: string;
  date: string;
  text: string;
  barrierFeeling: 'Calm' | 'Hydrated' | 'Slightly Reactive';
}

export const ProgressTrackingScreen: React.FC = () => {
  const [comparisonMode, setComparisonMode] = useState<'slider' | 'side-by-side'>('slider');
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  // Journal notes state
  const [notes, setNotes] = useState<JournalNote[]>([
    {
      id: 'note-1',
      date: 'October 18, 2026',
      text: 'Skin feels noticeably calmer around cheekbones after 3 weeks of daily Azelaic Acid 10%. Morning redness has decreased significantly.',
      barrierFeeling: 'Calm',
    },
    {
      id: 'note-2',
      date: 'October 04, 2026',
      text: 'Began applying barrier moisturizer directly to damp skin. Peeling near the nostrils stopped.',
      barrierFeeling: 'Hydrated',
    },
  ]);
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteFeeling, setNewNoteFeeling] = useState<'Calm' | 'Hydrated' | 'Slightly Reactive'>('Calm');

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const newEntry: JournalNote = {
      id: `note-${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      text: newNoteText.trim(),
      barrierFeeling: newNoteFeeling,
    };

    setNotes([newEntry, ...notes]);
    setNewNoteText('');
  };

  const handleSliderMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const container = e.currentTarget.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const offset = clientX - container.left;
    const percentage = Math.max(0, Math.min(100, (offset / container.width) * 100));
    setSliderPosition(percentage);
  };

  const pastScans = [
    {
      id: 'scan-3',
      date: 'October 18, 2026',
      phase: 'Follow-up (Week 4)',
      summary: 'Erythema fading, pore walls stabilized, no new inflamed papules.',
      score: 84,
      image: '/skin_progress_comparison.jpg',
    },
    {
      id: 'scan-2',
      date: 'October 04, 2026',
      phase: 'Follow-up (Week 2)',
      summary: 'Microcomedones softening with BHA; barrier hydration improved.',
      score: 79,
      image: '/editorial_skin_portrait.jpg',
    },
    {
      id: 'scan-1',
      date: 'September 20, 2026',
      phase: 'Baseline Assessment (Week 0)',
      summary: 'Initial analysis: moderate erythema and localized inflammatory blemishes.',
      score: 71,
      image: '/demo_face.jpg',
    },
  ];

  return (
    <div className="w-full space-y-8 animate-fade-in py-2">
      
      {/* =======================================================================
          TOP SECTION: Heading & Longitudinal Journal Overview
         ======================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#E8E8E1]">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#527665] font-semibold">
            Longitudinal Skin Journal
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#252923] font-normal tracking-tight">
            Progress Tracking & Scan History
          </h1>
          <p className="text-xs text-[#777D76] mt-0.5">
            Evaluate barrier evolution under uniform lighting across clinical check-ins.
          </p>
        </div>

        {/* Comparison Mode Toggle */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#FAF9F6] border border-[#E8E8E1] text-xs font-mono self-start sm:self-center">
          <button
            onClick={() => setComparisonMode('slider')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              comparisonMode === 'slider'
                ? 'bg-white text-[#252923] font-semibold shadow-xs border border-[#E8E8E1]'
                : 'text-[#777D76] hover:text-[#252923]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-[#527665]" />
            <span>Slider Mode</span>
          </button>

          <button
            onClick={() => setComparisonMode('side-by-side')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              comparisonMode === 'side-by-side'
                ? 'bg-white text-[#252923] font-semibold shadow-xs border border-[#E8E8E1]'
                : 'text-[#777D76] hover:text-[#252923]'
            }`}
          >
            <Columns className="w-3.5 h-3.5 text-[#527665]" />
            <span>Side by Side</span>
          </button>
        </div>
      </div>

      {/* =======================================================================
          BEFORE-AND-AFTER PHOTO COMPARISON
         ======================================================================= */}
      <div className="rounded-3xl bg-white border border-[#E8E8E1] p-6 sm:p-8 space-y-6 shadow-sm">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#527665] font-semibold">
              Visual Comparison
            </span>
            <h2 className="font-serif text-xl sm:text-2xl text-[#252923] font-normal">
              Baseline (Week 0) vs. Latest Check-in (Week 4)
            </h2>
          </div>
          <span className="text-xs font-mono text-[#777D76]">
            {comparisonMode === 'slider' ? 'Drag slider left/right to compare' : 'Synchronized dual view'}
          </span>
        </div>

        {/* COMPARISON VIEWPORT */}
        {comparisonMode === 'slider' ? (
          <div
            onClick={(e) => handleSliderMove(e)}
            onMouseMove={(e) => isDragging && handleSliderMove(e)}
            onTouchMove={(e) => isDragging && handleSliderMove(e)}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setIsDragging(false)}
            style={{ touchAction: 'none' }}
            className="relative w-full aspect-[4/3] sm:aspect-[16/9] max-h-[480px] rounded-2xl overflow-hidden cursor-ew-resize select-none border border-[#E8E8E1] bg-[#FAF9F6]"
          >
            {/* After Image (Full width background) */}
            <img
              src="/skin_progress_comparison.jpg"
              alt="Week 4 Follow up"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4 px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-[#E8E8E1] text-[11px] font-mono text-[#304D40] shadow-sm">
              Week 4 (Current)
            </div>

            {/* Before Image (Clipped by slider percentage) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${sliderPosition}%` }}
            >
              <img
                src="/editorial_skin_portrait.jpg"
                alt="Baseline Week 0"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ width: '100%', maxWidth: 'none' }}
              />
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-[#E8E8E1] text-[11px] font-mono text-[#777D76] shadow-sm">
                Baseline (Week 0)
              </div>
            </div>

            {/* Drag Handle Divider */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-xl pointer-events-none"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white border border-[#E8E8E1] text-[#252923] flex items-center justify-center shadow-lg">
                <Sliders className="w-4 h-4 text-[#527665]" />
              </div>
            </div>
          </div>
        ) : (
          /* Side by Side Mode */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-[#E8E8E1]">
                <img
                  src="/editorial_skin_portrait.jpg"
                  alt="Baseline Week 0"
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-white/95 border border-[#E8E8E1] text-[11px] font-mono text-[#777D76]">
                  Baseline (Week 0)
                </span>
              </div>
              <p className="text-[11px] text-[#777D76] font-mono">
                Initial Scan: Erythema across cheeks and T-zone pore expansion.
              </p>
            </div>

            <div className="space-y-2">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-[#E8E8E1]">
                <img
                  src="/skin_progress_comparison.jpg"
                  alt="Week 4 Follow up"
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 right-3 px-3 py-1 rounded-xl bg-white/95 border border-[#E8E8E1] text-[11px] font-mono text-[#304D40]">
                  Week 4 (Current)
                </span>
              </div>
              <p className="text-[11px] text-[#777D76] font-mono">
                Week 4: Superficial erythema softened; surface lipid balance stabilized.
              </p>
            </div>
          </div>
        )}

        {/* Observation Accuracy Disclaimer */}
        <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#E8E8E1] text-[11px] text-[#777D76] leading-relaxed flex items-start gap-2">
          <Info className="w-4 h-4 text-[#527665] shrink-0 mt-0.5" />
          <span>
            <strong>Lighting & Angle Notice:</strong> Apparent skin texture and tone are sensitive to ambient illuminance, color temperature, camera sensor variations, and angle. Ensure follow-up photos are taken under identical lighting for meaningful comparisons. We do not generate fabricated "percentage improvement" claims.
          </span>
        </div>
      </div>

      {/* =======================================================================
          WEEKLY ADHERENCE & USER NOTES JOURNAL
         ======================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Routine Adherence History */}
        <div className="lg:col-span-5 rounded-3xl bg-white border border-[#E8E8E1] p-6 sm:p-7 space-y-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E8E1]">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#527665] font-semibold">
                Consistency Tracker
              </span>
              <h3 className="font-serif text-xl text-[#252923] font-normal">
                Routine Adherence
              </h3>
            </div>
            <span className="text-xs font-mono text-[#527665] font-semibold">
              92% Weekly
            </span>
          </div>

          {/* 7-Day Calendar Streak */}
          <div className="space-y-2">
            <span className="text-xs font-mono text-[#777D76]">Past 7 Days Consistency:</span>
            <div className="grid grid-cols-7 gap-1.5 text-center">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
                const isComplete = idx < 6;
                return (
                  <div
                    key={day}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 ${
                      isComplete
                        ? 'bg-[#E8EFE9] border-[#d6e0ce] text-[#304D40]'
                        : 'bg-[#FAF9F6] border-[#E8E8E1] text-[#777D76]'
                    }`}
                  >
                    <span className="text-[9px] font-mono">{day}</span>
                    <span className="text-xs font-bold">{isComplete ? '✓' : '•'}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Adherence Insight */}
          <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#E8E8E1] text-xs text-[#777D76] space-y-1">
            <div className="font-mono text-[#252923] font-medium">Streak: 14 Consecutive Days</div>
            <p className="text-[11px] leading-relaxed">
              Consistently completing AM SPF and PM cleansing gives active ingredients the sustained window required for visible barrier repair.
            </p>
          </div>
        </div>

        {/* Right Column: User Reflection Diary / Notes */}
        <div className="lg:col-span-7 rounded-3xl bg-white border border-[#E8E8E1] p-6 sm:p-7 space-y-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E8E1]">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#527665] font-semibold">
                Personal Diary
              </span>
              <h3 className="font-serif text-xl text-[#252923] font-normal">
                Skin Barrier Reflections
              </h3>
            </div>
            <span className="text-xs font-mono text-[#777D76]">
              {notes.length} saved entries
            </span>
          </div>

          {/* New Note Form */}
          <form onSubmit={handleAddNote} className="space-y-3">
            <textarea
              rows={2}
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="Record any skin observations (e.g. comfort, new spot active reaction, weather changes)..."
              className="w-full p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#E8E8E1] text-xs text-[#252923] focus:outline-none focus:border-[#527665] focus:bg-white transition"
            />
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-xs font-mono">
                <span className="text-[#777D76] text-[11px]">Barrier Feeling:</span>
                {(['Calm', 'Hydrated', 'Slightly Reactive'] as const).map((feel) => (
                  <button
                    key={feel}
                    type="button"
                    onClick={() => setNewNoteFeeling(feel)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] transition ${
                      newNoteFeeling === feel
                        ? 'bg-[#304D40] text-white'
                        : 'bg-[#FAF9F6] border border-[#E8E8E1] text-[#777D76]'
                    }`}
                  >
                    {feel}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={!newNoteText.trim()}
                className="px-4 py-2 rounded-xl bg-[#527665] hover:bg-[#436153] disabled:opacity-50 text-white text-xs font-mono transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save Note</span>
              </button>
            </div>
          </form>

          {/* Notes List */}
          <div className="space-y-3 pt-2">
            {notes.map((note) => (
              <div
                key={note.id}
                className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E8E8E1] space-y-1.5"
              >
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#252923] font-medium">{note.date}</span>
                  <span className="px-2 py-0.5 rounded-full bg-white border border-[#E8E8E1] text-[#527665]">
                    {note.barrierFeeling}
                  </span>
                </div>
                <p className="text-xs text-[#777D76] leading-relaxed">
                  {note.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =======================================================================
          TIMELINE OF PREVIOUS REPORTS
         ======================================================================= */}
      <div className="rounded-3xl bg-white border border-[#E8E8E1] p-6 sm:p-8 space-y-5 shadow-sm">
        <h3 className="font-serif text-xl text-[#252923] font-normal">
          Historical Scan Records
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pastScans.map((scan) => (
            <div
              key={scan.id}
              className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E8E8E1] hover:border-[#527665]/40 transition space-y-3"
            >
              <div className="flex items-center gap-3">
                <img
                  src={scan.image}
                  alt={scan.phase}
                  className="w-12 h-12 rounded-xl object-cover border border-[#E8E8E1]"
                />
                <div className="space-y-0.5">
                  <div className="text-xs font-mono font-semibold text-[#252923]">
                    {scan.phase}
                  </div>
                  <div className="text-[10px] font-mono text-[#777D76]">
                    {scan.date}
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-[#777D76] leading-relaxed">
                {scan.summary}
              </p>

              <div className="pt-2 border-t border-[#E8E8E1] flex items-center justify-between text-xs font-mono">
                <span className="text-[#527665]">Score: {scan.score}</span>
                <span className="text-[#777D76] hover:text-[#252923] flex items-center gap-1 cursor-pointer">
                  <span>View Details</span>
                  <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
