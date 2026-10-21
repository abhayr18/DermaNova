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
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectScreen(currentUser ? 'dashboard' : 'landing')}
            className="flex items-center gap-3 text-left group"
          >
            {/* Tech Logo Mark */}
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-base shadow-sm group-hover:bg-slate-800 transition relative">
              <span>D</span>
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">
                  DermaNova
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  Clinical AI
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Primary Desktop Navigation Links */}
        {!isPortal ? (
          /* Public Marketing Navigation */
          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-600">
            <a href="#features" className="hover:text-slate-900 transition">
              Overview
            </a>
            <a href="#biomarkers" className="hover:text-slate-900 transition">
              8 Biomarkers
            </a>
            <a href="#how-it-works" className="hover:text-slate-900 transition">
              Neural Pipeline
            </a>
            <a href="#technology" className="hover:text-slate-900 transition">
              Clinical Validation
            </a>
            <a href="#safety" className="hover:text-slate-900 transition">
              Privacy Architecture
            </a>
          </nav>
        ) : (
          /* Authenticated Portal Navigation Tabs */
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-slate-100/90 border border-slate-200/80 text-xs">
            <button
              onClick={() => onSelectScreen('dashboard')}
              className={`px-3.5 py-1.5 rounded-lg transition font-medium ${
                currentScreen === 'dashboard'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Overview
            </button>

            <button
              onClick={() => onSelectScreen('capture')}
              className={`px-3.5 py-1.5 rounded-lg transition font-medium ${
                currentScreen === 'capture' || currentScreen === 'loading'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Diagnostic Studio
            </button>

            <button
              onClick={() => onSelectScreen('results')}
              className={`px-3.5 py-1.5 rounded-lg transition font-medium ${
                currentScreen === 'results' || currentScreen === 'detail'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              AI Report
            </button>

            <button
              onClick={() => onSelectScreen('routine')}
              className={`px-3.5 py-1.5 rounded-lg transition font-medium ${
                currentScreen === 'routine'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daily Regimen
            </button>

            <button
              onClick={() => onSelectScreen('scanner')}
              className={`px-3.5 py-1.5 rounded-lg transition font-medium ${
                currentScreen === 'scanner'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cosmetics Fit
            </button>

            <button
              onClick={() => onSelectScreen('progress')}
              className={`px-3.5 py-1.5 rounded-lg transition font-medium ${
                currentScreen === 'progress'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Progress Log
            </button>
          </nav>
        )}

        {/* Right Header Controls & User / CTA */}
        <div className="flex items-center gap-3">
          
          {currentUser ? (
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => onSelectScreen('capture')}
                className="hidden sm:flex px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold items-center gap-1.5 transition shadow-sm active:scale-95"
              >
                <Camera className="w-3.5 h-3.5 text-teal-400" />
                <span>New Scan</span>
              </button>

              <button
                onClick={() => onSelectScreen('settings')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 shadow-xs hover:border-slate-300 transition"
              >
                <div className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">
                  {currentUser.full_name?.charAt(0) || 'P'}
                </div>
                <span className="hidden sm:inline text-xs font-medium text-slate-800">
                  {currentUser.full_name?.split(' ')[0]}
                </span>
              </button>

              <button
                onClick={onLogout}
                className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-slate-50 transition"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 text-xs font-semibold transition"
              >
                Sign In
              </button>

              <button
                onClick={() => onSelectScreen('capture')}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm active:scale-95"
              >
                <Camera className="w-3.5 h-3.5 text-teal-400" />
                <span>Launch Clinical Scan</span>
              </button>
            </div>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white p-4 space-y-3 animate-fade-in shadow-lg">
          <div className="flex flex-col gap-1.5 text-xs font-mono">
            {currentUser ? (
              <>
                <button
                  onClick={() => { onSelectScreen('dashboard'); setMobileMenuOpen(false); }}
                  className="p-2.5 rounded-xl border border-slate-200 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-800"
                >
                  <Home className="w-4 h-4 text-teal-600" />
                  <span>Overview Dashboard</span>
                </button>
                <button
                  onClick={() => { onSelectScreen('capture'); setMobileMenuOpen(false); }}
                  className="p-2.5 rounded-xl border border-slate-200 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-800"
                >
                  <Camera className="w-4 h-4 text-teal-600" />
                  <span>Diagnostic Studio</span>
                </button>
                <button
                  onClick={() => { onSelectScreen('results'); setMobileMenuOpen(false); }}
                  className="p-2.5 rounded-xl border border-slate-200 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-800"
                >
                  <Layers className="w-4 h-4 text-teal-600" />
                  <span>AI Clinical Report</span>
                </button>
                <button
                  onClick={() => { onSelectScreen('routine'); setMobileMenuOpen(false); }}
                  className="p-2.5 rounded-xl border border-slate-200 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-800"
                >
                  <FileText className="w-4 h-4 text-teal-600" />
                  <span>Daily Regimen</span>
                </button>
                <button
                  onClick={() => { onSelectScreen('scanner'); setMobileMenuOpen(false); }}
                  className="p-2.5 rounded-xl border border-slate-200 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-800"
                >
                  <Pill className="w-4 h-4 text-teal-600" />
                  <span>Cosmetics Fit Scanner</span>
                </button>
                <button
                  onClick={() => { onSelectScreen('progress'); setMobileMenuOpen(false); }}
                  className="p-2.5 rounded-xl border border-slate-200 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-800"
                >
                  <Compass className="w-4 h-4 text-teal-600" />
                  <span>Progress Log</span>
                </button>
                <button
                  onClick={() => { onSelectScreen('settings'); setMobileMenuOpen(false); }}
                  className="p-2.5 rounded-xl border border-slate-200 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-800"
                >
                  <Settings className="w-4 h-4 text-teal-600" />
                  <span>Settings & Privacy</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { onSelectScreen('landing'); setMobileMenuOpen(false); }}
                  className="p-2.5 rounded-xl border border-slate-200 text-left hover:bg-slate-50 text-slate-800 font-semibold"
                >
                  Home
                </button>
                <a
                  href="#features"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl border border-slate-200 text-left hover:bg-slate-50 text-slate-800"
                >
                  Features & Biomarkers
                </a>
                <a
                  href="#how-it-works"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl border border-slate-200 text-left hover:bg-slate-50 text-slate-800"
                >
                  Neural Architecture
                </a>
                <button
                  onClick={() => { onOpenAuth(); setMobileMenuOpen(false); }}
                  className="p-2.5 rounded-xl border border-slate-900 bg-slate-900 text-white text-left font-bold shadow-xs"
                >
                  Sign In / Demo Access
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
