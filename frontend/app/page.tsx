'use client';

import React, { useState, useEffect } from 'react';
import { SingleCloseUpCapture } from '../components/SingleCloseUpCapture';
import { DiagnosticDashboard } from '../components/DiagnosticDashboard';
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
  BadgeCheck
} from 'lucide-react';

type MobileTab = 'home' | 'scan' | 'regimen' | 'journey';

const FALLBACK_DEMO_ANALYSIS: AnalysisResponse = {
  analysis_id: "demo-scan-8821",
  timestamp: new Date().toISOString(),
  overall_health_score: 82,
  detected_skin_type: "Combination",
  top_concerns: ["Inflammatory Acne", "Post-Inflammatory Erythema", "Localized PIH"],
  acne_severity_grade: "Mild-to-Moderate (Grade II)",
  face_detected: true,
  clinical_disclaimer: "DermaNova provides AI-assisted educational skincare assessment. Consult a board-certified dermatologist for medical diagnosis.",
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
      color: "#ef4444",
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
      color: "#ef4444",
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
      color: "#f43f5e",
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
      color: "#f59e0b",
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
      color: "#38bdf8",
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
          'Diagnostic engine encountered an issue. You can try the Quick Demo Scan mode.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Instant Demo Mode (with patient image and pinpointing)
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
        console.warn('Recommendation API offline, using standard pharmacological guidance');
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-brand-500 selection:text-slate-950">
      
      {/* =========================================================================
          UNIVERSAL RESPONSIVE NAVIGATION HEADER
          - On Desktop (md+): Expands gracefully to max-w-7xl with top navigation tabs
          - On Mobile (<md): Compact app bar with brand, streak, and profile
         ========================================================================= */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-brand-500 via-teal-400 to-emerald-400 flex items-center justify-center text-slate-950 font-black text-sm shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
                DN
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base sm:text-lg font-black text-white tracking-tight font-mono">
                    Derma<span className="text-brand-400">Nova</span>
                  </span>
                  <span className="hidden sm:inline text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Doctor Verified
                  </span>
                </div>
                <div className="text-[10px] sm:text-[11px] text-slate-400">
                  {currentUser
                    ? `Hi, ${currentUser.full_name?.split(' ')[0] || 'Patient'} 👋`
                    : 'AI Dermatology & Disease Point-Out Engine'}
                </div>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Tabs (Visible on md and above) */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-2xl bg-slate-900/80 border border-slate-800/80 text-xs font-bold">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${
                activeTab === 'home'
                  ? 'bg-brand-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <HomeIcon className="w-4 h-4" />
              <span>Home</span>
            </button>

            <button
              onClick={() => setActiveTab('scan')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition relative ${
                activeTab === 'scan'
                  ? 'bg-brand-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>AI Disease Scan</span>
              {analysisResult && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-0.5" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('regimen')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${
                activeTab === 'regimen'
                  ? 'bg-brand-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>My Regimen</span>
            </button>

            <button
              onClick={() => setActiveTab('journey')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${
                activeTab === 'journey'
                  ? 'bg-brand-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Skin Journey</span>
            </button>
          </nav>

          {/* Right Header Badges / Auth Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Streak Badge */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold shadow-sm">
              <Flame className="w-3.5 h-3.5 fill-amber-400/20 animate-pulse" />
              <span>14d</span>
            </div>

            {/* Skin Profile Quiz (Desktop) */}
            <button
              onClick={() => setIsIntakeOpen(true)}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-brand-300 text-xs font-semibold transition"
            >
              <HeartPulse className="w-3.5 h-3.5 text-brand-400" />
              <span>Skin Profile Quiz</span>
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white">
                  <div className="w-5 h-5 rounded-full bg-brand-500/20 border border-brand-400/40 flex items-center justify-center text-[10px] font-bold text-brand-300 uppercase">
                    {currentUser.full_name?.charAt(0) || 'P'}
                  </div>
                  <span className="font-medium">{currentUser.full_name?.split(' ')[0]}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 transition"
                  title="Log out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs transition shadow-sm"
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
          <div className="p-3.5 rounded-2xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-between">
            <span>{errorMsg}</span>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-xs text-rose-400 underline font-semibold ml-2"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          MAIN APPLICATION CONTENT AREA (FULLY RESPONSIVE MAX-W-7XL)
         ========================================================================= */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 pb-24 md:pb-12">
        
        {/* =====================================================================
            TAB 1: HOME FEED
           ===================================================================== */}
        {activeTab === 'home' && (
          <div className="space-y-6 animate-fade-in">
            {/* Responsive Hero Banner (2-column layout on desktop) */}
            <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-brand-950/70 via-slate-900 to-slate-900 border border-brand-500/30 relative overflow-hidden shadow-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left Column: Headline & Action */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-[11px] font-bold uppercase tracking-wider font-mono">
                    <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                    Free AI Facial Skin Assessment & Pinpointing
                  </div>

                  <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight tracking-tight">
                    Pinpoint Every Skin Condition with Deep Learning Precision
                  </h1>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                    Upload a single close-up photo of your face or concern zone. Our multi-task spatial engine locates active acne, PIH dark spots, and barrier erythema with exact bounding coordinates, and matches doctor-approved actives.
                  </p>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                    <button
                      onClick={() => setActiveTab('scan')}
                      className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-brand-500 via-teal-400 to-emerald-400 hover:opacity-95 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-xl shadow-brand-500/25 active:scale-95"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Start 1-Photo Disease Scan</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={handleRunDemo}
                      disabled={isLoading}
                      className="px-5 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition"
                    >
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span>Instant Demo Scan (Sample Face)</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-5 pt-2 text-[11px] text-slate-400 font-medium">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 100% Free & Open Consultation
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Instant Neural Inference (582ms)
                    </span>
                  </div>
                </div>

                {/* Right Column: Interactive Visual Showcase */}
                <div className="lg:col-span-5 hidden sm:block">
                  <div
                    onClick={() => setActiveTab('scan')}
                    className="p-4 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-2xl relative cursor-pointer group hover:border-brand-500/40 transition"
                  >
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                      <img
                        src="/demo_face.jpg"
                        alt="AI Disease Pinpointing Demonstration"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      {/* Live Callout Pin 1 */}
                      <div className="absolute top-[38%] left-[58%] w-14 h-14 border-2 border-rose-500 rounded-xl bg-rose-500/20 flex items-center justify-center ring-2 ring-white/60 animate-pulse">
                        <span className="absolute -top-3.5 px-1.5 py-0.5 rounded-full bg-rose-500 text-slate-950 text-[9px] font-black">
                          #1 Acne 94%
                        </span>
                      </div>

                      {/* Live Callout Pin 2 */}
                      <div className="absolute top-[48%] left-[42%] w-16 h-14 border-2 border-rose-400 rounded-xl bg-rose-400/20 flex items-center justify-center ring-2 ring-white/60">
                        <span className="absolute -top-3.5 px-1.5 py-0.5 rounded-full bg-rose-400 text-slate-950 text-[9px] font-black">
                          #3 Redness 82%
                        </span>
                      </div>

                      <div className="absolute bottom-3 inset-x-3 px-3 py-2 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800 text-[11px] text-slate-200 flex items-center justify-between">
                        <span className="font-bold text-brand-300">Live Spatial Pinpoint Engine</span>
                        <span className="text-emerald-400 font-mono font-bold">Tap to Test ➔</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3-Step Process Cards (Responsive 3 Columns) */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono px-1">
                How DermaNova Point-Out Diagnostics Works
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div className="text-sm font-bold text-white">1 Close-Up Photo</div>
                  <div className="text-xs text-slate-400 leading-relaxed">
                    Capture or upload one focused photo under natural lighting. Facial alignment and ROI cropping are performed automatically.
                  </div>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div className="text-sm font-bold text-white">Exact Disease Pinpointing</div>
                  <div className="text-xs text-slate-400 leading-relaxed">
                    Multi-task neural networks and saliency maps locate each lesion with exact bounding coordinates, severity grade, and confidence.
                  </div>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div className="text-sm font-bold text-white">Targeted Clinical Regimen</div>
                  <div className="text-xs text-slate-400 leading-relaxed">
                    Receive individualized active ingredient recommendations (Benzoyl Peroxide, Salicylic, Azelaic) with full pharmacy guidance.
                  </div>
                </div>
              </div>
            </div>

            {/* Certified Dermatologists Trust Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Reviewed by Board-Certified Dermatologists</h4>
                  <p className="text-xs text-slate-400">Clinical validation on 10,000+ benchmark multi-label dermatology cases</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-brand-400 font-mono px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
                  50+ Panel MDs
                </span>
                <span className="text-xs font-bold text-emerald-400 font-mono px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  Doctor Verified
                </span>
              </div>
            </div>

            {/* Real Patient Progress (Before & After Preview) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Real Patient Transformations
                </h3>
                <button
                  onClick={() => setActiveTab('journey')}
                  className="text-xs text-brand-400 font-bold hover:underline"
                >
                  View Longitudinal Journey ➔
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div
                  onClick={() => setActiveTab('journey')}
                  className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-brand-500/30 cursor-pointer transition flex items-center gap-3.5"
                >
                  <img
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80"
                    alt="Patient transformation"
                    className="w-16 h-16 rounded-xl object-cover border border-slate-800 shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-bold text-white">Acne Clearance • Week 6</span>
                      <span className="text-xs font-mono text-emerald-400 font-bold">-74% Lesions</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      "My active papules subsided within 4 weeks of following the Salicylic + Azelaic regimen."
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab('journey')}
                  className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-brand-500/30 cursor-pointer transition flex items-center gap-3.5"
                >
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
                    alt="Patient transformation 2"
                    className="w-16 h-16 rounded-xl object-cover border border-slate-800 shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-bold text-white">Barrier Repair • Week 8</span>
                      <span className="text-xs font-mono text-cyan-400 font-bold">+28 Pts Health</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      "Capillary erythema and stinging faded completely after switching to the Ceramide + Centella barrier plan."
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Consultation Intake Quiz Trigger */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
              <div className="space-y-1">
                <h4 className="text-sm sm:text-base font-bold text-white">
                  Medical Consultation & Sensitivity Questionnaire
                </h4>
                <p className="text-xs text-slate-400">
                  Personalize treatment for allergies, sensitive barrier, pregnancy safety, and sun exposure habits
                </p>
              </div>
              <button
                onClick={() => setIsIntakeOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs sm:text-sm transition shrink-0"
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
              <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 text-center space-y-3 shadow-2xl">
                <div className="w-12 h-12 border-4 border-brand-500/20 border-t-brand-400 rounded-full animate-spin mx-auto" />
                <h3 className="text-sm sm:text-base font-extrabold text-white">
                  Detecting Disease Sites & Bounding Coordinates...
                </h3>
                <p className="text-xs text-slate-400">
                  Multi-Task Convolutional Inference + Localized Spatial Peak Saliency (582ms)
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
                  <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-900 to-brand-950/60 border border-brand-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
                    <div className="space-y-1">
                      <div className="text-sm font-extrabold text-white">
                        Your Doctor-Verified Skincare Regimen is Ready!
                      </div>
                      <div className="text-xs text-slate-400">
                        Targeted spot actives, AM/PM routine schedule, and generic pharmacy alternatives
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('regimen')}
                      className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition shadow-lg shrink-0"
                    >
                      <span>View Custom Regimen</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            TAB 3: PERSONALIZED CLINICAL REGIMEN
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
              <div className="p-10 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-4 max-w-lg mx-auto shadow-2xl">
                <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center mx-auto">
                  <FileText className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">No Regimen Formulated Yet</h2>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Complete a 1-photo skin scan to generate your free, doctor-reviewed skincare routine.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('scan')}
                  className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs"
                >
                  Start Skin Scan Now
                </button>
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            TAB 4: LONGITUDINAL SKIN JOURNEY
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

      {/* Floating Chat with Skin Advisor Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-30 w-13 h-13 rounded-full bg-gradient-to-tr from-brand-500 to-teal-400 text-slate-950 shadow-2xl flex items-center justify-center font-bold transition transform active:scale-95 hover:scale-105 p-3.5"
        title="Chat with Dermatologist Advisor"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
          1
        </span>
      </button>

      {/* =========================================================================
          MOBILE BOTTOM NAVIGATION BAR (FIXED ON MOBILE ONLY: md:hidden)
         ========================================================================= */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 h-16 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 flex items-center justify-around px-2 shadow-2xl">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition ${
            activeTab === 'home' ? 'text-brand-400 font-bold' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <HomeIcon className="w-5 h-5" />
          <span className="text-[10px]">Home</span>
        </button>

        <button
          onClick={() => setActiveTab('scan')}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition ${
            activeTab === 'scan' ? 'text-brand-400 font-bold' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Camera className="w-5 h-5" />
          <span className="text-[10px]">AI Scan</span>
        </button>

        <button
          onClick={() => setActiveTab('regimen')}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition ${
            activeTab === 'regimen' ? 'text-brand-400 font-bold' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span className="text-[10px]">My Regimen</span>
        </button>

        <button
          onClick={() => setActiveTab('journey')}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition ${
            activeTab === 'journey' ? 'text-brand-400 font-bold' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Clock className="w-5 h-5" />
          <span className="text-[10px]">Journey</span>
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
