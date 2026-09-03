'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    gender: '',
    age: '',
    weight: '',
    height: '',
    fitnessGoal: '',
    dietaryPreference: '',
    allergies: '',
    activityLevel: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      alert('Please fill out your Name and Phone Number.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      if (res.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        alert('Failed to save profile. Please try again.');
      }
    } catch (err) {
      alert('An error occurred.');
    }
    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 px-4" style={{ background: 'var(--bg-dark)' }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black mb-2">Complete Your Profile</h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Tell us a bit about yourself so we can tailor the perfect fitness meal plan for you.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in-up">
            
            {/* Basic Info */}
            <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
              <h2 className="text-lg font-bold mb-5" style={{ color: 'var(--brand-primary)' }}>1. Basic Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Full Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
            </div>

            {/* Fitness Metrics */}
            <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
              <h2 className="text-lg font-bold mb-5" style={{ color: 'var(--brand-primary)' }}>2. Body Metrics (Optional)</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Gender</label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none"
                    style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
                  >
                    <option value="">Select</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Age</label>
                  <input
                    type="number"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
                    placeholder="25"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Weight (kg)</label>
                  <input
                    type="number"
                    value={form.weight}
                    onChange={(e) => setForm({ ...form, weight: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
                    placeholder="75"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Height (cm)</label>
                  <input
                    type="number"
                    value={form.height}
                    onChange={(e) => setForm({ ...form, height: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
                    placeholder="175"
                  />
                </div>
              </div>
            </div>

            {/* Diet Preferences */}
            <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
              <h2 className="text-lg font-bold mb-5" style={{ color: 'var(--brand-primary)' }}>3. Goals & Diet</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Primary Goal</label>
                  <select
                    value={form.fitnessGoal}
                    onChange={(e) => setForm({ ...form, fitnessGoal: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none"
                    style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
                  >
                    <option value="">Select Goal</option>
                    <option value="FAT_LOSS">Fat Loss / Cutting</option>
                    <option value="MUSCLE_GAIN">Muscle Gain / Bulking</option>
                    <option value="MAINTENANCE">Maintenance & Health</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Activity Level</label>
                  <select
                    value={form.activityLevel}
                    onChange={(e) => setForm({ ...form, activityLevel: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none"
                    style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
                  >
                    <option value="">Select Activity Level</option>
                    <option value="SEDENTARY">Sedentary (Office Job)</option>
                    <option value="LIGHT">Light Exercise (1-3 days/wk)</option>
                    <option value="MODERATE">Moderate Exercise (3-5 days/wk)</option>
                    <option value="ACTIVE">Very Active (6-7 days/wk)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Dietary Preference</label>
                  <select
                    value={form.dietaryPreference}
                    onChange={(e) => setForm({ ...form, dietaryPreference: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none"
                    style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
                  >
                    <option value="">No Preference</option>
                    <option value="VEG">Vegetarian</option>
                    <option value="VEGAN">Vegan</option>
                    <option value="HIGH_PROTEIN">High Protein (Non-Veg)</option>
                    <option value="KETO">Keto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Food Allergies</label>
                  <input
                    type="text"
                    value={form.allergies}
                    onChange={(e) => setForm({ ...form, allergies: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
                    placeholder="e.g. Peanuts, Dairy, Gluten (Optional)"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !form.name || !form.phone}
              className="w-full py-4 rounded-xl text-base font-bold text-white transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40"
              style={{ background: 'var(--brand-primary)' }}
            >
              {loading ? 'Saving Profile...' : 'Save Profile & Continue →'}
            </button>
            
          </form>
        </div>
      </main>
    </>
  );
}
