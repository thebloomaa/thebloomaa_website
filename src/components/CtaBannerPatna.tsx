'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function CtaBannerPatna() {
  return (
    <section className="relative w-full bg-[#082015] overflow-hidden">
      {/* Full width container */}
      <div className="relative w-full min-h-[170px] sm:min-h-[200px] lg:min-h-[220px] flex items-center">
        {/* Right Half: Panoramic Patna Sunset Photo with Smooth Gradient Mask */}
        <div className="absolute top-0 right-0 bottom-0 w-full sm:w-2/3 lg:w-3/5 h-full overflow-hidden pointer-events-none z-0">
          <Image
            src="/patna-bridge-sunset.jpg"
            alt="Patna Bridge Ganga Riverfront Sunset"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover object-center lg:object-right"
          />
          {/* Gradient fade from solid dark green on the left into the photo */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#082015] via-[#082015]/85 sm:via-[#082015]/60 to-transparent z-10" />
          {/* Subtle top & bottom vignette to merge with borders */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#082015]/40 via-transparent to-[#082015]/60 z-10" />
        </div>

        {/* Foreground Content (Max-w-7xl aligned) */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-6 sm:py-8 lg:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Content: Headline + Subheadline + Order Your Bowl Button */}
            <div className="lg:col-span-7 space-y-3.5 text-center sm:text-left">
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight leading-[1.12] text-white">
                Choose Your Vitality.<br />
                <span className="text-white">Start Your Bloom.</span>
              </h2>

              <p className="text-xs sm:text-sm text-[#A5C4B0] font-medium tracking-wide">
                Fresh. Natural. Wholesome. Delivered in Patna.
              </p>

              <div className="pt-1.5">
                <Link
                  href="/#plans"
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-xs sm:text-sm font-bold text-[#8C3A27] bg-[#FDF3E3] hover:bg-white transition-all shadow-md hover:scale-105 active:scale-95"
                >
                  <span>Pre-Book Your Plan</span>
                  <span className="text-sm font-black">→</span>
                </Link>
              </div>
            </div>

            {/* Right Side: Handwritten Patna Eats Better Together Text overlaying the panoramic view */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end items-center pt-2 lg:pt-0">
              <div className="text-center lg:text-right px-4 py-2 rounded-2xl bg-[#082015]/40 backdrop-blur-xs border border-white/10 sm:border-none sm:bg-transparent">
                <span className="font-script text-2xl sm:text-3xl lg:text-4xl font-bold text-[#FFF3D6] tracking-wide block drop-shadow-md leading-tight rotate-1">
                  Patna Eats<br />
                  Better Together <span className="text-red-500 inline-block drop-shadow-xs">❤️</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
