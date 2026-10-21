'use client';

import React, { useState, useEffect } from 'react';
import {
  apiService,
  AnalysisResponse,
  RecommendationResponse,
  UserAccount,
  PatientProfile
} from '../services/api';
import {
  ScreenNavHeader,
  ScreenId
} from '../components/screens/ScreenNavHeader';
import { LandingPageScreen } from '../components/screens/LandingPageScreen';
import { AuthOnboardingScreen } from '../components/screens/AuthOnboardingScreen';
import { DashboardScreen } from '../components/screens/DashboardScreen';
import { CaptureUploadScreen } from '../components/screens/CaptureUploadScreen';
import { AnalysisLoadingScreen } from '../components/screens/AnalysisLoadingScreen';
import { AnalysisResultsScreen } from '../components/screens/AnalysisResultsScreen';
import { ConcernDetailModal } from '../components/screens/ConcernDetailModal';
import { PersonalizedRoutineScreen } from '../components/screens/PersonalizedRoutineScreen';
import { ProgressTrackingScreen } from '../components/screens/ProgressTrackingScreen';
import { ProfileSettingsScreen } from '../components/screens/ProfileSettingsScreen';
import { TelehealthBookingScreen } from '../components/screens/TelehealthBookingScreen';
import { HistoricalTelemetryScreen } from '../components/screens/HistoricalTelemetryScreen';
import { AuthModal } from '../components/AuthModal';
import { CosmeticsFitScanner } from '../components/CosmeticsFitScanner';
import {
  Camera,
  Home as HomeIcon,
  FileText,
  Clock,
  Settings,
  Sparkles,
  Layers,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  LogOut,
  Leaf,
  SlidersHorizontal,
  Compass
} from 'lucide-react';

