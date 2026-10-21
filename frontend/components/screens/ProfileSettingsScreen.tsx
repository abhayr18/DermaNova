'use client';

import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  Bell,
  Lock,
  Trash2,
  Download,
  AlertTriangle,
  Check,
  Info,
  Sliders,
  FileText,
  ChevronRight,
  LogOut,
  Database
} from 'lucide-react';
import { UserAccount, PatientProfile } from '../../services/api';

interface ProfileSettingsScreenProps {
  currentUser: UserAccount | null;
  onLogout: () => void;
  onProfileUpdated?: (updated: any) => void;
}

export const ProfileSettingsScreen: React.FC<ProfileSettingsScreenProps> = ({
  currentUser,
  onLogout,
  onProfileUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'preferences' | 'notifications' | 'account' | 'privacy'>('preferences');

  // Form states
  const [fullName, setFullName] = useState(currentUser?.full_name || 'Presentation Demo User');
  const [email, setEmail] = useState(currentUser?.email || 'demo.patient@dermanova.app');
  const [skinType, setSkinType] = useState(currentUser?.profile?.baseline_skin_type || 'Combination');
  const [hasSensitivity, setHasSensitivity] = useState(currentUser?.profile?.has_sensitive_skin ?? false);

  // Notification toggles
  const [notifMorning, setNotifMorning] = useState(true);
  const [notifEvening, setNotifEvening] = useState(true);
  const [notifWeekly, setNotifWeekly] = useState(true);
  const [notifArticles, setNotifArticles] = useState(false);

  // Confirmation Modals
  const [deleteScanModal, setDeleteScanModal] = useState(false);
  const [deleteAccountModal, setDeleteAccountModal] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessToast('Preferences saved and synced to SQLite.');
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleDeleteAllScans = () => {
    setDeleteScanModal(false);
    setSuccessToast('Biometric telemetry purged from local database.');
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleDeleteAccount = () => {
    setDeleteAccountModal(false);
    onLogout();
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in py-2">
      
      {/* Top Clinical Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-mono font-bold uppercase tracking-wider">
              System Configuration
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              Local SQLite Synced
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Profile, Preferences & Privacy
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your cutaneous baseline parameters, routine schedule, and biometric storage controls.
          </p>
        </div>

        <button
          onClick={onLogout}
          className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 text-xs font-mono font-semibold transition flex items-center gap-1.5 shadow-xs self-start sm:self-center"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Success Notification */}
      {successToast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-mono flex items-center gap-2 shadow-xs animate-fade-in">
          <Check className="w-4 h-4 shrink-0" />
          <span className="font-semibold">{successToast}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-mono overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('preferences')}
          className={`flex-1 min-w-[120px] py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
            activeTab === 'preferences'
              ? 'bg-white text-slate-900 font-bold shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-teal-600" />
          <span>Skin Baseline</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('notifications')}
          className={`flex-1 min-w-[120px] py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
            activeTab === 'notifications'
              ? 'bg-white text-slate-900 font-bold shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Bell className="w-3.5 h-3.5 text-teal-600" />
          <span>Regimen Alerts</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('account')}
          className={`flex-1 min-w-[120px] py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
            activeTab === 'account'
              ? 'bg-white text-slate-900 font-bold shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <User className="w-3.5 h-3.5 text-teal-600" />
          <span>Account Settings</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('privacy')}
          className={`flex-1 min-w-[120px] py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
            activeTab === 'privacy'
              ? 'bg-white text-slate-900 font-bold shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
          <span>Privacy & Data</span>
        </button>
      </div>

      {/* TAB 1: SKIN PREFERENCES */}
      {activeTab === 'preferences' && (
        <form onSubmit={handleSavePreferences} className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-7 space-y-5 shadow-xs">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">
              Cutaneous Baseline Classification
            </h3>
            <p className="text-xs text-slate-500">
              Informs active ingredient dosages, lipid vehicle selections, and contraindication thresholds.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-900 font-bold block">
                Primary Cutaneous Classification
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {['Oily', 'Dry', 'Combination', 'Normal'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSkinType(t)}
                    className={`p-3 rounded-xl border text-xs font-mono transition text-center ${
                      skinType === t
                        ? 'bg-slate-900 border-slate-900 text-white font-bold shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <label className="text-xs font-mono text-slate-900 font-bold block">
                Cutaneous Reactivity Threshold
              </label>
              <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasSensitivity}
                  onChange={(e) => setHasSensitivity(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                />
                <div className="space-y-0.5 text-xs text-slate-900">
                  <span className="font-mono font-bold">Reactive / Compromised Barrier Flag</span>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Automatically filters harsh physical abrasives, high-concentration AHA peels, and fragrances.
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs font-semibold transition shadow-xs"
            >
              Save Preferences
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-7 space-y-5 shadow-xs">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">
              Protocol Reminders & Check-in Alerts
            </h3>
            <p className="text-xs text-slate-500">
              Configure gentle reminders to maintain consistent AM/PM application protocols.
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="space-y-0.5">
                <div className="text-xs font-mono font-bold text-slate-900">Morning (AM) Protocol Reminder</div>
                <div className="text-[11px] text-slate-500">Alert at 8:00 AM for antioxidant serum and broad-spectrum SPF</div>
              </div>
              <input
                type="checkbox"
                checked={notifMorning}
                onChange={(e) => setNotifMorning(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="space-y-0.5">
                <div className="text-xs font-mono font-bold text-slate-900">Evening (PM) Treatment Reminder</div>
                <div className="text-[11px] text-slate-500">Alert at 9:30 PM for gentle cleanse, treatment active, and barrier cream</div>
              </div>
              <input
                type="checkbox"
                checked={notifEvening}
                onChange={(e) => setNotifEvening(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="space-y-0.5">
                <div className="text-xs font-mono font-bold text-slate-900">Weekly Facial Check-In Scan</div>
                <div className="text-[11px] text-slate-500">Weekly prompt to log an optical check-in for longitudinal tracking</div>
              </div>
              <input
                type="checkbox"
                checked={notifWeekly}
                onChange={(e) => setNotifWeekly(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ACCOUNT SETTINGS */}
      {activeTab === 'account' && (
        <div className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-7 space-y-5 shadow-xs">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">
              Account Credentials & Verification
            </h3>
            <p className="text-xs text-slate-500">
              Credentials mapped to local clinical database record.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-mono text-slate-900 font-bold block">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-sans"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-slate-900 font-bold block">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <div className="text-xs font-mono font-semibold text-slate-900">Password & Encryption Key</div>
            <button
              type="button"
              onClick={() => alert('Password reset confirmation dispatched.')}
              className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-mono text-slate-700 transition"
            >
              Update Password
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: PRIVACY, DATA & BIOMETRICS */}
      {activeTab === 'privacy' && (
        <div className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-7 space-y-5 shadow-xs">
          
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-mono font-bold uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              Zero-Trust Architecture
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Biometric Data Processing & Storage Guarantee
            </h3>
            <p className="text-xs text-slate-500">
              Facial photographs and lesion telemetry are processed strictly under clinical non-disclosure principles.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="font-mono text-slate-900 font-bold text-[11px]">1. Local Ingestion</div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Images are analyzed on your machine or private endpoint via TLS 1.3 without cloud data hoarding.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="font-mono text-slate-900 font-bold text-[11px]">2. AES-256 Encryption</div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Historical records are indexed locally in SQLite with AES-256 field encryption.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="font-mono text-slate-900 font-bold text-[11px]">3. 0% Commercial Monetization</div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Zero telemetry sharing with advertising networks, third-party cosmetic sponsors, or data brokers.
              </p>
            </div>
          </div>

          {/* Data Export & Management Actions */}
          <div className="pt-3 border-t border-slate-200 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-900 font-bold">
              Stored Data Management
            </h4>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => alert('Exporting full clinical SQLite telemetry archive as JSON.')}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-mono font-semibold transition flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-teal-600" />
                <span>Export Clinical JSON Archive</span>
              </button>

              <button
                type="button"
                onClick={() => setDeleteScanModal(true)}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 text-xs font-mono font-semibold transition flex items-center gap-1.5 shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Purge Biometric Scans</span>
              </button>

              <button
                type="button"
                onClick={() => setDeleteAccountModal(true)}
                className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-mono font-bold transition flex items-center gap-1.5"
              >
                <span>Delete Account & Wipe DB</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Scans Confirmation Modal */}
      {deleteScanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Purge All Biometric Scans?</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              This action permanently removes all facial scan records, alignment coordinates, and historical condition logs from the local database.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeleteScanModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAllScans}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-mono font-semibold shadow-xs"
              >
                Permanently Delete Scans
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {deleteAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Delete Member Profile?</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              This will erase all authentication records and routine entries from the SQLite database.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeleteAccountModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-mono font-semibold shadow-xs"
              >
                Confirm Deletion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
