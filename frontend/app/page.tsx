'use client';

import React, { useState, useEffect } from 'react';
import { SingleCloseUpCapture } from '../components/SingleCloseUpCapture';
import { DiagnosticDashboard } from '../components/DiagnosticDashboard';
import { CosmeticsFitScanner } from '../components/CosmeticsFitScanner';
import { PersonalizedKitCard } from '../components/PersonalizedKitCard';
import { RoutineRecommendations } from '../components/RoutineRecommendations';
import { SkinJourneyTimeline } from '../components/SkinJourneyTimeline';
import { AuthModal } from '../components/AuthModal';
import { IntakeQuizModal } from '../components/IntakeQuizModal';
import { DermChatDrawer } from '../components/DermChatDrawer';
import {
  apiService,
  AnalysisResponse,
  RecommendationResponse,
  UserAccount,
  PatientProfile
} from '../services/api';
import {
  Home as HomeIcon,
  Camera,
  FileText,
  Clock,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  UserCheck,
  Flame,
  User,
  LogOut,
  ChevronRight,
  BrainCircuit,
  SlidersHorizontal,
  CheckCircle2,
  Award,
  Users,
  Activity,
  HeartHandshake,
  Focus,
  HeartPulse,
  Crosshair,
  BadgeCheck,
  ArrowRight,
  Sun,
  Layers,
  Leaf,
  Scan,
  Compass,
  Check
} from 'lucide-react';

type MobileTab = 'home' | 'scan' | 'fit' | 'regimen' | 'journey';

