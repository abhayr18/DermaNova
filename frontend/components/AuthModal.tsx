'use client';

import React, { useState } from 'react';
import { apiService, UserAccount } from '../services/api';
import { X, Lock, Mail, User, Sparkles, CheckCircle2 } from 'lucide-react';

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md glass-panel rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-400 flex items-center justify-center mx-auto shadow-lg shadow-brand-500/20">
            <Sparkles className="w-6 h-6 text-slate-950" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {isLoginMode ? 'Welcome Back to DermaNova' : 'Create Your Clinical Skin Profile'}
          </h2>
          <p className="text-xs text-slate-400">
            {isLoginMode
              ? 'Access your longitudinal skin scans, personalized routines, and healing timeline.'
              : 'Join DermaNova for cloud-synchronized AI skin tracking and dermatologist guidance.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-slate-900/90 p-1 border border-slate-800">
          <button
            type="button"
            onClick={() => { setIsLoginMode(true); setErrorMsg(null); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              isLoginMode ? 'bg-brand-500 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsLoginMode(false); setErrorMsg(null); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              !isLoginMode ? 'bg-brand-500 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLoginMode && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-brand-400" />
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Dr. / Patient Full Name"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-brand-400 transition"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-brand-400" />
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="patient@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-brand-400 transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-brand-400" />
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-brand-400 transition"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-500 to-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-brand-500/20 hover:opacity-90 transition disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : isLoginMode ? 'Sign In' : 'Create Free Account'}
          </button>
        </form>

        {/* Security Note */}
        <p className="text-[10px] text-center text-slate-500">
          🔒 Encrypted on Supabase Cloud Infrastructure • HIPAA & DPDP Compliant
        </p>
      </div>
    </div>
  );
};
