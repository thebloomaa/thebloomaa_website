'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLaunchCountdown } from '@/lib/useLaunchCountdown';

export default function LaunchPopupModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { days, hours, minutes, seconds, isLive, isMounted } = useLaunchCountdown();

  useEffect(() => {
    // Only show once per session after a short 1.5s delay
    try {
      const seen = sessionStorage.getItem('bloomaa_launch_popup_seen');
      if (!seen) {
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 1500);
        return () => clearTimeout(timer);
      }
    } catch {
      // Ignore storage errors in private mode
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    try {
      sessionStorage.setItem('bloomaa_launch_popup_seen', 'true');
    } catch {
      // Ignore storage errors
    }
  };

  const handlePreBookClick = () => {
    handleClose();
    router.push('/checkout?plan=trial');
  };

  const handleMenuClick = () => {
    handleClose();
    const bowlsElem = document.getElementById('bowls');
    if (bowlsElem) {
      bowlsElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div
        className="relative w-full max-w-md sm:max-w-lg rounded-3xl p-5 sm:p-7 bg-gradient-to-br from-[#0F3826] via-[#134630] to-[#0A2215] text-[#FAF7F2] border-2 border-[#D97706]/60 shadow-2xl my-auto max-h-[92vh] overflow-y-auto no-scrollbar animate-scale-up"
        role="dialog"
        aria-modal="true"
        aria-labelledby="popup-title"
      >
        {/* Glow Accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#E6BE68]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close launch announcement"
          className="absolute top-3 right-3 sm:top-4 sm:right-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center text-xs sm:text-sm font-bold transition-all cursor-pointer z-20 shadow-sm"
        >
          ✕
        </button>

        {/* Modal Content */}
        <div className="relative z-10 text-center">
          {/* Top Pulsing Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-[#E6BE68]/40 shadow-xs mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#E6BE68]">
              {isLive ? '🚀 We Are Officially Live!' : '🚀 Grand Launch in Patna • 30 September'}
            </span>
          </div>

          {/* Heading */}
          <h2
            id="popup-title"
            className="font-serif text-xl sm:text-2xl lg:text-[26px] font-bold tracking-tight text-white leading-tight"
          >
            {isLive ? (
              <span>Patna Morning Deliveries Are Live!</span>
            ) : (
              <span>
                Launching on{' '}
                <span className="text-[#E6BE68] underline decoration-[#D97706] decoration-wavy decoration-1 underline-offset-4">
                  30th September!
                </span>{' '}
                🌱
              </span>
            )}
          </h2>

          <p className="text-xs sm:text-[13px] text-white/85 mt-1.5 leading-snug max-w-sm sm:max-w-md mx-auto">
            Our cloud kitchen and cold-prep facility in Patna are opening for sunrise deliveries. Early pre-bookings are now open for our limited first batch of <strong>Just Bloom Plan</strong> and <strong>Custom Monthly</strong> plans!
          </p>

          {/* Live Countdown Blocks */}
          {isMounted && !isLive && (
            <div className="my-3 sm:my-4 p-2.5 sm:p-3 rounded-2xl bg-black/35 border border-[#E6BE68]/30 shadow-inner">
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#E6BE68] block mb-1.5">
                ⏳ Time Remaining Until First Sunrise Delivery
              </span>
              <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                <div className="p-1.5 sm:p-2 rounded-xl bg-[#0F3826]/90 border border-white/15 flex flex-col items-center">
                  <span className="text-lg sm:text-xl font-black font-mono text-[#E6BE68]">
                    {days}
                  </span>
                  <span className="text-[8px] sm:text-[9px] font-bold uppercase text-white/70">Days</span>
                </div>
                <div className="p-1.5 sm:p-2 rounded-xl bg-[#0F3826]/90 border border-white/15 flex flex-col items-center">
                  <span className="text-lg sm:text-xl font-black font-mono text-[#E6BE68]">
                    {String(hours).padStart(2, '0')}
                  </span>
                  <span className="text-[8px] sm:text-[9px] font-bold uppercase text-white/70">Hours</span>
                </div>
                <div className="p-1.5 sm:p-2 rounded-xl bg-[#0F3826]/90 border border-white/15 flex flex-col items-center">
                  <span className="text-lg sm:text-xl font-black font-mono text-[#E6BE68]">
                    {String(minutes).padStart(2, '0')}
                  </span>
                  <span className="text-[8px] sm:text-[9px] font-bold uppercase text-white/70">Mins</span>
                </div>
                <div className="p-1.5 sm:p-2 rounded-xl bg-[#0F3826]/90 border border-white/15 flex flex-col items-center">
                  <span className="text-lg sm:text-xl font-black font-mono text-[#E6BE68]">
                    {String(seconds).padStart(2, '0')}
                  </span>
                  <span className="text-[8px] sm:text-[9px] font-bold uppercase text-white/70">Secs</span>
                </div>
              </div>
            </div>
          )}

          {/* 3 Quick Value Badges */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-left mb-3.5 sm:mb-4">
            <div className="p-2 rounded-xl bg-white/10 border border-white/10 text-center">
              <span className="text-sm sm:text-base block">🛵</span>
              <span className="text-[10px] font-bold text-white block mt-0.5">7–9 AM Drop</span>
              <span className="text-[8px] text-white/60 block">Guaranteed slot</span>
            </div>
            <div className="p-2 rounded-xl bg-white/10 border border-white/10 text-center">
              <span className="text-sm sm:text-base block">🌱</span>
              <span className="text-[10px] font-bold text-white block mt-0.5">100% Living</span>
              <span className="text-[8px] text-white/60 block">Sprouts &amp; enzymes</span>
            </div>
            <div className="p-2 rounded-xl bg-white/10 border border-white/10 text-center">
              <span className="text-sm sm:text-base block">🎁</span>
              <div className="flex items-baseline justify-center gap-1 mt-0.5">
                <span className="text-[10px] text-white/60 line-through font-mono">₹599</span>
                <span className="text-xs font-black text-[#E6BE68] font-mono">₹499</span>
              </div>
              <span className="text-[8px] text-white/70 block">First 100 only</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handlePreBookClick}
              className="w-full py-3 px-5 rounded-full text-xs sm:text-sm font-black bg-[#D97706] hover:bg-[#B45309] text-white transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Pre-Book Just Bloom Plan (₹499 Early Bird)</span>
              <span>→</span>
            </button>

            <button
              type="button"
              onClick={handleMenuClick}
              className="w-full py-2 px-4 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 text-white/90 transition-all border border-white/15 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Explore Daily Living Bowls 🥗</span>
            </button>

            <button
              type="button"
              onClick={handleClose}
              className="text-[10px] text-white/60 hover:text-white/90 underline pt-0.5 transition-colors cursor-pointer"
            >
              Maybe later, continue browsing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
