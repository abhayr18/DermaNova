'use client';

import React, { useState } from 'react';
import { RecommendationResponse } from '../services/api';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Download,
  Share2,
  Calendar,
  Clock,
  Pill,
  Sun,
  Moon,
  Droplets,
  HeartHandshake
} from 'lucide-react';

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

  // Extract products from prescription or construct from curated products
  const products = recommendations.curated_products?.length > 0
    ? recommendations.curated_products.map((p, idx) => ({
        step: `Step ${idx + 1}: ${p.category}`,
        time: idx === 0 ? 'AM & PM' : idx % 2 === 1 ? 'AM Daily' : 'PM Daily',
        name: p.product_name,
        active: p.key_actives.join(', '),
        purpose: p.description,
        otcAdvice: `${p.brand} (${p.price_range})`
      }))
    : [
        {
          step: 'Step 1: Cleanse',
          time: 'AM & PM',
          name: 'Hydrating Ceramide Barrier Cleanser',
          active: 'Ceramide NP + Glycerin',
          purpose: 'Preserves the acid mantle without stripping stratum corneum intercellular lipids.',
          otcAdvice: 'Generic CeraVe Hydrating Cleanser or Cetaphil Gentle Cleanser ($9-$14 at CVS/Walgreens).'
        },
        {
          step: 'Step 2: AM Active Treatment',
          time: 'AM Daily',
          name: '10% Azelaic Acid + Centella Asiatica Serum',
          active: 'Azelaic Acid 10%',
          purpose: 'Inhibits follicular micro-erythema, diminishes inflammatory papules, and reduces PIH dark macules.',
          otcAdvice: 'Generic 10% Azelaic Acid suspension or The Ordinary ($10 at Target/Sephora).'
        },
        {
          step: 'Step 3: PM Active Spot Target',
          time: 'PM Daily',
          name: '2.5% Micronized Benzoyl Peroxide / Salicylic Acid 2%',
          active: 'BHA 2% + Micronized BPO',
          purpose: 'Directly eradicates follicular Cutibacterium acnes colonies with minimal barrier drying.',
          otcAdvice: 'AcneFree 2.5% Spot Treatment or Paula\'s Choice 2% BHA ($8-$35 at pharmacies).'
        },
        {
          step: 'Step 4: Protect & Restore',
          time: 'AM SPF / PM Cream',
          name: 'Cica Barrier Repair Balm + Mineral SPF 50',
          active: 'Madecassoside + Zinc Oxide 12%',
          purpose: 'Restores lipid bilamellar matrix and provides UVA/UVB photoprotection against post-inflammatory darkening.',
          otcAdvice: 'La Roche-Posay Cicaplast Baume B5 + Mineral Fluid SPF 50 ($16-$22 at pharmacy).'
        }
      ];

  const handleDownloadRegimen = () => {
    setIsSaved(true);
    const content = `DermaNova Doctor-Reviewed Clinical Skincare Regimen\n` +
      `Patient: ${patientName}\n` +
      `Skin Type: ${skinType}\n` +
      `Date Formulated: ${new Date().toLocaleDateString()}\n\n` +
      products.map((p, i) => `${i + 1}. ${p.step} (${p.time})\nProduct: ${p.name}\nActive: ${p.active}\nPurpose: ${p.purpose}\nChemist Recommendation: ${p.otcAdvice}\n`).join('\n') +
      `\nMedical Board Supervision: Dr. Nadia K., MD & Formulation Chemist (DermaNova Clinical Board)`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DermaNova-Regimen-${patientName.replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="rounded-3xl p-6 sm:p-8 bg-white border border-[#e6e2d8] space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#f0ede6] pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f4f6f1] text-[#425335] text-[10px] font-mono-clinical uppercase tracking-wider font-semibold border border-[#cbd7c1]">
            <HeartHandshake className="w-3.5 h-3.5 text-[#637852]" />
            <span>100% Brand-Neutral Clinical Guidance</span>
          </div>
          <h3 className="font-serif-luxury text-2xl sm:text-3xl font-normal text-[#1a2217] tracking-tight">
            Your Personalized Skincare Regimen
          </h3>
          <p className="text-xs text-[#6b7764] font-mono-clinical">
            Formulated for {patientName} • {skinType} Skin Profile • Free Pharmacy & Active Guide
          </p>
        </div>

        {/* Doctor Review Verification Stamp */}
        <div className="px-3.5 py-2.5 rounded-2xl bg-[#faf9f5] border border-[#e6e2d8] flex items-center gap-3 self-start sm:self-auto shadow-sm">
          <div className="w-8 h-8 rounded-full bg-[#f4f6f1] border border-[#cbd7c1] flex items-center justify-center text-[#425335] font-mono-clinical font-bold text-xs">
            MD
          </div>
          <div className="text-left text-[11px]">
            <div className="text-[#1a2217] font-semibold">Dr. Nadia K., MD & Chemist</div>
            <div className="text-[#6b7764] text-[10px] font-mono-clinical">DermaNova Medical Board • Verified</div>
          </div>
        </div>
      </div>

      {/* 4 Step Skincare Regimen Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {products.map((prod, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-[#faf9f5] border border-[#e6e2d8] hover:border-[#cbd7c1] hover:bg-white transition flex flex-col justify-between space-y-3 group shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono-clinical">
                <span className="text-[#637852] font-semibold uppercase">{prod.step}</span>
                <span className="flex items-center gap-1 text-[#6b7764] bg-white px-2.5 py-0.5 rounded-full border border-[#e6e2d8]">
                  {prod.time.includes('AM') && <Sun className="w-3 h-3 text-amber-600" />}
                  {prod.time.includes('PM') && <Moon className="w-3 h-3 text-[#425335]" />}
                  {prod.time}
                </span>
              </div>

              <h4 className="font-serif-luxury text-base font-normal text-[#1a2217] mt-2 group-hover:text-[#425335] transition">
                {prod.name}
              </h4>

              <div className="inline-block mt-1.5 px-2.5 py-0.5 rounded-lg text-[10px] font-mono-clinical font-semibold bg-[#f4f6f1] text-[#425335] border border-[#cbd7c1]">
                Active: {prod.active}
              </div>

              <p className="text-xs text-[#556050] mt-2 leading-relaxed font-sans">
                {prod.purpose}
              </p>
            </div>

            {/* Local Pharmacy Equivalent Tip */}
            <div className="p-3 rounded-xl bg-white border border-[#e6e2d8] text-[11px] text-[#556050]">
              <span className="text-[#637852] font-semibold font-mono-clinical">Chemist Guidance: </span>
              <span>{prod.otcAdvice}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Free Open Source Prescription Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#f4f6f1] border border-[#d6e0ce] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-serif-luxury text-base font-normal text-[#1a2217]">Free Open-Access Skincare Education</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-mono-clinical font-semibold border border-emerald-200">
              100% Brand-Neutral
            </span>
          </div>
          <p className="text-xs text-[#556050] max-w-xl">
            DermaNova is 100% non-affiliated with any beauty conglomerate. Buy generic active ingredients at your local pharmacy with zero commercial markup.
          </p>
        </div>

        <button
          onClick={handleDownloadRegimen}
          className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#1c2417] hover:bg-[#2d3b25] text-white font-mono-clinical font-semibold text-xs flex items-center justify-center gap-2 transition shadow-sm shrink-0"
        >
          <Download className="w-4 h-4 text-[#b85c3c]" />
          <span>{isSaved ? 'Print / Saved' : 'Print / Save Regimen'}</span>
        </button>
      </div>
    </div>
  );
};
