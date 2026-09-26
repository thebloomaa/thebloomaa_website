'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLaunchCountdown } from '@/lib/useLaunchCountdown';

export default function TopAnnouncementBar() {
  const { days, hours, minutes, seconds, isLive, isMounted } = useLaunchCountdown();
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    try {
      const dismissed = sessionStorage.getItem('bloomaa_launch_bar_dismissed');
      if (dismissed === 'true') {
        setIsDismissed(true);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissed(true);
    try {
      sessionStorage.setItem('bloomaa_launch_bar_dismissed', 'true');
    } catch {
      // Ignore storage errors
    }
  };

  if (isDismissed) return null;

  // Single ticker items block used for seamless looping
  const renderTickerContent = () => (
    <>
      {/* 1. Launch Announcement with Pulsing Live Dot */}
      <span className="inline-flex items-center gap-2 font-bold text-[#E6BE68] whitespace-nowrap">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span>🚀 {isLive ? 'WE ARE OFFICIALLY LIVE IN PATNA!' : 'GRAND LAUNCH: 30th SEPTEMBER IN PATNA'}</span>
      </span>

      <span className="text-[#D97706]/70 text-xs select-none">✦</span>

      {/* 2. Live Countdown Timer */}
      {isMounted && !isLive && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 border border-[#E6BE68]/40 font-mono text-[10.5px] sm:text-[11px] text-[#E6BE68] shadow-2xs whitespace-nowrap">
          <span>⏳</span>
          <span className="font-bold">{days}d : {String(hours).padStart(2, '0')}h : {String(minutes).padStart(2, '0')}m : {String(seconds).padStart(2, '0')}s</span>
          <span className="text-[10px] text-white/70">Remaining</span>
        </span>
      )}

      <span className="text-[#D97706]/70 text-xs select-none">✦</span>

      {/* 3. Delivery Timing */}
      <span className="inline-flex items-center gap-1.5 text-white/90 whitespace-nowrap">
        <span>🛵</span>
        <span>Fresh Sunrise Deliveries (6:00 AM – 9:00 AM) Across Patna</span>
      </span>

      <span className="text-[#D97706]/70 text-xs select-none">✦</span>

      {/* 4. Living Food Quality */}
      <span className="inline-flex items-center gap-1.5 text-[#FAF7F2] whitespace-nowrap">
        <span>🌱</span>
        <span>100% Raw Living Nutrition • Zero Cooked Oils • Motherly Care</span>
      </span>

      <span className="text-[#D97706]/70 text-xs select-none">✦</span>

      {/* 5. Pre-Booking Callout */}
      <span className="inline-flex items-center gap-1.5 text-white/95 whitespace-nowrap">
        <span>🎁</span>
        <span>🎁 Early Pre-Orders Live: Just Bloom Plan ₹499 & Custom Monthly</span>
      </span>

      <span className="text-[#D97706]/70 text-xs select-none">✦</span>

      {/* 6. Patna Tagline */}
      <span className="inline-flex items-center gap-1 font-script text-base text-[#E6BE68] whitespace-nowrap">
        <span>Patna Eats Better Together ❤️</span>
      </span>

      <span className="text-[#D97706]/70 text-xs select-none">✦</span>
    </>
  );

  return (
    <div className="relative z-50 bg-[#0A2215] text-[#FAF7F2] border-b border-[#D97706]/30 overflow-hidden shadow-inner py-1.5 sm:py-2 text-[11px] sm:text-xs font-medium select-none group">
      {/* Left Gradient Fade */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-[#0A2215] to-transparent z-20" />

      {/* Right Docked CTA Button + Close Button + Fade Gradient */}
      <div className="absolute right-0 top-0 bottom-0 z-30 flex items-center gap-1.5 sm:gap-2 pr-2 sm:pr-4 pl-6 sm:pl-10 bg-gradient-to-l from-[#0A2215] via-[#0A2215]/95 to-transparent">
        <Link
          href="/checkout?plan=trial"
          className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-black bg-[#D97706] hover:bg-[#B45309] text-white transition-all shadow-xs hover:scale-105 active:scale-95 whitespace-nowrap cursor-pointer"
        >
          <span>Pre-Book</span>
          <span className="hidden sm:inline">Now</span>
          <span className="text-[10px]">→</span>
        </Link>

        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss banner"
          className="w-5 h-5 rounded-full hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer shrink-0"
        >
          ✕
        </button>
      </div>

      {/* Moving Marquee Ticker Track (Continuously glides horizontally, hover/touch to pause) */}
      <Link href="/checkout?plan=trial" className="block overflow-hidden cursor-pointer" title="Click to Pre-Book Your Plan">
        <div className="animate-continuous-ticker flex items-center">
          {/* Track A */}
          <div className="flex items-center gap-6 sm:gap-8 shrink-0 pr-6 sm:pr-8">
            {renderTickerContent()}
          </div>

          {/* Track B (Exact Duplicate for seamless infinite loop) */}
          <div className="flex items-center gap-6 sm:gap-8 shrink-0 pr-6 sm:pr-8" aria-hidden="true">
            {renderTickerContent()}
          </div>
        </div>
      </Link>
    </div>
  );
}
