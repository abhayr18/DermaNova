'use client';

import React from 'react';
import { Sparkles, ShieldCheck, User, LogOut, HeartPulse, Leaf } from 'lucide-react';
import { UserAccount } from '../services/api';

interface NavbarProps {
  user?: UserAccount | null;
  onOpenAuth: () => void;
  onOpenIntake: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenAuth,
  onOpenIntake,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e6e2d8] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#1c2417] text-white flex items-center justify-center font-serif-luxury text-base shadow-sm">
            D
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-normal tracking-tight text-[#1a2217] font-serif-luxury">
                DermaNova
              </span>
              <span className="text-[9px] uppercase font-mono-clinical font-semibold px-2 py-0.5 rounded-full bg-[#f4f6f1] text-[#425335] border border-[#cbd7c1]">
                Clinical AI
              </span>
            </div>
            <p className="text-[11px] text-[#6b7764] hidden sm:block font-mono-clinical">
              AI Multi-Label Facial Skin Diagnosis & Longitudinal Tracking
            </p>
          </div>
        </div>

        {/* User Profile / Auth Controls */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2.5">
              <button
                onClick={onOpenIntake}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#e2ded4] text-[#1a2217] text-xs font-mono-clinical hover:bg-[#f4f3ed] transition shadow-sm"
              >
                <HeartPulse className="w-3.5 h-3.5 text-[#637852]" />
                <span>Skin Profile Quiz</span>
              </button>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#e2ded4] text-xs text-[#1a2217] shadow-sm">
                <div className="w-6 h-6 rounded-full bg-[#eef2ea] border border-[#cbd7c1] flex items-center justify-center text-[10px] font-bold text-[#425335] uppercase font-mono-clinical">
                  {user.full_name?.charAt(0) || 'P'}
                </div>
                <span className="hidden md:inline font-medium">{user.full_name}</span>
              </div>

              <button
                onClick={onLogout}
                title="Log Out"
                className="p-2 rounded-full text-[#6b7764] hover:text-[#b85c3c] hover:bg-[#faf9f5] border border-transparent hover:border-[#e6e2d8] transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-mono-clinical font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Protected Consultation</span>
              </div>

              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1c2417] hover:bg-[#2d3b25] text-white font-mono-clinical font-medium text-xs transition shadow-sm"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In / Register</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
