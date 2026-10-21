'use client';

import React, { useState } from 'react';
import { apiService, UserAccount } from '../services/api';
import { X, Lock, Mail, User, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: (user: UserAccount) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthenticated }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (isLoginMode) {
        const res = await apiService.login({ email, password });
        onAuthenticated(res.user);
      } else {
        const res = await apiService.signup({ email, password, full_name: fullName });
        onAuthenticated(res.user);
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.response?.data?.detail || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await apiService.login({ email: 'demo.patient@dermanova.app', password: 'password123' });
      onAuthenticated(res.user);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.response?.data?.detail || 'Could not connect to local demo account. Ensure local backend is active.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 p-1.5 rounded-xl hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto shadow-sm text-base font-bold">
            D
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {isLoginMode ? 'Welcome Back to DermaNova' : 'Create Clinical Profile'}
          </h2>
          <p className="text-xs text-slate-500">
            {isLoginMode
              ? 'Access your longitudinal skin scans, personalized routines, and telemetry timeline.'
              : 'Join DermaNova for on-device AI skin analysis and barrier tracking.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200/80 text-xs">
          <button
            type="button"
            onClick={() => { setIsLoginMode(true); setErrorMsg(null); }}
            className={`flex-1 py-1.5 font-semibold rounded-lg transition ${
              isLoginMode ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsLoginMode(false); setErrorMsg(null); }}
            className={`flex-1 py-1.5 font-semibold rounded-lg transition ${
              !isLoginMode ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {!isLoginMode && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-teal-600" />
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Dr. / Patient Full Name"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-teal-600" />
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="patient@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-teal-600" />
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : isLoginMode ? 'Sign In' : 'Create Free Account'}
          </button>
        </form>

        {/* 1-Click Presentation Demo Login */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 hover:from-teal-100 hover:to-emerald-100 border border-teal-200 text-teal-900 font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>1-Click Presentation Demo Login</span>
          </button>
        </div>

        {/* Security Note */}
        <p className="text-[10px] text-center text-slate-400 font-mono">
          🔒 Encrypted on Local & Cloud SQLite • HIPAA & DPDP Compliant
        </p>
      </div>
    </div>
  );
};
