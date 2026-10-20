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
  ChevronRight,
  Maximize2,
  X,
  ChevronDown,
  ChevronUp,
  ZoomIn,
  Target
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
  const [isZoomModalOpen, setIsZoomModalOpen] = useState<boolean>(false);
  const [isMobileDetailsExpanded, setIsMobileDetailsExpanded] = useState<boolean>(true);

  const lesions: DetectedLesion[] = analysis.detected_lesions || [];

  // Filter lesions by condition if requested
  const filteredLesions =
    conditionFilter === 'all'
      ? lesions
      : lesions.filter((l) => l.condition_id === conditionFilter);

  // Active selected lesion
  const activeLesion =
    lesions.find((l) => l.id === selectedLesionId) ||
    (filteredLesions.length > 0 ? filteredLesions[0] : null);

  const activeIndex = activeLesion
    ? filteredLesions.findIndex((l) => l.id === activeLesion.id) + 1
    : 0;

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

  // Fallback image if null
  const displayImage = originalImage || '/demo_face.jpg';

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

      {/* Top Summary Cards (Responsive 1 col mobile -> 3 cols tablet/desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Overall Health Score */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              Skin Health Index
            </span>
            <div className="text-2xl font-black text-white mt-0.5">
              {analysis.overall_health_score} <span className="text-xs font-normal text-slate-400">/ 100</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {analysis.overall_health_score >= 75 ? 'Optimal epidermal balance' : 'Targeted care indicated'}
            </p>
          </div>
          <div className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center font-mono font-bold text-lg ${getScoreColor(analysis.overall_health_score)} shadow-inner`}>
            {analysis.overall_health_score}%
          </div>
        </div>

        {/* Detected Skin Type */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
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
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
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

      {/* HERO SECTION: Interactive Disease Localization Map & Inspector */}
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
              Tap or click any bounding box on the photo to inspect clinical findings & targeted actives
            </p>
          </div>

          {/* Quick Toggles */}
          <div className="flex items-center gap-2 text-xs flex-wrap">
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

            <button
              onClick={() => setIsZoomModalOpen(true)}
              className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
              title="Open full-screen inspection view"
            >
              <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Zoom Photo</span>
            </button>
          </div>
        </div>

        {/* Condition Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-[11px] text-slate-500 font-bold mr-1 flex items-center gap-1 shrink-0">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          <button
            onClick={() => setConditionFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition shrink-0 ${
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
                className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition flex items-center gap-1.5 shrink-0 ${
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

        {/* RESPONSIVE CLINICAL WORKSTATION GRID */}
        {/* On Desktop: 2-column side-by-side (photo on left, inspector panel on right) */}
        {/* On Mobile: Photo on top (100% clean, ZERO card overlays), inspector cleanly docked below */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* COLUMN 1: Completely Unobstructed Photo Viewport */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-3">
            <div className="relative aspect-[4/3] sm:aspect-[16/11] w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl select-none group">
              {/* Base Patient Image */}
              {displayImage ? (
                <img
                  src={displayImage}
                  alt="Patient skin scan"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500"
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

              {/* Top Status Badges (Non-intrusive) */}
              <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 pointer-events-none">
                <div className="px-2.5 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-slate-700/80 text-[10px] font-extrabold text-white flex items-center gap-1.5 shadow-lg">
                  <Crosshair className="w-3 h-3 text-emerald-400" />
                  <span>{filteredLesions.length} Disease Sites</span>
                </div>
                {activeLesion && (
                  <div className="hidden sm:flex px-2 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-slate-700/80 text-[10px] font-medium text-slate-300 items-center gap-1 shadow-lg">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeLesion.color }} />
                    <span>#{activeIndex} Selected</span>
                  </div>
                )}
              </div>

              {/* Top-Right Expand Button */}
              <button
                onClick={() => setIsZoomModalOpen(true)}
                className="absolute top-2.5 right-2.5 z-20 p-2 rounded-xl bg-slate-950/85 hover:bg-slate-900 border border-slate-700/80 text-slate-200 hover:text-white backdrop-blur-md transition shadow-lg"
                title="Fullscreen inspection view"
              >
                <ZoomIn className="w-4 h-4 text-cyan-400" />
              </button>

              {/* OVERLAY: Disease Bounding Boxes & Callout Pins (ZERO card overlays here!) */}
              {showBoundingBoxes &&
                filteredLesions.map((lesion, idx) => {
                  const isSelected = activeLesion?.id === lesion.id;
                  const isNearTop = lesion.box.y < 12;

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
                      className={`absolute border-2 sm:border-[2.5px] rounded-xl transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'ring-4 ring-white/90 shadow-[0_0_25px_rgba(255,255,255,0.6)] scale-[1.03] z-30'
                          : 'hover:scale-105 hover:ring-2 hover:ring-white/60 z-10'
                      }`}
                    >
                      {/* Subtle tinted fill on selection/hover */}
                      <div
                        className={`absolute inset-0 rounded-xl transition-opacity ${
                          isSelected ? 'opacity-25' : 'opacity-10 group-hover:opacity-20'
                        }`}
                        style={{ backgroundColor: lesion.color }}
                      />

                      {/* Attached Pin Marker Badge */}
                      {/* If near top edge, position inside/below so it doesn't get clipped */}
                      <div
                        style={{ backgroundColor: lesion.color }}
                        className={`absolute ${
                          isNearTop ? '-bottom-5' : '-top-4'
                        } left-1/2 -translate-x-1/2 px-1.5 sm:px-2 py-0.5 rounded-full text-slate-950 text-[8.5px] sm:text-[9.5px] font-black tracking-tight flex items-center gap-1 shadow-xl whitespace-nowrap transition-transform pointer-events-none ${
                          isSelected ? 'scale-110 ring-2 ring-white' : 'opacity-90'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />
                        <span>#{idx + 1}</span>
                        <span className="hidden sm:inline">{lesion.condition_name.split('(')[0].trim()}</span>
                        <span className="opacity-90">{Math.round(lesion.confidence * 100)}%</span>
                      </div>

                      {/* Precise Center Target Reticle */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div
                          className={`w-2 h-2 rounded-full border border-white shadow-sm transition-transform ${
                            isSelected ? 'scale-125 animate-pulse' : 'opacity-80'
                          }`}
                          style={{ backgroundColor: lesion.color }}
                        />
                      </div>

                      {/* Corner crosshair anchors for clinical precision aesthetics */}
                      <span className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-white" />
                      <span className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-white" />
                      <span className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-white" />
                      <span className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-white" />
                    </div>
                  );
                })}
            </div>

            {/* Grad-CAM Opacity Slider */}
            {showHeatmap && (
              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3 shadow-inner">
                <span className="text-[11px] text-slate-400 font-mono shrink-0 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-indigo-400" />
                  Heatmap Opacity:
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

            {/* Mobile Horizontal Quick-Select Ribbon (visible on mobile only) */}
            <div className="lg:hidden space-y-2">
              <div className="flex items-center justify-between text-xs px-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-brand-400" />
                  Select Lesion to Inspect ({filteredLesions.length})
                </span>
                <button
                  onClick={() => setIsMobileDetailsExpanded(!isMobileDetailsExpanded)}
                  className="text-[11px] text-brand-400 font-semibold flex items-center gap-1 hover:underline"
                >
                  <span>{isMobileDetailsExpanded ? 'Hide Details' : 'Show Details'}</span>
                  {isMobileDetailsExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {filteredLesions.map((lesion, index) => {
                  const isSelected = activeLesion?.id === lesion.id;
                  return (
                    <button
                      key={lesion.id}
                      onClick={() => setSelectedLesionId(lesion.id)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 shrink-0 ${
                        isSelected
                          ? 'bg-slate-900 border-white text-white shadow-lg ring-2 ring-brand-400/40'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: lesion.color }}
                      />
                      <span>#{index + 1} {lesion.condition_name.split('(')[0].trim()}</span>
                      <span className="text-[10px] opacity-80 font-mono">
                        {Math.round(lesion.confidence * 100)}%
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* COLUMN 2: Selected Disease Finding Inspector Panel */}
          {/* On Desktop: Stands prominently alongside the image */}
          {/* On Mobile: Cleanly docks below the photo (not covering the photo!) */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-3.5">
            {activeLesion ? (
              <div
                className={`p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-700/80 shadow-2xl space-y-3.5 transition-all ${
                  isMobileDetailsExpanded ? 'block' : 'hidden lg:block'
                }`}
              >
                {/* Active Lesion Header */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div className="flex items-start gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 mt-1 shadow"
                      style={{ backgroundColor: activeLesion.color }}
                    />
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                        Disease Spot #{activeIndex} of {filteredLesions.length}
                      </div>
                      <h4 className="text-sm sm:text-base font-extrabold text-white leading-tight mt-0.5">
                        {activeLesion.condition_name}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                        <span>Anatomical Zone:</span>
                        <span className="text-brand-300 font-bold">{activeLesion.location_label}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm sm:text-base font-mono font-black text-white">
                      {Math.round(activeLesion.confidence * 100)}%
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold border inline-block mt-0.5 ${getSeverityBadgeClass(activeLesion.severity)}`}>
                      {activeLesion.severity}
                    </span>
                  </div>
                </div>

                {/* Confidence Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Diagnostic Certainty</span>
                    <span className="font-mono text-white font-bold">{Math.round(activeLesion.confidence * 100)}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.round(activeLesion.confidence * 100)}%`,
                        backgroundColor: activeLesion.color,
                      }}
                    />
                  </div>
                </div>

                {/* Clinical Finding Narrative */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1">
                    <Info className="w-3 h-3 text-brand-400" /> Clinical Assessment
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeLesion.clinical_finding}
                  </p>
                </div>

                {/* Targeted Pharmacological Active Ingredient */}
                <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/25 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-300 font-mono flex items-center gap-1">
                    <Pill className="w-3.5 h-3.5 text-brand-400 shrink-0" /> Targeted Spot Active
                  </span>
                  <div className="text-xs font-bold text-white">
                    {activeLesion.recommended_active}
                  </div>
                  <p className="text-[10px] text-slate-300/90 leading-tight">
                    Apply directly to this pinpointed zone after cleansing to suppress local inflammatory cascades.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
                <Crosshair className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-xs text-slate-400">No disease spots match current filter.</p>
              </div>
            )}

            {/* Desktop Pinpointed Sites Quick Selector (Side List) */}
            <div className="hidden lg:block p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between text-xs border-b border-slate-800/80 pb-2">
                <span className="font-extrabold text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  All Pinpointed Sites ({filteredLesions.length})
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Click to focus</span>
              </div>

              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {filteredLesions.map((lesion, index) => {
                  const isSelected = activeLesion?.id === lesion.id;
                  return (
                    <button
                      key={lesion.id}
                      onClick={() => setSelectedLesionId(lesion.id)}
                      className={`w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between text-xs ${
                        isSelected
                          ? 'bg-slate-900 border-white text-white shadow-md ring-2 ring-brand-400/30'
                          : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: lesion.color }}
                        />
                        <span className="font-bold text-white truncate max-w-[150px]">
                          #{index + 1} {lesion.condition_name.split('(')[0].trim()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] text-slate-400 truncate max-w-[100px]">
                          {lesion.location_label}
                        </span>
                        <span className="font-mono font-bold text-brand-300 text-[11px]">
                          {Math.round(lesion.confidence * 100)}%
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FULL-SCREEN / ZOOM INSPECTION MODAL */}
      {isZoomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-xl animate-fade-in">
          <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
              <div className="flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-brand-400" />
                <h3 className="text-sm font-bold text-white">
                  High-Precision Disease Localization Inspection
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20">
                  {filteredLesions.length} Disease Sites
                </span>
              </div>
              <button
                onClick={() => setIsZoomModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image Viewport */}
            <div className="relative flex-1 min-h-[50vh] sm:min-h-[65vh] bg-slate-950 overflow-hidden flex items-center justify-center select-none">
              <img
                src={displayImage}
                alt="High-resolution patient skin scan"
                className="w-full h-full object-contain"
              />

              {showHeatmap && analysis.heatmap_image_base64 && (
                <img
                  src={analysis.heatmap_image_base64}
                  alt="Grad-CAM overlay"
                  className="absolute inset-0 w-full h-full object-contain mix-blend-screen pointer-events-none"
                  style={{ opacity: heatmapOpacity }}
                />
              )}

              {/* Pinpoint Bounding Boxes in Zoom Mode */}
              {showBoundingBoxes &&
                filteredLesions.map((lesion, idx) => {
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
                      className={`absolute border-2 sm:border-3 rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? 'ring-4 ring-white shadow-[0_0_30px_rgba(255,255,255,0.7)] z-30 scale-105'
                          : 'hover:ring-2 hover:ring-white/60 z-10'
                      }`}
                    >
                      <div
                        style={{ backgroundColor: lesion.color }}
                        className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-slate-950 text-[9px] font-black shadow-lg flex items-center gap-1"
                      >
                        <span>#{idx + 1}</span>
                        <span>{lesion.condition_name.split('(')[0].trim()}</span>
                        <span>{Math.round(lesion.confidence * 100)}%</span>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Modal Footer Controls */}
            <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="text-slate-400">
                {activeLesion ? (
                  <span>
                    Active: <strong className="text-white">#{activeIndex} {activeLesion.condition_name}</strong> ({activeLesion.location_label})
                  </span>
                ) : (
                  <span>Click any bounding box to focus</span>
                )}
              </div>
              <button
                onClick={() => setIsZoomModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold transition"
              >
                Close Fullscreen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive Lesion Sites & Spot Treatments (Responsive Grid) */}
      <div className="glass-panel rounded-3xl p-4 sm:p-6 border border-slate-800 space-y-3 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
          <h3 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>Identified Disease Sites & Spot Formulations ({filteredLesions.length})</span>
          </h3>
          <span className="text-[11px] text-slate-400">Click any card to pinpoint on photo</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredLesions.map((lesion, index) => {
            const isSelected = activeLesion?.id === lesion.id;
            return (
              <div
                key={lesion.id}
                onClick={() => setSelectedLesionId(lesion.id)}
                className={`p-3.5 rounded-2xl border transition cursor-pointer space-y-2 ${
                  isSelected
                    ? 'bg-slate-900 border-white ring-2 ring-brand-400/40 shadow-lg'
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

                <div className="text-[11px] text-slate-300 line-clamp-2">
                  {lesion.clinical_finding}
                </div>

                <div className="p-2 rounded-xl bg-brand-500/10 border border-brand-500/20 text-[10px] text-slate-200">
                  <span className="font-bold text-brand-300">Active: </span>
                  {lesion.recommended_active}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 8-Class Harmonized Dermatological Breakdown Meters (Responsive Grid) */}
      <div className="glass-panel rounded-3xl p-4 sm:p-6 border border-slate-800 space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
          <h3 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-brand-400" />
            <span>8-Class Comprehensive Dermatological Diagnostics</span>
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">
            Clinical detection threshold: ≥ 38%
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(analysis.conditions).map(([key, item]) => {
            const pct = Math.round(item.probability * 100);
            return (
              <div
                key={key}
                className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-200 truncate">
                      {item.display_name}
                    </span>
                    {item.is_detected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
                    )}
                  </div>
                  <span className="text-xs font-mono font-bold text-white shrink-0">
                    {pct}%
                  </span>
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

                <div className="flex items-center justify-between text-[9px]">
                  <span className={`px-1.5 py-0.5 rounded font-bold border ${getSeverityBadgeClass(item.severity_level)}`}>
                    {item.severity_level}
                  </span>
                  <span className="text-slate-500 font-mono">
                    {item.is_detected ? 'Active finding' : 'Sub-clinical'}
                  </span>
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
