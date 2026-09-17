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
      <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full opacity-15 blur-3xl pointer-events-none bg-brand-mustard" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl pointer-events-none bg-brand-mustard" />

      <div className="max-w-5xl mx-auto text-center relative z-10">
        {/* Pure Veg Trust Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-mustard/10 text-brand-mustard border border-brand-mustard/20 mb-4 animate-fade-in">
          <span>🌿 100% Pure Vegetarian &amp; Living Plant Nutrition</span>
        </div>

        {/* Primary Headline */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.2] mb-5 text-brand-forest animate-fade-in-up">
          Bloom your day with <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-mustard to-brand-mustard-hover">BlooMaa</span>
        </h1>

        {/* Sub-headline */}
        <p className="max-w-2xl mx-auto text-sm sm:text-base leading-relaxed mb-8 text-brand-forest-muted animate-fade-in-up-delay-2">
          Cold-crafted fresh salads, sprouted nutrition boxes, and natural enzyme vitality delivered across Patna every morning (6 AM – 9 AM). 100% pure vegetarian, zero meat/eggs, zero cooked denatured oils.
        </p>

        {/* CTA Area: If verified, show "Claim 7D Trial" directly; otherwise "Check Delivery Zone" */}
        <div className="max-w-md mx-auto mb-14 animate-fade-in-up-delay-3 flex flex-col sm:flex-row items-center justify-center gap-3">
          {mounted && verifiedPincode ? (
            <a
              href="#trial"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('trial')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-sm bg-brand-mustard text-brand-forest hover:bg-brand-mustard transition-all shadow-xl shadow-brand-mustard/25 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>🌱 Claim 7D Trial (₹451)</span>
              <span>→</span>
            </a>
          ) : (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-sm bg-brand-mustard text-brand-forest hover:bg-brand-mustard transition-all shadow-xl shadow-brand-mustard/25 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>📍 Check Delivery Pincode</span>
              <span>→</span>
            </button>
          )}

          <Link
            href="/calculator"
            className="w-full sm:w-auto px-6 py-4 rounded-2xl font-bold text-sm bg-brand-cream/80 hover:bg-brand-border/80 text-brand-forest border border-brand-border transition-all flex items-center justify-center gap-2"
          >
            <span>Bio Calculator</span>
            <span className="text-[10px] px-2 py-0.5 rounded font-black uppercase bg-brand-mustard/20 text-brand-mustard border border-brand-mustard/30">
              Free
            </span>
          </Link>
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
