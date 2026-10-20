'use client';

import React, { useState } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowRight,
  Check,
  Sparkles,
  ChevronLeft,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { UserAccount, PatientProfile, apiService } from '../../services/api';

interface AuthOnboardingScreenProps {
  currentUser: UserAccount | null;
  onAuthenticated: (user: UserAccount) => void;
  onCompleteOnboarding: (profile: Partial<PatientProfile>) => void;
  onClose?: () => void;
}

export const AuthOnboardingScreen: React.FC<AuthOnboardingScreenProps> = ({
  currentUser,
  onAuthenticated,
  onCompleteOnboarding,
  onClose,
}) => {
  // Mode: 'auth' (Sign in / create account) or 'onboarding' (4-step quiz)
  const [activeMode, setActiveMode] = useState<'auth' | 'onboarding'>(
    currentUser ? 'onboarding' : 'auth'
  );
  const [isLogin, setIsLogin] = useState(true);

  // Auth fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [forgotModal, setForgotModal] = useState(false);
  const [forgotEmailSent, setForgotEmailSent] = useState(false);

  // Onboarding fields
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [skinType, setSkinType] = useState<string>('Combination');
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([
    'Acne',
    'Visible Pores',
  ]);
  const [sensitivity, setSensitivity] = useState<string>('Moderate');
  const [experience, setExperience] = useState<string>('Intermediate');

  const skinTypeOptions = [
    { id: 'Oily', label: 'Oily', desc: 'Prone to excess shine across forehead, nose, and cheeks' },
    { id: 'Dry', label: 'Dry', desc: 'Feels tight, flakey, or rough with reduced natural sebum' },
    { id: 'Combination', label: 'Combination', desc: 'Oily T-zone (forehead, nose) with drier cheeks' },
    { id: 'Normal', label: 'Normal', desc: 'Balanced hydration with minimal shine or tight sensations' },
    { id: 'Unsure', label: 'Unsure', desc: 'Need guided analysis to identify baseline profile' },
  ];

  const concernOptions = [
    { id: 'Acne', label: 'Acne', desc: 'Papules, pustules, and active breakouts' },
    { id: 'Blackheads', label: 'Blackheads', desc: 'Open oxidized follicular plugs' },
    { id: 'Whiteheads', label: 'Whiteheads', desc: 'Closed comedones under skin layer' },
    { id: 'Dark Spots', label: 'Dark Spots', desc: 'Post-inflammatory hyperpigmentation' },
    { id: 'Pigmentation', label: 'Pigmentation', desc: 'Uneven tone & sun spots' },
    { id: 'Visible Pores', label: 'Visible Pores', desc: 'Dilated follicular openings' },
    { id: 'Wrinkles', label: 'Wrinkles', desc: 'Fine lines & collagen expression creases' },
    { id: 'Redness', label: 'Redness', desc: 'Erythema and reactive facial flushing' },
  ];

  const sensitivityOptions = [
    { id: 'Low', label: 'Low Sensitivity', desc: 'Skin rarely reacts to strong actives or fragrances' },
    { id: 'Moderate', label: 'Moderate Sensitivity', desc: 'Occasional tingling or redness with new active ingredients' },
    { id: 'High', label: 'High Sensitivity / Reactive', desc: 'Prone to burning, stinging, or redness easily' },
  ];

  const experienceOptions = [
    { id: 'Beginner', label: 'Beginner', desc: 'Just starting with basics (cleanser, moisturizer, SPF)' },
    { id: 'Intermediate', label: 'Intermediate', desc: 'Familiar with chemical exfoliants (AHA/BHA), Vitamin C, or Niacinamide' },
    { id: 'Experienced', label: 'Experienced', desc: 'Comfortable with prescription retinoids and active ingredient layering' },
  ];

  const handleToggleConcern = (concern: string) => {
    if (selectedConcerns.includes(concern)) {
      setSelectedConcerns(selectedConcerns.filter((c) => c !== concern));
    } else {
      setSelectedConcerns([...selectedConcerns, concern]);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    setAuthSuccess(null);

    try {
      if (isLogin) {
        const res = await apiService.login({ email, password });
        onAuthenticated(res.user);
        setAuthSuccess('Welcome back! Loading your profile...');
        setTimeout(() => {
          setActiveMode('onboarding');
        }, 600);
      } else {
        const res = await apiService.signup({
          email,
          password,
          full_name: fullName || 'Patient',
        });
        onAuthenticated(res.user);
        setAuthSuccess('Account created successfully! Starting your onboarding...');
        setTimeout(() => {
          setActiveMode('onboarding');
        }, 600);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      const serverMsg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        (isLogin
          ? 'Failed to sign in. Please verify your email and password.'
          : 'Failed to create account. Please try again.');
      setAuthError(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleFinishOnboarding = () => {
    onCompleteOnboarding({
      baseline_skin_type: skinType,
      primary_skin_concern: selectedConcerns[0] || 'Acne',
      has_sensitive_skin: sensitivity === 'High',
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in py-4">
      
      {/* Top Mode Header / Segmented Switch */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E8E8E1]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#304D40] text-white flex items-center justify-center font-serif text-sm">
            D
          </div>
          <div>
            <h2 className="font-serif text-xl text-[#252923] font-normal">
              {activeMode === 'auth' ? 'Member Access' : 'Personal Skincare Onboarding'}
            </h2>
            <p className="text-[11px] font-mono text-[#777D76]">
              {activeMode === 'auth'
                ? 'Sign in or create an account for cloud synchronization'
                : `Step ${onboardingStep} of 4 • Tailoring your skin model`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-full bg-[#E8EFE9] border border-[#d6e0ce] text-xs font-mono">
          <button
            onClick={() => setActiveMode('auth')}
            className={`px-3 py-1 rounded-full transition ${
              activeMode === 'auth'
                ? 'bg-white text-[#252923] font-semibold shadow-sm'
                : 'text-[#777D76] hover:text-[#252923]'
            }`}
          >
            Sign In / Join
          </button>
          <button
            onClick={() => setActiveMode('onboarding')}
            className={`px-3 py-1 rounded-full transition ${
              activeMode === 'onboarding'
                ? 'bg-white text-[#252923] font-semibold shadow-sm'
                : 'text-[#777D76] hover:text-[#252923]'
            }`}
          >
            Onboarding Quiz
          </button>
        </div>
      </div>

      {/* =======================================================================
          MODE 1: AUTHENTICATION (Sign In & Create Account)
         ======================================================================= */}
      {activeMode === 'auth' && (
        <div className="rounded-3xl bg-white border border-[#E8E8E1] p-6 sm:p-10 space-y-6 shadow-sm">
          
          {/* Sign In vs Create Account Tabs */}
          <div className="flex rounded-2xl bg-[#FAF9F6] p-1 border border-[#E8E8E1] text-xs font-mono">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setAuthError(null); setAuthSuccess(null); }}
              className={`flex-1 py-2 font-medium rounded-xl transition ${
                isLogin
                  ? 'bg-white text-[#252923] font-semibold shadow-sm border border-[#E8E8E1]'
                  : 'text-[#777D76] hover:text-[#252923]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setAuthError(null); setAuthSuccess(null); }}
              className={`flex-1 py-2 font-medium rounded-xl transition ${
                !isLogin
                  ? 'bg-white text-[#252923] font-semibold shadow-sm border border-[#E8E8E1]'
                  : 'text-[#777D76] hover:text-[#252923]'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Heading */}
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-serif text-2xl text-[#252923] font-normal">
              {isLogin ? 'Welcome back to your skin space' : 'Begin your clinical skin journey'}
            </h3>
            <p className="text-xs text-[#777D76]">
              {isLogin
                ? 'Access your longitudinal skin scans, personalized routines, and journal notes.'
                : 'Join DermaNova for private AI-powered visual skin tracking and barrier guidance.'}
            </p>
          </div>

          {/* Feedback Banners */}
          {authError && (
            <div className="p-3.5 rounded-xl bg-[#fff5f5] border border-[#fed7d7] text-[#9b2c2c] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}
          {authSuccess && (
            <div className="p-3.5 rounded-xl bg-[#E8EFE9] border border-[#d6e0ce] text-[#304D40] text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{authSuccess}</span>
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#252923] font-medium block">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#777D76] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Maya Sharma"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#FAF9F6] border border-[#E8E8E1] text-xs sm:text-sm text-[#252923] focus:outline-none focus:border-[#527665] focus:bg-white transition"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#252923] font-medium block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#777D76] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#FAF9F6] border border-[#E8E8E1] text-xs sm:text-sm text-[#252923] focus:outline-none focus:border-[#527665] focus:bg-white transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-[#252923] font-medium block">
                  Password
                </label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => setForgotModal(true)}
                    className="text-[11px] font-mono text-[#527665] hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#777D76] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-[#FAF9F6] border border-[#E8E8E1] text-xs sm:text-sm text-[#252923] focus:outline-none focus:border-[#527665] focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#777D76] hover:text-[#252923]"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3.5 rounded-2xl bg-[#304D40] hover:bg-[#253d33] disabled:opacity-60 text-white font-mono text-xs sm:text-sm font-medium transition shadow-sm flex items-center justify-center gap-2 mt-2"
            >
              {authLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? 'Sign In to DermaNova' : 'Create My Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Social Divider */}
          <div className="relative flex items-center justify-center pt-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E8E8E1]" />
            </div>
            <span className="relative px-3 bg-white text-[11px] font-mono text-[#777D76]">
              or continue with
            </span>
          </div>

          {/* Google Sign-in Visual Placeholder */}
          <button
            type="button"
            onClick={() => {
              setAuthError('Google Single Sign-On is currently disabled. Please sign in with your email and password.');
            }}
            className="w-full py-3 rounded-xl bg-white hover:bg-[#FAF9F6] border border-[#E8E8E1] text-xs font-mono text-[#252923] flex items-center justify-center gap-2.5 transition shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Privacy Note */}
          <div className="pt-2 text-center text-[11px] text-[#777D76] font-mono flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#527665]" />
            <span>Biometric privacy guaranteed under DermaNova Security Protocols</span>
          </div>
        </div>
      )}

      {/* =======================================================================
          MODE 2: ONBOARDING QUESTIONS (4 Steps: Type, Concerns, Sensitivity, Experience)
         ======================================================================= */}
      {activeMode === 'onboarding' && (
        <div className="rounded-3xl bg-white border border-[#E8E8E1] p-6 sm:p-10 space-y-7 shadow-sm">
          
          {/* Progress Indicator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-[#777D76]">
              <span>Question {onboardingStep} of 4</span>
              <span>
                {onboardingStep === 1 && 'Skin Baseline'}
                {onboardingStep === 2 && 'Visible Concerns'}
                {onboardingStep === 3 && 'Sensitivity'}
                {onboardingStep === 4 && 'Experience'}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#FAF9F6] border border-[#E8E8E1] overflow-hidden">
              <div
                className="h-full bg-[#527665] transition-all duration-300 rounded-full"
                style={{ width: `${(onboardingStep / 4) * 100}%` }}
              />
            </div>
          </div>

          {/* STEP 1: SKIN TYPE */}
          {onboardingStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#527665] font-semibold">
                  Step 01: Skin Type
                </span>
                <h3 className="font-serif text-2xl text-[#252923] font-normal">
                  How does your skin feel throughout the day?
                </h3>
                <p className="text-xs text-[#777D76]">
                  Select the option that most closely matches your natural sebum and moisture balance.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 pt-2">
                {skinTypeOptions.map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => setSkinType(opt.id)}
                    className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                      skinType === opt.id
                        ? 'border-[#527665] bg-[#E8EFE9]/50 shadow-sm'
                        : 'border-[#E8E8E1] bg-[#FAF9F6] hover:bg-white hover:border-[#527665]/30'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs font-mono font-semibold text-[#252923]">
                        {opt.label}
                      </div>
                      <div className="text-[11px] text-[#777D76]">
                        {opt.desc}
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition shrink-0 ${
                        skinType === opt.id
                          ? 'border-[#527665] bg-[#527665] text-white'
                          : 'border-[#E8E8E1] bg-white'
                      }`}
                    >
                      {skinType === opt.id && <Check className="w-3 h-3" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: MAIN CONCERNS */}
          {onboardingStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#527665] font-semibold">
                  Step 02: Primary Concerns
                </span>
                <h3 className="font-serif text-2xl text-[#252923] font-normal">
                  What visible skin concerns would you like to address?
                </h3>
                <p className="text-xs text-[#777D76]">
                  Select all that apply. DermaNova's vision model evaluates these 8 visible concerns.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {concernOptions.map((opt) => {
                  const isChecked = selectedConcerns.includes(opt.id);
                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleToggleConcern(opt.id)}
                      className={`p-4 rounded-2xl border transition cursor-pointer flex items-start justify-between ${
                        isChecked
                          ? 'border-[#527665] bg-[#E8EFE9]/50 shadow-sm'
                          : 'border-[#E8E8E1] bg-[#FAF9F6] hover:bg-white hover:border-[#527665]/30'
                      }`}
                    >
                      <div className="space-y-0.5 pr-2">
                        <div className="text-xs font-mono font-semibold text-[#252923]">
                          {opt.label}
                        </div>
                        <div className="text-[11px] text-[#777D76]">
                          {opt.desc}
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition shrink-0 mt-0.5 ${
                          isChecked
                            ? 'border-[#527665] bg-[#527665] text-white'
                            : 'border-[#E8E8E1] bg-white'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: SENSITIVITY */}
          {onboardingStep === 3 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#527665] font-semibold">
                  Step 03: Sensitivity (Optional)
                </span>
                <h3 className="font-serif text-2xl text-[#252923] font-normal">
                  How reactive is your cutaneous barrier?
                </h3>
                <p className="text-xs text-[#777D76]">
                  Helps our formulation engine determine whether to recommend gentle buffer lipids or active potencies.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 pt-2">
                {sensitivityOptions.map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => setSensitivity(opt.id)}
                    className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                      sensitivity === opt.id
                        ? 'border-[#527665] bg-[#E8EFE9]/50 shadow-sm'
                        : 'border-[#E8E8E1] bg-[#FAF9F6] hover:bg-white hover:border-[#527665]/30'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs font-mono font-semibold text-[#252923]">
                        {opt.label}
                      </div>
                      <div className="text-[11px] text-[#777D76]">
                        {opt.desc}
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition shrink-0 ${
                        sensitivity === opt.id
                          ? 'border-[#527665] bg-[#527665] text-white'
                          : 'border-[#E8E8E1] bg-white'
                      }`}
                    >
                      {sensitivity === opt.id && <Check className="w-3 h-3" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: EXPERIENCE LEVEL */}
          {onboardingStep === 4 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#527665] font-semibold">
                  Step 04: Skincare Experience
                </span>
                <h3 className="font-serif text-2xl text-[#252923] font-normal">
                  What is your experience with active formulations?
                </h3>
                <p className="text-xs text-[#777D76]">
                  Ensures routine instructions match your comfort with introducing actives like retinoids and AHAs.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 pt-2">
                {experienceOptions.map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => setExperience(opt.id)}
                    className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                      experience === opt.id
                        ? 'border-[#527665] bg-[#E8EFE9]/50 shadow-sm'
                        : 'border-[#E8E8E1] bg-[#FAF9F6] hover:bg-white hover:border-[#527665]/30'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs font-mono font-semibold text-[#252923]">
                        {opt.label}
                      </div>
                      <div className="text-[11px] text-[#777D76]">
                        {opt.desc}
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition shrink-0 ${
                        experience === opt.id
                          ? 'border-[#527665] bg-[#527665] text-white'
                          : 'border-[#E8E8E1] bg-white'
                      }`}
                    >
                      {experience === opt.id && <Check className="w-3 h-3" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Onboarding Nav Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-[#E8E8E1]">
            {onboardingStep > 1 ? (
              <button
                type="button"
                onClick={() => setOnboardingStep(onboardingStep - 1)}
                className="px-4 py-2 rounded-xl border border-[#E8E8E1] text-[#777D76] hover:text-[#252923] text-xs font-mono flex items-center gap-1.5 transition"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
            ) : (
              <span />
            )}

            <div className="flex items-center gap-2">
              {onboardingStep === 3 && (
                <button
                  type="button"
                  onClick={() => setOnboardingStep(4)}
                  className="px-3 py-2 text-xs font-mono text-[#777D76] hover:text-[#252923]"
                >
                  Skip optional
                </button>
              )}

              {onboardingStep < 4 ? (
                <button
                  type="button"
                  onClick={() => setOnboardingStep(onboardingStep + 1)}
                  className="px-6 py-2.5 rounded-xl bg-[#304D40] hover:bg-[#253d33] text-white text-xs font-mono font-medium flex items-center gap-1.5 transition shadow-sm"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinishOnboarding}
                  className="px-6 py-2.5 rounded-xl bg-[#527665] hover:bg-[#436153] text-white text-xs font-mono font-medium flex items-center gap-1.5 transition shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Save Skin Profile</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Dialog */}
      {forgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-[#E8E8E1] p-6 max-w-sm w-full space-y-4 shadow-xl">
            <h4 className="font-serif text-lg text-[#252923]">Reset Your Password</h4>
            <p className="text-xs text-[#777D76]">
              Enter your email and we'll send you a secure link to reset your credentials.
            </p>
            {forgotEmailSent ? (
              <div className="p-3 rounded-xl bg-[#E8EFE9] text-[#304D40] text-xs font-mono">
                ✓ Password reset link sent! Please check your inbox.
              </div>
            ) : (
              <input
                type="email"
                placeholder="name@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#E8E8E1] text-xs"
                defaultValue={email}
              />
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => { setForgotModal(false); setForgotEmailSent(false); }}
                className="px-4 py-2 rounded-xl text-xs font-mono text-[#777D76]"
              >
                Close
              </button>
              {!forgotEmailSent && (
                <button
                  onClick={() => setForgotEmailSent(true)}
                  className="px-4 py-2 rounded-xl bg-[#304D40] text-white text-xs font-mono"
                >
                  Send Reset Link
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
