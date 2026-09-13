'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBundleStore, type BundleType } from '@/store/useBundleStore';

const BUNDLE_OPTIONS: { type: BundleType; label: string; days: number; discountPct: number; discountLabel?: string; badge?: string }[] = [
  { type: 'DAYS_7', label: 'Starter', days: 7, discountPct: 0 },
  { type: 'DAYS_15', label: 'Committed', days: 15, discountPct: 8, discountLabel: '8% OFF', badge: 'Most Popular' },
  { type: 'DAYS_30', label: 'All-In', days: 30, discountPct: 20, discountLabel: '20% OFF', badge: 'Best Value' },
];

export default function MiniCartDrawer() {
  const router = useRouter();
  const {
    selectedProduct,
    bundleType,
    selectBundle,
    isDrawerOpen,
    closeDrawer,
    getPerDayPrice,
    getTotalPrice,
  } = useBundleStore();

  // If product is a trial plan, automatically bypass the drawer and push to checkout
  useEffect(() => {
    if (isDrawerOpen && selectedProduct) {
      const isTrial = 
        selectedProduct.isTrialPlan ||
        selectedProduct.type === 'TRIAL_PLAN' ||
        selectedProduct.dietaryPreference === 'LIVING_RAW' ||
        selectedProduct.name.toLowerCase().includes('trial');

      if (isTrial) {
        closeDrawer();
        router.push('/checkout');
      }
    }
  }, [isDrawerOpen, selectedProduct, closeDrawer, router]);

  // Set default bundle if none selected
  useEffect(() => {
    if (isDrawerOpen && !bundleType) {
      selectBundle('DAYS_15');
    }
  }, [isDrawerOpen, bundleType, selectBundle]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        closeDrawer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen, closeDrawer]);

  if (!isDrawerOpen || !selectedProduct) return null;

  // Don't render for trial plans since they are bypassed
  const isTrial =
    selectedProduct.isTrialPlan ||
    selectedProduct.type === 'TRIAL_PLAN' ||
    selectedProduct.dietaryPreference === 'LIVING_RAW';
  if (isTrial) return null;

  const basePrice = Number(selectedProduct.price);

  const handleProceedToCheckout = () => {
    if (!bundleType) {
      selectBundle('DAYS_15');
    }
    closeDrawer();
    router.push('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeDrawer}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between overflow-y-auto">
          {/* Top Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🥗</span>
              <div>
                <h3 className="text-base font-black text-slate-100">Bundle Builder</h3>
                <p className="text-xs text-slate-400">Choose your commitment &amp; savings</p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeDrawer}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
              aria-label="Close drawer"
            >
              ✕
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-6 flex-grow">
            {/* Selected Product Summary Card */}
            <div className="rounded-2xl p-4 bg-slate-800/50 border border-slate-800 flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden relative flex-shrink-0 bg-slate-900 border border-slate-700">
                <img
                  src={selectedProduct.imageUrl || '/meals/chicken-prep.png'}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-grow min-w-0">
                <h4 className="text-sm font-bold text-slate-100 truncate">{selectedProduct.name}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  🔥 {selectedProduct.calories} kcal · 🥩 {selectedProduct.protein}g P · 🥑 {selectedProduct.fats}g F
                </p>
                <span className="text-xs font-bold text-emerald-400 font-mono mt-1 block">
                  ₹{selectedProduct.price} / diet
                </span>
              </div>
            </div>

            {/* Bundle Selection Options */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Select Subscription Bundle
                </label>
                <span className="text-[11px] text-emerald-400 font-semibold">Skip any day anytime</span>
              </div>

              <div className="space-y-3">
                {BUNDLE_OPTIONS.map((opt) => {
                  const isSelected = bundleType === opt.type;
                  const perDay = opt.discountPct > 0 
                    ? Math.round(basePrice * (1 - opt.discountPct / 100))
                    : basePrice;
                  const total = perDay * opt.days;
                  const savings = (basePrice * opt.days) - total;

                  return (
                    <button
                      key={opt.type}
                      type="button"
                      onClick={() => selectBundle(opt.type)}
                      className={`w-full p-4 rounded-2xl text-left transition-all border relative cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500/15 border-emerald-500 shadow-md shadow-emerald-500/10'
                          : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800/80 text-slate-300'
                      }`}
                    >
                      {opt.badge && (
                        <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950 shadow-sm">
                          {opt.badge}
                        </span>
                      )}

                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-slate-100">{opt.label}</span>
                            <span className="text-xs font-bold text-slate-400">({opt.days} Days)</span>
                            {opt.discountLabel && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                {opt.discountLabel}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1">
                            Daily morning delivery (6 AM – 9 AM)
                          </p>
                        </div>

                        <div className="text-right">
                          <div className="text-base font-black text-emerald-400 font-mono">₹{total}</div>
                          <div className="text-[10px] text-slate-400 font-mono">₹{perDay}/day</div>
                        </div>
                      </div>

                      {savings > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Total Bundle Savings:</span>
                          <span className="font-bold text-amber-400 font-mono">Save ₹{savings}</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Summary Breakdown */}
            <div className="rounded-2xl p-4 bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Per-day rate:</span>
                <span className="font-bold text-slate-200 font-mono">₹{getPerDayPrice()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Scheduled duration:</span>
                <span className="font-bold text-slate-200 font-mono">
                  {bundleType === 'DAYS_30' ? 30 : bundleType === 'DAYS_15' ? 15 : 7} days
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Morning doorstep delivery:</span>
                <span className="font-bold text-emerald-400 font-mono">FREE (Included)</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-100">Total Upfront:</span>
                <span className="text-xl font-black text-emerald-400 font-mono">₹{getTotalPrice()}</span>
              </div>
            </div>
          </div>

          {/* Bottom Sticky Actions */}
          <div className="p-6 border-t border-slate-800 bg-slate-900/90 backdrop-blur-md">
            <button
              type="button"
              onClick={handleProceedToCheckout}
              className="w-full py-4 rounded-2xl font-black text-sm bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <span>→</span>
            </button>
            <p className="text-[10px] text-center text-slate-400 mt-2">
              Skip any delivery date with 1 click from your subscriber dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
