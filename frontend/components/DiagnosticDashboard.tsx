import React, { useState } from 'react';
import { AnalysisResponse } from '../services/api';
import { Activity, AlertTriangle, Eye, Sliders, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

interface DiagnosticDashboardProps {
  analysis: AnalysisResponse;
  originalImage: string | null;
}

export const DiagnosticDashboard: React.FC<DiagnosticDashboardProps> = ({
  analysis,
  originalImage,
}) => {
  const [heatmapOpacity, setHeatmapOpacity] = useState<number>(0.65);
  const [viewMode, setViewMode] = useState<'overlay' | 'side-by-side'>('overlay');

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 60) return 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';
    if (score >= 45) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  const getSeverityBadgeClass = (severity: string) => {
    if (severity.includes('Clear')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (severity.includes('Mild-to-Moderate')) return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
    if (severity.includes('Mild')) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    if (severity.includes('Moderate')) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
  };

  return (
    <div className="w-full space-y-6">
      {/* Emergency Referral Alert Banner */}
      {analysis.requires_clinical_referral && (
        <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-200 text-sm flex items-start gap-3 shadow-lg shadow-rose-950/30 animate-pulse">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-rose-300">Clinical Triage Alert</h4>
            <p className="text-xs text-rose-200/90 mt-1">
              Elevated inflammatory erythema or acute breakout activity detected. We strongly advise booking an in-person evaluation with a licensed dermatologist rather than relying solely on self-directed topical remedies.
            </p>
          </div>
        </div>
      )}

      {/* Top Level Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Overall Health Score Ring */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Skin Health Index
            </span>
            <div className="text-3xl font-extrabold text-white mt-1">
              {analysis.overall_health_score} <span className="text-sm font-normal text-slate-400">/ 100</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {analysis.overall_health_score >= 75 ? 'Good epidermal barrier balance' : 'Active condition management indicated'}
            </p>
          </div>
          <div className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center font-mono font-bold text-xl ${getScoreColor(analysis.overall_health_score)} shadow-inner`}>
            {analysis.overall_health_score}%
          </div>
        </div>

        {/* Detected Skin Type */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Biophysical Skin Type
            </span>
            <div className="text-2xl font-bold text-brand-300 mt-1">
              {analysis.detected_skin_type}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Derived from sebum flux & pore distribution
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-brand-400">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* Acne Severity & Selective Abstain */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Acne Severity Grade
            </span>
            <div className="mt-1">
              <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold border ${getSeverityBadgeClass(analysis.acne_severity_grade)}`}>
                {analysis.acne_severity_grade}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              {analysis.acne_severity_grade.includes('Mild-to-Moderate')
                ? 'Selective abstain triggered (borderline margin)'
                : 'Ordinal rank classification'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Split: 8 Conditions vs Grad-CAM Heatmap Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 8 Condition Breakdown Meters */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-brand-400" />
              8-Class Harmonized Dermatological Diagnostic
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              Threshold: ≥ 38%
            </span>
          </div>

          <div className="space-y-4">
            {Object.entries(analysis.conditions).map(([key, item]) => {
              const pct = Math.round(item.probability * 100);
              return (
                <div key={key} className="glass-card rounded-xl p-3.5 border border-slate-800/80 hover:border-slate-700 transition">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-200">
                        {item.display_name}
                      </span>
                      {item.is_detected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getSeverityBadgeClass(item.severity_level)}`}>
                        {item.severity_level}
                      </span>
                      <span className="text-xs font-mono font-bold text-white">
                        {pct}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        pct >= 70
                          ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                          : pct >= 40
                          ? 'bg-gradient-to-r from-brand-500 to-cyan-400'
                          : 'bg-slate-700'
                      }`}
                      style={{ width: `${Math.max(pct, 4)}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    {item.clinical_note}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Grad-CAM Spatial Heatmap Viewer */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-brand-400" />
                Grad-CAM Explainable Heatmap
              </h3>
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px]">
                <button
                  onClick={() => setViewMode('overlay')}
                  className={`px-2.5 py-1 rounded-md transition ${
                    viewMode === 'overlay' ? 'bg-brand-500 text-slate-950 font-bold' : 'text-slate-400'
                  }`}
                >
                  Overlay
                </button>
                <button
                  onClick={() => setViewMode('side-by-side')}
                  className={`px-2.5 py-1 rounded-md transition ${
                    viewMode === 'side-by-side' ? 'bg-brand-500 text-slate-950 font-bold' : 'text-slate-400'
                  }`}
                >
                  Side-by-Side
                </button>
              </div>
            </div>

            {/* Heatmap Image Viewer */}
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner">
              {viewMode === 'overlay' ? (
                <>
                  {/* Original Face Image */}
                  {originalImage ? (
                    <img
                      src={originalImage}
                      alt="Original Patient Face"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-slate-600 text-xs">
                      Base Face Frame
                    </div>
                  )}

                  {/* Grad-CAM Heatmap Layer */}
                  {analysis.heatmap_image_base64 && (
                    <img
                      src={analysis.heatmap_image_base64}
                      alt="Grad-CAM Saliency Overlay"
                      className="absolute inset-0 w-full h-full object-cover mix-blend-screen transition-opacity"
                      style={{ opacity: heatmapOpacity }}
                    />
                  )}
                </>
              ) : (
                <div className="grid grid-cols-2 h-full">
                  <div className="relative border-r border-slate-800">
                    {originalImage ? (
                      <img src={originalImage} alt="Input" className="w-full h-full object-cover" />
                    ) : (
                      <div className="h-full flex items-center justify-center text-[10px] text-slate-500">Input</div>
                    )}
                    <span className="absolute bottom-2 left-2 text-[10px] bg-slate-900/80 px-2 py-0.5 rounded text-slate-300">
                      Input
                    </span>
                  </div>
                  <div className="relative bg-slate-950">
                    {analysis.heatmap_image_base64 && (
                      <img src={analysis.heatmap_image_base64} alt="Saliency" className="w-full h-full object-cover" />
                    )}
                    <span className="absolute bottom-2 left-2 text-[10px] bg-slate-900/80 px-2 py-0.5 rounded text-brand-300 font-mono">
                      Grad-CAM
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Opacity Slider for Overlay Mode */}
            {viewMode === 'overlay' && (
              <div className="mt-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
                <span className="text-[11px] text-slate-400 font-mono shrink-0">
                  Heatmap Opacity:
                </span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={heatmapOpacity}
                  onChange={(e) => setHeatmapOpacity(parseFloat(e.target.value))}
                  className="w-full accent-brand-400 cursor-pointer"
                />
                <span className="text-xs font-mono font-bold text-white shrink-0">
                  {Math.round(heatmapOpacity * 100)}%
                </span>
              </div>
            )}
          </div>

          {/* Saliency Interpretation Notes */}
          <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <p className="font-semibold text-slate-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />
              Explainability Verification
            </p>
            <p className="leading-relaxed">
              Warm chromatic zones (Yellow to Red) denote focal convolutional activation on clinical lesion sites, confirming the network focuses on real dermatological features rather than ambient background noise.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
