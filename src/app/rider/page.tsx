'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function RiderLoginPage() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [riderInfo, setRiderInfo] = useState<{ name: string; zone: string } | null>(null);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = phone.replace(/\D/g, '').slice(-10);
    if (clean.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/rider/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send-otp', phone: clean }),
      });

      const data = await res.json();
      if (res.ok) {
        setRiderInfo({ name: data.riderName, zone: data.assignedZone });
        setStep('otp');
      } else {
        setErrorMsg(data.error || 'Failed to authenticate rider.');
      }
    } catch {
      setErrorMsg('Network error. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value.replace(/\D/g, '');
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`rotp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`rotp-${index - 1}`)?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasted[i] || '';
    }
    setOtp(newOtp);
    const nextIdx = Math.min(pasted.length, 5);
    document.getElementById(`rotp-${nextIdx}`)?.focus();
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      setErrorMsg('Please enter the full 6-digit OTP code.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/rider/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify-otp', phone, otp: code }),
      });

      const data = await res.json();
      if (res.ok) {
        // Store in localStorage for fast mobile manifest access
        if (typeof window !== 'undefined') {
          localStorage.setItem('thebloomaa_rider_id', data.rider.id);
          localStorage.setItem('thebloomaa_rider_name', data.rider.name);
          localStorage.setItem('thebloomaa_rider_zone', data.rider.assignedZone);
        }
        window.location.href = '/rider/manifest';
      } else {
        setErrorMsg(data.error || 'Invalid verification code.');
      }
    } catch {
      setErrorMsg('Network communication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-[#070b14] text-brand-forest">
      <div className="w-full max-w-sm relative z-10">
        <div className="rounded-3xl p-7 sm:p-8 bg-brand-card/90 border border-brand-border shadow-2xl backdrop-blur-xl">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3 bg-brand-mustard/10 border border-brand-mustard/30 shadow-lg shadow-brand-mustard/10">
              🚴
            </div>
            <div className="flex items-center justify-center gap-2 mb-1">
              <h1 className="text-xl font-black tracking-tight text-brand-forest">Rider Dispatch Portal</h1>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-brand-mustard/10 text-brand-mustard border border-brand-mustard/30">
                Patna Fleet
              </span>
            </div>
            <p className="text-xs text-brand-forest-muted">
              {step === 'phone'
                ? 'Sign in with your registered phone number to enter your dispatch passcode.'
                : `Welcome, ${riderInfo?.name || 'Rider'}! Enter your 6-digit dispatch passcode.`}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs flex items-start gap-2 animate-fade-in">
              <span className="text-sm">⚠️</span>
              <p className="font-semibold leading-relaxed flex-1">{errorMsg}</p>
            </div>
          )}

          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-forest-muted mb-1.5">
                  Mobile Number
                </label>
                <div className="flex gap-2">
                  <span className="flex items-center px-3.5 rounded-2xl text-xs font-mono font-bold bg-brand-cream border border-brand-border text-brand-forest-muted">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    autoFocus
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="98765 00001"
                    className="flex-1 px-4 py-3 rounded-2xl bg-brand-cream border border-brand-border text-sm font-mono text-brand-forest placeholder:text-slate-600 focus:outline-none focus:border-brand-mustard transition-all font-bold"
                  />
                </div>
                <p className="text-[11px] text-brand-forest-muted/70 mt-1.5">
                  Fleet members: Enter your 10-digit registered mobile number.
                </p>
              </div>

              <button
                type="submit"
                disabled={phone.length < 10 || loading}
                className="w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-brand-mustard to-brand-mustard hover:from-brand-forest-muted hover:to-brand-mustard text-brand-forest shadow-lg shadow-brand-mustard/20 transition-all disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Continue to Passcode →'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-5 animate-fade-in">
              {riderInfo?.zone && (
                <div className="p-2.5 rounded-xl bg-brand-cream border border-brand-border text-center text-xs">
                  <span className="text-brand-forest-muted">Assigned Zone: </span>
                  <span className="font-bold text-brand-mustard">{riderInfo.zone}</span>
                </div>
              )}

              <div>
                <label className="block text-center text-xs font-bold uppercase tracking-wider text-brand-forest-muted mb-1">
                  Enter 6-Digit Dispatch Passcode
                </label>
                <p className="text-center text-[11px] text-brand-forest-muted/70 mb-3">
                  Enter the 6-digit code assigned to you during onboarding.
                </p>
                <div className="flex justify-center gap-2" onPaste={handlePaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`rotp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-11 h-13 text-center text-xl font-mono font-black rounded-xl bg-brand-cream border border-brand-border text-brand-forest focus:outline-none focus:border-brand-mustard transition-all"
                      autoFocus={i === 0}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={otp.join('').length < 6 || loading}
                className="w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider bg-brand-mustard hover:bg-brand-mustard-hover text-brand-forest shadow-lg shadow-brand-mustard/20 transition-all disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Verify Passcode & Open Manifest →'
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setOtp(['', '', '', '', '', '']);
                  setErrorMsg(null);
                }}
                className="w-full text-center text-xs text-brand-forest-muted hover:text-brand-forest cursor-pointer font-medium"
              >
                ← Change Phone Number
              </button>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-brand-border flex items-center justify-between text-xs text-brand-forest-muted/70">
            <Link href="/" className="hover:text-brand-forest-muted">
              ← Storefront
            </Link>
            <Link href="/admin/login" className="hover:text-brand-mustard font-medium">
              Admin Ops Center →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
