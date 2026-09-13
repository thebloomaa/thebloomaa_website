'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useBundleStore, type BundleType } from '@/store/useBundleStore';

const STANDARD_BUNDLES: { type: BundleType; label: string; days: number; discount: string; discountPct: number }[] = [
  { type: 'DAYS_7', label: 'Starter', days: 7, discount: '', discountPct: 0 },
  { type: 'DAYS_15', label: 'Committed', days: 15, discount: '8% OFF', discountPct: 8 },
  { type: 'DAYS_30', label: 'All-In', days: 30, discount: '20% OFF', discountPct: 20 },
];

export default function CheckoutPage() {
  const router = useRouter();
  const {
    selectedProduct,
    bundleType,
    selectBundle,
    getTotalPrice,
    getPerDayPrice,
    getBundleDays,
    setAddress,
    address,
    deliveryTime,
    setDeliveryTime,
    deliveryNote,
    setDeliveryNote,
  } = useBundleStore();

  const [step, setStep] = useState<'summary' | 'address' | 'pay'>('summary');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pincodeError, setPincodeError] = useState<string | null>(null);

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
  });

  const [utr, setUtr] = useState('');

  const isTrialProduct = Boolean(
    selectedProduct &&
    (selectedProduct.name.toLowerCase().includes('just bloomed') ||
      selectedProduct.type === 'TRIAL_PLAN' ||
      selectedProduct.dietaryPreference === 'LIVING_RAW' ||
      selectedProduct.isTrialPlan)
  );

  // Calculate strict checkout total
  const finalTotal = isTrialProduct ? 451 : getTotalPrice();
  const finalDays = isTrialProduct ? 7 : getBundleDays();
  const finalPerDay = isTrialProduct ? Math.round(451 / 7) : getPerDayPrice();

  useEffect(() => {
    if (isTrialProduct && bundleType !== 'DAYS_7') {
      selectBundle('DAYS_7');
    }
  }, [isTrialProduct, bundleType, selectBundle]);

  // If no product selected, show prompt to browse meals or calculator
  if (!selectedProduct) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-28 pb-16 px-4 flex items-center justify-center" style={{ background: 'var(--bg-dark)' }}>
          <div className="text-center max-w-md p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
            <div className="text-6xl mb-4">🌱</div>
            <h1 className="text-2xl font-black mb-2 text-slate-100">No Plan Selected</h1>
            <p className="text-sm mb-6 text-slate-400 leading-relaxed">
              Claim the Just Bloomed 7-Day Living Food Trial (₹451) or run the Bio Calculator to discover your biological diet score.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/#trial"
                className="px-6 py-3 rounded-xl text-sm font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
              >
                Claim 7D Trial (₹451)
              </Link>
              <Link
                href="/calculator"
                className="px-6 py-3 rounded-xl text-sm font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 transition-all"
              >
                Bio Calculator
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

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

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText('thebloomaa@upi');
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleConfirmPayment = async () => {
    if (utr.trim().length !== 12) {
      alert('Please enter a valid 12-digit UPI UTR / Transaction Reference Number.');
      return;
    }

    setSubmitting(true);
    try {
      const fullStreet = form.houseNo ? `${form.houseNo}, ${form.street}` : form.street;
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          bundleType: isTrialProduct ? 'DAYS_7' : (bundleType || 'DAYS_15'),
          deliveryTime: form.deliveryTime,
          deliveryNote: isTrialProduct
            ? `6+1 BUNDLE DROP: Just Bloomed 7D Trial. Customer Note: ${form.deliveryNote}`
            : form.deliveryNote,
          utr: utr.trim(),
          address: {
            street: fullStreet,
            city: form.city,
            state: form.state,
            pincode: form.pincode,
          },
        }),
      });

      if (res.status === 401) {
        // User not logged in, route to login with redirect
        router.push('/login?callbackUrl=/checkout');
        return;
      }

      const data = await res.json();
      if (res.ok && data.success) {
        alert('🎉 Subscription confirmed! Your fresh morning meal prep is scheduled.');
        router.push('/dashboard');
        router.refresh();
      } else {
        alert(data.error || 'Failed to confirm order. Please try again.');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Network error occurred during payment verification.');
    } finally {
      setSubmitting(false);
    }
  };

  // Dynamic UPI Intent String
  const upiIntentUri = `upi://pay?pa=thebloomaa@upi&pn=TheBlooMaa&am=${finalTotal}&cu=INR&tn=${encodeURIComponent(selectedProduct.name)}`;

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
              { id: 'pay', label: '3. UPI Payment' },
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
                          ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/20 scale-105'
                          : isPast
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isPast ? '✓' : idx + 1}
                    </div>
                    <span
                      className={`text-xs font-bold hidden sm:inline transition-colors ${
                        isCurrent ? 'text-emerald-400' : 'text-slate-400'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {idx < 2 && (
                    <div
                      className={`w-12 sm:w-20 h-0.5 transition-colors ${
                        isPast ? 'bg-emerald-500' : 'bg-slate-800'
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
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Step 1 of 3 · Verification
                </span>
                <h2 className="text-2xl sm:text-3xl font-black mt-2 text-slate-100">Review Your Meal Plan</h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Macro-tracked, chef-crafted, and delivered fresh to your door every morning.
                </p>
              </div>

              {/* Product Hero Card */}
              <div className="rounded-3xl p-6 sm:p-8 backdrop-blur-xl bg-slate-900/90 border border-slate-800 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row gap-6 items-center">
                  <div className="w-full sm:w-44 h-40 rounded-2xl overflow-hidden relative flex-shrink-0 bg-slate-950 border border-slate-700">
                    <img
                      src={selectedProduct.imageUrl || '/meals/chicken-prep.png'}
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-950/80 text-emerald-400 border border-emerald-500/30">
                      {selectedProduct.dietaryPreference.replace('_', ' ')}
                    </div>
                  </div>

                  <div className="flex-grow text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                      <h3 className="text-xl sm:text-2xl font-black text-slate-100">{selectedProduct.name}</h3>
                      <div className="text-xl font-black text-emerald-400 font-mono">
                        {isTrialProduct ? '₹451 (Flat 7D Trial)' : `₹${selectedProduct.price}/meal`}
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 mt-2 leading-relaxed max-w-xl">
                      {selectedProduct.description}
                    </p>

                    {/* Macro Badges */}
                    <div className="flex flex-wrap gap-2.5 mt-4 justify-center sm:justify-start">
                      <span className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                        🔥 {selectedProduct.calories} kcal
                      </span>
                      <span className="px-3 py-1 rounded-xl text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                        🥩 {selectedProduct.protein}g Protein
                      </span>
                      <span className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-400/10 text-amber-300 border border-amber-400/20 font-mono">
                        🍞 {selectedProduct.carbs}g Carbs
                      </span>
                      <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                        🥑 {selectedProduct.fats}g Fats
                      </span>
                    </div>
                  </div>
                </div>

                {/* Trial Plan 6+1 Logistics Alert */}
                {isTrialProduct && (
                  <div className="mt-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 space-y-1">
                    <div className="flex items-center gap-2 font-black uppercase tracking-wider text-[11px]">
                      <span>🚚</span>
                      <span>6+1 Logistics Protocol Active</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Delivered across <strong>6 active mornings (5:00 AM – 8:00 AM)</strong>. On Day 6, your rider will execute a <strong>Double Drop</strong> (delivering Box 6 &amp; Box 7 together) for your Day 7 Gut Reset.
                    </p>
                  </div>
                )}
              </div>

              {/* Standard Meal Plan Bundle Selector (Hidden for Trial Plan) */}
              {!isTrialProduct && (
                <div className="rounded-3xl p-6 sm:p-8 backdrop-blur-xl bg-slate-900/80 border border-slate-800">
                  <h4 className="text-sm font-black uppercase tracking-wider text-slate-300 mb-4">
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
                              ? 'bg-emerald-500/15 border-emerald-500 shadow-md shadow-emerald-500/15'
                              : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800 text-slate-300'
                          }`}
                        >
                          {b.discount && (
                            <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500 text-slate-950">
                              {b.discount}
                            </span>
                          )}
                          <div className="text-sm font-bold text-slate-100">{b.label} ({b.days} Days)</div>
                          <p className="text-xs text-slate-400 mt-1">Skip any day with 1-click</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Price Calculation Summary */}
              <div className="rounded-3xl p-6 sm:p-8 backdrop-blur-xl bg-slate-900/80 border border-slate-800">
                <h4 className="text-sm font-black uppercase tracking-wider text-slate-300 mb-4">
                  Pricing Breakdown
                </h4>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Effective daily rate:</span>
                    <span className="font-bold text-slate-200 font-mono">₹{finalPerDay} / meal</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Scheduled duration:</span>
                    <span className="font-bold text-slate-200 font-mono">{finalDays} days</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Doorstep morning delivery:</span>
                    <span className="font-bold text-emerald-400 font-mono">FREE (Included)</span>
                  </div>
                  <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                    <span className="text-base font-bold text-slate-100">Total Payable:</span>
                    <span className="text-2xl font-black text-emerald-400 font-mono">₹{finalTotal}</span>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep('address')}
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-sm bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
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
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Step 2 of 3 · Logistics
                </span>
                <h2 className="text-2xl sm:text-3xl font-black mt-2 text-slate-100">Where Should We Deliver?</h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Fresh cloud kitchen delivery in Patna between 5:00 AM – 8:00 AM daily.
                </p>
              </div>

              <div className="rounded-3xl p-6 sm:p-8 backdrop-blur-xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-5">
                {/* Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aditi Sharma"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Mobile Phone (for delivery SMS/call) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Email Address (for subscription confirmation)
                  </label>
                  <input
                    type="email"
                    placeholder="aditi@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* House No & Street Address */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Flat / House No. *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Flat 402, Block B"
                      value={form.houseNo}
                      onChange={(e) => setForm({ ...form, houseNo: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Street / Society / Landmark *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Boring Road, near Alankar Jewellers"
                      value={form.street}
                      onChange={(e) => setForm({ ...form, street: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* City, State & Pincode */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      City
                    </label>
                    <input
                      type="text"
                      value={form.city}
                      disabled
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/40 border border-slate-800 text-sm text-slate-400 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      State
                    </label>
                    <input
                      type="text"
                      value={form.state}
                      disabled
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/40 border border-slate-800 text-sm text-slate-400 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
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
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                    {pincodeError && (
                      <p className="text-[11px] text-red-400 mt-1">{pincodeError}</p>
                    )}
                  </div>
                </div>

                {/* Delivery Time Slot & Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Preferred Morning Delivery Slot *
                    </label>
                    <select
                      value={form.deliveryTime}
                      onChange={(e) => setForm({ ...form, deliveryTime: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="06:00">06:00 AM (Early Riser)</option>
                      <option value="06:30">06:30 AM</option>
                      <option value="07:00">07:00 AM (Standard Fitness Prep)</option>
                      <option value="07:30">07:30 AM</option>
                      <option value="08:00">08:00 AM</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Delivery Instructions (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Leave with guard / Ring bell once"
                      value={form.deliveryNote}
                      onChange={(e) => setForm({ ...form, deliveryNote: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep('summary')}
                    className="px-6 py-3.5 rounded-2xl text-sm font-semibold border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={handleValidateAndProceedAddress}
                    className="px-8 py-3.5 rounded-2xl font-black text-sm bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Proceed to Payment — ₹{finalTotal} →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: UPI PAYMENT ENFORCEMENT */}
          {step === 'pay' && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="text-center mb-6">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Step 3 of 3 · Direct UPI Prepayment
                </span>
                <h2 className="text-2xl sm:text-3xl font-black mt-2 text-slate-100">Complete Your Payment</h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Scan via PhonePe, Google Pay, or Paytm and enter the 12-digit UTR reference code.
                </p>
              </div>

              {/* Strict COD Disabled Alert for Just Bloomed 7D Trial */}
              {isTrialProduct && (
                <div className="rounded-2xl p-4 bg-emerald-500/10 border-2 border-emerald-500/40 text-emerald-300 flex items-start gap-3">
                  <span className="text-xl">🔒</span>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-emerald-200">
                      Prepaid Living Raw Order Enforced
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                      Cash on Delivery is <strong>strictly disabled</strong> for the Just Bloomed 7D Trial to guarantee continuous morning cold-chain logistics. Total fixed package price: <strong>₹451</strong>.
                    </p>
                  </div>
                </div>
              )}

              {/* UPI Payment Container Card */}
              <div className="rounded-3xl p-6 sm:p-10 backdrop-blur-xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  {/* Dynamic UPI QR Code Display */}
                  <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-950 border border-slate-800">
                    <div className="p-3 bg-white rounded-2xl shadow-xl">
                      {/* Generates dynamic UPI QR representation */}
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiIntentUri)}`}
                        alt="Thebloomaa UPI Payment QR Code"
                        className="w-48 h-48 rounded-lg"
                      />
                    </div>

                    <div className="mt-4 text-center">
                      <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">
                        Scan to Pay with Any UPI App
                      </span>
                      <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">
                        ₹{finalTotal}
                      </span>
                    </div>
                  </div>

                  {/* Manual UPI ID & UTR Input Column */}
                  <div className="space-y-5">
                    {/* Copyable UPI ID Pill */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                        Merchant UPI ID
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 font-mono text-sm text-slate-100 flex items-center justify-between">
                          <span>thebloomaa@upi</span>
                          <span className="text-[10px] text-emerald-400 uppercase font-black">Verified</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyUpiId}
                          className="px-4 py-3 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                        >
                          {copiedUpi ? 'Copied! ✓' : 'Copy'}
                        </button>
                      </div>
                    </div>

                    {/* Order Reference Breakdown */}
                    <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 text-xs space-y-1.5">
                      <div className="flex justify-between text-slate-400">
                        <span>Selected Meal Prep:</span>
                        <span className="font-bold text-slate-200">{selectedProduct.name}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Delivery Address:</span>
                        <span className="font-bold text-slate-200 max-w-[180px] truncate">
                          {form.houseNo ? `${form.houseNo}, ` : ''}{form.street}, {form.pincode}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Delivery Slot:</span>
                        <span className="font-bold text-emerald-400 font-mono">{form.deliveryTime} AM</span>
                      </div>
                    </div>

                    {/* 12-Digit UTR Input */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                        Enter 12-Digit UPI UTR / Reference No. *
                      </label>
                      <input
                        type="text"
                        maxLength={12}
                        required
                        placeholder="e.g. 325498712345"
                        value={utr}
                        onChange={(e) => setUtr(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-4 py-3.5 rounded-xl bg-slate-800 border border-slate-700 text-base font-mono text-emerald-400 tracking-wider focus:outline-none focus:border-emerald-500"
                      />
                      <p className="text-[10px] text-slate-400 mt-1.5">
                        Found in your PhonePe / GPay / Paytm payment receipt under "UPI Transaction ID" or "UTR".
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Navigation */}
                <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setStep('address')}
                    className="px-6 py-3.5 rounded-2xl text-sm font-semibold border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
                  >
                    ← Back
                  </button>

                  <button
                    type="button"
                    disabled={submitting || utr.trim().length !== 12}
                    onClick={handleConfirmPayment}
                    className="px-8 py-4 rounded-2xl font-black text-sm bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm Payment &amp; Schedule Prep</span>
                        <span>→</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
