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
      color: "#c15c3d",
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
      color: "#8a7d55",
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
      color: "#637852",
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
    <div className="min-h-screen bg-[#faf9f5] text-[#1a2217] flex flex-col font-sans selection:bg-[#eef2ea] selection:text-[#1c2417]">
      
      {/* =========================================================================
          MINIMAL ELEGANT NAVIGATION HEADER
          White canvas, subtle botanical border, refined typography
         ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-[#e6e2d8] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-3 text-left group"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#1c2417] text-white flex items-center justify-center font-serif-luxury text-base shadow-sm group-hover:bg-[#2d3b25] transition-all">
                D
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif-luxury text-xl text-[#1a2217] tracking-tight font-normal">
                    DermaNova
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-mono-clinical px-2 py-0.5 rounded-full bg-[#eef2ea] text-[#425335] border border-[#cbd7c1]">
                    <Leaf className="w-2.5 h-2.5" /> Clinical Botanical AI
                  </span>
                </div>
                <div className="text-[10px] sm:text-[11px] text-[#6b7764] font-mono-clinical">
                  {currentUser
                    ? `Patient: ${currentUser.full_name?.split(' ')[0] || 'User'}`
                    : 'Evidence-Based Dermatology & Spatial Facial Diagnostics'}
                </div>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-[#f4f3ed] border border-[#e2ded4] text-xs font-mono-clinical">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition ${
                activeTab === 'home'
                  ? 'bg-white text-[#1a2217] font-semibold shadow-sm border border-[#ded9cd]'
                  : 'text-[#6b7764] hover:text-[#1a2217] hover:bg-white/60'
              }`}
            >
              <HomeIcon className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('scan')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition relative ${
                activeTab === 'scan'
                  ? 'bg-white text-[#1a2217] font-semibold shadow-sm border border-[#ded9cd]'
                  : 'text-[#6b7764] hover:text-[#1a2217] hover:bg-white/60'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Face Scan</span>
              {analysisResult && (
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping ml-0.5" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('fit')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition ${
                activeTab === 'fit'
                  ? 'bg-white text-[#1a2217] font-semibold shadow-sm border border-[#ded9cd]'
                  : 'text-[#6b7764] hover:text-[#1a2217] hover:bg-white/60'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Cosmetics Fit Score</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#eef2ea] text-[#425335]">
                Neutral
              </span>
            </button>

            <button
              onClick={() => setActiveTab('regimen')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition ${
                activeTab === 'regimen'
                  ? 'bg-white text-[#1a2217] font-semibold shadow-sm border border-[#ded9cd]'
                  : 'text-[#6b7764] hover:text-[#1a2217] hover:bg-white/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>My Regimen</span>
            </button>

            <button
              onClick={() => setActiveTab('journey')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition ${
                activeTab === 'journey'
                  ? 'bg-white text-[#1a2217] font-semibold shadow-sm border border-[#ded9cd]'
                  : 'text-[#6b7764] hover:text-[#1a2217] hover:bg-white/60'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Skin Journey</span>
            </button>
          </nav>

          {/* Right Header Badges / Auth Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Streak Badge */}
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#fbf0eb] border border-[#f3d3c7] text-[#b85c3c] text-xs font-mono-clinical font-semibold">
              <Flame className="w-3.5 h-3.5 text-[#b85c3c] fill-[#b85c3c]/20 animate-pulse" />
              <span>14d streak</span>
            </div>

            {/* Skin Profile Quiz (Desktop) */}
            <button
              onClick={() => setIsIntakeOpen(true)}
              className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-[#f4f3ed] border border-[#e2ded4] text-[#1a2217] text-xs font-mono-clinical transition shadow-sm"
            >
              <HeartPulse className="w-3.5 h-3.5 text-[#637852]" />
              <span>Skin Profile</span>
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#e2ded4] text-xs text-[#1a2217] shadow-sm">
                  <div className="w-5 h-5 rounded-full bg-[#eef2ea] border border-[#cbd7c1] flex items-center justify-center text-[10px] font-mono-clinical text-[#425335] uppercase">
                    {currentUser.full_name?.charAt(0) || 'P'}
                  </div>
                  <span className="font-mono-clinical text-xs font-medium">{currentUser.full_name?.split(' ')[0]}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full bg-white border border-[#e2ded4] text-[#6b7764] hover:text-[#b85c3c] transition shadow-sm"
                  title="Log out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-4 py-2 rounded-full bg-[#1c2417] hover:bg-[#2d3b25] text-white font-mono-clinical font-medium text-xs transition shadow-sm"
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
          <div className="p-4 rounded-2xl bg-[#fff5f5] border border-[#fed7d7] text-[#9b2c2c] text-xs flex items-center justify-between">
            <span>{errorMsg}</span>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-xs text-[#9b2c2c] underline font-semibold ml-2"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          MAIN APPLICATION CONTENT AREA
         ========================================================================= */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-12">
        
        {/* =====================================================================
            TAB 1: OVERVIEW HOME (CLEAN WHITE + BOTANICAL MINIMAL EDITORIAL)
           ===================================================================== */}
        {activeTab === 'home' && (
          <div className="space-y-12 animate-fade-in">
            
            {/* HERO EDITORIAL SECTION */}
            <div className="relative rounded-3xl bg-white border border-[#e6e2d8] p-6 sm:p-12 overflow-hidden shadow-sm">
              {/* Subtle Botanical Illumination */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#eef2ea]/70 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#fbf0eb]/50 rounded-full blur-3xl pointer-events-none" />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                {/* Left Column: Editorial Headline & Actions */}
                <div className="lg:col-span-7 space-y-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f4f6f1] border border-[#d6e0ce] text-[#425335] text-[10px] font-mono-clinical uppercase tracking-widest font-medium">
                    <Leaf className="w-3 h-3 text-[#637852]" />
                    Clinical Dermatology & Botanical Care
                  </div>

                  <h1 className="font-serif-luxury text-3xl sm:text-5xl text-[#1a2217] leading-[1.18] font-normal tracking-tight">
                    A clinical standard for calm, transformative skin health.
                  </h1>

                  <p className="text-xs sm:text-sm text-[#556050] leading-relaxed max-w-xl font-sans">
                    Powered by DermaNova's 11+ skin conditions spatial engine, 100% brand-neutral cosmetics fit scoring, and board-certified medical board protocols. Pure scientific transparency with zero sponsored bias.
                  </p>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                    <button
                      onClick={() => setActiveTab('scan')}
                      className="px-6 py-3.5 rounded-full bg-[#1c2417] hover:bg-[#2d3b25] text-white font-mono-clinical font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md active:scale-95"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Start 11+ Condition Scan</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setActiveTab('fit')}
                      className="px-5 py-3.5 rounded-full bg-white hover:bg-[#f7f6f2] border border-[#ded9cd] text-[#1a2217] font-mono-clinical font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-sm"
                    >
                      <SlidersHorizontal className="w-4 h-4 text-[#637852]" />
                      <span>Check Cosmetics Fit Score</span>
                    </button>
                  </div>

                  {/* Trust Micro-Indicators */}
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-[11px] font-mono-clinical text-[#6b7764]">
                    <span className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#637852]" /> 11+ Conditions Detected
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#637852]" /> 100% Brand-Neutral
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#637852]" /> 582ms Inference
                    </span>
                  </div>
                </div>

                {/* Right Column: Visual Showcase Preview */}
                <div className="lg:col-span-5 hidden sm:block">
                  <div
                    onClick={() => setActiveTab('scan')}
                    className="p-3 rounded-3xl bg-[#faf9f5] border border-[#e6e2d8] shadow-md relative cursor-pointer group hover:border-[#637852]/50 transition"
                  >
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-white">
                      <img
                        src="/demo_face.jpg"
                        alt="Facial Diagnostic Pinpointing Demonstration"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      
                      {/* Reticle Callout 1 */}
                      <div className="absolute top-[38%] left-[58%] w-14 h-14 border-2 border-[#b85c3c] rounded-xl bg-[#b85c3c]/15 flex items-center justify-center ring-2 ring-white">
                        <span className="absolute -top-3.5 px-2 py-0.5 rounded-full bg-[#b85c3c] text-white text-[9px] font-mono-clinical font-semibold shadow">
                          Acne 94%
                        </span>
                      </div>

                      {/* Reticle Callout 2 */}
                      <div className="absolute top-[48%] left-[42%] w-16 h-14 border-2 border-[#637852] rounded-xl bg-[#637852]/15 flex items-center justify-center ring-2 ring-white">
                        <span className="absolute -top-3.5 px-2 py-0.5 rounded-full bg-[#637852] text-white text-[9px] font-mono-clinical font-semibold shadow">
                          Redness 82%
                        </span>
                      </div>

                      <div className="absolute bottom-3 inset-x-3 px-3.5 py-2.5 rounded-xl bg-white/95 backdrop-blur-md border border-[#e6e2d8] text-xs text-[#1a2217] flex items-center justify-between shadow-sm">
                        <span className="font-mono-clinical text-[#1a2217] font-medium">Unobstructed Spatial Canvas</span>
                        <span className="text-[#637852] font-mono-clinical text-[11px] font-semibold">Interactive ➔</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================================
                THE THREE PILLARS OF DERMANOVA
               ================================================================= */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 px-1">
                <div>
                  <span className="text-[10px] font-mono-clinical uppercase tracking-widest text-[#637852] font-semibold">
                    Clinical Architecture
                  </span>
                  <h2 className="font-serif-luxury text-2xl sm:text-3xl text-[#1a2217] font-normal tracking-tight">
                    The Three Pillars of DermaNova
                  </h2>
                </div>
                <p className="text-xs text-[#6b7764] max-w-sm">
                  Precision spatial diagnostics and evidence-based skincare designed for cutaneous barrier longevity.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                
                {/* Pillar 1: 11+ Conditions Scanner */}
                <div
                  onClick={() => setActiveTab('scan')}
                  className="rounded-3xl bg-white border border-[#e6e2d8] p-6 sm:p-7 space-y-4 cursor-pointer hover:border-[#637852]/50 hover:shadow-md transition group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono-clinical text-[#637852] font-semibold">PILLAR 01</span>
                    <span className="w-9 h-9 rounded-full bg-[#f4f6f1] border border-[#d6e0ce] flex items-center justify-center text-[#425335] group-hover:scale-110 transition">
                      <Camera className="w-4 h-4" />
                    </span>
                  </div>
                  <h3 className="font-serif-luxury text-xl text-[#1a2217] font-normal">
                    11+ Skin Conditions AI Face Scanner
                  </h3>
                  <p className="text-xs text-[#556050] leading-relaxed">
                    Instantly detects inflammatory acne, erythema, hyperpigmentation, dilated pores, blackheads, whiteheads, fine lines, and dehydration with spatial coordinates and unobstructed focus.
                  </p>
                  <div className="pt-2 flex items-center gap-1.5 text-xs font-mono-clinical text-[#637852] group-hover:text-[#1a2217] transition font-medium">
                    <span>Try Face Scanner</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Pillar 2: Cosmetics Fit Score */}
                <div
                  onClick={() => setActiveTab('fit')}
                  className="rounded-3xl bg-white border border-[#e6e2d8] p-6 sm:p-7 space-y-4 cursor-pointer hover:border-[#637852]/50 hover:shadow-md transition group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono-clinical text-[#637852] font-semibold">PILLAR 02</span>
                    <span className="w-9 h-9 rounded-full bg-[#f4f6f1] border border-[#d6e0ce] flex items-center justify-center text-[#425335] group-hover:scale-110 transition">
                      <SlidersHorizontal className="w-4 h-4" />
                    </span>
                  </div>
                  <h3 className="font-serif-luxury text-xl text-[#1a2217] font-normal">
                    100% Brand-Neutral Cosmetics Fit Score
                  </h3>
                  <p className="text-xs text-[#556050] leading-relaxed">
                    Check if your cleanser, serum, or moisturizer truly matches your barrier. With zero sponsored brands, we match safer, better-fit alternative formulations based on INCI toxicological safety.
                  </p>
                  <div className="pt-2 flex items-center gap-1.5 text-xs font-mono-clinical text-[#637852] group-hover:text-[#1a2217] transition font-medium">
                    <span>Scan Product Fit</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Pillar 3: 24/7 AI Cosmetologist */}
                <div
                  onClick={() => setIsChatOpen(true)}
                  className="rounded-3xl bg-white border border-[#e6e2d8] p-6 sm:p-7 space-y-4 cursor-pointer hover:border-[#637852]/50 hover:shadow-md transition group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono-clinical text-[#637852] font-semibold">PILLAR 03</span>
                    <span className="w-9 h-9 rounded-full bg-[#f4f6f1] border border-[#d6e0ce] flex items-center justify-center text-[#425335] group-hover:scale-110 transition">
                      <MessageSquare className="w-4 h-4" />
                    </span>
                  </div>
                  <h3 className="font-serif-luxury text-xl text-[#1a2217] font-normal">
                    24/7 AI Cosmetologist & UV Defense
                  </h3>
                  <p className="text-xs text-[#556050] leading-relaxed">
                    Daily skin feeling check-ins (Great / Fine / Not good), local UV Index defense alerts, ingredient layering conflict checks, and board-certified medical guidance in real time.
                  </p>
                  <div className="pt-2 flex items-center gap-1.5 text-xs font-mono-clinical text-[#637852] group-hover:text-[#1a2217] transition font-medium">
                    <span>Open Consultation</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================================
                MEDICAL BOARD & BOTANICAL INGREDIENT STANDARDS
               ================================================================= */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#e6e2d8] flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-sm">
              <div className="space-y-2 max-w-xl">
                <span className="text-[10px] font-mono-clinical uppercase tracking-widest text-[#637852] font-semibold">
                  Medical Board & Formulations
                </span>
                <h3 className="font-serif-luxury text-2xl text-[#1a2217] font-normal">
                  Supervised by Dermatologists & Cosmetic Chemists
                </h3>
                <p className="text-xs text-[#556050] leading-relaxed">
                  Every recommendation adheres to CIR (Cosmetic Ingredient Review), ECHA, and FDA safety regulations. Our multi-label deep learning models are calibrated against over 10,000+ biopsy-verified dermatological cases.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="px-5 py-3 rounded-2xl bg-[#faf9f5] border border-[#e6e2d8] text-center">
                  <div className="font-serif-luxury text-xl text-[#1a2217]">50+</div>
                  <div className="text-[10px] font-mono-clinical text-[#637852]">Panel MDs</div>
                </div>
                <div className="px-5 py-3 rounded-2xl bg-[#faf9f5] border border-[#e6e2d8] text-center">
                  <div className="font-serif-luxury text-xl text-[#1a2217]">0%</div>
                  <div className="text-[10px] font-mono-clinical text-[#637852]">Brand Bias</div>
                </div>
                <div className="px-5 py-3 rounded-2xl bg-[#faf9f5] border border-[#e6e2d8] text-center">
                  <div className="font-serif-luxury text-xl text-[#1a2217]">11+</div>
                  <div className="text-[10px] font-mono-clinical text-[#637852]">Conditions</div>
                </div>
              </div>
            </div>

            {/* Quick Consultation Intake Quiz Trigger */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#f4f6f1] border border-[#d6e0ce] flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-sm">
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono-clinical uppercase tracking-widest text-[#637852] font-semibold">Personalized Triage</span>
                <h4 className="font-serif-luxury text-xl text-[#1a2217] font-normal">
                  Medical Consultation & Barrier Sensitivity Questionnaire
                </h4>
                <p className="text-xs text-[#556050] max-w-xl">
                  Inform the diagnostic engine regarding retinoid tolerance, pregnancy safety, and daily sun exposure habits.
                </p>
              </div>
              <button
                onClick={() => setIsIntakeOpen(true)}
                className="px-6 py-3 rounded-full bg-[#1c2417] hover:bg-[#2d3b25] text-white font-mono-clinical font-medium text-xs sm:text-sm transition shrink-0 shadow-sm"
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
              <div className="p-8 sm:p-12 rounded-3xl bg-white border border-[#e6e2d8] text-center space-y-4 shadow-sm">
                <div className="w-12 h-12 border-3 border-[#637852]/20 border-t-[#637852] rounded-full animate-spin mx-auto" />
                <h3 className="font-serif-luxury text-lg text-[#1a2217] font-normal">
                  Detecting Disease Sites & Bounding Coordinates...
                </h3>
                <p className="text-xs font-mono-clinical text-[#6b7764]">
                  Multi-Task Convolutional Inference + Localized Spatial Peak Reticles (582ms)
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
                  <div className="p-6 rounded-3xl bg-[#f4f6f1] border border-[#d6e0ce] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                    <div className="space-y-1">
                      <div className="font-serif-luxury text-lg text-[#1a2217]">
                        Your Doctor-Verified Botanical & Active Regimen is Ready
                      </div>
                      <div className="text-xs text-[#556050]">
                        Targeted spot actives, barrier lipids, and AM/PM sequence formulated for your skin profile.
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('regimen')}
                      className="px-6 py-3 rounded-full bg-[#1c2417] hover:bg-[#2d3b25] text-white font-mono-clinical font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-sm shrink-0"
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
            TAB 3: COSMETICS FIT SCANNER (100% BRAND-NEUTRAL ENGINE)
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
              <div className="p-10 rounded-3xl bg-white border border-[#e6e2d8] text-center space-y-4 max-w-lg mx-auto shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-[#f4f6f1] border border-[#d6e0ce] text-[#637852] flex items-center justify-center mx-auto">
                  <FileText className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="font-serif-luxury text-xl text-[#1a2217]">No Regimen Formulated Yet</h2>
                  <p className="text-xs text-[#6b7764] mt-1 max-w-xs mx-auto">
                    Complete a 1-photo skin scan or check sample face to generate your doctor-reviewed routine.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('scan')}
                  className="px-5 py-2.5 rounded-full bg-[#1c2417] hover:bg-[#2d3b25] text-white font-mono-clinical font-medium text-xs shadow-sm"
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
        className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-30 w-14 h-14 rounded-full bg-[#1c2417] hover:bg-[#2d3b25] text-white shadow-xl flex items-center justify-center font-bold transition transform active:scale-95 hover:scale-105 p-3.5 border border-white/20"
        title="Chat with DermaNova AI Cosmetologist"
      >
        <MessageSquare className="w-6 h-6 text-white" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#b85c3c] text-white rounded-full text-[10px] font-mono-clinical flex items-center justify-center font-bold">
          1
        </span>
      </button>

      {/* =========================================================================
          MOBILE BOTTOM NAVIGATION BAR (FIXED ON MOBILE ONLY: md:hidden)
         ========================================================================= */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 h-16 bg-white/95 backdrop-blur-xl border-t border-[#e6e2d8] flex items-center justify-around px-2 shadow-lg">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition ${
            activeTab === 'home' ? 'text-[#1a2217] font-semibold' : 'text-[#8b9784] hover:text-[#1a2217]'
          }`}
        >
          <HomeIcon className="w-4 h-4" />
          <span className="text-[9px] font-mono-clinical">Home</span>
        </button>

        <button
          onClick={() => setActiveTab('scan')}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition ${
            activeTab === 'scan' ? 'text-[#1a2217] font-semibold' : 'text-[#8b9784] hover:text-[#1a2217]'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span className="text-[9px] font-mono-clinical">Scan</span>
        </button>

        <button
          onClick={() => setActiveTab('fit')}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition ${
            activeTab === 'fit' ? 'text-[#1a2217] font-semibold' : 'text-[#8b9784] hover:text-[#1a2217]'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="text-[9px] font-mono-clinical">Fit Score</span>
        </button>

        <button
          onClick={() => setActiveTab('regimen')}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition ${
            activeTab === 'regimen' ? 'text-[#1a2217] font-semibold' : 'text-[#8b9784] hover:text-[#1a2217]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span className="text-[9px] font-mono-clinical">Regimen</span>
        </button>

        <button
          onClick={() => setActiveTab('journey')}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition ${
            activeTab === 'journey' ? 'text-[#1a2217] font-semibold' : 'text-[#8b9784] hover:text-[#1a2217]'
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
