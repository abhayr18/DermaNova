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
  Target,
  Award
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
    if (score >= 80) return 'text-[#425335] border-[#cbd7c1] bg-[#f4f6f1]';
    if (score >= 60) return 'text-[#1a2217] border-[#e6e2d8] bg-white';
    if (score >= 45) return 'text-amber-700 border-amber-200 bg-amber-50';
    return 'text-[#b85c3c] border-[#f3d3c7] bg-[#fbf0eb]';
  };

  const getSeverityBadgeClass = (severity: string) => {
    if (severity.includes('Clear')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (severity.includes('Mild-to-Moderate')) return 'bg-[#f4f6f1] text-[#425335] border-[#cbd7c1]';
    if (severity.includes('Mild') || severity.includes('Early')) return 'bg-white text-[#556050] border-[#e6e2d8]';
    if (severity.includes('Moderate')) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  // Distinct condition tags present in detected lesions
  const uniqueConditionIds = Array.from(new Set(lesions.map((l) => l.condition_id)));

  // Fallback image if null
  const displayImage = originalImage || '/demo_face.jpg';

  return (
    <div className="w-full space-y-6">
      {/* Emergency Referral Alert Banner */}
      {analysis.requires_clinical_referral && (
        <div className="p-4 rounded-2xl bg-[#fff5f5] border border-[#fed7d7] text-[#9b2c2c] text-xs sm:text-sm flex items-start gap-3 shadow-sm">
          <ShieldAlert className="w-5 h-5 text-[#b85c3c] shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-[#9b2c2c]">Clinical Triage Alert</h4>
            <p className="text-xs text-[#9b2c2c]/90 mt-1">
              Elevated inflammatory erythema or high lesion density detected. We recommend reviewing these findings with a licensed dermatologist.
            </p>
          </div>
        </div>
      )}

      {/* Top Summary Cards (Clean Minimal White: 1 col mobile -> 3 cols desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Overall Health Score */}
        <div className="rounded-3xl p-5 bg-white border border-[#e6e2d8] flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-mono-clinical text-[#637852] uppercase tracking-wider font-semibold">
              Skin Barrier Index
            </span>
            <div className="text-3xl font-mono-clinical font-bold text-[#1a2217] mt-0.5">
              {analysis.overall_health_score} <span className="text-xs font-normal text-[#6b7764]">/ 100</span>
            </div>
            <p className="text-[10px] text-[#6b7764] mt-0.5 font-mono-clinical">
              {analysis.overall_health_score >= 75 ? 'Optimal epidermal resilience' : 'Targeted active care indicated'}
            </p>
          </div>
          <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center font-mono-clinical font-bold text-lg ${getScoreColor(analysis.overall_health_score)} shadow-sm`}>
            {analysis.overall_health_score}%
          </div>
        </div>

        {/* Detected Skin Type */}
        <div className="rounded-3xl p-5 bg-white border border-[#e6e2d8] flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-mono-clinical text-[#637852] uppercase tracking-wider font-semibold">
              Biophysical Skin Type
            </span>
            <div className="text-xl font-normal text-[#1a2217] mt-0.5 font-serif-luxury">
              {analysis.detected_skin_type}
            </div>
            <p className="text-[10px] text-[#6b7764] mt-0.5 font-mono-clinical">
              Sebum & pore distribution analysis
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#f4f6f1] border border-[#d6e0ce] flex items-center justify-center text-[#425335]">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* Total Pinpointed Lesions */}
        <div className="rounded-3xl p-5 bg-white border border-[#e6e2d8] flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-mono-clinical text-[#637852] uppercase tracking-wider font-semibold">
              Localized Disease Sites
            </span>
            <div className="text-xl font-mono-clinical font-bold text-[#1a2217] mt-0.5 flex items-center gap-1.5">
              <span>{lesions.length} Sites Identified</span>
            </div>
            <p className="text-[10px] text-[#6b7764] mt-0.5 font-mono-clinical">
              Exact bounding coordinates
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#f4f6f1] border border-[#d6e0ce] flex items-center justify-center text-[#425335]">
            <Crosshair className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* HERO SECTION: Interactive Disease Localization Map & Inspector */}
      <div className="rounded-3xl p-5 sm:p-7 bg-white border border-[#e6e2d8] shadow-sm space-y-4">
        {/* Title & Controls Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#f0ede6] pb-4">
          <div>
            <h3 className="font-serif-luxury text-lg sm:text-xl font-normal text-[#1a2217] flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-[#637852]" />
              <span>Interactive Disease Localization Map</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-clinical font-semibold bg-[#f4f6f1] text-[#425335] border border-[#cbd7c1]">
                Live Coordinates
              </span>
            </h3>
            <p className="text-xs text-[#6b7764] mt-0.5">
              Tap any bounding box on the photo to inspect clinical findings & targeted actives
            </p>
          </div>

          {/* Quick Toggles */}
          <div className="flex items-center gap-2 text-xs flex-wrap font-mono-clinical">
            <button
              onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 ${
                showBoundingBoxes
                  ? 'bg-[#1c2417] border-[#1c2417] text-white shadow-sm'
                  : 'bg-[#faf9f5] border-[#e6e2d8] text-[#556050]'
              }`}
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>Pins ({showBoundingBoxes ? 'ON' : 'OFF'})</span>
            </button>

            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 ${
                showHeatmap
                  ? 'bg-[#1c2417] border-[#1c2417] text-white shadow-sm'
                  : 'bg-[#faf9f5] border-[#e6e2d8] text-[#556050]'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Heatmap ({showHeatmap ? 'ON' : 'OFF'})</span>
            </button>

            <button
              onClick={() => setIsZoomModalOpen(true)}
              className="px-3 py-1.5 rounded-xl border border-[#ded9cd] bg-[#faf9f5] hover:bg-white text-[#1a2217] text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
              title="Open full-screen inspection view"
            >
              <Maximize2 className="w-3.5 h-3.5 text-[#637852]" />
              <span className="hidden sm:inline">Zoom Photo</span>
            </button>
          </div>
        </div>

        {/* Condition Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-[11px] font-mono-clinical text-[#6b7764] font-semibold mr-1 flex items-center gap-1 shrink-0">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          <button
            onClick={() => setConditionFilter('all')}
            className={`px-3 py-1 rounded-xl text-xs font-mono-clinical font-semibold transition shrink-0 ${
              conditionFilter === 'all'
                ? 'bg-[#1c2417] text-white shadow-sm'
                : 'bg-[#faf9f5] text-[#556050] hover:text-[#1a2217] border border-[#e6e2d8]'
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
                className={`px-3 py-1 rounded-xl text-xs font-mono-clinical font-semibold capitalize transition flex items-center gap-1.5 shrink-0 ${
                  conditionFilter === cId
                    ? 'bg-[#1c2417] text-white shadow-sm'
                    : 'bg-[#faf9f5] text-[#556050] hover:text-[#1a2217] border border-[#e6e2d8]'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: matchLesion?.color || '#637852' }}
                />
                <span>{cId.replace('_', ' ')} ({count})</span>
              </button>
            );
          })}
        </div>

        {/* RESPONSIVE CLINICAL WORKSTATION GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* COLUMN 1: Completely Unobstructed Photo Viewport */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-3">
            <div className="relative aspect-[4/3] sm:aspect-[16/11] w-full rounded-3xl overflow-hidden bg-neutral-900 border border-[#e6e2d8] shadow-md select-none group">
              {/* Base Patient Image */}
              {displayImage ? (
                <img
                  src={displayImage}
                  alt="Patient skin scan"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 text-neutral-500 text-xs font-mono-clinical">
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
              <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 pointer-events-none">
                <div className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-[#e6e2d8] text-[10px] font-mono-clinical font-semibold text-[#1a2217] flex items-center gap-1.5 shadow-sm">
                  <Crosshair className="w-3 h-3 text-[#637852]" />
                  <span>{filteredLesions.length} Sites Pinpointed</span>
                </div>
                {activeLesion && (
                  <div className="hidden sm:flex px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md border border-[#e6e2d8] text-[10px] font-mono-clinical font-medium text-[#1a2217] items-center gap-1 shadow-sm">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeLesion.color }} />
                    <span>#{activeIndex} Active</span>
                  </div>
                )}
              </div>

              {/* Top-Right Expand Button */}
              <button
                onClick={() => setIsZoomModalOpen(true)}
                className="absolute top-3 right-3 z-20 p-2 rounded-xl bg-white/90 hover:bg-white border border-[#e6e2d8] text-[#1a2217] backdrop-blur-md transition shadow-sm"
                title="Fullscreen inspection view"
              >
                <ZoomIn className="w-4 h-4 text-[#637852]" />
              </button>

              {/* OVERLAY: Disease Bounding Boxes & Callout Pins */}
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
                          ? 'ring-4 ring-white shadow-[0_0_20px_rgba(255,255,255,0.8)] scale-[1.03] z-30'
                          : 'hover:scale-105 hover:ring-2 hover:ring-white/80 z-10'
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
                      <div
                        style={{ backgroundColor: lesion.color }}
                        className={`absolute ${
                          isNearTop ? '-bottom-5' : '-top-4'
                        } left-1/2 -translate-x-1/2 px-1.5 sm:px-2 py-0.5 rounded-full text-white text-[8.5px] sm:text-[9.5px] font-bold font-mono-clinical tracking-tight flex items-center gap-1 shadow-md whitespace-nowrap transition-transform pointer-events-none ${
                          isSelected ? 'scale-110 ring-2 ring-white' : 'opacity-90'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
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

                      {/* Corner crosshairs for clinical precision */}
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
              <div className="p-3.5 rounded-2xl bg-[#faf9f5] border border-[#e6e2d8] flex items-center gap-3">
                <span className="text-[11px] font-mono-clinical text-[#6b7764] shrink-0 flex items-center gap-1.5 font-medium">
                  <Eye className="w-3.5 h-3.5 text-[#637852]" />
                  Heatmap Opacity:
                </span>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={heatmapOpacity}
                  onChange={(e) => setHeatmapOpacity(parseFloat(e.target.value))}
                  className="w-full accent-[#637852] cursor-pointer"
                />
                <span className="text-xs font-mono-clinical font-bold text-[#1a2217] shrink-0">
                  {Math.round(heatmapOpacity * 100)}%
                </span>
              </div>
            )}

            {/* Mobile Horizontal Quick-Select Ribbon */}
            <div className="lg:hidden space-y-2">
              <div className="flex items-center justify-between text-xs px-1">
                <span className="text-[11px] font-mono-clinical font-semibold text-[#637852] uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-[#637852]" />
                  Select Lesion to Inspect ({filteredLesions.length})
                </span>
                <button
                  onClick={() => setIsMobileDetailsExpanded(!isMobileDetailsExpanded)}
                  className="text-[11px] text-[#637852] font-semibold flex items-center gap-1 hover:underline font-mono-clinical"
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
                      className={`px-3 py-1.5 rounded-xl border text-xs font-mono-clinical font-semibold whitespace-nowrap transition flex items-center gap-1.5 shrink-0 ${
                        isSelected
                          ? 'bg-[#1c2417] text-white border-[#1c2417] shadow-sm'
                          : 'bg-white border-[#e6e2d8] text-[#556050] hover:text-[#1a2217]'
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: lesion.color }}
                      />
                      <span>#{index + 1} {lesion.condition_name.split('(')[0].trim()}</span>
                      <span className="text-[10px] opacity-80">
                        {Math.round(lesion.confidence * 100)}%
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* COLUMN 2: Selected Disease Finding Inspector Panel */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-4">
            {activeLesion ? (
              <div
                className={`p-5 sm:p-6 rounded-3xl bg-white border border-[#e6e2d8] shadow-sm space-y-4 transition-all ${
                  isMobileDetailsExpanded ? 'block' : 'hidden lg:block'
                }`}
              >
                {/* Active Lesion Header */}
                <div className="flex items-start justify-between gap-3 border-b border-[#f0ede6] pb-3.5">
                  <div className="flex items-start gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 mt-1 shadow-sm"
                      style={{ backgroundColor: activeLesion.color }}
                    />
                    <div>
                      <div className="text-[10px] font-mono-clinical font-semibold uppercase tracking-wider text-[#637852]">
                        Site #{activeIndex} of {filteredLesions.length}
                      </div>
                      <h4 className="font-serif-luxury text-base sm:text-lg font-normal text-[#1a2217] leading-tight mt-0.5">
                        {activeLesion.condition_name}
                      </h4>
                      <p className="text-xs text-[#6b7764] mt-0.5 flex items-center gap-1 font-mono-clinical">
                        <span>Zone:</span>
                        <span className="text-[#1a2217] font-semibold">{activeLesion.location_label}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm sm:text-base font-mono-clinical font-bold text-[#1a2217]">
                      {Math.round(activeLesion.confidence * 100)}%
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono-clinical font-semibold border inline-block mt-0.5 ${getSeverityBadgeClass(activeLesion.severity)}`}>
                      {activeLesion.severity}
                    </span>
                  </div>
                </div>

                {/* Confidence Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono-clinical text-[#6b7764]">
                    <span>Diagnostic Certainty</span>
                    <span className="text-[#1a2217] font-bold">{Math.round(activeLesion.confidence * 100)}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#f0ede6] overflow-hidden">
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
                <div className="p-3.5 rounded-2xl bg-[#faf9f5] border border-[#e6e2d8] space-y-1">
                  <span className="text-[10px] font-mono-clinical font-semibold uppercase tracking-wider text-[#637852] flex items-center gap-1">
                    <Info className="w-3 h-3 text-[#637852]" /> Clinical Assessment
                  </span>
                  <p className="text-xs text-[#384333] leading-relaxed">
                    {activeLesion.clinical_finding}
                  </p>
                </div>

                {/* Targeted Pharmacological Active Ingredient */}
                <div className="p-3.5 rounded-2xl bg-[#fbf0eb] border border-[#f3d3c7] space-y-1">
                  <span className="text-[10px] font-mono-clinical font-semibold uppercase tracking-wider text-[#b85c3c] flex items-center gap-1">
                    <Pill className="w-3.5 h-3.5 text-[#b85c3c] shrink-0" /> Targeted Spot Active
                  </span>
                  <div className="text-xs font-bold text-[#1a2217]">
                    {activeLesion.recommended_active}
                  </div>
                  <p className="text-[10px] text-[#556050] leading-tight">
                    Apply directly to this pinpointed zone after gentle cleansing to calm local inflammatory cascades.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-3xl bg-white border border-[#e6e2d8] text-center space-y-2 shadow-sm">
                <Crosshair className="w-8 h-8 text-[#8b9784] mx-auto" />
                <p className="text-xs text-[#6b7764] font-mono-clinical">No disease spots match current filter.</p>
              </div>
            )}

            {/* Desktop Pinpointed Sites Quick Selector (Side List) */}
            <div className="hidden lg:block p-4 sm:p-5 rounded-3xl bg-white border border-[#e6e2d8] space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between text-xs border-b border-[#f0ede6] pb-2">
                <span className="font-semibold text-[#1a2217] font-mono-clinical flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#637852]" />
                  All Pinpointed Sites ({filteredLesions.length})
                </span>
                <span className="text-[10px] text-[#8b9784] font-mono-clinical">Click to focus</span>
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
                          ? 'bg-[#f4f6f1] border-[#637852] text-[#1a2217] shadow-sm font-semibold'
                          : 'bg-[#faf9f5] border-[#e6e2d8] text-[#556050] hover:text-[#1a2217] hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: lesion.color }}
                        />
                        <span className="font-medium text-[#1a2217] truncate max-w-[150px]">
                          #{index + 1} {lesion.condition_name.split('(')[0].trim()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] text-[#6b7764] truncate max-w-[100px] font-mono-clinical">
                          {lesion.location_label}
                        </span>
                        <span className="font-mono-clinical font-semibold text-[#637852] text-[11px]">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-white border border-[#e6e2d8] shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-[#e6e2d8] flex items-center justify-between bg-[#faf9f5]">
              <div className="flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-[#637852]" />
                <h3 className="font-serif-luxury text-sm font-normal text-[#1a2217]">
                  High-Precision Disease Localization Inspection
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#f4f6f1] text-[#425335] border border-[#cbd7c1] font-mono-clinical">
                  {filteredLesions.length} Sites
                </span>
              </div>
              <button
                onClick={() => setIsZoomModalOpen(false)}
                className="p-1.5 rounded-xl bg-white hover:bg-[#f4f3ed] text-[#556050] hover:text-[#1a2217] transition border border-[#e6e2d8]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image Viewport */}
            <div className="relative flex-1 min-h-[50vh] sm:min-h-[65vh] bg-neutral-900 overflow-hidden flex items-center justify-center select-none">
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
                        className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-white text-[9px] font-bold font-mono-clinical shadow-lg flex items-center gap-1"
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
            <div className="px-5 py-3.5 border-t border-[#e6e2d8] bg-[#faf9f5] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="text-[#556050] font-mono-clinical">
                {activeLesion ? (
                  <span>
                    Active: <strong className="text-[#1a2217]">#{activeIndex} {activeLesion.condition_name}</strong> ({activeLesion.location_label})
                  </span>
                ) : (
                  <span>Click any bounding box to focus</span>
                )}
              </div>
              <button
                onClick={() => setIsZoomModalOpen(false)}
                className="px-5 py-2 rounded-full bg-[#1c2417] hover:bg-[#2d3b25] text-white font-mono-clinical font-medium transition shadow-sm"
              >
                Close Fullscreen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive Lesion Sites & Spot Treatments (Responsive Grid) */}
      <div className="rounded-3xl p-5 sm:p-7 bg-white border border-[#e6e2d8] space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#f0ede6] pb-3">
          <h3 className="font-serif-luxury text-sm sm:text-base font-normal text-[#1a2217] flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#637852]" />
            <span>Identified Disease Sites & Spot Actives ({filteredLesions.length})</span>
          </h3>
          <span className="text-[11px] font-mono-clinical text-[#6b7764]">Click any card to pinpoint on photo</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredLesions.map((lesion, index) => {
            const isSelected = activeLesion?.id === lesion.id;
            return (
              <div
                key={lesion.id}
                onClick={() => setSelectedLesionId(lesion.id)}
                className={`p-4 rounded-2xl border transition cursor-pointer space-y-2.5 ${
                  isSelected
                    ? 'bg-[#f4f6f1] border-[#637852] ring-2 ring-[#637852]/20 shadow-sm'
                    : 'bg-[#faf9f5] border-[#e6e2d8] hover:border-[#cbd7c1] hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: lesion.color }}
                    />
                    <span className="text-xs font-bold text-[#1a2217]">
                      #{index + 1} {lesion.condition_name}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono-clinical font-semibold border ${getSeverityBadgeClass(lesion.severity)}`}>
                    {lesion.severity} • {Math.round(lesion.confidence * 100)}%
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono-clinical text-[#6b7764]">
                  <span className="text-[#637852] font-semibold">📍 {lesion.location_label}</span>
                </div>

                <div className="text-[11px] text-[#556050] line-clamp-2">
                  {lesion.clinical_finding}
                </div>

                <div className="p-2.5 rounded-xl bg-[#fbf0eb] border border-[#f3d3c7] text-[10px] text-[#1a2217]">
                  <span className="font-semibold text-[#b85c3c]">Active: </span>
                  {lesion.recommended_active}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 8-Class Harmonized Dermatological Breakdown Meters */}
      <div className="rounded-3xl p-5 sm:p-7 bg-white border border-[#e6e2d8] space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#f0ede6] pb-3">
          <h3 className="font-serif-luxury text-sm sm:text-base font-normal text-[#1a2217] flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#637852]" />
            <span>8-Class Comprehensive Dermatological Diagnostics</span>
          </h3>
          <span className="text-[11px] font-mono-clinical text-[#6b7764]">
            Clinical threshold: ≥ 38%
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {Object.entries(analysis.conditions).map(([key, item]) => {
            const pct = Math.round(item.probability * 100);
            return (
              <div
                key={key}
                className="p-4 rounded-2xl bg-[#faf9f5] border border-[#e6e2d8] hover:border-[#cbd7c1] hover:bg-white transition space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#1a2217] truncate">
                      {item.display_name}
                    </span>
                    {item.is_detected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#637852] animate-pulse shrink-0" />
                    )}
                  </div>
                  <span className="text-xs font-mono-clinical font-bold text-[#1a2217] shrink-0">
                    {pct}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1.5 rounded-full bg-[#f0ede6] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      pct >= 70
                        ? 'bg-gradient-to-r from-[#b85c3c] to-amber-500'
                        : pct >= 40
                        ? 'bg-gradient-to-r from-[#637852] to-[#8fa382]'
                        : 'bg-stone-300'
                    }`}
                    style={{ width: `${Math.max(pct, 5)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[9px] font-mono-clinical">
                  <span className={`px-1.5 py-0.5 rounded font-semibold border ${getSeverityBadgeClass(item.severity_level)}`}>
                    {item.severity_level}
                  </span>
                  <span className="text-[#6b7764]">
                    {item.is_detected ? 'Active Finding' : 'Sub-Clinical'}
                  </span>
                </div>

                <p className="text-[10px] text-[#6b7764] line-clamp-2 leading-relaxed">
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
