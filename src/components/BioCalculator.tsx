'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBioCalcStore } from '@/store/useBioCalcStore';
import { useBundleStore } from '@/store/useBundleStore';
import TrialPlanShowcase from '@/components/TrialPlanShowcase';
import {
  type Gender,
  type HealthGoal,
  type SeedFrequency,
  type VeggieFrequency,
  type WaterIntake,
  type SleepQuality,
  type StressLevel,
  type OilUsage,
  type SugarIntake,
  type MealTiming,
} from '@/lib/bioCalculator';

const HEALTH_GOALS: {
  id: HealthGoal;
  title: string;
  icon: string;
  image: string;
  tag: string;
  subtitle: string;
}[] = [
  {
    id: 'WEIGHT_LOSS',
    title: 'Weight Loss & Lean Belly',
    icon: '🔥🥗',
    image: '/bowls/skin-glow.jpg',
    tag: 'Metabolic Deficit',
    subtitle: 'High living fiber & thermogenic enzymes for natural fat oxidation.',
  },
  {
    id: 'LEAN_MUSCLE',
    title: 'Clean Lean Muscle',
    icon: '💪🥜',
    image: '/bowls/active-fitness.jpg',
    tag: 'Sprouted Plant Protein',
    subtitle: 'Bioavailable amino acids, soaked seeds & microgreen muscle recovery.',
  },
  {
    id: 'GUT_HEALTH',
    title: 'Gut Reset & Enzymes',
    icon: '🌱🦠',
    image: '/bowls/gut-health.jpg',
    tag: 'Prebiotic Living Flora',
    subtitle: 'Intact food enzymes, soaked nuts & microbiome soothing greens.',
  },
  {
    id: 'LONGEVITY_DETOX',
    title: 'Longevity & Detox',
    icon: '🧬🍇',
    image: '/bowls/friday-metabolic.jpg',
    tag: 'Cellular Autophagy',
    subtitle: 'High ORAC antioxidant berries, chlorophyll & heavy metal detox.',
  },
  {
    id: 'ENERGY_VITALITY',
    title: 'All-Day Clean Vitality',
    icon: '⚡☀️',
    image: '/bowls/monday-vitality.jpg',
    tag: 'Sustained Glycemic Release',
    subtitle: 'Structured plant hydration & sunlit microgreens to end afternoon crashes.',
  },
];

// Life stage milestone helper for age slider
function getAgeLifeStage(age: number) {
  if (age <= 25) {
    return {
      emoji: '🌱',
      label: 'Peak Metabolic Fire',
      desc: 'Rapid cellular turnover; prime time to establish raw enzyme foundations.',
    };
  }
  if (age <= 40) {
    return {
      emoji: '⚡',
      label: 'Prime Performance & Focus',
      desc: 'High cognitive demand; protect mitochondrial health with living antioxidants.',
    };
  }
  if (age <= 60) {
    return {
      emoji: '🛡️',
      label: 'Cellular Longevity & Repair',
      desc: 'Defend against oxidative stress and AGEs; prioritize active digestive enzymes.',
    };
  }
  return {
    emoji: '🌟',
    label: 'Master Living Vitality',
    desc: 'Gentle, bio-available living nutrition to support joints, cardiovascular flow & gut ease.',
  };
}

