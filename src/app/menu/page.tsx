'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useBundleStore, type Product } from '@/store/useBundleStore';

const getBadgeStyle = (pref: string) => {
  switch (pref) {
    case 'VEGAN': return { bg: '#065F46', color: '#6EE7B7', border: '#059669' };
    case 'VEG': return { bg: '#064E3B', color: '#A7F3D0', border: '#047857' };
    case 'KETO': return { bg: '#4C1D95', color: '#C4B5FD', border: '#6D28D9' };
    case 'HIGH_PROTEIN': return { bg: '#7F1D1D', color: '#FCA5A5', border: '#991B1B' };
    default: return { bg: '#374151', color: '#D1D5DB', border: '#4B5563' };
  }
};

const getBarWidth = (value: number, max: number) => Math.min((value / max) * 100, 100);


export default function MenuPage() {
  const { selectedProduct, selectProduct } = useBundleStore();
  const [meals, setMeals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products?type=MEAL_PLAN')
      .then(res => res.json())
      .then(data => {
        if (data.products) setMeals(data.products);
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--bg-dark)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--brand-accent)' }}>Step 1 of 3</span>
          <h1 className="text-3xl sm:text-4xl font-black mt-2" style={{ color: 'var(--text-primary)' }}>Choose Your Meal Plan</h1>
          <p className="mt-3 text-sm max-w-lg mx-auto" style={{ color: 'var(--text-muted)' }}>
            Select the meal that matches your fitness goals. All meals are chef-prepared fresh daily.
          </p>
        </div>

        {/* Meal Grid */}
        {loading ? (
          <div className="text-center py-20 text-[var(--text-muted)]">Loading available meals...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {meals.map(meal => {
            const badge = getBadgeStyle(meal.dietaryPreference);
            const isSelected = selectedProduct?.id === meal.id;
            return (
              <button
                key={meal.id}
                onClick={() => selectProduct(meal)}
                className="glow-card flex flex-col rounded-2xl overflow-hidden text-left transition-all"
                style={{
                  background: 'var(--bg-card)',
                  border: isSelected ? '2px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                  boxShadow: isSelected ? '0 0 30px rgba(16, 185, 129, 0.15)' : 'none',
                }}
              >
                {/* Image */}
                <div className="relative h-52 w-full overflow-hidden">
                  <Image src={meal.imageUrl || ''} alt={meal.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3 z-10">
                    <span className="px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider" style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                      {meal.dietaryPreference.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3 z-10">
                    <span className="px-3 py-1.5 rounded-xl text-sm font-bold backdrop-blur-md" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#FCD34D', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                      🔥 {meal.calories} kcal
                    </span>
                  </div>
                  {/* Selected check */}
                  {isSelected && (
                    <div className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: 'var(--brand-primary)' }}>
                      ✓
                    </div>
                  )}
                </div>

                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-1.5">
                    <h3 className="text-base font-bold leading-tight pr-3" style={{ color: 'var(--text-primary)' }}>{meal.name}</h3>
                    <span className="text-lg font-extrabold whitespace-nowrap" style={{ fontFamily: 'var(--font-mono)', color: 'var(--brand-primary)' }}>₹{meal.price}</span>
                  </div>
                  <p className="text-sm leading-relaxed mb-4 flex-grow" style={{ color: 'var(--text-muted)' }}>{meal.description}</p>

                  {/* Macro Bars */}
                  <div className="rounded-xl p-3.5" style={{ background: 'var(--bg-dark)', border: '1px solid var(--border-subtle)' }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>🥩 Protein</span>
                      <span className="text-xs font-bold" style={{ fontFamily: 'var(--font-mono)', color: '#60A5FA' }}>{meal.protein}g</span>
                    </div>
                    <div className="macro-bar mb-2.5"><div className="macro-bar-fill" style={{ width: `${getBarWidth(meal.protein, 60)}%`, background: 'linear-gradient(90deg, #3B82F6, #60A5FA)' }} /></div>

                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>🍞 Carbs</span>
                      <span className="text-xs font-bold" style={{ fontFamily: 'var(--font-mono)', color: '#FBBF24' }}>{meal.carbs}g</span>
                    </div>
                    <div className="macro-bar mb-2.5"><div className="macro-bar-fill" style={{ width: `${getBarWidth(meal.carbs, 80)}%`, background: 'linear-gradient(90deg, #F59E0B, #FBBF24)' }} /></div>

                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>🥑 Fats</span>
                      <span className="text-xs font-bold" style={{ fontFamily: 'var(--font-mono)', color: '#34D399' }}>{meal.fats}g</span>
                    </div>
                    <div className="macro-bar"><div className="macro-bar-fill" style={{ width: `${getBarWidth(meal.fats, 50)}%`, background: 'linear-gradient(90deg, #10B981, #34D399)' }} /></div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        )}

        {/* Footer Actions */}
        {selectedProduct && (
          <div className="mt-10 text-center animate-fade-in-up">
            <a
              href="/checkout"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-base font-bold text-white transition-all hover:scale-105 active:scale-95"
              style={{ background: 'var(--brand-primary)' }}
            >
              Continue with {selectedProduct.name} →
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
