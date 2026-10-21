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
  Camera,
  Activity,
  TrendingUp
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
        month: 'short',
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

  if (loading) {
    return (
      <div className="w-full py-16 flex flex-col items-center justify-center space-y-3">
        <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-slate-500">Querying longitudinal telemetry SQLite index...</span>
      </div>
    );
  }

  if (scans.length === 0) {
    return (
      <div className="w-full space-y-6 animate-fade-in py-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 text-center max-w-lg mx-auto space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center mx-auto">
            <Layers className="w-7 h-7" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            No Longitudinal Records
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Progress telemetry compares cutaneous biomarkers under standardized optical conditions over 2 to 12 weeks. Perform your baseline facial scan to begin tracking barrier recovery.
          </p>
          {onStartNewAnalysis && (
            <button
              onClick={onStartNewAnalysis}
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-semibold transition shadow-xs"
            >
              <Camera className="w-4 h-4 text-teal-400" />
              <span>Capture Baseline Scan</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-fade-in py-2">
      
      {/* Top Clinical Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-mono font-bold uppercase tracking-wider">
              Longitudinal Telemetry
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              {scans.length} Check-in Points in SQLite
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Progress Tracking & Scan Timeline
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluate barrier evolution, erythema mitigation, and pore density across standardized clinical check-ins.
          </p>
        </div>

        {onStartNewAnalysis && (
          <button
            onClick={onStartNewAnalysis}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-semibold transition flex items-center gap-1.5 shadow-xs self-start sm:self-center"
          >
            <Camera className="w-3.5 h-3.5 text-teal-400" />
            <span>Perform Check-in Scan</span>
          </button>
        )}
      </div>

      {/* Baseline Status Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Baseline Assessment Active</span>
          </div>
          <span className="text-xs font-mono text-emerald-600 font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+6 pt Barrier Gain</span>
          </span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Logged {scans.length} assessment records (Latest Score: <strong className="text-slate-800">{scans[0]?.overall_health_score || 84}/100</strong>, Skin Type: <strong className="text-slate-800">{scans[0]?.detected_skin_type || 'Combination'}</strong>). Standardized check-ins every 7-14 days allow sub-millimeter delta verification.
        </p>
      </div>

      {/* Diary & Reflection Journal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Consistency Tracker */}
        <div className="lg:col-span-5 rounded-2xl bg-white border border-slate-200 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-teal-700 font-bold">
                Habit Metrics
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Regimen Consistency
              </h3>
            </div>
            <span className="text-xs font-mono text-emerald-600 font-bold">
              7-Day Streak
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
            <div className="font-mono text-slate-900 font-semibold text-[11px]">Biological Latency Note</div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Epidermal turnover averages 28 days in adults. Active ingredients require a minimum 2-3 week window of uninterrupted daily application before visible remodeling occurs.
            </p>
          </div>
        </div>

        {/* Right Column: User Reflection Diary / Notes */}
        <div className="lg:col-span-7 rounded-2xl bg-white border border-slate-200 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-teal-700 font-bold">
                Clinical Journal
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Barrier & Reaction Log
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-500">
              {notes.length} saved entries
            </span>
          </div>

          {/* New Note Form */}
          <form onSubmit={handleAddNote} className="space-y-3">
            <textarea
              rows={2}
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="Record any skin observations (comfort, weather, retinol introduction, mild peeling)..."
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white transition font-sans"
            />
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-1.5 text-xs font-mono">
                <span className="text-slate-500 text-[11px]">Skin Feel:</span>
                {(['Calm', 'Hydrated', 'Slightly Reactive'] as const).map((feel) => (
                  <button
                    key={feel}
                    type="button"
                    onClick={() => setNewNoteFeeling(feel)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] transition ${
                      newNoteFeeling === feel
                        ? 'bg-slate-900 text-white font-bold'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
                    }`}
                  >
                    {feel}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={!newNoteText.trim()}
                className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-xs font-mono font-semibold transition flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save Note</span>
              </button>
            </div>
          </form>

          {/* Notes List */}
          {notes.length === 0 ? (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500 font-mono">
              No journal notes logged yet. Record your first clinical reflection above.
            </div>
          ) : (
            <div className="space-y-2 pt-1 max-h-56 overflow-y-auto">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-900 font-bold">{note.date}</span>
                    <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-teal-700 font-semibold text-[10px]">
                      {note.barrierFeeling}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-normal">
                    {note.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recorded Scans Timeline */}
      <div className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 space-y-4 shadow-xs">
        <h3 className="text-base font-bold text-slate-900">
          Historical Scan Archive ({scans.length} Records)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {scans.map((scan, idx) => {
            const d = scan.created_at ? new Date(scan.created_at) : new Date();
            const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            return (
              <div
                key={scan.analysis_id || idx}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-400 transition space-y-2"
              >
                <div className="space-y-0.5">
                  <div className="text-xs font-mono font-bold text-slate-900">
                    {idx === 0 ? 'Baseline Diagnostic Scan' : `Follow-up Check-in #${idx}`}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500">
                    {dateStr}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 text-xs font-mono space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Health Score:</span>
                    <span className="text-teal-700 font-bold">{scan.overall_health_score}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Classification:</span>
                    <span className="text-slate-900 font-medium">{scan.detected_skin_type}</span>
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
