'use client';

import React from 'react';
import {
  Camera,
  FileText,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Activity,
  Layers,
  SlidersHorizontal,
  ChevronRight,
  Check,
  Sun,
  Moon,
  Info
} from 'lucide-react';
import { UserAccount, AnalysisResponse } from '../../services/api';

interface DashboardScreenProps {
  currentUser: UserAccount | null;
  latestAnalysis: AnalysisResponse | null;
  onNavigateTab: (tabId: string) => void;
  onStartNewAnalysis: () => void;
  onOpenConcernDetail: (concernId: string) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  currentUser,
  latestAnalysis,
  onNavigateTab,
  onStartNewAnalysis,
  onOpenConcernDetail,
}) => {
  const userName = currentUser?.full_name?.split(' ')[0] || 'Friend';

  // Sample data fallback if no scan run yet
  const scanDate = latestAnalysis
    ? new Date(latestAnalysis.timestamp || Date.now()).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'October 18, 2026';

  const isDemo = !latestAnalysis;

  const skinType = latestAnalysis?.detected_skin_type || 'Combination (T-Zone)';
  const overallScore = latestAnalysis?.overall_health_score || 84;

  const topConcerns = latestAnalysis?.conditions ? (
    Object.entries(latestAnalysis.conditions)
      .map(([k, v]) => ({
        id: k === 'dark_spots' ? 'darkSpots' : k === 'pores' ? 'visiblePores' : k,
        label: v.display_name,
        status: `${v.severity_level || 'Detected'} (${Math.round(v.probability * 100)}%)`,
        probability: v.probability,
        isDetected: v.is_detected,
        indicator: v.probability >= 0.75 ? 'bg-[#EEEAF5] text-[#304D40] border-[#d5cbe4]' : v.probability >= 0.40 ? 'bg-[#F3E5E2] text-[#252923] border-[#d6c4c0]' : 'bg-[#E8EFE9] text-[#304D40] border-[#cbd7c1]'
      }))
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 4)
  ) : [
    { id: 'acne', label: 'Acne (Papules)', status: 'Mild (74%)', indicator: 'bg-[#F3E5E2] text-[#252923] border-[#d6c4c0]' },
    { id: 'redness', label: 'Facial Redness', status: 'Moderate (82%)', indicator: 'bg-[#EEEAF5] text-[#252923] border-[#d5cbe4]' },
    { id: 'visiblePores', label: 'Dilated Pores', status: 'Mild (71%)', indicator: 'bg-[#E8EFE9] text-[#304D40] border-[#cbd7c1]' },
    { id: 'darkSpots', label: 'Post-Acne Marks', status: 'Mild (68%)', indicator: 'bg-[#FAF9F6] text-[#777D76] border-[#E8E8E1]' },
  ];

  return (
    <div className="w-full space-y-8 animate-fade-in">
      
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E8E1]">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#527665] font-semibold">
            Member Overview
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#252923] font-normal tracking-tight">
            Welcome back, {userName}.
          </h1>
          <p className="text-xs text-[#777D76] mt-0.5">
            “Your skin journey, at a glance.”
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isDemo && (
            <span className="px-3 py-1 rounded-full bg-[#FAF9F6] border border-[#E8E8E1] text-[#777D76] text-[11px] font-mono">
              Sample Demo Mode
            </span>
          )}
          <button
            onClick={onStartNewAnalysis}
            className="px-5 py-2.5 rounded-2xl bg-[#304D40] hover:bg-[#253d33] text-white font-mono text-xs font-medium flex items-center gap-2 transition shadow-sm"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Start New Analysis</span>
          </button>
        </div>
      </div>

      {/* Primary Card: Ready for your next skin check? */}
      <div className="rounded-3xl bg-white border border-[#E8E8E1] p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#E8EFE9]/50 rounded-full blur-3xl pointer-events-none" />
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
          <div className="md:col-span-8 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8EFE9] text-[#304D40] text-[11px] font-mono font-medium">
              <Calendar className="w-3.5 h-3.5 text-[#527665]" />
              Weekly Skin Check In
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#252923] font-normal">
              Ready for your next skin check?
            </h2>
            <p className="text-xs sm:text-sm text-[#777D76] leading-relaxed max-w-xl">
              Tracking your cutaneous response every 7–14 days allows our spatial model to visualize inflammation calming and barrier lipids recovering.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={onStartNewAnalysis}
                className="px-6 py-3 rounded-2xl bg-[#304D40] hover:bg-[#253d33] text-white font-mono text-xs font-medium flex items-center gap-2 transition shadow-sm"
              >
                <Camera className="w-4 h-4" />
                <span>Capture New Scan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onNavigateTab('regimen')}
                className="px-5 py-3 rounded-2xl bg-white hover:bg-[#FAF9F6] border border-[#E8E8E1] text-[#252923] font-mono text-xs font-medium flex items-center gap-1.5 transition"
              >
                <FileText className="w-3.5 h-3.5 text-[#527665]" />
                <span>View Today's Routine</span>
              </button>
            </div>
          </div>

          <div className="md:col-span-4 flex justify-center">
            <div className="w-36 h-36 rounded-full border-4 border-[#E8EFE9] flex flex-col items-center justify-center text-center p-4 bg-[#FAF9F6]">
              <span className="text-[10px] font-mono uppercase text-[#777D76]">Barrier Score</span>
              <span className="font-serif text-3xl text-[#304D40] font-normal">{overallScore}</span>
              <span className="text-[10px] font-mono text-[#527665]">Optimal Calibrated</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Latest Scan Summary & Today's Routine Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Latest Scan Summary */}
        <div className="lg:col-span-7 rounded-3xl bg-white border border-[#E8E8E1] p-6 sm:p-7 space-y-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E8E1]">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#527665] font-semibold">
                Latest Assessment
              </span>
              <h3 className="font-serif text-xl text-[#252923] font-normal">
                Skin Concern Overview
              </h3>
            </div>
            <div className="text-right">
              <div className="text-xs font-mono text-[#252923] font-medium">{scanDate}</div>
              <div className="text-[10px] font-mono text-[#777D76]">
                {isDemo ? 'Sample Portrait' : 'Live Capture'}
              </div>
            </div>
          </div>

          {/* Skin Type Badge & Summary */}
          <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E8E8E1] flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono uppercase text-[#777D76]">Identified Skin Profile</span>
              <div className="font-serif text-base text-[#252923]">{skinType}</div>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#E8EFE9] text-[#304D40] text-xs font-mono font-medium">
              Hydration: 86%
            </span>
          </div>

          {/* Concern Visual Indicators */}
          <div className="space-y-2.5">
            <div className="text-xs font-mono text-[#777D76]">Observed visible patterns:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {topConcerns.map((c) => (
                <div
                  key={c.id}
                  onClick={() => onOpenConcernDetail(c.id)}
                  className="p-3 rounded-xl border border-[#E8E8E1] bg-white hover:border-[#527665]/40 transition cursor-pointer flex items-center justify-between group"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-mono font-medium text-[#252923] group-hover:text-[#527665] transition">
                      {c.label}
                    </div>
                    <div className="text-[11px] text-[#777D76]">{c.status}</div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[#777D76] group-hover:translate-x-0.5 transition" />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-between items-center text-xs font-mono">
            <button
              onClick={() => onNavigateTab('scan')}
              className="text-[#527665] font-semibold hover:underline flex items-center gap-1"
            >
              <span>View Full AI Report Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] text-[#777D76]">8 conditions tracked</span>
          </div>
        </div>

        {/* Right: Today's Routine Preview */}
        <div className="lg:col-span-5 rounded-3xl bg-white border border-[#E8E8E1] p-6 sm:p-7 space-y-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E8E1]">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#527665] font-semibold">
                Daily Ritual
              </span>
              <h3 className="font-serif text-xl text-[#252923] font-normal">
                Today's Regimen
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('regimen')}
              className="text-xs font-mono text-[#527665] hover:underline"
            >
              Full Routine
            </button>
          </div>

          {/* Morning Routine Preview */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-[#252923]">
              <Sun className="w-3.5 h-3.5 text-amber-600" />
              <span>Morning Ritual (AM)</span>
            </div>
            <div className="space-y-1.5 pl-5 border-l-2 border-[#E8EFE9]">
              <div className="flex items-center justify-between text-xs text-[#252923]">
                <span>1. Gentle Hydrating Cleanser</span>
                <span className="text-[10px] font-mono text-emerald-600">✓ Done</span>
              </div>
              <div className="flex items-center justify-between text-xs text-[#252923]">
                <span>2. Barrier Lipid Moisturizer</span>
                <span className="text-[10px] font-mono text-emerald-600">✓ Done</span>
              </div>
              <div className="flex items-center justify-between text-xs text-[#252923]">
                <span>3. Broad Spectrum SPF 50+</span>
                <span className="text-[10px] font-mono text-amber-600">Pending</span>
              </div>
            </div>
          </div>

          {/* Evening Routine Preview */}
          <div className="space-y-2 pt-2 border-t border-[#E8E8E1]">
            <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-[#252923]">
              <Moon className="w-3.5 h-3.5 text-[#304D40]" />
              <span>Evening Ritual (PM)</span>
            </div>
            <div className="space-y-1.5 pl-5 border-l-2 border-[#EEEAF5]">
              <div className="flex items-center justify-between text-xs text-[#777D76]">
                <span>1. Gentle Cleanse</span>
                <span className="text-[10px] font-mono text-[#777D76]">Tonight</span>
              </div>
              <div className="flex items-center justify-between text-xs text-[#777D76]">
                <span>2. Targeted Azelaic Acid</span>
                <span className="text-[10px] font-mono text-[#777D76]">Tonight</span>
              </div>
              <div className="flex items-center justify-between text-xs text-[#777D76]">
                <span>3. Nourishing Barrier Cream</span>
                <span className="text-[10px] font-mono text-[#777D76]">Tonight</span>
              </div>
            </div>
          </div>

          {/* Patch Test Reminder */}
          <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E8E8E1] text-[11px] text-[#777D76] flex items-start gap-2">
            <Info className="w-4 h-4 text-[#527665] shrink-0 mt-0.5" />
            <span>Reminder: Always patch test new spot actives for 24h behind your ear before full-face application.</span>
          </div>
        </div>
      </div>

      {/* Skincare Education Card & Scan History Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Education Card */}
        <div className="rounded-3xl bg-[#FAF9F6] border border-[#E8E8E1] p-6 sm:p-7 space-y-3">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[#527665] font-semibold">
            <Sparkles className="w-3 h-3" />
            Clinical Education
          </div>
          <h3 className="font-serif text-xl text-[#252923] font-normal">
            Why Stratum Corneum Hydration Calms Breakouts
          </h3>
          <p className="text-xs text-[#777D76] leading-relaxed">
            When facial skin is stripped of moisture by harsh soaps, sebaceous glands overcompensate by pumping thicker sebum, clogging pores and accelerating inflammation. A gentle, ceramide-rich barrier protocol normalizes cell turnover naturally.
          </p>
          <div className="pt-2 text-xs font-mono text-[#527665] font-semibold">
            DermaNova Medical Advisory Board Article #14
          </div>
        </div>

        {/* Recent Scan History */}
        <div className="rounded-3xl bg-white border border-[#E8E8E1] p-6 sm:p-7 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl text-[#252923] font-normal">
              Recent Scan Timeline
            </h3>
            <button
              onClick={() => onNavigateTab('journey')}
              className="text-xs font-mono text-[#527665] hover:underline"
            >
              View Journal
            </button>
          </div>

          <div className="space-y-2.5">
            <div className="p-3 rounded-2xl bg-[#FAF9F6] border border-[#E8E8E1] flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <div className="font-mono font-medium text-[#252923]">Scan #2 • 4-Week Follow Up</div>
                <div className="text-[11px] text-[#777D76]">Oct 18, 2026 • Mild Redness, Calmer Pores</div>
              </div>
              <span className="font-mono text-xs font-semibold text-[#527665]">Score 84</span>
            </div>

            <div className="p-3 rounded-2xl bg-[#FAF9F6] border border-[#E8E8E1] flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <div className="font-mono font-medium text-[#252923]">Scan #1 • Baseline Assessment</div>
                <div className="text-[11px] text-[#777D76]">Sep 20, 2026 • Erythema & Active Papules</div>
              </div>
              <span className="font-mono text-xs font-semibold text-[#777D76]">Score 71</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
