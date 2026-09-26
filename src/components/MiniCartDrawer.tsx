'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBundleStore, type BundleType } from '@/store/useBundleStore';
import { BLOOMAA_PRODUCTS } from '@/lib/bioCalculator';

const BUNDLE_OPTIONS: { type: BundleType; label: string; days: number; discountPct: number; discountLabel?: string; badge?: string }[] = [
  { type: 'DAYS_7', label: 'Just Bloom Plan', days: 7, discountPct: 0, badge: 'Most Popular' },
  { type: 'DAYS_30', label: 'Custom Monthly Plan', days: 30, discountPct: 20, discountLabel: 'Best Value', badge: '30 Days' },
];

export default function MiniCartDrawer() {
  const router = useRouter();
  const {
    selectedProduct,
    selectProduct,
    bundleType,
    selectBundle,
    isDrawerOpen,
    closeDrawer,
  } = useBundleStore();

  // Set default bundle if none selected
  useEffect(() => {
    if (isDrawerOpen && (!bundleType || bundleType === 'DAYS_15')) {
      selectBundle('DAYS_7');
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

  if (!isDrawerOpen) return null;

  const handleSelectPlan = (plan: 'trial' | 'monthly') => {
    if (plan === 'trial') {
      const p = BLOOMAA_PRODUCTS.JUST_BLOOMED_TRIAL;
      selectProduct({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        imageUrl: p.imageUrl,
        type: p.type,
        calories: p.calories,
        protein: p.protein,
        carbs: p.carbs,
        fats: p.fats,
        dietaryPreference: p.dietaryPreference,
      });
      selectBundle('DAYS_7');
      closeDrawer();
      router.push('/checkout?plan=trial');
    } else {
      const p = BLOOMAA_PRODUCTS.MONTHLY_SUBSCRIPTION;
      selectProduct({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        imageUrl: p.imageUrl,
        type: p.type,
        calories: p.calories,
        protein: p.protein,
        carbs: p.carbs,
        fats: p.fats,
        dietaryPreference: p.dietaryPreference,
      });
      selectBundle('DAYS_30');
      closeDrawer();
      router.push('/checkout?plan=monthly');
    }
  };

  const handleProceedToCheckout = () => {
    closeDrawer();
    router.push('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div
        onClick={closeDrawer}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-[#FAF7F2] border-l border-[#DDD5C0] shadow-2xl flex flex-col justify-between overflow-y-auto animate-slide-in-right">
          
          {/* Top Header */}
          <div className="p-5 sm:p-6 border-b border-[#E8E2D2] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🥗</span>
              <div>
                <h3 className="text-base font-bold text-[#0D2818] font-serif">Your Pre-Booking Cart</h3>
                <p className="text-[11px] text-[#5E7A67]">
                  {selectedProduct ? '1 Plan Selected' : 'No Plan Selected Yet'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeDrawer}
              className="w-8 h-8 rounded-full bg-[#FAF7F2] hover:bg-[#EAE2D2] text-[#0D2818] flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
              aria-label="Close drawer"
            >
              ✕
            </button>
          </div>

          {/* ========================================================= */}
          {/* CASE A: EMPTY CART STATE                                  */}
          {/* ========================================================= */}
          {!selectedProduct ? (
            <div className="p-6 sm:p-8 flex flex-col items-center justify-center text-center my-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-white border border-[#DDD5C0] flex items-center justify-center text-3xl shadow-sm">
                🌱
              </div>
              <div>
                <h4 className="font-serif text-lg font-bold text-[#0D2818]">Your Cart is Empty</h4>
                <p className="text-xs text-[#5E7A67] mt-1.5 max-w-xs leading-relaxed">
                  Pre-orders are live for our <strong>30th September Launch</strong> in Patna! Choose a plan below with zero advance payment.
                </p>
              </div>

              {/* 2 Quick Plan Option Cards */}
              <div className="w-full space-y-2.5 pt-2 text-left">
                <button
                  type="button"
                  onClick={() => handleSelectPlan('trial')}
                  className="w-full p-3.5 rounded-2xl bg-white border-2 border-[#D97706] hover:border-[#B45309] hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div>
                    <span className="text-[10px] font-black uppercase text-[#D97706] tracking-wider block">Most Popular</span>
                    <strong className="text-xs font-bold text-[#0D2818] block">Just Bloom Plan</strong>
                    <span className="text-[10px] text-[#5E7A67]">6 rotating bowls + 1 Surprise Box</span>
                  </div>
                  <span className="text-xs font-bold text-[#D97706] group-hover:translate-x-1 transition-transform">
                    Pre-Book →
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectPlan('monthly')}
                  className="w-full p-3.5 rounded-2xl bg-white border border-[#DDD5C0] hover:border-[#0F3826] hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div>
                    <span className="text-[10px] font-black uppercase text-[#0F3826] tracking-wider block">Best Value</span>
                    <strong className="text-xs font-bold text-[#0D2818] block">Custom Monthly Plan</strong>
                    <span className="text-[10px] text-[#5E7A67]">30-day complete living food routine</span>
                  </div>
                  <span className="text-xs font-bold text-[#0F3826] group-hover:translate-x-1 transition-transform">
                    Pre-Book →
                  </span>
                </button>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    closeDrawer();
                    const el = document.getElementById('bowls');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-xs font-semibold text-[#5E7A67] hover:text-[#0D2818] underline transition-colors cursor-pointer"
                >
                  ← Browse Our Bloom Menu
                </button>
              </div>
            </div>
          ) : (
            /* ========================================================= */
            /* CASE B: PRODUCT SELECTED STATE                            */
            /* ========================================================= */
            <div className="p-5 sm:p-6 space-y-5 flex-grow">
              {/* Selected Product Summary Card */}
              <div className="rounded-2xl p-4 bg-white border border-[#DDD5C0] shadow-xs flex items-center gap-3.5">
                <div className="w-16 h-16 rounded-xl overflow-hidden relative shrink-0 bg-[#FAF7F2] border border-[#DDD5C0]">
                  <img
                    src={selectedProduct.imageUrl || '/hero-patna-bowl.jpg'}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-grow min-w-0">
                  <h4 className="text-sm font-bold text-[#0D2818] font-serif truncate">{selectedProduct.name}</h4>
                  <p className="text-[11px] text-[#5E7A67] mt-0.5">
                    🔥 {selectedProduct.calories || 340} kcal · 💪 {selectedProduct.protein || 16}g Protein
                  </p>
                  <span className="text-xs font-bold text-[#D97706] font-mono mt-1 block">
                    Price: TBA (No advance payment)
                  </span>
                </div>
              </div>

              {/* Bundle Selection Options */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#0D2818]">
                    Choose Plan Routine
                  </label>
                  <span className="text-[11px] text-[#0F3826] font-semibold">Morning 6–9 AM Drop</span>
                </div>

                <div className="space-y-2.5">
                  {BUNDLE_OPTIONS.map((opt) => {
                    const isSelected = bundleType === opt.type;

                    return (
                      <button
                        key={opt.type}
                        type="button"
                        onClick={() => selectBundle(opt.type)}
                        className={`w-full p-3.5 rounded-2xl text-left transition-all border relative cursor-pointer ${
                          isSelected
                            ? 'bg-[#FEF9EC] border-[#D97706] shadow-sm'
                            : 'bg-white border-[#DDD5C0] hover:bg-[#FAF7F2]'
                        }`}
                      >
                        {opt.badge && (
                          <span className={`absolute -top-2 right-4 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            opt.type === 'DAYS_7' ? 'bg-[#D97706] text-white' : 'bg-[#0F3826] text-white'
                          } shadow-xs`}>
                            {opt.badge}
                          </span>
                        )}

                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-xs font-bold text-[#0D2818] block">{opt.label}</span>
                            <span className="text-[10px] text-[#5E7A67]">{opt.days} fresh morning deliveries in Patna</span>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-black text-[#D97706] font-mono">Price TBA</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pre-Launch Commitment Note */}
              <div className="rounded-2xl p-3.5 bg-white border border-[#DDD5C0] text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F3826]">
                  <span>🗓️</span>
                  <span>Deliveries Start 30th September 2026</span>
                </div>
                <p className="text-[11px] text-[#5E7A67] leading-relaxed">
                  Locking your slot today guarantees doorstep delivery in Patna. Intro pricing and delivery confirmation will be shared on WhatsApp before launch.
                </p>
              </div>
            </div>
          )}

          {/* Bottom Sticky Action Footer */}
          {selectedProduct && (
            <div className="p-5 sm:p-6 border-t border-[#E8E2D2] bg-white">
              <button
                type="button"
                onClick={handleProceedToCheckout}
                className="w-full py-3.5 rounded-full font-bold text-xs sm:text-sm bg-[#0F3826] hover:bg-[#185338] text-white transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Pre-Book</span>
                <span>→</span>
              </button>
              <p className="text-[10px] text-center text-[#5E7A67] mt-2">
                🌿 Zero advance payment required today
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
