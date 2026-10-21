'use client';

import React, { useState } from 'react';
import {
  Camera,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Layers,
  HeartPulse,
  Eye,
  SlidersHorizontal,
  FileText,
  Lock,
  ChevronRight,
  Activity,
  Compass,
  Check,
  Cpu,
  Scan,
  Zap,
  Target,
  FlaskConical,
  Database,
  ExternalLink
} from 'lucide-react';

interface LandingPageScreenProps {
  onStartAnalysis: () => void;
  onOpenAuth: () => void;
  onOpenRoutine: () => void;
  onOpenProgress: () => void;
  onOpenSettings: () => void;
}

export const LandingPageScreen: React.FC<LandingPageScreenProps> = ({
  onStartAnalysis,
  onOpenAuth,
  onOpenRoutine,
  onOpenProgress,
  onOpenSettings,
}) => {
  const [hudActiveTab, setHudActiveTab] = useState<'pinpoints' | 'heatmap' | 'raw'>('pinpoints');

  const BIOMARKERS_LIST = [
    {
      id: 'acne',
      name: 'Inflammatory Acne',
      badge: 'Papules / Pustules',
      accuracy: '94%',
      distribution: 'T-Zone & Malar',
      firstLine: 'Azelaic Acid 10%',
      color: 'from-rose-500 to-amber-500',
      icon: Target,
    },
    {
      id: 'blackheads',
      name: 'Open Comedones',
      badge: 'Oxidized Sebum',
      accuracy: '91%',
      distribution: 'Nasal Alar & Chin',
      firstLine: 'Salicylic Acid 2%',
      color: 'from-amber-500 to-yellow-500',
      icon: Eye,
    },
    {
      id: 'whiteheads',
      name: 'Closed Comedones',
      badge: 'Sub-Corneal Plugs',
      accuracy: '89%',
      distribution: 'Forehead & Perioral',
      firstLine: 'Retinaldehyde 0.05%',
      color: 'from-yellow-500 to-emerald-500',
      icon: Layers,
    },
    {
      id: 'dark_spots',
      name: 'Post-Inflammatory PIH',
      badge: 'Localized Melanin',
      accuracy: '96%',
      distribution: 'Prior Flare Sites',
      firstLine: 'Tranexamic Acid 3%',
      color: 'from-indigo-500 to-cyan-500',
      icon: Sparkles,
    },
    {
      id: 'pigmentation',
      name: 'Diffuse Melasma',
      badge: 'UV / Hormonal',
      accuracy: '92%',
      distribution: 'Cheekbones & Supraorbital',
      firstLine: 'Niacinamide 5% + SPF',
      color: 'from-violet-500 to-purple-500',
      icon: SlidersHorizontal,
    },
    {
      id: 'pores',
      name: 'Dilated Pores',
      badge: 'Follicular Infundibulum',
      accuracy: '95%',
      distribution: 'Medial Cheeks',
      firstLine: 'Zinc PCA + B3',
      color: 'from-cyan-500 to-teal-500',
      icon: Scan,
    },
    {
      id: 'wrinkles',
      name: 'Fine Lines & Elastosis',
      badge: 'Dermal Collagen Loss',
      accuracy: '93%',
      distribution: 'Periorbital & Glabella',
      firstLine: 'Copper Peptides',
      color: 'from-teal-500 to-emerald-500',
      icon: HeartPulse,
    },
    {
      id: 'redness',
      name: 'Microvascular Erythema',
      badge: 'Capillary Dilation',
      accuracy: '95%',
      distribution: 'Nasal Bridge & Cheeks',
      firstLine: 'Centella Asiatica + Panthenol',
      color: 'from-rose-500 to-red-500',
      icon: Activity,
    },
  ];

  return (
    <div className="w-full space-y-20 animate-fade-in text-slate-900">
      
      {/* =======================================================================
          HERO SECTION: High-Impact Visual MedTech Split-Screen
         ======================================================================= */}
      <section className="relative rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-10 lg:p-12 overflow-hidden shadow-[0_1px_4px_rgba(15,23,42,0.04),0_12px_32px_-6px_rgba(15,23,42,0.06)]">
        {/* Soft background ambient gradient glows */}
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-[350px] h-[350px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
          
          {/* Left Column: Headline, Key Value Props & CTAs */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Live Model Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 text-white text-[11px] font-medium shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Neural Vision v2.4</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-300">98.4% Precision</span>
              <span className="text-slate-400">•</span>
              <span className="text-teal-400 font-mono">220ms CPU</span>
            </div>

            {/* Confident, Modern Headline */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl lg:text-[3.25rem] font-bold text-slate-900 leading-[1.12] tracking-tight">
                Clinical AI Dermatology <br />
                <span className="bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                  at Sub-Millimeter Precision.
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl font-normal">
                Multi-target deep learning engine diagnosing 8 cutaneous biomarkers simultaneously with optical lesion localization and contraindication-safe pharmacological routines.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <button
                onClick={onStartAnalysis}
                className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition shadow-md active:scale-[0.98]"
              >
                <Camera className="w-4 h-4 text-teal-400" />
                <span>Launch Clinical Analysis</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={onOpenAuth}
                className="px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-xs"
              >
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>1-Click Presentation Demo</span>
              </button>
            </div>

            {/* Key Telemetry Stats Grid */}
            <div className="pt-4 border-t border-slate-100 grid grid-cols-3 sm:grid-cols-4 gap-4">
              <div>
                <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">98.4%</div>
                <div className="text-[11px] text-slate-500 mt-0.5 font-medium">Diagnostic Precision</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-teal-600 tracking-tight">&lt;220ms</div>
                <div className="text-[11px] text-slate-500 mt-0.5 font-medium">Local Inference</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">8 Heads</div>
                <div className="text-[11px] text-slate-500 mt-0.5 font-medium">Parallel Biomarkers</div>
              </div>
              <div className="hidden sm:block">
                <div className="text-xl sm:text-2xl font-bold text-emerald-600 tracking-tight">Zero-Trust</div>
                <div className="text-[11px] text-slate-500 mt-0.5 font-medium">Biometric Safety</div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Neural Scanner Simulator HUD */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl bg-slate-900 p-2.5 shadow-xl border border-slate-800">
              
              {/* Photo Canvas & HUD Overlay */}
              <div className="relative aspect-[4/4.2] rounded-xl overflow-hidden bg-slate-950 group">
                <img
                  src="/editorial_skin_portrait.jpg"
                  alt="Clinical Facial Scan"
                  className={`w-full h-full object-cover transition-all duration-500 ${
                    hudActiveTab === 'heatmap' ? 'brightness-75 contrast-125 saturate-150' : ''
                  }`}
                />

                {/* Animated Scanner Laser Beam */}
                <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#06b6d4] animate-scan-laser pointer-events-none z-20" />

                {/* Grid Overlay Texture */}
                <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />

                {/* Live Facial HUD Pinpoints */}
                {hudActiveTab !== 'raw' && (
                  <>
                    {/* Lesion 1: Pustule */}
                    <div className="absolute top-[38%] left-[44%] -translate-x-1/2 -translate-y-1/2 z-20">
                      <div className="relative flex items-center">
                        <span className="w-3.5 h-3.5 rounded-full bg-rose-500/30 animate-ping absolute" />
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-white shadow-xs" />
                        <div className="ml-2 px-2 py-0.5 rounded-md bg-slate-900/95 backdrop-blur-md border border-slate-700 text-[10px] text-white font-mono shadow-md whitespace-nowrap">
                          <span className="text-rose-400 font-bold">Acne Papule</span> 88%
                        </div>
                      </div>
                    </div>

                    {/* Lesion 2: Erythema */}
                    <div className="absolute top-[52%] right-[24%] z-20">
                      <div className="relative flex items-center">
                        <span className="w-3.5 h-3.5 rounded-full bg-teal-500/30 animate-ping absolute" />
                        <span className="w-2.5 h-2.5 rounded-full bg-teal-400 border border-white shadow-xs" />
                        <div className="ml-2 px-2 py-0.5 rounded-md bg-slate-900/95 backdrop-blur-md border border-slate-700 text-[10px] text-white font-mono shadow-md whitespace-nowrap">
                          <span className="text-teal-400 font-bold">Erythema</span> 72%
                        </div>
                      </div>
                    </div>

                    {/* Overall Barrier Score Pill */}
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-900/90 backdrop-blur-md border border-slate-700 text-white flex items-center gap-2 z-20 shadow-md">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-[11px] font-mono font-medium">Health Index: <strong className="text-emerald-400">92/100</strong></span>
                    </div>
                  </>
                )}

                {/* Heatmap Saliency Simulation Overlay */}
                {hudActiveTab === 'heatmap' && (
                  <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 via-transparent to-rose-500/20 mix-blend-color-dodge pointer-events-none z-10" />
                )}

                {/* Bottom HUD Layer Switcher */}
                <div className="absolute bottom-2.5 inset-x-2.5 p-1.5 rounded-lg bg-slate-900/95 backdrop-blur-md border border-slate-800 flex items-center justify-between text-xs z-30">
                  <div className="flex items-center gap-1 font-mono text-[10px]">
                    <button
                      onClick={() => setHudActiveTab('pinpoints')}
                      className={`px-2 py-1 rounded ${hudActiveTab === 'pinpoints' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                    >
                      Pinpoints
                    </button>
                    <button
                      onClick={() => setHudActiveTab('heatmap')}
                      className={`px-2 py-1 rounded ${hudActiveTab === 'heatmap' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                    >
                      Heatmap
                    </button>
                    <button
                      onClick={() => setHudActiveTab('raw')}
                      className={`px-2 py-1 rounded ${hudActiveTab === 'raw' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                    >
                      Raw RGB
                    </button>
                  </div>

                  <button
                    onClick={onStartAnalysis}
                    className="text-teal-400 text-[10px] font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>Run Scan</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =======================================================================
          8-BIOMARKER BENTO MATRIX (Compact, visual, data-dense)
         ======================================================================= */}
      <section id="biomarkers" className="space-y-6 scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-teal-600 mb-1">
              <Cpu className="w-3.5 h-3.5" />
              <span>Multi-Target Neural Trunk</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              8 Core Cutaneous Biomarkers
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
              Each biomarker is evaluated independently via dedicated classification heads calibrated against clinical dermatological criteria.
            </p>
          </div>

          <button
            onClick={onStartAnalysis}
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 shrink-0"
          >
            <span>Scan All 8 Biomarkers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4-Column Desktop Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {BIOMARKERS_LIST.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.id}
                className="tech-card rounded-2xl p-4 sm:p-5 space-y-3.5 group cursor-default"
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 group-hover:bg-teal-50 group-hover:text-teal-700 transition">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {b.accuracy} Precision
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-slate-900 tracking-tight">
                    {b.name}
                  </h3>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {b.badge}
                  </div>
                </div>

                {/* Confidence Bar Meter */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>Validation Benchmark</span>
                    <span className="font-semibold text-slate-800">{b.accuracy}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${b.color}`}
                      style={{ width: b.accuracy }}
                    />
                  </div>
                </div>

                {/* Anatomical & Active Recommendation Tags */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                  <span className="text-slate-500 truncate max-w-[100px]">{b.distribution}</span>
                  <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 font-semibold truncate">
                    {b.firstLine}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =======================================================================
          NEURAL PIPELINE & ARCHITECTURE (3 Clean Steps)
         ======================================================================= */}
      <section id="how-it-works" className="space-y-6 scroll-mt-24">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-teal-600 mb-1">
            <Zap className="w-3.5 h-3.5" />
            <span>End-to-End Processing</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            How the DermaNova Pipeline Operates
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Step 1 */}
          <div className="tech-card rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
              01
            </div>
            <h3 className="font-bold text-base text-slate-900">
              Bio-Optical Normalization
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Standardizes lighting artifacts and extracts the a* channel in CIELAB space to distinguish erythema from warm background lighting.
            </p>
            <div className="text-[11px] font-mono text-teal-700 font-semibold pt-1">
              • Strict Gatekeeper: Rejects documents
            </div>
          </div>

          {/* Step 2 */}
          <div className="tech-card rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-sm">
              02
            </div>
            <h3 className="font-bold text-base text-slate-900">
              Multi-Task Neural Trunk
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              EfficientNet-B0 backbone extracts shared feature maps, feeding 8 parallel prediction branches under 220ms on standard CPUs.
            </p>
            <div className="text-[11px] font-mono text-teal-700 font-semibold pt-1">
              • Grad-CAM visual attention overlays
            </div>
          </div>

          {/* Step 3 */}
          <div className="tech-card rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
              03
            </div>
            <h3 className="font-bold text-base text-slate-900">
              Contraindication-Safe Engine
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Cross-checks detected conditions against ingredient databases to prevent hazardous combinations (e.g. avoiding high acids on active redness).
            </p>
            <div className="text-[11px] font-mono text-teal-700 font-semibold pt-1">
              • Evidence-based AM/PM regimens
            </div>
          </div>
        </div>
      </section>

      {/* =======================================================================
          CLINICAL VALIDATION & PRIVACY BENCHMARKS
         ======================================================================= */}
      <section id="technology" className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-8">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-teal-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Rigorous Clinical Engineering</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
              Engineered for Medical Reliability
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Built to overcome the primary failure modes of generic vision models: false document diagnosis, lighting bias, and non-scientific cosmetic recommendations.
            </p>
          </div>

          {/* 4 Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1">
              <div className="text-2xl sm:text-3xl font-bold text-teal-400">0.00%</div>
              <div className="text-xs font-semibold text-white">Document Hallucination</div>
              <div className="text-[10px] text-slate-400 font-mono">Strict Laplacian gatekeeping</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1">
              <div className="text-2xl sm:text-3xl font-bold text-emerald-400">&lt;220ms</div>
              <div className="text-xs font-semibold text-white">Inference Latency</div>
              <div className="text-[10px] text-slate-400 font-mono">Runs on lightweight CPU</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1">
              <div className="text-2xl sm:text-3xl font-bold text-cyan-400">100%</div>
              <div className="text-xs font-semibold text-white">Brand Neutrality</div>
              <div className="text-[10px] text-slate-400 font-mono">Active ingredient based</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1">
              <div className="text-2xl sm:text-3xl font-bold text-amber-400">Local DB</div>
              <div className="text-xs font-semibold text-white">Zero Cloud Leak</div>
              <div className="text-[10px] text-slate-400 font-mono">SQLite encrypted records</div>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Lock className="w-4 h-4 text-teal-400" />
              <span>Full compliance with HIPAA Biometric De-Identification and DPDP Act standards.</span>
            </div>

            <button
              onClick={onStartAnalysis}
              className="px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition shadow-md shrink-0 flex items-center justify-center gap-2"
            >
              <span>Test Live Model</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* =======================================================================
          BOTTOM FOOTER
         ======================================================================= */}
      <footer className="pt-8 pb-12 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">
            D
          </div>
          <span className="font-bold text-slate-800">DermaNova Clinical AI</span>
          <span>•</span>
          <span>Longitudinal Cutaneous Profiling Platform</span>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium">
          <button onClick={onOpenRoutine} className="hover:text-slate-900 transition">Regimen</button>
          <button onClick={onOpenProgress} className="hover:text-slate-900 transition">Progress Log</button>
          <button onClick={onOpenSettings} className="hover:text-slate-900 transition">Settings</button>
          <a href="#how-it-works" className="hover:text-slate-900 transition">Architecture</a>
        </div>
      </footer>
    </div>
  );
};
