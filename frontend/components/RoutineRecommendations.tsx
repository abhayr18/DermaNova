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
    <div className="w-full glass-panel rounded-3xl p-6 sm:p-8 border border-navara-border space-y-6 shadow-2xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-navara-borderSubtle pb-5">
        <div>
          <h2 className="font-serif-luxury text-xl sm:text-2xl font-bold text-navara-ivory flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-navara-matcha" />
            Botanical Ritual & Daily Skincare Guidance
          </h2>
          <p className="text-xs text-navara-stone mt-1">
            Personalized active ingredients and regimens synthesized from your multi-label diagnostic profile.
          </p>
        </div>

        {/* Routine Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-[#141712] border border-navara-borderSubtle">
          <button
            onClick={() => setActiveTab('am')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition ${
              activeTab === 'am'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow'
                : 'text-navara-stone hover:text-navara-ivory'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            Morning (AM)
          </button>
          <button
            onClick={() => setActiveTab('pm')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition ${
              activeTab === 'pm'
                ? 'bg-[#2a3b19] text-navara-matcha border border-navara-sage/40 shadow'
                : 'text-navara-stone hover:text-navara-ivory'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            Evening (PM)
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition ${
              activeTab === 'products'
                ? 'bg-navara-ivory text-navara-bg shadow'
                : 'text-navara-stone hover:text-navara-ivory'
            }`}
          >
            Curated Products
          </button>
          <button
            onClick={() => setActiveTab('diet')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition ${
              activeTab === 'diet'
                ? 'bg-navara-ivory text-navara-bg shadow'
                : 'text-navara-stone hover:text-navara-ivory'
            }`}
          >
            Diet & Barrier
          </button>
        </div>
      </div>

      {/* Contraindications Avoidance Banner */}
      {contraindications_avoided.length > 0 && (
        <div className="p-4 rounded-2xl bg-[#1c2219] border border-navara-terracotta/40 text-xs text-navara-cream flex items-start gap-3 shadow-inner">
          <ShieldCheck className="w-4 h-4 text-navara-terracotta shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-navara-terracotta font-mono uppercase tracking-wider">
              Safety Contraindications Filtered:
            </span>
            {contraindications_avoided.map((item, idx) => (
              <p key={idx} className="text-navara-stone leading-relaxed">
                • {item}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Primary Active Ingredients Highlights */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-navara-sage">
          Targeted Pharmacological Actives
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {primary_active_ingredients.map((ing, i) => (
            <div key={i} className="p-4 rounded-2xl bg-[#1c2219]/80 border border-navara-borderSubtle hover:border-navara-border transition space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-xs font-bold text-navara-ivory">{ing.name}</h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#232e1b] text-navara-matcha border border-navara-sage/30">
                  {ing.application_timing}
                </span>
              </div>
              <p className="text-[11px] font-bold text-navara-matcha font-mono">
                {ing.recommended_strength}
              </p>
              <p className="text-[11px] text-navara-stone leading-relaxed">
                {ing.mechanism_of_action}
              </p>
              <div className="pt-2 border-t border-navara-borderSubtle text-[10px] text-navara-stone">
                <span className="font-semibold text-navara-cream">Barrier Pair:</span> {ing.barrier_support_pairing}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab Content: Morning Routine */}
      {activeTab === 'am' && (
        <div className="space-y-3 animate-fade-in">
          <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2 font-serif-luxury">
            <Sun className="w-4 h-4 text-amber-400" />
            Morning (AM) Routine Sequence
          </h3>
          <div className="space-y-2.5">
            {daily_routine.morning_routine.map((step) => (
              <div
                key={step.step_number}
                className="p-4 rounded-2xl bg-[#1c2219]/80 border border-navara-borderSubtle flex items-start gap-3 hover:border-navara-border transition"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                  0{step.step_number}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-navara-ivory">{step.step_name}: {step.product_category}</span>
                    <span className="text-[10px] font-mono text-navara-stone">{step.frequency}</span>
                  </div>
                  <p className="text-xs text-navara-matcha font-semibold mt-0.5">{step.product_name}</p>
                  <p className="text-[11px] text-navara-stone mt-1">{step.recommended_action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: Evening Routine */}
      {activeTab === 'pm' && (
        <div className="space-y-3 animate-fade-in">
          <h3 className="text-sm font-bold text-navara-matcha flex items-center gap-2 font-serif-luxury">
            <Moon className="w-4 h-4 text-navara-matcha" />
            Evening (PM) Routine Sequence
          </h3>
          <div className="space-y-2.5">
            {daily_routine.evening_routine.map((step) => (
              <div
                key={step.step_number}
                className="p-4 rounded-2xl bg-[#1c2219]/80 border border-navara-borderSubtle flex items-start gap-3 hover:border-navara-border transition"
              >
                <div className="w-8 h-8 rounded-xl bg-[#2a3b19] border border-navara-sage/40 text-navara-matcha flex items-center justify-center font-mono font-bold text-xs shrink-0">
                  0{step.step_number}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-navara-ivory">{step.step_name}: {step.product_category}</span>
                    <span className="text-[10px] font-mono text-navara-stone">{step.frequency}</span>
                  </div>
                  <p className="text-xs text-navara-cream font-semibold mt-0.5">{step.product_name}</p>
                  <p className="text-[11px] text-navara-stone mt-1">{step.recommended_action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: Curated Products */}
      {activeTab === 'products' && (
        <div className="space-y-3 animate-fade-in">
          <h3 className="font-serif-luxury text-sm font-bold text-navara-ivory">Curated Clinical Formulations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {curated_products.map((prod, i) => (
              <div key={i} className="p-4 rounded-2xl bg-[#1c2219]/80 border border-navara-borderSubtle space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase font-semibold text-navara-sage">{prod.category}</span>
                    <h4 className="text-xs font-bold text-navara-ivory">{prod.product_name}</h4>
                  </div>
                  <span className="text-xs font-mono font-bold text-navara-matcha">{prod.price_range}</span>
                </div>
                <p className="text-[11px] text-navara-stone leading-relaxed">{prod.description}</p>
                <div className="flex flex-wrap gap-1 pt-2">
                  {prod.key_actives.map((act, j) => (
                    <span key={j} className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-[#232e1b] text-navara-matcha border border-navara-sage/30">
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
            <h4 className="text-xs font-mono font-bold text-navara-matcha flex items-center gap-1.5 uppercase tracking-wider">
              <Utensils className="w-4 h-4" />
              Nutritional & Systemic Guidelines
            </h4>
            <div className="space-y-1.5">
              {dietary_guidance.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-[#1c2219]/80 border border-navara-borderSubtle text-xs text-navara-cream flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-navara-matcha shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold text-navara-sage flex items-center gap-1.5 uppercase tracking-wider">
              <HeartHandshake className="w-4 h-4" />
              Epidermal Barrier Preservation Practices
            </h4>
            <div className="space-y-1.5">
              {barrier_health_tips.map((tip, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-[#1c2219]/80 border border-navara-borderSubtle text-xs text-navara-cream flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-navara-matcha mt-1.5 shrink-0" />
                  <p className="leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
