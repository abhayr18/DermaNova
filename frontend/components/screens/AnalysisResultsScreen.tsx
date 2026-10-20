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
  AlertCircle
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
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'October 20, 2026 • 16:48';

  const skinType = analysis?.detected_skin_type || 'Combination (T-Zone)';

  // All 8 core concerns in structured order
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

  const handleExportPDF = () => {
    alert('Exporting your comprehensive DermaNova Clinical Skin Report as a printable summary.');
  };

  return (
    <div className="w-full space-y-8 animate-fade-in py-2">
      
      {/* =======================================================================
          TOP SECTION: Heading, Date, Badges & Actions
         ======================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E8E8E1]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full bg-[#E8EFE9] text-[#304D40] text-[11px] font-mono font-medium">
              AI-generated insights
            </span>
            <span className="text-[11px] font-mono text-[#777D76]">
              {scanDate}
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#252923] font-normal tracking-tight">
            Your Skin Analysis
          </h1>
          <p className="text-xs text-[#777D76] mt-0.5">
            Multi-target visual evaluation of 8 core visible cutaneous markers.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setReportSaved(true)}
            className={`px-4 py-2.5 rounded-xl border text-xs font-mono transition flex items-center gap-1.5 shadow-sm ${
              reportSaved
                ? 'bg-[#E8EFE9] border-[#d6e0ce] text-[#304D40] font-semibold'
                : 'bg-white border-[#E8E8E1] text-[#252923] hover:bg-[#FAF9F6]'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{reportSaved ? 'Saved to Journal' : 'Save Report'}</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#FAF9F6] border border-[#E8E8E1] text-[#252923] text-xs font-mono transition flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>

          <button
            onClick={onStartNewAnalysis}
            className="px-5 py-2.5 rounded-xl bg-[#304D40] hover:bg-[#253d33] text-white text-xs font-mono font-medium transition flex items-center gap-1.5 shadow-sm"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>New Analysis</span>
          </button>
        </div>
      </div>

      {/* =======================================================================
          MAIN REPORT LAYOUT (Two-column desktop / stacked mobile)
         ======================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* =====================================================================
            LEFT COLUMN: Large Photograph with Interactive Analysis Overlay
           ===================================================================== */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
          
          <div className="rounded-3xl bg-white border border-[#E8E8E1] p-3 shadow-sm">
            
            {/* Visual Viewport */}
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#FAF9F6]">
              <img
                src={imageSrc}
                alt="Facial Skin Analysis Viewport"
                className="w-full h-full object-cover"
              />

              {/* INTERACTIVE ANALYSIS OVERLAY */}
              {showOverlay && (
                <div className="absolute inset-0 pointer-events-none">
                  
                  {/* Subtle Facial Zone Contours */}
                  <div className="absolute inset-10 border border-white/20 rounded-[48%] pointer-events-none" />

                  {/* Marker Pin 1: Acne (Cheek) */}
                  <div
                    onClick={() => { setSelectedPinConcern('acne'); onOpenConcernDetail('acne'); }}
                    className="absolute top-[38%] left-[58%] pointer-events-auto cursor-pointer group"
                  >
                    <div className="w-8 h-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#b85c3c] bg-[#b85c3c]/20 flex items-center justify-center animate-pulse group-hover:scale-125 transition">
                      <span className="w-2 h-2 rounded-full bg-[#b85c3c]" />
                    </div>
                    <span className="absolute -top-6 -translate-x-1/2 left-1/2 px-2 py-0.5 rounded-full bg-[#304D40] text-white text-[9px] font-mono whitespace-nowrap shadow-md">
                      Acne 74%
                    </span>
                  </div>

                  {/* Marker Pin 2: Redness (Malar Flush) */}
                  <div
                    onClick={() => { setSelectedPinConcern('redness'); onOpenConcernDetail('redness'); }}
                    className="absolute top-[48%] left-[34%] pointer-events-auto cursor-pointer group"
                  >
                    <div className="w-9 h-9 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#527665] bg-[#527665]/20 flex items-center justify-center group-hover:scale-125 transition">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#527665]" />
                    </div>
                    <span className="absolute -top-6 -translate-x-1/2 left-1/2 px-2 py-0.5 rounded-full bg-[#304D40] text-white text-[9px] font-mono whitespace-nowrap shadow-md">
                      Redness 82%
                    </span>
                  </div>

                  {/* Marker Pin 3: Dilated Pores (Nose / Inner Cheek) */}
                  <div
                    onClick={() => { setSelectedPinConcern('visiblePores'); onOpenConcernDetail('visiblePores'); }}
                    className="absolute top-[44%] left-[46%] pointer-events-auto cursor-pointer group"
                  >
                    <div className="w-7 h-7 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[#777D76] bg-white/30 flex items-center justify-center group-hover:scale-125 transition">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#252923]" />
                    </div>
                    <span className="absolute -bottom-6 -translate-x-1/2 left-1/2 px-2 py-0.5 rounded-full bg-white text-[#252923] border border-[#E8E8E1] text-[9px] font-mono whitespace-nowrap shadow-sm">
                      Pores 71%
                    </span>
                  </div>
                </div>
              )}

              {/* Bottom Overlay Toggle Bar */}
              <div className="absolute bottom-3 inset-x-3 p-2 rounded-xl bg-white/95 backdrop-blur-md border border-[#E8E8E1] flex items-center justify-between shadow-sm">
                <span className="text-[11px] font-mono text-[#777D76]">
                  View Mode:
                </span>
                <div className="flex items-center gap-1 bg-[#FAF9F6] p-0.5 rounded-lg border border-[#E8E8E1] text-[11px] font-mono">
                  <button
                    type="button"
                    onClick={() => setShowOverlay(false)}
                    className={`px-2.5 py-1 rounded-md transition ${
                      !showOverlay
                        ? 'bg-white text-[#252923] font-semibold shadow-xs'
                        : 'text-[#777D76] hover:text-[#252923]'
                    }`}
                  >
                    Original Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowOverlay(true)}
                    className={`px-2.5 py-1 rounded-md transition ${
                      showOverlay
                        ? 'bg-white text-[#252923] font-semibold shadow-xs'
                        : 'text-[#777D76] hover:text-[#252923]'
                    }`}
                  >
                    Analysis Overlay
                  </button>
                </div>
              </div>
            </div>

            {/* Concise Overlay Legend */}
            <div className="p-3 pt-3 flex flex-wrap items-center justify-around gap-2 text-[10px] font-mono text-[#777D76] border-t border-[#E8E8E1] mt-2">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#b85c3c]" /> Acne & Blemishes
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#527665]" /> Reactive Erythema
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#252923]" /> Pore Density
              </span>
            </div>
          </div>

          {/* Quick Context Card */}
          <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E8E8E1] text-xs text-[#777D76] space-y-1">
            <div className="font-mono text-[#252923] font-medium flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#527665]" />
              <span>Spatial Localization Note</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Pins indicate regions of interest evaluated by the multi-label visual architecture. Click any marker or concern card to open ingredient recommendations and clinical guidance.
            </p>
          </div>
        </div>

        {/* =====================================================================
            RIGHT COLUMN: Visible Skin Concerns (8 Core Cards)
           ===================================================================== */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#527665] font-semibold">
                Comprehensive Evaluation
              </span>
              <h2 className="font-serif text-2xl text-[#252923] font-normal">
                Visible Skin Concerns
              </h2>
            </div>
            <span className="text-xs font-mono text-[#777D76]">
              8 markers analyzed
            </span>
          </div>

          {/* 8 Core Concern Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {concernList.map((concern) => {
              const isDetected = concern.isDetectedInDemo;
              return (
                <div
                  key={concern.id}
                  onClick={() => onOpenConcernDetail(concern.id)}
                  className="p-4 rounded-2xl bg-white border border-[#E8E8E1] hover:border-[#527665]/60 hover:shadow-sm transition cursor-pointer flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-1.5">
                    
                    {/* Top Row: Concern Name & Status Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-mono text-xs font-bold text-[#252923] group-hover:text-[#527665] transition">
                        {concern.name}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono shrink-0 ${
                          isDetected
                            ? concern.sampleSeverity === 'Moderate'
                              ? 'bg-[#EEEAF5] text-[#304D40] border border-[#d5cbe4]'
                              : 'bg-[#E8EFE9] text-[#304D40] border border-[#d6e0ce]'
                            : 'bg-[#FAF9F6] text-[#777D76] border border-[#E8E8E1]'
                        }`}
                      >
                        {isDetected ? `${concern.sampleConfidence}% confidence` : 'Low probability'}
                      </span>
                    </div>

                    {/* Concise Plain-language explanation */}
                    <p className="text-[11px] text-[#777D76] leading-relaxed line-clamp-2">
                      {concern.shortDesc}
                    </p>
                  </div>

                  {/* Bottom Row: Visual Indicator & Learn More CTA */}
                  <div className="pt-2 border-t border-[#E8E8E1] flex items-center justify-between text-xs font-mono">
                    <span className="text-[10px] text-[#777D76] flex items-center gap-1">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isDetected ? 'bg-[#527665]' : 'bg-[#777D76]/40'
                        }`}
                      />
                      {isDetected ? 'Detected' : 'Not prominent'}
                    </span>

                    <span className="text-[#527665] group-hover:underline text-[11px] font-semibold flex items-center gap-0.5">
                      <span>Learn More</span>
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ===================================================================
              BOTTOM SECTION: What this may mean, Next steps & CTAs
             =================================================================== */}
          <div className="rounded-3xl bg-[#FAF9F6] border border-[#E8E8E1] p-6 sm:p-7 space-y-4">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#527665] font-semibold">
              Clinical Interpretation
            </span>
            <h3 className="font-serif text-xl text-[#252923] font-normal">
              What this may mean for your skin barrier
            </h3>
            <p className="text-xs sm:text-sm text-[#777D76] leading-relaxed">
              Your results reflect an active T-zone combined with superficial erythema on the lateral cheeks. This suggests a reactive barrier currently experiencing mild oxidative stress, where introducing calming ingredients (Azelaic Acid, Centella Asiatica) before stronger exfoliating acids will yield maximum comfort and cellular equilibrium.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-[#E8E8E1]">
              <div className="text-xs font-mono text-[#777D76]">
                Ready to review your tailored AM/PM sequence?
              </div>
              <button
                onClick={onBuildRoutine}
                className="px-6 py-3 rounded-2xl bg-[#304D40] hover:bg-[#253d33] text-white font-mono text-xs font-medium flex items-center justify-center gap-2 transition shadow-sm"
              >
                <span>Build My Skincare Routine</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scientific & Educational Disclaimer */}
          <div className="p-4 rounded-2xl border border-[#E8E8E1] bg-white text-[11px] text-[#777D76] leading-relaxed flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#527665] shrink-0 mt-0.5" />
            <span>
              <strong>Scientific Notice:</strong> Model confidence reflects pattern similarity to dermatological datasets and is not a clinical diagnosis. Absence of visible detection does not preclude underlying subclinical conditions. Consult a qualified dermatologist for personal medical advice.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
