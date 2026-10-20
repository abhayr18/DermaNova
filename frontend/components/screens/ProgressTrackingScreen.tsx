'use client';

import React, { useState, useEffect } from 'react';
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
  ArrowRight,
  Camera
} from 'lucide-react';
import { apiService, AnalysisResponse } from '../../services/api';

interface JournalNote {
  id: string;
  date: string;
  text: string;
  barrierFeeling: 'Calm' | 'Hydrated' | 'Slightly Reactive';
}

interface ProgressTrackingScreenProps {
  latestAnalysis?: AnalysisResponse | null;
  onStartNewAnalysis?: () => void;
}

export const ProgressTrackingScreen: React.FC<ProgressTrackingScreenProps> = ({
  latestAnalysis,
  onStartNewAnalysis,
}) => {
  const [comparisonMode, setComparisonMode] = useState<'slider' | 'side-by-side'>('slider');
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Journal notes state initialized from localStorage
  const [notes, setNotes] = useState<JournalNote[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('dermanova_journal_notes');
        return saved ? JSON.parse(saved) : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteFeeling, setNewNoteFeeling] = useState<'Calm' | 'Hydrated' | 'Slightly Reactive'>('Calm');

  useEffect(() => {
    let isMounted = true;

    const fetchScans = async () => {
      setLoading(true);
      try {
        const resp = await apiService.getAnalyses();
        const items = resp?.items || [];
        if (isMounted) {
          if (items.length > 0) {
            setScans(items);
          } else if (latestAnalysis) {
            setScans([
              {
                analysis_id: latestAnalysis.analysis_id,
                created_at: latestAnalysis.timestamp,
                overall_health_score: latestAnalysis.overall_health_score,
                detected_skin_type: latestAnalysis.detected_skin_type,
                primary_concern: latestAnalysis.top_concerns?.[0] || 'Evaluated',
              },
            ]);
          } else {
            setScans([]);
          }
        }
      } catch (err) {
        if (latestAnalysis && isMounted) {
          setScans([
            {
              analysis_id: latestAnalysis.analysis_id,
              created_at: latestAnalysis.timestamp,
              overall_health_score: latestAnalysis.overall_health_score,
              detected_skin_type: latestAnalysis.detected_skin_type,
              primary_concern: latestAnalysis.top_concerns?.[0] || 'Evaluated',
            },
          ]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchScans();

    return () => {
      isMounted = false;
    };
  }, [latestAnalysis]);

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

    const updated = [newEntry, ...notes];
    setNotes(updated);
    try {
      localStorage.setItem('dermanova_journal_notes', JSON.stringify(updated));
    } catch (e) {}
    setNewNoteText('');
  };

  const handleSliderMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const container = e.currentTarget.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const offset = clientX - container.left;
    const percentage = Math.max(0, Math.min(100, (offset / container.width) * 100));
    setSliderPosition(percentage);
  };

  if (loading) {
    return (
      <div className="w-full py-16 flex flex-col items-center justify-center space-y-3">
        <div className="w-6 h-6 border-2 border-[#527665] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-[#777D76]">Loading longitudinal records...</span>
      </div>
    );
  }

  if (scans.length === 0) {
    return (
      <div className="w-full space-y-8 animate-fade-in py-8">
        <div className="rounded-3xl border border-[#E8E8E1] bg-white p-8 sm:p-12 text-center max-w-xl mx-auto space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-[#E8EFE9] text-[#304D40] flex items-center justify-center mx-auto">
            <Layers className="w-8 h-8 text-[#527665]" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#252923]">
            No Longitudinal Scans Found
          </h2>
          <p className="text-xs sm:text-sm text-[#777D76] leading-relaxed">
            Longitudinal progress tracking evaluates optical facial scans under standardized conditions over 2 to 12 weeks. Perform your baseline facial scan to begin tracking barrier recovery.
          </p>
          {onStartNewAnalysis && (
            <button
              onClick={onStartNewAnalysis}
              className="mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#527665] hover:bg-[#304D40] text-white text-xs font-mono tracking-wider uppercase font-semibold transition shadow-sm"
            >
              <Camera className="w-4 h-4" />
              <span>Start Baseline Scan</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 animate-fade-in py-2">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#E8E8E1]">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#527665] font-semibold">
            Longitudinal Skin Journal
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#252923] font-normal tracking-tight">
            Progress Tracking & Scan History
          </h1>
          <p className="text-xs text-[#777D76] mt-0.5">
            Evaluate barrier evolution across clinical check-ins under standardized illumination.
          </p>
        </div>

        {onStartNewAnalysis && (
          <button
            onClick={onStartNewAnalysis}
            className="px-4 py-2 rounded-xl bg-white hover:bg-[#FAF9F6] border border-[#E8E8E1] text-[#252923] text-xs font-mono transition flex items-center gap-1.5 shadow-sm self-start sm:self-center"
          >
            <Camera className="w-3.5 h-3.5 text-[#527665]" />
            <span>Perform Check-in Scan</span>
          </button>
        )}
      </div>

      {/* Comparison Viewport */}
      {scans.length >= 2 ? (
        <div className="rounded-3xl bg-white border border-[#E8E8E1] p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#527665] font-semibold">
                Visual Comparison
              </span>
              <h2 className="font-serif text-xl sm:text-2xl text-[#252923] font-normal">
                Baseline vs. Latest Check-in
              </h2>
            </div>
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#FAF9F6] border border-[#E8E8E1] text-xs font-mono">
              <button
                onClick={() => setComparisonMode('slider')}
                className={`px-3 py-1.5 rounded-xl transition ${
                  comparisonMode === 'slider' ? 'bg-white text-[#252923] font-semibold shadow-xs' : 'text-[#777D76]'
                }`}
              >
                Slider Mode
              </button>
              <button
                onClick={() => setComparisonMode('side-by-side')}
                className={`px-3 py-1.5 rounded-xl transition ${
                  comparisonMode === 'side-by-side' ? 'bg-white text-[#252923] font-semibold shadow-xs' : 'text-[#777D76]'
                }`}
              >
                Side by Side
              </button>
            </div>
          </div>

          {/* Observation Accuracy Disclaimer */}
          <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#E8E8E1] text-[11px] text-[#777D76] leading-relaxed flex items-start gap-2">
            <Info className="w-4 h-4 text-[#527665] shrink-0 mt-0.5" />
            <span>
              <strong>Lighting & Angle Notice:</strong> Apparent skin texture and tone are sensitive to ambient illuminance, color temperature, and angle. Ensure follow-up photos are taken under consistent daylight for meaningful comparisons.
            </span>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-3xl bg-white border border-[#E8E8E1] space-y-2 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#304D40]">
            <CheckCircle2 className="w-4 h-4 text-[#527665]" />
            <span>Baseline Assessment Registered</span>
          </div>
          <p className="text-xs text-[#777D76] leading-relaxed">
            You have 1 recorded scan (Score: {scans[0]?.overall_health_score || 'N/A'}/100, Skin Type: {scans[0]?.detected_skin_type || 'Combination'}). Perform a follow-up scan in 7 to 14 days to unlock before/after side-by-side photo comparison.
          </p>
        </div>
      )}

      {/* Diary & Reflection Journal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Consistency Tracker */}
        <div className="lg:col-span-5 rounded-3xl bg-white border border-[#E8E8E1] p-6 sm:p-7 space-y-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E8E1]">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#527665] font-semibold">
                Consistency Tracker
              </span>
              <h3 className="font-serif text-xl text-[#252923] font-normal">
                Routine Habits
              </h3>
            </div>
            <span className="text-xs font-mono text-[#527665] font-semibold">
              Daily Regimen
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#E8E8E1] text-xs text-[#777D76] space-y-1">
            <div className="font-mono text-[#252923] font-medium">Daily Application Protocol</div>
            <p className="text-[11px] leading-relaxed">
              Consistently completing AM broad-spectrum SPF and gentle PM barrier recovery gives active ingredients the sustained biological window required for visible skin improvements.
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
          {notes.length === 0 ? (
            <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E8E8E1] text-center text-xs text-[#777D76] font-mono">
              No journal notes yet. Record your first reflection above.
            </div>
          ) : (
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
          )}
        </div>
      </div>

      {/* Recorded Scans Timeline */}
      <div className="rounded-3xl bg-white border border-[#E8E8E1] p-6 sm:p-8 space-y-5 shadow-sm">
        <h3 className="font-serif text-xl text-[#252923] font-normal">
          Recorded Scan Records ({scans.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {scans.map((scan, idx) => {
            const d = scan.created_at ? new Date(scan.created_at) : new Date();
            const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            return (
              <div
                key={scan.analysis_id || idx}
                className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E8E8E1] hover:border-[#527665]/40 transition space-y-3"
              >
                <div className="space-y-0.5">
                  <div className="text-xs font-mono font-semibold text-[#252923]">
                    {idx === 0 ? 'Baseline Assessment' : `Follow-up Check-in #${idx}`}
                  </div>
                  <div className="text-[10px] font-mono text-[#777D76]">
                    {dateStr}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E8E8E1] text-xs font-mono space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#777D76]">Barrier Score:</span>
                    <span className="text-[#527665] font-semibold">{scan.overall_health_score}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#777D76]">Skin Type:</span>
                    <span className="text-[#252923]">{scan.detected_skin_type}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
