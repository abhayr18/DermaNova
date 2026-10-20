'use client';

import React, { useState } from 'react';
import { RecommendationResponse } from '../services/api';
import { Sun, Moon, ShieldCheck, Sparkles, Check, AlertOctagon, Utensils, HeartHandshake } from 'lucide-react';

interface RoutineRecommendationsProps {
  recommendations: RecommendationResponse;
}

export const RoutineRecommendations: React.FC<RoutineRecommendationsProps> = ({
  recommendations,
}) => {
  const [activeTab, setActiveTab] = useState<'am' | 'pm' | 'products' | 'diet'>('am');

  const {
    primary_active_ingredients,
    contraindications_avoided,
    curated_products,
    daily_routine,
    dietary_guidance,
    barrier_health_tips,
  } = recommendations;

  return (
    <div className="w-full rounded-3xl p-6 sm:p-8 bg-white border border-[#e6e2d8] space-y-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#f0ede6] pb-5">
        <div>
          <h2 className="font-serif-luxury text-xl sm:text-2xl font-normal text-[#1a2217] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#637852]" />
            Botanical Ritual & Daily Skincare Guidance
          </h2>
          <p className="text-xs text-[#6b7764] mt-1 font-mono-clinical">
            Personalized active ingredients and regimens synthesized from your multi-label diagnostic profile.
          </p>
        </div>

        {/* Routine Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-full bg-[#f4f3ed] border border-[#e2ded4] text-xs font-mono-clinical">
          <button
            onClick={() => setActiveTab('am')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition ${
              activeTab === 'am'
                ? 'bg-white text-[#1a2217] font-semibold shadow-sm border border-[#ded9cd]'
                : 'text-[#6b7764] hover:text-[#1a2217]'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-600" />
            Morning (AM)
          </button>
          <button
            onClick={() => setActiveTab('pm')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition ${
              activeTab === 'pm'
                ? 'bg-white text-[#1a2217] font-semibold shadow-sm border border-[#ded9cd]'
                : 'text-[#6b7764] hover:text-[#1a2217]'
            }`}
          >
            <Moon className="w-3.5 h-3.5 text-[#425335]" />
            Evening (PM)
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3 py-1.5 rounded-full transition ${
              activeTab === 'products'
                ? 'bg-white text-[#1a2217] font-semibold shadow-sm border border-[#ded9cd]'
                : 'text-[#6b7764] hover:text-[#1a2217]'
            }`}
          >
            Curated Products
          </button>
          <button
            onClick={() => setActiveTab('diet')}
            className={`px-3 py-1.5 rounded-full transition ${
              activeTab === 'diet'
                ? 'bg-white text-[#1a2217] font-semibold shadow-sm border border-[#ded9cd]'
                : 'text-[#6b7764] hover:text-[#1a2217]'
            }`}
          >
            Diet & Barrier
          </button>
        </div>
      </div>

      {/* Contraindications Avoidance Banner */}
      {contraindications_avoided.length > 0 && (
        <div className="p-4 rounded-2xl bg-[#fbf0eb] border border-[#f3d3c7] text-xs text-[#1a2217] flex items-start gap-3">
          <ShieldCheck className="w-4 h-4 text-[#b85c3c] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-[#b85c3c] font-mono-clinical uppercase tracking-wider">
              Safety Contraindications Filtered:
            </span>
            {contraindications_avoided.map((item, idx) => (
              <p key={idx} className="text-[#556050] leading-relaxed">
                • {item}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Primary Active Ingredients Highlights */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono-clinical font-semibold uppercase tracking-wider text-[#637852]">
          Targeted Pharmacological Actives
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {primary_active_ingredients.map((ing, i) => (
            <div key={i} className="p-4 rounded-2xl bg-[#faf9f5] border border-[#e6e2d8] hover:border-[#cbd7c1] hover:bg-white transition space-y-2 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-xs font-bold text-[#1a2217]">{ing.name}</h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono-clinical bg-[#f4f6f1] text-[#425335] border border-[#cbd7c1]">
                  {ing.application_timing}
                </span>
              </div>
              <p className="text-[11px] font-semibold text-[#637852] font-mono-clinical">
                {ing.recommended_strength}
              </p>
              <p className="text-[11px] text-[#556050] leading-relaxed">
                {ing.mechanism_of_action}
              </p>
              <div className="pt-2 border-t border-[#f0ede6] text-[10px] text-[#6b7764]">
                <span className="font-semibold text-[#1a2217]">Barrier Pair:</span> {ing.barrier_support_pairing}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab Content: Morning Routine */}
      {activeTab === 'am' && (
        <div className="space-y-3 animate-fade-in">
          <h3 className="text-sm font-normal text-[#1a2217] flex items-center gap-2 font-serif-luxury">
            <Sun className="w-4 h-4 text-amber-600" />
            Morning (AM) Routine Sequence
          </h3>
          <div className="space-y-2.5">
            {daily_routine.morning_routine.map((step) => (
              <div
                key={step.step_number}
                className="p-4 rounded-2xl bg-[#faf9f5] border border-[#e6e2d8] flex items-start gap-3 hover:border-[#cbd7c1] hover:bg-white transition shadow-sm"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-mono-clinical font-bold text-xs shrink-0">
                  0{step.step_number}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1a2217]">{step.step_name}: {step.product_category}</span>
                    <span className="text-[10px] font-mono-clinical text-[#6b7764]">{step.frequency}</span>
                  </div>
                  <p className="text-xs text-[#637852] font-semibold mt-0.5">{step.product_name}</p>
                  <p className="text-[11px] text-[#556050] mt-1">{step.recommended_action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: Evening Routine */}
      {activeTab === 'pm' && (
        <div className="space-y-3 animate-fade-in">
          <h3 className="text-sm font-normal text-[#1a2217] flex items-center gap-2 font-serif-luxury">
            <Moon className="w-4 h-4 text-[#425335]" />
            Evening (PM) Routine Sequence
          </h3>
          <div className="space-y-2.5">
            {daily_routine.evening_routine.map((step) => (
              <div
                key={step.step_number}
                className="p-4 rounded-2xl bg-[#faf9f5] border border-[#e6e2d8] flex items-start gap-3 hover:border-[#cbd7c1] hover:bg-white transition shadow-sm"
              >
                <div className="w-8 h-8 rounded-xl bg-[#f4f6f1] border border-[#d6e0ce] text-[#425335] flex items-center justify-center font-mono-clinical font-bold text-xs shrink-0">
                  0{step.step_number}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1a2217]">{step.step_name}: {step.product_category}</span>
                    <span className="text-[10px] font-mono-clinical text-[#6b7764]">{step.frequency}</span>
                  </div>
                  <p className="text-xs text-[#425335] font-semibold mt-0.5">{step.product_name}</p>
                  <p className="text-[11px] text-[#556050] mt-1">{step.recommended_action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: Curated Products */}
      {activeTab === 'products' && (
        <div className="space-y-3 animate-fade-in">
          <h3 className="font-serif-luxury text-sm font-normal text-[#1a2217]">Curated Clinical Formulations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {curated_products.map((prod, i) => (
              <div key={i} className="p-4 rounded-2xl bg-[#faf9f5] border border-[#e6e2d8] space-y-2 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono-clinical uppercase font-semibold text-[#637852]">{prod.category}</span>
                    <h4 className="text-xs font-bold text-[#1a2217]">{prod.product_name}</h4>
                  </div>
                  <span className="text-xs font-mono-clinical font-bold text-[#425335]">{prod.price_range}</span>
                </div>
                <p className="text-[11px] text-[#556050] leading-relaxed">{prod.description}</p>
                <div className="flex flex-wrap gap-1 pt-2">
                  {prod.key_actives.map((act, j) => (
                    <span key={j} className="text-[10px] font-mono-clinical px-2 py-0.5 rounded-lg bg-[#f4f6f1] text-[#425335] border border-[#cbd7c1]">
                      {act}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: Diet & Barrier Tips */}
      {activeTab === 'diet' && (
        <div className="space-y-4 animate-fade-in">
          <div className="space-y-2">
            <h4 className="text-xs font-mono-clinical font-semibold text-[#425335] flex items-center gap-1.5 uppercase tracking-wider">
              <Utensils className="w-4 h-4" />
              Nutritional & Systemic Guidelines
            </h4>
            <div className="space-y-1.5">
              {dietary_guidance.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-[#faf9f5] border border-[#e6e2d8] text-xs text-[#1a2217] flex items-start gap-2.5 shadow-sm">
                  <Check className="w-4 h-4 text-[#637852] shrink-0 mt-0.5" />
                  <p className="leading-relaxed text-[#384333]">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-mono-clinical font-semibold text-[#637852] flex items-center gap-1.5 uppercase tracking-wider">
              <HeartHandshake className="w-4 h-4" />
              Epidermal Barrier Preservation Practices
            </h4>
            <div className="space-y-1.5">
              {barrier_health_tips.map((tip, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-[#faf9f5] border border-[#e6e2d8] text-xs text-[#1a2217] flex items-start gap-2.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#637852] mt-1.5 shrink-0" />
                  <p className="leading-relaxed text-[#384333]">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
