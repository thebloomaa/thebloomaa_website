'use client';

import React, { useState } from 'react';

export default function RiderLoginPage() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (phone.length < 10) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    setStep('otp');
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 3) document.getElementById(`rotp-${index + 1}`)?.focus();
  };

  const handleVerify = async () => {
    if (otp.join('').length !== 4) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    window.location.href = '/rider/manifest';
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-dark)' }}>
      <div className="w-full max-w-sm">
        <div className="rounded-2xl p-7" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
          <div className="text-center mb-7">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3" style={{ background: 'var(--brand-accent)' }}>
              🚴
            </div>
            <h1 className="text-xl font-black">Rider Portal</h1>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {step === 'phone' ? 'Log in with your registered phone number' : `Enter the 4-digit OTP sent to +91 ${phone}`}
            </p>
          </div>

          {step === 'phone' && (
            <div className="space-y-4 animate-fade-in-up">
              <div className="flex gap-2">
                <span className="flex items-center px-3 rounded-xl text-sm font-medium" style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>+91</span>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()} placeholder="98765 43210" autoFocus
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }} />
              </div>
              <button onClick={handleSendOtp} disabled={phone.length < 10 || loading}
                className="w-full py-3 rounded-xl text-sm font-bold text-white disabled:opacity-40"
                style={{ background: 'var(--brand-accent)' }}>
                {loading ? <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Send OTP'}
              </button>
            </div>
          )}

          {step === 'otp' && (
            <div className="space-y-4 animate-fade-in-up">
              <div className="flex justify-center gap-3">
                {otp.map((digit, i) => (
                  <input key={i} id={`rotp-${i}`} type="text" inputMode="numeric" maxLength={1} value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value.replace(/\D/g, ''))}
                    className="w-14 h-16 text-center text-2xl font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: digit ? '2px solid var(--brand-accent)' : '1px solid var(--border-subtle)' }}
                    autoFocus={i === 0} />
                ))}
              </div>
              <button onClick={handleVerify} disabled={otp.join('').length !== 4 || loading}
                className="w-full py-3 rounded-xl text-sm font-bold text-white disabled:opacity-40"
                style={{ background: 'var(--brand-accent)' }}>
                {loading ? <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Verify & Start Shift'}
              </button>
              <button onClick={() => { setStep('phone'); setOtp(['', '', '', '']); }} className="w-full text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                ← Change number
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
