'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import { useBundleStore, type BundleType } from '@/store/useBundleStore';
import { BLOOMAA_PRODUCTS } from '@/lib/bioCalculator';

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
  const [launchedApp, setLaunchedApp] = useState<string | null>(null);
  const [returnedFromApp, setReturnedFromApp] = useState(false);
  const [pastedUtr, setPastedUtr] = useState(false);
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
            }));
          }
        })
        .catch((err) => console.error('Error fetching profile for checkout:', err));
    }
  }, [session]);

  const [utr, setUtr] = useState('');

  // Detect when user returns from UPI App
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && launchedApp) {
        setReturnedFromApp(true);
      }
    };
    const handleFocus = () => {
      if (launchedApp) {
        setReturnedFromApp(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [launchedApp]);

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

  // Calculate strict checkout total
  const finalTotal = isSingleProduct ? 70 : isTrialProduct ? 451 : getTotalPrice();
  const finalDays = isSingleProduct ? 1 : isTrialProduct ? 7 : getBundleDays();
  const finalPerDay = isSingleProduct ? 70 : isTrialProduct ? Math.round(451 / 7) : getPerDayPrice();

  useEffect(() => {
    if (isSingleProduct && bundleType !== 'DAYS_1') {
      selectBundle('DAYS_1');
    } else if (isTrialProduct && bundleType !== 'DAYS_7') {
      selectBundle('DAYS_7');
    }
  }, [isSingleProduct, isTrialProduct, bundleType, selectBundle]);

  // Unique Order Reference for UPI Transaction Note
  const orderRefNote = `BLM-${(selectedProduct?.name || 'Diet').replace(/[^a-zA-Z0-9]/g, '').slice(0, 10)}-${finalTotal}`;
  const universalUpiUri = `upi://pay?pa=thebloomaa@upi&pn=TheBlooMaa&am=${finalTotal}&cu=INR&tn=${encodeURIComponent(orderRefNote)}`;
  const upiIntentUri = universalUpiUri;
  const gpayUri = `gpay://upi/pay?pa=thebloomaa@upi&pn=TheBlooMaa&am=${finalTotal}&cu=INR&tn=${encodeURIComponent(orderRefNote)}`;
  const phonepeUri = `phonepe://pay?pa=thebloomaa@upi&pn=TheBlooMaa&am=${finalTotal}&cu=INR&tn=${encodeURIComponent(orderRefNote)}`;
  const paytmUri = `paytmmp://pay?pa=thebloomaa@upi&pn=TheBlooMaa&am=${finalTotal}&cu=INR&tn=${encodeURIComponent(orderRefNote)}`;

  const handleLaunchApp = (appName: string, uri: string) => {
    setLaunchedApp(appName);
    try {
      const a = document.createElement('a');
      a.href = uri;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      window.location.href = uri;
    }
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const match = text.match(/\b\d{12}\b/);
      if (match) {
        setUtr(match[0]);
        setPastedUtr(true);
        setTimeout(() => setPastedUtr(false), 3000);
      } else {
        const clean = text.replace(/\D/g, '');
        if (clean.length >= 12) {
          setUtr(clean.slice(0, 12));
          setPastedUtr(true);
          setTimeout(() => setPastedUtr(false), 3000);
        } else if (clean.length > 0) {
          setUtr(clean);
        } else {
          alert('No 12-digit number found in clipboard. Please paste or enter manually.');
        }
      }
    } catch {
      alert('Clipboard permission denied. Please manually enter your UTR.');
    }
  };

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText('thebloomaa@upi');
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleConfirmPayment = async (forcePaidWithoutUtr = false) => {
    if (!selectedProduct) return;
    if (!forcePaidWithoutUtr && utr.trim().length > 0 && utr.trim().length !== 12) {
      alert('Please enter a valid 12-digit UTR, or click "Confirm Order (Paid via App)" without entering UTR.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const fullStreet = form.houseNo ? `${form.houseNo}, ${form.street}` : form.street;
      const effectiveUtr = utr.trim().length === 12
        ? utr.trim()
        : `DIRECT_UPI_${Date.now().toString().slice(-8)}`;

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          bundleType: isSingleProduct ? 'DAYS_1' : isTrialProduct ? 'DAYS_7' : (bundleType || 'DAYS_15'),
          deliveryTime: form.deliveryTime,
          deliveryNote: isSingleProduct
            ? `1-DAY SINGLE PACK: Morning doorstep fresh diet box. Customer Note: ${form.deliveryNote}`
            : isTrialProduct
            ? `6+1 BUNDLE DROP: Just Bloomed 7D Trial. Customer Note: ${form.deliveryNote}`
            : form.deliveryNote,
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
              Order our Single Day Pack (₹70) to try tomorrow morning, claim the 7-Day Living Reset (₹451), or run the Bio Calculator.
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
                1-Day Pack (₹70)
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
                7-Day Trial (₹451)
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
                  Macro-tracked, chef-crafted, and delivered fresh to your door every morning.
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
                          ? '₹70 (Single Day Diet Pack)'
                          : isTrialProduct
                          ? '₹451 (Flat 7D Trial)'
                          : `₹${selectedProduct.price}/diet`}
                      </div>
                    </div>

                    <p className="text-xs text-brand-forest-muted mt-2 leading-relaxed max-w-xl">
                      {selectedProduct.description}
                    </p>

                    {/* Macro Badges */}
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
                    <span className="font-bold text-brand-forest font-mono">₹{finalPerDay} / diet</span>
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
                    <span className="text-2xl font-black text-brand-mustard font-mono">₹{finalTotal}</span>
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
                      placeholder="e.g. Boring Road, near Alankar Jewellers"
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
                    Proceed to Payment — ₹{finalTotal} →
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
                      Step 3 of 3 · Fast UPI Prepayment
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black mt-2 text-brand-forest">Complete Your Payment</h2>
                    <p className="text-xs sm:text-sm text-brand-forest-muted mt-1">
                      Pay via Google Pay, PhonePe, Paytm, or any UPI app in 1-click.
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

                  {/* Returned from App Quick-Confirm Banner */}
                  {returnedFromApp && (
                    <div className="rounded-2xl p-4 bg-brand-mustard/15 border-2 border-brand-mustard/40 text-brand-mustard-hover flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <span className="text-2xl">✨</span>
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-wider text-emerald-200">
                            Returned from {launchedApp || 'UPI App'}
                          </h4>
                          <p className="text-xs text-brand-forest-muted mt-0.5">
                            Completed your ₹{finalTotal} payment? Click below to immediately lock in your morning drop without typing anything!
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => handleConfirmPayment(true)}
                        className="px-5 py-2.5 rounded-xl font-black text-xs bg-brand-mustard text-brand-forest hover:bg-brand-mustard shrink-0 shadow-lg cursor-pointer transition-all hover:scale-105"
                      >
                        {submitting ? 'Confirming...' : '✓ Confirm Order Now'}
                      </button>
                    </div>
                  )}

                  {/* Strict COD Disabled Alert for Just Bloomed 7D Trial & Single Pack */}
                  {(isTrialProduct || isSingleProduct) && (
                    <div className="rounded-2xl p-4 bg-brand-mustard/10 border-2 border-brand-mustard/40 text-brand-mustard-hover flex items-start gap-3">
                      <span className="text-xl">🔒</span>
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-emerald-200">
                          Prepaid Fresh Living Order Enforced
                        </h4>
                        <p className="text-xs text-brand-forest-muted mt-0.5 leading-relaxed">
                          Cash on Delivery is <strong>strictly disabled</strong> to guarantee continuous morning cold-chain logistics in Patna. Total fixed package price: <strong>₹{finalTotal}</strong>.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* UPI Payment Container Card */}
                  <div className="rounded-3xl p-6 sm:p-10 backdrop-blur-xl bg-brand-card/90 border border-brand-border shadow-2xl space-y-6">
                    {/* SECTION 1: ONE-TAP MOBILE UPI LAUNCHER */}
                    <div className="rounded-2xl p-5 bg-gradient-to-br from-slate-950 to-slate-900 border border-brand-border space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="text-xs font-black uppercase tracking-wider text-brand-forest flex items-center gap-1.5">
                          <span>⚡</span> 1-Click UPI App Payment
                        </span>
                        <span className="text-[10px] font-bold text-brand-mustard bg-brand-mustard/10 px-2 py-0.5 rounded-full border border-brand-mustard/20 w-fit">
                          Direct App Redirection · No typing amount
                        </span>
                      </div>
                      <p className="text-xs text-brand-forest-muted">
                        Tap any app below to launch payment directly on your phone with ₹{finalTotal} prefilled:
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                        {/* Google Pay */}
                        <button
                          type="button"
                          onClick={() => handleLaunchApp('Google Pay', gpayUri)}
                          className="p-3 rounded-xl bg-brand-cream/80 hover:bg-brand-border/90 border border-brand-border hover:border-blue-500/50 transition-all flex items-center justify-center gap-2 group cursor-pointer min-h-[48px]"
                        >
                          <span className="text-sm font-black text-blue-400 group-hover:scale-110 transition-transform">G</span>
                          <span className="text-xs font-bold text-brand-forest">Google Pay</span>
                        </button>

                        {/* PhonePe */}
                        <button
                          type="button"
                          onClick={() => handleLaunchApp('PhonePe', phonepeUri)}
                          className="p-3 rounded-xl bg-brand-cream/80 hover:bg-brand-border/90 border border-brand-border hover:border-purple-500/50 transition-all flex items-center justify-center gap-2 group cursor-pointer min-h-[48px]"
                        >
                          <span className="text-sm font-black text-purple-400 group-hover:scale-110 transition-transform">पे</span>
                          <span className="text-xs font-bold text-brand-forest">PhonePe</span>
                        </button>

                        {/* Paytm */}
                        <button
                          type="button"
                          onClick={() => handleLaunchApp('Paytm', paytmUri)}
                          className="p-3 rounded-xl bg-brand-cream/80 hover:bg-brand-border/90 border border-brand-border hover:border-sky-500/50 transition-all flex items-center justify-center gap-2 group cursor-pointer min-h-[48px]"
                        >
                          <span className="text-sm font-black text-sky-400 group-hover:scale-110 transition-transform">P</span>
                          <span className="text-xs font-bold text-brand-forest">Paytm</span>
                        </button>

                        {/* Any UPI App */}
                        <button
                          type="button"
                          onClick={() => handleLaunchApp('UPI App', universalUpiUri)}
                          className="p-3 rounded-xl bg-brand-mustard/15 hover:bg-brand-mustard/25 border border-brand-mustard/40 transition-all flex items-center justify-center gap-2 group cursor-pointer min-h-[48px]"
                        >
                          <span className="text-sm font-black text-brand-mustard group-hover:scale-110 transition-transform">📲</span>
                          <span className="text-xs font-bold text-brand-mustard-hover">Any UPI App</span>
                        </button>
                      </div>
                    </div>

                    {/* SECTION 2: DESKTOP QR CODE & UTR CONFIRMATION */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-2">
                      {/* Dynamic UPI QR Code Display */}
                      <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-brand-cream border border-brand-border">
                        <div className="p-3 bg-white rounded-2xl shadow-xl">
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(universalUpiUri)}`}
                            alt="Thebloomaa UPI Payment QR Code"
                            className="w-48 h-48 rounded-lg"
                          />
                        </div>

                        <div className="mt-4 text-center">
                          <span className="text-[11px] uppercase tracking-wider text-brand-forest-muted block font-semibold">
                            Or Scan with PhonePe / GPay / Paytm
                          </span>
                          <span className="text-2xl font-black text-brand-mustard font-mono mt-1 block">
                            ₹{finalTotal}
                          </span>
                        </div>
                      </div>

                      {/* UPI ID & UTR Input Column */}
                      <div className="space-y-4">
                        {/* Copyable UPI ID Pill */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-brand-forest-muted mb-1.5">
                            Merchant UPI ID
                          </label>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 px-4 py-2.5 rounded-xl bg-brand-cream border border-brand-border font-mono text-sm text-brand-forest flex items-center justify-between">
                              <span>thebloomaa@upi</span>
                              <span className="text-[10px] text-brand-mustard uppercase font-black">Verified</span>
                            </div>
                            <button
                              type="button"
                              onClick={handleCopyUpiId}
                              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-brand-cream hover:bg-brand-border text-brand-forest border border-brand-border transition-colors"
                            >
                              {copiedUpi ? 'Copied! ✓' : 'Copy'}
                            </button>
                          </div>
                        </div>

                        {/* Order Reference Breakdown */}
                        <div className="p-3.5 rounded-2xl bg-brand-cream/40 border border-brand-border text-xs space-y-1.5">
                          <div className="flex justify-between text-brand-forest-muted">
                            <span>Selected Diet Prep:</span>
                            <span className="font-bold text-brand-forest">{selectedProduct.name}</span>
                          </div>
                          <div className="flex justify-between text-brand-forest-muted">
                            <span>Delivery Address:</span>
                            <span className="font-bold text-brand-forest max-w-[180px] truncate">
                              {form.houseNo ? `${form.houseNo}, ` : ''}{form.street}, {form.pincode}
                            </span>
                          </div>
                          <div className="flex justify-between text-brand-forest-muted">
                            <span>Morning Slot:</span>
                            <span className="font-bold text-brand-mustard font-mono">{form.deliveryTime} AM</span>
                          </div>
                        </div>

                        {/* 12-Digit UTR Input with 1-Tap Paste */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-brand-forest-muted">
                              UPI UTR / Reference No.{' '}
                              <span className="text-brand-forest-muted/70 font-normal lowercase">(optional if paid via app)</span>
                            </label>
                            <button
                              type="button"
                              onClick={handlePasteClipboard}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-brand-cream hover:bg-brand-border text-brand-mustard border border-brand-mustard/30 flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <span>📋</span>
                              <span>{pastedUtr ? 'Pasted! ✓' : 'Paste UTR'}</span>
                            </button>
                          </div>
                          <input
                            type="text"
                            maxLength={12}
                            placeholder="e.g. 325498712345 (or 1-click confirm below)"
                            value={utr}
                            onChange={(e) => setUtr(e.target.value.replace(/\D/g, ''))}
                            className="w-full px-4 py-3 rounded-xl bg-brand-cream border border-brand-border text-base sm:text-sm font-mono text-brand-mustard tracking-wider focus:outline-none focus:border-brand-mustard min-h-[46px]"
                          />
                          <p className="text-[10px] text-brand-forest-muted mt-1">
                            Tip: You can 1-tap paste from your clipboard, or click &quot;I Have Paid&quot; below.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 3: BOTTOM CONFIRMATION NAVIGATION */}
                    <div className="pt-4 border-t border-brand-border flex flex-col sm:flex-row justify-between items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setStep('address')}
                        className="w-full sm:w-auto px-6 py-3.5 rounded-2xl text-sm font-semibold border border-brand-border text-brand-forest-muted hover:bg-brand-cream transition-colors"
                      >
                        ← Back
                      </button>

                      <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
                        <button
                          type="button"
                          disabled={submitting}
                          onClick={() => handleConfirmPayment(true)}
                          className="px-6 py-3.5 rounded-2xl font-bold text-xs bg-brand-cream hover:bg-brand-border text-brand-mustard border border-brand-mustard/30 transition-all cursor-pointer text-center"
                        >
                          {submitting ? 'Confirming...' : `I Have Paid ₹${finalTotal} (No UTR)`}
                        </button>

                        <button
                          type="button"
                          disabled={submitting}
                          onClick={() => handleConfirmPayment(false)}
                          className="px-8 py-4 rounded-2xl font-black text-sm bg-brand-mustard text-brand-forest hover:bg-brand-mustard transition-all shadow-xl shadow-brand-mustard/25 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                        >
                          {submitting ? (
                            <>
                              <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                              <span>Scheduling Prep...</span>
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
