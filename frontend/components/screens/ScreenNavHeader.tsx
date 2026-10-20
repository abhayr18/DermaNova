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
  ChevronDown
} from 'lucide-react';
import { UserAccount } from '../../services/api';

export type ScreenId =
  | 'landing'      // Screen 1
  | 'auth'         // Screen 2
  | 'dashboard'    // Screen 3
  | 'capture'      // Screen 4
  | 'loading'      // Screen 5
  | 'results'      // Screen 6
  | 'detail'       // Screen 7
  | 'routine'      // Screen 8
  | 'progress'     // Screen 9
  | 'settings'     // Screen 10
  | 'telehealth'   // Screen 11 (Google Stitch Telehealth Network)
  | 'telemetry';   // Screen 12 (Google Stitch Historical Telemetry Log & FHIR Export)

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
  const [screensDropdownOpen, setScreensDropdownOpen] = useState(false);

  const screensMeta: { id: ScreenId; number: string; title: string; category: string }[] = [
    { id: 'landing', number: '01', title: 'Landing Page', category: 'Marketing' },
    { id: 'auth', number: '02', title: 'Auth & Onboarding', category: 'Account' },
    { id: 'dashboard', number: '03', title: 'User Dashboard', category: 'Portal' },
    { id: 'capture', number: '04', title: 'Photo Capture & Upload', category: 'Analysis' },
    { id: 'loading', number: '05', title: 'Analysis Loading State', category: 'Analysis' },
    { id: 'results', number: '06', title: 'AI Analysis Results', category: 'Signature' },
    { id: 'detail', number: '07', title: 'Detailed Concern Report', category: 'Clinical' },
    { id: 'routine', number: '08', title: 'Personalized Routine', category: 'Regimen' },
    { id: 'progress', number: '09', title: 'Progress Tracking', category: 'Journal' },
    { id: 'settings', number: '10', title: 'Profile & Privacy', category: 'Settings' },
    { id: 'telehealth', number: '11', title: 'Telehealth Consult', category: 'Clinical' },
    { id: 'telemetry', number: '12', title: 'Telemetry Log & FHIR', category: 'Vault' },
  ];

  const currentMeta = screensMeta.find((s) => s.id === currentScreen) || screensMeta[0];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8E8E1] shadow-xs">
      
      {/* Quick Screen Inspector Utility Bar */}
      <div className="bg-[#FAF9F6] border-b border-[#E8E8E1] px-4 py-1.5 hidden lg:block">
        <div className="max-w-[1240px] mx-auto flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center gap-2 text-[#777D76]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#527665]" />
            <span className="font-semibold text-[#252923]">DermaNova 10-Screen Design System:</span>
            <span>Jump directly to any brief deliverable screen:</span>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto">
            {screensMeta.map((s) => (
              <button
                key={s.id}
                onClick={() => onSelectScreen(s.id)}
                className={`px-2 py-0.5 rounded-md transition text-[10px] whitespace-nowrap ${
                  currentScreen === s.id
                    ? 'bg-[#304D40] text-white font-semibold'
                    : 'text-[#777D76] hover:text-[#252923] hover:bg-white'
                }`}
              >
                {s.number}. {s.title.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
        
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectScreen('landing')}
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
                <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#E8EFE9] text-[#304D40]">
                  <Leaf className="w-2.5 h-2.5 text-[#527665]" />
                  Clinical AI
                </span>
              </div>
              <div className="text-[10px] sm:text-[11px] text-[#777D76] font-sans">
                “Your Skin Has a Story. Are You Listening?”
              </div>
            </div>
          </button>
        </div>

        {/* Primary Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-[#FAF9F6] border border-[#E8E8E1] text-xs font-mono">
          <button
            onClick={() => onSelectScreen('landing')}
            className={`px-3.5 py-1.5 rounded-full transition ${
              currentScreen === 'landing'
                ? 'bg-white text-[#252923] font-semibold shadow-xs border border-[#E8E8E1]'
                : 'text-[#777D76] hover:text-[#252923]'
            }`}
          >
            Home
          </button>

          <button
            onClick={() => onSelectScreen('dashboard')}
            className={`px-3.5 py-1.5 rounded-full transition ${
              currentScreen === 'dashboard'
                ? 'bg-white text-[#252923] font-semibold shadow-xs border border-[#E8E8E1]'
                : 'text-[#777D76] hover:text-[#252923]'
            }`}
          >
            Dashboard
          </button>

          <button
            onClick={() => onSelectScreen('capture')}
            className={`px-3.5 py-1.5 rounded-full transition ${
              currentScreen === 'capture' || currentScreen === 'loading'
                ? 'bg-white text-[#252923] font-semibold shadow-xs border border-[#E8E8E1]'
                : 'text-[#777D76] hover:text-[#252923]'
            }`}
          >
            Skin Analysis
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
            onClick={() => onSelectScreen('progress')}
            className={`px-3.5 py-1.5 rounded-full transition ${
              currentScreen === 'progress'
                ? 'bg-white text-[#252923] font-semibold shadow-xs border border-[#E8E8E1]'
                : 'text-[#777D76] hover:text-[#252923]'
            }`}
          >
            Progress
          </button>
        </nav>

        {/* Right Header Controls & User / CTA */}
        <div className="flex items-center gap-2.5">
          
          {/* Quick Screen Select Dropdown (Mobile / Tablet) */}
          <div className="relative block lg:hidden">
            <button
              onClick={() => setScreensDropdownOpen(!screensDropdownOpen)}
              className="px-2.5 py-1.5 rounded-xl border border-[#E8E8E1] bg-[#FAF9F6] text-xs font-mono text-[#252923] flex items-center gap-1"
            >
              <span>{currentMeta.number}. {currentMeta.title.split(' ')[0]}</span>
              <ChevronDown className="w-3 h-3 text-[#777D76]" />
            </button>

            {screensDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-white border border-[#E8E8E1] p-1.5 shadow-xl z-50 text-xs font-mono">
                {screensMeta.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      onSelectScreen(s.id);
                      setScreensDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl transition ${
                      currentScreen === s.id
                        ? 'bg-[#E8EFE9] text-[#304D40] font-semibold'
                        : 'text-[#777D76] hover:bg-[#FAF9F6] hover:text-[#252923]'
                    }`}
                  >
                    <span className="text-[#527665] font-bold mr-1.5">{s.number}.</span>
                    <span>{s.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Primary Action: Analyze My Skin */}
          <button
            onClick={() => onSelectScreen('capture')}
            className="hidden sm:flex px-4 py-2 rounded-2xl bg-[#304D40] hover:bg-[#253d33] text-white font-mono text-xs font-medium items-center gap-1.5 transition shadow-sm"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Analyze My Skin</span>
          </button>

          {/* User Sign In / Profile */}
          {currentUser ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onSelectScreen('settings')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#E8E8E1] text-xs text-[#252923] shadow-xs hover:border-[#527665]"
              >
                <div className="w-5 h-5 rounded-full bg-[#E8EFE9] text-[#304D40] text-[10px] font-mono flex items-center justify-center font-bold">
                  {currentUser.full_name?.charAt(0) || 'M'}
                </div>
                <span className="hidden md:inline font-mono text-xs">
                  {currentUser.full_name?.split(' ')[0]}
                </span>
              </button>

              <button
                onClick={onLogout}
                className="p-2 rounded-full border border-[#E8E8E1] text-[#777D76] hover:text-[#b85c3c] hover:bg-[#FAF9F6] transition"
                title="Log out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-2 rounded-2xl bg-white hover:bg-[#FAF9F6] border border-[#E8E8E1] text-[#252923] font-mono text-xs font-medium transition shadow-xs"
            >
              Sign In
            </button>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-[#777D76] hover:text-[#252923] hover:bg-[#FAF9F6] transition"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E8E8E1] bg-white p-4 space-y-3 animate-fade-in shadow-lg">
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            {screensMeta.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  onSelectScreen(s.id);
                  setMobileMenuOpen(false);
                }}
                className={`p-2.5 rounded-xl border text-left transition ${
                  currentScreen === s.id
                    ? 'border-[#527665] bg-[#E8EFE9] text-[#304D40] font-semibold'
                    : 'border-[#E8E8E1] text-[#777D76] hover:bg-[#FAF9F6]'
                }`}
              >
                <div className="text-[10px] text-[#527665] font-bold">Screen {s.number}</div>
                <div className="truncate">{s.title}</div>
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-[#E8E8E1] flex gap-2">
            <button
              onClick={() => {
                onSelectScreen('capture');
                setMobileMenuOpen(false);
              }}
              className="flex-1 py-2.5 rounded-xl bg-[#304D40] text-white text-xs font-mono font-medium text-center"
            >
              Start Skin Analysis
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
