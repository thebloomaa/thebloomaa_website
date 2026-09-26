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

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem('bloomaa_launch_bar_dismissed', 'true');
    } catch {
      // Ignore storage errors
    }
  };

  if (isDismissed) return null;

  return (
    <div className="relative z-50 bg-[#0A2215] text-[#FAF7F2] border-b border-[#D97706]/30 px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs font-medium shadow-inner transition-all">
      <div className="max-w-[1536px] mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Pulsing Live Indicator + Status */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="font-black uppercase tracking-wider text-[#E6BE68] text-[10px] sm:text-[11px] whitespace-nowrap">
            {isLive ? '🚀 NOW LIVE' : '🚀 LAUNCHING 30 SEPT'}
          </span>
        </div>

        {/* Center: Message + Live Countdown Timer */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-1 text-center truncate">
          <span className="hidden md:inline text-white/90">
            Patna morning living diet bowl deliveries go live on <strong>September 30th!</strong>
          </span>

          {/* Countdown Pill */}
          {isMounted && !isLive && (
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 border border-[#E6BE68]/30 font-mono text-[10px] sm:text-[11px] text-[#E6BE68] shadow-2xs whitespace-nowrap">
              <span>⏳</span>
              <span className="font-bold">{days}d</span>
              <span>:</span>
              <span className="font-bold">{String(hours).padStart(2, '0')}h</span>
              <span>:</span>
              <span className="font-bold">{String(minutes).padStart(2, '0')}m</span>
              <span className="hidden sm:inline">:</span>
              <span className="hidden sm:inline font-bold">{String(seconds).padStart(2, '0')}s</span>
            </div>
          )}

          <span className="hidden lg:inline text-white/70 text-[11px]">
            • Reserve your morning delivery slot early!
          </span>
        </div>

        {/* Right: Pre-Book CTA Button + Dismiss Button */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/checkout?plan=trial"
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-black bg-[#D97706] hover:bg-[#B45309] text-white transition-all shadow-xs hover:scale-105 active:scale-95 whitespace-nowrap"
          >
            <span>Pre-Book Now</span>
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
      </div>
    </div>
  );
}
