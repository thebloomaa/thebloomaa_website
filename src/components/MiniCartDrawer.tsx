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
        className="absolute inset-0 bg-brand-cream/70 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-brand-card border-l border-brand-border shadow-2xl flex flex-col justify-between overflow-y-auto">
          {/* Top Header */}
          <div className="p-6 border-b border-brand-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🥗</span>
              <div>
                <h3 className="text-base font-black text-brand-forest">Bundle Builder</h3>
                <p className="text-xs text-brand-forest-muted">Choose your commitment &amp; savings</p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeDrawer}
              className="p-2 rounded-xl text-brand-forest-muted hover:text-brand-forest hover:bg-brand-cream transition-colors"
              aria-label="Close drawer"
            >
              ✕
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-6 flex-grow">
            {/* Selected Product Summary Card */}
            <div className="rounded-2xl p-4 bg-brand-cream/50 border border-brand-border flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden relative flex-shrink-0 bg-brand-card border border-brand-border">
                <img
                  src={selectedProduct.imageUrl || '/meals/vegan-keto.png'}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-grow min-w-0">
                <h4 className="text-sm font-bold text-brand-forest truncate">{selectedProduct.name}</h4>
                <p className="text-[11px] text-brand-forest-muted mt-0.5">
                  🔥 {selectedProduct.calories} kcal · 💪 {selectedProduct.protein}g P · 🥑 {selectedProduct.fats}g F
                </p>
                <span className="text-xs font-bold text-brand-mustard font-mono mt-1 block">
                  ₹{selectedProduct.price} / diet
                </span>
              </div>
            </div>

            {/* Bundle Selection Options */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-forest-muted">
                  Select Subscription Bundle
                </label>
                <span className="text-[11px] text-brand-mustard font-semibold">Skip any day anytime</span>
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
                          ? 'bg-brand-mustard/15 border-brand-mustard shadow-md shadow-brand-mustard/10'
                          : 'bg-brand-cream/40 border-brand-border hover:bg-brand-cream/80 text-brand-forest-muted'
                      }`}
                    >
                      {opt.badge && (
                        <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-brand-mustard text-brand-forest shadow-sm">
                          {opt.badge}
                        </span>
                      )}

                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-brand-forest">{opt.label}</span>
                            <span className="text-xs font-bold text-brand-forest-muted">({opt.days} Days)</span>
                            {opt.discountLabel && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase bg-brand-mustard/20 text-brand-mustard border border-brand-mustard/30">
                                {opt.discountLabel}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-brand-forest-muted mt-1">
                            Daily morning delivery (6 AM – 9 AM)
                          </p>
                        </div>

                        <div className="text-right">
                          <div className="text-base font-black text-brand-mustard font-mono">₹{total}</div>
                          <div className="text-[10px] text-brand-forest-muted font-mono">₹{perDay}/day</div>
                        </div>
                      </div>

                      {savings > 0 && (
                        <div className="mt-2 pt-2 border-t border-brand-border/60 flex items-center justify-between text-[11px]">
                          <span className="text-brand-forest-muted">Total Bundle Savings:</span>
                          <span className="font-bold text-brand-mustard font-mono">Save ₹{savings}</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Summary Breakdown */}
            <div className="rounded-2xl p-4 bg-brand-cream/60 border border-brand-border/80 space-y-2 text-xs">
              <div className="flex justify-between text-brand-forest-muted">
                <span>Per-day rate:</span>
                <span className="font-bold text-brand-forest font-mono">₹{getPerDayPrice()}</span>
              </div>
              <div className="flex justify-between text-brand-forest-muted">
                <span>Scheduled duration:</span>
                <span className="font-bold text-brand-forest font-mono">
                  {bundleType === 'DAYS_30' ? 30 : bundleType === 'DAYS_15' ? 15 : 7} days
                </span>
              </div>
              <div className="flex justify-between text-brand-forest-muted">
                <span>Morning doorstep delivery:</span>
                <span className="font-bold text-brand-mustard font-mono">FREE (Included)</span>
              </div>
              <div className="pt-2 border-t border-brand-border flex justify-between items-baseline">
                <span className="text-sm font-bold text-brand-forest">Total Upfront:</span>
                <span className="text-xl font-black text-brand-mustard font-mono">₹{getTotalPrice()}</span>
              </div>
            </div>
          </div>

          {/* Bottom Sticky Actions */}
          <div className="p-6 border-t border-brand-border bg-brand-card/90 backdrop-blur-md">
            <button
              type="button"
              onClick={handleProceedToCheckout}
              className="w-full py-4 rounded-2xl font-black text-sm bg-brand-mustard text-brand-forest hover:bg-brand-mustard transition-all shadow-xl shadow-brand-mustard/25 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <span>→</span>
            </button>
            <p className="text-[10px] text-center text-brand-forest-muted mt-2">
              Skip any delivery date with 1 click from your subscriber dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
