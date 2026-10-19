'use client';

import React, { useState } from 'react';
import { AnalysisResponse, DetectedLesion } from '../services/api';
import {
  Activity,
  Eye,
  Sliders,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  MapPin,
  Layers,
  Crosshair,
  Filter,
  Info,
  Pill,
  ChevronRight
} from 'lucide-react';

interface DiagnosticDashboardProps {
  analysis: AnalysisResponse;
  originalImage: string | null;
}

export const DiagnosticDashboard: React.FC<DiagnosticDashboardProps> = ({
  analysis,
  originalImage,
}) => {
  const [heatmapOpacity, setHeatmapOpacity] = useState<number>(0.55);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(true);
  const [selectedLesionId, setSelectedLesionId] = useState<string | null>(null);
  const [conditionFilter, setConditionFilter] = useState<string>('all');

  const lesions: DetectedLesion[] = analysis.detected_lesions || [];

  // Filter lesions by condition if requested
  const filteredLesions = conditionFilter === 'all'
    ? lesions
    : lesions.filter((l) => l.condition_id === conditionFilter);

  const activeLesion = lesions.find((l) => l.id === selectedLesionId) || (filteredLesions.length > 0 ? filteredLesions[0] : null);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 60) return 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';
    if (score >= 45) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  const getSeverityBadgeClass = (severity: string) => {
    if (severity.includes('Clear')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (severity.includes('Mild-to-Moderate')) return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
    if (severity.includes('Mild') || severity.includes('Early')) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    if (severity.includes('Moderate')) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
  };

  // Distinct condition tags present in detected lesions
  const uniqueConditionIds = Array.from(new Set(lesions.map((l) => l.condition_id)));

  return (
    <div className="w-full space-y-5">
      {/* Emergency Referral Alert Banner */}
      {analysis.requires_clinical_referral && (
        <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs sm:text-sm flex items-start gap-3 shadow-lg shadow-rose-950/30 animate-pulse">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-extrabold text-rose-300">Clinical Triage Alert</h4>
            <p className="text-xs text-rose-200/90 mt-1">
              Elevated inflammatory erythema or high lesion density detected. We recommend reviewing these findings with a licensed dermatologist.
            </p>
          </div>
        </div>
      )}

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Overall Health Score */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Skin Health Index
            </span>
            <div className="text-2xl font-black text-white mt-0.5">
              {analysis.overall_health_score} <span className="text-xs font-normal text-slate-400">/ 100</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {analysis.overall_health_score >= 75 ? 'Good epidermal balance' : 'Targeted care indicated'}
            </p>
          </div>
          <div className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center font-mono font-bold text-lg ${getScoreColor(analysis.overall_health_score)} shadow-inner`}>
            {analysis.overall_health_score}%
          </div>
        </div>

        {/* Detected Skin Type */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Biophysical Skin Type
            </span>
            <div className="text-xl font-bold text-brand-300 mt-0.5">
              {analysis.detected_skin_type}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Sebum & pore distribution
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-brand-400">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* Total Pinpointed Lesions */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Pinpointed Disease Sites
            </span>
            <div className="text-xl font-bold text-emerald-400 mt-0.5 flex items-center gap-1.5">
              <span>{lesions.length} Areas Identified</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Exact bounding coordinates
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400">
            <Crosshair className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* HERO SECTION: Interactive Disease Localization Map */}
      <div className="glass-panel rounded-3xl p-4 sm:p-6 border border-slate-800 shadow-2xl space-y-4">
        {/* Title & Controls Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-brand-400" />
              <span>Interactive Disease Localization Map</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-300 border border-brand-500/20">
                Live Spatial Callouts
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Tap or click any bounding box to view disease diagnosis & targeted actives
            </p>
          </div>

          {/* Quick Toggles */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
                showBoundingBoxes
                  ? 'bg-brand-500/20 border-brand-500/40 text-brand-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>Disease Pins ({showBoundingBoxes ? 'ON' : 'OFF'})</span>
            </button>

            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
                showHeatmap
                  ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Grad-CAM ({showHeatmap ? 'ON' : 'OFF'})</span>
            </button>
          </div>
        </div>

        {/* Condition Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] text-slate-500 font-bold mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          <button
            onClick={() => setConditionFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
              conditionFilter === 'all'
                ? 'bg-brand-500 text-slate-950 shadow'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            All Conditions ({lesions.length})
          </button>
          {uniqueConditionIds.map((cId) => {
            const count = lesions.filter((l) => l.condition_id === cId).length;
            const matchLesion = lesions.find((l) => l.condition_id === cId);
            return (
              <button
                key={cId}
                onClick={() => setConditionFilter(cId)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition flex items-center gap-1.5 ${
                  conditionFilter === cId
                    ? 'bg-brand-500 text-slate-950 shadow'
                    : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: matchLesion?.color || '#14b8a6' }}
                />
                <span>{cId.replace('_', ' ')} ({count})</span>
              </button>
            );
          })}
        </div>

        {/* Interactive Image Viewport */}
        <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl select-none">
          {/* Base Patient Image */}
          {originalImage ? (
            <img
              src={originalImage}
              alt="Patient skin scan"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-slate-500 text-xs">
              Patient Scan Frame
            </div>
          )}

          {/* Grad-CAM Heatmap Layer */}
          {showHeatmap && analysis.heatmap_image_base64 && (
            <img
              src={analysis.heatmap_image_base64}
              alt="Grad-CAM Saliency Overlay"
              className="absolute inset-0 w-full h-full object-cover mix-blend-screen transition-opacity pointer-events-none"
              style={{ opacity: heatmapOpacity }}
            />
          )}

          {/* OVERLAY: Disease Bounding Boxes & Callout Pins */}
          {showBoundingBoxes &&
            filteredLesions.map((lesion) => {
              const isSelected = activeLesion?.id === lesion.id;
              return (
                <div
                  key={lesion.id}
                  onClick={() => setSelectedLesionId(lesion.id)}
                  style={{
                    left: `${lesion.box.x}%`,
                    top: `${lesion.box.y}%`,
                    width: `${lesion.box.width}%`,
                    height: `${lesion.box.height}%`,
                    borderColor: lesion.color,
                  }}
                  className={`absolute border-2 rounded-xl transition-all duration-300 cursor-pointer group ${
                    isSelected
                      ? 'ring-4 ring-white/60 shadow-[0_0_25px_rgba(255,255,255,0.4)] scale-105 z-20'
                      : 'hover:scale-105 hover:ring-2 hover:ring-white/40 z-10'
                  }`}
                >
                  {/* Glowing background on hover/selection */}
                  <div
                    className="absolute inset-0 rounded-xl opacity-20 transition"
                    style={{ backgroundColor: lesion.color }}
                  />

                  {/* Top Attached Pin Badge */}
                  <div
                    style={{ backgroundColor: lesion.color }}
                    className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-slate-950 text-[9px] font-black tracking-tight flex items-center gap-1 shadow-lg whitespace-nowrap transition-transform ${
                      isSelected ? 'scale-110' : 'group-hover:scale-105'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />
                    <span>{lesion.condition_name.split('(')[0].trim()}</span>
                    <span className="opacity-90">{Math.round(lesion.confidence * 100)}%</span>
                  </div>

                  {/* Corner crosshair anchors */}
                  <span className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-white" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 border-t border-r border-white" />
                  <span className="absolute -bottom-1 -left-1 w-2 h-2 border-b border-l border-white" />
                  <span className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-white" />
                </div>
              );
            })}

          {/* Floating Selected Lesion Diagnosis Card (in-viewport) */}
          {activeLesion && showBoundingBoxes && (
            <div className="absolute bottom-3 inset-x-3 sm:inset-x-auto sm:left-4 sm:max-w-md p-3.5 rounded-2xl bg-slate-950/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl z-30 animate-fade-in space-y-2">
              <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: activeLesion.color }}
                  />
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-white leading-tight">
                      {activeLesion.condition_name}
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      Located: <span className="text-brand-300 font-semibold">{activeLesion.location_label}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-extrabold text-white">
                    {Math.round(activeLesion.confidence * 100)}%
                  </span>
                  <div className="text-[9px] text-slate-400">Confidence</div>
                </div>
              </div>

              <div className="text-[11px] text-slate-300 leading-snug">
                {activeLesion.clinical_finding}
              </div>

              {/* Recommended targeted active */}
              <div className="p-2 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center gap-2 text-[11px]">
                <Pill className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                <div className="text-slate-200">
                  <span className="font-bold text-brand-300">Targeted Active: </span>
                  {activeLesion.recommended_active}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Grad-CAM Opacity Slider */}
        {showHeatmap && (
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
            <span className="text-[11px] text-slate-400 font-mono shrink-0 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-indigo-400" />
              Heatmap Intensity:
            </span>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={heatmapOpacity}
              onChange={(e) => setHeatmapOpacity(parseFloat(e.target.value))}
              className="w-full accent-indigo-400 cursor-pointer"
            />
            <span className="text-xs font-mono font-bold text-white shrink-0">
              {Math.round(heatmapOpacity * 100)}%
            </span>
          </div>
        )}
      </div>

      {/* Lesion List Cards (Below Map) */}
      <div className="glass-panel rounded-3xl p-4 sm:p-6 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <h3 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>Identified Disease Sites & Spot Treatments ({filteredLesions.length})</span>
          </h3>
          <span className="text-[11px] text-slate-400">Click to focus on photo</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {filteredLesions.map((lesion, index) => {
            const isSelected = activeLesion?.id === lesion.id;
            return (
              <div
                key={lesion.id}
                onClick={() => setSelectedLesionId(lesion.id)}
                className={`p-3 rounded-2xl border transition cursor-pointer space-y-1.5 ${
                  isSelected
                    ? 'bg-slate-900 border-brand-400 ring-2 ring-brand-400/30'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: lesion.color }}
                    />
                    <span className="text-xs font-bold text-white">
                      #{index + 1} {lesion.condition_name}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${getSeverityBadgeClass(lesion.severity)}`}>
                    {lesion.severity} • {Math.round(lesion.confidence * 100)}%
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="text-brand-300 font-medium">📍 {lesion.location_label}</span>
                </div>

                <div className="text-[10px] text-slate-300 line-clamp-1">
                  <span className="text-slate-400 font-semibold">Active: </span>
                  {lesion.recommended_active}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 8-Class Harmonized Dermatological Breakdown Meters */}
      <div className="glass-panel rounded-3xl p-4 sm:p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <h3 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-brand-400" />
            <span>8-Class Comprehensive Dermatological Diagnostics</span>
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">
            Clinical threshold: ≥ 38%
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(analysis.conditions).map(([key, item]) => {
            const pct = Math.round(item.probability * 100);
            return (
              <div
                key={key}
                className="p-3 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-200">
                      {item.display_name}
                    </span>
                    {item.is_detected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${getSeverityBadgeClass(item.severity_level)}`}>
                      {item.severity_level}
                    </span>
                    <span className="text-xs font-mono font-bold text-white">
                      {pct}%
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      pct >= 70
                        ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                        : pct >= 40
                        ? 'bg-gradient-to-r from-brand-500 to-cyan-400'
                        : 'bg-slate-700'
                    }`}
                    style={{ width: `${Math.max(pct, 5)}%` }}
                  />
                </div>

                <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                  {item.clinical_note}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
