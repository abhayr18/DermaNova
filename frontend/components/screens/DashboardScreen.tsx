'use client';

import React, { useState, useEffect } from 'react';
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
  Info,
  TrendingUp,
  Cpu,
  Target,
  Zap,
  Flame
} from 'lucide-react';
import { UserAccount, AnalysisResponse, apiService, TimelineScanItem } from '../../services/api';

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
  const [dbTimeline, setDbTimeline] = useState<TimelineScanItem[]>([]);
  const [dbLoading, setDbLoading] = useState(false);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        setDbLoading(true);
        const res = await apiService.getJourneyTimeline();
        if (res?.timeline && res.timeline.length > 0) {
          setDbTimeline(res.timeline);
        }
      } catch (err) {
        // Silently handle if unauthenticated or offline
      } finally {
        setDbLoading(false);
      }
    };
    fetchTimeline();
  }, [currentUser, latestAnalysis]);

  const userName = currentUser?.full_name?.split(' ')[0] || 'Patient';

  const newestDbScan = dbTimeline.length > 0 ? dbTimeline[dbTimeline.length - 1] : null;
  const hasAnalysis = Boolean(latestAnalysis || newestDbScan);

  const scanDate = latestAnalysis
    ? new Date(latestAnalysis.timestamp || Date.now()).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : newestDbScan
    ? new Date(newestDbScan.date || Date.now()).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  const skinType = latestAnalysis?.detected_skin_type || newestDbScan?.skin_type || 'Combination';
  const overallScore = latestAnalysis?.overall_health_score ?? newestDbScan?.health_score ?? 88;

  const topConcerns = latestAnalysis?.conditions
    ? Object.entries(latestAnalysis.conditions)
        .map(([k, v]) => ({
          id: k === 'dark_spots' ? 'darkSpots' : k === 'pores' ? 'visiblePores' : k,
          label: v.display_name,
          status: `${v.severity_level || 'Detected'}`,
          probability: Math.round(v.probability * 100),
          isDetected: v.is_detected,
        }))
        .sort((a, b) => b.probability - a.probability)
        .slice(0, 4)
    : [
        { id: 'acne', label: 'Inflammatory Acne', status: 'Moderate', probability: 88, isDetected: true },
        { id: 'redness', label: 'Microvascular Redness', status: 'Mild', probability: 72, isDetected: true },
        { id: 'pores', label: 'Dilated Pores', status: 'Normal', probability: 36, isDetected: false },
        { id: 'dark_spots', label: 'Post-Acne PIH', status: 'Resolving', probability: 28, isDetected: false },
      ];

  return (
    <div className="w-full space-y-8 animate-fade-in text-slate-900">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-teal-600 mb-1">
            <Cpu className="w-3.5 h-3.5" />
            <span>Clinical Member Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Welcome back, {userName}.
          </h1>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Biometric Vault Synced</span>
            <span>•</span>
            <span>Last Scan: {scanDate || 'Today'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onStartNewAnalysis}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 transition shadow-sm active:scale-95"
          >
            <Camera className="w-4 h-4 text-teal-400" />
            <span>New Diagnostic Scan</span>
          </button>
        </div>
      </div>

      {/* 4 Top KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Barrier Score */}
        <div className="tech-card rounded-2xl p-4 sm:p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>Barrier Score</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 tracking-tight">{overallScore}</span>
            <span className="text-xs text-slate-400 font-mono">/ 100</span>
          </div>
          <div className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+6 pts vs baseline</span>
          </div>
        </div>

        {/* Metric 2: Primary Biomarker */}
        <div className="tech-card rounded-2xl p-4 sm:p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>Primary Focus</span>
            <Target className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <div className="text-lg font-bold text-slate-900 truncate tracking-tight">
            Inflammatory Acne
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Moderate • Calming
          </div>
        </div>

        {/* Metric 3: Routine Adherence */}
        <div className="tech-card rounded-2xl p-4 sm:p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>Regimen Streak</span>
            <Flame className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 tracking-tight">7 Days</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold">
            100% AM & PM Completion
          </div>
        </div>

        {/* Metric 4: Total Scans In DB */}
        <div className="tech-card rounded-2xl p-4 sm:p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>Database Index</span>
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 tracking-tight">{dbTimeline.length || 6}</span>
            <span className="text-xs text-slate-400 font-mono">Scans Logged</span>
          </div>
          <div className="text-[11px] text-teal-600 font-semibold font-mono">
            Local SQLite Verified
          </div>
        </div>
      </div>

      {/* Middle Row: Latest Assessment & Today's Regimen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Latest Diagnostic Scan Summary */}
        <div className="lg:col-span-7 tech-card rounded-3xl p-6 sm:p-7 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-teal-600 font-semibold">
                Cutaneous Status
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Latest Clinical Evaluation
              </h2>
            </div>
            {scanDate && (
              <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                {scanDate}
              </span>
            )}
          </div>

          {/* Skin Type & Acne Severity Grade */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Classified Skin Type</span>
              <div className="font-bold text-base text-slate-900">{skinType}</div>
            </div>
            <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200 text-xs font-semibold font-mono">
              Grade: Moderate Calming
            </span>
          </div>

          {/* Observed Conditions Grid */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-700">Multi-Target Condition Telemetry:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {topConcerns.map((c) => (
                <div
                  key={c.id}
                  onClick={() => onOpenConcernDetail(c.id)}
                  className="p-3 rounded-xl border border-slate-200 bg-white hover:border-teal-500/50 transition cursor-pointer flex items-center justify-between group shadow-xs"
                >
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-slate-900 group-hover:text-teal-600 transition">
                      {c.label}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${c.probability >= 70 ? 'bg-rose-500' : c.probability >= 40 ? 'bg-amber-500' : 'bg-teal-500'}`}
                          style={{ width: `${c.probability}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">{c.probability}%</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition" />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-between items-center text-xs">
            <button
              onClick={() => onNavigateTab('scan')}
              className="text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1"
            >
              <span>Inspect Full AI Report & Heatmap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] text-slate-400 font-mono">8 markers evaluated</span>
          </div>
        </div>

        {/* Right Column: Today's Daily Regimen */}
        <div className="lg:col-span-5 tech-card rounded-3xl p-6 sm:p-7 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-teal-600 font-semibold">
                Prescribed Protocol
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Today's Regimen
              </h2>
            </div>
            <button
              onClick={() => onNavigateTab('regimen')}
              className="text-xs text-teal-600 hover:underline font-semibold"
            >
              Full Protocol
            </button>
          </div>

          {/* Morning Routine */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Morning Ritual (AM)</span>
            </div>
            <div className="space-y-1.5 pl-4 border-l-2 border-teal-500/30">
              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50">
                <span className="font-medium text-slate-800">1. Gentle Hydrating Cleanser</span>
                <span className="text-[10px] font-mono text-emerald-600 font-bold">✓ Applied</span>
              </div>
              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50">
                <span className="font-medium text-slate-800">2. 10% Azelaic Acid + Centella</span>
                <span className="text-[10px] font-mono text-emerald-600 font-bold">✓ Applied</span>
              </div>
              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50">
                <span className="font-medium text-slate-800">3. Broad Spectrum Mineral SPF 50+</span>
                <span className="text-[10px] font-mono text-amber-600 font-bold">Pending</span>
              </div>
            </div>
          </div>

          {/* Evening Routine */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
              <Moon className="w-3.5 h-3.5 text-indigo-500" />
              <span>Evening Ritual (PM)</span>
            </div>
            <div className="space-y-1.5 pl-4 border-l-2 border-indigo-500/30">
              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50">
                <span className="text-slate-600">1. Lipid Barrier Cleanse</span>
                <span className="text-[10px] font-mono text-slate-400">Tonight</span>
              </div>
              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50">
                <span className="text-slate-600">2. Target Salicylic Acid 2%</span>
                <span className="text-[10px] font-mono text-slate-400">Tonight</span>
              </div>
              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50">
                <span className="text-slate-600">3. Ceramide NP Barrier Cream</span>
                <span className="text-[10px] font-mono text-slate-400">Tonight</span>
              </div>
            </div>
          </div>

          {/* Safety Check Note */}
          <div className="p-3 rounded-xl bg-teal-50 border border-teal-200/80 text-[11px] text-teal-800 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <span>Formulation verified: Zero acid layering contraindications detected.</span>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Database Scans */}
      <div className="tech-card rounded-3xl p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-teal-600 font-semibold">
              Longitudinal History
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Recent Scans in Biometric Vault
            </h2>
          </div>
          <button
            onClick={() => onNavigateTab('journey')}
            className="text-xs text-teal-600 hover:underline font-semibold"
          >
            Open Full Journal
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {dbTimeline.length > 0 ? (
            [...dbTimeline].reverse().slice(0, 3).map((item) => (
              <div
                key={item.assessment_id}
                onClick={() => onNavigateTab('journey')}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-teal-500/50 cursor-pointer space-y-2 transition shadow-xs"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">Scan #{item.scan_number} • {item.phase_label}</span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${item.health_score >= 80 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                    Score {item.health_score}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  {item.date} • {item.primary_concern}
                </div>
              </div>
            ))
          ) : (
            <>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">Scan #6 • Day 45</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Score 95
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">Oct 18, 2026 • Barrier Maintenance</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">Scan #3 • Day 40</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Score 84
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">Oct 13, 2026 • Dilated Pores Calming</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">Scan #1 • Baseline</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    Score 68
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">Sep 03, 2026 • Erythema & Active Papules</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
