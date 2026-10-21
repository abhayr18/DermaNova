'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  ShieldCheck,
  Video,
  FileText,
  Download,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Star,
  MapPin,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { AnalysisResponse, UserAccount } from '../../services/api';

interface TelehealthBookingScreenProps {
  onBackToDashboard?: () => void;
  analysis?: AnalysisResponse | null;
  currentUser?: UserAccount | null;
}

export const TelehealthBookingScreen: React.FC<TelehealthBookingScreenProps> = ({
  onBackToDashboard,
  analysis,
  currentUser,
}) => {
  const [selectedSpecialist, setSelectedSpecialist] = useState<string>('doc-1');
  
  const dateOptions = [
    { label: 'Tomorrow', date: new Date(Date.now() + 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' }) },
    { label: 'In 2 Days', date: new Date(Date.now() + 2 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' }) },
    { label: 'In 3 Days', date: new Date(Date.now() + 3 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' }) },
    { label: 'Next Week', date: new Date(Date.now() + 5 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' }) },
  ];

  const [selectedDate, setSelectedDate] = useState<string>(dateOptions[0].date);
  const [selectedSlot, setSelectedSlot] = useState<string>('10:30 AM');
  const [isBooked, setIsBooked] = useState<boolean>(false);

  const specialists = [
    {
      id: 'doc-1',
      name: 'Dr. Marcus Thorne, MD, FAAD',
      role: 'Board-Certified Medical Dermatologist',
      focus: 'Vascular Flushing, Erythema & Barrier Remodeling',
      rating: '4.98',
      reviews: '312 consults',
      fee: '$85 / 20-min consult',
      availability: 'Available ' + dateOptions[0].label,
      bio: 'Former clinical faculty at Northwestern Dermatology. Translates computerized facial telemetry into targeted barrier recovery protocols.',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=260&q=80',
    },
    {
      id: 'doc-2',
      name: 'Dr. Siobhan Wu, MD, FAAD',
      role: 'Consultant Dermatologist & Cosmetic Chemist',
      focus: 'Comedonal Acne, Melasma & Formulation Safety',
      rating: '4.95',
      reviews: '240 consults',
      fee: '$90 / 20-min consult',
      availability: 'Available ' + dateOptions[1].label,
      bio: 'Expert in cutaneous barrier pharmacology and minimizing hyperpigmentation flares with buffered actives.',
      avatar: 'https://images.unsplash.com/photo-1594824813579-a764d27dc68f?auto=format&fit=crop&w=260&q=80',
    },
  ];

  const activeDoc = specialists.find((d) => d.id === selectedSpecialist) || specialists[0];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in py-2">
      
      {/* Top Clinical Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-mono font-bold uppercase tracking-wider">
              Clinical Triage Network
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              Board-Certified FAAD Dermatologists
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Telehealth Dermatologist Consultation
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Forward your quantitative scan telemetry and INCI formulations directly for board-certified clinical review.
          </p>
        </div>

        <button
          onClick={() => alert('Exporting clinical summary dossier (PDF) with optical findings.')}
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-mono font-semibold transition flex items-center gap-1.5 shadow-xs self-start sm:self-center"
        >
          <Download className="w-3.5 h-3.5 text-teal-600" />
          <span>Export Clinical Dossier</span>
        </button>
      </div>

      {/* Biometric Telemetry Dossier Status Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 text-white space-y-2 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-mono text-xs font-bold text-teal-300 uppercase tracking-wider">
              {analysis ? 'Biometric Telemetry Dossier Compiled' : 'Consultation Telemetry Ready'}
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
            Encrypted TLS 1.3
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {analysis ? (
            <>
              Consolidating optical evaluation (Health Score: <strong className="text-white">{analysis.overall_health_score}/100</strong>, Skin Type: <strong className="text-white">{analysis.detected_skin_type}</strong>
              {analysis.top_concerns && analysis.top_concerns.length > 0 && (
                <>, Prominent Biomarkers: <strong className="text-white">{analysis.top_concerns.join(', ')}</strong></>
              )}
              ), AM/PM protocol logs, and contraindication filters for physician review.
            </>
          ) : (
            <>
              Connect directly with dermatologists to review your skincare concerns and formulation plan.
            </>
          )}
        </p>
      </div>

      {/* Main 2-Column Booking Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Specialist Directory */}
        <div className="lg:col-span-7 space-y-3">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-900 font-bold">
            Matched FAAD Specialists
          </div>

          <div className="space-y-3">
            {specialists.map((doc) => {
              const isSelected = selectedSpecialist === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedSpecialist(doc.id)}
                  className={`p-4 rounded-xl border transition cursor-pointer space-y-2.5 ${
                    isSelected
                      ? 'bg-white border-slate-900 ring-2 ring-slate-900/10 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <img
                      src={doc.avatar}
                      alt={doc.name}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-bold text-sm text-slate-900 leading-snug">
                          {doc.name}
                        </h3>
                        <span className="font-mono text-xs font-bold text-teal-800 shrink-0">
                          {doc.fee}
                        </span>
                      </div>
                      <div className="text-xs text-teal-700 font-mono font-medium">
                        {doc.role}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        {doc.focus}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <strong className="text-slate-900 font-semibold">{doc.rating}</strong> ({doc.reviews})
                    </span>
                    <span className="text-teal-700 font-semibold">
                      {doc.availability}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Time Slot & Booking Confirmation */}
        <div className="lg:col-span-5 rounded-2xl bg-white border border-slate-200 p-5 space-y-4 shadow-xs">
          
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-teal-700 font-bold">
              Video Consultation Slot
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Schedule Appointment
            </h3>
            <p className="text-xs text-slate-500">
              With {activeDoc.name}
            </p>
          </div>

          {/* Date Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-900 font-bold block">Select Date</label>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              {dateOptions.map((opt) => (
                <button
                  key={opt.date}
                  type="button"
                  onClick={() => setSelectedDate(opt.date)}
                  className={`p-2.5 rounded-xl border text-center transition ${
                    selectedDate === opt.date
                      ? 'bg-slate-900 border-slate-900 text-white font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-bold">{opt.label}</div>
                  <div className="text-[10px] opacity-80">{opt.date}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Time Slot Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-900 font-bold block">Available Times (EST)</label>
            <div className="grid grid-cols-3 gap-1.5 text-xs font-mono">
              {['09:00 AM', '10:30 AM', '02:00 PM', '03:30 PM', '05:00 PM'].map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={`p-2 rounded-lg border text-center transition ${
                    selectedSlot === slot
                      ? 'bg-teal-600 border-teal-600 text-white font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Booking Summary Box */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
            <div className="flex items-center justify-between font-mono">
              <span className="text-slate-500">Format:</span>
              <span className="font-bold text-slate-900">20-Min Telehealth HD</span>
            </div>
            <div className="flex items-center justify-between font-mono">
              <span className="text-slate-500">Scheduled:</span>
              <span className="font-bold text-slate-900">{selectedDate} @ {selectedSlot}</span>
            </div>
            <div className="flex items-center justify-between font-mono pt-1 border-t border-slate-200">
              <span className="text-slate-500">Patient:</span>
              <span className="font-bold text-slate-900">{currentUser?.full_name || 'Presentation Demo User'}</span>
            </div>
          </div>

          {/* Book Action */}
          {isBooked ? (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-mono space-y-1 text-center">
              <div className="font-bold flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Appointment Confirmed</span>
              </div>
              <p className="text-[11px] text-emerald-700">
                Encrypted appointment link dispatched to {currentUser?.email || 'demo.patient@dermanova.app'}.
              </p>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsBooked(true)}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs font-semibold flex items-center justify-center gap-2 transition shadow-xs"
            >
              <Video className="w-4 h-4 text-teal-400" />
              <span>Confirm Telehealth Booking</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
