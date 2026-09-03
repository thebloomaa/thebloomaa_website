'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSendOtp = async () => {
    if (!email.includes('@')) return;
    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStep('otp');
      } else {
        alert('Failed to send OTP. Please try again.');
      }
    } catch (err) {
      alert('An error occurred while sending OTP.');
    }
    setLoading(false);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    // Auto-focus next input
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      next?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`);
      prev?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) return;
    setLoading(true);
    
    const res = await signIn('credentials', {
      redirect: false,
      email,
      otp: code,
    });

    setLoading(false);
    
    if (res?.error) {
      alert('Invalid OTP');
    } else {
      // Fetch session to determine role
      const sessionRes = await fetch('/api/auth/session');
      const sessionData = await sessionRes.json();
      
      if (sessionData?.user?.role === 'ADMIN') {
        router.push('/admin');
      } else if (sessionData?.user?.role === 'RIDER') {
        router.push('/rider/manifest');
      } else {
        // Fetch full profile to check if onboarding is needed
        const profileRes = await fetch('/api/user/profile');
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (!profileData.user?.name || !profileData.user?.phone) {
            router.push('/onboarding');
            return; // Don't refresh yet, wait for onboarding
          }
        }
        router.push('/dashboard');
      }
      
      router.refresh();
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-dark)' }}>
        {/* Background glows */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: 'var(--brand-primary)' }} />

        <div className="w-full max-w-md relative z-10">
          <div className="rounded-2xl p-8" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black mx-auto mb-4" style={{ background: 'var(--brand-primary)' }}>
                F
              </div>
              <h1 className="text-2xl font-black">Welcome Back</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                {step === 'email' ? 'Enter your email address to continue' : `Enter the 6-digit OTP sent to ${email}`}
              </p>
            </div>

            {/* Email Step */}
            {step === 'email' && (
              <div className="space-y-4 animate-fade-in-up">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                      placeholder="john@example.com"
                      className="flex-1 px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
                      autoFocus
                    />
                  </div>
                </div>
                <button
                  onClick={handleSendOtp}
                  disabled={!email.includes('@') || loading}
                  className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: 'var(--brand-primary)' }}
                >
                  {loading ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Send OTP'
                  )}
                </button>
              </div>
            )}

            {/* OTP Step */}
            {step === 'otp' && (
              <div className="space-y-5 animate-fade-in-up">
                <div className="flex justify-center gap-2.5">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value.replace(/\D/g, ''))}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-12 h-14 text-center text-xl font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                      style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: digit ? '2px solid var(--brand-primary)' : '1px solid var(--border-subtle)' }}
                      autoFocus={i === 0}
                    />
                  ))}
                </div>
                <button
                  onClick={handleVerify}
                  disabled={otp.join('').length !== 6 || loading}
                  className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: 'var(--brand-primary)' }}
                >
                  {loading ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Verify & Login'
                  )}
                </button>
                <div className="text-center">
                  <button onClick={() => { setStep('email'); setOtp(['', '', '', '', '', '']); }} className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                    ← Change email address
                  </button>
                  <span className="mx-2 text-xs" style={{ color: 'var(--border-subtle)' }}>|</span>
                  <button onClick={handleSendOtp} className="text-xs font-medium" style={{ color: 'var(--brand-primary)' }}>
                    Resend OTP
                  </button>
                </div>
              </div>
            )}
          </div>

          <p className="text-center text-xs mt-6" style={{ color: 'var(--text-muted)' }}>
            By continuing, you agree to our <a href="#" style={{ color: 'var(--brand-primary)' }}>Terms of Service</a> and <a href="#" style={{ color: 'var(--brand-primary)' }}>Privacy Policy</a>.
          </p>
        </div>
      </main>
    </>
  );
}