// Reusable card selector component with icon & status feedback
function OptionCard({
  selected,
  onClick,
  icon,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  icon?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-3.5 rounded-2xl text-left transition-all border cursor-pointer relative overflow-hidden group ${
        selected
          ? 'bg-brand-mustard/20 border-brand-mustard text-brand-forest shadow-md shadow-brand-mustard/15 ring-2 ring-brand-mustard/30'
          : 'bg-brand-cream/60 border-brand-border/80 text-brand-forest-muted hover:bg-brand-cream hover:border-brand-mustard/40'
      }`}
    >
      <div className="flex items-start justify-between gap-1.5">
        <div className="flex-1">
          {icon && <span className="text-xl block mb-1">{icon}</span>}
          {children}
        </div>
        {selected && (
          <span className="w-5 h-5 rounded-full bg-brand-mustard text-brand-forest text-xs font-black flex items-center justify-center shrink-0">
            ✓
          </span>
        )}
      </div>
    </button>
  );
}

export default function BioCalculator() {
  const router = useRouter();
  const { inputs, setInputs, currentStep, nextStep, prevStep, goToStep, results, calculate } = useBioCalcStore();
  const { selectProduct, selectBundle } = useBundleStore();

  const [isMounted, setIsMounted] = useState(false);
  const [showAdvancedBody, setShowAdvancedBody] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (!results) {
      calculate();
    }
  }, [calculate, results]);

  if (!isMounted) {
    return (
      <div className="min-h-[520px] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-mustard border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleSelectPlanAndOrder = () => {
    if (!results) return;
    const prod = results.matchedProduct;
    selectProduct({
      id: prod.id,
      name: prod.name,
      description: prod.description,
      price: prod.price,
      imageUrl: prod.imageUrl,
      type: prod.type,
      calories: prod.calories,
      protein: prod.protein,
      carbs: prod.carbs,
      fats: prod.fats,
      dietaryPreference: prod.dietaryPreference,
    });
    selectBundle('DAYS_7');
    router.push('/checkout');
  };

  // Circular gauge calculations
  const vitalityScore = results ? results.livingFoodVitalityScore : 50;
  const radius = 74;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * vitalityScore) / 100;

  const currentLifeStage = getAgeLifeStage(inputs.age);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Stepper Navigation */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative max-w-xl mx-auto px-4">
          <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-brand-cream -translate-y-1/2 z-0" />
          <div
            className="absolute top-1/2 left-8 h-0.5 bg-brand-mustard transition-all duration-500 -translate-y-1/2 z-0"
            style={{ width: `${((currentStep - 1) / 4) * 88}%` }}
          />
          {[
            { step: 1, label: 'Profile', icon: '👤' },
            { step: 2, label: 'Lifestyle', icon: '🌿' },
            { step: 3, label: 'Diet Habits', icon: '🥗' },
            { step: 4, label: 'Vitality', icon: '🧬' },
            { step: 5, label: 'Solution', icon: '✨' },
          ].map((s) => {
            const isActive = currentStep === s.step;
            const isCompleted = currentStep > s.step;
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => goToStep(s.step as 1 | 2 | 3 | 4 | 5)}
                className="relative z-10 flex flex-col items-center group cursor-pointer focus:outline-none"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 ${
                    isActive
                      ? 'bg-brand-mustard text-brand-forest ring-4 ring-brand-mustard/20 scale-110 shadow-lg shadow-brand-mustard/30'
                      : isCompleted
                      ? 'bg-brand-mustard-hover text-brand-forest'
                      : 'bg-brand-cream text-brand-forest-muted group-hover:bg-brand-border'
                  }`}
                >
                  {isCompleted ? '✓' : <span>{s.icon}</span>}
                </div>
                <span
                  className={`text-[11px] font-bold mt-2 transition-colors ${
                    isActive ? 'text-brand-mustard' : 'text-brand-forest-muted'
                  }`}
                >
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Container Card */}
      <div className="rounded-3xl p-6 sm:p-10 relative overflow-hidden backdrop-blur-xl bg-brand-card/90 border border-brand-border shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-mustard/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* ===== STEP 1: Biological Profile & Health Goals ===== */}
        {currentStep === 1 && (
          <div className="space-y-8 animate-fade-in-up">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-mustard/10 text-brand-mustard border border-brand-mustard/20 flex items-center gap-1.5">
                  <span>🌱 Step 1 of 5</span>
                  <span>·</span>
                  <span>Biological Baselines</span>
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black mt-3 text-brand-forest flex items-center gap-2">
                <span>Tell us about your body &amp; wellness goal</span>
                <span className="text-xl sm:text-2xl">🎯</span>
              </h2>
              <p className="text-sm text-brand-forest-muted mt-1 leading-relaxed">
                We calibrate your basal metabolic expenditure (Mifflin-St Jeor) and target living enzymes to your specific bio-profile.
              </p>
            </div>

            {/* Gender Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-forest-muted mb-3 flex items-center gap-1.5">
                <span>🧬 Biological Gender</span>
                <span className="text-[10px] lowercase font-normal opacity-70">(for metabolic calculation)</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'male', label: 'Male', icon: '👨', tag: 'BMR Baseline' },
                  { id: 'female', label: 'Female', icon: '👩', tag: 'Metabolic Target' },
                  { id: 'other', label: 'Non-Binary', icon: '✨', tag: 'Adaptive Baseline' },
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setInputs({ gender: g.id as Gender })}
                    className={`py-3.5 px-4 rounded-2xl flex flex-col items-center justify-center gap-1 font-semibold text-sm transition-all border ${
                      inputs.gender === g.id
                        ? 'bg-brand-mustard/20 border-brand-mustard text-brand-forest shadow-md shadow-brand-mustard/15 ring-2 ring-brand-mustard/30'
                        : 'bg-brand-cream/60 border-brand-border/80 text-brand-forest-muted hover:bg-brand-cream'
                    }`}
                  >
                    <span className="text-2xl">{g.icon}</span>
                    <span className="font-bold text-xs sm:text-sm text-brand-forest">{g.label}</span>
                    <span className="text-[10px] text-brand-forest-muted opacity-80">{g.tag}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Age Slider with Dynamic Milestone */}
            <div className="rounded-2xl p-5 bg-brand-cream/40 border border-brand-border">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-forest-muted flex items-center gap-1.5">
                  <span>🎂 Chronological Age</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-mustard/15 text-brand-mustard-hover border border-brand-mustard/30">
                    {currentLifeStage.emoji} {currentLifeStage.label}
                  </span>
                  <span className="text-2xl font-black text-brand-mustard font-mono">
                    {inputs.age} <span className="text-xs text-brand-forest-muted">yrs</span>
                  </span>
                </div>
              </div>

              <input
                type="range"
                min={18}
                max={80}
                value={inputs.age}
                onChange={(e) => setInputs({ age: Number(e.target.value) })}
                className="w-full h-2.5 bg-brand-border rounded-lg appearance-none cursor-pointer accent-brand-mustard mt-2"
              />

              <div className="flex justify-between text-[11px] text-brand-forest-muted/70 mt-2 font-mono">
                <span>18 yrs</span>
                <span>45 yrs</span>
                <span>80 yrs</span>
              </div>

              <p className="text-[11px] text-brand-forest-muted/90 mt-2 pt-2 border-t border-brand-border/60">
                {currentLifeStage.desc}
              </p>
            </div>

            {/* Health Goal Cards with Real Bowl Photos & Emojis */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-forest-muted mb-3 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span>🎯 Primary Health Goal</span>
                  <span className="text-[10px] lowercase font-normal opacity-70">(select your focus)</span>
                </span>
                <span className="text-[10px] text-brand-mustard font-bold">✨ Matched to living bowl protocols</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {HEALTH_GOALS.map((goal) => {
                  const isSelected = inputs.healthGoal === goal.id;
                  return (
                    <button
                      key={goal.id}
                      type="button"
                      onClick={() => setInputs({ healthGoal: goal.id })}
                      className={`p-3.5 rounded-2xl text-left transition-all border flex flex-col justify-between relative overflow-hidden group cursor-pointer ${
                        isSelected
                          ? 'bg-brand-mustard/20 border-brand-mustard shadow-lg shadow-brand-mustard/15 ring-2 ring-brand-mustard/40'
                          : 'bg-brand-cream/50 border-brand-border hover:bg-brand-cream hover:border-brand-mustard/40 text-brand-forest-muted'
                      }`}
                    >
                      {/* Photo Thumbnail + Badge */}
                      <div className="flex items-center gap-3 mb-2.5">
                        <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-brand-border shadow-sm relative group-hover:scale-105 transition-transform">
                          <img
                            src={goal.image}
                            alt={goal.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-lg">{goal.icon}</span>
                            {isSelected && (
                              <span className="w-5 h-5 rounded-full bg-brand-mustard text-brand-forest text-xs font-black flex items-center justify-center shrink-0">
                                ✓
                              </span>
                            )}
                          </div>
                          <span className="inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-brand-forest/10 text-brand-forest mt-1">
                            {goal.tag}
                          </span>
                        </div>
                      </div>

                      <div>
                        <h4 className={`text-sm font-black leading-tight ${isSelected ? 'text-brand-forest' : 'text-brand-forest'}`}>
                          {goal.title}
                        </h4>
                        <p className="text-xs text-brand-forest-muted mt-1 leading-relaxed">
                          {goal.subtitle}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Body Metrics */}
            <div className="rounded-2xl p-4 bg-brand-cream/30 border border-brand-border">
              <button
                type="button"
                onClick={() => setShowAdvancedBody(!showAdvancedBody)}
                className="w-full flex items-center justify-between text-xs font-semibold text-brand-forest-muted hover:text-brand-mustard transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span>📐 Precise Body Metrics</span>
                  <span className="text-[10px] text-brand-forest-muted/70 font-normal">(Optional: Height, Weight &amp; Waist for Indian BMI / WHtR)</span>
                </span>
                <span className="text-brand-forest-muted/70">{showAdvancedBody ? '▲ Hide' : '▼ Expand'}</span>
              </button>

              {showAdvancedBody && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-brand-border/80">
                  <div>
                    <label className="block text-xs text-brand-forest-muted mb-1 font-medium flex items-center gap-1">
                      <span>⚖️</span>
                      <span>Body Weight (kg)</span>
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 70"
                      value={inputs.weight || ''}
                      onChange={(e) => setInputs({ weight: Number(e.target.value) || undefined })}
                      className="w-full px-4 py-2.5 rounded-xl bg-brand-cream border border-brand-border text-sm text-brand-forest focus:outline-none focus:border-brand-mustard font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-brand-forest-muted mb-1 font-medium flex items-center gap-1">
                      <span>📏</span>
                      <span>Height (cm)</span>
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 175"
                      value={inputs.height || ''}
                      onChange={(e) => setInputs({ height: Number(e.target.value) || undefined })}
                      className="w-full px-4 py-2.5 rounded-xl bg-brand-cream border border-brand-border text-sm text-brand-forest focus:outline-none focus:border-brand-mustard font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-brand-forest-muted mb-1 font-medium flex items-center gap-1">
                      <span>📐</span>
                      <span>Waist (cm)</span>
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 82"
                      value={inputs.waistCircumference || ''}
                      onChange={(e) => setInputs({ waistCircumference: Number(e.target.value) || undefined })}
                      className="w-full px-4 py-2.5 rounded-xl bg-brand-cream border border-brand-border text-sm text-brand-forest focus:outline-none focus:border-brand-mustard font-mono"
                    />
                    <p className="text-[10px] text-brand-forest-muted/60 mt-1">Calibrates Waist-to-Height metabolic risk</p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={nextStep}
                className="px-8 py-3.5 rounded-2xl font-bold text-sm bg-brand-mustard text-brand-forest hover:bg-brand-mustard-hover transition-all shadow-lg shadow-brand-mustard/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center gap-2"
              >
                <span>Next: Daily Lifestyle</span>
                <span>→</span>
              </button>
            </div>
          </div>
        )}

        {/* ===== STEP 2: Lifestyle & Habits ===== */}
        {currentStep === 2 && (
          <div className="space-y-7 animate-fade-in-up">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-mustard/10 text-brand-mustard border border-brand-mustard/20 flex items-center gap-1.5">
                  <span>🌿 Step 2 of 5</span>
                  <span>·</span>
                  <span>Daily Lifestyle &amp; Habits</span>
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black mt-3 text-brand-forest flex items-center gap-2">
                <span>How do your daily habits look?</span>
                <span className="text-xl sm:text-2xl">⚡</span>
              </h2>
              <p className="text-sm text-brand-forest-muted mt-1 leading-relaxed">
                Sleep, hydration, stress, and cooking methods heavily dictate biological aging, enzyme depletion, and metabolic recovery.
              </p>
            </div>

            {/* Water Intake */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-forest-muted mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span>💧 Daily Water Intake</span>
                  <span className="text-[10px] lowercase font-normal opacity-70">(cellular hydration)</span>
                </span>
                <span className="text-[10px] text-brand-mustard font-bold">Target: 8+ glasses for micro-cellular flush</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'very_low', icon: '🌵', label: '< 4 glasses', subtitle: 'Desert Dehydrated • Sluggish cells' },
                  { id: 'low', icon: '💧', label: '4-6 glasses', subtitle: 'Sub-Optimal • Below cellular target' },
                  { id: 'adequate', icon: '🚰', label: '6-8 glasses', subtitle: 'Adequate Flow • Balanced hydration' },
                  { id: 'optimal', icon: '🌊', label: '8+ glasses', subtitle: 'Optimal Cell Flush • High energy' },
                ].map((item) => (
                  <OptionCard
                    key={item.id}
                    icon={item.icon}
                    selected={inputs.waterIntake === item.id}
                    onClick={() => setInputs({ waterIntake: item.id as WaterIntake })}
                  >
                    <div className="text-xs font-bold text-brand-forest">{item.label}</div>
                    <div className="text-[10px] text-brand-forest-muted mt-0.5 leading-snug">{item.subtitle}</div>
                  </OptionCard>
                ))}
              </div>
            </div>

            {/* Sleep Quality */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-forest-muted mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span>😴 Sleep Quality &amp; Duration</span>
                  <span className="text-[10px] lowercase font-normal opacity-70">(overnight autophagy)</span>
                </span>
                <span className="text-[10px] text-brand-mustard font-bold">Target: 7-8h restful sleep</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'poor', icon: '🥱', label: 'Poor (< 5 hrs)', subtitle: 'Restless • High morning cortisol' },
                  { id: 'average', icon: '🌙', label: 'Average (5-7 hrs)', subtitle: 'Partial repair • Mid-day fatigue' },
                  { id: 'good', icon: '🛌', label: 'Good (7-8 hrs)', subtitle: 'Deep Restful • Muscle & gut repair' },
                  { id: 'excellent', icon: '✨', label: 'Excellent (8+ hrs)', subtitle: 'Peak Rejuvenation • Full REM' },
                ].map((item) => (
                  <OptionCard
                    key={item.id}
                    icon={item.icon}
                    selected={inputs.sleepQuality === item.id}
                    onClick={() => setInputs({ sleepQuality: item.id as SleepQuality })}
                  >
                    <div className="text-xs font-bold text-brand-forest">{item.label}</div>
                    <div className="text-[10px] text-brand-forest-muted mt-0.5 leading-snug">{item.subtitle}</div>
                  </OptionCard>
                ))}
              </div>
            </div>

            {/* Stress Level */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-forest-muted mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span>🧘 Daily Stress Level</span>
                  <span className="text-[10px] lowercase font-normal opacity-70">(nervous system load)</span>
                </span>
                <span className="text-[10px] text-brand-mustard font-bold">High stress burns vitamins B &amp; C</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'high', icon: '⚡', label: 'High Stress', subtitle: 'Overwhelmed • Elevated adrenaline' },
                  { id: 'moderate', icon: '🌪️', label: 'Moderate Stress', subtitle: 'Daily work & family pressure' },
                  { id: 'low', icon: '🍃', label: 'Low Stress', subtitle: 'Calm & Grounded • Steady focus' },
                  { id: 'minimal', icon: '🧘', label: 'Zen Equilibrium', subtitle: 'Optimal vagal tone • Deep peace' },
                ].map((item) => (
                  <OptionCard
                    key={item.id}
                    icon={item.icon}
                    selected={inputs.stressLevel === item.id}
                    onClick={() => setInputs({ stressLevel: item.id as StressLevel })}
                  >
                    <div className="text-xs font-bold text-brand-forest">{item.label}</div>
                    <div className="text-[10px] text-brand-forest-muted mt-0.5 leading-snug">{item.subtitle}</div>
                  </OptionCard>
                ))}
              </div>
            </div>

            {/* Cooking Oil Usage */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-forest-muted mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span>🍳 Cooking Oil Usage</span>
                  <span className="text-[10px] lowercase font-normal opacity-70">(cellular inflammation)</span>
                </span>
                <span className="text-[10px] text-emerald-600 font-bold">Cold-pressed = zero oxidized trans-fats</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'heavy', icon: '🍟', label: 'Heavy Deep-Fry', subtitle: 'Daily deep-fry • High AGEs load' },
                  { id: 'moderate', icon: '🍳', label: 'Daily Tadka/Sauté', subtitle: 'Refined heated oils • Moderate' },
                  { id: 'minimal', icon: '🥗', label: 'Light / Steamed', subtitle: 'Minimal oil • Low inflammatory' },
                  { id: 'none', icon: '🥑', label: '100% Cold-Pressed', subtitle: 'Raw living omegas • Zero heating' },
                ].map((item) => (
                  <OptionCard
                    key={item.id}
                    icon={item.icon}
                    selected={inputs.oilUsage === item.id}
                    onClick={() => setInputs({ oilUsage: item.id as OilUsage })}
                  >
                    <div className="text-xs font-bold text-brand-forest">{item.label}</div>
                    <div className="text-[10px] text-brand-forest-muted mt-0.5 leading-snug">{item.subtitle}</div>
                  </OptionCard>
                ))}
              </div>
            </div>

            {/* Sugar Intake */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-forest-muted mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span>🍬 Sugar &amp; Processed Treats</span>
                  <span className="text-[10px] lowercase font-normal opacity-70">(glycation &amp; gut flora)</span>
                </span>
                <span className="text-[10px] text-brand-mustard font-bold">Natural fruit sugars nourish gut micro-flora</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'daily', icon: '🍩', label: 'Daily Sweets/Chai', subtitle: 'Refined sugar • High glycemic spikes' },
                  { id: 'few_weekly', icon: '🍪', label: 'Few Treats / Wk', subtitle: 'Occasional indulgence • Moderate' },
                  { id: 'rarely', icon: '🍓', label: 'Rarely', subtitle: 'Natural fruit sugars • Clean slow energy' },
                  { id: 'never', icon: '🌿', label: 'Zero Refined', subtitle: '100% clean • High metabolic clarity' },
                ].map((item) => (
                  <OptionCard
                    key={item.id}
                    icon={item.icon}
                    selected={inputs.sugarIntake === item.id}
                    onClick={() => setInputs({ sugarIntake: item.id as SugarIntake })}
                  >
                    <div className="text-xs font-bold text-brand-forest">{item.label}</div>
                    <div className="text-[10px] text-brand-forest-muted mt-0.5 leading-snug">{item.subtitle}</div>
                  </OptionCard>
                ))}
              </div>
            </div>

            {/* Meal Timing */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-forest-muted mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span>⏰ Meal Timing &amp; Circadian Sync</span>
                  <span className="text-[10px] lowercase font-normal opacity-70">(digestive clock)</span>
                </span>
                <span className="text-[10px] text-brand-mustard font-bold">Predictable meals align circadian rhythm</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'irregular', icon: '⏳', label: 'Irregular Times', subtitle: 'Skip meals • Late-night snacking' },
                  { id: 'mostly_regular', icon: '🕒', label: 'Mostly Regular', subtitle: 'Roughly consistent daily hours' },
                  { id: 'fixed_schedule', icon: '📅', label: 'Fixed Circadian', subtitle: 'Predictable digestive enzyme release' },
                  { id: 'intermittent_fasting', icon: '⌛', label: '16:8 IF Window', subtitle: 'Structured fasting & gut reset' },
                ].map((item) => (
                  <OptionCard
                    key={item.id}
                    icon={item.icon}
                    selected={inputs.mealTiming === item.id}
                    onClick={() => setInputs({ mealTiming: item.id as MealTiming })}
                  >
                    <div className="text-xs font-bold text-brand-forest">{item.label}</div>
                    <div className="text-[10px] text-brand-forest-muted mt-0.5 leading-snug">{item.subtitle}</div>
                  </OptionCard>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-3.5 rounded-2xl text-sm font-semibold border border-brand-border text-brand-forest-muted hover:bg-brand-cream transition-colors cursor-pointer"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="px-8 py-3.5 rounded-2xl font-bold text-sm bg-brand-mustard text-brand-forest hover:bg-brand-mustard-hover transition-all shadow-lg shadow-brand-mustard/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center gap-2"
              >
                <span>Next: Fresh Diet Habits</span>
                <span>→</span>
              </button>
            </div>
          </div>
        )}

        {/* ===== STEP 3: Diet Habits (Cooked vs Raw Visual Split) ===== */}
        {currentStep === 3 && (
          <div className="space-y-8 animate-fade-in-up">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-mustard/10 text-brand-mustard border border-brand-mustard/20 flex items-center gap-1.5">
                  <span>🥗 Step 3 of 5</span>
                  <span>·</span>
                  <span>Living Foods vs Heated Foods</span>
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black mt-3 text-brand-forest flex items-center gap-2">
                <span>How much living raw food do you eat?</span>
                <span className="text-xl sm:text-2xl">🌱</span>
              </h2>
              <p className="text-sm text-brand-forest-muted mt-1 leading-relaxed">
                Cooking foods above 48°C completely denatures delicate plant enzymes. Fresh fruits, sprouted seeds, and cold greens preserve active biophotons and gut enzymes.
              </p>
            </div>

            {/* Cooked vs Raw Visual Split Card */}
            <div className="rounded-3xl p-6 bg-brand-cream/40 border border-brand-border space-y-4">
              {/* Dual Visual Split Display */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Heated Cooked Side */}
                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    inputs.cookedFoodPercentage > 60
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-950'
                      : 'bg-brand-cream/60 border-brand-border text-brand-forest-muted'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">🔥🍲</span>
                      <div>
                        <span className="text-xs font-black uppercase tracking-wider block text-brand-forest">
                          Heated Cooked Diet
                        </span>
                        <span className="text-[10px] text-brand-forest-muted">
                          Roti, sabzi, fried, heated foods (&gt; 48°C)
                        </span>
                      </div>
                    </div>
                    <span className="text-2xl font-black font-mono text-amber-600">
                      {inputs.cookedFoodPercentage}%
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-brand-forest-muted">
                    {inputs.cookedFoodPercentage > 75
                      ? '⚠️ High heat denatures 85%+ of digestive enzymes and generates inflammatory Advanced Glycation End-products (AGEs).'
                      : inputs.cookedFoodPercentage > 50
                      ? '🍲 Standard modern diet. Cooking softens fiber but requires heavy pancreatic enzyme compensation.'
                      : '✅ Clean, moderate cooked food balance leaving ample metabolic space for living foods.'}
                  </p>
                </div>

                {/* Living Raw Superfoods Side */}
                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    100 - inputs.cookedFoodPercentage >= 40
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-950'
                      : 'bg-brand-cream/60 border-brand-border text-brand-forest-muted'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-emerald-500/40 shrink-0 shadow-sm">
                        <img
                          src="/nutrition-bowl.jpg"
                          alt="Living Raw Nutrition Bowl"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <span className="text-xs font-black uppercase tracking-wider block text-emerald-800">
                          Living Raw Nutrition
                        </span>
                        <span className="text-[10px] text-brand-forest-muted">
                          Sprouts, fruits, seeds, cold greens
                        </span>
                      </div>
                    </div>
                    <span className="text-2xl font-black font-mono text-emerald-600">
                      {100 - inputs.cookedFoodPercentage}%
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-brand-forest-muted">
                    {100 - inputs.cookedFoodPercentage >= 60
                      ? '🌟 Elite living diet: Active plant enzymes, structured cell water, and intact prebiotic gut fuel.'
                      : 100 - inputs.cookedFoodPercentage >= 30
                      ? '🌱 Good enzyme preservation. A daily living morning bowl will elevate you to peak metabolic clarity.'
                      : '🚨 Depleted enzyme intake. Pancreas must work overtime to break down denatured proteins.'}
                  </p>
                </div>
              </div>

              {/* Slider Input */}
              <div className="pt-2">
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={inputs.cookedFoodPercentage}
                  onChange={(e) => setInputs({ cookedFoodPercentage: Number(e.target.value) })}
                  className="w-full h-3 bg-brand-border rounded-lg appearance-none cursor-pointer accent-brand-mustard"
                />
                <div className="flex justify-between text-[11px] text-brand-forest-muted/70 mt-2 font-mono">
                  <span className="text-emerald-600 font-bold">0% (100% Fresh &amp; Raw 🥗)</span>
                  <span className="text-brand-forest-muted">50% Balanced Blend</span>
                  <span className="text-amber-600 font-bold">100% (Strictly Cooked 🔥)</span>
                </div>
              </div>
            </div>

            {/* Fruit Servings with Delicious Emoji Counters */}
            <div>
              <div className="flex justify-between items-center mb-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-forest-muted flex items-center gap-1.5">
                  <span>🍎 Fresh Fruit Servings (Daily)</span>
                  <span className="text-[10px] lowercase font-normal opacity-70">(1 serving = 1 whole fruit or 1 cup)</span>
                </label>
                <span className="text-[10px] text-brand-mustard font-bold">Rich in natural citrus &amp; berry ORAC antioxidants</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {[
                  { num: 0, emojis: '❌', label: '0 Bowls', sub: 'Zero fruit enzymes' },
                  { num: 1, emojis: '🍎', label: '1 Bowl', sub: 'Light morning boost' },
                  { num: 2, emojis: '🍎🍌', label: '2 Bowls', sub: 'Recommended baseline' },
                  { num: 3, emojis: '🍎🍌🍇', label: '3 Bowls', sub: 'High flavonoid shield' },
                  { num: 4, emojis: '🍎🍌🍇🍓', label: '4+ Bowls', sub: 'Maximum cellular hydration' },
                ].map((item) => (
                  <button
                    key={item.num}
                    type="button"
                    onClick={() => setInputs({ fruitServings: item.num })}
                    className={`py-3 px-2 rounded-2xl text-center font-bold text-sm transition-all border cursor-pointer ${
                      inputs.fruitServings === item.num
                        ? 'bg-brand-mustard/20 border-brand-mustard text-brand-forest shadow-md shadow-brand-mustard/15 ring-2 ring-brand-mustard/30'
                        : 'bg-brand-cream/60 border-brand-border/80 text-brand-forest-muted hover:bg-brand-cream hover:border-brand-mustard/40'
                    }`}
                  >
                    <div className="text-lg mb-1">{item.emojis}</div>
                    <div className="text-xs font-black text-brand-forest">{item.label}</div>
                    <div className="text-[10px] text-brand-forest-muted mt-0.5">{item.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Seeds & Sprouts */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-forest-muted mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span>🌱 Sprouted Seeds &amp; Microgreens Intake</span>
                  <span className="text-[10px] lowercase font-normal opacity-70">(living plant protein &amp; zinc)</span>
                </span>
                <span className="text-[10px] text-emerald-600 font-bold">Sprouting increases enzymes by up to 800%</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'rarely', icon: '🌰', label: 'Rarely', subtitle: '< 1x per week • Low plant zinc' },
                  { id: 'weekly', icon: '🥣', label: '1–2x Weekly', subtitle: 'Occasional soaked seeds' },
                  { id: 'daily', icon: '🌿', label: 'Daily Boost', subtitle: 'Chia, flax, sprouted moong' },
                  { id: 'multiple_daily', icon: '🌱', label: 'Living Power', subtitle: 'Sprouts & microgreens protocol' },
                ].map((item) => (
                  <OptionCard
                    key={item.id}
                    icon={item.icon}
                    selected={inputs.seedFrequency === item.id}
                    onClick={() => setInputs({ seedFrequency: item.id as SeedFrequency })}
                  >
                    <div className="text-xs font-bold text-brand-forest">{item.label}</div>
                    <div className="text-[10px] text-brand-forest-muted mt-0.5 leading-snug">{item.subtitle}</div>
                  </OptionCard>
                ))}
              </div>
            </div>

            {/* Raw Veggies & Crisp Greens */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-forest-muted mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span>🥗 Raw Veggies &amp; Crisp Greens</span>
                  <span className="text-[10px] lowercase font-normal opacity-70">(microbiome prebiotic roughage)</span>
                </span>
                <span className="text-[10px] text-brand-mustard font-bold">Uncooked cell walls feed healthy gut flora</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'rarely', icon: '🫑', label: 'Minimal', subtitle: 'Cooked sabzi only' },
                  { id: 'daily_salad', icon: '🥒', label: '1 Salad / Day', subtitle: 'Cucumber & tomato crunch' },
                  { id: 'multiple_daily', icon: '🥗', label: '2 Salads Daily', subtitle: 'Rainbow salad spectrum' },
                  { id: 'heavy_raw_greens', icon: '🥬', label: 'Living Heavy', subtitle: 'Cruciferous & microgreens' },
                ].map((item) => (
                  <OptionCard
                    key={item.id}
                    icon={item.icon}
                    selected={inputs.veggieFrequency === item.id}
                    onClick={() => setInputs({ veggieFrequency: item.id as VeggieFrequency })}
                  >
                    <div className="text-xs font-bold text-brand-forest">{item.label}</div>
                    <div className="text-[10px] text-brand-forest-muted mt-0.5 leading-snug">{item.subtitle}</div>
                  </OptionCard>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-3.5 rounded-2xl text-sm font-semibold border border-brand-border text-brand-forest-muted hover:bg-brand-cream transition-colors cursor-pointer"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="px-8 py-3.5 rounded-2xl font-bold text-sm bg-brand-mustard text-brand-forest hover:bg-brand-mustard-hover transition-all shadow-lg shadow-brand-mustard/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center gap-2"
              >
                <span>Analyze My Vitality Profile</span>
                <span>✨</span>
              </button>
            </div>
          </div>
        )}

        {/* ===== STEP 4: Vitality Dashboard ===== */}
        {currentStep === 4 && results && (
          <div className="space-y-8 animate-fade-in-up">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-mustard/10 text-brand-mustard border border-brand-mustard/20 flex items-center gap-1.5">
                  <span>🧬 Step 4 of 5</span>
                  <span>·</span>
                  <span>Real-Time Vitality Dashboard</span>
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black mt-3 text-brand-forest flex items-center gap-2">
                <span>Your Living Food Vitality Score</span>
                <span className="text-xl sm:text-2xl">🌟</span>
              </h2>
              <p className="text-sm text-brand-forest-muted mt-1 leading-relaxed">
                Calibrated against 10 lifestyle, hydration, sleep, and dietary factors for biological precision.
              </p>
            </div>

            {/* Celebratory Cellular Status Banner */}
            {results.biologicalDietAgeDelta <= 0 ? (
              <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-950 flex items-center gap-3.5 shadow-sm">
                <span className="text-3xl shrink-0">🧬✨</span>
                <div>
                  <h4 className="text-sm font-black text-emerald-900 flex items-center gap-2">
                    <span>Cellular Rejuvenation Active!</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-600 text-white">Optimal Tier</span>
                  </h4>
                  <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                    Your fresh living diet keeps your biological cells{' '}
                    <strong>{Math.abs(results.biologicalDietAgeDelta)} years younger</strong> than your chronological calendar age!
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-950 flex items-center gap-3.5 shadow-sm">
                <span className="text-3xl shrink-0">⏳⚠️</span>
                <div>
                  <h4 className="text-sm font-black text-amber-900 flex items-center gap-2">
                    <span>Metabolic Heat Stress Detected</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-600 text-white">Reversible</span>
                  </h4>
                  <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                    Heated cooking and lifestyle factors add{' '}
                    <strong>+{results.biologicalDietAgeDelta} biological years</strong> to your cellular age. Reversible in 21 mornings with living foods!
                  </p>
                </div>
              </div>
            )}

            {/* Circular Gauge & Age Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* SVG Circular Gauge */}
              <div className="md:col-span-6 flex flex-col items-center justify-center p-6 rounded-3xl bg-brand-cream/40 border border-brand-border shadow-inner">
                <div className="relative w-48 h-48 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                    <circle cx="80" cy="80" r={radius} stroke="#e5ddd0" strokeWidth="12" fill="transparent" />
                    <circle
                      cx="80"
                      cy="80"
                      r={radius}
                      stroke={results.vitalityTier.color}
                      strokeWidth="12"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center text-center">
                    <span className="text-4xl font-black font-mono text-brand-forest tracking-tight">
                      {results.livingFoodVitalityScore}%
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-brand-forest-muted mt-1">
                      Vitality Index
                    </span>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs font-bold"
                    style={{
                      backgroundColor: `${results.vitalityTier.color}20`,
                      color: results.vitalityTier.color,
                      border: `1px solid ${results.vitalityTier.color}40`,
                    }}
                  >
                    {results.vitalityTier.label}
                  </span>
                  <p className="text-xs text-brand-forest-muted mt-2 max-w-xs leading-relaxed">
                    {results.vitalityTier.description}
                  </p>
                </div>
              </div>

              {/* Age + Energy + Macro Breakdown */}
              <div className="md:col-span-6 space-y-4">
                {/* Age Comparison Card */}
                <div className="p-5 rounded-2xl bg-brand-cream/40 border border-brand-border">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-forest-muted block mb-2 flex items-center gap-1.5">
                    <span>🧬 Biological Diet Age vs Chronological Age</span>
                  </span>
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-brand-forest-muted">Chronological Age:</span>
                      <span className="font-bold text-brand-forest font-mono">{results.chronologicalAge} yrs</span>
                    </div>
                    <div className="w-full h-2.5 bg-brand-cream rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-border rounded-full"
                        style={{ width: `${Math.min(100, (results.chronologicalAge / 80) * 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs pt-1">
                      <span className="text-brand-forest-muted">Biological Diet Age:</span>
                      <span
                        className="font-bold font-mono"
                        style={{ color: results.biologicalDietAgeDelta > 0 ? '#F87171' : '#34D399' }}
                      >
                        {results.biologicalDietAge} yrs ({results.biologicalDietAgeDelta > 0 ? `+${results.biologicalDietAgeDelta} older` : `${results.biologicalDietAgeDelta} younger`})
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-brand-cream rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.min(100, (results.biologicalDietAge / 80) * 100)}%`,
                          background:
                            results.biologicalDietAgeDelta > 0
                              ? 'linear-gradient(90deg, #F59E0B, #EF4444)'
                              : 'linear-gradient(90deg, #10B981, #34D399)',
                        }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-brand-forest-muted leading-relaxed">
                    {results.biologicalDietAgeDelta > 0
                      ? 'High cooked food and lifestyle stressors accelerate cellular glycation and enzyme depletion.'
                      : 'Your living food intake and healthy habits protect mitochondrial function and cellular DNA integrity.'}
                  </p>
                </div>

                {/* Energy Target */}
                <div className="p-5 rounded-2xl bg-brand-cream/40 border border-brand-border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-forest-muted flex items-center gap-1.5">
                      <span>⚡ Daily Energy Baseline</span>
                    </span>
                    <span className="text-xs text-brand-forest-muted font-mono">TDEE: {results.tdee} kcal</span>
                  </div>
                  <div className="text-2xl font-black text-brand-mustard font-mono">
                    {results.targetBlooms.calories} kcal / day
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-brand-border text-center">
                    <div>
                      <span className="text-[10px] text-brand-forest-muted uppercase font-semibold block">💪 Protein</span>
                      <p className="text-xs font-bold text-blue-500 font-mono mt-0.5">{results.targetBlooms.protein}g</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-brand-forest-muted uppercase font-semibold block">🍞 Carbs</span>
                      <p className="text-xs font-bold text-brand-mustard font-mono mt-0.5">{results.targetBlooms.carbs}g</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-brand-forest-muted uppercase font-semibold block">🥑 Fats</span>
                      <p className="text-xs font-bold text-emerald-600 font-mono mt-0.5">{results.targetBlooms.fats}g</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-brand-forest-muted uppercase font-semibold block">🌾 Fiber</span>
                      <p className="text-xs font-bold text-purple-500 font-mono mt-0.5">{results.targetBlooms.fiber}g</p>
                    </div>
                  </div>
                </div>

                {/* Living Food Fresh Patna Delivery Spotlight */}
                <div className="p-4 rounded-2xl bg-brand-cream/50 border border-brand-border flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-brand-border shadow-sm">
                    <img
                      src="/hero-patna-bowl.jpg"
                      alt="Living Raw Bowl"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-mustard block">
                      🌅 Patna Living Nutrition
                    </span>
                    <h5 className="text-xs font-black text-brand-forest">Cold-Crafted Before Sunrise</h5>
                    <p className="text-[11px] text-brand-forest-muted mt-0.5">
                      Delivered between 6:00 AM – 9:00 AM with active living enzymes intact.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Lifestyle Impact Breakdown */}
            <div className="rounded-2xl p-5 bg-brand-cream/40 border border-brand-border">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-forest-muted mb-4 flex items-center gap-1.5">
                <span>📊 Factor-by-Factor Vitality Breakdown</span>
              </h3>
              <div className="space-y-3">
                {results.lifestyleBreakdown.map((factor) => (
                  <div key={factor.label}>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-semibold text-brand-forest">{factor.label}</span>
                      <span
                        className="font-bold font-mono"
                        style={{
                          color:
                            factor.status === 'excellent'
                              ? '#10B981'
                              : factor.status === 'good'
                              ? '#34D399'
                              : factor.status === 'fair'
                              ? '#F59E0B'
                              : '#EF4444',
                        }}
                      >
                        {factor.score}/{factor.maxScore}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-brand-cream rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${factor.percentage}%`,
                          background:
                            factor.status === 'excellent'
                              ? '#10B981'
                              : factor.status === 'good'
                              ? '#34D399'
                              : factor.status === 'fair'
                              ? '#F59E0B'
                              : '#EF4444',
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-brand-forest-muted/80 mt-0.5">{factor.tip}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-3.5 rounded-2xl text-sm font-semibold border border-brand-border text-brand-forest-muted hover:bg-brand-cream transition-colors cursor-pointer"
              >
                ← Adjust Habits
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="px-8 py-3.5 rounded-2xl font-bold text-sm bg-brand-mustard text-brand-forest hover:bg-brand-mustard-hover transition-all shadow-lg shadow-brand-mustard/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center gap-2"
              >
                <span>View Diet Comparison &amp; Solution</span>
                <span>→</span>
              </button>
            </div>
          </div>
        )}

        {/* ===== STEP 5: Diet Comparison Matrix & Recommendation ===== */}
        {currentStep === 5 && results && (
          <div className="space-y-8 animate-fade-in-up">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-mustard/10 text-brand-mustard border border-brand-mustard/20 flex items-center gap-1.5">
                  <span>✨ Step 5 of 5</span>
                  <span>·</span>
                  <span>Diet Comparison &amp; Targeted Solution</span>
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black mt-3 text-brand-forest flex items-center gap-2">
                <span>Current Diet vs. Optimal Living Target</span>
                <span className="text-xl sm:text-2xl">🌱</span>
              </h2>
              <p className="text-sm text-brand-forest-muted mt-1 leading-relaxed">
                Evaluate the cellular gap between your current habits and an enzymatically alive diet.
              </p>
            </div>

            {/* Side-by-Side Comparison */}
            <div className="rounded-2xl overflow-hidden border border-brand-border bg-brand-cream/60">
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-brand-border">
                {/* Current Diet Column */}
                <div className="p-6 bg-red-50/30">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl">⚠️</span>
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-red-600">
                        Your Current Profile
                      </h3>
                      <p className="text-xs text-brand-forest-muted">Estimated based on your habits</p>
                    </div>
                  </div>
                  <div className="space-y-3.5 text-xs">
                    {[
                      { icon: '🥗', label: 'Raw vs Cooked Balance', value: results.dietComparison.currentDiet.rawCookedRatio },
                      { icon: '🧬', label: 'Active Digestive Enzymes', value: results.dietComparison.currentDiet.activeDigestiveEnzymes },
                      { icon: '🌾', label: 'Estimated Daily Fiber', value: `${results.dietComparison.currentDiet.estimatedDailyFiber}g / day` },
                      { icon: '🛡️', label: 'Antioxidant Capacity', value: results.dietComparison.currentDiet.antioxidantCapacity },
                      { icon: '🐢', label: 'Digestion & Transit Time', value: results.dietComparison.currentDiet.digestionTransitTime },
                      { icon: '🔥', label: 'Inflammatory Risk', value: results.dietComparison.currentDiet.inflammatoryLoad },
                      { icon: '😴', label: 'Sleep Recovery', value: results.dietComparison.currentDiet.sleepRecoveryPotential },
                      { icon: '🍳', label: 'Inflammatory Oil Load', value: results.dietComparison.currentDiet.inflammatoryOilLoad },
                    ].map((row, i) => (
                      <div key={i} className={`flex justify-between items-center py-1.5 ${i < 7 ? 'border-b border-brand-border/80' : ''}`}>
                        <span className="text-brand-forest-muted flex items-center gap-1.5">
                          <span>{row.icon}</span>
                          <span>{row.label}:</span>
                        </span>
                        <span className="font-bold text-brand-forest text-right max-w-[55%]">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Optimal Living Diet Column */}
                <div className="p-6 bg-emerald-50/30">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl">✨</span>
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-emerald-800">
                        Optimal Living Target
                      </h3>
                      <p className="text-xs text-brand-forest-muted">Thebloomaa cellular nutrition standard</p>
                    </div>
                  </div>
                  <div className="space-y-3.5 text-xs">
                    {[
                      { icon: '🥗', label: 'Raw vs Cooked Balance', value: results.dietComparison.optimalDiet.rawCookedRatio },
                      { icon: '🧬', label: 'Active Digestive Enzymes', value: results.dietComparison.optimalDiet.activeDigestiveEnzymes },
                      { icon: '🌾', label: 'Estimated Daily Fiber', value: `${results.dietComparison.optimalDiet.estimatedDailyFiber}g (Prebiotic)` },
                      { icon: '🛡️', label: 'Antioxidant Capacity', value: results.dietComparison.optimalDiet.antioxidantCapacity },
                      { icon: '🚀', label: 'Digestion & Transit Time', value: results.dietComparison.optimalDiet.digestionTransitTime },
                      { icon: '🌿', label: 'Inflammatory Risk', value: results.dietComparison.optimalDiet.inflammatoryLoad },
                      { icon: '🛌', label: 'Sleep Recovery', value: results.dietComparison.optimalDiet.sleepRecoveryPotential },
                      { icon: '🥑', label: 'Inflammatory Oil Load', value: results.dietComparison.optimalDiet.inflammatoryOilLoad },
                    ].map((row, i) => (
                      <div key={i} className={`flex justify-between items-center py-1.5 ${i < 7 ? 'border-b border-brand-border/80' : ''}`}>
                        <span className="text-brand-forest-muted flex items-center gap-1.5">
                          <span>{row.icon}</span>
                          <span>{row.label}:</span>
                        </span>
                        <span className="font-bold text-emerald-800 text-right max-w-[55%]">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Actionable Swaps */}
            <div className="rounded-2xl p-5 bg-brand-cream/40 border border-brand-border">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-forest-muted mb-4 flex items-center gap-1.5">
                <span>🔄 Personalized Action Plan</span>
                <span className="text-[10px] text-brand-mustard font-bold">• 6 Recommended Micro-Swaps</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {results.actionableSwaps.map((swap, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-brand-card border border-brand-border/60 shadow-sm">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-mustard block">
                      {swap.category}
                    </span>
                    <p className="text-xs text-brand-forest mt-1 leading-relaxed">{swap.tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Matched Product Recommendation */}
            <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-brand-card via-brand-cream to-brand-cream border-2 border-brand-mustard/60 shadow-2xl relative overflow-hidden">
              <div className="absolute top-3 right-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-mustard text-brand-forest shadow-sm">
                Targeted Living Solution
              </div>

              <div className="flex flex-col md:flex-row gap-6 items-center">
                {/* Polaroid Bowl Presentation */}
                <div className="w-full md:w-52 h-52 rounded-2xl overflow-hidden relative flex-shrink-0 bg-brand-cream border-2 border-brand-border shadow-md">
                  <img
                    src={results.matchedProduct.imageUrl}
                    alt={results.matchedProduct.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-brand-card/90 backdrop-blur-sm text-[11px] font-black text-brand-forest border border-brand-border">
                    🔥 {results.matchedProduct.calories} kcal
                  </div>
                </div>

                <div className="flex-grow text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <span className="text-xs font-bold text-brand-mustard uppercase tracking-wider">
                      Recommended Protocol
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-800">
                      🌅 Fresh Patna Morning Prep
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-brand-forest mt-1">
                    {results.matchedProduct.name}
                  </h3>
                  <p className="text-xs text-brand-forest-muted mt-2 leading-relaxed">
                    {results.matchedProduct.reason}
                  </p>

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3 text-xs">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-700 font-bold font-mono">
                      💪 {results.matchedProduct.protein}g Protein
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-brand-mustard/15 text-brand-forest font-bold font-mono">
                      🍞 {results.matchedProduct.carbs}g Carbs
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-800 font-bold font-mono">
                      🥑 {results.matchedProduct.fats}g Fats
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-700 font-bold font-mono">
                      🌾 Living Enzymes Intact
                    </span>
                    <span className="font-black text-sm text-brand-forest font-mono">
                      Price: TBA
                    </span>
                  </div>

                  {results.matchedProduct.logisticsNote && (
                    <div className="mt-3 p-2.5 rounded-xl bg-brand-mustard/10 border border-brand-mustard/30 text-[11px] text-brand-forest-muted text-left">
                      <strong>Logistics Protocol: </strong>{results.matchedProduct.logisticsNote}
                    </div>
                  )}

                  <div className="mt-2.5 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-900 text-left">
                    <span className="font-bold">🌱 Fresh Nutrition Tip: </span>{results.matchedProduct.livingFoodSynergyTip}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-brand-border flex flex-col sm:flex-row gap-3 items-center justify-between">
                <button
                  type="button"
                  onClick={() => goToStep(1)}
                  className="text-xs font-semibold text-brand-forest-muted hover:text-brand-forest transition-colors cursor-pointer"
                >
                  ↺ Recalculate with different inputs
                </button>
                <button
                  type="button"
                  onClick={handleSelectPlanAndOrder}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-sm bg-brand-mustard text-brand-forest hover:bg-brand-mustard-hover transition-all shadow-xl shadow-brand-mustard/25 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Select This Plan &amp; Pre-Book</span>
                  <span>→</span>
                </button>
              </div>
            </div>

            {/* Trial Plan Weekly Showcase */}
            <div className="pt-4">
              <TrialPlanShowcase />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
