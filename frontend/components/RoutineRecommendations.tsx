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
    <div className="w-full glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-400" />
            2. Pharmacological Guidance & Daily Skincare Routine
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Personalized active ingredients and regimens synthesized from your multi-label diagnostic profile.
          </p>
        </div>

        {/* Routine Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setActiveTab('am')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'am'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            Morning (AM)
          </button>
          <button
            onClick={() => setActiveTab('pm')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'pm'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            Evening (PM)
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'products' ? 'bg-brand-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Curated Products
          </button>
          <button
            onClick={() => setActiveTab('diet')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'diet' ? 'bg-brand-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Diet & Barrier
          </button>
        </div>
      </div>

      {/* Contraindications Avoidance Banner */}
      {contraindications_avoided.length > 0 && (
        <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-brand-500/30 text-xs text-cyan-200 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-brand-300">Safety Contraindications Filtered:</span>
            {contraindications_avoided.map((item, idx) => (
              <p key={idx} className="text-cyan-200/90 leading-relaxed">
                • {item}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Primary Active Ingredients Highlights */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Targeted Pharmacological Actives
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {primary_active_ingredients.map((ing, i) => (
            <div key={i} className="glass-card rounded-xl p-4 border border-slate-800 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-xs font-bold text-white">{ing.name}</h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-brand-500/10 text-brand-300 border border-brand-500/20">
                  {ing.application_timing}
                </span>
              </div>
              <p className="text-[11px] font-medium text-brand-400 font-mono">
                {ing.recommended_strength}
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {ing.mechanism_of_action}
              </p>
              <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500">
                <span className="font-semibold text-slate-400">Barrier Pair:</span> {ing.barrier_support_pairing}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab Content: Morning Routine */}
      {activeTab === 'am' && (
        <div className="space-y-3 animate-fade-in">
          <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-400" />
            Morning (AM) Routine Sequence
          </h3>
          <div className="space-y-2.5">
            {daily_routine.morning_routine.map((step) => (
              <div
                key={step.step_number}
                className="glass-card rounded-xl p-3.5 border border-slate-800 flex items-start gap-3 hover:border-slate-700 transition"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                  {step.step_number}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{step.step_name}: {step.product_category}</span>
                    <span className="text-[10px] font-mono text-slate-400">{step.frequency}</span>
                  </div>
                  <p className="text-xs text-brand-300 font-semibold mt-0.5">{step.product_name}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{step.recommended_action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: Evening Routine */}
      {activeTab === 'pm' && (
        <div className="space-y-3 animate-fade-in">
          <h3 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
            <Moon className="w-4 h-4 text-indigo-400" />
            Evening (PM) Routine Sequence
          </h3>
          <div className="space-y-2.5">
            {daily_routine.evening_routine.map((step) => (
              <div
                key={step.step_number}
                className="glass-card rounded-xl p-3.5 border border-slate-800 flex items-start gap-3 hover:border-slate-700 transition"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                  {step.step_number}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{step.step_name}: {step.product_category}</span>
                    <span className="text-[10px] font-mono text-slate-400">{step.frequency}</span>
                  </div>
                  <p className="text-xs text-purple-300 font-semibold mt-0.5">{step.product_name}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{step.recommended_action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: Curated Products */}
      {activeTab === 'products' && (
        <div className="space-y-3 animate-fade-in">
          <h3 className="text-sm font-bold text-white">Curated Clinical Formulations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {curated_products.map((prod, i) => (
              <div key={i} className="glass-card rounded-xl p-4 border border-slate-800 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400">{prod.category}</span>
                    <h4 className="text-xs font-bold text-white">{prod.product_name}</h4>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400">{prod.price_range}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{prod.description}</p>
                <div className="flex flex-wrap gap-1 pt-2">
                  {prod.key_actives.map((act, j) => (
                    <span key={j} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
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
            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <Utensils className="w-4 h-4" />
              Nutritional & Systemic Guidelines
            </h4>
            <div className="space-y-1.5">
              {dietary_guidance.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
              <HeartHandshake className="w-4 h-4" />
              Epidermal Barrier Preservation Practices
            </h4>
            <div className="space-y-1.5">
              {barrier_health_tips.map((tip, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0"></span>
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
