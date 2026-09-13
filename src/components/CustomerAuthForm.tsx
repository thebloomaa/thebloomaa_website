'use client';

import React, { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useBioCalcStore } from '@/store/useBioCalcStore';

export default function CustomerAuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bioStore = useBioCalcStore();

  const urlMode = searchParams.get('mode');
  const [mode, setMode] = useState<'signin' | 'register'>(
    urlMode === 'signin' ? 'signin' : 'register'
  );

  useEffect(() => {
    const m = searchParams.get('mode');
    if (m === 'signin') {
      setMode('signin');
    } else if (m === 'signup' || m === 'register') {
      setMode('register');
    }
  }, [searchParams]);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // Register: 1: Contact, 2: Nutrition, 3: Delivery, 4: OTP
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [maskedTarget, setMaskedTarget] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // Returning User State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginOtp, setLoginOtp] = useState(['', '', '', '', '', '']);
  const [loginStep, setLoginStep] = useState<'input' | 'otp'>('input');

  // New Subscriber Registration State
  const [regForm, setRegForm] = useState({
    name: '',
    phone: '',
    email: '',
    fitnessGoal: 'LEAN_MUSCLE',
    dietaryPreference: 'VEG',
    allergies: '',
    age: '',
    gender: 'male',
    pincode: '800001',
    street: '',
    landmark: '',
    deliveryTime: '07:00',
  });
  const [regOtp, setRegOtp] = useState(['', '', '', '', '', '']);

  // Pre-fill from Bio Calculator if available
  useEffect(() => {
    if (bioStore.results) {
      setRegForm((prev) => ({
        ...prev,
        fitnessGoal:
          bioStore.inputs.healthGoal === 'WEIGHT_LOSS'
            ? 'FAT_LOSS'
            : bioStore.inputs.healthGoal === 'LEAN_MUSCLE'
            ? 'LEAN_MUSCLE'
            : 'LIVING_GUT_RESET',
        dietaryPreference:
          bioStore.inputs.cookedFoodPercentage < 40 ? 'LIVING_RAW' : 'VEG',
        age: bioStore.inputs.age ? String(bioStore.inputs.age) : prev.age,
        gender: bioStore.inputs.gender || prev.gender,
      }));
    }
  }, [bioStore.results, bioStore.inputs]);

  // Resend Timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  // -------------------------------------------------------------
  // Returning User Handler
  // -------------------------------------------------------------
  const handleSendLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim()) {
      setErrorMsg('Please enter your registered email or phone number.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginIdentifier.includes('@') ? loginIdentifier : undefined,
          phone: !loginIdentifier.includes('@') ? loginIdentifier : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMaskedTarget(data.masked || loginIdentifier);
        setLoginStep('otp');
        setResendTimer(30);
      } else {
        setErrorMsg(data.error || 'Failed to send OTP. Please try again.');
      }
    } catch {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = loginOtp.join('');
    if (code.length !== 6) {
      setErrorMsg('Please enter the full 6-digit OTP code.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const res = await signIn('credentials', {
      redirect: false,
      email: loginIdentifier.trim().toLowerCase(),
      otp: code,
    });

    setLoading(false);

    if (res?.error) {
      setErrorMsg('Invalid verification code. (For dev testing, you can use 123456)');
    } else {
      // Determine destination
      const sessionRes = await fetch('/api/auth/session');
      const sessionData = await sessionRes.json();

      if (sessionData?.user?.role === 'ADMIN') {
        router.push('/admin');
      } else if (sessionData?.user?.role === 'RIDER') {
        router.push('/rider/manifest');
      } else {
        router.push('/dashboard');
      }
      router.refresh();
    }
  };

  // -------------------------------------------------------------
  // New Member Registration Handlers
  // -------------------------------------------------------------
  const handleRegSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!regForm.email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (regForm.phone.replace(/\D/g, '').length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile/WhatsApp number.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regForm.email, phone: regForm.phone }),
      });

      const data = await res.json();
      if (res.ok) {
        setMaskedTarget(data.masked || regForm.email);
        setStep(4); // Move to OTP step
        setResendTimer(30);
      } else {
        setErrorMsg(data.error || 'Failed to dispatch verification code.');
      }
    } catch {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = regOtp.join('');
    if (code.length !== 6) {
      setErrorMsg('Please enter the full 6-digit OTP code.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const fullStreetAddress = `${regForm.street}${regForm.landmark ? ` (Near ${regForm.landmark})` : ''}`;

    const res = await signIn('credentials', {
      redirect: false,
      email: regForm.email.trim().toLowerCase(),
      otp: code,
      name: regForm.name.trim(),
      phone: regForm.phone.trim(),
      fitnessGoal: regForm.fitnessGoal,
      dietaryPreference: regForm.dietaryPreference,
      allergies: regForm.allergies,
      deliveryTime: regForm.deliveryTime,
      street: fullStreetAddress,
      pincode: regForm.pincode,
    });

    setLoading(false);

    if (res?.error) {
      setErrorMsg('Invalid verification code. Please check your code or use 123456 in dev mode.');
    } else {
      const callback = searchParams.get('callbackUrl') || '/#trial';
      router.push(callback);
      router.refresh();
    }
  };

  // OTP Digits helper
  const handleOtpInput = (
    index: number,
    val: string,
    state: string[],
    setState: (v: string[]) => void,
    prefix: string
  ) => {
    if (val.length > 1) return;
    const next = [...state];
    next[index] = val.replace(/\D/g, '');
    setState(next);
    if (val && index < 5) {
      document.getElementById(`${prefix}-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent,
    state: string[],
    prefix: string
  ) => {
    if (e.key === 'Backspace' && !state[index] && index > 0) {
      document.getElementById(`${prefix}-${index - 1}`)?.focus();
    }
  };

  return (
    <div className="rounded-3xl p-6 sm:p-10 bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-xl relative">
      {/* Tab Switcher */}
      <div className="flex rounded-2xl bg-slate-950/80 p-1.5 border border-slate-800 mb-8">
        <button
          type="button"
          onClick={() => {
            setMode('register');
            setErrorMsg(null);
          }}
          className={`flex-1 py-3 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            mode === 'register'
              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>✨</span>
          <span>Sign Up (New Member)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setMode('signin');
            setErrorMsg(null);
          }}
          className={`flex-1 py-3 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            mode === 'signin'
              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>🔐</span>
          <span>Log In (Returning User)</span>
        </button>
      </div>

      {/* Inline Error Notice */}
      {errorMsg && (
        <div className="mb-6 p-3.5 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2 animate-fade-in">
          <span>⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODE 1: RETURNING SUBSCRIBER SIGN IN                      */}
      {/* ========================================================= */}
      {mode === 'signin' && (
        <div>
          {loginStep === 'input' ? (
            <form onSubmit={handleSendLoginOtp} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Email or Registered WhatsApp Phone
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. rahul@gmail.com or 9876543210"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl bg-slate-800 border border-slate-700 text-slate-100 text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-all font-medium"
                />
                <p className="text-[11px] text-slate-400 mt-1.5">
                  We'll send a 6-digit one-time code to authenticate your account.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !loginIdentifier.trim()}
                className="w-full py-3.5 rounded-2xl font-black text-sm bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Send Verification Code →'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyLoginOtp} className="space-y-6 animate-fade-in">
              <div className="text-center space-y-1">
                <span className="text-xs uppercase font-black text-emerald-400 tracking-wider">
                  Verification Code Sent
                </span>
                <p className="text-xs text-slate-300">
                  Enter the 6-digit code sent to <strong className="text-slate-100 font-mono">{maskedTarget}</strong>
                </p>
              </div>

              {/* 6-Digit OTP Inputs */}
              <div className="flex justify-center gap-2 sm:gap-3">
                {loginOtp.map((digit, i) => (
                  <input
                    key={i}
                    id={`l-otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    autoFocus={i === 0}
                    onChange={(e) => handleOtpInput(i, e.target.value, loginOtp, setLoginOtp, 'l-otp')}
                    onKeyDown={(e) => handleOtpKeyDown(i, e, loginOtp, 'l-otp')}
                    className="w-11 h-14 sm:w-12 sm:h-14 text-center text-xl font-mono font-black rounded-2xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
                  />
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <button
                  type="button"
                  onClick={() => setLoginStep('input')}
                  className="hover:text-slate-200 underline underline-offset-2"
                >
                  ← Change email/phone
                </button>

                {resendTimer > 0 ? (
                  <span>Resend in {resendTimer}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendLoginOtp}
                    className="text-emerald-400 hover:text-emerald-300 font-bold"
                  >
                    Resend Code
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || loginOtp.join('').length !== 6}
                className="w-full py-3.5 rounded-2xl font-black text-sm bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Verify & Access Dashboard →'
                )}
              </button>
            </form>
          )}

          {/* Quick switch to Sign Up */}
          <div className="pt-5 mt-6 border-t border-slate-800/80 text-center">
            <p className="text-xs text-slate-400">
              New to thebloomaa?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMsg(null);
                }}
                className="text-emerald-400 hover:text-emerald-300 font-bold underline underline-offset-4 cursor-pointer transition-colors"
              >
                Create your detailed member profile (Sign Up) →
              </button>
            </p>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODE 2: DETAILED NEW MEMBER PROFILE REGISTRATION          */}
      {/* ========================================================= */}
      {mode === 'register' && (
        <div>
          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="flex justify-between text-[11px] font-black uppercase tracking-wider mb-2 text-slate-400">
              <span className={step >= 1 ? 'text-emerald-400' : ''}>1. Identity</span>
              <span className={step >= 2 ? 'text-emerald-400' : ''}>2. Macro Goals</span>
              <span className={step >= 3 ? 'text-emerald-400' : ''}>3. Delivery Slot</span>
              <span className={step >= 4 ? 'text-emerald-400' : ''}>4. Verify</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 rounded-full"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>

          {/* Bio Calculator Pre-Fill Sync Banner */}
          {bioStore.results && (
            <div className="mb-6 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300">
              <span>🧬</span>
              <span>
                <strong>Bio Calculator Synced:</strong> Vitality Score{' '}
                <strong className="text-emerald-400">{bioStore.results.livingFoodVitalityScore}%</strong> · Target:{' '}
                {regForm.fitnessGoal.replace('_', ' ')}
              </span>
            </div>
          )}

          {/* STEP 1: CONTACT & IDENTITY */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1.5 text-[11px]">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={regForm.name}
                  onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1.5 text-[11px]">
                  WhatsApp Mobile Number (+91) *
                </label>
                <div className="flex gap-2">
                  <span className="px-3.5 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-400 font-mono text-sm flex items-center">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="98765 43210"
                    value={regForm.phone}
                    onChange={(e) => setRegForm({ ...regForm, phone: e.target.value.replace(/\D/g, '') })}
                    className="flex-1 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm font-mono tracking-wider focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Required for morning 6:00 AM – 9:00 AM delivery dispatch &amp; gate drop photo confirmation.
                </p>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1.5 text-[11px]">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="rahul@example.com"
                  value={regForm.email}
                  onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!regForm.name || !regForm.email || regForm.phone.length < 10) {
                      setErrorMsg('Please complete all contact details to continue.');
                      return;
                    }
                    setErrorMsg(null);
                    setStep(2);
                  }}
                  className="w-full py-3.5 rounded-2xl font-black text-sm bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  Continue to Macro &amp; Nutrition Target →
                </button>
              </div>

              {/* Quick switch to Log In */}
              <div className="pt-4 border-t border-slate-800/80 text-center">
                <p className="text-xs text-slate-400">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setErrorMsg(null);
                    }}
                    className="text-emerald-400 hover:text-emerald-300 font-bold underline underline-offset-4 cursor-pointer transition-colors"
                  >
                    Log In with OTP →
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: NUTRITION TARGET & LIVING FOOD FOCUS */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-in text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-300 mb-2 text-[11px]">
                  Primary Health &amp; Body Objective
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    {
                      id: 'LEAN_MUSCLE',
                      title: '🥩 Lean Muscle Growth',
                      desc: 'High clean protein (140-180g), complex carbohydrates, hypertrophy recovery.',
                    },
                    {
                      id: 'FAT_LOSS',
                      title: '⚡ Fat Loss & Caloric Deficit',
                      desc: 'Low-glycemic greens, high dietary fiber, sustained satiety without crashes.',
                    },
                    {
                      id: 'LIVING_GUT_RESET',
                      title: '🌱 Living Enzyme Gut Reset',
                      desc: 'Raw living foods, activated sprouted seeds, zero denatured cooked oils.',
                    },
                    {
                      id: 'CLEAN_FUEL',
                      title: '⚖️ Balanced Daily Energy',
                      desc: 'Nutrient-dense whole meals for busy professionals & athletes in Patna.',
                    },
                  ].map((goal) => (
                    <button
                      key={goal.id}
                      type="button"
                      onClick={() => setRegForm({ ...regForm, fitnessGoal: goal.id })}
                      className={`p-3.5 rounded-2xl text-left transition-all border cursor-pointer ${
                        regForm.fitnessGoal === goal.id
                          ? 'bg-emerald-500/15 border-emerald-500 text-slate-100 ring-2 ring-emerald-500/20 shadow-md'
                          : 'bg-slate-800/70 border-slate-700 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <strong className="block text-xs font-bold text-slate-100">{goal.title}</strong>
                      <span className="text-[10px] text-slate-400 mt-1 block leading-relaxed">
                        {goal.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1.5 text-[11px]">
                  Dietary Preference
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'VEG', label: '🥗 Vegetarian' },
                    { id: 'VEGAN', label: '🌿 100% Vegan' },
                    { id: 'LIVING_RAW', label: '🌱 Living Raw & Sprouts' },
                    { id: 'HIGH_PROTEIN', label: '🍗 High Protein Non-Veg / Eggs' },
                    { id: 'KETO', label: '🥑 Keto / Low Carb' },
                  ].map((diet) => (
                    <button
                      key={diet.id}
                      type="button"
                      onClick={() => setRegForm({ ...regForm, dietaryPreference: diet.id })}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        regForm.dietaryPreference === diet.id
                          ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                      }`}
                    >
                      {diet.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1 text-[11px]">
                  Allergies or Disliked Ingredients (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Peanuts, Dairy, Gluten, Extra Spicy"
                  value={regForm.allergies}
                  onChange={(e) => setRegForm({ ...regForm, allergies: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-3.5 rounded-2xl font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all cursor-pointer"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 py-3.5 rounded-2xl font-black text-sm bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  Continue to Delivery Slot →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PATNA MORNING DELIVERY & TIME SLOT */}
          {step === 3 && (
            <div className="space-y-5 animate-fade-in text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1.5 text-[11px]">
                  Patna Delivery Pincode *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={regForm.pincode}
                    onChange={(e) => setRegForm({ ...regForm, pincode: e.target.value.replace(/\D/g, '') })}
                    className="w-36 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-mono text-sm tracking-widest focus:outline-none focus:border-emerald-500"
                  />
                  <div className="flex-1 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
                    <span>📍</span>
                    <span>Patna Central Fleet (Boring Rd, Kankarbagh, Patliputra)</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1.5 text-[11px]">
                  House / Flat / Building Address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flat 302, Shanti Vihar Apartment"
                  value={regForm.street}
                  onChange={(e) => setRegForm({ ...regForm, street: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1.5 text-[11px]">
                  Landmark (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Near Boring Canal Road Petrol Pump"
                  value={regForm.landmark}
                  onChange={(e) => setRegForm({ ...regForm, landmark: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-300 mb-2 text-[11px]">
                  Preferred Morning Delivery Window (6:00 AM – 9:00 AM)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { slot: '06:00', label: '6:00 – 6:45 AM', hint: 'Fasted / Early Gym' },
                    { slot: '07:00', label: '7:00 – 7:45 AM', hint: 'Breakfast Regular' },
                    { slot: '08:00', label: '8:00 – 9:00 AM', hint: 'Workday Morning' },
                  ].map((s) => (
                    <button
                      key={s.slot}
                      type="button"
                      onClick={() => setRegForm({ ...regForm, deliveryTime: s.slot })}
                      className={`p-2.5 rounded-xl text-center transition-all border cursor-pointer ${
                        regForm.deliveryTime === s.slot
                          ? 'bg-emerald-500 text-slate-950 font-black border-emerald-400 shadow-md'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      <strong className="block text-xs font-mono">{s.label}</strong>
                      <span className="text-[9px] block opacity-80 mt-0.5">{s.hint}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-3.5 rounded-2xl font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all cursor-pointer"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleRegSendOtp}
                  disabled={loading || !regForm.street || regForm.pincode.length !== 6}
                  className="flex-1 py-3.5 rounded-2xl font-black text-sm bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-40"
                >
                  {loading ? 'Sending Code...' : 'Complete Profile & Send OTP →'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: OTP VERIFICATION */}
          {step === 4 && (
            <form onSubmit={handleVerifyRegistration} className="space-y-6 animate-fade-in text-xs">
              <div className="text-center space-y-1">
                <span className="text-xs uppercase font-black text-emerald-400 tracking-wider">
                  Final Verification
                </span>
                <p className="text-xs text-slate-300">
                  Enter the 6-digit code sent to <strong className="text-slate-100 font-mono">{maskedTarget}</strong>
                </p>
              </div>

              {/* 6-Digit OTP Inputs */}
              <div className="flex justify-center gap-2 sm:gap-3">
                {regOtp.map((digit, i) => (
                  <input
                    key={i}
                    id={`r-otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    autoFocus={i === 0}
                    onChange={(e) => handleOtpInput(i, e.target.value, regOtp, setRegOtp, 'r-otp')}
                    onKeyDown={(e) => handleOtpKeyDown(i, e, regOtp, 'r-otp')}
                    className="w-11 h-14 sm:w-12 sm:h-14 text-center text-xl font-mono font-black rounded-2xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
                  />
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="hover:text-slate-200 underline underline-offset-2"
                >
                  ← Edit details
                </button>

                {resendTimer > 0 ? (
                  <span>Resend in {resendTimer}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleRegSendOtp}
                    className="text-emerald-400 hover:text-emerald-300 font-bold"
                  >
                    Resend Code
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || regOtp.join('').length !== 6}
                className="w-full py-4 rounded-2xl font-black text-sm bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/25 disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  '🎉 Activate Profile & Browse Meals →'
                )}
              </button>

              {/* Quick switch to Log In */}
              <div className="pt-4 border-t border-slate-800/80 text-center">
                <p className="text-xs text-slate-400">
                  Already a subscriber?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setErrorMsg(null);
                    }}
                    className="text-emerald-400 hover:text-emerald-300 font-bold underline underline-offset-4 cursor-pointer transition-colors"
                  >
                    Log In with OTP →
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
