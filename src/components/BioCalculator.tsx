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
} from '@/lib/bioCalculator';

const HEALTH_GOALS: { id: HealthGoal; title: string; icon: string; subtitle: string }[] = [
  { id: 'WEIGHT_LOSS', title: 'Weight Loss', icon: '🔥', subtitle: 'Metabolic deficit & living fiber' },
  { id: 'LEAN_MUSCLE', title: 'Lean Muscle', icon: '💪', subtitle: 'Clean high protein & recovery' },
  { id: 'GUT_HEALTH', title: 'Gut Reset & Enzymes', icon: '🌱', subtitle: 'Live enzymes & prebiotic micro-flora' },
  { id: 'LONGEVITY_DETOX', title: 'Longevity & Detox', icon: '🧬', subtitle: 'Cellular autophagy & high ORAC' },
  { id: 'ENERGY_VITALITY', title: 'All-Day Vitality', icon: '⚡', subtitle: 'Steady glycemic release & hydration' },
];

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
        <div className="flex items-center justify-between relative max-w-lg mx-auto px-4">
          <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-brand-cream -translate-y-1/2 z-0" />
          <div
            className="absolute top-1/2 left-8 h-0.5 bg-brand-mustard transition-all duration-500 -translate-y-1/2 z-0"
            style={{ width: `${((currentStep - 1) / 3) * 85}%` }}
          />
          {[
            { step: 1, label: 'Profile' },
            { step: 2, label: 'Diet Habits' },
            { step: 3, label: 'Vitality' },
            { step: 4, label: 'Comparison' },
          ].map((s) => {
            const isActive = currentStep === s.step;
            const isCompleted = currentStep > s.step;
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => goToStep(s.step as any)}
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
                  className={`text-[11px] font-semibold mt-2 transition-colors ${
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

      {/* Main Glassmorphic Container Card */}
      <div className="rounded-3xl p-6 sm:p-10 relative overflow-hidden backdrop-blur-xl bg-brand-card/85 border border-brand-border shadow-2xl">
        {/* Subtle Ambient Light Effects */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-mustard/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-brand-mustard/10 rounded-full blur-3xl pointer-events-none" />

        {/* STEP 1: Biological Profile & Health Goals */}
        {currentStep === 1 && (
          <div className="space-y-8 animate-fade-in-up">
            <div>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-mustard/10 text-brand-mustard border border-brand-mustard/20">
                Step 1 of 4 · Biological Baselines
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
                      <h4
                        className={`text-sm font-bold ${
                          isSelected ? 'text-brand-mustard-hover' : 'text-brand-forest'
                        }`}
                      >
                        {goal.title}
                      </h4>
                      <p className="text-xs text-brand-forest-muted mt-1 leading-relaxed">{goal.subtitle}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Body Metrics Accordion */}
            <div className="rounded-2xl p-4 bg-brand-cream/30 border border-brand-border">
              <button
                type="button"
                onClick={() => setShowAdvancedBody(!showAdvancedBody)}
                className="w-full flex items-center justify-between text-xs font-semibold text-brand-forest-muted hover:text-brand-mustard transition-colors"
              >
                <span>⚙️ Precise Body Metrics (Optional Height &amp; Weight)</span>
                <span className="text-brand-forest-muted/70">{showAdvancedBody ? '▲ Hide' : '▼ Expand'}</span>
              </button>

              {showAdvancedBody && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-brand-border/80">
                  <div>
                    <label className="block text-xs text-brand-forest-muted mb-1 font-medium">
                      Body Weight (kg)
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
                    <label className="block text-xs text-brand-forest-muted mb-1 font-medium">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 175"
                      value={inputs.height || ''}
                      onChange={(e) => setInputs({ height: Number(e.target.value) || undefined })}
                      className="w-full px-4 py-2.5 rounded-xl bg-brand-cream border border-brand-border text-sm text-brand-forest focus:outline-none focus:border-brand-mustard font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={nextStep}
                className="px-8 py-3.5 rounded-2xl font-bold text-sm bg-brand-mustard text-brand-forest hover:bg-brand-mustard transition-all shadow-lg shadow-brand-mustard/20 hover:scale-[1.02] active:scale-[0.98]"
              >
                Next: Diet Habits →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Dietary Habits (Cooked vs Raw & Fresh Foods) */}
        {currentStep === 2 && (
          <div className="space-y-8 animate-fade-in-up">
            <div>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-mustard/10 text-brand-mustard border border-brand-mustard/20">
                Step 2 of 4 · Fresh &amp; Raw Food Intake
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
                  <label className="text-xs font-bold uppercase tracking-wider text-brand-forest-muted">
                    Daily Cooked Food Intake
                  </label>
                  <p className="text-xs text-brand-forest-muted mt-0.5">
                    Percentage of your daily diet cooked at high heat (roti, rice, gravies, fried foods).
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-brand-mustard font-mono">
                    {inputs.cookedFoodPercentage}%
                  </span>
                  <span className="text-xs text-brand-forest-muted block">
                    ({100 - inputs.cookedFoodPercentage}% Fresh &amp; Raw)
                  </span>
                </div>
              </div>

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
                <span className="text-brand-mustard">0% (100% Fresh &amp; Raw)</span>
                <span>50% Balanced</span>
                <span className="text-red-400">100% (Strictly Cooked)</span>
              </div>
            </div>

            {/* Fruit Servings */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-forest-muted">
                  🍎 Fresh Fruit Servings (Daily)
                </label>
                <span className="text-xs text-brand-forest-muted">1 serving = 1 cup or whole fruit</span>
              </div>
              <div className="grid grid-cols-5 gap-2.5">
                {[0, 1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setInputs({ fruitServings: num })}
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

            {/* Seeds & Sprouts Frequency */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-forest-muted mb-2">
                🌱 Sprouted Seeds &amp; Microgreens Intake
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'rarely', label: 'Rarely', subtitle: '< 1x per week' },
                  { id: 'weekly', label: '1–2x Weekly', subtitle: 'Occasional sprouts' },
                  { id: 'daily', label: 'Daily Boost', subtitle: 'Chia / flax / moong' },
                  { id: 'multiple_daily', label: 'Living Power', subtitle: 'Multiple sprout diets' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setInputs({ seedFrequency: item.id as SeedFrequency })}
                    className={`p-3 rounded-2xl text-left transition-all border ${
                      inputs.seedFrequency === item.id
                        ? 'bg-brand-mustard/20 border-brand-mustard text-brand-mustard-hover'
                        : 'bg-brand-cream/60 border-brand-border/80 text-brand-forest-muted hover:bg-brand-cream'
                    }`}
                  >
                    <div className="text-xs font-bold text-brand-forest">{item.label}</div>
                    <div className="text-[10px] text-brand-forest-muted mt-0.5">{item.subtitle}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Raw Veggies & Greens */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-forest-muted mb-2">
                🥗 Raw Veggies &amp; Crisp Greens
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'rarely', label: 'Minimal', subtitle: 'Cooked sabzi only' },
                  { id: 'daily_salad', label: '1 Salad / Day', subtitle: 'Cucumber / tomatoes' },
                  { id: 'multiple_daily', label: '2 Salads Daily', subtitle: 'Rich raw color spectrum' },
                  { id: 'heavy_raw_greens', label: 'Living Heavy', subtitle: 'Cruciferous & microgreens' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setInputs({ veggieFrequency: item.id as VeggieFrequency })}
                    className={`p-3 rounded-2xl text-left transition-all border ${
                      inputs.veggieFrequency === item.id
                        ? 'bg-brand-mustard/20 border-brand-mustard text-brand-mustard-hover'
                        : 'bg-brand-cream/60 border-brand-border/80 text-brand-forest-muted hover:bg-brand-cream'
                    }`}
                  >
                    <div className="text-xs font-bold text-brand-forest">{item.label}</div>
                    <div className="text-[10px] text-brand-forest-muted mt-0.5">{item.subtitle}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-3.5 rounded-2xl text-sm font-semibold border border-brand-border text-brand-forest-muted hover:bg-brand-cream transition-colors"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="px-8 py-3.5 rounded-2xl font-bold text-sm bg-brand-mustard text-brand-forest hover:bg-brand-mustard transition-all shadow-lg shadow-brand-mustard/20 hover:scale-[1.02] active:scale-[0.98]"
              >
                Analyze My Bio Profile →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: The Vitality Dashboard */}
        {currentStep === 3 && results && (
          <div className="space-y-8 animate-fade-in-up">
            <div>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-mustard/10 text-brand-mustard border border-brand-mustard/20">
                Step 3 of 4 · Real-Time Vitality Dashboard
              </span>
              <h2 className="text-2xl sm:text-3xl font-black mt-3 text-brand-forest">
                Your Fresh &amp; Raw Vitality Profile
              </h2>
              <p className="text-sm text-brand-forest-muted mt-1">
                Calibrated against natural digestive enzymes, fresh raw nutrition, and daily metabolic energy.
              </p>
            </div>

            {/* Circular Progress Dial & Age Comparison Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* SVG Animated Circular Gauge */}
              <div className="md:col-span-6 flex flex-col items-center justify-center p-6 rounded-3xl bg-brand-cream/40 border border-brand-border shadow-inner">
                <div className="relative w-48 h-48 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                    <circle
                      cx="80"
                      cy="80"
                      r={radius}
                      stroke="#1e293b"
                      strokeWidth="12"
                      fill="transparent"
                    />
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

              {/* Visual Age Comparison Timeline & Target Macros */}
              <div className="md:col-span-6 space-y-4">
                {/* Visual Age Comparison Card */}
                <div className="p-5 rounded-2xl bg-brand-cream/40 border border-brand-border">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-forest-muted block mb-2">
                    Biological Diet Age vs Chronological Age
                  </span>

                  {/* Comparative Visual Timeline Bar */}
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
                          background: results.biologicalDietAgeDelta > 0
                            ? 'linear-gradient(90deg, #F59E0B, #EF4444)'
                            : 'linear-gradient(90deg, #10B981, #34D399)',
                        }}
                      />
                    </div>
                  </div>

                  <p className="text-xs text-brand-forest-muted leading-relaxed">
                    {results.biologicalDietAgeDelta > 0
                      ? 'High cooked food ratio accelerates cellular glycation (AGEs) and enzyme depletion.'
                      : 'High living raw enzyme intake protects mitochondrial function and cellular DNA integrity.'}
                  </p>
                </div>

                {/* Energy & Macros Target */}
                <div className="p-5 rounded-2xl bg-brand-cream/40 border border-brand-border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-forest-muted">
                      Mifflin-St Jeor Energy Baseline
                    </span>
                    <span className="text-xs text-brand-forest-muted font-mono">
                      TDEE: {results.tdee} kcal
                    </span>
                  </div>
                  <div className="text-2xl font-black text-brand-mustard font-mono">
                    {results.targetMacros.calories} kcal / day
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-brand-border text-center">
                    <div>
                      <span className="text-[10px] text-brand-forest-muted uppercase font-semibold">Protein</span>
                      <p className="text-xs font-bold text-blue-400 font-mono mt-0.5">
                        {results.targetMacros.protein}g
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-brand-forest-muted uppercase font-semibold">Carbs</span>
                      <p className="text-xs font-bold text-brand-mustard font-mono mt-0.5">
                        {results.targetMacros.carbs}g
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-brand-forest-muted uppercase font-semibold">Fats</span>
                      <p className="text-xs font-bold text-brand-mustard font-mono mt-0.5">
                        {results.targetMacros.fats}g
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-brand-forest-muted uppercase font-semibold">Fiber</span>
                      <p className="text-xs font-bold text-purple-400 font-mono mt-0.5">
                        {results.targetMacros.fiber}g
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-3.5 rounded-2xl text-sm font-semibold border border-brand-border text-brand-forest-muted hover:bg-brand-cream transition-colors"
              >
                ← Adjust Habits
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="px-8 py-3.5 rounded-2xl font-bold text-sm bg-brand-mustard text-brand-forest hover:bg-brand-mustard transition-all shadow-lg shadow-brand-mustard/20 hover:scale-[1.02] active:scale-[0.98]"
              >
                View Diet Comparison Matrix →
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Diet Comparison Matrix & Matched Recommendation */}
        {currentStep === 4 && results && (
          <div className="space-y-8 animate-fade-in-up">
            <div>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-mustard/10 text-brand-mustard border border-brand-mustard/20">
                Step 4 of 4 · Diet Comparison &amp; Targeted Solution
              </span>
              <h2 className="text-2xl sm:text-3xl font-black mt-3 text-brand-forest">
                Current Diet vs. Optimal Living Diet
              </h2>
              <p className="text-sm text-brand-forest-muted mt-1">
                Evaluate the physiological gap between your current habits and an enzymatically alive diet.
              </p>
            </div>

            {/* Side-by-Side Diet Comparison Matrix */}
            <div className="rounded-2xl overflow-hidden border border-brand-border bg-brand-cream/60">
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-brand-border">
                {/* Current Diet Column */}
                <div className="p-6 bg-red-950/10">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl">⚠️</span>
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-red-400">
                        Your Current Dietary Profile
                      </h3>
                      <p className="text-xs text-brand-forest-muted">Estimated based on your habits</p>
                    </div>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-brand-border/80">
                      <span className="text-brand-forest-muted">Raw vs Cooked Balance:</span>
                      <span className="font-bold text-brand-forest">{results.dietComparison.currentDiet.rawCookedRatio}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-brand-border/80">
                      <span className="text-brand-forest-muted">Active Digestive Enzymes:</span>
                      <span className="font-bold text-brand-mustard">{results.dietComparison.currentDiet.activeDigestiveEnzymes}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-brand-border/80">
                      <span className="text-brand-forest-muted">Estimated Daily Fiber:</span>
                      <span className="font-bold text-brand-forest font-mono">{results.dietComparison.currentDiet.estimatedDailyFiber}g / day</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-brand-border/80">
                      <span className="text-brand-forest-muted">Antioxidant Capacity:</span>
                      <span className="font-bold text-brand-forest-muted">{results.dietComparison.currentDiet.antioxidantCapacity}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-brand-border/80">
                      <span className="text-brand-forest-muted">Digestion &amp; Transit Time:</span>
                      <span className="font-bold text-red-300">{results.dietComparison.currentDiet.digestionTransitTime}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-brand-forest-muted">Inflammatory Risk:</span>
                      <span className="font-bold text-brand-forest-muted">{results.dietComparison.currentDiet.inflammatoryLoad}</span>
                    </div>
                  </div>
                </div>

                {/* Optimal Living Diet Column */}
                <div className="p-6 bg-emerald-950/15">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl">✨</span>
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-brand-mustard">
                        Optimal Living Target Profile
                      </h3>
                      <p className="text-xs text-brand-forest-muted">Thebloomaa cellular nutrition standard</p>
                    </div>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-brand-border/80">
                      <span className="text-brand-forest-muted">Raw vs Cooked Balance:</span>
                      <span className="font-bold text-brand-mustard-hover">{results.dietComparison.optimalDiet.rawCookedRatio}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-brand-border/80">
                      <span className="text-brand-forest-muted">Active Digestive Enzymes:</span>
                      <span className="font-bold text-brand-mustard">{results.dietComparison.optimalDiet.activeDigestiveEnzymes}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-brand-border/80">
                      <span className="text-brand-forest-muted">Estimated Daily Fiber:</span>
                      <span className="font-bold text-brand-mustard font-mono">{results.dietComparison.optimalDiet.estimatedDailyFiber}g (Prebiotic)</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-brand-border/80">
                      <span className="text-brand-forest-muted">Antioxidant Capacity:</span>
                      <span className="font-bold text-brand-mustard-hover">{results.dietComparison.optimalDiet.antioxidantCapacity}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-brand-border/80">
                      <span className="text-brand-forest-muted">Digestion &amp; Transit Time:</span>
                      <span className="font-bold text-brand-mustard-hover">{results.dietComparison.optimalDiet.digestionTransitTime}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-brand-forest-muted">Inflammatory Risk:</span>
                      <span className="font-bold text-brand-mustard-hover">{results.dietComparison.optimalDiet.inflammatoryLoad}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Matched Product Recommendation Card */}
            <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-brand-card via-brand-cream to-brand-cream border-2 border-brand-mustard/50 shadow-2xl relative overflow-hidden">
              <div className="absolute top-3 right-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-mustard text-brand-forest">
                Recommended Solution
              </div>

              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="w-full md:w-48 h-44 rounded-2xl overflow-hidden relative flex-shrink-0 bg-brand-cream border border-brand-border">
                  <img
                    src={results.matchedProduct.imageUrl}
                    alt={results.matchedProduct.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-1 rounded-lg bg-brand-cream/85 text-[10px] font-bold text-brand-mustard">
                    🔥 {results.matchedProduct.calories} kcal
                  </div>
                </div>

                <div className="flex-grow text-center md:text-left">
                  <span className="text-xs font-bold text-brand-mustard uppercase tracking-wider">
                    Targeted Nutrition Solution
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-brand-forest mt-1">
                    {results.matchedProduct.name}
                  </h3>
                  <p className="text-xs text-brand-forest-muted mt-2 leading-relaxed">
                    {results.matchedProduct.reason}
                  </p>

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3 text-xs">
                    <span className="font-bold text-blue-400 font-mono">💪 {results.matchedProduct.protein}g Protein</span>
                    <span className="font-bold text-brand-mustard font-mono">🍞 {results.matchedProduct.carbs}g Carbs</span>
                    <span className="font-bold text-brand-mustard font-mono">🥑 {results.matchedProduct.fats}g Fats</span>
                    <span className="font-black text-base text-brand-forest font-mono">
                      {results.matchedProduct.isTrialPlan ? '₹451 (7 Days Trial)' : `₹${results.matchedProduct.price}/diet`}
                    </span>
                  </div>

                  {results.matchedProduct.logisticsNote && (
                    <div className="mt-3 p-2.5 rounded-xl bg-brand-mustard/10 border border-brand-mustard/30 text-[11px] text-brand-forest-muted">
                      <strong>Logistics Protocol: </strong>
                      {results.matchedProduct.logisticsNote}
                    </div>
                  )}

                  <div className="mt-2.5 p-2.5 rounded-xl bg-emerald-950/20 border border-brand-mustard/30 text-[11px] text-brand-mustard-hover">
                    <span className="font-bold">Fresh Nutrition Tip: </span>
                    {results.matchedProduct.livingFoodSynergyTip}
                  </div>
                </div>
              </div>

              {/* Conversion Buttons */}
              <div className="mt-6 pt-5 border-t border-brand-border flex flex-col sm:flex-row gap-3 items-center justify-between">
                <button
                  type="button"
                  onClick={() => goToStep(1)}
                  className="text-xs font-semibold text-brand-forest-muted hover:text-brand-forest transition-colors"
                >
                  ↺ Recalculate with different inputs
                </button>

                <button
                  type="button"
                  onClick={handleSelectPlanAndOrder}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-sm bg-brand-mustard text-brand-forest hover:bg-brand-mustard transition-all shadow-xl shadow-brand-mustard/25 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Select This Plan &amp; Order</span>
                  <span>→</span>
                </button>
              </div>
            </div>

            {/* If the trial is matched, or to let users explore the 7 raw boxes */}
            <div className="pt-4">
              <TrialPlanShowcase />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
