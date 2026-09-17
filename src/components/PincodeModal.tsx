'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useBundleStore } from '@/store/useBundleStore';

interface PincodeModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onVerified?: (pincode: string) => void;
}

export default function PincodeModal({ isOpen: controlledIsOpen, onClose, onVerified }: PincodeModalProps) {
  const router = useRouter();
  const { setPincode: setStorePincode } = useBundleStore();

  const [isOpen, setIsOpen] = useState(false);
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    serviceable: boolean;
    message: string;
    zone?: { neighborhood?: string; city?: string; pincode: string };
  } | null>(null);

  // Unserviceable "Notify Me" state
  const [notifyInput, setNotifyInput] = useState('');
  const [notifySubmitted, setNotifySubmitted] = useState(false);

  // Check if user already has a verified pincode in cookie or localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check cookie or localStorage
    const savedPincode =
      localStorage.getItem('thebloomaa_pincode') ||
      document.cookie
        .split('; ')
        .find((row) => row.startsWith('thebloomaa_pincode='))
        ?.split('=')[1];

    const isSessionDismissed = sessionStorage.getItem('thebloomaa_pincode_dismissed') === 'true';

    if (savedPincode) {
      setStorePincode(savedPincode);
      // If controlledIsOpen is explicitly true, respect it; otherwise keep closed
      if (controlledIsOpen === true) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    } else {
      // No saved pincode: automatically open modal on first visit unless dismissed in session or controlled
      if (controlledIsOpen !== undefined) {
        setIsOpen(controlledIsOpen);
      } else if (!isSessionDismissed) {
        const timer = setTimeout(() => setIsOpen(true), 800);
        return () => clearTimeout(timer);
      }
    }
  }, [controlledIsOpen, setStorePincode]);

  // Sync with controlled prop if passed
  useEffect(() => {
    if (controlledIsOpen !== undefined) {
      setIsOpen(controlledIsOpen);
    }
  }, [controlledIsOpen]);

  const handleClose = () => {
    sessionStorage.setItem('thebloomaa_pincode_dismissed', 'true');
    setIsOpen(false);
    if (onClose) onClose();
  };

  const handleCheckPincode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPincode = pincode.trim().replace(/\D/g, '');
    if (cleanPincode.length !== 6) return;

    setLoading(true);
    setResult(null);
    setNotifySubmitted(false);

    try {
      const res = await fetch(`/api/serviceability?pincode=${cleanPincode}`);
      const data = await res.json();
      setResult(data);

      if (data.serviceable) {
        // Success state: Save to localStorage and cookie (30 days = 2592000s)
        localStorage.setItem('thebloomaa_pincode', cleanPincode);
        document.cookie = `thebloomaa_pincode=${cleanPincode}; path=/; max-age=2592000; SameSite=Lax`;
        setStorePincode(cleanPincode);

        if (onVerified) onVerified(cleanPincode);

        // Auto-close modal after brief celebration
        setTimeout(() => {
          handleClose();
        }, 1500);
      }
    } catch (err) {
      setResult({
        serviceable: false,
        message: 'Network issue. Could not verify pincode. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNotifyMe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyInput.trim()) return;
    setNotifySubmitted(true);
    // Persist interest in localStorage or log for analytics
    try {
      const existing = JSON.parse(localStorage.getItem('thebloomaa_waitlist') || '[]');
      existing.push({ pincode, contact: notifyInput, date: new Date().toISOString() });
      localStorage.setItem('thebloomaa_waitlist', JSON.stringify(existing));
    } catch {
      // Ignore storage errors
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Dark Glassmorphic Backdrop */}
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-brand-cream/80 backdrop-blur-md transition-opacity animate-fade-in"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg rounded-3xl p-6 sm:p-8 backdrop-blur-2xl bg-brand-card/95 border border-brand-border/80 shadow-2xl z-10 animate-fade-in-up">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-0 right-1/4 w-48 h-48 bg-brand-mustard/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-brand-mustard/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-brand-forest-muted hover:text-brand-forest hover:bg-brand-cream transition-colors"
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-brand-mustard/70 shadow-xl shadow-brand-mustard/10 mx-auto mb-3 bg-brand-card ring-4 ring-brand-mustard/20">
            <Image
              src="/logo.jpg"
              alt="Bloom your day with BlooMaa"
              fill
              sizes="64px"
              className="object-cover"
            />
          </div>
          <span className="text-[11px] text-brand-forest-muted font-serif italic tracking-wide block mb-1">
            Bloom your day with BlooMaa
          </span>
          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-mustard/10 text-brand-mustard border border-brand-mustard/20">
            Patna Delivery Zone Check
          </span>
          <h3 className="text-2xl font-black text-brand-forest mt-2 tracking-tight">
            Check Your Area in Patna
          </h3>
          <p className="text-xs text-brand-forest-muted mt-1.5 leading-relaxed max-w-xs mx-auto">
            Fresh chef-prepared living diet preps delivered to your door every morning between 6:00 AM – 9:00 AM.
          </p>
        </div>

        {/* Pincode Input Form */}
        <form onSubmit={handleCheckPincode} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-forest-muted mb-1.5">
              Enter 6-Digit Pincode
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                autoFocus
                placeholder="e.g. 800023 (Punaichak)"
                value={pincode}
                onChange={(e) => {
                  setPincode(e.target.value.replace(/\D/g, ''));
                  setResult(null);
                  setNotifySubmitted(false);
                }}
                className="flex-1 w-full min-w-0 px-4 py-3.5 rounded-2xl bg-brand-cream border border-brand-border text-brand-forest text-sm font-mono tracking-widest placeholder:text-brand-forest-muted/70 focus:outline-none focus:border-brand-mustard focus:ring-2 focus:ring-brand-mustard/20 transition-all"
              />
              <button
                type="submit"
                disabled={pincode.length !== 6 || loading}
                className="px-6 py-3.5 rounded-2xl font-black text-sm bg-brand-mustard text-brand-forest hover:bg-brand-mustard transition-all shadow-lg shadow-brand-mustard/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer min-w-[100px]"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-brand-forest border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Check →'
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Quick Patna Sample Pincodes */}
        <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-brand-forest-muted">
          <span>Popular areas:</span>
          {[
            { pin: '800001', area: 'Boring Rd' },
            { pin: '800020', area: 'Kankarbagh' },
            { pin: '800013', area: 'Patliputra' },
          ].map((sample) => (
            <button
              key={sample.pin}
              type="button"
              onClick={() => {
                setPincode(sample.pin);
                setResult(null);
              }}
              className="text-brand-mustard hover:text-brand-mustard-hover font-mono underline underline-offset-2 decoration-brand-mustard/40"
            >
              {sample.pin}
            </button>
          ))}
        </div>

        {/* RESULTS STATES */}
        {result && (
          <div className="mt-5 animate-fade-in-up">
            {/* SUCCESS STATE */}
            {result.serviceable ? (
              <div className="rounded-2xl p-4 bg-brand-mustard/15 border border-brand-mustard/40 text-left space-y-2">
                <div className="flex items-center gap-2 text-brand-mustard-hover font-bold text-sm">
                  <span>✅</span>
                  <span>We deliver to your neighborhood!</span>
                </div>
                <p className="text-xs text-brand-forest-muted leading-relaxed">
                  {result.message} Your fresh chef prep will arrive hot and bloom-tracked between 6:00 AM – 9:00 AM daily.
                </p>
                <div className="pt-2 flex justify-between items-center">
                  <span className="text-[10px] uppercase font-black tracking-wider text-brand-mustard">
                    Zone Verified · Saved to Device
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      handleClose();
                      router.push('/menu');
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-black bg-brand-mustard text-brand-forest hover:bg-brand-mustard transition-all shadow-md"
                  >
                    Browse Diet Plans →
                  </button>
                </div>
              </div>
            ) : (
              /* ERROR STATE: UNSERVICEABLE & NOTIFY ME */
              <div className="rounded-2xl p-4 bg-red-950/25 border border-red-500/30 text-left space-y-3">
                <div className="flex items-center gap-2 text-red-300 font-bold text-xs sm:text-sm">
                  <span>❌</span>
                  <span>We don't deliver to {pincode} yet.</span>
                </div>
                <p className="text-xs text-brand-forest-muted leading-relaxed">
                  We are rapidly expanding our cloud kitchen routes across Patna. Enter your email or phone to get priority notification as soon as we open delivery to your sector.
                </p>

                {!notifySubmitted ? (
                  <form onSubmit={handleNotifyMe} className="flex gap-2 pt-1">
                    <input
                      type="text"
                      required
                      placeholder="Email or WhatsApp number"
                      value={notifyInput}
                      onChange={(e) => setNotifyInput(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-brand-cream border border-brand-border text-xs text-brand-forest placeholder:text-brand-forest-muted/70 focus:outline-none focus:border-brand-mustard"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl text-xs font-bold text-brand-forest bg-brand-mustard hover:bg-brand-mustard transition-all whitespace-nowrap shadow-sm"
                    >
                      Notify Me
                    </button>
                  </form>
                ) : (
                  <div className="p-2.5 rounded-xl bg-brand-cream/80 border border-brand-border text-xs text-brand-forest-muted font-semibold flex items-center gap-2">
                    <span>🎉</span>
                    <span>You're on the priority waitlist! We will notify you immediately upon rollout.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
