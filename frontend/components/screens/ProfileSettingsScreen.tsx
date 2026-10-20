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
  LogOut
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
  const [fullName, setFullName] = useState(currentUser?.full_name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
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
    setSuccessToast('Preferences successfully updated.');
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleDeleteAllScans = () => {
    setDeleteScanModal(false);
    setSuccessToast('All previous scans and biometric images permanently deleted.');
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleDeleteAccount = () => {
    setDeleteAccountModal(false);
    onLogout();
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in py-2">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#E8E8E1]">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#527665] font-semibold">
            Member Control Center
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#252923] font-normal tracking-tight">
            Profile, Preferences & Privacy
          </h1>
          <p className="text-xs text-[#777D76] mt-0.5">
            Manage your personal skin profile, notifications, and biometric privacy controls.
          </p>
        </div>

        <button
          onClick={onLogout}
          className="px-4 py-2 rounded-xl border border-[#E8E8E1] text-[#777D76] hover:text-[#b85c3c] hover:border-[#f3d3c7] text-xs font-mono transition flex items-center gap-1.5 shadow-sm self-start sm:self-center"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Success Notification */}
      {successToast && (
        <div className="p-3.5 rounded-2xl bg-[#E8EFE9] border border-[#d6e0ce] text-[#304D40] text-xs font-mono flex items-center gap-2 shadow-sm animate-fade-in">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex rounded-2xl bg-[#FAF9F6] p-1.5 border border-[#E8E8E1] text-xs font-mono overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('preferences')}
          className={`flex-1 min-w-[120px] py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeTab === 'preferences'
              ? 'bg-white text-[#252923] font-semibold shadow-xs border border-[#E8E8E1]'
              : 'text-[#777D76] hover:text-[#252923]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-[#527665]" />
          <span>Skin Preferences</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('notifications')}
          className={`flex-1 min-w-[120px] py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeTab === 'notifications'
              ? 'bg-white text-[#252923] font-semibold shadow-xs border border-[#E8E8E1]'
              : 'text-[#777D76] hover:text-[#252923]'
          }`}
        >
          <Bell className="w-3.5 h-3.5 text-[#527665]" />
          <span>Notifications</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('account')}
          className={`flex-1 min-w-[120px] py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeTab === 'account'
              ? 'bg-white text-[#252923] font-semibold shadow-xs border border-[#E8E8E1]'
              : 'text-[#777D76] hover:text-[#252923]'
          }`}
        >
          <User className="w-3.5 h-3.5 text-[#527665]" />
          <span>Account Settings</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('privacy')}
          className={`flex-1 min-w-[120px] py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeTab === 'privacy'
              ? 'bg-white text-[#252923] font-semibold shadow-xs border border-[#E8E8E1]'
              : 'text-[#777D76] hover:text-[#252923]'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-[#527665]" />
          <span>Privacy & Data</span>
        </button>
      </div>

      {/* =======================================================================
          TAB 1: SKIN PREFERENCES
         ======================================================================= */}
      {activeTab === 'preferences' && (
        <form onSubmit={handleSavePreferences} className="rounded-3xl bg-white border border-[#E8E8E1] p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="space-y-1">
            <h3 className="font-serif text-2xl text-[#252923] font-normal">
              Baseline Skin Type & Preferences
            </h3>
            <p className="text-xs text-[#777D76]">
              Informs active ingredient dosages, lipid buffer selections, and routine advice.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-mono text-[#252923] font-semibold block">
                Primary Skin Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {['Oily', 'Dry', 'Combination', 'Normal'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSkinType(t)}
                    className={`p-3 rounded-xl border text-xs font-mono transition text-center ${
                      skinType === t
                        ? 'bg-[#E8EFE9] border-[#527665] text-[#304D40] font-semibold'
                        : 'bg-[#FAF9F6] border-[#E8E8E1] text-[#777D76] hover:bg-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-xs font-mono text-[#252923] font-semibold block">
                Cutaneous Barrier Sensitivity
              </label>
              <label className="flex items-center gap-3 p-3.5 rounded-xl border border-[#E8E8E1] bg-[#FAF9F6] cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasSensitivity}
                  onChange={(e) => setHasSensitivity(e.target.checked)}
                  className="w-4 h-4 rounded text-[#527665] focus:ring-[#527665]"
                />
                <div className="space-y-0.5 text-xs text-[#252923]">
                  <span className="font-mono font-medium">Reactive / Sensitive Skin Flag</span>
                  <p className="text-[11px] text-[#777D76]">
                    Prioritizes soothing ceramides, Madecassoside, and lower initial concentrations of chemical exfoliants.
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#304D40] hover:bg-[#253d33] text-white font-mono text-xs font-medium transition shadow-sm"
            >
              Save Preferences
            </button>
          </div>
        </form>
      )}

      {/* =======================================================================
          TAB 2: NOTIFICATIONS
         ======================================================================= */}
      {activeTab === 'notifications' && (
        <div className="rounded-3xl bg-white border border-[#E8E8E1] p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="space-y-1">
            <h3 className="font-serif text-2xl text-[#252923] font-normal">
              Notification & Habit Reminders
            </h3>
            <p className="text-xs text-[#777D76]">
              Choose gentle reminders for your daily skincare steps and periodic skin checks.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FAF9F6] border border-[#E8E8E1]">
              <div className="space-y-0.5">
                <div className="text-xs font-mono font-medium text-[#252923]">Morning (AM) Routine Reminder</div>
                <div className="text-[11px] text-[#777D76]">Gentle nudge at 8:00 AM for SPF and barrier hydration</div>
              </div>
              <input
                type="checkbox"
                checked={notifMorning}
                onChange={(e) => setNotifMorning(e.target.checked)}
                className="w-4 h-4 rounded text-[#527665] focus:ring-[#527665]"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FAF9F6] border border-[#E8E8E1]">
              <div className="space-y-0.5">
                <div className="text-xs font-mono font-medium text-[#252923]">Evening (PM) Routine Reminder</div>
                <div className="text-[11px] text-[#777D76]">Gentle nudge at 9:30 PM for gentle cleanse and overnight treatment</div>
              </div>
              <input
                type="checkbox"
                checked={notifEvening}
                onChange={(e) => setNotifEvening(e.target.checked)}
                className="w-4 h-4 rounded text-[#527665] focus:ring-[#527665]"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FAF9F6] border border-[#E8E8E1]">
              <div className="space-y-0.5">
                <div className="text-xs font-mono font-medium text-[#252923]">Weekly Facial Skin Check-In</div>
                <div className="text-[11px] text-[#777D76]">Prompt to capture a fresh photo under uniform lighting</div>
              </div>
              <input
                type="checkbox"
                checked={notifWeekly}
                onChange={(e) => setNotifWeekly(e.target.checked)}
                className="w-4 h-4 rounded text-[#527665] focus:ring-[#527665]"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FAF9F6] border border-[#E8E8E1]">
              <div className="space-y-0.5">
                <div className="text-xs font-mono font-medium text-[#252923]">Medical Advisory Articles Digest</div>
                <div className="text-[11px] text-[#777D76]">Curated clinical skincare insights once a month</div>
              </div>
              <input
                type="checkbox"
                checked={notifArticles}
                onChange={(e) => setNotifArticles(e.target.checked)}
                className="w-4 h-4 rounded text-[#527665] focus:ring-[#527665]"
              />
            </div>
          </div>
        </div>
      )}

      {/* =======================================================================
          TAB 3: ACCOUNT SETTINGS
         ======================================================================= */}
      {activeTab === 'account' && (
        <div className="rounded-3xl bg-white border border-[#E8E8E1] p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="space-y-1">
            <h3 className="font-serif text-2xl text-[#252923] font-normal">
              Account Credentials
            </h3>
            <p className="text-xs text-[#777D76]">
              Manage your profile name and login details.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#252923] font-semibold block">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#E8E8E1] text-xs text-[#252923]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#252923] font-semibold block">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#E8E8E1] text-xs text-[#252923]"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-[#E8E8E1] space-y-3">
            <div className="text-xs font-mono font-semibold text-[#252923]">Security & Password</div>
            <button
              type="button"
              onClick={() => alert('Password reset instructions sent to your email.')}
              className="px-4 py-2 rounded-xl bg-white hover:bg-[#FAF9F6] border border-[#E8E8E1] text-xs font-mono text-[#252923] transition shadow-sm"
            >
              Update Password
            </button>
          </div>
        </div>
      )}

      {/* =======================================================================
          TAB 4: PRIVACY, DATA & BIOMETRICS (Full Transparency)
         ======================================================================= */}
      {activeTab === 'privacy' && (
        <div className="rounded-3xl bg-white border border-[#E8E8E1] p-6 sm:p-8 space-y-6 shadow-sm">
          
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8EFE9] text-[#304D40] text-[10px] font-mono font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-[#527665]" />
              Biometric Data Architecture
            </div>
            <h3 className="font-serif text-2xl text-[#252923] font-normal">
              Data Stewardship & Image Processing Transparency
            </h3>
            <p className="text-xs text-[#777D76]">
              Facial images are sensitive personal information. Here is our exact processing and retention lifecycle:
            </p>
          </div>

          <div className="space-y-3 text-xs text-[#777D76]">
            <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E8E8E1] space-y-1.5">
              <div className="font-mono text-[#252923] font-semibold">1. Image Ingestion & Analysis</div>
              <p className="leading-relaxed">
                When you submit a facial photo, it is transmitted using TLS 1.3 encryption to our isolated inference engine. The multi-label model generates spatial bounding reticles and condition scores.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E8E8E1] space-y-1.5">
              <div className="font-mono text-[#252923] font-semibold">2. Storage & Encryption</div>
              <p className="leading-relaxed">
                If you are signed in, your baseline and follow-up images are encrypted at rest with AES-256 so you can view your before-and-after progress slider. If using guest mode, images are stored in memory only during your session.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E8E8E1] space-y-1.5">
              <div className="font-mono text-[#252923] font-semibold">3. Zero Third-Party Advertising</div>
              <p className="leading-relaxed">
                We strictly prohibit the commercial sale or licensing of facial images to third-party ad networks, cosmetic retailers, or insurance databases.
              </p>
            </div>
          </div>

          {/* Data Export & Management Actions */}
          <div className="pt-4 border-t border-[#E8E8E1] space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#252923] font-semibold">
              Manage Your Stored Biometric Data
            </h4>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => alert('Downloading complete JSON archive of all your clinical scan data and notes.')}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#FAF9F6] border border-[#E8E8E1] text-[#252923] text-xs font-mono transition flex items-center gap-2 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export All My Data (JSON)</span>
              </button>

              <button
                type="button"
                onClick={() => setDeleteScanModal(true)}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#fff5f5] border border-[#fed7d7] text-[#9b2c2c] text-xs font-mono transition flex items-center gap-2 shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete All Previous Scans</span>
              </button>

              <button
                type="button"
                onClick={() => setDeleteAccountModal(true)}
                className="px-4 py-2.5 rounded-xl bg-[#fff5f5] hover:bg-[#fed7d7] text-[#9b2c2c] text-xs font-mono transition flex items-center gap-2 font-semibold"
              >
                <span>Delete Account & Wipe Data</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Scans Confirmation Modal */}
      {deleteScanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-[#E8E8E1] p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h4 className="font-serif text-xl text-[#252923]">Delete All Stored Scans?</h4>
            <p className="text-xs text-[#777D76] leading-relaxed">
              This action permanently purges all stored facial photographs, before-and-after comparison alignments, and condition logs from our servers. This cannot be undone.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeleteScanModal(false)}
                className="px-4 py-2 rounded-xl border border-[#E8E8E1] text-xs font-mono text-[#777D76]"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAllScans}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-mono font-medium shadow-sm"
              >
                Permanently Delete Scans
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {deleteAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-[#E8E8E1] p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h4 className="font-serif text-xl text-[#252923]">Permanently Delete Account?</h4>
            <p className="text-xs text-[#777D76] leading-relaxed">
              This will immediately terminate your DermaNova account, invalidate authentication tokens, and erase all profile data and journal reflections.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeleteAccountModal(false)}
                className="px-4 py-2 rounded-xl border border-[#E8E8E1] text-xs font-mono text-[#777D76]"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-mono font-medium shadow-sm"
              >
                Confirm Account Deletion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
