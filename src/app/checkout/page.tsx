'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import { useBundleStore, type BundleType } from '@/store/useBundleStore';
import { BLOOMAA_PRODUCTS } from '@/lib/bioCalculator';
import AllergyPreferencesSelector from '@/components/AllergyPreferencesSelector';

export const dynamic = 'force-dynamic';

const STANDARD_BUNDLES: { type: BundleType; label: string; days: number; discount: string; discountPct: number }[] = [
  { type: 'DAYS_7', label: 'Starter', days: 7, discount: '', discountPct: 0 },
  { type: 'DAYS_15', label: 'Committed', days: 15, discount: '8% OFF', discountPct: 8 },
  { type: 'DAYS_30', label: 'All-In', days: 30, discount: '20% OFF', discountPct: 20 },
];

function CheckoutPageInner() {
  const router = useRouter();
  const { data: session } = useSession();
  const {
    selectedProduct,
    selectProduct,
    bundleType,
    selectBundle,
    getBundleDays,
    setAddress,
    address,
    deliveryTime,
    setDeliveryTime,
    deliveryNote,
    setDeliveryNote,
  } = useBundleStore();

  const [step, setStep] = useState<'summary' | 'address' | 'pay'>('summary');

  const [submitting, setSubmitting] = useState(false);
  const [pincodeError, setPincodeError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Address Form State
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    houseNo: '',
    street: '',
    city: 'Patna',
    state: 'Bihar',
    pincode: '',
    deliveryTime: deliveryTime || '07:00',
    deliveryNote: deliveryNote || '',
    allergies: '',
  });

  // Prefill from user session / profile if available
  useEffect(() => {
    if (session?.user) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || session.user?.name || '',
        email: prev.email || session.user?.email || '',
      }));

      fetch('/api/user/profile')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.user) {
            const defaultAddr =
              data.user.addresses?.find((a: any) => a.isDefault) ||
              data.user.addresses?.[0];

            setForm((prev) => ({
              ...prev,
              name: prev.name || data.user.name || '',
              phone: prev.phone || data.user.phone || '',
              email: prev.email || data.user.email || '',
              street: prev.street || defaultAddr?.street || '',
              city: defaultAddr?.city || prev.city || 'Patna',
              state: defaultAddr?.state || prev.state || 'Bihar',
              pincode: prev.pincode || defaultAddr?.pincode || '',
              allergies: prev.allergies || data.user.allergies || '',
            }));
          }
        })
        .catch((err) => console.error('Error fetching profile for checkout:', err));
    }
  }, [session]);



  const searchParams = useSearchParams();
  const planParam = searchParams ? searchParams.get('plan') : null;

  useEffect(() => {
    if (planParam === 'single') {
      const singleProd = BLOOMAA_PRODUCTS.SINGLE_DAY_TRIAL;
      selectProduct({
        id: singleProd.id,
        name: singleProd.name,
        description: singleProd.description,
        price: singleProd.price,
        imageUrl: singleProd.imageUrl,
        type: singleProd.type,
        calories: singleProd.calories,
        protein: singleProd.protein,
        carbs: singleProd.carbs,
        fats: singleProd.fats,
        dietaryPreference: singleProd.dietaryPreference,
      });
      selectBundle('DAYS_1');
    } else if (planParam === 'trial') {
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
      selectBundle('DAYS_7');
    }
  }, [planParam, selectProduct, selectBundle]);

  const isSingleProduct = Boolean(
    selectedProduct &&
      (selectedProduct.id === 'prod-single-day-diet-pack' ||
        selectedProduct.price === 70 ||
        bundleType === 'DAYS_1' ||
        (selectedProduct as any).isSinglePack ||
        selectedProduct.name.toLowerCase().includes('single'))
  );

  const isTrialProduct = Boolean(
    !isSingleProduct &&
    selectedProduct &&
    (selectedProduct.name.toLowerCase().includes('just bloomed') ||
      selectedProduct.type === 'TRIAL_PLAN' ||
      selectedProduct.dietaryPreference === 'LIVING_RAW' ||
      selectedProduct.isTrialPlan)
  );

  const finalDays = isSingleProduct ? 1 : isTrialProduct ? 7 : getBundleDays();

  useEffect(() => {
    if (isSingleProduct && bundleType !== 'DAYS_1') {
      selectBundle('DAYS_1');
    } else if (isTrialProduct && bundleType !== 'DAYS_7') {
      selectBundle('DAYS_7');
    }
  }, [isSingleProduct, isTrialProduct, bundleType, selectBundle]);



  const handleConfirmPayment = async () => {
    if (!selectedProduct) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const fullStreet = form.houseNo ? `${form.houseNo}, ${form.street}` : form.street;
      const effectiveUtr = `PRE_BOOK_${Date.now().toString().slice(-8)}`;

      const allergyTag = form.allergies ? `⚠️ ALLERGIES / EXCLUSIONS: ${form.allergies}` : '';
      const combinedDeliveryNote = [allergyTag, form.deliveryNote].filter(Boolean).join(' | ');

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          bundleType: isSingleProduct ? 'DAYS_1' : isTrialProduct ? 'DAYS_7' : (bundleType || 'DAYS_15'),
          deliveryTime: form.deliveryTime,
          deliveryNote: isSingleProduct
            ? `1-DAY SINGLE PACK: Morning fresh diet box. ${combinedDeliveryNote}`
            : isTrialProduct
            ? `6+1 BUNDLE DROP: Just Bloomed 7D Trial. ${combinedDeliveryNote}`
            : (combinedDeliveryNote || form.deliveryNote),
          allergies: form.allergies,
          utr: effectiveUtr,
          address: {
            street: fullStreet,
            city: form.city,
            state: form.state,
            pincode: form.pincode,
          },
        }),
      });

      if (res.status === 401) {
        router.push('/login?callbackUrl=/checkout');
        return;
      }

      const data = await res.json();
      if (res.ok && data.success) {
        setOrderSuccess(true);
        setTimeout(() => {
          useBundleStore.getState().reset();
          router.push('/dashboard');
          router.refresh();
        }, 2000);
      } else {
        setSubmitError(data.error || 'Failed to confirm order. Please try again.');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setSubmitError('Network error occurred during payment confirmation.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleValidateAndProceedAddress = () => {
    if (!form.name || !form.phone || !form.street || !form.pincode) {
      alert('Please fill out all required address fields.');
      return;
    }

    if (form.pincode.length !== 6) {
      setPincodeError('Pincode must be 6 digits.');
      return;
    }

    // Combine House No & Street
    const fullStreet = form.houseNo ? `${form.houseNo}, ${form.street}` : form.street;

    setAddress({
      street: fullStreet,
      city: form.city,
      state: form.state,
      pincode: form.pincode,
    });
    setDeliveryTime(form.deliveryTime);
    setDeliveryNote(form.deliveryNote);
    setPincodeError(null);
    setStep('pay');
  };

  // If no product selected, show prompt to browse meals or calculator
  if (!selectedProduct) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-28 pb-16 px-4 flex items-center justify-center" style={{ background: 'var(--bg-dark)' }}>
          <div className="text-center max-w-md p-8 rounded-3xl bg-brand-card border border-brand-border shadow-2xl">
            <div className="text-6xl mb-4">🌱</div>
            <h1 className="text-2xl font-black mb-2 text-brand-forest">No Plan Selected</h1>
            <p className="text-sm mb-6 text-brand-forest-muted leading-relaxed">
              Order our Single Day Pack to try tomorrow morning, claim the 7-Day Living Reset, or run the Bio Calculator.
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
              <button
                type="button"
                onClick={() => {
                  const p = BLOOMAA_PRODUCTS.SINGLE_DAY_TRIAL;
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
                  selectBundle('DAYS_1');
                }}
                className="px-5 py-3 rounded-xl text-xs font-black text-brand-forest bg-brand-mustard hover:bg-brand-mustard-hover transition-all shadow-md cursor-pointer"
              >
                1-Day Pack
              </button>
              <button
                type="button"
                onClick={() => {
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
                }}
                className="px-5 py-3 rounded-xl text-xs font-black text-brand-forest bg-brand-mustard hover:bg-brand-forest-muted transition-all shadow-md cursor-pointer"
              >
                7-Day Trial
              </button>
              <Link
                href="/calculator"
                className="px-4 py-3 rounded-xl text-xs font-bold text-brand-forest bg-brand-cream hover:bg-brand-border transition-all flex items-center justify-center"
              >
                Calculator
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--bg-dark)' }}>
        <div className="max-w-4xl mx-auto">
          {/* Multi-Step Stepper Header */}
          <div className="flex items-center justify-center gap-3 mb-10">
            {[
              { id: 'summary', label: '1. Order Summary' },
              { id: 'address', label: '2. Delivery Address' },
              { id: 'pay', label: '3. Pre-Book' },
            ].map((s, idx) => {
              const stepOrder = ['summary', 'address', 'pay'];
              const currentIdx = stepOrder.indexOf(step);
              const isPast = currentIdx > idx;
              const isCurrent = step === s.id;

              return (
                <React.Fragment key={s.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                        isCurrent
                          ? 'bg-brand-mustard text-brand-forest ring-4 ring-brand-mustard/20 scale-105'
                          : isPast
                          ? 'bg-brand-mustard-hover text-brand-forest'
                          : 'bg-brand-cream text-brand-forest-muted'
                      }`}
                    >
                      {isPast ? '✓' : idx + 1}
                    </div>
                    <span
                      className={`text-xs font-bold hidden sm:inline transition-colors ${
                        isCurrent ? 'text-brand-mustard' : 'text-brand-forest-muted'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {idx < 2 && (
                    <div
                      className={`w-12 sm:w-20 h-0.5 transition-colors ${
                        isPast ? 'bg-brand-mustard' : 'bg-brand-cream'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* STEP 1: ORDER SUMMARY */}
          {step === 'summary' && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="text-center mb-6">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-mustard/10 text-brand-mustard border border-brand-mustard/20">
                  Step 1 of 3 · Verification
                </span>
                <h2 className="text-2xl sm:text-3xl font-black mt-2 text-brand-forest">Review Your Diet Plan</h2>
                <p className="text-xs sm:text-sm text-brand-forest-muted mt-1">
                  Bloom-tracked, chef-crafted, and delivered fresh to your door every morning.
                </p>
              </div>

              {/* Product Hero Card */}
              <div className="rounded-3xl p-6 sm:p-8 backdrop-blur-xl bg-brand-card/90 border border-brand-border shadow-2xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row gap-6 items-center">
                  <div className="w-full sm:w-44 h-40 rounded-2xl overflow-hidden relative flex-shrink-0 bg-brand-cream border border-brand-border">
                    <img
                      src={selectedProduct.imageUrl || '/meals/vegan-keto.png'}
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-brand-cream/80 text-brand-mustard border border-brand-mustard/30">
                      {selectedProduct.dietaryPreference.replace('_', ' ')}
                    </div>
                  </div>

                  <div className="flex-grow text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                      <h3 className="text-xl sm:text-2xl font-black text-brand-forest">{selectedProduct.name}</h3>
                      <div className="text-xl font-black text-brand-mustard font-mono">
                        {isSingleProduct
                          ? 'Single Day Diet Pack (Price TBA)'
                          : isTrialProduct
                          ? 'Flat 7D Trial (Price TBA)'
                          : `Price TBA`}
                      </div>
                    </div>

                    <p className="text-xs text-brand-forest-muted mt-2 leading-relaxed max-w-xl">
                      {selectedProduct.description}
                    </p>

                    {/* Bloom Badges */}
                    <div className="flex flex-wrap gap-2.5 mt-4 justify-center sm:justify-start">
                      <span className="px-3 py-1 rounded-xl text-xs font-bold bg-brand-mustard/10 text-brand-mustard border border-brand-mustard/20 font-mono">
                        🔥 {selectedProduct.calories} kcal
                      </span>
                      <span className="px-3 py-1 rounded-xl text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                        💪 {selectedProduct.protein}g Protein
                      </span>
                      <span className="px-3 py-1 rounded-xl text-xs font-bold bg-brand-mustard/10 text-brand-forest-muted border border-brand-mustard/20 font-mono">
                        🍞 {selectedProduct.carbs}g Carbs
                      </span>
                      <span className="px-3 py-1 rounded-xl text-xs font-bold bg-brand-mustard/10 text-brand-mustard border border-brand-mustard/20 font-mono">
                        🥑 {selectedProduct.fats}g Fats
                      </span>
                    </div>
                  </div>
                </div>

                {/* Single Pack 1-Day Logistics Alert */}
                {isSingleProduct && (
                  <div className="mt-6 p-4 rounded-2xl bg-brand-mustard/10 border border-brand-mustard/30 text-xs text-brand-mustard-hover space-y-1">
                    <div className="flex items-center gap-2 font-black uppercase tracking-wider text-[11px]">
                      <span>🌱</span>
                      <span>1-Day Single Drop Logistics Protocol</span>
                    </div>
                    <p className="text-[11px] text-brand-forest-muted leading-relaxed">
                      Delivered tomorrow morning between <strong>6:00 AM – 9:00 AM</strong> at your Patna address with dedicated doorstep delivery and zero recurring commitments.
                    </p>
                  </div>
                )}

                {/* Trial Plan 6+1 Logistics Alert */}
                {isTrialProduct && (
                  <div className="mt-6 p-4 rounded-2xl bg-brand-mustard/10 border border-brand-mustard/30 text-xs text-brand-forest-muted space-y-1">
                    <div className="flex items-center gap-2 font-black uppercase tracking-wider text-[11px]">
                      <span>🚚</span>
                      <span>6+1 Logistics Protocol Active</span>
                    </div>
                    <p className="text-[11px] text-brand-forest-muted leading-relaxed">
                      Delivered across <strong>6 active mornings (5:00 AM – 8:00 AM)</strong>. On Day 6, your rider will execute a <strong>Double Drop</strong> (delivering Box 6 &amp; Box 7 together) for your Day 7 Gut Reset.
                    </p>
                  </div>
                )}
              </div>

              {/* Standard Meal Plan Bundle Selector (Hidden for Trial & Single Pack) */}
              {!isTrialProduct && !isSingleProduct && (
                <div className="rounded-3xl p-6 sm:p-8 backdrop-blur-xl bg-brand-card/80 border border-brand-border">
                  <h4 className="text-sm font-black uppercase tracking-wider text-brand-forest-muted mb-4">
                    Subscription Duration
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {STANDARD_BUNDLES.map((b) => {
                      const isSelected = bundleType === b.type;
                      return (
                        <button
                          key={b.type}
                          type="button"
                          onClick={() => selectBundle(b.type)}
                          className={`p-4 rounded-2xl text-left transition-all border relative ${
                            isSelected
                              ? 'bg-brand-mustard/15 border-brand-mustard shadow-md shadow-brand-mustard/15'
                              : 'bg-brand-cream/40 border-brand-border hover:bg-brand-cream text-brand-forest-muted'
                          }`}
                        >
                          {b.discount && (
                            <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-brand-mustard text-brand-forest">
                              {b.discount}
                            </span>
                          )}
                          <div className="text-sm font-bold text-brand-forest">{b.label} ({b.days} Days)</div>
                          <p className="text-xs text-brand-forest-muted mt-1">Skip any day with 1-click</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Price Calculation Summary */}
              <div className="rounded-3xl p-6 sm:p-8 backdrop-blur-xl bg-brand-card/80 border border-brand-border">
                <h4 className="text-sm font-black uppercase tracking-wider text-brand-forest-muted mb-4">
                  Pricing Breakdown
                </h4>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-brand-forest-muted">
                    <span>Effective daily rate:</span>
                    <span className="font-bold text-brand-forest font-mono">TBA</span>
                  </div>
                  <div className="flex justify-between text-brand-forest-muted">
                    <span>Scheduled duration:</span>
                    <span className="font-bold text-brand-forest font-mono">{finalDays} days</span>
                  </div>
                  <div className="flex justify-between text-brand-forest-muted">
                    <span>Doorstep morning delivery:</span>
                    <span className="font-bold text-brand-mustard font-mono">FREE (Included)</span>
                  </div>
                  <div className="pt-3 border-t border-brand-border flex justify-between items-baseline">
                    <span className="text-base font-bold text-brand-forest">Total Payable:</span>
                    <span className="text-2xl font-black text-brand-mustard font-mono">TBA</span>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep('address')}
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-sm bg-brand-mustard text-brand-forest hover:bg-brand-mustard transition-all shadow-xl shadow-brand-mustard/25 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Continue to Delivery Address →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: DELIVERY ADDRESS FORM */}
          {step === 'address' && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="text-center mb-6">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-mustard/10 text-brand-mustard border border-brand-mustard/20">
                  Step 2 of 3 · Logistics
                </span>
                <h2 className="text-2xl sm:text-3xl font-black mt-2 text-brand-forest">Where Should We Deliver?</h2>
                <p className="text-xs sm:text-sm text-brand-forest-muted mt-1">
                  Fresh cloud kitchen delivery in Patna between 5:00 AM – 8:00 AM daily.
                </p>
              </div>

              <div className="rounded-3xl p-6 sm:p-8 backdrop-blur-xl bg-brand-card/90 border border-brand-border shadow-2xl space-y-5">
                {/* User Session Autofill Notice */}
                {session?.user ? (
                  <div className="p-3.5 rounded-2xl bg-brand-mustard/10 border border-brand-mustard/30 text-xs text-brand-mustard-hover flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-mustard animate-pulse" />
                    <span>
                      Logged in as <strong>{session.user.name || session.user.email}</strong>. Details auto-filled from your profile.
                    </span>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-brand-cream/80 border border-brand-border text-xs text-brand-forest-muted flex items-center justify-between">
                    <span>Already a member?</span>
                    <Link
                      href="/login?callbackUrl=/checkout"
                      className="text-brand-mustard hover:text-brand-mustard-hover font-bold underline transition-colors"
                    >
                      Log in to auto-fill address →
                    </Link>
                  </div>
                )}

                {/* Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-brand-forest-muted mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aditi Sharma"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-brand-cream/80 border border-brand-border text-base sm:text-sm text-brand-forest focus:outline-none focus:border-brand-mustard min-h-[46px]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-brand-forest-muted mb-1.5">
                      Mobile Phone (for delivery SMS/call) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-brand-cream/80 border border-brand-border text-base sm:text-sm text-brand-forest focus:outline-none focus:border-brand-mustard min-h-[46px]"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-forest-muted mb-1.5">
                    Email Address (for subscription confirmation)
                  </label>
                  <input
                    type="email"
                    placeholder="aditi@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-brand-cream/80 border border-brand-border text-base sm:text-sm text-brand-forest focus:outline-none focus:border-brand-mustard min-h-[46px]"
                  />
                </div>

                {/* House No & Street Address */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-brand-forest-muted mb-1.5">
                      Flat / House No. *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Flat 402, Block B"
                      value={form.houseNo}
                      onChange={(e) => setForm({ ...form, houseNo: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-brand-cream/80 border border-brand-border text-base sm:text-sm text-brand-forest focus:outline-none focus:border-brand-mustard min-h-[46px]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-brand-forest-muted mb-1.5">
                      Street / Society / Landmark *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Punaichak, near Pumphouse"
                      value={form.street}
                      onChange={(e) => setForm({ ...form, street: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-brand-cream/80 border border-brand-border text-base sm:text-sm text-brand-forest focus:outline-none focus:border-brand-mustard min-h-[46px]"
                    />
                  </div>
                </div>

                {/* City, State & Pincode */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-brand-forest-muted mb-1.5">
                      City
                    </label>
                    <input
                      type="text"
                      value={form.city}
                      disabled
                      className="w-full px-4 py-3 rounded-xl bg-brand-cream/40 border border-brand-border text-base sm:text-sm text-brand-forest-muted cursor-not-allowed min-h-[46px]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-brand-forest-muted mb-1.5">
                      State
                    </label>
                    <input
                      type="text"
                      value={form.state}
                      disabled
                      className="w-full px-4 py-3 rounded-xl bg-brand-cream/40 border border-brand-border text-base sm:text-sm text-brand-forest-muted cursor-not-allowed min-h-[46px]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-brand-forest-muted mb-1.5">
                      Pincode (Patna) *
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="e.g. 800001"
                      value={form.pincode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setForm({ ...form, pincode: val });
                      }}
                      className="w-full px-4 py-3 rounded-xl bg-brand-cream/80 border border-brand-border text-base sm:text-sm text-brand-forest focus:outline-none focus:border-brand-mustard font-mono min-h-[46px]"
                    />
                    {pincodeError && (
                      <p className="text-[11px] text-red-400 mt-1">{pincodeError}</p>
                    )}
                  </div>
                </div>

                {/* Delivery Time Slot & Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-brand-forest-muted mb-1.5">
                      Preferred Morning Delivery Slot *
                    </label>
                    <select
                      value={form.deliveryTime}
                      onChange={(e) => setForm({ ...form, deliveryTime: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-brand-cream/80 border border-brand-border text-base sm:text-sm text-brand-forest focus:outline-none focus:border-brand-mustard min-h-[46px]"
                    >
                      <option value="06:00">06:00 AM (Early Riser)</option>
                      <option value="06:30">06:30 AM</option>
                      <option value="07:00">07:00 AM (Standard Fitness Prep)</option>
                      <option value="07:30">07:30 AM</option>
                      <option value="08:00">08:00 AM</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-brand-forest-muted mb-1.5">
                      Delivery Instructions (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Leave with guard / Ring bell once"
                      value={form.deliveryNote}
                      onChange={(e) => setForm({ ...form, deliveryNote: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-brand-cream/80 border border-brand-border text-base sm:text-sm text-brand-forest focus:outline-none focus:border-brand-mustard min-h-[46px]"
                    />
                  </div>
                </div>

                {/* Allergies & Fruit/Seed Customization Selector */}
                <div className="pt-2">
                  <AllergyPreferencesSelector
                    value={form.allergies}
                    onChange={(val) => setForm({ ...form, allergies: val })}
                    title="Allergies & Custom Bowl Preferences"
                    subtitle="Have any allergies, or fruits/seeds you dislike? Our cloud kitchen will hand-adjust your bowl."
                  />
                </div>

                <div className="pt-4 border-t border-brand-border flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep('summary')}
                    className="px-6 py-3.5 rounded-2xl text-sm font-semibold border border-brand-border text-brand-forest-muted hover:bg-brand-cream transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={handleValidateAndProceedAddress}
                    className="px-8 py-3.5 rounded-2xl font-black text-sm bg-brand-mustard text-brand-forest hover:bg-brand-mustard transition-all shadow-xl shadow-brand-mustard/25 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Proceed to Pre-Book →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: UPI PAYMENT ENFORCEMENT */}
          {step === 'pay' && (
            <div className="space-y-6 animate-fade-in-up">
              {/* ORDER SUCCESS OVERLAY */}
              {orderSuccess ? (
                <div className="rounded-3xl p-8 sm:p-12 backdrop-blur-xl bg-brand-card/95 border-2 border-brand-mustard shadow-2xl text-center space-y-5 animate-fade-in-up">
                  <div className="w-16 h-16 rounded-full bg-brand-mustard/20 text-brand-mustard border-2 border-brand-mustard flex items-center justify-center text-3xl mx-auto">
                    ✓
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-brand-forest">
                    Subscription Confirmed! 🎉
                  </h2>
                  <p className="text-sm text-brand-forest-muted max-w-md mx-auto leading-relaxed">
                    Your morning diet prep has been scheduled. Cold-chain morning drop begins tomorrow at{' '}
                    <strong className="text-brand-mustard font-mono">{form.deliveryTime || '07:00'} AM</strong>.
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-cream text-xs font-mono text-brand-mustard">
                    <span className="w-2 h-2 rounded-full bg-brand-mustard animate-pulse" />
                    Redirecting to your Subscriber Dashboard...
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-mustard/10 text-brand-mustard border border-brand-mustard/20">
                      Step 3 of 3 · Pre-Book Confirmation
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black mt-2 text-brand-forest">Confirm Pre-Booking</h2>
                    <p className="text-xs sm:text-sm text-brand-forest-muted mt-1">
                      No payment required at this time. We will contact you once pricing is finalized.
                    </p>
                  </div>

                  {/* Submission Error Banner */}
                  {submitError && (
                    <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs flex items-center justify-between">
                      <span>⚠️ {submitError}</span>
                      <button
                        type="button"
                        onClick={() => setSubmitError(null)}
                        className="text-brand-forest-muted hover:text-brand-forest text-sm font-bold ml-2"
                      >
                        ×
                      </button>
                    </div>
                  )}

                  <div className="rounded-3xl p-6 sm:p-10 backdrop-blur-xl bg-brand-card/90 border border-brand-border shadow-2xl space-y-6 text-center">
                      <p className="text-brand-forest-muted">Please confirm your pre-booking for {selectedProduct.name}. Pricing will be announced soon.</p>
                      <button
                          type="button"
                          disabled={submitting}
                          onClick={() => handleConfirmPayment()}
                          className="w-full sm:w-auto px-8 py-4 mx-auto rounded-2xl font-black text-sm bg-brand-mustard text-brand-forest hover:bg-brand-mustard transition-all shadow-xl shadow-brand-mustard/25 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                        >
                          {submitting ? (
                            <>
                              <span className="w-4 h-4 border-2 border-brand-forest border-t-transparent rounded-full animate-spin" />
                              <span>Confirming...</span>
                            </>
                          ) : (
                            <>
                              <span>Confirm Pre-Booking</span>
                              <span>→</span>
                            </>
                          )}
                        </button>
                  </div>

                </>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-brand-cream flex items-center justify-center text-brand-forest-muted font-mono text-sm">
          Loading Checkout...
        </div>
      }
    >
      <CheckoutPageInner />
    </Suspense>
  );
}
