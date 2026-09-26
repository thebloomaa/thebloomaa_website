'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLaunchCountdown } from '@/lib/useLaunchCountdown';

export default function ComingSoonBanner() {
  const { days, hours, minutes, seconds, isLive, isMounted } = useLaunchCountdown();

  return (
    <section className="py-8 sm:py-10 px-3 sm:px-6 lg:px-8 bg-[#FAF7F2] overflow-hidden">
      <div className="max-w-[1536px] mx-auto">
        <div className="relative rounded-3xl p-6 sm:p-10 lg:p-12 overflow-hidden bg-gradient-to-br from-[#0F3826] via-[#144731] to-[#0A2215] text-[#FAF7F2] border-2 border-[#D97706]/40 shadow-2xl">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#E6BE68]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              {/* Pre-Launch Status Tag */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-[#E6BE68]/40 shadow-xs">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-[#E6BE68]">
                  {isLive ? '🎉 Grand Launch Active' : '🚀 Official Pre-Launch • Patna, Bihar'}
                </span>
              </div>

              {/* Main Headline */}
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-white leading-tight">
                {isLive ? (
                  <span>We Are Officially Live in Patna!</span>
                ) : (
                  <span>
                    We Are Launching in Patna on{' '}
                    <span className="text-[#E6BE68] underline decoration-[#D97706] decoration-wavy decoration-1 underline-offset-6">
                      30th September!
                    </span>{' '}
                    🌱
                  </span>
                )}
              </h2>

              {/* Subtitle Description */}
              <p className="text-sm sm:text-base text-white/85 max-w-2xl leading-relaxed">
                Our morning living food kitchen and cold-pressed prep facility in Patna are gearing up for sunrise deliveries. Pre-orders are now officially open so you can lock in your 7-Day Weekly or Custom Monthly plan before our limited first batch fills up!
              </p>

              {/* 3 Pre-Launch Value Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-xs flex items-center gap-3">
                  <span className="text-2xl shrink-0">🛵</span>
                  <div className="text-left">
                    <span className="text-xs font-bold block text-white">Guaranteed Slot</span>
                    <span className="text-[10px] text-white/70">6:00 AM – 9:00 AM drops</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-xs flex items-center gap-3">
                  <span className="text-2xl shrink-0">🌱</span>
                  <div className="text-left">
                    <span className="text-xs font-bold block text-white">100% Living Foods</span>
                    <span className="text-[10px] text-white/70">Raw sprouts &amp; enzymes</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-xs flex items-center gap-3">
                  <span className="text-2xl shrink-0">🎁</span>
                  <div className="text-left">
                    <span className="text-xs font-bold block text-white">Price TBA</span>
                    <span className="text-[10px] text-white/70">Announced on 30 Sept launch</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <Link
                  href="/checkout?plan=trial"
                  className="px-6 py-3 rounded-full text-xs sm:text-sm font-black bg-[#D97706] hover:bg-[#B45309] text-white transition-all shadow-lg hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <span>Pre-Book Your Plan (Price TBA)</span>
                  <span>→</span>
                </Link>

                <a
                  href="#bowls"
                  className="px-5 py-3 rounded-full text-xs sm:text-sm font-bold bg-white/15 hover:bg-white/25 text-white transition-all border border-white/20 hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <span>Explore Bowls 🥗</span>
                </a>

                <Link
                  href="/calculator"
                  className="px-5 py-3 rounded-full text-xs sm:text-sm font-bold bg-white/10 hover:bg-white/20 text-[#E6BE68] transition-all border border-[#E6BE68]/30 hover:scale-105 active:scale-95 flex items-center gap-1.5"
                >
                  <span>🧬 Bio Vitality Calc</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Live Countdown Clock & Visual Bowl Preview */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="w-full max-w-md p-6 rounded-3xl bg-black/30 border border-[#E6BE68]/30 backdrop-blur-md shadow-2xl text-center">
                <span className="text-xs font-black uppercase tracking-widest text-[#E6BE68] block mb-3 flex items-center justify-center gap-1.5">
                  <span>⏳</span>
                  <span>Official Launch Countdown</span>
                </span>

                {/* Big Ticking Number Blocks */}
                {isMounted ? (
                  <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-4">
                    <div className="p-3 sm:p-4 rounded-2xl bg-[#0F3826]/80 border border-white/15 flex flex-col items-center justify-center shadow-inner">
                      <span className="text-2xl sm:text-3xl font-black font-mono text-[#E6BE68]">
                        {days}
                      </span>
                      <span className="text-[10px] sm:text-[11px] font-bold uppercase text-white/70 mt-1">
                        Days
                      </span>
                    </div>

                    <div className="p-3 sm:p-4 rounded-2xl bg-[#0F3826]/80 border border-white/15 flex flex-col items-center justify-center shadow-inner">
                      <span className="text-2xl sm:text-3xl font-black font-mono text-[#E6BE68]">
                        {String(hours).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] sm:text-[11px] font-bold uppercase text-white/70 mt-1">
                        Hours
                      </span>
                    </div>

                    <div className="p-3 sm:p-4 rounded-2xl bg-[#0F3826]/80 border border-white/15 flex flex-col items-center justify-center shadow-inner">
                      <span className="text-2xl sm:text-3xl font-black font-mono text-[#E6BE68]">
                        {String(minutes).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] sm:text-[11px] font-bold uppercase text-white/70 mt-1">
                        Mins
                      </span>
                    </div>

                    <div className="p-3 sm:p-4 rounded-2xl bg-[#0F3826]/80 border border-white/15 flex flex-col items-center justify-center shadow-inner">
                      <span className="text-2xl sm:text-3xl font-black font-mono text-[#E6BE68]">
                        {String(seconds).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] sm:text-[11px] font-bold uppercase text-white/70 mt-1">
                        Secs
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="h-20 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-[#E6BE68] border-t-transparent rounded-full animate-spin" />
                  </div>
                )}

                {/* Date Highlight & Location Tag */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/80">
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
                <div className="mt-4 p-2.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 text-left">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/20 relative">
                    <Image
                      src="/hero-patna-bowl.jpg"
                      alt="Thebloomaa Fresh Morning Bowl"
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#E6BE68] block">
                      First Batch Harvest
                    </span>
                    <span className="text-xs font-bold text-white block">Limited to First 100 Patna Subscribers</span>
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
