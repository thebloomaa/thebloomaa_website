'use client';

import React, { useState, useEffect } from 'react';

export default function SubscriberSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Settings updated successfully!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to update settings. Please try again.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-100">Subscriber Settings</h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your contact details, morning delivery slot, and dietary preferences.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold ${
            message.type === 'success'
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/15 border border-red-500/30 text-red-300'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="rounded-3xl p-6 sm:p-8 bg-slate-900 border border-slate-800 shadow-xl">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Loading your preferences...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 text-xs">
            {/* Contact Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
                1. Delivery Contact
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 mb-1.5 uppercase tracking-wider text-[11px]">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1.5 uppercase tracking-wider text-[11px]">
                    WhatsApp Phone (for Morning OTP / Drop Alert)
                  </label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Time Window */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
                2. Morning Delivery Time Slot
              </h3>
              <p className="text-slate-400 text-[11px]">
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
                        ? 'bg-emerald-500 text-slate-950 shadow-md ring-2 ring-emerald-500/30'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    {time} AM
                  </button>
                ))}
              </div>
            </div>

            {/* Dietary Preferences */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
                3. Dietary &amp; Allergen Notes
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 mb-1.5 uppercase tracking-wider text-[11px]">
                    Dietary Focus
                  </label>
                  <select
                    value={form.dietaryPreference}
                    onChange={(e) => setForm({ ...form, dietaryPreference: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="VEG">Vegetarian</option>
                    <option value="VEGAN">Vegan</option>
                    <option value="LIVING_RAW">Living Raw &amp; Sprouts</option>
                    <option value="HIGH_PROTEIN">High Protein</option>
                    <option value="KETO">Keto</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1.5 uppercase tracking-wider text-[11px]">
                    Allergies / Special Kitchen Instructions
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. No peanuts, extra dressing on side"
                    value={form.allergies}
                    onChange={(e) => setForm({ ...form, allergies: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-sm bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
              >
                {saving ? 'Saving...' : 'Save Settings ✓'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
