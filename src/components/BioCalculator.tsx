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

const HEALTH_GOALS: { id: HealthGoal; title: string; icon: string; subtitle: string }[] = [
  { id: 'WEIGHT_LOSS', title: 'Weight Loss', icon: '🔥', subtitle: 'Metabolic deficit & living fiber' },
  { id: 'LEAN_MUSCLE', title: 'Lean Muscle', icon: '💪', subtitle: 'Clean high protein & recovery' },
  { id: 'GUT_HEALTH', title: 'Gut Reset & Enzymes', icon: '🌱', subtitle: 'Live enzymes & prebiotic micro-flora' },
  { id: 'LONGEVITY_DETOX', title: 'Longevity & Detox', icon: '🧬', subtitle: 'Cellular autophagy & high ORAC' },
  { id: 'ENERGY_VITALITY', title: 'All-Day Vitality', icon: '⚡', subtitle: 'Steady glycemic release & hydration' },
];

// Reusable card selector component
function OptionCard({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-3 rounded-2xl text-left transition-all border cursor-pointer ${
        selected
          ? 'bg-brand-mustard/20 border-brand-mustard text-brand-mustard-hover shadow-sm shadow-brand-mustard/10'
          : 'bg-brand-cream/60 border-brand-border/80 text-brand-forest-muted hover:bg-brand-cream'
      }`}
    >
      {children}
    </button>
  );
}

export default function BioCalculator() {
  const router = useRouter();
  const { inputs, setInputs, currentStep, nextStep, prevStep, goToStep, results, calculate } = useBioCalcStore();
  const { selectProduct } = useBundleStore();

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
    router.push('/checkout');
  };

  // Circular gauge calculations
  const vitalityScore = results ? results.livingFoodVitalityScore : 50;
  const radius = 74;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * vitalityScore) / 100;

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
            { step: 1, label: 'Profile' },
            { step: 2, label: 'Lifestyle' },
            { step: 3, label: 'Diet Habits' },
            { step: 4, label: 'Vitality' },
            { step: 5, label: 'Comparison' },
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
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 ${
                    isActive
                      ? 'bg-brand-mustard text-brand-forest ring-4 ring-brand-mustard/20 scale-110 shadow-lg shadow-brand-mustard/30'
                      : isCompleted
                      ? 'bg-brand-mustard-hover text-brand-forest'
                      : 'bg-brand-cream text-brand-forest-muted group-hover:bg-brand-border'
                  }`}
                >
                  {isCompleted ? '✓' : s.step}
                </div>
                <span
                  className={`text-[10px] font-semibold mt-2 transition-colors ${
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
      <div className="rounded-3xl p-6 sm:p-10 relative overflow-hidden backdrop-blur-xl bg-brand-card/85 border border-brand-border shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-mustard/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-brand-mustard/10 rounded-full blur-3xl pointer-events-none" />

        {/* ===== STEP 1: Biological Profile & Health Goals ===== */}
        {currentStep === 1 && (
          <div className="space-y-8 animate-fade-in-up">
            <div>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-mustard/10 text-brand-mustard border border-brand-mustard/20">
                Step 1 of 5 · Biological Baselines
              </span>
              <h2 className="text-2xl sm:text-3xl font-black mt-3 text-brand-forest">
                Tell us about your body &amp; goal
              </h2>
              <p className="text-sm text-brand-forest-muted mt-1">
                We calibrate your basal metabolic expenditure (Mifflin-St Jeor) and cellular nutritional targets.
              </p>
            </div>

            {/* Gender Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-forest-muted mb-3">
                Biological Gender
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'male', label: 'Male', icon: '👨' },
                  { id: 'female', label: 'Female', icon: '👩' },
                  { id: 'other', label: 'Non-Binary', icon: '✨' },
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setInputs({ gender: g.id as Gender })}
                    className={`py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm transition-all border ${
                      inputs.gender === g.id
                        ? 'bg-brand-mustard/15 border-brand-mustard text-brand-mustard-hover shadow-sm shadow-brand-mustard/20'
                        : 'bg-brand-cream/60 border-brand-border/80 text-brand-forest-muted hover:bg-brand-cream'
                    }`}
                  >
                    <span>{g.icon}</span>
                    <span>{g.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Age Slider */}
            <div className="rounded-2xl p-5 bg-brand-cream/40 border border-brand-border">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-forest-muted">
                  Chronological Age
                </label>
                <span className="text-xl font-black text-brand-mustard font-mono">
                  {inputs.age} <span className="text-xs text-brand-forest-muted">years</span>
                </span>
              </div>
              <input
                type="range"
                min={18}
                max={80}
                value={inputs.age}
                onChange={(e) => setInputs({ age: Number(e.target.value) })}
                className="w-full h-2 bg-brand-border rounded-lg appearance-none cursor-pointer accent-brand-mustard"
              />
              <div className="flex justify-between text-[11px] text-brand-forest-muted/70 mt-1 font-mono">
                <span>18 yrs</span>
                <span>45 yrs</span>
                <span>80 yrs</span>
              </div>
            </div>

            {/* Health Goal Cards */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-forest-muted mb-3">
                Primary Health Goal
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {HEALTH_GOALS.map((goal) => {
                  const isSelected = inputs.healthGoal === goal.id;
                  return (
                    <button
                      key={goal.id}
                      type="button"
                      onClick={() => setInputs({ healthGoal: goal.id })}
                      className={`p-4 rounded-2xl text-left transition-all border ${
                        isSelected
                          ? 'bg-brand-mustard/15 border-brand-mustard shadow-md shadow-brand-mustard/10'
                          : 'bg-brand-cream/50 border-brand-border hover:bg-brand-cream/90 text-brand-forest-muted'
                      }`}
                    >
                      <div className="text-2xl mb-2">{goal.icon}</div>
                      <h4 className={`text-sm font-bold ${isSelected ? 'text-brand-mustard-hover' : 'text-brand-forest'}`}>
                        {goal.title}
                      </h4>
                      <p className="text-xs text-brand-forest-muted mt-1 leading-relaxed">{goal.subtitle}</p>
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
                className="w-full flex items-center justify-between text-xs font-semibold text-brand-forest-muted hover:text-brand-mustard transition-colors"
              >
                <span>⚙️ Precise Body Metrics (Optional Height, Weight &amp; Waist)</span>
                <span className="text-brand-forest-muted/70">{showAdvancedBody ? '▲ Hide' : '▼ Expand'}</span>
              </button>

              {showAdvancedBody && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-brand-border/80">
                  <div>
                    <label className="block text-xs text-brand-forest-muted mb-1 font-medium">Body Weight (kg)</label>
                    <input
                      type="number"
                      placeholder="e.g. 70"
                      value={inputs.weight || ''}
                      onChange={(e) => setInputs({ weight: Number(e.target.value) || undefined })}
                      className="w-full px-4 py-2.5 rounded-xl bg-brand-cream border border-brand-border text-sm text-brand-forest focus:outline-none focus:border-brand-mustard font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-brand-forest-muted mb-1 font-medium">Height (cm)</label>
                    <input
                      type="number"
                      placeholder="e.g. 175"
                      value={inputs.height || ''}
                      onChange={(e) => setInputs({ height: Number(e.target.value) || undefined })}
                      className="w-full px-4 py-2.5 rounded-xl bg-brand-cream border border-brand-border text-sm text-brand-forest focus:outline-none focus:border-brand-mustard font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-brand-forest-muted mb-1 font-medium">Waist (cm)</label>
                    <input
                      type="number"
                      placeholder="e.g. 82"
                      value={inputs.waistCircumference || ''}
                      onChange={(e) => setInputs({ waistCircumference: Number(e.target.value) || undefined })}
                      className="w-full px-4 py-2.5 rounded-xl bg-brand-cream border border-brand-border text-sm text-brand-forest focus:outline-none focus:border-brand-mustard font-mono"
                    />
                    <p className="text-[10px] text-brand-forest-muted/60 mt-1">For Waist-to-Height risk ratio</p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button type="button" onClick={nextStep} className="px-8 py-3.5 rounded-2xl font-bold text-sm bg-brand-mustard text-brand-forest hover:bg-brand-mustard transition-all shadow-lg shadow-brand-mustard/20 hover:scale-[1.02] active:scale-[0.98]">
                Next: Lifestyle →
              </button>
            </div>
          </div>
        )}

        {/* ===== STEP 2: Lifestyle & Habits (NEW) ===== */}
        {currentStep === 2 && (
          <div className="space-y-7 animate-fade-in-up">
            <div>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-mustard/10 text-brand-mustard border border-brand-mustard/20">
                Step 2 of 5 · Lifestyle & Habits
              </span>
              <h2 className="text-2xl sm:text-3xl font-black mt-3 text-brand-forest">
                Your daily lifestyle habits
              </h2>
              <p className="text-sm text-brand-forest-muted mt-1">
                Sleep, stress, water, and cooking habits significantly impact biological aging and enzyme health.
              </p>
            </div>

            {/* Water Intake */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-forest-muted mb-2">
                💧 Daily Water Intake
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {([
                  { id: 'very_low', label: '< 4 glasses', subtitle: 'Often dehydrated' },
                  { id: 'low', label: '4-6 glasses', subtitle: 'Below recommended' },
                  { id: 'adequate', label: '6-8 glasses', subtitle: 'Adequate hydration' },
                  { id: 'optimal', label: '8+ glasses', subtitle: 'Optimal cellular function' },
                ] as const).map((item) => (
                  <OptionCard key={item.id} selected={inputs.waterIntake === item.id} onClick={() => setInputs({ waterIntake: item.id as WaterIntake })}>
                    <div className="text-xs font-bold text-brand-forest">{item.label}</div>
                    <div className="text-[10px] text-brand-forest-muted mt-0.5">{item.subtitle}</div>
                  </OptionCard>
                ))}
              </div>
            </div>

            {/* Sleep Quality */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-forest-muted mb-2">
                😴 Sleep Quality
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {([
                  { id: 'poor', label: 'Poor', subtitle: '< 5 hrs / restless' },
                  { id: 'average', label: 'Average', subtitle: '5-7 hrs / okay' },
                  { id: 'good', label: 'Good', subtitle: '7-8 hrs / restful' },
                  { id: 'excellent', label: 'Excellent', subtitle: '8+ hrs / deep sleep' },
                ] as const).map((item) => (
                  <OptionCard key={item.id} selected={inputs.sleepQuality === item.id} onClick={() => setInputs({ sleepQuality: item.id as SleepQuality })}>
                    <div className="text-xs font-bold text-brand-forest">{item.label}</div>
                    <div className="text-[10px] text-brand-forest-muted mt-0.5">{item.subtitle}</div>
                  </OptionCard>
                ))}
              </div>
            </div>

            {/* Stress Level */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-forest-muted mb-2">
                🧘 Stress Level
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {([
                  { id: 'high', label: 'High', subtitle: 'Constantly overwhelmed' },
                  { id: 'moderate', label: 'Moderate', subtitle: 'Some daily pressure' },
                  { id: 'low', label: 'Low', subtitle: 'Generally relaxed' },
                  { id: 'minimal', label: 'Minimal', subtitle: 'Very calm & balanced' },
                ] as const).map((item) => (
                  <OptionCard key={item.id} selected={inputs.stressLevel === item.id} onClick={() => setInputs({ stressLevel: item.id as StressLevel })}>
                    <div className="text-xs font-bold text-brand-forest">{item.label}</div>
                    <div className="text-[10px] text-brand-forest-muted mt-0.5">{item.subtitle}</div>
                  </OptionCard>
                ))}
              </div>
            </div>

            {/* Oil Usage */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-forest-muted mb-2">
                🍳 Cooking Oil Usage
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {([
                  { id: 'heavy', label: 'Heavy', subtitle: 'Deep fry daily' },
                  { id: 'moderate', label: 'Moderate', subtitle: 'Light fry / tadka' },
                  { id: 'minimal', label: 'Minimal', subtitle: 'Steamed / boiled' },
                  { id: 'none', label: 'No Oil', subtitle: 'Raw / cold-pressed' },
                ] as const).map((item) => (
                  <OptionCard key={item.id} selected={inputs.oilUsage === item.id} onClick={() => setInputs({ oilUsage: item.id as OilUsage })}>
                    <div className="text-xs font-bold text-brand-forest">{item.label}</div>
                    <div className="text-[10px] text-brand-forest-muted mt-0.5">{item.subtitle}</div>
                  </OptionCard>
                ))}
              </div>
            </div>

            {/* Sugar Intake */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-forest-muted mb-2">
                🍬 Sugar &amp; Processed Food
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {([
                  { id: 'daily', label: 'Daily', subtitle: 'Chai + sweets daily' },
                  { id: 'few_weekly', label: 'Few/Week', subtitle: 'Occasional treats' },
                  { id: 'rarely', label: 'Rarely', subtitle: 'Once in a while' },
                  { id: 'never', label: 'Never', subtitle: 'Zero processed sugar' },
                ] as const).map((item) => (
                  <OptionCard key={item.id} selected={inputs.sugarIntake === item.id} onClick={() => setInputs({ sugarIntake: item.id as SugarIntake })}>
                    <div className="text-xs font-bold text-brand-forest">{item.label}</div>
                    <div className="text-[10px] text-brand-forest-muted mt-0.5">{item.subtitle}</div>
                  </OptionCard>
                ))}
              </div>
            </div>

            {/* Meal Timing */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-forest-muted mb-2">
                ⏰ Meal Timing Regularity
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {([
                  { id: 'irregular', label: 'Irregular', subtitle: 'Skip meals often' },
                  { id: 'mostly_regular', label: 'Mostly Regular', subtitle: 'Roughly same times' },
                  { id: 'fixed_schedule', label: 'Fixed Schedule', subtitle: 'Same times daily' },
                  { id: 'intermittent_fasting', label: 'IF / Fasting', subtitle: 'Structured window' },
                ] as const).map((item) => (
                  <OptionCard key={item.id} selected={inputs.mealTiming === item.id} onClick={() => setInputs({ mealTiming: item.id as MealTiming })}>
                    <div className="text-xs font-bold text-brand-forest">{item.label}</div>
                    <div className="text-[10px] text-brand-forest-muted mt-0.5">{item.subtitle}</div>
                  </OptionCard>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-between">
              <button type="button" onClick={prevStep} className="px-6 py-3.5 rounded-2xl text-sm font-semibold border border-brand-border text-brand-forest-muted hover:bg-brand-cream transition-colors">← Back</button>
              <button type="button" onClick={nextStep} className="px-8 py-3.5 rounded-2xl font-bold text-sm bg-brand-mustard text-brand-forest hover:bg-brand-mustard transition-all shadow-lg shadow-brand-mustard/20 hover:scale-[1.02] active:scale-[0.98]">
                Next: Diet Habits →
              </button>
            </div>
          </div>
        )}

        {/* ===== STEP 3: Diet Habits (Cooked vs Raw) ===== */}
        {currentStep === 3 && (
          <div className="space-y-8 animate-fade-in-up">
            <div>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-mustard/10 text-brand-mustard border border-brand-mustard/20">
                Step 3 of 5 · Fresh &amp; Raw Food Intake
              </span>
              <h2 className="text-2xl sm:text-3xl font-black mt-3 text-brand-forest">
                How much fresh &amp; raw food do you eat?
              </h2>
              <p className="text-sm text-brand-forest-muted mt-1">
                Cooking at high heat removes natural digestive enzymes. Fresh fruits, sprouted seeds, and raw salads keep them intact.
              </p>
            </div>

            {/* Cooked Food % Slider */}
            <div className="rounded-2xl p-6 bg-brand-cream/40 border border-brand-border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-brand-forest-muted">Daily Cooked Food Intake</label>
                  <p className="text-xs text-brand-forest-muted mt-0.5">Percentage of your daily diet cooked at high heat (roti, rice, gravies, fried foods).</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-brand-mustard font-mono">{inputs.cookedFoodPercentage}%</span>
                  <span className="text-xs text-brand-forest-muted block">({100 - inputs.cookedFoodPercentage}% Fresh &amp; Raw)</span>
                </div>
              </div>
              <input type="range" min={0} max={100} step={5} value={inputs.cookedFoodPercentage} onChange={(e) => setInputs({ cookedFoodPercentage: Number(e.target.value) })} className="w-full h-3 bg-brand-border rounded-lg appearance-none cursor-pointer accent-brand-mustard" />
              <div className="flex justify-between text-[11px] text-brand-forest-muted/70 mt-2 font-mono">
                <span className="text-brand-mustard">0% (100% Fresh &amp; Raw)</span>
                <span>50% Balanced</span>
                <span className="text-red-400">100% (Strictly Cooked)</span>
              </div>
            </div>

            {/* Fruit Servings */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-forest-muted">🍎 Fresh Fruit Servings (Daily)</label>
                <span className="text-xs text-brand-forest-muted">1 serving = 1 cup or whole fruit</span>
              </div>
              <div className="grid grid-cols-5 gap-2.5">
                {[0, 1, 2, 3, 4].map((num) => (
                  <button
                    key={num} type="button" onClick={() => setInputs({ fruitServings: num })}
                    className={`py-3 rounded-2xl font-bold text-sm transition-all border ${
                      inputs.fruitServings === num
                        ? 'bg-brand-mustard/20 border-brand-mustard text-brand-mustard-hover shadow-md shadow-brand-mustard/10'
                        : 'bg-brand-cream/60 border-brand-border/80 text-brand-forest-muted hover:bg-brand-cream'
                    }`}
                  >
                    {num === 4 ? '4+ bowls' : `${num} serv`}
                  </button>
                ))}
              </div>
            </div>

            {/* Seeds & Sprouts */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-forest-muted mb-2">🌱 Sprouted Seeds &amp; Microgreens Intake</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {([
                  { id: 'rarely', label: 'Rarely', subtitle: '< 1x per week' },
                  { id: 'weekly', label: '1–2x Weekly', subtitle: 'Occasional sprouts' },
                  { id: 'daily', label: 'Daily Boost', subtitle: 'Chia / flax / moong' },
                  { id: 'multiple_daily', label: 'Living Power', subtitle: 'Multiple sprout diets' },
                ] as const).map((item) => (
                  <OptionCard key={item.id} selected={inputs.seedFrequency === item.id} onClick={() => setInputs({ seedFrequency: item.id as SeedFrequency })}>
                    <div className="text-xs font-bold text-brand-forest">{item.label}</div>
                    <div className="text-[10px] text-brand-forest-muted mt-0.5">{item.subtitle}</div>
                  </OptionCard>
                ))}
              </div>
            </div>

            {/* Raw Veggies */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-forest-muted mb-2">🥗 Raw Veggies &amp; Crisp Greens</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {([
                  { id: 'rarely', label: 'Minimal', subtitle: 'Cooked sabzi only' },
                  { id: 'daily_salad', label: '1 Salad / Day', subtitle: 'Cucumber / tomatoes' },
                  { id: 'multiple_daily', label: '2 Salads Daily', subtitle: 'Rich raw color spectrum' },
                  { id: 'heavy_raw_greens', label: 'Living Heavy', subtitle: 'Cruciferous & microgreens' },
                ] as const).map((item) => (
                  <OptionCard key={item.id} selected={inputs.veggieFrequency === item.id} onClick={() => setInputs({ veggieFrequency: item.id as VeggieFrequency })}>
                    <div className="text-xs font-bold text-brand-forest">{item.label}</div>
                    <div className="text-[10px] text-brand-forest-muted mt-0.5">{item.subtitle}</div>
                  </OptionCard>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button type="button" onClick={prevStep} className="px-6 py-3.5 rounded-2xl text-sm font-semibold border border-brand-border text-brand-forest-muted hover:bg-brand-cream transition-colors">← Back</button>
              <button type="button" onClick={nextStep} className="px-8 py-3.5 rounded-2xl font-bold text-sm bg-brand-mustard text-brand-forest hover:bg-brand-mustard transition-all shadow-lg shadow-brand-mustard/20 hover:scale-[1.02] active:scale-[0.98]">
                Analyze My Bio Profile →
              </button>
            </div>
          </div>
        )}

        {/* ===== STEP 4: Vitality Dashboard (Enhanced) ===== */}
        {currentStep === 4 && results && (
          <div className="space-y-8 animate-fade-in-up">
            <div>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-mustard/10 text-brand-mustard border border-brand-mustard/20">
                Step 4 of 5 · Real-Time Vitality Dashboard
              </span>
              <h2 className="text-2xl sm:text-3xl font-black mt-3 text-brand-forest">
                Your Fresh &amp; Raw Vitality Profile
              </h2>
              <p className="text-sm text-brand-forest-muted mt-1">
                Calibrated against 10 lifestyle &amp; diet factors for maximum accuracy.
              </p>
            </div>

            {/* Circular Gauge & Age Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* SVG Circular Gauge */}
              <div className="md:col-span-6 flex flex-col items-center justify-center p-6 rounded-3xl bg-brand-cream/40 border border-brand-border shadow-inner">
                <div className="relative w-48 h-48 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                    <circle cx="80" cy="80" r={radius} stroke="#e5ddd0" strokeWidth="12" fill="transparent" />
                    <circle cx="80" cy="80" r={radius} stroke={results.vitalityTier.color} strokeWidth="12" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" fill="transparent" className="transition-all duration-1000 ease-out" />
                  </svg>
                  <div className="absolute flex flex-col items-center text-center">
                    <span className="text-4xl font-black font-mono text-brand-forest tracking-tight">{results.livingFoodVitalityScore}%</span>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-brand-forest-muted mt-1">Vitality Index</span>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: `${results.vitalityTier.color}20`, color: results.vitalityTier.color, border: `1px solid ${results.vitalityTier.color}40` }}>
                    {results.vitalityTier.label}
                  </span>
                  <p className="text-xs text-brand-forest-muted mt-2 max-w-xs leading-relaxed">{results.vitalityTier.description}</p>
                </div>
              </div>

              {/* Age + Energy + BMI */}
              <div className="md:col-span-6 space-y-4">
                {/* Age Comparison Card */}
                <div className="p-5 rounded-2xl bg-brand-cream/40 border border-brand-border">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-forest-muted block mb-2">Biological Diet Age vs Chronological Age</span>
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-brand-forest-muted">Chronological Age:</span>
                      <span className="font-bold text-brand-forest font-mono">{results.chronologicalAge} yrs</span>
                    </div>
                    <div className="w-full h-2.5 bg-brand-cream rounded-full overflow-hidden">
                      <div className="h-full bg-brand-border rounded-full" style={{ width: `${Math.min(100, (results.chronologicalAge / 80) * 100)}%` }} />
                    </div>
                    <div className="flex justify-between text-xs pt-1">
                      <span className="text-brand-forest-muted">Biological Diet Age:</span>
                      <span className="font-bold font-mono" style={{ color: results.biologicalDietAgeDelta > 0 ? '#F87171' : '#34D399' }}>
                        {results.biologicalDietAge} yrs ({results.biologicalDietAgeDelta > 0 ? `+${results.biologicalDietAgeDelta} older` : `${results.biologicalDietAgeDelta} younger`})
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-brand-cream rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, (results.biologicalDietAge / 80) * 100)}%`, background: results.biologicalDietAgeDelta > 0 ? 'linear-gradient(90deg, #F59E0B, #EF4444)' : 'linear-gradient(90deg, #10B981, #34D399)' }} />
                    </div>
                  </div>
                  <p className="text-xs text-brand-forest-muted leading-relaxed">
                    {results.biologicalDietAgeDelta > 0 ? 'High cooked food and lifestyle stressors accelerate cellular glycation and enzyme depletion.' : 'Your living food intake and healthy habits protect mitochondrial function and cellular DNA integrity.'}
                  </p>
                </div>

                {/* Energy Target */}
                <div className="p-5 rounded-2xl bg-brand-cream/40 border border-brand-border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-forest-muted">Mifflin-St Jeor Energy Baseline</span>
                    <span className="text-xs text-brand-forest-muted font-mono">TDEE: {results.tdee} kcal</span>
                  </div>
                  <div className="text-2xl font-black text-brand-mustard font-mono">{results.targetBlooms.calories} kcal / day</div>
                  <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-brand-border text-center">
                    <div><span className="text-[10px] text-brand-forest-muted uppercase font-semibold">Protein</span><p className="text-xs font-bold text-blue-400 font-mono mt-0.5">{results.targetBlooms.protein}g</p></div>
                    <div><span className="text-[10px] text-brand-forest-muted uppercase font-semibold">Carbs</span><p className="text-xs font-bold text-brand-mustard font-mono mt-0.5">{results.targetBlooms.carbs}g</p></div>
                    <div><span className="text-[10px] text-brand-forest-muted uppercase font-semibold">Fats</span><p className="text-xs font-bold text-brand-mustard font-mono mt-0.5">{results.targetBlooms.fats}g</p></div>
                    <div><span className="text-[10px] text-brand-forest-muted uppercase font-semibold">Fiber</span><p className="text-xs font-bold text-purple-400 font-mono mt-0.5">{results.targetBlooms.fiber}g</p></div>
                  </div>
                </div>

                {/* BMI Card (only shown when data is available) */}
                {results.bmiResult && (
                  <div className="p-4 rounded-2xl bg-brand-cream/40 border border-brand-border">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold uppercase tracking-wider text-brand-forest-muted">BMI (Indian Standard)</span>
                      <span className="text-lg font-black font-mono" style={{ color: results.bmiResult.color }}>{results.bmiResult.value}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: `${results.bmiResult.color}20`, color: results.bmiResult.color }}>{results.bmiResult.category}</span>
                      {results.whtrResult && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: `${results.whtrResult.color}20`, color: results.whtrResult.color }}>WHtR: {results.whtrResult.value} ({results.whtrResult.category})</span>
                      )}
                    </div>
                    <p className="text-[11px] text-brand-forest-muted mt-1.5">{results.bmiResult.risk}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Lifestyle Impact Breakdown */}
            <div className="rounded-2xl p-5 bg-brand-cream/40 border border-brand-border">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-forest-muted mb-4">📊 Factor-by-Factor Vitality Breakdown</h3>
              <div className="space-y-3">
                {results.lifestyleBreakdown.map((factor) => (
                  <div key={factor.label}>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-semibold text-brand-forest">{factor.label}</span>
                      <span className="font-bold font-mono" style={{ color: factor.status === 'excellent' ? '#10B981' : factor.status === 'good' ? '#34D399' : factor.status === 'fair' ? '#F59E0B' : '#EF4444' }}>
                        {factor.score}/{factor.maxScore}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-brand-cream rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${factor.percentage}%`,
                          background: factor.status === 'excellent' ? '#10B981' : factor.status === 'good' ? '#34D399' : factor.status === 'fair' ? '#F59E0B' : '#EF4444',
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-brand-forest-muted/80 mt-0.5">{factor.tip}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button type="button" onClick={prevStep} className="px-6 py-3.5 rounded-2xl text-sm font-semibold border border-brand-border text-brand-forest-muted hover:bg-brand-cream transition-colors">← Adjust Habits</button>
              <button type="button" onClick={nextStep} className="px-8 py-3.5 rounded-2xl font-bold text-sm bg-brand-mustard text-brand-forest hover:bg-brand-mustard transition-all shadow-lg shadow-brand-mustard/20 hover:scale-[1.02] active:scale-[0.98]">
                View Diet Comparison →
              </button>
            </div>
          </div>
        )}

        {/* ===== STEP 5: Diet Comparison Matrix & Recommendation ===== */}
        {currentStep === 5 && results && (
          <div className="space-y-8 animate-fade-in-up">
            <div>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-mustard/10 text-brand-mustard border border-brand-mustard/20">
                Step 5 of 5 · Diet Comparison &amp; Targeted Solution
              </span>
              <h2 className="text-2xl sm:text-3xl font-black mt-3 text-brand-forest">
                Current Diet vs. Optimal Living Diet
              </h2>
              <p className="text-sm text-brand-forest-muted mt-1">
                Evaluate the physiological gap between your current habits and an enzymatically alive diet.
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
                      <h3 className="text-sm font-black uppercase tracking-wider text-red-500">Your Current Profile</h3>
                      <p className="text-xs text-brand-forest-muted">Estimated based on your habits</p>
                    </div>
                  </div>
                  <div className="space-y-3.5 text-xs">
                    {[
                      { label: 'Raw vs Cooked Balance', value: results.dietComparison.currentDiet.rawCookedRatio },
                      { label: 'Active Digestive Enzymes', value: results.dietComparison.currentDiet.activeDigestiveEnzymes },
                      { label: 'Estimated Daily Fiber', value: `${results.dietComparison.currentDiet.estimatedDailyFiber}g / day` },
                      { label: 'Antioxidant Capacity', value: results.dietComparison.currentDiet.antioxidantCapacity },
                      { label: 'Digestion & Transit Time', value: results.dietComparison.currentDiet.digestionTransitTime },
                      { label: 'Inflammatory Risk', value: results.dietComparison.currentDiet.inflammatoryLoad },
                      { label: 'Sleep Recovery', value: results.dietComparison.currentDiet.sleepRecoveryPotential },
                      { label: 'Inflammatory Oil Load', value: results.dietComparison.currentDiet.inflammatoryOilLoad },
                    ].map((row, i) => (
                      <div key={i} className={`flex justify-between py-1.5 ${i < 7 ? 'border-b border-brand-border/80' : ''}`}>
                        <span className="text-brand-forest-muted">{row.label}:</span>
                        <span className="font-bold text-brand-forest text-right max-w-[55%]">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Optimal Diet Column */}
                <div className="p-6 bg-emerald-50/30">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl">✨</span>
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-brand-mustard">Optimal Living Target</h3>
                      <p className="text-xs text-brand-forest-muted">Thebloomaa cellular nutrition standard</p>
                    </div>
                  </div>
                  <div className="space-y-3.5 text-xs">
                    {[
                      { label: 'Raw vs Cooked Balance', value: results.dietComparison.optimalDiet.rawCookedRatio },
                      { label: 'Active Digestive Enzymes', value: results.dietComparison.optimalDiet.activeDigestiveEnzymes },
                      { label: 'Estimated Daily Fiber', value: `${results.dietComparison.optimalDiet.estimatedDailyFiber}g (Prebiotic)` },
                      { label: 'Antioxidant Capacity', value: results.dietComparison.optimalDiet.antioxidantCapacity },
                      { label: 'Digestion & Transit Time', value: results.dietComparison.optimalDiet.digestionTransitTime },
                      { label: 'Inflammatory Risk', value: results.dietComparison.optimalDiet.inflammatoryLoad },
                      { label: 'Sleep Recovery', value: results.dietComparison.optimalDiet.sleepRecoveryPotential },
                      { label: 'Inflammatory Oil Load', value: results.dietComparison.optimalDiet.inflammatoryOilLoad },
                    ].map((row, i) => (
                      <div key={i} className={`flex justify-between py-1.5 ${i < 7 ? 'border-b border-brand-border/80' : ''}`}>
                        <span className="text-brand-forest-muted">{row.label}:</span>
                        <span className="font-bold text-brand-mustard-hover text-right max-w-[55%]">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Actionable Swaps (6 tips grouped) */}
            <div className="rounded-2xl p-5 bg-brand-cream/40 border border-brand-border">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-forest-muted mb-4">🔄 Personalized Action Plan</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {results.actionableSwaps.map((swap, i) => (
                  <div key={i} className="p-3 rounded-xl bg-brand-card border border-brand-border/50">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-mustard">{swap.category}</span>
                    <p className="text-xs text-brand-forest mt-1 leading-relaxed">{swap.tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Matched Product Recommendation */}
            <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-brand-card via-brand-cream to-brand-cream border-2 border-brand-mustard/50 shadow-2xl relative overflow-hidden">
              <div className="absolute top-3 right-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-mustard text-brand-forest">
                Recommended Solution
              </div>

              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="w-full md:w-48 h-44 rounded-2xl overflow-hidden relative flex-shrink-0 bg-brand-cream border border-brand-border">
                  <img src={results.matchedProduct.imageUrl} alt={results.matchedProduct.name} className="w-full h-full object-cover" />
                  <div className="absolute bottom-2 left-2 px-2 py-1 rounded-lg bg-brand-cream/85 text-[10px] font-bold text-brand-mustard">🔥 {results.matchedProduct.calories} kcal</div>
                </div>

                <div className="flex-grow text-center md:text-left">
                  <span className="text-xs font-bold text-brand-mustard uppercase tracking-wider">Targeted Nutrition Solution</span>
                  <h3 className="text-xl sm:text-2xl font-black text-brand-forest mt-1">{results.matchedProduct.name}</h3>
                  <p className="text-xs text-brand-forest-muted mt-2 leading-relaxed">{results.matchedProduct.reason}</p>

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3 text-xs">
                    <span className="font-bold text-blue-400 font-mono">💪 {results.matchedProduct.protein}g Protein</span>
                    <span className="font-bold text-brand-mustard font-mono">🍞 {results.matchedProduct.carbs}g Carbs</span>
                    <span className="font-bold text-brand-mustard font-mono">🥑 {results.matchedProduct.fats}g Fats</span>
                    <span className="font-black text-base text-brand-forest font-mono">
                      Price: TBA
                    </span>
                  </div>

                  {results.matchedProduct.logisticsNote && (
                    <div className="mt-3 p-2.5 rounded-xl bg-brand-mustard/10 border border-brand-mustard/30 text-[11px] text-brand-forest-muted">
                      <strong>Logistics Protocol: </strong>{results.matchedProduct.logisticsNote}
                    </div>
                  )}

                  <div className="mt-2.5 p-2.5 rounded-xl bg-brand-mustard/10 border border-brand-mustard/30 text-[11px] text-brand-mustard-hover">
                    <span className="font-bold">Fresh Nutrition Tip: </span>{results.matchedProduct.livingFoodSynergyTip}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-brand-border flex flex-col sm:flex-row gap-3 items-center justify-between">
                <button type="button" onClick={() => goToStep(1)} className="text-xs font-semibold text-brand-forest-muted hover:text-brand-forest transition-colors">
                  ↺ Recalculate with different inputs
                </button>
                <button
                  type="button"
                  onClick={handleSelectPlanAndOrder}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-sm bg-brand-mustard text-brand-forest hover:bg-brand-mustard transition-all shadow-xl shadow-brand-mustard/25 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Select This Plan &amp; Pre-Book</span>
                  <span>→</span>
                </button>
              </div>
            </div>

            <div className="pt-4">
              <TrialPlanShowcase />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
