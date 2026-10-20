'use client';

import React, { useState } from 'react';
import { apiService, PatientProfile } from '../services/api';
import { X, Check, ShieldAlert, Sparkles, HeartPulse, Sun, Droplets, ArrowRight } from 'lucide-react';

interface IntakeQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated: (profile: PatientProfile) => void;
  initialProfile?: PatientProfile | null;
}

export const IntakeQuizModal: React.FC<IntakeQuizModalProps> = ({
  isOpen,
  onClose,
  onProfileUpdated,
  initialProfile,
}) => {
  const [step, setStep] = useState(1);
  const [concern, setConcern] = useState(initialProfile?.primary_skin_concern || 'acne');
  const [skinType, setSkinType] = useState(initialProfile?.baseline_skin_type || 'Combination');
  const [hasSensitive, setHasSensitive] = useState(initialProfile?.has_sensitive_skin || false);
  const [allergies, setAllergies] = useState<string[]>(initialProfile?.known_allergies || []);
  const [sunExposure, setSunExposure] = useState(initialProfile?.sun_exposure_level || 'moderate');
  const [waterIntake, setWaterIntake] = useState(initialProfile?.water_intake_liters || 2.5);
  const [isPregnant, setIsPregnant] = useState(initialProfile?.is_pregnant_or_nursing || false);
  const [age, setAge] = useState(initialProfile?.age || 24);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const allergyOptions = [
    'Fragrance / Essential Oils',
    'High-Strength Glycolic Acid (AHA)',
    'Benzoyl Peroxide',
    'Sulfates / Harsh Surfactants',
    'Niacinamide (Flushing reaction)',
  ];

  const toggleAllergy = (item: string) => {
    if (allergies.includes(item)) {
      setAllergies(allergies.filter((a) => a !== item));
    } else {
      setAllergies([...allergies, item]);
    }
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      const payload: Partial<PatientProfile> = {
        age,
        primary_skin_concern: concern,
        baseline_skin_type: skinType,
        has_sensitive_skin: hasSensitive,
        known_allergies: allergies,
        sun_exposure_level: sunExposure,
        water_intake_liters: waterIntake,
        is_pregnant_or_nursing: isPregnant,
      };
      const res = await apiService.updateProfile(payload);
      onProfileUpdated(res.profile);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to save profile. Please ensure you are logged in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-[#e6e2d8] p-6 sm:p-8 space-y-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8b9784] hover:text-[#1a2217] p-1.5 rounded-full hover:bg-[#faf9f5] transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header & Progress Bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-[#637852] font-mono-clinical">
            <span className="flex items-center gap-1.5 font-semibold">
              <HeartPulse className="w-4 h-4 text-[#637852]" />
              DermaNova Medical Consultation
            </span>
            <span className="text-[#6b7764]">Step {step} of 3</span>
          </div>

          <div className="w-full bg-[#f0ede6] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#1c2417] h-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* STEP 1: Skin Concern & Skin Type */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h3 className="font-serif-luxury text-base font-normal text-[#1a2217]">What is your primary facial skin concern?</h3>
              <p className="text-xs text-[#6b7764] mt-0.5 font-mono-clinical">
                Our pharmacological engine will prioritize targeted cosmetic active ingredients for this goal.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: 'acne', label: 'Inflammatory Acne & Papules', icon: '🔴' },
                { id: 'dark_spots', label: 'Dark Spots & PIH', icon: '🟤' },
                { id: 'pigmentation', label: 'Diffuse Melasma / Tan', icon: '☀️' },
                { id: 'pores', label: 'Enlarged Congested Pores', icon: '🔍' },
                { id: 'redness', label: 'Facial Redness & Rosacea', icon: '🌸' },
                { id: 'wrinkles', label: 'Fine Lines & Collagen Loss', icon: '✨' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setConcern(item.id)}
                  className={`p-3 rounded-2xl border text-left text-xs transition ${
                    concern === item.id
                      ? 'border-[#637852] bg-[#f4f6f1] text-[#1a2217] shadow-sm font-semibold'
                      : 'border-[#e6e2d8] bg-[#faf9f5] text-[#556050] hover:border-[#cbd7c1] hover:bg-white'
                  }`}
                >
                  <div className="text-base mb-1">{item.icon}</div>
                  <div>{item.label}</div>
                </button>
              ))}
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs text-[#1a2217] font-medium font-mono-clinical">Your Age</label>
              <input
                type="number"
                min={12}
                max={99}
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value) || 20)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#faf9f5] border border-[#ded9cd] text-[#1a2217] text-xs focus:outline-none focus:ring-2 focus:ring-[#637852]/20 focus:border-[#637852]"
              />
            </div>
          </div>
        )}

        {/* STEP 2: Skin Sensitivity & Allergies */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h3 className="font-serif-luxury text-base font-normal text-[#1a2217]">Barrier Sensitivity & Known Allergies</h3>
              <p className="text-xs text-[#6b7764] mt-0.5 font-mono-clinical">
                Contraindication check: prevents active ingredient irritation and peeling.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl border border-[#e6e2d8] bg-[#faf9f5] space-y-2">
              <label className="text-xs font-semibold text-[#1a2217] flex items-center justify-between cursor-pointer">
                <span>Does your skin sting, burn, or turn red easily?</span>
                <input
                  type="checkbox"
                  checked={hasSensitive}
                  onChange={(e) => setHasSensitive(e.target.checked)}
                  className="w-4 h-4 rounded text-[#1c2417] accent-[#1c2417] focus:ring-0"
                />
              </label>
              <p className="text-[11px] text-[#6b7764]">
                If checked, our recommender will substitute harsh chemical acids with soothing Azelaic Acid & Centella.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-[#1a2217] font-mono-clinical">Select any known ingredient sensitivities:</span>
              <div className="space-y-1.5">
                {allergyOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleAllergy(opt)}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs flex items-center justify-between transition ${
                      allergies.includes(opt)
                        ? 'border-[#b85c3c] bg-[#fbf0eb] text-[#b85c3c] font-semibold'
                        : 'border-[#e6e2d8] bg-[#faf9f5] text-[#556050] hover:border-[#cbd7c1] hover:bg-white'
                    }`}
                  >
                    <span>{opt}</span>
                    {allergies.includes(opt) && <Check className="w-4 h-4 text-[#b85c3c]" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Lifestyle & Pregnancy Safety */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h3 className="font-serif-luxury text-base font-normal text-[#1a2217]">Lifestyle & Clinical Safety Factors</h3>
              <p className="text-xs text-[#6b7764] mt-0.5 font-mono-clinical">
                Used to tailor your daily sunscreen protocol and dietary guidance.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-[#1a2217] font-medium flex items-center gap-1.5 font-mono-clinical">
                <Sun className="w-3.5 h-3.5 text-amber-600" />
                Daily Outdoor Sun Exposure
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['low', 'moderate', 'high'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSunExposure(lvl)}
                    className={`py-2 rounded-xl border text-xs capitalize font-medium font-mono-clinical transition ${
                      sunExposure === lvl
                        ? 'border-[#1c2417] bg-[#1c2417] text-white'
                        : 'border-[#e6e2d8] bg-[#faf9f5] text-[#556050] hover:bg-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-[#1a2217] font-medium flex items-center gap-1.5 font-mono-clinical">
                <Droplets className="w-3.5 h-3.5 text-[#637852]" />
                Daily Water Intake: {waterIntake} Liters
              </label>
              <input
                type="range"
                min="1.0"
                max="5.0"
                step="0.5"
                value={waterIntake}
                onChange={(e) => setWaterIntake(parseFloat(e.target.value))}
                className="w-full accent-[#637852]"
              />
            </div>

            <div className="p-3.5 rounded-2xl border border-[#f3d3c7] bg-[#fbf0eb] space-y-2">
              <label className="text-xs font-semibold text-[#b85c3c] flex items-center justify-between cursor-pointer">
                <span className="flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-[#b85c3c]" />
                  Are you currently pregnant or nursing?
                </span>
                <input
                  type="checkbox"
                  checked={isPregnant}
                  onChange={(e) => setIsPregnant(e.target.checked)}
                  className="w-4 h-4 rounded text-[#b85c3c] accent-[#b85c3c] focus:ring-0"
                />
              </label>
              <p className="text-[11px] text-[#556050]">
                Medical Contraindication Rule: Retinoids and salicylic acid are automatically blocked for fetal safety.
              </p>
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-[#f0ede6]">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-xs font-semibold text-[#6b7764] hover:text-[#1a2217] transition font-mono-clinical"
            >
              Back
            </button>
          ) : (
            <div></div>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-5 py-2.5 rounded-full bg-[#1c2417] text-white font-mono-clinical font-semibold text-xs flex items-center gap-1.5 hover:bg-[#2d3b25] transition shadow-sm"
            >
              Next Step
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleFinish}
              className="px-6 py-2.5 rounded-full bg-[#1c2417] hover:bg-[#2d3b25] text-white font-mono-clinical font-semibold text-xs shadow-md transition disabled:opacity-50"
            >
              {isSubmitting ? 'Saving Profile...' : 'Complete Intake'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
