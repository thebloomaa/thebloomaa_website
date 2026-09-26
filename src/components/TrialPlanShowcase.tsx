'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useBundleStore } from '@/store/useBundleStore';
import { JUST_BLOOMED_BOXES, BLOOMAA_PRODUCTS } from '@/lib/bioCalculator';

const DAY_ICONS: Record<number, string> = {
  1: '⚡',
  2: '✨',
  3: '🧠',
  4: '❤️',
  5: '🛡️',
  6: '🌿',
  7: '🧬',
};

const DAY_ACCENTS: Record<number, { text: string; bg: string; border: string }> = {
  1: { text: '#34D399', bg: 'rgba(52, 211, 153, 0.12)', border: 'rgba(52, 211, 153, 0.25)' },
  2: { text: '#F472B6', bg: 'rgba(244, 114, 182, 0.12)', border: 'rgba(244, 114, 182, 0.25)' },
  3: { text: '#60A5FA', bg: 'rgba(96, 165, 250, 0.12)', border: 'rgba(96, 165, 250, 0.25)' },
  4: { text: '#F87171', bg: 'rgba(248, 113, 113, 0.12)', border: 'rgba(248, 113, 113, 0.25)' },
  5: { text: '#FBBF24', bg: 'rgba(251, 191, 36, 0.12)', border: 'rgba(251, 191, 36, 0.25)' },
  6: { text: '#A78BFA', bg: 'rgba(167, 139, 250, 0.12)', border: 'rgba(167, 139, 250, 0.25)' },
  7: { text: '#10B981', bg: 'rgba(16, 185, 129, 0.18)', border: 'rgba(16, 185, 129, 0.35)' },
};

export default function TrialPlanShowcase({ className = '' }: { className?: string }) {
  const router = useRouter();
  const { selectProduct } = useBundleStore();

  const handleOrderTrial = () => {
    const trialProd = BLOOMAA_PRODUCTS.JUST_BLOOMED_TRIAL;
    selectProduct({
      id: trialProd.id,
      name: trialProd.name,
      description: trialProd.description,
      price: trialProd.price,
      imageUrl: trialProd.imageUrl,
      type: trialProd.type,
      calories: trialProd.calories,
      protein: trialProd.protein,
      carbs: trialProd.carbs,
      fats: trialProd.fats,
      dietaryPreference: trialProd.dietaryPreference,
    });
    router.push('/checkout');
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Header Badge & Title */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-mustard/10 text-brand-mustard border border-brand-mustard/20 mb-3">
          <span className="w-2 h-2 rounded-full bg-brand-mustard animate-pulse" />
          7 Days · 7 Cellular Targets · 100% Raw &amp; Fresh
        </div>
        <h3 className="text-2xl sm:text-3xl font-black text-brand-forest tracking-tight">
          The <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-mustard to-brand-mustard-hover">Just Bloomed</span> 7D Trial
        </h3>
        <p className="text-xs sm:text-sm text-brand-forest-muted max-w-xl mx-auto mt-2 leading-relaxed">
          Experience 7 distinct daily fresh nutrient boxes crafted with cold-sprouted legumes, microgreens, and active enzymes for a full cellular gut reset.
        </p>
      </div>

      {/* 7-Card Responsive Horizontal Scroll / Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3.5 pb-2">
        {JUST_BLOOMED_BOXES.map((box) => {
          const accent = DAY_ACCENTS[box.day];
          const icon = DAY_ICONS[box.day];
          const isDoubleDrop = box.day >= 6;

          return (
            <div
              key={box.day}
              className="glow-card flex flex-col justify-between rounded-2xl p-4 backdrop-blur-md bg-brand-card/90 border border-brand-border transition-all duration-300 hover:border-brand-border hover:-translate-y-1 relative overflow-hidden group shadow-lg"
            >
              {/* Day 6/7 Goal Focus Tag */}
              {isDoubleDrop && (
                <div className="absolute top-0 right-0 px-2 py-0.5 rounded-bl-xl text-[9px] font-black uppercase tracking-wider bg-brand-mustard text-brand-forest">
                  {box.day === 6 ? 'Joint Vitality' : 'Gut Reset'}
                </div>
              )}

              <div>
                {/* Header: Day Badge & Icon */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="px-2.5 py-0.5 rounded-lg text-[11px] font-black font-mono tracking-wider"
                    style={{
                      backgroundColor: accent.bg,
                      color: accent.text,
                      border: `1px solid ${accent.border}`,
                    }}
                  >
                    Day {box.day}
                  </span>
                  <span className="text-lg">{icon}</span>
                </div>

                {/* Daily Goal Title */}
                <h4 className="text-xs font-black uppercase tracking-wider text-brand-forest mb-1">
                  {box.goal}
                </h4>

                {/* Box Name */}
                <p className="text-xs font-semibold text-brand-forest-muted leading-snug mb-3">
                  {box.boxName}
                </p>
              </div>

              {/* Core Ingredients Micro-Badge */}
              <div className="pt-2 border-t border-brand-border/80 mt-2">
                <span className="text-[10px] uppercase font-bold text-brand-forest-muted/70 block mb-1">
                  Active Superfoods:
                </span>
                <p className="text-[11px] text-brand-forest-muted leading-relaxed font-medium">
                  {box.highlightIngredients}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Logistics Callout & Instant CTA Card */}
      <div className="mt-6 rounded-2xl p-5 sm:p-6 backdrop-blur-xl bg-brand-cream/70 border border-brand-mustard/30 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logistics Pill & Explanation */}
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center bg-brand-mustard/20 text-brand-mustard text-lg border border-brand-mustard/30">
            🚚
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-brand-mustard/20 text-brand-mustard border border-brand-mustard/30 mb-1">
              6+1 Logistics Protocol
            </div>
            <p className="text-xs text-brand-forest-muted leading-relaxed">
              <strong>Logistics Note:</strong> Delivered across <strong>6 mornings (6:00 AM – 9:00 AM)</strong>. Box 6 &amp; Box 7 arrive together on Day 6 for your Day 7 Gut Reset.
            </p>
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-brand-border pt-3 md:pt-0">
          <div className="text-left md:text-right">
            <span className="text-[10px] uppercase font-bold text-brand-forest-muted tracking-wider block">
              Introductory Trial
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-brand-mustard font-mono">TBA</span>
              <span className="text-xs text-brand-forest-muted font-medium">/ 7 boxes</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOrderTrial}
            className="px-6 py-3 rounded-xl text-xs sm:text-sm font-black text-brand-forest bg-brand-mustard hover:bg-brand-mustard transition-all shadow-lg shadow-brand-mustard/20 hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
          >
            Claim 7D Trial →
          </button>
        </div>
      </div>
    </div>
  );
}
