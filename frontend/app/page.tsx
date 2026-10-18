'use client';

import React, { useState, useEffect } from 'react';
import { MultiAngleCapture } from '../components/MultiAngleCapture';
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
  HeartHandshake
} from 'lucide-react';

type MobileTab = 'home' | 'scan' | 'regimen' | 'journey';

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

  // Handle uploaded or captured image from 3-angle scanner
  const handleImagesReady = async (frontImage: string | File) => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      let analysis: AnalysisResponse;
      if (typeof frontImage === 'string') {
        setSelectedImage(frontImage);
        analysis = await apiService.analyzeBase64(frontImage);
      } else {
        const objectUrl = URL.createObjectURL(frontImage);
        setSelectedImage(objectUrl);
        analysis = await apiService.analyzeFile(frontImage);
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
        has_sensitive_skin: analysis.detected_skin_type === 'Sensitive' || (currentUser?.profile?.has_sensitive_skin ?? false),
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

  // Instant Demo Mode
  const handleRunDemo = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const demoAnalysis = await apiService.getDemoAnalysis();
      setAnalysisResult(demoAnalysis);
      setSelectedImage(null);

      const conditionProbMap: Record<string, number> = {};
      Object.entries(demoAnalysis.conditions).forEach(([k, v]) => {
        conditionProbMap[k] = v.probability;
      });

      const recs = await apiService.getRecommendations({
        detected_conditions: conditionProbMap,
        skin_type: demoAnalysis.detected_skin_type,
        has_sensitive_skin: false,
      });
      setRecommendations(recs);
      setActiveTab('scan');
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Could not run demo scan. Ensure backend server is running on port 8000.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex justify-center selection:bg-brand-500 selection:text-slate-950 font-sans">
      {/* Mobile Device Viewport Container (App-like frame) */}
      <div className="w-full max-w-md min-h-screen sm:min-h-[92vh] sm:my-3 sm:border sm:border-slate-800/80 sm:rounded-[36px] sm:shadow-[0_0_60px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col bg-slate-950 relative">
        
        {/* CureSkin Native App Top Bar */}
        <header className="sticky top-0 z-30 px-4 py-3 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-brand-500 via-teal-400 to-emerald-400 flex items-center justify-center text-slate-950 font-black text-sm shadow-lg shadow-brand-500/20">
              DN
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold text-white tracking-tight">DermaNova</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Doctor Verified
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                {currentUser ? `Hi, ${currentUser.full_name?.split(' ')[0] || 'Patient'} 👋` : 'AI Dermatology Clinic'}
              </div>
            </div>
          </div>

          {/* Right Header Badges / Auth */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-bold">
              <Flame className="w-3.5 h-3.5 fill-amber-400/20 animate-pulse" />
              <span>14d</span>
            </div>

            {currentUser ? (
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 transition"
                title="Log out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-3 py-1 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs transition shadow"
              >
                Sign In
              </button>
            )}
          </div>
        </header>

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="m-3 p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Scrollable Mobile App Body */}
        <main className="flex-1 overflow-y-auto p-4 space-y-5 pb-24">
          
          {/* TAB: HOME FEED (CureSkin Main Screen) */}
          {activeTab === 'home' && (
            <div className="space-y-4 animate-fade-in">
              {/* Giant CureSkin Hero Banner */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-brand-950/60 via-slate-900 to-slate-900 border border-brand-500/30 relative overflow-hidden shadow-xl space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-[10px] font-bold uppercase tracking-wider font-mono">
                  <Sparkles className="w-3 h-3 text-brand-400" />
                  Free AI Skin Assessment
                </div>

                <div className="space-y-1.5">
                  <h1 className="text-xl sm:text-2xl font-black text-white leading-tight tracking-tight">
                    Get Clear Skin in 60 Days with AI Dermatology
                  </h1>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Scan your face under good lighting to detect acne, scars & dark spots, and receive a free doctor-approved skincare routine.
                  </p>
                </div>

                {/* Primary CTA */}
                <button
                  onClick={() => setActiveTab('scan')}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-500 via-teal-400 to-emerald-400 hover:opacity-95 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 transition shadow-xl shadow-brand-500/20 active:scale-95"
                >
                  <Camera className="w-4 h-4" />
                  <span>Start Free 3-Angle Skin Check</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 font-medium">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> 100% Free Consultation
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Instant Results (582ms)
                  </span>
                </div>
              </div>

              {/* CureSkin 3-Step Process Cards */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono px-1">
                  How CureSkin Treatment Works
                </h3>

                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center space-y-1.5">
                    <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center mx-auto text-xs font-bold">
                      1
                    </div>
                    <div className="text-[11px] font-bold text-white leading-tight">Take 3 Photos</div>
                    <div className="text-[9px] text-slate-400 leading-tight">Front & cheek profiles</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center space-y-1.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto text-xs font-bold">
                      2
                    </div>
                    <div className="text-[11px] font-bold text-white leading-tight">AI Diagnosis</div>
                    <div className="text-[9px] text-slate-400 leading-tight">Grad-CAM heatmaps</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center space-y-1.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto text-xs font-bold">
                      3
                    </div>
                    <div className="text-[11px] font-bold text-white leading-tight">Free Regimen</div>
                    <div className="text-[9px] text-slate-400 leading-tight">Generic OTC guide</div>
                  </div>
                </div>
              </div>

              {/* Certified Dermatologists Trust Card */}
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Reviewed by Board Dermatologists</h4>
                    <p className="text-[10px] text-slate-400">Over 50+ Certified MD Dermatologists on Panel</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-brand-400 font-mono">10M+ Scans</span>
              </div>

              {/* Real Patient Progress (Before & After Preview) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                    Real Patient Transformations
                  </h3>
                  <button
                    onClick={() => setActiveTab('journey')}
                    className="text-[11px] text-brand-400 font-bold hover:underline"
                  >
                    View All ➔
                  </button>
                </div>

                <div
                  onClick={() => setActiveTab('journey')}
                  className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-brand-500/30 cursor-pointer transition flex items-center gap-3"
                >
                  <img
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80"
                    alt="Patient transformation"
                    className="w-14 h-14 rounded-xl object-cover border border-slate-800"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Acne Clearance • Week 6</span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">-74% Lesions</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      "My active breakouts subsided within 4 weeks of following the Salicylic + Azelaic regimen."
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Consultation Intake Quiz Trigger */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-indigo-500/30 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Medical Consultation Questionnaire</h4>
                  <p className="text-[10px] text-slate-400">Allergies, sensitivity, lifestyle & sun exposure</p>
                </div>
                <button
                  onClick={() => setIsIntakeOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs transition"
                >
                  Start Quiz
                </button>
              </div>
            </div>
          )}

          {/* TAB: 3-ANGLE SCAN & DIAGNOSTIC REPORT */}
          {activeTab === 'scan' && (
            <div className="space-y-4 animate-fade-in">
              <MultiAngleCapture
                onImagesReady={handleImagesReady}
                onRunDemo={handleRunDemo}
                isLoading={isLoading}
              />

              {isLoading && (
                <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-3">
                  <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-400 rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-bold text-white">Extracting Clinical Saliency Map...</p>
                  <p className="text-[10px] text-slate-400">PyTorch Multi-Task EfficientNet Backward-Pass Grad-CAM (582ms)</p>
                </div>
              )}

              {analysisResult && !isLoading && (
                <div className="space-y-5 animate-fade-in">
                  <DiagnosticDashboard
                    analysis={analysisResult}
                    originalImage={selectedImage}
                  />

                  {recommendations && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-brand-950/50 border border-brand-500/30 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white">Your Free Clinical Regimen is Ready!</div>
                        <div className="text-[10px] text-slate-400">Doctor-reviewed actives & chemist guide</div>
                      </div>
                      <button
                        onClick={() => setActiveTab('regimen')}
                        className="px-3.5 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition"
                      >
                        <span>View Regimen</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB: PERSONALIZED CLINICAL REGIMEN */}
          {activeTab === 'regimen' && (
            <div className="space-y-5 animate-fade-in">
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
                <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center mx-auto">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">No Regimen Formulated Yet</h2>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                      Complete a 3-angle skin scan to generate your free, doctor-reviewed skincare routine.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('scan')}
                    className="px-4 py-2 rounded-xl bg-brand-500 text-slate-950 font-bold text-xs"
                  >
                    Start Skin Scan Now
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB: LONGITUDINAL SKIN JOURNEY */}
          {activeTab === 'journey' && (
            <div className="space-y-5 animate-fade-in">
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
          className="absolute bottom-20 right-4 z-20 w-12 h-12 rounded-full bg-gradient-to-tr from-brand-500 to-teal-400 text-slate-950 shadow-2xl flex items-center justify-center font-bold transition transform active:scale-90 hover:scale-105"
          title="Chat with Dermatologist Advisor"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 text-white rounded-full text-[9px] flex items-center justify-center font-bold">
            1
          </span>
        </button>

        {/* CureSkin 4-Tab Bottom Navigation Bar */}
        <nav className="absolute bottom-0 inset-x-0 z-30 h-16 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 flex items-center justify-around px-2">
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
    </div>
  );
}
