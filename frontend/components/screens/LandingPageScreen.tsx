'use client';

import React from 'react';
import {
  Camera,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Leaf,
  Layers,
  HeartPulse,
  Eye,
  SlidersHorizontal,
  FileText,
  Lock,
  ChevronRight,
  Activity,
  Compass,
  Check
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
  return (
    <div className="w-full space-y-16 sm:space-y-24 animate-fade-in">
      
      {/* =======================================================================
          HERO SECTION (Two-column desktop layout)
         ======================================================================= */}
      <section className="relative rounded-3xl bg-white border border-[#E8E8E1] p-6 sm:p-12 lg:p-14 overflow-hidden shadow-[0_2px_12px_rgba(37,41,35,0.03)]">
        {/* Soft botanical ambient gradients */}
        <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-[#E8EFE9]/60 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-[360px] h-[360px] bg-[#EEEAF5]/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-[280px] h-[280px] bg-[#F3E5E2]/40 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
          
          {/* Left Column: Editorial Headline & Actions */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Eyebrow Label */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8EFE9] border border-[#d6e0ce] text-[#304D40] text-[11px] font-mono tracking-wider uppercase font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#527665] animate-pulse" />
              PERSONALIZED SKIN INSIGHTS
            </div>

            {/* Main Headline (Refined Editorial Serif) */}
            <div className="space-y-2">
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-[3.4rem] text-[#252923] leading-[1.14] font-normal tracking-tight">
                Understand your skin. <br className="hidden sm:inline" />
                <span className="italic text-[#527665]">Care for it better.</span>
              </h1>
              <p className="text-sm sm:text-base text-[#777D76] leading-relaxed max-w-xl font-sans pt-1">
                Explore visible skin concerns with AI-powered facial analysis and build a skincare routine that fits your needs.
              </p>
            </div>

            {/* Primary & Secondary CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={onStartAnalysis}
                className="px-7 py-3.5 rounded-2xl bg-[#304D40] hover:bg-[#253d33] text-white font-sans font-medium text-sm flex items-center justify-center gap-2.5 transition shadow-[0_4px_16px_rgba(48,77,64,0.18)] active:scale-[0.98]"
              >
                <Camera className="w-4 h-4 text-[#E8EFE9]" />
                <span>Start Your Skin Analysis</span>
                <ArrowRight className="w-4 h-4 text-[#E8EFE9]" />
              </button>

              <a
                href="#how-it-works"
                className="px-6 py-3.5 rounded-2xl bg-white hover:bg-[#FAF9F6] border border-[#E8E8E1] text-[#252923] font-sans font-medium text-sm flex items-center justify-center gap-2 transition"
              >
                <span>See How It Works</span>
              </a>
            </div>

            {/* Small Trust Note */}
            <div className="flex items-center gap-2 pt-1 text-xs text-[#777D76] font-mono">
              <Leaf className="w-3.5 h-3.5 text-[#527665]" />
              <span>Simple. Personal. Skin-focused.</span>
              <span className="text-[#E8E8E1]">•</span>
              <span className="text-[#777D76]">Zero sponsored brand bias</span>
            </div>

            {/* Quick Metrics */}
            <div className="pt-4 border-t border-[#E8E8E1] grid grid-cols-3 gap-4 max-w-md">
              <div>
                <div className="font-serif text-xl sm:text-2xl text-[#252923]">8 Core</div>
                <div className="text-[11px] text-[#777D76] font-mono mt-0.5">Visible Concerns</div>
              </div>
              <div>
                <div className="font-serif text-xl sm:text-2xl text-[#527665]">100%</div>
                <div className="text-[11px] text-[#777D76] font-mono mt-0.5">Brand Neutral</div>
              </div>
              <div>
                <div className="font-serif text-xl sm:text-2xl text-[#304D40]">Private</div>
                <div className="text-[11px] text-[#777D76] font-mono mt-0.5">Biometric Safety</div>
              </div>
            </div>
          </div>

          {/* Right Column: Authentic Editorial Close-Up Portrait */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl bg-[#FAF9F6] border border-[#E8E8E1] p-3 shadow-md group">
              
              {/* Photo Canvas */}
              <div className="relative aspect-[4/3] sm:aspect-[4/4] lg:aspect-[4/4.2] rounded-2xl overflow-hidden bg-white">
                <img
                  src="/editorial_skin_portrait.jpg"
                  alt="DermaNova Natural Facial Skin Portrait"
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                />

                {/* Subtle Facial Alignment / Inspection Guide Contour */}
                <div className="absolute inset-0 pointer-events-none border border-white/20 rounded-2xl">
                  {/* Understated facial oval contour */}
                  <div className="absolute inset-8 sm:inset-10 border border-white/30 rounded-[48%] pointer-events-none" />
                </div>

                {/* Understated Example Concern Floating Labels (Visual only, no fake diagnostic claim) */}
                <div className="absolute top-4 sm:top-6 left-4 sm:left-6 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-[#E8E8E1] text-[10px] sm:text-[11px] text-[#252923] shadow-sm flex items-center gap-1.5">
                  <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-[#527665]" />
                  <span className="font-mono text-[#304D40] font-medium">Hydration Balance</span>
                </div>

                <div className="absolute bottom-14 sm:bottom-16 right-4 sm:right-6 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-[#E8E8E1] text-[10px] sm:text-[11px] text-[#252923] shadow-sm flex items-center gap-1.5">
                  <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-[#F3E5E2] border border-[#d6c4c0]" />
                  <span className="font-mono text-[#252923] font-medium">Pore Texture</span>
                </div>

                <div className="hidden sm:flex absolute top-1/2 -translate-y-1/2 right-4 px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-[#E8E8E1] text-[11px] text-[#252923] shadow-sm items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#EEEAF5] border border-[#d5cbe4]" />
                  <span className="font-mono text-[#252923] font-medium">Redness Tone</span>
                </div>

                {/* Bottom preview banner */}
                <div className="absolute bottom-3 inset-x-3 px-4 py-2.5 rounded-xl bg-white/95 backdrop-blur-md border border-[#E8E8E1] text-xs text-[#252923] flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-mono text-[11px] text-[#777D76]">Example Spatial Analysis Preview</span>
                  </div>
                  <button
                    onClick={onStartAnalysis}
                    className="text-[#527665] font-mono text-[11px] font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>Try Now</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =======================================================================
          THREE-STEP EXPLANATION: CAPTURE, UNDERSTAND, CARE
         ======================================================================= */}
      <section id="how-it-works" className="space-y-8 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#527665] font-semibold">
            How It Works
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl text-[#252923] font-normal tracking-tight">
            A calm, evidence-based approach to skin health
          </h2>
          <p className="text-xs sm:text-sm text-[#777D76] leading-relaxed">
            Three simple steps designed to help you decode visible skin signals without confusion or commercial bias.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Step 1: Capture */}
          <div className="rounded-3xl bg-white border border-[#E8E8E1] p-7 space-y-4 hover:border-[#527665]/40 transition shadow-sm">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-[#E8EFE9] text-[#304D40] text-xs font-mono font-semibold">
                STEP 01
              </span>
              <div className="w-10 h-10 rounded-2xl bg-[#FAF9F6] border border-[#E8E8E1] flex items-center justify-center text-[#527665]">
                <Camera className="w-5 h-5" />
              </div>
            </div>
            <h3 className="font-serif text-xl text-[#252923] font-normal">
              Capture
            </h3>
            <p className="text-xs sm:text-sm text-[#777D76] leading-relaxed">
              Take or upload a clean, well-lit photo of your face using your smartphone or webcam. Built-in framing guides ensure optimal lighting and focus.
            </p>
            <div className="pt-2 text-[11px] font-mono text-[#527665] flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>Real-time alignment guidance</span>
            </div>
          </div>

          {/* Step 2: Understand */}
          <div className="rounded-3xl bg-white border border-[#E8E8E1] p-7 space-y-4 hover:border-[#527665]/40 transition shadow-sm">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-[#EEEAF5] text-[#304D40] text-xs font-mono font-semibold">
                STEP 02
              </span>
              <div className="w-10 h-10 rounded-2xl bg-[#FAF9F6] border border-[#E8E8E1] flex items-center justify-center text-[#527665]">
                <Eye className="w-5 h-5" />
              </div>
            </div>
            <h3 className="font-serif text-xl text-[#252923] font-normal">
              Understand
            </h3>
            <p className="text-xs sm:text-sm text-[#777D76] leading-relaxed">
              Explore a transparent breakdown across 8 core visible concerns—from pore texture and redness to early blemishes—with plain-language scientific explanations.
            </p>
            <div className="pt-2 text-[11px] font-mono text-[#527665] flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>Cautious, calibrated AI insights</span>
            </div>
          </div>

          {/* Step 3: Care */}
          <div className="rounded-3xl bg-white border border-[#E8E8E1] p-7 space-y-4 hover:border-[#527665]/40 transition shadow-sm">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-[#F3E5E2] text-[#304D40] text-xs font-mono font-semibold">
                STEP 03
              </span>
              <div className="w-10 h-10 rounded-2xl bg-[#FAF9F6] border border-[#E8E8E1] flex items-center justify-center text-[#527665]">
                <HeartPulse className="w-5 h-5" />
              </div>
            </div>
            <h3 className="font-serif text-xl text-[#252923] font-normal">
              Care
            </h3>
            <p className="text-xs sm:text-sm text-[#777D76] leading-relaxed">
              Follow an easy AM/PM routine tailored to your skin barrier, with ingredient guidance and patch-test protocols that respect your skin's natural balance.
            </p>
            <div className="pt-2 text-[11px] font-mono text-[#527665] flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>Doctor-reviewed barrier care</span>
            </div>
          </div>
        </div>
      </section>

      {/* =======================================================================
          FEATURE CARDS: FACIAL SKIN INSIGHTS, PERSONALIZED ROUTINE, PROGRESS
         ======================================================================= */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#527665] font-semibold">
              Platform Features
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl text-[#252923] font-normal tracking-tight">
              Crafted for skin wellness, not shopping clutter
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#777D76] max-w-sm">
            Everything you need to observe, learn, and gently care for your skin barrier over time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Feature 1 */}
          <div
            onClick={onStartAnalysis}
            className="rounded-3xl bg-white border border-[#E8E8E1] p-7 space-y-4 cursor-pointer hover:border-[#527665]/60 hover:shadow-md transition group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#E8EFE9] flex items-center justify-center text-[#304D40] group-hover:scale-105 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl text-[#252923] font-normal">
              Facial Skin Insights
            </h3>
            <p className="text-xs sm:text-sm text-[#777D76] leading-relaxed">
              Spatial pinpointing of 8 primary visible concerns—including acne, redness, dark spots, and visible pores. Toggle effortlessly between your original photo and analysis overlay.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-mono text-[#527665] font-medium group-hover:text-[#304D40]">
              <span>Explore Analysis Interface</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Feature 2 */}
          <div
            onClick={onOpenRoutine}
            className="rounded-3xl bg-white border border-[#E8E8E1] p-7 space-y-4 cursor-pointer hover:border-[#527665]/60 hover:shadow-md transition group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#EEEAF5] flex items-center justify-center text-[#304D40] group-hover:scale-105 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl text-[#252923] font-normal">
              Personalized Routine
            </h3>
            <p className="text-xs sm:text-sm text-[#777D76] leading-relaxed">
              Step-by-step Morning and Evening regimens customized to your skin profile. Learn active ingredients (like Azelaic Acid, BHA, and Ceramides) without commercial hype.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-mono text-[#527665] font-medium group-hover:text-[#304D40]">
              <span>View Sample Routine</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Feature 3 */}
          <div
            onClick={onOpenProgress}
            className="rounded-3xl bg-white border border-[#E8E8E1] p-7 space-y-4 cursor-pointer hover:border-[#527665]/60 hover:shadow-md transition group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#F3E5E2] flex items-center justify-center text-[#304D40] group-hover:scale-105 transition-transform">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl text-[#252923] font-normal">
              Progress Tracking
            </h3>
            <p className="text-xs sm:text-sm text-[#777D76] leading-relaxed">
              Longitudinal skin journal with interactive before-and-after slider comparisons, skin reflection notes, and habit adherence tracking under consistent lighting.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-mono text-[#527665] font-medium group-hover:text-[#304D40]">
              <span>Explore Skin Journal</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* =======================================================================
          PRIVACY & ETHICAL AI FOUNDATION
         ======================================================================= */}
      <section className="rounded-3xl bg-white border border-[#E8E8E1] p-6 sm:p-10 space-y-6 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8EFE9] text-[#304D40] text-[11px] font-mono font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#527665]" />
              Data Stewardship & Privacy
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl text-[#252923] font-normal">
              Your facial photos belong to you. Always.
            </h3>
            <p className="text-xs sm:text-sm text-[#777D76] leading-relaxed">
              Facial photographs are sensitive biometric information. DermaNova processes images strictly to generate your requested skin analysis and personalized routine suggestions. We never sell biometric images to data brokers or advertisers. You retain full control to delete individual scans or wipe your entire profile at any moment.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-start gap-2.5 text-xs text-[#252923]">
                <CheckCircle2 className="w-4 h-4 text-[#527665] shrink-0 mt-0.5" />
                <span>Encrypted transit and secure storage</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-[#252923]">
                <CheckCircle2 className="w-4 h-4 text-[#527665] shrink-0 mt-0.5" />
                <span>Instant one-click scan deletion</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-[#252923]">
                <CheckCircle2 className="w-4 h-4 text-[#527665] shrink-0 mt-0.5" />
                <span>Zero third-party advertising tracking</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-[#252923]">
                <CheckCircle2 className="w-4 h-4 text-[#527665] shrink-0 mt-0.5" />
                <span>Clear explicit consent required</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 p-6 rounded-2xl bg-[#FAF9F6] border border-[#E8E8E1] space-y-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-white border border-[#E8E8E1] flex items-center justify-center text-[#527665] mx-auto sm:mx-0 shadow-sm">
              <Lock className="w-6 h-6" />
            </div>
            <h4 className="font-serif text-lg text-[#252923]">
              Transparent Privacy Architecture
            </h4>
            <p className="text-xs text-[#777D76] leading-relaxed">
              Read our full Privacy Policy and Biometric Retention standards to understand exactly how images are analyzed and stored.
            </p>
            <button
              onClick={onOpenSettings}
              className="text-xs font-mono text-[#527665] font-semibold hover:underline flex items-center gap-1 mx-auto sm:mx-0"
            >
              <span>View Privacy & Security Settings</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* =======================================================================
          MEDICAL & SCIENTIFIC DISCLAIMER (Prominent & Responsible)
         ======================================================================= */}
      <section className="p-6 rounded-2xl bg-[#FAF9F6] border border-[#E8E8E1] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-[#777D76]">
        <div className="flex items-start gap-3">
          <Leaf className="w-5 h-5 text-[#527665] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-[#252923] font-sans">
              Educational & Informational Care Notice:
            </span>
            <p className="leading-relaxed">
              DermaNova provides visual skin wellness insights and general cosmetic routine recommendations. It does not provide medical diagnoses, prescribe prescription pharmaceuticals, or replace clinical evaluation by a board-certified dermatologist. Always consult a licensed medical provider for persistent, painful, or evolving cutaneous conditions.
            </p>
          </div>
        </div>
        <button
          onClick={onStartAnalysis}
          className="px-5 py-2.5 rounded-xl bg-white border border-[#E8E8E1] text-[#252923] font-mono font-medium hover:bg-[#E8EFE9] transition shrink-0 self-start sm:self-center shadow-sm"
        >
          Analyze My Skin
        </button>
      </section>

      {/* =======================================================================
          REFINED EDITORIAL FOOTER
         ======================================================================= */}
      <footer className="pt-10 pb-6 border-t border-[#E8E8E1] space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#304D40] text-white flex items-center justify-center font-serif text-base">
                D
              </div>
              <span className="font-serif text-xl text-[#252923] tracking-tight">
                DermaNova
              </span>
            </div>
            <p className="text-xs text-[#777D76] leading-relaxed">
              “Your Skin Has a Story. Are You Listening?”
            </p>
            <div className="text-[11px] font-mono text-[#777D76]">
              Evidence-based AI skin analysis & personalized barrier care.
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#252923] font-semibold">
              Platform
            </h4>
            <ul className="space-y-1.5 text-xs text-[#777D76]">
              <li><button onClick={onStartAnalysis} className="hover:text-[#252923]">Facial Skin Analysis</button></li>
              <li><button onClick={onOpenRoutine} className="hover:text-[#252923]">Personalized Routine</button></li>
              <li><button onClick={onOpenProgress} className="hover:text-[#252923]">Progress Journal</button></li>
              <li><a href="#how-it-works" className="hover:text-[#252923]">How It Works</a></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#252923] font-semibold">
              Standards
            </h4>
            <ul className="space-y-1.5 text-xs text-[#777D76]">
              <li><span className="text-[#777D76]">8 Core Visible Concerns</span></li>
              <li><span className="text-[#777D76]">100% Brand-Neutral</span></li>
              <li><span className="text-[#777D76]">Patch-Test Verification</span></li>
              <li><span className="text-[#777D76]">Medical Advisory Guidelines</span></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#252923] font-semibold">
              Privacy & Legal
            </h4>
            <ul className="space-y-1.5 text-xs text-[#777D76]">
              <li><button onClick={onOpenSettings} className="hover:text-[#252923]">Privacy Policy</button></li>
              <li><button onClick={onOpenSettings} className="hover:text-[#252923]">Terms of Service</button></li>
              <li><button onClick={onOpenSettings} className="hover:text-[#252923]">Biometric Handling</button></li>
              <li><button onClick={onOpenSettings} className="hover:text-[#252923]">Manage My Data</button></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#E8E8E1] text-[11px] font-mono text-[#777D76]">
          <div>
            © 2026 DermaNova Health Technologies. All rights reserved.
          </div>
          <div>
            Designed with calm editorial precision for healthy skin barriers.
          </div>
        </div>
      </footer>
    </div>
  );
};
