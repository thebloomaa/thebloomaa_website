'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLaunchCountdown } from '@/lib/useLaunchCountdown';
import { useLivePricing } from '@/lib/useLivePricing';

export default function ComingSoonBanner() {
  const { days, hours, minutes, seconds, isLive, isMounted } = useLaunchCountdown();
  const pricing = useLivePricing();

  return (
    <section className="py-4 sm:py-6 px-3 sm:px-6 lg:px-8 bg-[#FAF7F2] overflow-hidden">
      <div className="max-w-[1536px] mx-auto">
        <div className="relative rounded-3xl p-5 sm:p-7 lg:p-8 overflow-hidden bg-gradient-to-br from-[#0F3826] via-[#144731] to-[#0A2215] text-[#FAF7F2] border border-[#D97706]/40 shadow-xl">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#E6BE68]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-3.5 text-center lg:text-left">
              {/* Pre-Launch Status Tag */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-[#E6BE68]/40 shadow-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-[11px] font-black uppercase tracking-wider text-[#E6BE68]">
                  {isLive ? '🎉 Grand Launch Active' : '🚀 Official Pre-Launch • Patna, Bihar'}
                </span>
              </div>

              {/* Main Headline */}
              <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white leading-tight">
                {isLive ? (
                  <span>We Are Officially Live in Patna!</span>
                ) : (
                  <span>
                    We Are Launching in Patna on{' '}
                    <span className="text-[#E6BE68]">
                      30th September!
                    </span>{' '}
                    🌱
                  </span>
                )}
              </h2>

              {/* Subtitle Description */}
              <p className="text-xs sm:text-[13px] text-white/80 max-w-xl leading-relaxed">
                Our morning living food kitchen and cold-pressed prep facility in Patna are gearing up for sunrise deliveries. Pre-orders are now officially open — lock in your <strong>Just Bloom Plan</strong> or <strong>Custom Monthly</strong> plan before our limited first batch of 100 fills up!
              </p>

              {/* 3 Pre-Launch Value Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div className="p-2 sm:p-2.5 rounded-xl bg-white/10 border border-white/10 backdrop-blur-xs flex items-center gap-2.5">
                  <span className="text-xl shrink-0">🛵</span>
                  <div className="text-left">
                    <span className="text-[11px] font-bold block text-white">Guaranteed Slot</span>
                    <span className="text-[9.5px] text-white/70">6:00 AM – 9:00 AM drops</span>
                  </div>
                </div>

                <div className="p-2 sm:p-2.5 rounded-xl bg-white/10 border border-white/10 backdrop-blur-xs flex items-center gap-2.5">
                  <span className="text-xl shrink-0">🌱</span>
                  <div className="text-left">
                    <span className="text-[11px] font-bold block text-white">100% Living Foods</span>
                    <span className="text-[9.5px] text-white/70">Raw sprouts &amp; enzymes</span>
                  </div>
                </div>

                <div className="p-2 sm:p-2.5 rounded-xl bg-white/10 border border-white/10 backdrop-blur-xs flex items-center gap-2.5">
                  <span className="text-xl shrink-0">🎁</span>
                  <div className="text-left">
                    <div className="flex items-baseline gap-1">
                      {pricing.isEarlyBird && (
                        <span className="text-[13px] font-black text-white line-through opacity-60 font-mono">₹{pricing.originalPrice}</span>
                      )}
                      <span className="text-base font-black text-[#E6BE68] font-mono">₹{pricing.price}</span>
                    </div>
                    <span className="text-[9.5px] text-white/70">
                      {pricing.isEarlyBird ? `${pricing.spotsLeft} spots left of 100` : 'Standard pre-book price'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-1.5 flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
                <Link
                  href="/checkout?plan=trial"
                  className="px-5 py-2.5 rounded-full text-xs font-black bg-[#D97706] hover:bg-[#B45309] text-white transition-all shadow-md hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Pre-Book Just Bloom Plan ₹{pricing.price} →</span>
                </Link>

                <a
                  href="#bowls"
                  className="px-4 py-2.5 rounded-full text-xs font-bold bg-white/15 hover:bg-white/25 text-white transition-all border border-white/20 hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Explore Bowls 🥗</span>
                </a>

                <Link
                  href="/calculator"
                  className="px-4 py-2.5 rounded-full text-xs font-bold bg-white/10 hover:bg-white/20 text-[#E6BE68] transition-all border border-[#E6BE68]/30 hover:scale-105 active:scale-95 flex items-center gap-1.5"
                >
                  <span>🧬 Bio Vitality Calc</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Live Countdown Clock & Visual Bowl Preview */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="w-full max-w-sm p-4 sm:p-5 rounded-2xl bg-black/30 border border-[#E6BE68]/30 backdrop-blur-md shadow-xl text-center">
                <span className="text-[10.5px] font-black uppercase tracking-widest text-[#E6BE68] block mb-2.5 flex items-center justify-center gap-1.5">
                  <span>⏳</span>
                  <span>Official Launch Countdown</span>
                </span>

                {/* Big Ticking Number Blocks */}
                {isMounted ? (
                  <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mb-3">
                    <div className="p-2 sm:p-2.5 rounded-xl bg-[#0F3826]/80 border border-white/15 flex flex-col items-center justify-center shadow-inner">
                      <span className="text-xl sm:text-2xl font-black font-mono text-[#E6BE68]">
                        {days}
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-bold uppercase text-white/70 mt-0.5">
                        Days
                      </span>
                    </div>

                    <div className="p-2 sm:p-2.5 rounded-xl bg-[#0F3826]/80 border border-white/15 flex flex-col items-center justify-center shadow-inner">
                      <span className="text-xl sm:text-2xl font-black font-mono text-[#E6BE68]">
                        {String(hours).padStart(2, '0')}
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-bold uppercase text-white/70 mt-0.5">
                        Hours
                      </span>
                    </div>

                    <div className="p-2 sm:p-2.5 rounded-xl bg-[#0F3826]/80 border border-white/15 flex flex-col items-center justify-center shadow-inner">
                      <span className="text-xl sm:text-2xl font-black font-mono text-[#E6BE68]">
                        {String(minutes).padStart(2, '0')}
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-bold uppercase text-white/70 mt-0.5">
                        Mins
                      </span>
                    </div>

                    <div className="p-2 sm:p-2.5 rounded-xl bg-[#0F3826]/80 border border-white/15 flex flex-col items-center justify-center shadow-inner">
                      <span className="text-xl sm:text-2xl font-black font-mono text-[#E6BE68]">
                        {String(seconds).padStart(2, '0')}
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-bold uppercase text-white/70 mt-0.5">
                        Secs
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="h-16 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-[#E6BE68] border-t-transparent rounded-full animate-spin" />
                  </div>
                )}

                {/* Date Highlight & Location Tag */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-white/80">
                  <span className="flex items-center gap-1">
                    <span>🗓️</span>
                    <span>30 September 2026</span>
                  </span>
                  <span className="flex items-center gap-1 font-bold text-[#E6BE68]">
                    <span>📍</span>
                    <span>Patna Delivery Hub</span>
                  </span>
                </div>

                {/* Mini Visual Thumbnail */}
                <div className="mt-3 p-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2.5 text-left">
                  <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-white/20 relative">
                    <Image
                      src="/hero-patna-bowl.jpg"
                      alt="Thebloomaa Fresh Morning Bowl"
                      fill
                      sizes="36px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#E6BE68] block">
                      First Batch Harvest
                    </span>
                    <span className="text-[11px] font-bold text-white block">Limited to First 100 Patna Subscribers</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
