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

interface TelehealthBookingScreenProps {
  onBackToDashboard?: () => void;
}

export const TelehealthBookingScreen: React.FC<TelehealthBookingScreenProps> = ({
  onBackToDashboard,
}) => {
  const [selectedSpecialist, setSelectedSpecialist] = useState<string>('doc-1');
  const [selectedDate, setSelectedDate] = useState<string>('Tomorrow, Oct 21');
  const [selectedSlot, setSelectedSlot] = useState<string>('10:30 AM');
  const [isBooked, setIsBooked] = useState<boolean>(false);

  const specialists = [
    {
      id: 'doc-1',
      name: 'Dr. Marcus Thorne, MD, FAAD',
      role: 'Board-Certified Medical Dermatologist',
      focus: 'Photobiology, Vascular Flushing & Barrier Regeneration',
      rating: '4.98',
      reviews: '312 consultations',
      fee: '$85 / 20-min consult',
      availability: 'Available Tomorrow',
      bio: 'Former clinical faculty at Northwestern Dermatology. Specializes in translating computerized facial telemetry into gentle, non-irritating barrier recovery plans.',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=260&q=80',
    },
    {
      id: 'doc-2',
      name: 'Dr. Siobhan Wu, MD, FAAD',
      role: 'Consultant Dermatologist & Cosmetic Chemist',
      focus: 'Persistent Erythema, Melasma & INCI Formulation Safety',
      rating: '4.95',
      reviews: '240 consultations',
      fee: '$90 / 20-min consult',
      availability: 'Available Thursday',
      bio: 'Expert in cutaneous barrier pharmacology and minimizing post-inflammatory hyperpigmentation through low-irritation actives.',
      avatar: 'https://images.unsplash.com/photo-1594824813579-a764d27dc68f?auto=format&fit=crop&w=260&q=80',
    },
  ];

  const activeDoc = specialists.find((d) => d.id === selectedSpecialist) || specialists[0];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in py-2">
      
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#E8E8E1]">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#527665] font-semibold">
            Clinical Triage & Telehealth Network
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#252923] font-normal tracking-tight">
            Telehealth Dermatologist Consultation
          </h1>
          <p className="text-xs text-[#777D76] mt-0.5">
            Connect your 56-day optical scan records directly with board-certified dermatologists.
          </p>
        </div>

        <button
          onClick={() => alert('Downloading your complete DermaNova Clinical Pre-Consult Packet (PDF) including facial telemetry and INCI logs.')}
          className="px-4 py-2 rounded-xl bg-white hover:bg-[#FAF9F6] border border-[#E8E8E1] text-[#252923] text-xs font-mono transition flex items-center gap-1.5 shadow-sm self-start sm:self-center"
        >
          <Download className="w-3.5 h-3.5 text-[#527665]" />
          <span>Download Pre-Consult PDF</span>
        </button>
      </div>

      {/* Biometric Diagnostic Dossier Banner (Stitch AI Feature) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#E8EFE9]/60 border border-[#d6e0ce] space-y-2 shadow-sm">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#527665]" />
          <span className="font-mono text-xs font-bold text-[#304D40] uppercase tracking-wider">
            Biometric Telemetry Dossier Ready
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white text-[#304D40] border border-[#cbd7c1]">
            Encrypted AES-256
          </span>
        </div>
        <p className="text-xs text-[#777D76] leading-relaxed">
          Consolidating your latest scan findings (Overall Barrier Health: <strong>84</strong>, Malar Erythema: <strong>82%</strong>, Pore Density: <strong>71%</strong>), daily routine compliance logs, and localized weather factors for clinical review.
        </p>
      </div>

      {/* Main 2-Column Booking Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Specialist Directory */}
        <div className="lg:col-span-7 space-y-4">
          <div className="text-xs font-mono uppercase tracking-wider text-[#777D76] font-semibold">
            Matched Board-Certified Specialists
          </div>

          <div className="space-y-4">
            {specialists.map((doc) => {
              const isSelected = selectedSpecialist === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedSpecialist(doc.id)}
                  className={`p-5 rounded-3xl border transition cursor-pointer space-y-3 ${
                    isSelected
                      ? 'bg-white border-[#527665] shadow-[0px_4px_16px_rgba(48,77,64,0.08)]'
                      : 'bg-white/70 border-[#E8E8E1] hover:border-[#527665]/40 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={doc.avatar}
                      alt={doc.name}
                      className="w-16 h-16 rounded-2xl object-cover border border-[#E8E8E1] shrink-0"
                    />
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-serif text-lg text-[#252923] font-normal leading-tight">
                          {doc.name}
                        </h3>
                        <span className="font-mono text-xs font-bold text-[#304D40] shrink-0">
                          {doc.fee}
                        </span>
                      </div>
                      <div className="text-xs text-[#527665] font-mono">
                        {doc.role}
                      </div>
                      <p className="text-[11px] text-[#777D76] leading-relaxed">
                        {doc.focus}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E8E8E1] flex items-center justify-between text-[11px] font-mono text-[#777D76]">
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <strong className="text-[#252923]">{doc.rating}</strong> ({doc.reviews})
                    </span>
                    <span className="text-[#527665] font-medium">
                      {doc.availability}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Time Slot & Booking Confirmation */}
        <div className="lg:col-span-5 rounded-3xl bg-white border border-[#E8E8E1] p-6 sm:p-7 space-y-5 shadow-sm">
          
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#527665] font-semibold">
              Video Consultation Slot
            </span>
            <h3 className="font-serif text-xl text-[#252923] font-normal">
              Schedule Appointment
            </h3>
            <p className="text-xs text-[#777D76]">
              With {activeDoc.name}
            </p>
          </div>

          {/* Date Selector */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-[#252923] font-medium block">Select Date</label>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              {['Tomorrow, Oct 21', 'Thursday, Oct 22', 'Friday, Oct 23', 'Monday, Oct 26'].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setSelectedDate(d)}
                  className={`p-2.5 rounded-xl border text-center transition ${
                    selectedDate === d
                      ? 'bg-[#E8EFE9] border-[#527665] text-[#304D40] font-semibold'
                      : 'border-[#E8E8E1] text-[#777D76] hover:bg-[#FAF9F6]'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Time Slot Selector */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-[#252923] font-medium block">Available Times (EST)</label>
            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              {['09:00 AM', '10:30 AM', '02:00 PM', '03:30 PM', '05:00 PM'].map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={`p-2 rounded-xl border text-center transition ${
                    selectedSlot === slot
                      ? 'bg-[#304D40] text-white font-semibold'
                      : 'border-[#E8E8E1] text-[#777D76] hover:bg-[#FAF9F6]'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Booking Summary Box */}
          <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E8E8E1] space-y-2 text-xs">
            <div className="flex items-center justify-between font-mono">
              <span className="text-[#777D76]">Consultation:</span>
              <span className="font-semibold text-[#252923]">20-Min Video Call</span>
            </div>
            <div className="flex items-center justify-between font-mono">
              <span className="text-[#777D76]">Selected Slot:</span>
              <span className="font-semibold text-[#252923]">{selectedDate} @ {selectedSlot}</span>
            </div>
            <div className="flex items-center justify-between font-mono pt-1 border-t border-[#E8E8E1]">
              <span className="text-[#777D76]">Telemetry Transfer:</span>
              <span className="text-[#527665] font-semibold">Included (Zero Extra Fee)</span>
            </div>
          </div>

          {/* Book Action */}
          {isBooked ? (
            <div className="p-4 rounded-2xl bg-[#E8EFE9] border border-[#d6e0ce] text-[#304D40] text-xs font-mono space-y-1 text-center">
              <div className="font-bold flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#527665]" />
                <span>Appointment Confirmed!</span>
              </div>
              <p className="text-[11px] text-[#777D76]">
                Calendar invitation and secure video link dispatched to your email.
              </p>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsBooked(true)}
              className="w-full py-3.5 rounded-2xl bg-[#304D40] hover:bg-[#253d33] text-white font-mono text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition shadow-[0px_4px_16px_rgba(48,77,64,0.18)]"
            >
              <Video className="w-4 h-4" />
              <span>Confirm Video Consultation</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