const FALLBACK_DEMO_ANALYSIS: AnalysisResponse = {
  analysis_id: "demo-scan-8821",
  timestamp: new Date().toISOString(),
  overall_health_score: 82,
  detected_skin_type: "Combination",
  top_concerns: ["Inflammatory Acne", "Post-Inflammatory Erythema", "Localized PIH"],
  acne_severity_grade: "Mild-to-Moderate (Grade II)",
  face_detected: true,
  clinical_disclaimer: "DermaNova provides AI-assisted educational skincare assessment with botanical and pharmacologic integrity. Consult a board-certified dermatologist for medical diagnosis.",
  requires_clinical_referral: false,
  heatmap_image_base64: undefined,
  conditions: {
    acne: {
      condition_id: "acne",
      display_name: "Inflammatory Acne",
      probability: 0.88,
      severity_level: "Moderate",
      is_detected: true,
      clinical_note: "Erythematous papules and pustules localized across the cheekbones and chin area."
    },
    redness: {
      condition_id: "redness",
      display_name: "Facial Redness & Erythema",
      probability: 0.74,
      severity_level: "Mild-to-Moderate",
      is_detected: true,
      clinical_note: "Microvascular capillary dilation indicating epidermal barrier stress."
    },
    dark_spots: {
      condition_id: "dark_spots",
      display_name: "Dark Spots (Localized PIH)",
      probability: 0.65,
      severity_level: "Mild",
      is_detected: true,
      clinical_note: "Post-inflammatory melanocyte hyperactivity from resolved papules."
    },
    pores: {
      condition_id: "pores",
      display_name: "Dilated Pores",
      probability: 0.58,
      severity_level: "Mild",
      is_detected: true,
      clinical_note: "Enlarged follicular orifices across nasal bridge and T-zone."
    },
    blackheads: {
      condition_id: "blackheads",
      display_name: "Blackheads (Open Comedones)",
      probability: 0.46,
      severity_level: "Mild",
      is_detected: true,
      clinical_note: "Open comedones with oxidized sebum plugs along the nasal crest."
    },
    whiteheads: {
      condition_id: "whiteheads",
      display_name: "Whiteheads (Closed Comedones)",
      probability: 0.35,
      severity_level: "Clear",
      is_detected: false,
      clinical_note: "No clinically significant closed comedonal clustering detected."
    },
    pigmentation: {
      condition_id: "pigmentation",
      display_name: "Pigmentation (Diffuse Melasma)",
      probability: 0.28,
      severity_level: "Clear",
      is_detected: false,
      clinical_note: "Uniform epidermal melanin dispersion without diffuse melasma patches."
    },
    wrinkles: {
      condition_id: "wrinkles",
      display_name: "Fine Lines & Wrinkles",
      probability: 0.22,
      severity_level: "Clear",
      is_detected: false,
      clinical_note: "High epidermal elasticity and robust stratum corneum moisture retention."
    }
  },
  detected_lesions: [
    {
      id: "lesion-1",
      condition_id: "acne",
      condition_name: "Inflammatory Acne (Papule/Pustule)",
      confidence: 0.94,
      severity: "Moderate",
      location_label: "Right Cheekbone",
      box: { x: 58, y: 38, width: 14, height: 14 },
      color: "#b85c3c",
      clinical_finding: "Active inflammatory papule with localized erythema and microcomedone obstruction.",
      recommended_active: "2.5% Micronized Benzoyl Peroxide / Salicylic Acid 2%"
    },
    {
      id: "lesion-2",
      condition_id: "acne",
      condition_name: "Inflammatory Acne (Pustule)",
      confidence: 0.89,
      severity: "Moderate",
      location_label: "Left Cheekbone",
      box: { x: 26, y: 44, width: 13, height: 13 },
      color: "#b85c3c",
      clinical_finding: "Follicular pustular lesion exhibiting superficial leukocyte infiltration.",
      recommended_active: "2% Salicylic Acid BHA Spot Gel"
    },
    {
      id: "lesion-3",
      condition_id: "redness",
      condition_name: "Facial Erythema / Barrier Redness",
      confidence: 0.82,
      severity: "Mild-to-Moderate",
      location_label: "Nasal Crest & Malar Area",
      box: { x: 42, y: 48, width: 16, height: 15 },
      color: "#d4a373",
      clinical_finding: "Superficial capillary congestion indicating slight cutaneous barrier compromise.",
      recommended_active: "10% Azelaic Acid + Centella Asiatica & Ceramide NP"
    },
    {
      id: "lesion-4",
      condition_id: "dark_spots",
      condition_name: "Dark Spots (Localized PIH)",
      confidence: 0.86,
      severity: "Mild",
      location_label: "Lower Right Jawline",
      box: { x: 62, y: 64, width: 12, height: 12 },
      color: "#aaab87",
      clinical_finding: "Post-inflammatory hyperpigmented macule with residual melanin deposition.",
      recommended_active: "Niacinamide 5% + Tranexamic Acid 3% Serum"
    },
    {
      id: "lesion-5",
      condition_id: "pores",
      condition_name: "Dilated Pores (Sebum Congestion)",
      confidence: 0.77,
      severity: "Mild",
      location_label: "Central T-Zone",
      box: { x: 43, y: 28, width: 14, height: 12 },
      color: "#8fa382",
      clinical_finding: "Enlarged follicular infundibula associated with localized sebum pooling.",
      recommended_active: "Niacinamide 2% + Zinc PCA 1% Clarifying Fluid"
    }
  ]
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<MobileTab>('home');
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Restore session on load
  useEffect(() => {
    const checkSession = async () => {
      const token = apiService.getToken();
      if (token) {
        try {
          const res = await apiService.getMe();
          setCurrentUser(res.user);
        } catch (e) {
          apiService.clearToken();
          setCurrentUser(null);
        }
      }
    };
    checkSession();
  }, []);

  const handleLogout = () => {
    apiService.clearToken();
    setCurrentUser(null);
    setAnalysisResult(null);
    setRecommendations(null);
  };

  // Handle uploaded or captured single close-up skin photo
  const handleImageReady = async (image: string | File) => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      let analysis: AnalysisResponse;
      if (typeof image === 'string') {
        setSelectedImage(image);
        analysis = await apiService.analyzeBase64(image);
      } else {
        const objectUrl = URL.createObjectURL(image);
        setSelectedImage(objectUrl);
        analysis = await apiService.analyzeFile(image);
      }

      setAnalysisResult(analysis);

      // Fetch personalized recommendations
      const conditionProbMap: Record<string, number> = {};
      Object.entries(analysis.conditions).forEach(([k, v]) => {
        conditionProbMap[k] = v.probability;
      });

      const recs = await apiService.getRecommendations({
        detected_conditions: conditionProbMap,
        skin_type: analysis.detected_skin_type,
        has_sensitive_skin:
          analysis.detected_skin_type === 'Sensitive' ||
          (currentUser?.profile?.has_sensitive_skin ?? false),
      });
      setRecommendations(recs);

      // Auto-switch to Scan results tab
      setActiveTab('scan');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(
        err?.response?.data?.detail ||
          'Diagnostic engine encountered an issue. You can test the Sample Face Demo mode.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Instant Demo Mode (with sample patient face and pinpointing)
  const handleRunDemo = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setSelectedImage('/demo_face.jpg');

    try {
      let demoAnalysis: AnalysisResponse;
      try {
        demoAnalysis = await apiService.getDemoAnalysis();
      } catch (backendErr) {
        console.warn('Backend demo API not responding, using validated fallback dataset:', backendErr);
        demoAnalysis = FALLBACK_DEMO_ANALYSIS;
      }

      setAnalysisResult(demoAnalysis);

      const conditionProbMap: Record<string, number> = {};
      Object.entries(demoAnalysis.conditions).forEach(([k, v]) => {
        conditionProbMap[k] = v.probability;
      });

      try {
        const recs = await apiService.getRecommendations({
          detected_conditions: conditionProbMap,
          skin_type: demoAnalysis.detected_skin_type,
          has_sensitive_skin: false,
        });
        setRecommendations(recs);
      } catch (recErr) {
        console.warn('Recommendation API offline, using standard botanical & pharmacologic guidance');
      }

      setActiveTab('scan');
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Could not run demo scan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navara-dark text-navara-cream flex flex-col font-sans selection:bg-navara-sage selection:text-navara-dark">
      
      {/* =========================================================================
          NAVARA BOTANICAL LUXURY NAVIGATION HEADER
          Deep charcoal olive, alabaster typography, refined micro-borders
         ========================================================================= */}
      <header className="sticky top-0 z-40 bg-[#1c1f1a]/95 backdrop-blur-xl border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-3 text-left group"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#232e1b] border border-navara-sage/30 flex items-center justify-center text-navara-alabaster font-serif-luxury text-base shadow-lg shadow-black/40 group-hover:border-navara-sage transition-all">
                N
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif-luxury text-lg sm:text-xl text-navara-alabaster tracking-tight font-normal">
                    Navara <span className="font-sans text-xs uppercase tracking-widest text-navara-sage font-semibold">Derm</span>
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-mono-clinical px-2 py-0.5 rounded-full bg-[#232e1b] text-navara-sage border border-navara-sage/30">
                    <Leaf className="w-2.5 h-2.5" /> Lóvi Intelligence
                  </span>
                </div>
                <div className="text-[10px] sm:text-[11px] text-navara-cream/60 font-mono-clinical">
                  {currentUser
                    ? `Patient: ${currentUser.full_name?.split(' ')[0] || 'User'}`
                    : 'Botanical Sanctuary & 11+ Conditions AI Engine'}
                </div>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 p-1.5 rounded-full bg-[#232e1b]/60 border border-white/10 text-xs font-mono-clinical">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition ${
                activeTab === 'home'
                  ? 'bg-navara-alabaster text-navara-dark font-semibold shadow-md'
                  : 'text-navara-cream/70 hover:text-navara-alabaster hover:bg-white/5'
              }`}
            >
              <HomeIcon className="w-3.5 h-3.5" />
              <span>Sanctuary</span>
            </button>

            <button
              onClick={() => setActiveTab('scan')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition relative ${
                activeTab === 'scan'
                  ? 'bg-navara-alabaster text-navara-dark font-semibold shadow-md'
                  : 'text-navara-cream/70 hover:text-navara-alabaster hover:bg-white/5'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Face Scan</span>
              {analysisResult && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-0.5" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('fit')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition ${
                activeTab === 'fit'
                  ? 'bg-navara-alabaster text-navara-dark font-semibold shadow-md'
                  : 'text-navara-cream/70 hover:text-navara-alabaster hover:bg-white/5'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Cosmetics Fit Score</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-navara-sage/20 text-navara-sage">
                0% Affiliation
              </span>
            </button>

            <button
              onClick={() => setActiveTab('regimen')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition ${
                activeTab === 'regimen'
                  ? 'bg-navara-alabaster text-navara-dark font-semibold shadow-md'
                  : 'text-navara-cream/70 hover:text-navara-alabaster hover:bg-white/5'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>My Regimen</span>
            </button>

            <button
              onClick={() => setActiveTab('journey')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition ${
                activeTab === 'journey'
                  ? 'bg-navara-alabaster text-navara-dark font-semibold shadow-md'
                  : 'text-navara-cream/70 hover:text-navara-alabaster hover:bg-white/5'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Skin Journey</span>
            </button>
          </nav>

          {/* Right Header Badges / Auth Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Streak Badge */}
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#232e1b] border border-white/10 text-navara-cream text-xs font-mono-clinical">
              <Flame className="w-3.5 h-3.5 text-navara-terracotta fill-navara-terracotta/20 animate-pulse" />
              <span>14d</span>
            </div>

            {/* Skin Profile Quiz (Desktop) */}
            <button
              onClick={() => setIsIntakeOpen(true)}
              className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#232e1b]/70 hover:bg-[#232e1b] border border-white/10 text-navara-cream text-xs font-mono-clinical transition"
            >
              <HeartPulse className="w-3.5 h-3.5 text-navara-sage" />
              <span>Skin Profile Quiz</span>
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#232e1b] border border-white/10 text-xs text-navara-alabaster">
                  <div className="w-5 h-5 rounded-full bg-navara-moss border border-navara-sage/40 flex items-center justify-center text-[10px] font-mono-clinical text-navara-sage uppercase">
                    {currentUser.full_name?.charAt(0) || 'P'}
                  </div>
                  <span className="font-mono-clinical text-xs">{currentUser.full_name?.split(' ')[0]}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full bg-[#232e1b] border border-white/10 text-navara-cream/60 hover:text-navara-terracotta transition"
                  title="Log out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-4 py-2 rounded-full bg-navara-alabaster hover:bg-white text-navara-dark font-mono-clinical font-semibold text-xs transition shadow-md"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Global Error Banner */}
      {errorMsg && (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-4">
          <div className="p-4 rounded-2xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-between">
            <span>{errorMsg}</span>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-xs text-rose-300 underline font-semibold ml-2"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          MAIN APPLICATION CONTENT AREA
         ========================================================================= */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12">
        
        {/* =====================================================================
            TAB 1: SANCTUARY HOME (NAVARA EDITORIAL + LOVI 3 SUPERPOWERS)
           ===================================================================== */}
        {activeTab === 'home' && (
          <div className="space-y-10 animate-fade-in">
            
            {/* HERO EDITORIAL SECTION (Navara Aesthetic + Lovi Engine) */}
            <div className="relative rounded-3xl bg-[#232e1b]/40 border border-white/10 p-6 sm:p-12 overflow-hidden shadow-2xl backdrop-blur-xl">
              {/* Subtle Botanical Glow */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-navara-moss/30 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-navara-terracotta/10 rounded-full blur-3xl pointer-events-none" />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                {/* Left Column: Navara Editorial Headline */}
                <div className="lg:col-span-7 space-y-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#232e1b] border border-navara-sage/30 text-navara-sage text-[10px] font-mono-clinical uppercase tracking-widest">
                    <Leaf className="w-3 h-3 text-navara-sage" />
                    Clinical Dermatology Meets Botanical Sanctuary
                  </div>

                  <h1 className="font-serif-luxury text-3xl sm:text-5xl text-navara-alabaster leading-[1.15] font-normal tracking-tight">
                    A clinical standard for transformative, calm skin.
                  </h1>

                  <p className="text-xs sm:text-sm text-navara-cream/80 leading-relaxed max-w-xl font-sans">
                    Powered by Lóvi's 11+ skin conditions pinpointing engine, 0%-affiliation cosmetic fit scoring, and medical board protocols. No sponsored brands, no obscured lesion views, pure clinical clarity.
                  </p>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                    <button
                      onClick={() => setActiveTab('scan')}
                      className="px-6 py-3.5 rounded-full bg-navara-alabaster hover:bg-white text-navara-dark font-mono-clinical font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-xl shadow-black/30 active:scale-95"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Start 11+ Condition Scan</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setActiveTab('fit')}
                      className="px-5 py-3.5 rounded-full bg-[#1c1f1a]/80 hover:bg-[#232e1b] border border-navara-sage/30 text-navara-cream font-mono-clinical font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition"
                    >
                      <SlidersHorizontal className="w-4 h-4 text-navara-sage" />
                      <span>Check Cosmetics Fit Score</span>
                    </button>
                  </div>

                  {/* Micro Trust Stats */}
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-[11px] font-mono-clinical text-navara-cream/60">
                    <span className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-navara-sage" /> 11+ Conditions Detected
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-navara-sage" /> 0% Brand Affiliation
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-navara-sage" /> 582ms Inference
                    </span>
                  </div>
                </div>

                {/* Right Column: Visual Showcase Card */}
                <div className="lg:col-span-5 hidden sm:block">
                  <div
                    onClick={() => setActiveTab('scan')}
                    className="p-4 rounded-3xl bg-[#1c1f1a]/90 border border-white/10 shadow-2xl relative cursor-pointer group hover:border-navara-sage/40 transition"
                  >
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black/40">
                      <img
                        src="/demo_face.jpg"
                        alt="AI Disease Pinpointing Demonstration"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                      />
                      
                      {/* Reticle Callout 1 */}
                      <div className="absolute top-[38%] left-[58%] w-14 h-14 border-2 border-navara-terracotta rounded-xl bg-navara-terracotta/20 flex items-center justify-center ring-2 ring-white/40">
                        <span className="absolute -top-3.5 px-2 py-0.5 rounded-full bg-navara-terracotta text-white text-[9px] font-mono-clinical font-semibold">
                          Acne 94%
                        </span>
                      </div>

                      {/* Reticle Callout 2 */}
                      <div className="absolute top-[48%] left-[42%] w-16 h-14 border-2 border-navara-sage rounded-xl bg-navara-sage/20 flex items-center justify-center ring-2 ring-white/40">
                        <span className="absolute -top-3.5 px-2 py-0.5 rounded-full bg-navara-sage text-navara-dark text-[9px] font-mono-clinical font-semibold">
                          Redness 82%
                        </span>
                      </div>

                      <div className="absolute bottom-3 inset-x-3 px-3.5 py-2.5 rounded-xl bg-[#1c1f1a]/90 backdrop-blur-md border border-white/10 text-xs text-navara-cream flex items-center justify-between">
                        <span className="font-mono-clinical text-navara-alabaster">Unobstructed Pinpoint Canvas</span>
                        <span className="text-navara-sage font-mono-clinical text-[11px]">Interactive Mode ➔</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================================
                LOVI'S 3 SUPERPOWERS SHOWCASE (As featured on lovi.care)
               ================================================================= */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 px-1">
                <div>
                  <span className="text-[10px] font-mono-clinical uppercase tracking-widest text-navara-sage">
                    The 3 Core Superpowers
                  </span>
                  <h2 className="font-serif-luxury text-2xl sm:text-3xl text-navara-alabaster font-normal tracking-tight">
                    How Lóvi & Navara Transform Your Routine
                  </h2>
                </div>
                <p className="text-xs text-navara-cream/60 max-w-sm">
                  Clinical precision without commercial bias, designed for barrier longevity.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                
                {/* Superpower 1: 11+ Conditions Scanner */}
                <div
                  onClick={() => setActiveTab('scan')}
                  className="rounded-3xl bg-[#1c1f1a]/80 border border-white/10 p-6 sm:p-7 space-y-4 cursor-pointer hover:border-navara-sage/40 transition group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono-clinical text-navara-sage">SUPERPOWER 01</span>
                    <span className="w-8 h-8 rounded-full bg-[#232e1b] border border-white/10 flex items-center justify-center text-navara-alabaster group-hover:scale-110 transition">
                      <Camera className="w-4 h-4" />
                    </span>
                  </div>
                  <h3 className="font-serif-luxury text-xl text-navara-alabaster font-normal">
                    11+ Skin Conditions AI Face Scanner
                  </h3>
                  <p className="text-xs text-navara-cream/70 leading-relaxed">
                    Instantly detects inflammatory acne, erythema, hyperpigmentation, dilated pores, blackheads, whiteheads, fine lines, and dehydration with spatial coordinates and unobstructed focus.
                  </p>
                  <div className="pt-2 flex items-center gap-1.5 text-xs font-mono-clinical text-navara-sage group-hover:text-navara-alabaster transition">
                    <span>Try Face Scanner</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Superpower 2: Cosmetics Fit Score */}
                <div
                  onClick={() => setActiveTab('fit')}
                  className="rounded-3xl bg-[#1c1f1a]/80 border border-white/10 p-6 sm:p-7 space-y-4 cursor-pointer hover:border-navara-sage/40 transition group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono-clinical text-navara-sage">SUPERPOWER 02</span>
                    <span className="w-8 h-8 rounded-full bg-[#232e1b] border border-white/10 flex items-center justify-center text-navara-alabaster group-hover:scale-110 transition">
                      <SlidersHorizontal className="w-4 h-4" />
                    </span>
                  </div>
                  <h3 className="font-serif-luxury text-xl text-navara-alabaster font-normal">
                    0% Affiliation Cosmetics Fit Score
                  </h3>
                  <p className="text-xs text-navara-cream/70 leading-relaxed">
                    Check if your cleanser, serum, or moisturizer truly fits your barrier. We carry zero brand sponsorships and match safer, better-fit alternative formulations based on INCI toxicological safety.
                  </p>
                  <div className="pt-2 flex items-center gap-1.5 text-xs font-mono-clinical text-navara-sage group-hover:text-navara-alabaster transition">
                    <span>Scan Product Fit</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Superpower 3: 24/7 AI Cosmetologist */}
                <div
                  onClick={() => setIsChatOpen(true)}
                  className="rounded-3xl bg-[#1c1f1a]/80 border border-white/10 p-6 sm:p-7 space-y-4 cursor-pointer hover:border-navara-sage/40 transition group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono-clinical text-navara-sage">SUPERPOWER 03</span>
                    <span className="w-8 h-8 rounded-full bg-[#232e1b] border border-white/10 flex items-center justify-center text-navara-alabaster group-hover:scale-110 transition">
                      <MessageSquare className="w-4 h-4" />
                    </span>
                  </div>
                  <h3 className="font-serif-luxury text-xl text-navara-alabaster font-normal">
                    24/7 AI Cosmetologist & UV Defense
                  </h3>
                  <p className="text-xs text-navara-cream/70 leading-relaxed">
                    Daily skin feeling check-ins (Great / Fine / Not good), local UV Index defense alerts, ingredient layering conflict checks, and board-certified medical guidance in real time.
                  </p>
                  <div className="pt-2 flex items-center gap-1.5 text-xs font-mono-clinical text-navara-sage group-hover:text-navara-alabaster transition">
                    <span>Open Consultation</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================================
                MEDICAL BOARD & BOTANICAL INGREDIENT STANDARDS
               ================================================================= */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#232e1b]/30 border border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 backdrop-blur-md">
              <div className="space-y-2 max-w-xl">
                <span className="text-[10px] font-mono-clinical uppercase tracking-widest text-navara-sage">
                  Medical Board & Formulations
                </span>
                <h3 className="font-serif-luxury text-2xl text-navara-alabaster font-normal">
                  Supervised by Dermatologists & Cosmetic Chemists
                </h3>
                <p className="text-xs text-navara-cream/70 leading-relaxed">
                  Every recommendation adheres to CIR (Cosmetic Ingredient Review), ECHA, and FDA safety regulations. Our multi-label deep learning models are calibrated against over 10,000+ biopsy-verified dermatological cases.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="px-4 py-2 rounded-2xl bg-[#1c1f1a]/80 border border-white/10 text-center">
                  <div className="font-serif-luxury text-xl text-navara-alabaster">50+</div>
                  <div className="text-[10px] font-mono-clinical text-navara-sage">Panel MDs</div>
                </div>
                <div className="px-4 py-2 rounded-2xl bg-[#1c1f1a]/80 border border-white/10 text-center">
                  <div className="font-serif-luxury text-xl text-navara-alabaster">0%</div>
                  <div className="text-[10px] font-mono-clinical text-navara-sage">Sponsored Bias</div>
                </div>
                <div className="px-4 py-2 rounded-2xl bg-[#1c1f1a]/80 border border-white/10 text-center">
                  <div className="font-serif-luxury text-xl text-navara-alabaster">11+</div>
                  <div className="text-[10px] font-mono-clinical text-navara-sage">Conditions</div>
                </div>
              </div>
            </div>

            {/* Quick Consultation Intake Quiz Trigger */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#232e1b]/80 to-[#1c1f1a]/90 border border-navara-sage/30 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-2xl">
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono-clinical uppercase tracking-widest text-navara-sage">Personalized Triage</span>
                <h4 className="font-serif-luxury text-xl text-navara-alabaster font-normal">
                  Medical Consultation & Barrier Sensitivity Questionnaire
                </h4>
                <p className="text-xs text-navara-cream/70 max-w-xl">
                  Inform the diagnostic engine regarding retinoid tolerance, pregnancy safety, and daily sun exposure habits.
                </p>
              </div>
              <button
                onClick={() => setIsIntakeOpen(true)}
                className="px-6 py-3 rounded-full bg-navara-alabaster hover:bg-white text-navara-dark font-mono-clinical font-semibold text-xs sm:text-sm transition shrink-0 shadow-lg"
              >
                Complete 2-Min Quiz
              </button>
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 2: 1-PHOTO CLOSE-UP SCAN & DIAGNOSTIC REPORT
           ===================================================================== */}
        {activeTab === 'scan' && (
          <div className="space-y-6 animate-fade-in">
            {/* Capture Interface */}
            <SingleCloseUpCapture
              onImageReady={handleImageReady}
              onRunDemo={handleRunDemo}
              isLoading={isLoading}
            />

            {/* Loading Spinner */}
            {isLoading && (
              <div className="p-8 sm:p-12 rounded-3xl bg-[#1c1f1a]/90 border border-white/10 text-center space-y-4 shadow-2xl">
                <div className="w-12 h-12 border-3 border-navara-sage/20 border-t-navara-sage rounded-full animate-spin mx-auto" />
                <h3 className="font-serif-luxury text-lg text-navara-alabaster font-normal">
                  Detecting Disease Sites & Bounding Coordinates...
                </h3>
                <p className="text-xs font-mono-clinical text-navara-cream/60">
                  Lóvi Multi-Task Convolutional Inference + Localized Spatial Peak Reticles (582ms)
                </p>
              </div>
            )}

            {/* Diagnostic Results Dashboard (Completely Unobstructed Disease Point-Out) */}
            {analysisResult && !isLoading && (
              <div className="space-y-6 animate-fade-in">
                <DiagnosticDashboard
                  analysis={analysisResult}
                  originalImage={selectedImage}
                />

                {recommendations && (
                  <div className="p-6 rounded-3xl bg-[#232e1b]/50 border border-navara-sage/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
                    <div className="space-y-1">
                      <div className="font-serif-luxury text-lg text-navara-alabaster">
                        Your Doctor-Verified Botanical & Active Regimen is Ready
                      </div>
                      <div className="text-xs text-navara-cream/70">
                        Targeted spot actives, barrier lipids, and AM/PM sequence formulated for your skin profile.
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('regimen')}
                      className="px-6 py-3 rounded-full bg-navara-alabaster hover:bg-white text-navara-dark font-mono-clinical font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-lg shrink-0"
                    >
                      <span>View Custom Regimen</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            TAB 3: COSMETICS FIT SCANNER (LOVI'S FLAGSHIP 0% AFFILIATION ENGINE)
           ===================================================================== */}
        {activeTab === 'fit' && (
          <div className="space-y-6 animate-fade-in">
            <CosmeticsFitScanner
              userSkinType={analysisResult?.detected_skin_type || 'Combination'}
              userConcerns={analysisResult?.top_concerns || ['Inflammatory Acne', 'Facial Redness']}
            />
          </div>
        )}

        {/* =====================================================================
            TAB 4: PERSONALIZED CLINICAL REGIMEN
           ===================================================================== */}
        {activeTab === 'regimen' && (
          <div className="space-y-6 animate-fade-in">
            {recommendations ? (
              <>
                <PersonalizedKitCard
                  recommendations={recommendations}
                  patientName={currentUser?.full_name || 'Verified Patient'}
                  skinType={analysisResult?.detected_skin_type || 'Combination'}
                />

                <RoutineRecommendations
                  recommendations={recommendations}
                />
              </>
            ) : (
              <div className="p-10 rounded-3xl bg-[#1c1f1a]/80 border border-white/10 text-center space-y-4 max-w-lg mx-auto shadow-2xl">
                <div className="w-14 h-14 rounded-2xl bg-navara-moss/40 border border-navara-sage/20 text-navara-sage flex items-center justify-center mx-auto">
                  <FileText className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="font-serif-luxury text-xl text-navara-alabaster">No Regimen Formulated Yet</h2>
                  <p className="text-xs text-navara-cream/60 mt-1 max-w-xs mx-auto">
                    Complete a 1-photo skin scan or check sample face to generate your doctor-reviewed routine.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('scan')}
                  className="px-5 py-2.5 rounded-full bg-navara-alabaster hover:bg-white text-navara-dark font-mono-clinical font-semibold text-xs"
                >
                  Start Skin Scan Now
                </button>
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            TAB 5: LONGITUDINAL SKIN JOURNEY
           ===================================================================== */}
        {activeTab === 'journey' && (
          <div className="space-y-6 animate-fade-in">
            <SkinJourneyTimeline
              isAuthenticated={!!currentUser}
              onOpenAuth={() => setIsAuthOpen(true)}
            />
          </div>
        )}
      </main>

      {/* Floating 24/7 AI Cosmetologist Assistant Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-30 w-14 h-14 rounded-full bg-navara-alabaster hover:bg-white text-navara-dark shadow-2xl flex items-center justify-center font-bold transition transform active:scale-95 hover:scale-105 p-3.5 border border-navara-sage/40"
        title="Chat with 24/7 AI Cosmetologist"
      >
        <MessageSquare className="w-6 h-6 text-navara-dark" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-navara-terracotta text-white rounded-full text-[10px] font-mono-clinical flex items-center justify-center font-bold">
          1
        </span>
      </button>

      {/* =========================================================================
          MOBILE BOTTOM NAVIGATION BAR (FIXED ON MOBILE ONLY: md:hidden)
         ========================================================================= */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 h-16 bg-[#1c1f1a]/95 backdrop-blur-xl border-t border-white/10 flex items-center justify-around px-2 shadow-2xl">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition ${
            activeTab === 'home' ? 'text-navara-alabaster font-semibold' : 'text-navara-cream/50 hover:text-navara-cream'
          }`}
        >
          <HomeIcon className="w-4 h-4" />
          <span className="text-[9px] font-mono-clinical">Sanctuary</span>
        </button>

        <button
          onClick={() => setActiveTab('scan')}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition ${
            activeTab === 'scan' ? 'text-navara-alabaster font-semibold' : 'text-navara-cream/50 hover:text-navara-cream'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span className="text-[9px] font-mono-clinical">Face Scan</span>
        </button>

        <button
          onClick={() => setActiveTab('fit')}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition ${
            activeTab === 'fit' ? 'text-navara-alabaster font-semibold' : 'text-navara-cream/50 hover:text-navara-cream'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="text-[9px] font-mono-clinical">Fit Score</span>
        </button>

        <button
          onClick={() => setActiveTab('regimen')}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition ${
            activeTab === 'regimen' ? 'text-navara-alabaster font-semibold' : 'text-navara-cream/50 hover:text-navara-cream'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span className="text-[9px] font-mono-clinical">Regimen</span>
        </button>

        <button
          onClick={() => setActiveTab('journey')}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition ${
            activeTab === 'journey' ? 'text-navara-alabaster font-semibold' : 'text-navara-cream/50 hover:text-navara-cream'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span className="text-[9px] font-mono-clinical">Journey</span>
        </button>
      </nav>

      {/* Modals & Drawers */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthenticated={(user) => {
          setCurrentUser(user);
          if (!user.profile?.age) {
            setIsIntakeOpen(true);
          }
        }}
      />

      <IntakeQuizModal
        isOpen={isIntakeOpen}
        onClose={() => setIsIntakeOpen(false)}
        initialProfile={currentUser?.profile}
        onProfileUpdated={(updatedProfile: PatientProfile) => {
          if (currentUser) {
            setCurrentUser({ ...currentUser, profile: updatedProfile });
          }
        }}
      />

      <DermChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        patientName={currentUser?.full_name || 'Patient'}
      />
    </div>
  );
}
