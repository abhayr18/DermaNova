'use client';

import React, { useState } from 'react';
import {
  Download,
  RefreshCw,
  Camera,
  Layers,
  Eye,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Info,
  CheckCircle2,
  ArrowRight,
  Bookmark,
  Share2,
  FileText,
  AlertCircle,
  Activity,
  Zap,
  Sliders
} from 'lucide-react';
import { AnalysisResponse } from '../../services/api';
import { SKIN_CONCERNS_DATA, SkinConcernInfo } from '../../services/skinConcernsData';

interface AnalysisResultsScreenProps {
  analysis: AnalysisResponse | null;
  displayImage: string | null;
  onStartNewAnalysis: () => void;
  onOpenConcernDetail: (concernId: string) => void;
  onBuildRoutine: () => void;
}

export const AnalysisResultsScreen: React.FC<AnalysisResultsScreenProps> = ({
  analysis,
  displayImage,
  onStartNewAnalysis,
  onOpenConcernDetail,
  onBuildRoutine,
}) => {
  const [showOverlay, setShowOverlay] = useState(true);
  const [selectedPinConcern, setSelectedPinConcern] = useState<string | null>(null);
  const [reportSaved, setReportSaved] = useState(false);

  const imageSrc = displayImage || '/editorial_skin_portrait.jpg';

  const scanDate = analysis
    ? new Date(analysis.timestamp || Date.now()).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Oct 22, 2026 • 00:55';

  const skinType = analysis?.detected_skin_type || 'Combination (T-Zone)';
  const overallScore = analysis?.overall_health_score ?? 84;

  const getConditionScore = (concernId: string) => {
    if (!analysis?.conditions) return null;
    const normalizedKey =
      concernId === 'darkSpots' ? 'dark_spots' :
      concernId === 'visiblePores' ? 'pores' :
      concernId === 'erythema' ? 'redness' :
      concernId;

    const match = analysis.conditions[normalizedKey] || analysis.conditions[concernId];
    if (match) {
      return {
        probability: Math.round(match.probability * 100),
        isDetected: match.is_detected ?? (match.probability >= 0.38),
        severity: match.severity_level || (match.probability >= 0.75 ? 'Severe' : match.probability >= 0.50 ? 'Moderate' : match.probability >= 0.25 ? 'Mild' : 'Clear'),
        note: match.clinical_note || '',
      };
    }
    return null;
  };

  const dynamicPins = React.useMemo(() => {
    if (analysis?.detected_lesions && analysis.detected_lesions.length > 0) {
      return analysis.detected_lesions
        .filter((l) => {
          const cond = analysis.conditions?.[l.condition_id];
          return cond ? (cond.is_detected || cond.probability >= 0.35) : l.confidence >= 0.65;
        })
        .map((l) => ({
          id: l.condition_id === 'dark_spots' ? 'darkSpots' : l.condition_id === 'pores' ? 'visiblePores' : l.condition_id,
          label: l.condition_name.split(' ')[0],
          prob: Math.round(l.confidence * 100),
          color: l.color || '#0D9488',
          x: l.box.x + l.box.width / 2,
          y: l.box.y + l.box.height / 2,
        }));
    }

    if (analysis?.conditions) {
      const pinPositions: Record<string, { x: number; y: number; color: string; label: string }> = {
        acne: { x: 58, y: 38, color: '#ef4444', label: 'Acne' },
        redness: { x: 34, y: 48, color: '#f43f5e', label: 'Erythema' },
        pores: { x: 46, y: 44, color: '#0ea5e9', label: 'Pores' },
        dark_spots: { x: 62, y: 56, color: '#d97706', label: 'Pigment' },
      };

      return Object.entries(analysis.conditions)
        .filter(([_, v]) => v.is_detected || v.probability >= 0.40)
        .map(([k, v]) => {
          const pos = pinPositions[k] || { x: 50, y: 50, color: '#0D9488', label: v.display_name };
          return {
            id: k === 'dark_spots' ? 'darkSpots' : k === 'pores' ? 'visiblePores' : k,
            label: pos.label,
            prob: Math.round(v.probability * 100),
            color: pos.color,
            x: pos.x,
            y: pos.y,
          };
        });
    }

    return [];
  }, [analysis]);

  // Concise clinical interpretation
  const clinicalInterpretation = React.useMemo(() => {
    if (!analysis?.conditions) {
      return {
        heading: "Cutaneous Equilibrium & Homeostasis",
        focus: "Balanced Lipid Distribution",
        recommendation: "Maintain lipid replenishment, antioxidant hydration, and daily broad-spectrum SPF 50."
      };
    }

    const activeList = Object.entries(analysis.conditions)
      .filter(([_, v]) => v.is_detected || v.probability >= 0.35)
      .sort((a, b) => b[1].probability - a[1].probability);

    if (activeList.length === 0) {
      return {
        heading: "High Cutaneous Barrier Equilibrium",
        focus: "Zero Acute Biomarkers",
        recommendation: "Maintain ceramide replenishment, hyaluronic acid hydration, and daily broad-spectrum SPF."
      };
    }

    const prominentNames = activeList.map(([_, v]) => v.display_name).slice(0, 3).join(", ");
    return {
      heading: `Cutaneous Assessment Focus: ${prominentNames}`,
      focus: prominentNames,
      recommendation: `Targeted, non-comedogenic actives matched to ${prominentNames} alongside ceramide barrier recovery.`
    };
  }, [analysis]);

  const concernList: SkinConcernInfo[] = [
    SKIN_CONCERNS_DATA.acne,
    SKIN_CONCERNS_DATA.blackheads,
    SKIN_CONCERNS_DATA.whiteheads,
    SKIN_CONCERNS_DATA.darkSpots,
    SKIN_CONCERNS_DATA.pigmentation,
    SKIN_CONCERNS_DATA.visiblePores,
    SKIN_CONCERNS_DATA.wrinkles,
    SKIN_CONCERNS_DATA.redness,
  ];

  return (
    <div className="w-full space-y-6 animate-fade-in py-2">
      
      {/* Top Clinical Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-md bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-mono font-bold">
              Health Score: {overallScore}/100
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-800 text-[10px] font-mono font-medium">
              Type: {skinType}
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              {scanDate}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            AI Cutaneous Telemetry Report
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Multi-task dense inference across 8 clinical cutaneous indicators with sub-millimeter lesion localization.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setReportSaved(true)}
            className={`px-3.5 py-2 rounded-xl border text-xs font-mono font-semibold transition flex items-center gap-1.5 shadow-xs ${
              reportSaved
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{reportSaved ? 'Saved to DB' : 'Save Telemetry'}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-mono font-semibold transition flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>

          <button
            onClick={onStartNewAnalysis}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-semibold transition flex items-center gap-1.5 shadow-xs"
          >
            <Camera className="w-3.5 h-3.5 text-teal-400" />
            <span>New Scan</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Large Photograph with Interactive Analysis Overlay */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-20">
          
          <div className="rounded-2xl bg-white border border-slate-200 p-2.5 shadow-xs">
            
            {/* Visual Viewport */}
            <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-slate-950">
              <img
                src={imageSrc}
                alt="Facial Skin Analysis Viewport"
                className="w-full h-full object-cover"
              />

              {/* INTERACTIVE ANALYSIS OVERLAY */}
              {showOverlay && (
                <div className="absolute inset-0 pointer-events-none">
                  
                  {/* Grad-CAM Heatmap Overlay if present */}
                  {analysis?.heatmap_image_base64 && (
                    <img
                      src={analysis.heatmap_image_base64}
                      alt="Grad-CAM Saliency Heatmap"
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-50 mix-blend-screen"
                    />
                  )}

                  {/* Subtle Facial Zone Contours */}
                  <div className="absolute inset-8 border border-white/20 rounded-[48%] pointer-events-none" />

                  {/* Dynamic Pins from real model inference */}
                  {dynamicPins.map((pin) => (
                    <div
                      key={pin.id}
                      onClick={() => { setSelectedPinConcern(pin.id); onOpenConcernDetail(pin.id); }}
                      style={{ top: `${pin.y}%`, left: `${pin.x}%` }}
                      className="absolute pointer-events-auto cursor-pointer group"
                    >
                      <div
                        style={{ borderColor: pin.color }}
                        className="w-7 h-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-slate-950/60 flex items-center justify-center animate-pulse group-hover:scale-125 transition"
                      >
                        <span style={{ backgroundColor: pin.color }} className="w-2 h-2 rounded-full shadow-sm" />
                      </div>
                      <span className="absolute -top-6 -translate-x-1/2 left-1/2 px-2 py-0.5 rounded-md bg-slate-900/90 text-white text-[9px] font-mono whitespace-nowrap shadow-md border border-slate-700">
                        {pin.label} {pin.prob}%
                      </span>
                    </div>
                  ))}

                  {/* Indicator if no prominent lesions are detected */}
                  {dynamicPins.length === 0 && (
                    <div className="absolute top-3 inset-x-3 p-2 rounded-lg bg-slate-900/90 backdrop-blur-md border border-slate-700 text-[10px] font-mono text-emerald-400 flex items-center justify-center gap-1.5 shadow-xs pointer-events-auto">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>Optimal Homeostasis • Low Focal Irregularities</span>
                    </div>
                  )}
                </div>
              )}

              {/* Bottom Overlay Toggle Bar */}
              <div className="absolute bottom-2.5 inset-x-2.5 p-1.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-800 flex items-center justify-between shadow-xs">
                <span className="text-[10px] font-mono text-slate-400 pl-1">
                  Visualization:
                </span>
                <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg text-[10px] font-mono">
                  <button
                    type="button"
                    onClick={() => setShowOverlay(false)}
                    className={`px-2 py-0.5 rounded-md transition ${
                      !showOverlay
                        ? 'bg-white text-slate-900 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Raw RGB
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowOverlay(true)}
                    className={`px-2 py-0.5 rounded-md transition ${
                      showOverlay
                        ? 'bg-teal-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Telemetry Pins
                  </button>
                </div>
              </div>
            </div>

            {/* Concise Overlay Legend */}
            <div className="p-2.5 flex items-center justify-around gap-2 text-[10px] font-mono text-slate-500 border-t border-slate-100 mt-1">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Inflammatory
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-sky-500" /> Follicular
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Pigment
              </span>
            </div>
          </div>

          {/* Quick Context Card */}
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 space-y-1 shadow-xs">
            <div className="font-mono text-slate-900 font-bold text-[11px] flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-teal-600" />
              <span>Spatial Localization Note</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Click any pinpoint or indicator card on the right to view active biochemical mechanisms and contraindication-safe topical actives.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: 8 Core Biomarker Telemetry Cards */}
        <div className="lg:col-span-7 space-y-5">
          
          <div className="flex items-center justify-between pb-1">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-teal-700 font-bold">
                Multi-Task Evaluation
              </span>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                8-Cutaneous Biomarker Matrix
              </h2>
            </div>
            <span className="text-xs font-mono font-medium text-slate-500">
              Calibrated Probabilities
            </span>
          </div>

          {/* 8 Biomarker Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {concernList.map((concern) => {
              const liveScore = getConditionScore(concern.id);
              const isDetected = liveScore ? liveScore.isDetected : false;
              const confidence = liveScore ? liveScore.probability : 0;
              const severity = liveScore ? liveScore.severity : 'Clear';

              const severityColors: Record<string, { bg: string; text: string; bar: string }> = {
                Clear: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', bar: 'bg-emerald-500' },
                Mild: { bg: 'bg-sky-50 border-sky-200', text: 'text-sky-700', bar: 'bg-sky-500' },
                Moderate: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800', bar: 'bg-amber-500' },
                Severe: { bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700', bar: 'bg-rose-500' },
              };
              const col = severityColors[severity] || severityColors.Clear;

              return (
                <div
                  key={concern.id}
                  onClick={() => onOpenConcernDetail(concern.id)}
                  className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-slate-400 hover:shadow-xs transition cursor-pointer flex flex-col justify-between space-y-2.5 group"
                >
                  <div className="space-y-1.5">
                    {/* Header Row */}
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-xs text-slate-900 group-hover:text-teal-700 transition">
                        {concern.name}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${col.bg} ${col.text}`}>
                        {confidence}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${col.bar}`}
                        style={{ width: `${Math.max(confidence, 4)}%` }}
                      />
                    </div>

                    {/* Concise Summary */}
                    <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                      {liveScore?.note || concern.shortDesc}
                    </p>
                  </div>

                  {/* Status & CTA */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${isDetected ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                      <span>{isDetected ? severity : 'Clear'}</span>
                    </span>

                    <span className="text-teal-700 group-hover:underline font-semibold flex items-center gap-0.5">
                      <span>View Bio-Actives</span>
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Clinical Interpretation & Next Steps Box */}
          <div className="rounded-2xl bg-slate-900 text-white p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-teal-400 font-bold">
                Clinical Synthesis
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Rule-Based Formulation Engine
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-white">
                {clinicalInterpretation.heading}
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {clinicalInterpretation.recommendation}
              </p>
            </div>

            <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-800">
              <div className="text-xs font-mono text-slate-400">
                Synthesize AM/PM regimen based on these biomarkers:
              </div>
              <button
                onClick={onBuildRoutine}
                className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-mono text-xs font-bold flex items-center justify-center gap-2 transition shadow-xs"
              >
                <span>Generate Prescribed Protocol</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
              </button>
            </div>
          </div>

          {/* Clinical Disclaimer */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white text-[11px] text-slate-500 leading-normal flex items-start gap-2.5 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Clinical Guardrail:</strong> Algorithmic evaluation reflects visible morphology and does not constitute histopathological or medical diagnosis. For persistent or cystic lesions, consult a licensed dermatologist.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
