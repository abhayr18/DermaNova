'use client';

import React, { useState } from 'react';
import {
  Camera,
  Home,
  FileText,
  Clock,
  Settings,
  Sparkles,
  Menu,
  X,
  User,
  LogOut,
  Leaf,
  Layers,
  ShieldCheck,
  Compass,
  Pill,
  ArrowRight
} from 'lucide-react';
import { UserAccount } from '../../services/api';

export type ScreenId =
  | 'landing'
  | 'auth'
  | 'dashboard'
  | 'capture'
  | 'loading'
  | 'results'
  | 'detail'
  | 'routine'
  | 'scanner'
  | 'progress'
  | 'settings'
  | 'telehealth'
  | 'telemetry';

interface ScreenNavHeaderProps {
  currentScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
  currentUser: UserAccount | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const ScreenNavHeader: React.FC<ScreenNavHeaderProps> = ({
  currentScreen,
  onSelectScreen,
  currentUser,
  onOpenAuth,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isPortal = currentScreen !== 'landing';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8E8E1] shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
        
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectScreen(currentUser ? 'dashboard' : 'landing')}
            className="flex items-center gap-3 text-left group"
          >
            {/* Minimal Botanical Contour Symbol */}
            <div className="w-10 h-10 rounded-2xl bg-[#304D40] text-white flex items-center justify-center font-serif text-lg shadow-xs group-hover:bg-[#253d33] transition">
              D
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-2xl text-[#252923] tracking-tight font-normal">
                  DermaNova
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#E8EFE9] text-[#304D40] font-semibold border border-[#d5ded0]">
                  <Leaf className="w-2.5 h-2.5 text-[#527665]" />
                  Clinical AI
                </span>
              </div>
              <div className="text-[10px] text-[#777D76] font-mono tracking-tight hidden sm:block">
                Longitudinal AI Facial Skin Diagnosis
              </div>
            </div>
          </button>
        </div>

        {/* Primary Desktop Navigation Links */}
        {!isPortal ? (
          /* Public Marketing Navigation */
          <nav className="hidden md:flex items-center gap-6 text-xs font-mono text-[#555C53]">
            <a href="#features" className="hover:text-[#252923] transition font-medium">
              Features
            </a>
            <a href="#biomarkers" className="hover:text-[#252923] transition font-medium">
              8 Biomarkers
            </a>
            <a href="#how-it-works" className="hover:text-[#252923] transition font-medium">
              How It Works
            </a>
            <a href="#technology" className="hover:text-[#252923] transition font-medium">
              Clinical Accuracy
            </a>
            <a href="#safety" className="hover:text-[#252923] transition font-medium">
              Biometric Privacy
            </a>
          </nav>
        ) : (
          /* Authenticated Portal Navigation Tabs */
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-[#FAF9F6] border border-[#E8E8E1] text-xs font-mono">
            <button
              onClick={() => onSelectScreen('dashboard')}
              className={`px-3.5 py-1.5 rounded-full transition ${
                currentScreen === 'dashboard'
                  ? 'bg-white text-[#252923] font-semibold shadow-xs border border-[#E8E8E1]'
                  : 'text-[#777D76] hover:text-[#252923]'
              }`}
            >
              Overview
            </button>

            <button
              onClick={() => onSelectScreen('capture')}
              className={`px-3.5 py-1.5 rounded-full transition ${
                currentScreen === 'capture' || currentScreen === 'loading'
                  ? 'bg-white text-[#252923] font-semibold shadow-xs border border-[#E8E8E1]'
                  : 'text-[#777D76] hover:text-[#252923]'
              }`}
            >
              Diagnostic Scan
            </button>

            <button
              onClick={() => onSelectScreen('results')}
              className={`px-3.5 py-1.5 rounded-full transition ${
                currentScreen === 'results' || currentScreen === 'detail'
                  ? 'bg-white text-[#252923] font-semibold shadow-xs border border-[#E8E8E1]'
                  : 'text-[#777D76] hover:text-[#252923]'
              }`}
            >
              AI Report
            </button>

            <button
              onClick={() => onSelectScreen('routine')}
              className={`px-3.5 py-1.5 rounded-full transition ${
                currentScreen === 'routine'
                  ? 'bg-white text-[#252923] font-semibold shadow-xs border border-[#E8E8E1]'
                  : 'text-[#777D76] hover:text-[#252923]'
              }`}
            >
              My Routine
            </button>

            <button
              onClick={() => onSelectScreen('scanner')}
              className={`px-3.5 py-1.5 rounded-full transition ${
                currentScreen === 'scanner'
                  ? 'bg-white text-[#252923] font-semibold shadow-xs border border-[#E8E8E1]'
                  : 'text-[#777D76] hover:text-[#252923]'
              }`}
            >
              Cosmetics Fit
            </button>

            <button
              onClick={() => onSelectScreen('progress')}
              className={`px-3.5 py-1.5 rounded-full transition ${
                currentScreen === 'progress'
                  ? 'bg-white text-[#252923] font-semibold shadow-xs border border-[#E8E8E1]'
                  : 'text-[#777D76] hover:text-[#252923]'
              }`}
            >
              Progress Log
            </button>
          </nav>
        )}

        {/* Right Header Controls & User / CTA */}
        <div className="flex items-center gap-3">
          
          {currentUser ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectScreen('capture')}
                className="hidden sm:flex px-4 py-2 rounded-2xl bg-[#304D40] hover:bg-[#253d33] text-white font-mono text-xs font-medium items-center gap-1.5 transition shadow-sm active:scale-95"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>New Scan</span>
              </button>

              <button
                onClick={() => onSelectScreen('settings')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#E8E8E1] text-xs text-[#252923] shadow-xs hover:border-[#527665] transition"
              >
                <div className="w-6 h-6 rounded-full bg-[#E8EFE9] text-[#304D40] text-[11px] font-mono flex items-center justify-center font-bold">
                  {currentUser.full_name?.charAt(0) || 'P'}
                </div>
                <span className="hidden sm:inline font-mono text-xs font-medium">
                  {currentUser.full_name?.split(' ')[0]}
                </span>
              </button>

              <button
                onClick={onLogout}
                className="p-2 rounded-full border border-[#E8E8E1] text-[#777D76] hover:text-[#b85c3c] hover:bg-[#FAF9F6] transition"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 rounded-2xl bg-white hover:bg-[#FAF9F6] border border-[#E8E8E1] text-[#252923] font-mono text-xs font-medium transition shadow-xs"
              >
                Sign In
              </button>

              <button
                onClick={() => onSelectScreen('capture')}
                className="px-4 py-2 rounded-2xl bg-[#304D40] hover:bg-[#253d33] text-white font-mono text-xs font-medium flex items-center gap-1.5 transition shadow-sm active:scale-95"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Start Free Scan</span>
              </button>
            </div>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-[#777D76] hover:text-[#252923] hover:bg-[#FAF9F6] transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E8E8E1] bg-white p-4 space-y-3 animate-fade-in shadow-lg">
          <div className="flex flex-col gap-1 text-xs font-mono">
            {currentUser ? (
              <>
                <button
                  onClick={() => { onSelectScreen('dashboard'); setMobileMenuOpen(false); }}
                  className="p-2.5 rounded-xl border border-[#E8E8E1] text-left hover:bg-[#FAF9F6] flex items-center gap-2"
                >
                  <Home className="w-4 h-4 text-[#527665]" />
                  <span>Overview Dashboard</span>
                </button>
                <button
                  onClick={() => { onSelectScreen('capture'); setMobileMenuOpen(false); }}
                  className="p-2.5 rounded-xl border border-[#E8E8E1] text-left hover:bg-[#FAF9F6] flex items-center gap-2"
                >
                  <Camera className="w-4 h-4 text-[#527665]" />
                  <span>AI Diagnostic Studio</span>
                </button>
                <button
                  onClick={() => { onSelectScreen('results'); setMobileMenuOpen(false); }}
                  className="p-2.5 rounded-xl border border-[#E8E8E1] text-left hover:bg-[#FAF9F6] flex items-center gap-2"
                >
                  <Layers className="w-4 h-4 text-[#527665]" />
                  <span>AI Clinical Report</span>
                </button>
                <button
                  onClick={() => { onSelectScreen('routine'); setMobileMenuOpen(false); }}
                  className="p-2.5 rounded-xl border border-[#E8E8E1] text-left hover:bg-[#FAF9F6] flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-[#527665]" />
                  <span>Personalized Regimen</span>
                </button>
                <button
                  onClick={() => { onSelectScreen('scanner'); setMobileMenuOpen(false); }}
                  className="p-2.5 rounded-xl border border-[#E8E8E1] text-left hover:bg-[#FAF9F6] flex items-center gap-2"
                >
                  <Pill className="w-4 h-4 text-[#527665]" />
                  <span>Cosmetics Fit Scanner</span>
                </button>
                <button
                  onClick={() => { onSelectScreen('progress'); setMobileMenuOpen(false); }}
                  className="p-2.5 rounded-xl border border-[#E8E8E1] text-left hover:bg-[#FAF9F6] flex items-center gap-2"
                >
                  <Compass className="w-4 h-4 text-[#527665]" />
                  <span>Skin Journey Progress</span>
                </button>
                <button
                  onClick={() => { onSelectScreen('settings'); setMobileMenuOpen(false); }}
                  className="p-2.5 rounded-xl border border-[#E8E8E1] text-left hover:bg-[#FAF9F6] flex items-center gap-2"
                >
                  <Settings className="w-4 h-4 text-[#527665]" />
                  <span>Patient Profile & Settings</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { onSelectScreen('landing'); setMobileMenuOpen(false); }}
                  className="p-2.5 rounded-xl border border-[#E8E8E1] text-left hover:bg-[#FAF9F6]"
                >
                  Home
                </button>
                <a
                  href="#features"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl border border-[#E8E8E1] text-left hover:bg-[#FAF9F6]"
                >
                  Features & Biomarkers
                </a>
                <a
                  href="#how-it-works"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl border border-[#E8E8E1] text-left hover:bg-[#FAF9F6]"
                >
                  How It Works
                </a>
                <button
                  onClick={() => { onOpenAuth(); setMobileMenuOpen(false); }}
                  className="p-2.5 rounded-xl border border-[#304D40] bg-[#E8EFE9] text-[#304D40] text-left font-semibold"
                >
                  Sign In / Create Account
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
