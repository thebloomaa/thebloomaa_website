'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import { useBundleStore, type BundleType } from '@/store/useBundleStore';
import { BLOOMAA_PRODUCTS } from '@/lib/bioCalculator';
import AllergyPreferencesSelector from '@/components/AllergyPreferencesSelector';

// ─── Delivery Zone: Pincode 800023, Patna ───────────────────────────────────
const DELIVERY_PINCODE = '800023';

const PINCODE_800023_LOCALITIES = [
  // Colonies & Residential Areas
  'Punaichak Colony',
  'Anisabad Colony',
  'Rajendra Nagar',
  'Kankarbagh Colony',
  'Bailey Road Colony',
  'Sheikhpura Colony',
  'Hanuman Nagar',
  'Patliputra Colony',
  'Boring Road Area',
  'Srikrishna Nagar',
  'Indira Nagar',
  'Jaganpura Colony',
  'Saidpur Colony',
  'Dak Bungalow Road Area',
  'Exhibition Road Colony',
  'Mithapur Colony',
  'Nayatola',
  'Shastri Nagar',
  'Mahendru Colony',
  'Buddha Colony',
  'Gardanibagh Colony',
  'Ramkrishna Nagar',
  'Vidyapuri Colony',
  'Agamkuan Colony',
  'Lohanipur Colony',
  'Chitkohra',
  'Adalatganj',
  'Kumhrar Colony',
  // Chowks & Landmarks
  'Punaichak Chowk',
  'Anisabad Chowk',
  'Kankarbagh Chowk',
  'Rajendra Nagar Chowk',
  'Sheikhpura Chowk',
  'Boring Canal Road Chowk',
  'Mahendru Chowk',
  'Dak Bungalow Chowk',
  'Exhibition Road Chowk',
  'Khajpura Chowk',
  'Zero Mile Chowk',
  'Gandhi Maidan Area',
  'Patna Junction Area',
  'GPO Area',
  // Apartments & Societies
  'Laxmi Apartment, Punaichak',
  'Green Valley Apartment, Boring Road',
  'City Centre Apartment, Kankarbagh',
  'Surya Vihar Apartment, Rajendra Nagar',
  'Shanti Niketan Apartment, Sheikhpura',
  'Anand Vihar Apartment, Anisabad',
  'Sai Enclave, Kankarbagh',
  'Rajveer Residency, Patliputra',
  'Silver Oak Residency, Boring Road',
  'Cosmos Towers, Bailey Road',
  'Riviera Apartment, Sheikhpura',
  'Ravi Apartment, Nayatola',
  'Imperial Heights, Rajendra Nagar',
  'Prestige Tower, Boring Canal Road',
  // Roads & Streets
  'Boring Road',
  'Boring Canal Road',
  'Bailey Road (800023 stretch)',
  'Exhibition Road',
  'Dak Bungalow Road',
  'Kankarbagh Main Road',
  'Rajendra Nagar Main Road',
  'Punaichak Road',
  'Sheikhpura Road',
  'Hanuman Nagar Road',
].sort();

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
    locality: '',
    street: '',
    city: 'Patna',
    state: 'Bihar',
    pincode: '',
    deliveryTime: deliveryTime || '07:00',
    deliveryNote: deliveryNote || '',
    allergies: '',
  });

  // Locality search state
  const [localitySearch, setLocalitySearch] = useState('');
  const [showLocalityDropdown, setShowLocalityDropdown] = useState(false);
  const localityRef = useRef<HTMLDivElement>(null);

  // Close locality dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (localityRef.current && !localityRef.current.contains(e.target as Node)) {
        setShowLocalityDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredLocalities = PINCODE_800023_LOCALITIES.filter((l) =>
    l.toLowerCase().includes(localitySearch.toLowerCase())
  );

  // Whether the pincode entered is outside our delivery zone
  const isOutsideZone =
    form.pincode.length === 6 && form.pincode !== DELIVERY_PINCODE;

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
    if (planParam === 'single' || planParam === 'trial') {
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
    } else if (planParam === 'monthly') {
      const monthlyProd = BLOOMAA_PRODUCTS.MONTHLY_SUBSCRIPTION;
      selectProduct({
        id: monthlyProd.id,
        name: monthlyProd.name,
        description: monthlyProd.description,
        price: monthlyProd.price,
        imageUrl: monthlyProd.imageUrl,
        type: monthlyProd.type,
        calories: monthlyProd.calories,
        protein: monthlyProd.protein,
        carbs: monthlyProd.carbs,
        fats: monthlyProd.fats,
        dietaryPreference: monthlyProd.dietaryPreference,
      });
      selectBundle('DAYS_30');
    }
  }, [planParam, selectProduct, selectBundle]);

  const isTrialProduct = Boolean(
    selectedProduct &&
    (selectedProduct.name.toLowerCase().includes('just bloomed') ||
      selectedProduct.name.toLowerCase().includes('7-day') ||
      selectedProduct.name.toLowerCase().includes('weekly') ||
      selectedProduct.type === 'TRIAL_PLAN' ||
      selectedProduct.dietaryPreference === 'LIVING_RAW' ||
      selectedProduct.isTrialPlan)
  );

  const isMonthlyProduct = Boolean(
    !isTrialProduct &&
    selectedProduct &&
    (selectedProduct.id === 'prod-monthly-living-diet' ||
      bundleType === 'DAYS_30' ||
      selectedProduct.name.toLowerCase().includes('monthly'))
  );

  const finalDays = isMonthlyProduct ? 30 : 7;

  useEffect(() => {
    if (isMonthlyProduct && bundleType !== 'DAYS_30') {
      selectBundle('DAYS_30');
    } else if (!isMonthlyProduct && bundleType !== 'DAYS_7') {
      selectBundle('DAYS_7');
    }
  }, [isMonthlyProduct, bundleType, selectBundle]);

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
          bundleType: isMonthlyProduct ? 'DAYS_30' : 'DAYS_7',
          deliveryTime: form.deliveryTime,
          deliveryNote: isMonthlyProduct
            ? `CUSTOM MONTHLY PLAN (30 Days). ${combinedDeliveryNote}`
            : `7-DAY WEEKLY PLAN (7 Days). ${combinedDeliveryNote}`,
          allergies: form.allergies,
          customerName: form.name,
          customerPhone: form.phone,
          customerEmail: form.email,
          utr: effectiveUtr,
          address: {
            street: fullStreet,
            city: form.city,
            state: form.state,
            pincode: form.pincode,
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setOrderSuccess(true);
        if (session?.user) {
          setTimeout(() => {
            useBundleStore.getState().reset();
            router.push('/dashboard');
            router.refresh();
          }, 3000);
        }
      } else {
        setSubmitError(data.error || 'Failed to confirm pre-booking. Please try again.');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setSubmitError('Network error occurred during pre-booking confirmation.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleValidateAndProceedAddress = () => {
    if (!form.name || !form.phone || !form.locality || !form.pincode) {
      alert('Please fill out all required address fields (Name, Phone, Locality, and Pincode).');
      return;
    }

    if (form.pincode.length !== 6) {
      setPincodeError('Pincode must be 6 digits.');
      return;
    }

    if (form.pincode !== DELIVERY_PINCODE) {
      setPincodeError(`We currently deliver only within pincode ${DELIVERY_PINCODE} (Patna). We\'re coming to your area soon!`);
      return;
    }

    // Combine House No, Street detail & Locality into a full address string
    const parts = [form.houseNo, form.street, form.locality].filter(Boolean);
    const fullStreet = parts.join(', ');

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
        <main className="min-h-screen pt-32 pb-16 px-4 flex items-center justify-center" style={{ background: 'var(--bg-dark)' }}>
          <div className="text-center max-w-md p-8 rounded-3xl bg-brand-card border border-brand-border shadow-2xl">
            <div className="text-6xl mb-4">🌱</div>
            <h1 className="text-2xl font-black mb-2 text-brand-forest">No Plan Selected</h1>
            <p className="text-sm mb-6 text-brand-forest-muted leading-relaxed">
              Pre-book your 7-Day Weekly Plan to start your sunrise living routine, lock in the Custom Monthly Plan, or run the Bio Calculator.
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
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
                className="px-5 py-3 rounded-xl text-xs font-black text-white bg-[#D97706] hover:bg-[#B45309] transition-all shadow-md cursor-pointer"
              >
                7-Day Weekly Plan →
              </button>
              <button
                type="button"
                onClick={() => {
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
                }}
                className="px-5 py-3 rounded-xl text-xs font-black text-white bg-[#0F3826] hover:bg-[#185338] transition-all shadow-md cursor-pointer"
              >
                Custom Monthly Plan →
              </button>
              <Link
                href="/calculator"
                className="px-4 py-3 rounded-xl text-xs font-bold text-brand-forest bg-white border border-brand-border hover:bg-brand-cream transition-all flex items-center justify-center"
              >
                Bio Calculator ✨
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

      <main className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--bg-dark)' }}>
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
                      <div className="text-right">
                        {isMonthlyProduct ? (
                          <span className="text-xl font-black text-brand-mustard font-mono">Custom Monthly Plan (Price TBA)</span>
                        ) : (
                          <div className="flex flex-col items-end">
                            <div className="flex items-baseline gap-2">
                              <span className="text-base font-black text-brand-forest-muted line-through font-mono">₹599</span>
                              <span className="text-xl font-black text-brand-mustard font-mono">₹499</span>
                            </div>
                            <span className="text-[10px] font-bold text-brand-mustard bg-brand-mustard/10 px-2 py-0.5 rounded-full border border-brand-mustard/20 mt-0.5">🎁 Early Bird • First 100 Only</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-brand-forest-muted mt-2 leading-relaxed max-w-xl">
                      {selectedProduct.description}
                    </p>

                    {/* Bloom Badges */}
                    <div className="flex flex-wrap gap-2.5 mt-4 justify-center sm:justify-start">
                      <span className="px-3 py-1 rounded-xl text-xs font-bold bg-brand-mustard/10 text-brand-mustard border border-brand-mustard/20 font-mono">
                        🔥 {selectedProduct.calories || 340} kcal
                      </span>
                      <span className="px-3 py-1 rounded-xl text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                        💪 {selectedProduct.protein || 16}g Protein
                      </span>
                      <span className="px-3 py-1 rounded-xl text-xs font-bold bg-brand-mustard/10 text-brand-forest-muted border border-brand-mustard/20 font-mono">
                        🍞 {selectedProduct.carbs || 45}g Carbs
                      </span>
                      <span className="px-3 py-1 rounded-xl text-xs font-bold bg-brand-mustard/10 text-brand-mustard border border-brand-mustard/20 font-mono">
                        🥑 {selectedProduct.fats || 15}g Fats
                      </span>
                    </div>
                  </div>
                </div>

                {/* Just Bloom Plan Logistics Alert */}
                {isTrialProduct && (
                  <div className="mt-6 p-4 rounded-2xl bg-brand-mustard/10 border border-brand-mustard/30 text-xs text-brand-forest-muted space-y-1">
                    <div className="flex items-center gap-2 font-black uppercase tracking-wider text-[11px] text-brand-mustard">
                      <span>🚚</span>
                      <span>Just Bloom Plan — What’s Included</span>
                    </div>
                    <p className="text-[11px] text-brand-forest-muted leading-relaxed">
                      <strong>6 Bloom Boxes + 1 Surprise Bloom Box</strong> delivered between <strong>7:00 AM – 9:00 AM</strong> across Patna from <strong>30th September 2026</strong>. Fruits, sprouts, veggies & wet/dry seeds — daily rotating A/c to Healthy Functional. Zero cooking oils.
                    </p>
                  </div>
                )}

                {/* Monthly Plan Logistics Alert */}
                {isMonthlyProduct && (
                  <div className="mt-6 p-4 rounded-2xl bg-brand-mustard/10 border border-brand-mustard/30 text-xs text-brand-forest-muted space-y-1">
                    <div className="flex items-center gap-2 font-black uppercase tracking-wider text-[11px] text-brand-mustard">
                      <span>🌿</span>
                      <span>30-Day Transformation Schedule</span>
                    </div>
                    <p className="text-[11px] text-brand-forest-muted leading-relaxed">
                      Delivered every morning between <strong>6:00 AM – 9:00 AM</strong> across Patna starting <strong>30th September 2026</strong>. Enjoy continuous living nutrition with the flexibility to pause or skip any day via your dashboard.
                    </p>
                  </div>
                )}
              </div>

              {/* Standard Meal Plan Bundle Selector (Hidden for Trial & Monthly) */}
              {!isTrialProduct && !isMonthlyProduct && (
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
                  {!isMonthlyProduct && (
                    <div className="flex justify-between items-center p-2.5 rounded-xl bg-brand-mustard/10 border border-brand-mustard/20">
                      <span className="font-black text-brand-mustard">🎁 Early Bird Price</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-brand-forest-muted line-through font-mono">₹599</span>
                        <span className="font-black text-brand-mustard font-mono text-base">₹499</span>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between text-brand-forest-muted">
                    <span>What’s included:</span>
                    <span className="font-bold text-brand-forest">{isMonthlyProduct ? '30-Day Plan' : '6 Boxes + 1 Surprise Box'}</span>
                  </div>
                  <div className="flex justify-between text-brand-forest-muted">
                    <span>Delivery window:</span>
                    <span className="font-bold text-brand-forest font-mono">7:00 AM – 9:00 AM</span>
                  </div>
                  <div className="flex justify-between text-brand-forest-muted">
                    <span>Doorstep morning delivery:</span>
                    <span className="font-bold text-brand-mustard font-mono">FREE (Included)</span>
                  </div>
                  <div className="pt-3 border-t border-brand-border flex justify-between items-baseline">
                    <span className="text-base font-bold text-brand-forest">Total Payable:</span>
                    {isMonthlyProduct ? (
                      <span className="text-2xl font-black text-brand-mustard font-mono">TBA</span>
                    ) : (
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-black text-brand-forest-muted line-through font-mono">₹599</span>
                        <span className="text-2xl font-black text-brand-mustard font-mono">₹499</span>
                      </div>
                    )}
                  </div>
                  {!isMonthlyProduct && (
                    <p className="text-[10px] text-brand-forest-muted text-right">🎁 Early bird offer for first 100 customers only</p>
                  )}
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
                      Flat / House No.
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
                      Street / Building / Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. near Pumphouse, opp. SBI Bank"
                      value={form.street}
                      onChange={(e) => setForm({ ...form, street: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-brand-cream/80 border border-brand-border text-base sm:text-sm text-brand-forest focus:outline-none focus:border-brand-mustard min-h-[46px]"
                    />
                  </div>
                </div>

                {/* Locality Searchable Dropdown */}
                <div ref={localityRef} className="relative">
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-forest-muted mb-1.5">
                    Colony / Area / Locality * <span className="normal-case font-normal text-[10px] text-brand-mustard ml-1">(Select from delivery zones in Pincode 800023)</span>
                  </label>
                  <div
                    className="w-full px-4 py-3 rounded-xl bg-brand-cream/80 border border-brand-border text-base sm:text-sm text-brand-forest focus-within:border-brand-mustard min-h-[46px] flex items-center gap-2 cursor-text"
                    onClick={() => setShowLocalityDropdown(true)}
                  >
                    {form.locality ? (
                      <span className="flex-1 text-brand-forest font-semibold">{form.locality}</span>
                    ) : (
                      <span className="flex-1 text-brand-forest-muted/60">Search colony, chowk, apartment…</span>
                    )}
                    {form.locality && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setForm({ ...form, locality: '' });
                          setLocalitySearch('');
                        }}
                        className="text-brand-forest-muted hover:text-brand-forest transition-colors text-base leading-none"
                        aria-label="Clear locality"
                      >
                        ×
                      </button>
                    )}
                    <span className="text-brand-forest-muted text-xs">{showLocalityDropdown ? '▲' : '▼'}</span>
                  </div>

                  {showLocalityDropdown && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-1.5 rounded-2xl bg-brand-card border border-brand-border shadow-2xl overflow-hidden">
                      <div className="p-2 border-b border-brand-border">
                        <input
                          autoFocus
                          type="text"
                          placeholder="Type to search your area…"
                          value={localitySearch}
                          onChange={(e) => setLocalitySearch(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-brand-cream/80 border border-brand-border text-sm text-brand-forest focus:outline-none focus:border-brand-mustard"
                        />
                      </div>
                      <div className="max-h-52 overflow-y-auto">
                        {filteredLocalities.length > 0 ? (
                          filteredLocalities.map((loc) => (
                            <button
                              key={loc}
                              type="button"
                              onClick={() => {
                                setForm({ ...form, locality: loc });
                                setLocalitySearch('');
                                setShowLocalityDropdown(false);
                              }}
                              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                                form.locality === loc
                                  ? 'bg-brand-mustard/20 text-brand-forest font-bold'
                                  : 'text-brand-forest-muted hover:bg-brand-cream hover:text-brand-forest'
                              }`}
                            >
                              📍 {loc}
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-6 text-center text-xs text-brand-forest-muted">
                            <div className="text-2xl mb-2">🗺️</div>
                            <p className="font-bold text-brand-forest">Area not found</p>
                            <p className="mt-1">We\'re expanding soon! Currently serving pincode 800023 only.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
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
                      Pincode *
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="800023"
                      value={form.pincode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setForm({ ...form, pincode: val });
                        if (pincodeError) setPincodeError(null);
                      }}
                      className={`w-full px-4 py-3 rounded-xl border text-base sm:text-sm focus:outline-none font-mono min-h-[46px] transition-colors ${
                        isOutsideZone
                          ? 'bg-red-500/10 border-red-400/60 text-red-300 focus:border-red-400'
                          : form.pincode === DELIVERY_PINCODE
                          ? 'bg-green-500/10 border-green-400/60 text-brand-forest focus:border-green-400'
                          : 'bg-brand-cream/80 border-brand-border text-brand-forest focus:border-brand-mustard'
                      }`}
                    />
                    {form.pincode === DELIVERY_PINCODE && (
                      <p className="text-[11px] text-green-400 mt-1 flex items-center gap-1">
                        <span>✓</span> Delivery available in your area!
                      </p>
                    )}
                    {pincodeError && (
                      <p className="text-[11px] text-red-400 mt-1">{pincodeError}</p>
                    )}
                  </div>
                </div>

                {/* Outside Zone Warning Banner */}
                {isOutsideZone && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/40 flex gap-3 items-start animate-fade-in">
                    <span className="text-2xl flex-shrink-0">🚚</span>
                    <div>
                      <p className="text-sm font-black text-amber-400">We're not in your area yet!</p>
                      <p className="text-xs text-brand-forest-muted mt-0.5 leading-relaxed">
                        TheBloomaa currently delivers only within <strong className="text-brand-forest">Pincode 800023</strong> (Patna). We\'re expanding rapidly and will be coming to your area very soon! 🌱
                      </p>
                      <p className="text-xs text-brand-mustard mt-1.5 font-semibold">
                        💬 Want to be notified when we launch in your area?{' '}
                        <a
                          href="https://wa.me/919117501404?text=Hi%20TheBloomaa!%20Please%20notify%20me%20when%20you%20deliver%20to%20my%20area."
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:text-brand-mustard-hover"
                        >
                          Message us on WhatsApp →
                        </a>
                      </p>
                    </div>
                  </div>
                )}

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
                    Pre-Booking Confirmed! 🎉
                  </h2>
                  <p className="text-sm text-brand-forest-muted max-w-lg mx-auto leading-relaxed">
                    Your morning living food slot has been reserved! Deliveries begin on Official Launch Day: <strong className="text-brand-mustard font-bold">Wednesday, 30th September 2026</strong>.
                  </p>

                  <div className="p-4 rounded-2xl bg-brand-cream/80 border border-brand-border text-xs text-brand-forest text-left max-w-md mx-auto space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-brand-forest-muted">Selected Plan:</span>
                      <strong className="text-brand-forest font-bold">{selectedProduct?.name || 'Just Bloom Plan'}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-brand-forest-muted">Morning Drop Window:</span>
                      <strong className="text-brand-forest font-mono">{form.deliveryTime || '07:00'} AM</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-brand-forest-muted">Patna Address:</span>
                      <span className="text-right text-brand-forest truncate max-w-[200px]">{form.street}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-brand-forest-muted">Contact Phone:</span>
                      <strong className="text-brand-forest font-mono">{form.phone}</strong>
                    </div>
                    <div className="flex justify-between items-center pt-1.5 border-t border-brand-border">
                      <span className="text-brand-forest-muted">Plan Price:</span>
                      <div className="flex items-baseline gap-1.5">
                        {!isMonthlyProduct && <span className="text-brand-forest-muted line-through font-mono text-xs">₹599</span>}
                        <strong className="text-brand-mustard font-bold">{isMonthlyProduct ? 'TBA' : '₹499 🎁 Early Bird'}</strong>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-brand-forest-muted max-w-md mx-auto leading-relaxed">
                    Our team will contact you via WhatsApp at <strong>{form.phone}</strong> to confirm your delivery slot and payment details before 30th September launch day.
                  </p>

                  <div className="pt-3 flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                      href="/"
                      onClick={() => useBundleStore.getState().reset()}
                      className="px-6 py-3 rounded-full text-xs font-bold text-brand-forest bg-brand-cream border border-brand-border hover:bg-brand-card transition-all"
                    >
                      ← Back to Homepage
                    </Link>
                    <a
                      href={`https://wa.me/919117501404?text=${encodeURIComponent(`Hi TheBloomaa! I just pre-booked my Just Bloom Plan (₹499 early bird) for the 30th September launch! 🌱`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 rounded-full text-xs font-black text-white bg-[#25D366] hover:bg-[#1EBE5D] transition-all flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <span>💬 Chat with Us on WhatsApp</span>
                    </a>
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
