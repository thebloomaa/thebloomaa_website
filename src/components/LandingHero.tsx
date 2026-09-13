'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import PincodeModal from '@/components/PincodeModal';
import { useBundleStore } from '@/store/useBundleStore';

export default function LandingHero() {
  const { pincode: storePincode, setPincode: setStorePincode } = useBundleStore();
  const [verifiedPincode, setVerifiedPincode] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check localStorage or cookie for existing verified pincode
    if (typeof window !== 'undefined') {
      const saved =
        localStorage.getItem('thebloomaa_pincode') ||
        document.cookie
          .split('; ')
          .find((row) => row.startsWith('thebloomaa_pincode='))
          ?.split('=')[1];

      if (saved) {
        setVerifiedPincode(saved);
        setStorePincode(saved);
      } else {
        // Automatically prompt new users without a verified pincode
        const timer = setTimeout(() => {
          setIsModalOpen(true);
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [setStorePincode]);

  const handlePincodeVerified = (newPin: string) => {
    setVerifiedPincode(newPin);
    setStorePincode(newPin);
  };

  return (
    <section className="relative pt-28 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Ambient background glow effects */}
      <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full opacity-15 blur-3xl pointer-events-none bg-emerald-500" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl pointer-events-none bg-amber-500" />

      <div className="max-w-5xl mx-auto text-center relative z-10">
        {/* Brand Motto & Patna Live Status Pill */}
        <div className="animate-fade-in-up mb-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/90 border border-amber-400/40 backdrop-blur-md shadow-lg shadow-amber-500/5">
            <div className="relative w-6 h-6 rounded-full overflow-hidden border border-amber-400/70 shrink-0">
              <Image
                src="/logo.jpg"
                alt="thebloomaa - Bloom your day with bloomaa"
                fill
                sizes="24px"
                className="object-cover"
              />
            </div>
            <span className="text-xs font-serif italic text-amber-300">
              Bloom your day with bloomaa
            </span>
          </div>

          {mounted && verifiedPincode ? (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Delivering to Patna ({verifiedPincode})</span>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="ml-1 text-[11px] text-slate-400 hover:text-emerald-300 underline underline-offset-2"
              >
                Change Area
              </button>
            </div>
          ) : (
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Fresh Morning Cloud Kitchens · Patna</span>
            </span>
          )}
        </div>

        {/* Primary Required Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] mb-6 text-slate-100 animate-fade-in-up-delay-1">
          Your Macros, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Mastered.</span> <br className="hidden sm:block" />
          Delivered Daily.
        </h1>

        {/* Sub-headline */}
        <p className="max-w-2xl mx-auto text-base sm:text-lg leading-relaxed mb-8 text-slate-300 animate-fade-in-up-delay-2">
          Chef-crafted, macro-tracked meal preps and living foods delivered to your doorstep in Patna every morning. Zero cooking, zero dishwashing, pure performance.
        </p>

        {/* CTA Area: If verified, show "Browse Meal Plans" directly; otherwise "Check Delivery Zone" */}
        <div className="max-w-md mx-auto mb-14 animate-fade-in-up-delay-3 flex flex-col sm:flex-row items-center justify-center gap-3">
          {mounted && verifiedPincode ? (
            <Link
              href="/menu"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-sm bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/25 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Browse Meal Plans</span>
              <span>→</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-sm bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/25 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>📍 Check Delivery Pincode</span>
              <span>→</span>
            </button>
          )}

          <Link
            href="/calculator"
            className="w-full sm:w-auto px-6 py-4 rounded-2xl font-bold text-sm bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 transition-all flex items-center justify-center gap-2"
          >
            <span>Bio Calculator</span>
            <span className="text-[10px] px-2 py-0.5 rounded font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Free
            </span>
          </Link>
        </div>

        {/* 3-Step Process Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left pt-6 border-t border-slate-800/80">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              🎯
            </div>
            <h3 className="text-sm font-black text-slate-100 uppercase tracking-wider">
              1. Pick Your Goal
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Lean muscle, fat loss, or living gut reset. Every dish is weighed and macro-calibrated.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3 bg-amber-500/10 text-amber-400 border border-amber-500/20">
              📦
            </div>
            <h3 className="text-sm font-black text-slate-100 uppercase tracking-wider">
              2. Choose Your Bundle
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Select a 7, 15, or 30-day prepaid pack. Pause or skip any morning directly from your phone.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3 bg-blue-500/10 text-blue-400 border border-blue-500/20">
              🚀
            </div>
            <h3 className="text-sm font-black text-slate-100 uppercase tracking-wider">
              3. We Cook &amp; Deliver (6 AM - 9 AM)
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Chef-prepared same morning in our cloud kitchen. Delivered before your day begins.
            </p>
          </div>
        </div>
      </div>

      {/* Embedded Pincode Modal (Automatically prompts or opens on trigger) */}
      <PincodeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onVerified={handlePincodeVerified}
      />
    </section>
  );
}
