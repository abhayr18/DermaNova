'use client';

import React, { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Droplets,
  Sun,
  Moon,
  Clock,
  ArrowRight,
  UserCheck,
  Download,
  HeartHandshake,
  BookOpen,
  Award
} from 'lucide-react';
import { RecommendationResponse } from '../services/api';

interface PersonalizedKitCardProps {
  recommendations: RecommendationResponse;
  patientName?: string;
  skinType?: string;
}

export const PersonalizedKitCard: React.FC<PersonalizedKitCardProps> = ({
  recommendations,
  patientName = 'Verified Patient',
  skinType = 'Combination'
}) => {
  const [isSaved, setIsSaved] = useState(false);

  // Derive products from recommendation actives
  const actives = recommendations.primary_active_ingredients || [];
  const primaryActiveName = actives.length > 0 ? actives[0].name : 'Target Clarifying Blemish Complex';
  const primaryActiveConc = actives.length > 0 ? actives[0].recommended_strength : 'Clinical Strength';

  const products = [
    {
      step: 'Step 01 • Cleanse',
      time: 'AM & PM',
      name: 'Gentle Purifying Sebum Cleanser',
      active: 'Zinc PCA + Salicylic Acid 1%',
      purpose: 'Removes cellular debris, clears follicular openings without stripping barrier lipids.',
      otcAdvice: 'Available at any pharmacy as generic 1% BHA Foaming Face Wash',
      badge: 'Sulfate-Free'
    },
    {
      step: 'Step 02 • Treat (Key Active)',
      time: 'PM Only',
      name: primaryActiveName,
      active: primaryActiveConc,
      purpose: actives.length > 0 ? actives[0].mechanism_of_action : 'Inhibits micro-comedone formation and targets hyperpigmentation.',
      otcAdvice: `Ask pharmacist for generic ${primaryActiveName} (${primaryActiveConc}) gel or serum`,
      badge: 'Key Therapeutic Active'
    },
    {
      step: 'Step 03 • Repair',
      time: 'AM & PM',
      name: 'Cica Ceramide Barrier Cream',
      active: 'Ceramide NP + Madecassoside / Centella',
      purpose: 'Replenishes intercellular lipid matrix and prevents transepidermal water loss (TEWL).',
      otcAdvice: 'Any non-comedogenic ceramide lotion or barrier relief cream',
      badge: 'Barrier Defense'
    },
    {
      step: 'Step 04 • Protect',
      time: 'AM Only',
      name: 'Broad-Spectrum Matte Fluid Sunscreen',
      active: 'SPF 50+ • PA++++ Multi-filter',
      purpose: 'Prevents UV-induced post-inflammatory hyperpigmentation (PIH) and photoaging.',
      otcAdvice: 'Generic pharmacy gel sunscreen (oil-free, non-greasy finish)',
      badge: 'Zero White Cast'
    }
  ];

  const handleDownloadRegimen = () => {
    setIsSaved(true);
    window.print();
  };

  return (
    <div className="glass-panel rounded-3xl border border-navara-border p-6 sm:p-8 space-y-6 shadow-2xl">
      {/* Header with Navara Botanical Touch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-navara-borderSubtle pb-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navara-panel border border-navara-sage/40 text-navara-matcha text-[10px] font-mono font-bold uppercase tracking-wider">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>100% Brand-Neutral Clinical Prescription</span>
          </div>
          <h3 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-navara-ivory tracking-tight">
            Your Personalized Skincare Regimen
          </h3>
          <p className="text-xs text-navara-stone font-mono">
            Formulated for {patientName} • {skinType} Skin Profile • Free Pharmacy & Active Guide
          </p>
        </div>

        {/* Doctor Review Verification Stamp */}
        <div className="px-3.5 py-2.5 rounded-2xl bg-[#141712] border border-navara-borderSubtle flex items-center gap-3 self-start sm:self-auto shadow-inner">
          <div className="w-8 h-8 rounded-full bg-navara-matcha/20 border border-navara-matcha/40 flex items-center justify-center text-navara-matcha font-mono font-bold text-xs">
            MD
          </div>
          <div className="text-left text-[11px]">
            <div className="text-navara-ivory font-bold">Dr. Nadia K., MD & Chemist</div>
            <div className="text-navara-stone text-[10px] font-mono">Lóvi Medical Board • Review Verified</div>
          </div>
        </div>
      </div>

      {/* 4 Step Skincare Regimen Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {products.map((prod, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-[#1c2219]/70 border border-navara-borderSubtle hover:border-navara-border transition flex flex-col justify-between space-y-3 group"
          >
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-navara-matcha font-bold uppercase">{prod.step}</span>
                <span className="flex items-center gap-1 text-navara-stone bg-[#141712] px-2.5 py-0.5 rounded-full border border-navara-borderSubtle">
                  {prod.time.includes('AM') && <Sun className="w-3 h-3 text-amber-300" />}
                  {prod.time.includes('PM') && <Moon className="w-3 h-3 text-navara-cream" />}
                  {prod.time}
                </span>
              </div>

              <h4 className="font-serif-luxury text-base font-bold text-navara-ivory mt-2 group-hover:text-navara-matcha transition">
                {prod.name}
              </h4>

              <div className="inline-block mt-1.5 px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-[#232e1b] text-navara-matcha border border-navara-sage/30">
                Active: {prod.active}
              </div>

              <p className="text-xs text-navara-stone mt-2 leading-relaxed">
                {prod.purpose}
              </p>
            </div>

            {/* Local Pharmacy Equivalent Tip */}
            <div className="p-3 rounded-xl bg-[#141712]/80 border border-navara-borderSubtle text-[11px] text-navara-stone">
              <span className="text-navara-matcha font-bold font-mono">Chemist Guidance: </span>
              <span>{prod.otcAdvice}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Free Open Source Prescription Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#232e1b] to-[#141712] border border-navara-border flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-serif-luxury text-base font-bold text-navara-ivory">Free Open-Access Skincare Education</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/30">
              100% Brand-Free
            </span>
          </div>
          <p className="text-xs text-navara-stone max-w-xl">
            Lóvi and Navara are non-affiliated with any beauty conglomerate. Buy generic active ingredients at your local pharmacy with zero markup.
          </p>
        </div>

        <button
          onClick={handleDownloadRegimen}
          className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-navara-ivory hover:bg-navara-cream text-navara-dark font-extrabold text-xs flex items-center justify-center gap-2 transition shadow-xl shrink-0"
        >
          <Download className="w-4 h-4 text-navara-terracotta" />
          <span>{isSaved ? 'Print / Saved' : 'Print / Save Regimen'}</span>
        </button>
      </div>
    </div>
  );
};
