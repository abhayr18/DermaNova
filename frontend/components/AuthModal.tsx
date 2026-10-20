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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-[#e6e2d8] p-6 sm:p-8 space-y-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8b9784] hover:text-[#1a2217] p-1.5 rounded-full hover:bg-[#faf9f5] transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#1c2417] text-white flex items-center justify-center mx-auto shadow-sm font-serif-luxury text-lg">
            D
          </div>
          <h2 className="text-xl font-normal text-[#1a2217] font-serif-luxury tracking-tight">
            {isLoginMode ? 'Welcome Back to DermaNova' : 'Create Your Clinical Skin Profile'}
          </h2>
          <p className="text-xs text-[#6b7764]">
            {isLoginMode
              ? 'Access your longitudinal skin scans, personalized routines, and healing timeline.'
              : 'Join DermaNova for cloud-synchronized AI skin tracking and dermatologist guidance.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-full bg-[#f4f3ed] p-1 border border-[#e2ded4] text-xs font-mono-clinical">
          <button
            type="button"
            onClick={() => { setIsLoginMode(true); setErrorMsg(null); }}
            className={`flex-1 py-1.5 font-semibold rounded-full transition ${
              isLoginMode ? 'bg-[#1c2417] text-white shadow-sm' : 'text-[#6b7764] hover:text-[#1a2217]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsLoginMode(false); setErrorMsg(null); }}
            className={`flex-1 py-1.5 font-semibold rounded-full transition ${
              !isLoginMode ? 'bg-[#1c2417] text-white shadow-sm' : 'text-[#6b7764] hover:text-[#1a2217]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-2xl bg-[#fff5f5] border border-[#fed7d7] text-[#9b2c2c] text-xs font-mono-clinical">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLoginMode && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#1a2217] flex items-center gap-1.5 font-mono-clinical">
                <User className="w-3.5 h-3.5 text-[#637852]" />
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Dr. / Patient Full Name"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#faf9f5] border border-[#ded9cd] text-[#1a2217] text-xs placeholder:text-[#8b9784] focus:outline-none focus:ring-2 focus:ring-[#637852]/20 focus:border-[#637852] transition font-sans"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#1a2217] flex items-center gap-1.5 font-mono-clinical">
              <Mail className="w-3.5 h-3.5 text-[#637852]" />
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="patient@example.com"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#faf9f5] border border-[#ded9cd] text-[#1a2217] text-xs placeholder:text-[#8b9784] focus:outline-none focus:ring-2 focus:ring-[#637852]/20 focus:border-[#637852] transition font-sans"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#1a2217] flex items-center gap-1.5 font-mono-clinical">
              <Lock className="w-3.5 h-3.5 text-[#637852]" />
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#faf9f5] border border-[#ded9cd] text-[#1a2217] text-xs placeholder:text-[#8b9784] focus:outline-none focus:ring-2 focus:ring-[#637852]/20 focus:border-[#637852] transition font-sans"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-full bg-[#1c2417] hover:bg-[#2d3b25] text-white font-mono-clinical font-semibold text-xs shadow-md transition disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : isLoginMode ? 'Sign In' : 'Create Free Account'}
          </button>
        </form>

        {/* Security Note */}
        <p className="text-[10px] text-center text-[#8b9784] font-mono-clinical">
          🔒 Encrypted on Supabase Cloud Infrastructure • HIPAA & DPDP Compliant
        </p>
      </div>
    </div>
  );
};