export default function DermaNovaApp() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('landing');
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [activeConcernDetail, setActiveConcernDetail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [showBackendConfig, setShowBackendConfig] = useState(false);
  const [backendInputUrl, setBackendInputUrl] = useState('');
  const [backendTesting, setBackendTesting] = useState(false);
  const [backendTestStatus, setBackendTestStatus] = useState<string | null>(null);

  useEffect(() => {
    const saved = apiService.getCustomBackendUrl();
    setBackendInputUrl(saved || apiService.getBaseUrl());
  }, []);

  const handleTestAndSaveBackend = async () => {
    if (!backendInputUrl.trim()) return;
    setBackendTesting(true);
    setBackendTestStatus('Pinging backend /health...');
    const res = await apiService.testConnection(backendInputUrl.trim());
    setBackendTesting(false);
    if (res.success) {
      apiService.setCustomBackendUrl(backendInputUrl.trim());
      setBackendTestStatus(`Connected successfully! Latency: ${res.latencyMs}ms`);
      setTimeout(() => {
        setErrorMsg(null);
        setShowBackendConfig(false);
        setBackendTestStatus(null);
      }, 1500);
    } else {
      setBackendTestStatus(`Connection failed: ${res.error || 'Backend not responding'}. Please check URL.`);
    }
  };

  // Restore authenticated session on mount
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

    // Proactive background keep-alive heartbeat while user is on the site
    apiService.getHealth().catch(() => {});
    const heartbeatTimer = setInterval(() => {
      apiService.getHealth().catch(() => {});
    }, 9 * 60 * 1000);

    return () => clearInterval(heartbeatTimer);
  }, []);

  const handleLogout = () => {
    apiService.clearToken();
    setCurrentUser(null);
    setCurrentScreen('landing');
  };

  // Perform Analysis (real API call or calibrated fallback)
  const handlePerformAnalysis = async (image: string | File) => {
    setCurrentScreen('loading');
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

      // Recommendations
      const conditionProbMap: Record<string, number> = {};
      Object.entries(analysis.conditions || {}).forEach(([k, v]) => {
        conditionProbMap[k] = v.probability;
      });

      try {
        const recs = await apiService.getRecommendations({
          detected_conditions: conditionProbMap,
          skin_type: analysis.detected_skin_type,
          has_sensitive_skin: analysis.detected_skin_type === 'Sensitive',
        });
        setRecommendations(recs);
      } catch (recErr) {
        console.warn('Recommendation API note:', recErr);
      }

      // Smooth transition to Results (Screen 6)
      setTimeout(() => {
        setIsLoading(false);
        setCurrentScreen('results');
      }, 1800);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setIsLoading(false);
      setCurrentScreen('capture');

      const activeUrl = apiService.getBaseUrl();
      const serverDetail =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        err?.friendlyMessage ||
        (err?.message === 'Network Error'
          ? `Cannot connect to AI backend at ${activeUrl}. If the Render instance is spinning up from sleep, please wait 30 seconds and retry.`
          : err?.message) ||
        'Could not analyze photo. Please ensure you upload a clear, well-lit photograph of a human face.';

      setErrorMsg(typeof serverDetail === 'string' ? serverDetail : JSON.stringify(serverDetail));
    }
  };

  const handleUseSampleImage = async () => {
    setSelectedImage('/editorial_skin_portrait.jpg');
    setCurrentScreen('loading');
    setIsLoading(true);

    try {
      const resp = await fetch('/editorial_skin_portrait.jpg');
      if (resp.ok) {
        const blob = await resp.blob();
        const file = new File([blob], 'editorial_skin_portrait.jpg', { type: 'image/jpeg' });
        await handlePerformAnalysis(file);
      } else {
        await handlePerformAnalysis('/editorial_skin_portrait.jpg');
      }
    } catch (err) {
      await handlePerformAnalysis('/editorial_skin_portrait.jpg');
    }
  };

  // Authenticated section check for persistent sidebar
  // Authenticated section check for persistent sidebar
  const isDashboardLayout = [
    'dashboard',
    'capture',
    'results',
    'detail',
    'routine',
    'scanner',
    'progress',
    'settings',
    'telehealth',
    'telemetry',
  ].includes(currentScreen);

  return (
    <div className="min-h-screen bg-[#FAFAFB] text-slate-900 flex flex-col font-sans selection:bg-teal-100 selection:text-teal-900">
      
      {/* Universal Navigation Header */}
      <ScreenNavHeader
        currentScreen={currentScreen}
        onSelectScreen={(screen) => {
          if (!currentUser && ['dashboard', 'results', 'routine', 'scanner', 'progress', 'settings', 'telehealth', 'telemetry'].includes(screen)) {
            setIsAuthModalOpen(true);
          } else {
            setCurrentScreen(screen);
          }
        }}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Global Error Banner if any */}
      {errorMsg && (
        <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 mt-4">
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-2 shadow-xs">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-medium">{errorMsg}</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowBackendConfig(!showBackendConfig)}
                  className="text-xs text-teal-700 underline font-semibold"
                >
                  {showBackendConfig ? 'Close Backend Config' : 'Connect Cloud Backend URL'}
                </button>
                <button
                  type="button"
                  onClick={() => setErrorMsg(null)}
                  className="text-xs text-rose-700 underline font-semibold"
                >
                  Dismiss
                </button>
              </div>
            </div>

            {showBackendConfig && (
              <div className="pt-2 border-t border-rose-200 space-y-2 text-slate-800">
                <div className="text-[11px] text-slate-500">
                  Production backend is deployed at <strong>https://dermanova.onrender.com/api/v1</strong>:
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={backendInputUrl}
                    onChange={(e) => setBackendInputUrl(e.target.value)}
                    placeholder="https://dermanova.onrender.com/api/v1"
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono focus:outline-none focus:border-teal-600"
                  />
                  <button
                    type="button"
                    disabled={backendTesting || !backendInputUrl.trim()}
                    onClick={handleTestAndSaveBackend}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-mono text-xs font-medium shrink-0 transition"
                  >
                    {backendTesting ? 'Testing Connection...' : 'Test & Connect'}
                  </button>
                </div>
                {backendTestStatus && (
                  <div className={`text-[11px] font-mono ${backendTestStatus.includes('failed') ? 'text-rose-600' : 'text-teal-700 font-semibold'}`}>
                    {backendTestStatus}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* RENDER VIEW: Public Landing Page vs Authenticated Member Portal */}
      {currentScreen === 'landing' ? (
        <div className="flex-1 w-full max-w-[1360px] mx-auto px-4 sm:px-6 py-6 sm:py-10">
          <LandingPageScreen
            onStartAnalysis={() => {
              if (currentUser) {
                setCurrentScreen('capture');
              } else {
                setIsAuthModalOpen(true);
              }
            }}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onOpenRoutine={() => {
              if (currentUser) {
                setCurrentScreen('routine');
              } else {
                setIsAuthModalOpen(true);
              }
            }}
            onOpenProgress={() => {
              if (currentUser) {
                setCurrentScreen('progress');
              } else {
                setIsAuthModalOpen(true);
              }
            }}
            onOpenSettings={() => {
              if (currentUser) {
                setCurrentScreen('settings');
              } else {
                setIsAuthModalOpen(true);
              }
            }}
          />
        </div>
      ) : (
        <div className="flex-1 w-full max-w-[1360px] mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12 flex gap-8">
          
          {/* Desktop Persistent Sidebar (Member Portal) */}
          <aside className="hidden lg:flex flex-col w-64 shrink-0 space-y-5 sticky top-20 self-start">
            <div className="rounded-2xl bg-white border border-slate-200 p-2.5 space-y-1 shadow-xs">
              <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                Member Portal
              </div>

              <button
                onClick={() => setCurrentScreen('dashboard')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition text-left ${
                  currentScreen === 'dashboard'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <HomeIcon className={`w-4 h-4 ${currentScreen === 'dashboard' ? 'text-teal-400' : 'text-slate-400'}`} />
                <span>Overview</span>
              </button>

              <button
                onClick={() => setCurrentScreen('capture')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition text-left ${
                  currentScreen === 'capture' || currentScreen === 'loading'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Camera className={`w-4 h-4 ${currentScreen === 'capture' ? 'text-teal-400' : 'text-slate-400'}`} />
                <span>Diagnostic Studio</span>
              </button>

              <button
                onClick={() => setCurrentScreen('results')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition text-left ${
                  currentScreen === 'results' || currentScreen === 'detail'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Layers className={`w-4 h-4 ${currentScreen === 'results' ? 'text-teal-400' : 'text-slate-400'}`} />
                <span>AI Clinical Report</span>
              </button>

              <button
                onClick={() => setCurrentScreen('routine')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition text-left ${
                  currentScreen === 'routine'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <FileText className={`w-4 h-4 ${currentScreen === 'routine' ? 'text-teal-400' : 'text-slate-400'}`} />
                <span>Daily Routine</span>
              </button>

              <button
                onClick={() => setCurrentScreen('scanner')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition text-left ${
                  currentScreen === 'scanner'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Sparkles className={`w-4 h-4 ${currentScreen === 'scanner' ? 'text-teal-400' : 'text-slate-400'}`} />
                <span>Cosmetics Fit Scanner</span>
              </button>

              <button
                onClick={() => setCurrentScreen('progress')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition text-left ${
                  currentScreen === 'progress'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Compass className={`w-4 h-4 ${currentScreen === 'progress' ? 'text-teal-400' : 'text-slate-400'}`} />
                <span>Progress Log</span>
              </button>

              <button
                onClick={() => setCurrentScreen('settings')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition text-left ${
                  currentScreen === 'settings'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Settings className={`w-4 h-4 ${currentScreen === 'settings' ? 'text-teal-400' : 'text-slate-400'}`} />
                <span>Settings & Privacy</span>
              </button>
            </div>

            {/* Sidebar User Widget */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                  {currentUser?.full_name?.charAt(0) || 'D'}
                </div>
                <div className="truncate flex-1">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {currentUser?.full_name || 'Presentation Demo'}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono truncate">
                    {currentUser?.email || 'demo.patient@dermanova.app'}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="text-[11px] font-mono text-emerald-600 font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Local DB Synced</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-[11px] font-semibold text-rose-600 hover:underline"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content Pane */}
          <main className="flex-1 w-full min-w-0">
            {/* SCREEN 2: AUTHENTICATION AND ONBOARDING */}
            {currentScreen === 'auth' && (
              <AuthOnboardingScreen
                currentUser={currentUser}
                onAuthenticated={(user) => setCurrentUser(user)}
                onCompleteOnboarding={(profile) => {
                  if (currentUser) {
                    setCurrentUser({
                      ...currentUser,
                      profile: { ...(currentUser.profile as PatientProfile), ...profile },
                    });
                  }
                  setCurrentScreen('dashboard');
                }}
                onClose={() => setCurrentScreen(currentUser ? 'dashboard' : 'landing')}
              />
            )}

            {/* SCREEN 3: USER DASHBOARD */}
            {currentScreen === 'dashboard' && (
              <DashboardScreen
                currentUser={currentUser}
                latestAnalysis={analysisResult}
                onNavigateTab={(tab) => {
                  if (tab === 'scan') setCurrentScreen('results');
                  else if (tab === 'regimen') setCurrentScreen('routine');
                  else if (tab === 'journey') setCurrentScreen('progress');
                }}
                onStartNewAnalysis={() => setCurrentScreen('capture')}
                onOpenConcernDetail={(concernId) => {
                  setActiveConcernDetail(concernId);
                }}
              />
            )}

            {/* SCREEN 4: FACIAL PHOTO CAPTURE AND UPLOAD */}
            {currentScreen === 'capture' && (
              <CaptureUploadScreen
                onImageSelected={(image) => handlePerformAnalysis(image)}
                onUseSampleImage={handleUseSampleImage}
                isLoading={isLoading}
              />
            )}

            {/* SCREEN 5: ANALYSIS LOADING STATE */}
            {currentScreen === 'loading' && (
              <AnalysisLoadingScreen
                imagePreview={selectedImage}
                onCancel={() => {
                  setIsLoading(false);
                  setCurrentScreen('capture');
                }}
              />
            )}

            {/* SCREEN 6: AI ANALYSIS RESULTS DASHBOARD */}
            {currentScreen === 'results' && (
              <AnalysisResultsScreen
                analysis={analysisResult}
                displayImage={selectedImage}
                onStartNewAnalysis={() => setCurrentScreen('capture')}
                onOpenConcernDetail={(concernId) => {
                  setActiveConcernDetail(concernId);
                }}
                onBuildRoutine={() => setCurrentScreen('routine')}
              />
            )}

            {/* SCREEN 7: DETAILED SKIN CONCERN REPORT (Modal / Full View) */}
            {activeConcernDetail && (
              <ConcernDetailModal
                concernId={activeConcernDetail}
                analysis={analysisResult}
                displayImage={selectedImage}
                onClose={() => setActiveConcernDetail(null)}
                onNavigateToRoutine={() => {
                  setActiveConcernDetail(null);
                  setCurrentScreen('routine');
                }}
              />
            )}

            {/* If explicitly navigating to Screen 7 as standalone view from screen switcher */}
            {currentScreen === 'detail' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#E8EFE9] text-[#304D40] text-xs font-mono">
                  Viewing Detailed Clinical Concern Profile: {activeConcernDetail || 'Acne'}
                </div>
                <ConcernDetailModal
                  concernId={activeConcernDetail || 'acne'}
                  analysis={analysisResult}
                  displayImage={selectedImage}
                  onClose={() => setCurrentScreen('results')}
                  onNavigateToRoutine={() => setCurrentScreen('routine')}
                />
              </div>
            )}

            {/* SCREEN 8: PERSONALIZED SKINCARE ROUTINE */}
            {currentScreen === 'routine' && (
              <PersonalizedRoutineScreen
                recommendations={recommendations}
                skinType={analysisResult?.detected_skin_type || 'Combination'}
                onEditPreferences={() => setCurrentScreen('settings')}
                onStartScan={() => setCurrentScreen('capture')}
              />
            )}

            {/* SCREEN: COSMETICS FIT SCANNER */}
            {currentScreen === 'scanner' && (
              <CosmeticsFitScanner
                userSkinType={analysisResult?.detected_skin_type || 'Combination'}
                detectedIssues={analysisResult?.conditions ? Object.keys(analysisResult.conditions).filter(k => analysisResult.conditions[k].is_detected) : undefined}
              />
            )}

            {/* SCREEN 9: PROGRESS TRACKING AND SCAN HISTORY */}
            {currentScreen === 'progress' && (
              <ProgressTrackingScreen
                latestAnalysis={analysisResult}
                onStartNewAnalysis={() => setCurrentScreen('capture')}
              />
            )}

            {/* SCREEN 10: PROFILE, PREFERENCES, AND PRIVACY SETTINGS */}
            {currentScreen === 'settings' && (
              <ProfileSettingsScreen
                currentUser={currentUser}
                onLogout={handleLogout}
                onProfileUpdated={(up) => {
                  if (currentUser) {
                    setCurrentUser({ ...currentUser, ...up });
                  }
                }}
              />
            )}

            {/* SCREEN 11: TELEHEALTH DERMATOLOGIST CONSULTATION */}
            {currentScreen === 'telehealth' && (
              <TelehealthBookingScreen
                onBackToDashboard={() => setCurrentScreen('dashboard')}
                analysis={analysisResult}
                currentUser={currentUser}
              />
            )}

            {/* SCREEN 12: HISTORICAL SCAN ARCHIVE & TELEMETRY LOG */}
            {currentScreen === 'telemetry' && (
              <HistoricalTelemetryScreen
                onBackToDashboard={() => setCurrentScreen('dashboard')}
                onOpenAnalysisResults={() => setCurrentScreen('results')}
                onOpenConsultation={() => setCurrentScreen('telehealth')}
                latestAnalysis={analysisResult}
                currentUser={currentUser}
              />
            )}
          </main>
        </div>
      )}

      {/* Auth Modal for 1-Click Demo Login and Sign In / Sign Up */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthenticated={(user) => {
          setCurrentUser(user);
          setCurrentScreen('dashboard');
        }}
      />

      {/* =======================================================================
          MOBILE BOTTOM NAVIGATION (Fixed on small screens: md:hidden)
         ======================================================================= */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 h-16 bg-white/95 backdrop-blur-xl border-t border-slate-200 flex items-center justify-around px-2 shadow-lg">
        
        <button
          onClick={() => setCurrentScreen('landing')}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition ${
            currentScreen === 'landing' ? 'text-teal-700 font-bold' : 'text-slate-500'
          }`}
        >
          <HomeIcon className="w-4 h-4" />
          <span className="text-[10px] font-mono">Home</span>
        </button>

        <button
          onClick={() => {
            if (!currentUser) setIsAuthModalOpen(true);
            else setCurrentScreen('dashboard');
          }}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition ${
            currentScreen === 'dashboard' ? 'text-teal-700 font-bold' : 'text-slate-500'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span className="text-[10px] font-mono">Portal</span>
        </button>

        <button
          onClick={() => {
            if (!currentUser) setIsAuthModalOpen(true);
            else setCurrentScreen('capture');
          }}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition ${
            currentScreen === 'capture' || currentScreen === 'loading'
              ? 'text-teal-700 font-bold'
              : 'text-slate-500'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span className="text-[10px] font-mono">Scan</span>
        </button>

        <button
          onClick={() => {
            if (!currentUser) setIsAuthModalOpen(true);
            else setCurrentScreen('routine');
          }}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition ${
            currentScreen === 'routine' ? 'text-teal-700 font-bold' : 'text-slate-500'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span className="text-[10px] font-mono">Regimen</span>
        </button>

        <button
          onClick={() => {
            if (!currentUser) setIsAuthModalOpen(true);
            else setCurrentScreen('progress');
          }}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition ${
            currentScreen === 'progress' ? 'text-teal-700 font-bold' : 'text-slate-500'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span className="text-[10px] font-mono">Progress</span>
        </button>
      </nav>
    </div>
  );
}
