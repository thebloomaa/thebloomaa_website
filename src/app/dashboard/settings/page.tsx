'use client';

import React, { useState, useEffect } from 'react';
import AllergyPreferencesSelector from '@/components/AllergyPreferencesSelector';

export default function SubscriberSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    deliveryTime: '07:00',
    dietaryPreference: 'VEG',
    allergies: '',
  });

  useEffect(() => {
    fetch('/api/user/profile')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setForm({
            name: data.user.name || '',
            phone: data.user.phone || '',
            deliveryTime: data.user.deliveryTime || '07:00',
            dietaryPreference: data.user.dietaryPreference || 'VEG',
            allergies: data.user.allergies || '',
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load profile:', err);
        setLoading(false);
      });
  }, []);

  // Auto-dismiss success popup after 3.5 seconds
  useEffect(() => {
    if (showSavedModal) {
      const timer = setTimeout(() => {
        setShowSavedModal(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [showSavedModal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setShowSavedModal(true);
      } else {
        const data = await res.json().catch(() => null);
        setErrorMessage(data?.error || 'Failed to update settings. Please try again.');
      }
    } catch {
      setErrorMessage('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-brand-forest">Subscriber Settings</h1>
        <p className="text-xs text-brand-forest-muted mt-1">
          Manage your contact details, morning delivery slot, and dietary preferences.
        </p>
      </div>

      <div className="rounded-3xl p-6 sm:p-8 bg-brand-card border border-brand-border shadow-xl">
        {loading ? (
          <div className="p-8 text-center text-brand-forest-muted/70 text-sm">Loading your preferences...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 text-xs">
            {/* Contact Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-brand-mustard uppercase tracking-wider">
                1. Delivery Contact
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-brand-forest-muted mb-1.5 uppercase tracking-wider text-[11px]">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-brand-cream border border-brand-border text-brand-forest placeholder:text-brand-forest-muted/70 focus:outline-none focus:border-brand-mustard"
                  />
                </div>

                <div>
                  <label className="block font-bold text-brand-forest-muted mb-1.5 uppercase tracking-wider text-[11px]">
                    WhatsApp Phone (for Morning OTP / Drop Alert)
                  </label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-brand-cream border border-brand-border text-brand-forest placeholder:text-brand-forest-muted/70 focus:outline-none focus:border-brand-mustard"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Time Window */}
            <div className="space-y-4 pt-4 border-t border-brand-border">
              <h3 className="text-sm font-bold text-brand-mustard uppercase tracking-wider">
                2. Morning Delivery Time Slot
              </h3>
              <p className="text-brand-forest-muted text-[11px]">
                Our cloud kitchen fleet departs at 5:30 AM. Choose your optimal morning delivery window:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {['06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00'].map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setForm({ ...form, deliveryTime: time })}
                    className={`p-3 rounded-xl font-mono text-center font-bold transition-all cursor-pointer ${
                      form.deliveryTime === time
                        ? 'bg-brand-mustard text-brand-forest shadow-md ring-2 ring-brand-mustard/30'
                        : 'bg-brand-cream text-brand-forest-muted hover:bg-brand-border border border-brand-border'
                    }`}
                  >
                    {time} AM
                  </button>
                ))}
              </div>
            </div>

            {/* Dietary Preferences */}
            <div className="space-y-4 pt-4 border-t border-brand-border">
              <h3 className="text-sm font-bold text-brand-mustard uppercase tracking-wider">
                3. Dietary &amp; Allergen Notes
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-brand-forest-muted mb-1.5 uppercase tracking-wider text-[11px]">
                    Dietary Focus
                  </label>
                  <select
                    value={form.dietaryPreference}
                    onChange={(e) => setForm({ ...form, dietaryPreference: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-brand-cream border border-brand-border text-brand-forest focus:outline-none focus:border-brand-mustard"
                  >
                    <option value="VEG">100% Pure Vegetarian</option>
                    <option value="VEGAN">Vegan Plant-Based</option>
                    <option value="LIVING_RAW">Living Raw &amp; Sprouts</option>
                    <option value="HIGH_PROTEIN">High Protein Plant / Sprouts</option>
                    <option value="KETO">Plant Keto / Low Carb</option>
                  </select>
                </div>

                <div className="pt-2">
                  <AllergyPreferencesSelector
                    value={form.allergies}
                    onChange={(val) => setForm({ ...form, allergies: val })}
                    title="Allergies & Custom Bowl Preferences"
                    subtitle="Save your allergies and disliked fruits or seeds so our cloud kitchen always customizes your daily bowls."
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-sm bg-brand-mustard text-brand-forest hover:bg-brand-mustard transition-all shadow-lg shadow-brand-mustard/20 disabled:opacity-50 cursor-pointer"
              >
                {saving ? 'Saving...' : 'Save Settings ✓'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Settings Saved Success Popup Modal */}
      {showSavedModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
          onClick={() => setShowSavedModal(false)}
        >
          <div
            className="rounded-3xl p-6 sm:p-8 w-full max-w-sm bg-white border border-[#DDD5C0] shadow-2xl text-center space-y-4 animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Animated Green Checkmark Ring */}
            <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-500 text-emerald-600 flex items-center justify-center text-3xl font-black mx-auto shadow-sm">
              ✓
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Preferences Updated
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#0D2818] mt-2">
                Settings Saved! 🎉
              </h3>
              <p className="text-xs text-[#5E7A67] mt-1.5 leading-relaxed">
                Your contact details, morning delivery slot, and dietary preferences have been saved successfully.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowSavedModal(false)}
                className="w-full py-3 px-6 rounded-full font-bold text-xs sm:text-sm bg-[#0F3826] text-white hover:bg-[#185338] transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                Awesome, Got It ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Error Popup Modal */}
      {errorMessage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
          onClick={() => setErrorMessage(null)}
        >
          <div
            className="rounded-3xl p-6 sm:p-7 w-full max-w-sm bg-white border border-rose-200 shadow-2xl text-center space-y-4 animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="w-14 h-14 rounded-full bg-rose-50 border-2 border-rose-500 text-rose-600 flex items-center justify-center text-2xl mx-auto">
              ⚠️
            </div>

            <div>
              <h3 className="font-serif text-xl font-bold text-[#0D2818]">
                Update Failed
              </h3>
              <p className="text-xs text-rose-600 mt-1 leading-relaxed">
                {errorMessage}
              </p>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="w-full py-2.5 px-6 rounded-full font-bold text-xs bg-[#0F3826] text-white hover:bg-[#185338] transition-all cursor-pointer"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
