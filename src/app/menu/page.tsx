'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useBundleStore, type Product, type BundleType } from '@/store/useBundleStore';

const getBadgeStyle = (pref: string) => {
  switch (pref) {
    case 'VEGAN':
    case 'LIVING_RAW':
      return { bg: '#065F46', color: '#6EE7B7', border: '#059669' };
    case 'VEG':
      return { bg: '#064E3B', color: '#A7F3D0', border: '#047857' };
    case 'KETO':
      return { bg: '#4C1D95', color: '#C4B5FD', border: '#6D28D9' };
    case 'HIGH_PROTEIN':
      return { bg: '#7F1D1D', color: '#FCA5A5', border: '#991B1B' };
    default:
      return { bg: '#374151', color: '#D1D5DB', border: '#4B5563' };
  }
};

const getBarWidth = (value: number, max: number) => Math.min((value / max) * 100, 100);

function MenuContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedProduct, selectProduct, selectBundle, openDrawer } = useBundleStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'MEAL_PLAN' | 'TRIAL'>('ALL');

  // Preselect bundle if passed via ?bundle=DAYS_15
  useEffect(() => {
    const bundleParam = searchParams.get('bundle') as BundleType | null;
    if (bundleParam && ['DAYS_7', 'DAYS_15', 'DAYS_30'].includes(bundleParam)) {
      selectBundle(bundleParam);
    }
  }, [searchParams, selectBundle]);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.products) setProducts(data.products);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load menu products:', err);
        setLoading(false);
      });
  }, []);

  const filteredProducts = products.filter((p) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'TRIAL') {
      return (
        p.type === 'TRIAL_PLAN' ||
        p.dietaryPreference === 'LIVING_RAW' ||
        p.name.toLowerCase().includes('trial')
      );
    }
    if (activeTab === 'MEAL_PLAN') {
      return p.type === 'MEAL_PLAN' && !p.name.toLowerCase().includes('trial');
    }
    return true;
  });

  const handleSelectProduct = (product: Product) => {
    selectProduct(product);
    const isTrial =
      product.isTrialPlan ||
      product.type === 'TRIAL_PLAN' ||
      product.dietaryPreference === 'LIVING_RAW' ||
      product.name.toLowerCase().includes('trial');

    if (isTrial) {
      router.push('/checkout');
    } else {
      openDrawer();
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 bg-slate-950 text-slate-100">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Patna Cloud Kitchen Daily Preps</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
              Choose Your Meal Plan
            </h1>
            <p className="mt-3 text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
              Every dish is chef-prepared fresh every morning (6 AM – 9 AM) and calibrated to your macro &amp; living enzyme targets.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex justify-center gap-2 mb-10 overflow-x-auto pb-2">
            {[
              { key: 'ALL', label: 'All Preps' },
              { key: 'MEAL_PLAN', label: '🥗 Standard Meal Plans (7, 15, 30 Days)' },
              { key: 'TRIAL', label: '🌱 Just Bloomed 7D Trial (₹451)' },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.key
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Meal Grid */}
          {loading ? (
            <div className="text-center py-20 text-slate-500">
              <span className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin inline-block mb-3" />
              <p className="text-sm font-medium">Loading fresh meals &amp; trial plans...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((meal) => {
                const badge = getBadgeStyle(meal.dietaryPreference || '');
                const isSelected = selectedProduct?.id === meal.id;
                const isTrial =
                  meal.isTrialPlan ||
                  meal.type === 'TRIAL_PLAN' ||
                  meal.dietaryPreference === 'LIVING_RAW' ||
                  meal.name.toLowerCase().includes('trial');

                return (
                  <div
                    key={meal.id}
                    onClick={() => handleSelectProduct(meal)}
                    className={`glow-card flex flex-col rounded-3xl overflow-hidden text-left transition-all cursor-pointer group bg-slate-900/80 border ${
                      isSelected
                        ? 'border-emerald-500 shadow-2xl shadow-emerald-500/20 ring-2 ring-emerald-500/30'
                        : 'border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    {/* Image */}
                    <div className="relative h-56 w-full overflow-hidden bg-slate-900">
                      <Image
                        src={meal.imageUrl || '/meals/chicken-prep.png'}
                        alt={meal.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

                      {/* Dietary / Category Badge */}
                      <div className="absolute top-3.5 left-3.5 z-10">
                        <span
                          className="px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider shadow-md"
                          style={{
                            background: badge.bg,
                            color: badge.color,
                            border: `1px solid ${badge.border}`,
                          }}
                        >
                          {isTrial ? '7D Living Trial' : meal.dietaryPreference.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Calorie Pill */}
                      <div className="absolute bottom-3.5 right-3.5 z-10">
                        <span className="px-3 py-1.5 rounded-xl text-xs font-bold backdrop-blur-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          🔥 {meal.calories} kcal
                        </span>
                      </div>

                      {/* Selected check */}
                      {isSelected && (
                        <div className="absolute top-3.5 right-3.5 z-10 w-7 h-7 rounded-full flex items-center justify-center text-slate-950 text-xs font-black bg-emerald-400 shadow-lg">
                          ✓
                        </div>
                      )}
                    </div>

                    <div className="p-6 flex flex-col flex-grow justify-between space-y-4">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-base font-bold text-slate-100 group-hover:text-emerald-300 transition-colors leading-snug pr-2">
                            {meal.name}
                          </h3>
                          <div className="text-right flex-shrink-0">
                            <span className="text-xl font-black font-mono text-emerald-400 block">
                              ₹{meal.price}
                            </span>
                            <span className="text-[10px] text-slate-400 block -mt-1">
                              {isTrial ? 'total for 7 days' : '/ prep day'}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                          {meal.description}
                        </p>
                      </div>

                      {/* Macro Bars */}
                      <div className="rounded-2xl p-3.5 bg-slate-950 border border-slate-800/80 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">🥩 Protein</span>
                          <span className="font-mono font-bold text-blue-400">{meal.protein}g</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400"
                            style={{ width: `${getBarWidth(meal.protein, 60)}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="text-slate-400">🍞 Carbs</span>
                          <span className="font-mono font-bold text-amber-400">{meal.carbs}g</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400"
                            style={{ width: `${getBarWidth(meal.carbs, 80)}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="text-slate-400">🥑 Fats</span>
                          <span className="font-mono font-bold text-emerald-400">{meal.fats}g</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                            style={{ width: `${getBarWidth(meal.fats, 50)}%` }}
                          />
                        </div>
                      </div>

                      {/* Card Action Button */}
                      <button
                        type="button"
                        className="w-full py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all bg-emerald-500 text-slate-950 hover:bg-emerald-400 group-hover:scale-[1.01] shadow-md cursor-pointer flex items-center justify-center gap-2"
                      >
                        <span>{isTrial ? 'Order 7D Trial (₹451)' : 'Customize Bundle (7/15/30D)'}</span>
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom Floating Bar if product selected */}
          {selectedProduct && (
            <div className="mt-12 p-5 rounded-3xl bg-slate-900/95 border border-emerald-500/40 backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in-up">
              <div>
                <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">
                  Selected Item
                </span>
                <h4 className="text-base font-bold text-slate-100">{selectedProduct.name}</h4>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleSelectProduct(selectedProduct)}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-sm bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
                >
                  Proceed to Checkout →
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <MenuContent />
    </Suspense>
  );
}
