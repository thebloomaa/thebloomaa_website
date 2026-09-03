'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useBundleStore, type BundleType } from '@/store/useBundleStore';

const bundles: { type: BundleType; label: string; days: number; discount: string }[] = [
  { type: 'DAYS_7', label: 'Starter', days: 7, discount: '' },
  { type: 'DAYS_15', label: 'Committed', days: 15, discount: '8% off' },
  { type: 'DAYS_30', label: 'All-In', days: 30, discount: '20% off' },
];

export default function CheckoutPage() {
  const { selectedProduct, bundleType, selectBundle, getTotalPrice, getPerDayPrice, getBundleDays, setAddress, address, deliveryTime, setDeliveryTime } = useBundleStore();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    street: '',
    city: 'Patna',
    state: 'Bihar',
    pincode: '',
    deliveryTime: '07:00',
  });
  const [step, setStep] = useState<'bundle' | 'address' | 'pay'>('bundle');

  // Redirect if no product selected
  if (!selectedProduct) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-28 pb-16 px-4 flex items-center justify-center" style={{ background: 'var(--bg-dark)' }}>
          <div className="text-center">
            <div className="text-6xl mb-4">🥗</div>
            <h1 className="text-2xl font-black mb-2">No Meal Selected</h1>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Please choose a meal plan first.</p>
            <a href="/menu" className="px-6 py-3 rounded-xl text-sm font-bold text-white" style={{ background: 'var(--brand-primary)' }}>
              Browse Meals
            </a>
          </div>
        </main>
      </>
    );
  }

  const handleSubmitAddress = () => {
    if (!form.street || !form.pincode || !form.name || !form.phone || !form.deliveryTime) return;
    setAddress({ street: form.street, city: form.city, state: form.state, pincode: form.pincode });
    setDeliveryTime(form.deliveryTime);
    setStep('pay');
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--bg-dark)' }}>
        <div className="max-w-4xl mx-auto">

          {/* Progress Bar */}
          <div className="flex items-center justify-center gap-2 mb-12">
            {['bundle', 'address', 'pay'].map((s, i) => (
              <React.Fragment key={s}>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                  style={{
                    background: step === s ? 'var(--brand-primary)' : ((['bundle', 'address', 'pay'].indexOf(step) > i) ? 'var(--brand-primary)' : 'var(--bg-surface)'),
                    color: step === s || ['bundle', 'address', 'pay'].indexOf(step) > i ? 'white' : 'var(--text-muted)',
                  }}
                >
                  {['bundle', 'address', 'pay'].indexOf(step) > i ? '✓' : i + 1}
                </div>
                {i < 2 && <div className="w-16 h-0.5" style={{ background: ['bundle', 'address', 'pay'].indexOf(step) > i ? 'var(--brand-primary)' : 'var(--bg-surface)' }} />}
              </React.Fragment>
            ))}
          </div>

          {/* Selected meal summary */}
          <div className="rounded-2xl p-5 mb-8 flex items-center gap-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 relative">
              <img src={selectedProduct.imageUrl || ''} alt={selectedProduct.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-grow">
              <h3 className="font-bold text-sm">{selectedProduct.name}</h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>🔥 {selectedProduct.calories} kcal · 🥩 {selectedProduct.protein}g P · 🍞 {selectedProduct.carbs}g C · 🥑 {selectedProduct.fats}g F</p>
            </div>
            <a href="/menu" className="text-xs font-semibold" style={{ color: 'var(--brand-primary)' }}>Change</a>
          </div>

          {/* STEP 1: Bundle Selection */}
          {step === 'bundle' && (
            <div className="animate-fade-in-up">
              <div className="text-center mb-8">
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--brand-accent)' }}>Step 2 of 3</span>
                <h2 className="text-2xl sm:text-3xl font-black mt-2">Choose Your Bundle</h2>
                <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>Longer bundles = bigger savings. Skip any day, anytime.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                {bundles.map(b => {
                  const isSelected = bundleType === b.type;
                  return (
                    <button
                      key={b.type}
                      onClick={() => selectBundle(b.type)}
                      className="glow-card relative rounded-2xl p-6 text-left transition-all"
                      style={{
                        background: isSelected ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(16, 185, 129, 0.02))' : 'var(--bg-card)',
                        border: isSelected ? '2px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                      }}
                    >
                      {b.type === 'DAYS_15' && (
                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ background: 'var(--brand-primary)' }}>
                          Most Popular
                        </span>
                      )}
                      <h3 className="text-lg font-bold mb-1">{b.label}</h3>
                      <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>{b.days} days of fresh meal preps</p>
                      {b.discount && (
                        <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold mb-3" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--brand-accent)' }}>
                          {b.discount}
                        </span>
                      )}
                      {isSelected && (
                        <div className="absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: 'var(--brand-primary)' }}>✓</div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Price Summary */}
              {bundleType && (
                <div className="rounded-2xl p-5 mb-6 animate-fade-in-up" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Per day</span>
                    <span className="text-sm font-bold" style={{ fontFamily: 'var(--font-mono)' }}>₹{getPerDayPrice()}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Duration</span>
                    <span className="text-sm font-bold" style={{ fontFamily: 'var(--font-mono)' }}>{getBundleDays()} days</span>
                  </div>
                  <div className="h-px my-3" style={{ background: 'var(--border-subtle)' }} />
                  <div className="flex justify-between items-center">
                    <span className="text-base font-bold">Total</span>
                    <span className="text-xl font-black" style={{ fontFamily: 'var(--font-mono)', color: 'var(--brand-primary)' }}>₹{getTotalPrice()}</span>
                  </div>
                </div>
              )}

              <button
                onClick={() => bundleType && setStep('address')}
                disabled={!bundleType}
                className="w-full py-3.5 rounded-xl text-base font-bold text-white transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'var(--brand-primary)' }}
              >
                Continue to Delivery Address →
              </button>
            </div>
          )}

          {/* STEP 2: Address Form */}
          {step === 'address' && (
            <div className="animate-fade-in-up">
              <div className="text-center mb-8">
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--brand-accent)' }}>Step 3 of 3</span>
                <h2 className="text-2xl sm:text-3xl font-black mt-2">Delivery Details</h2>
                <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>Where should we deliver your daily meal prep?</p>
              </div>

              <div className="rounded-2xl p-6 space-y-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Full Name *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Phone Number *</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Delivery Address *</label>
                  <textarea
                    value={form.street}
                    onChange={(e) => setForm({ ...form, street: e.target.value })}
                    placeholder="House/Flat No., Building, Street, Landmark"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
                    style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>City</label>
                    <input
                      type="text"
                      value={form.city}
                      disabled
                      className="w-full px-4 py-3 rounded-xl text-sm opacity-60"
                      style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>State</label>
                    <input
                      type="text"
                      value={form.state}
                      disabled
                      className="w-full px-4 py-3 rounded-xl text-sm opacity-60"
                      style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Pincode *</label>
                    <input
                      type="text"
                      value={form.pincode}
                      onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, '') })}
                      placeholder="560034"
                      maxLength={6}
                      className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Preferred Delivery Time *</label>
                  <input
                    type="time"
                    value={form.deliveryTime}
                    onChange={(e) => setForm({ ...form, deliveryTime: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
                  />
                  <p className="text-[10px] mt-1.5" style={{ color: 'var(--text-muted)' }}>We will deliver your meal at this time every day.</p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep('bundle')}
                  className="px-6 py-3.5 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: 'transparent', border: '1.5px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
                >
                  ← Back
                </button>
                <button
                  onClick={handleSubmitAddress}
                  disabled={!form.street || !form.pincode || !form.name || !form.phone || !form.deliveryTime}
                  className="flex-1 py-3.5 rounded-xl text-base font-bold text-white transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: 'var(--brand-primary)' }}
                >
                  Proceed to Payment — ₹{getTotalPrice()}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Payment */}
          {step === 'pay' && (
            <div className="animate-fade-in-up">
              <div className="text-center mb-8">
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--brand-primary)' }}>Almost There!</span>
                <h2 className="text-2xl sm:text-3xl font-black mt-2">Pay via UPI</h2>
                <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>Securely pay using PhonePe, GPay, or Paytm.</p>
              </div>

              {/* Order Summary */}
              <div className="rounded-2xl p-6 mb-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--text-secondary)' }}>Order Summary</h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-muted)' }}>Meal Plan</span>
                    <span className="font-semibold">{selectedProduct.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-muted)' }}>Bundle</span>
                    <span className="font-semibold">{getBundleDays()} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-muted)' }}>Per Day</span>
                    <span className="font-semibold" style={{ fontFamily: 'var(--font-mono)' }}>₹{getPerDayPrice()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-muted)' }}>Delivery</span>
                    <span className="font-semibold" style={{ color: 'var(--brand-primary)' }}>FREE</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-muted)' }}>Deliver to</span>
                    <span className="font-semibold text-right max-w-[200px] truncate">{address?.street}, {address?.pincode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-muted)' }}>Delivery Time</span>
                    <span className="font-semibold" style={{ color: 'var(--brand-primary)' }}>{deliveryTime}</span>
                  </div>
                  <div className="h-px my-1" style={{ background: 'var(--border-subtle)' }} />
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-base">Total</span>
                    <span className="text-xl font-black" style={{ fontFamily: 'var(--font-mono)', color: 'var(--brand-primary)' }}>₹{getTotalPrice()}</span>
                  </div>
                </div>
              </div>

              {/* UPI QR Payment */}
              <div className="rounded-2xl p-6 mb-6 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>Scan QR to Pay</h3>
                <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>Use PhonePe, GPay, or Paytm to scan and pay <span className="font-bold text-white">₹{getTotalPrice()}</span>.</p>
                
                <div className="inline-block p-2 bg-white rounded-xl mb-6">
                  <img src="/upi-qr.png" alt="UPI QR Code" className="w-48 h-48 rounded-lg border border-gray-200" />
                </div>
                
                <div className="text-left">
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Enter 12-digit UTR / Reference No. *</label>
                  <input
                    type="text"
                    placeholder="e.g. 123456789012"
                    maxLength={12}
                    className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
                    id="utr-input"
                  />
                  <p className="text-[10px] mt-1.5" style={{ color: 'var(--text-muted)' }}>Find this in your UPI app's transaction history.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('address')}
                  className="px-6 py-3.5 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: 'transparent', border: '1.5px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
                >
                  ← Back
                </button>
                <button
                  className="flex-1 py-3.5 rounded-xl text-base font-bold text-white transition-all hover:scale-[1.01] active:scale-[0.99]"
                  style={{ background: 'var(--brand-primary)' }}
                  onClick={async () => {
                    const utr = (document.getElementById('utr-input') as HTMLInputElement)?.value;
                    if (utr?.length !== 12) {
                      alert('Please enter a valid 12-digit UTR / Reference Number.');
                      return;
                    }
                    
                    try {
                      const res = await fetch('/api/checkout', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          productId: selectedProduct?.id,
                          address: form,
                          bundleType,
                          deliveryTime,
                          utr
                        })
                      });
                      
                      if (!res.ok) {
                        if (res.status === 401) {
                          alert('Please log in to complete checkout.');
                          window.location.href = '/login';
                          return;
                        }
                        throw new Error('Checkout failed');
                      }
                      
                      alert('Order confirmed! We will verify the payment and activate your plan.');
                      window.location.href = '/dashboard';
                    } catch (err) {
                      alert('Something went wrong during checkout. Please try again.');
                    }
                  }}
                >
                  Confirm Payment
                </button>
              </div>

              <p className="text-center text-[10px] mt-4" style={{ color: 'var(--text-muted)' }}>
                🔒 Your transaction reference will be manually verified by our team before activation.
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
