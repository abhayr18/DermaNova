'use client';

import React from 'react';
import { Sparkles, ShieldCheck, User, LogOut, HeartPulse } from 'lucide-react';
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
    <header className="sticky top-0 z-40 glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-400 to-cyan-300 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Sparkles className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white font-mono">
                Derma<span className="text-brand-400">Nova</span>
              </span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
                Cloud
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              AI Multi-Label Facial Skin Diagnosis & CureSkin Longitudinal Tracking
            </p>
          </div>
        </div>

        {/* User Profile / Auth Controls */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2.5">
              <button
                onClick={onOpenIntake}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold hover:bg-brand-500/20 transition"
              >
                <HeartPulse className="w-3.5 h-3.5 text-brand-400" />
                <span>Skin Profile Quiz</span>
              </button>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white">
                <div className="w-6 h-6 rounded-full bg-brand-500/20 border border-brand-400/40 flex items-center justify-center text-[10px] font-bold text-brand-300 uppercase">
                  {user.full_name?.charAt(0) || 'P'}
                </div>
                <span className="hidden md:inline font-medium">{user.full_name}</span>
              </div>

              <button
                onClick={onLogout}
                title="Log Out"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Supabase Protected</span>
              </div>

              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs transition shadow-sm"
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
