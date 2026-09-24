'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const heroBadges = [
  {
    icon: (
      <svg className="w-5 h-5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    title: '100%',
    subtitle: 'Natural',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    ),
    title: '0%',
    subtitle: 'Cooking',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-emerald-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Fresh Daily',
    subtitle: 'in Patna',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-rose-500" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    ),
    title: 'Made with',
    subtitle: 'Care',
  },
];

const heroSlides = [
  {
    image: '/hero-patna-bowl.jpg',
    tag: 'Daily Harvest Special',
    note: 'Real Ingredients Real Change ❤️',
  },
  {
    image: '/bowls/skin-glow.jpg',
    tag: 'Skin & Glow Vitality',
    note: 'Glow Naturally Everyday ✨',
  },
  {
    image: '/bowls/active-fitness.jpg',
    tag: 'Sprouted Plant Fuel',
    note: 'Zero Cooked Oils Always 🌿',
  },
  {
    image: '/bowls/focus-brain.jpg',
    tag: 'Brain & Focus Reset',
    note: 'Sharp Mind, Pure Energy 🧠',
  },
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-play interval for hero pictures (moves every 3.5 seconds)
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1));
    }, 3500);

    return () => clearInterval(timer);
  }, [isPaused]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="relative pt-28 pb-6 sm:pt-32 sm:pb-8 lg:pt-36 lg:pb-10 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#FAF7F2]">
      {/* Decorative leaf backdrop silhouette */}
      <div className="absolute top-0 right-0 w-96 h-96 pointer-events-none opacity-5">
        <svg viewBox="0 0 100 100" fill="#0D2818">
          <path d="M0,0 Q50,0 70,30 Q90,60 100,100 Q60,90 30,70 Q0,50 0,0 Z" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
        {/* Left Column: Headlines & Call to Actions */}
        <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
          {/* Subtitle / Pre-Launch Kicker */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F3826]/10 border border-[#0F3826]/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
            </span>
            <span className="text-xs sm:text-[12px] font-black tracking-wider text-[#0F3826] uppercase">
              🚀 Launching in Patna on 30th September • Pre-Orders Live
            </span>
          </div>

          {/* Primary Serif Headline */}
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-[54px] font-bold leading-[1.12] text-[#0D2818] tracking-tight">
            Maa-like Care.<br />
            <span className="text-[#153E26]">Nature-like Nourishment.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg text-[#3D5A47] font-medium tracking-wide">
            Raw. Real. Ready for a Healthier You.
          </p>

          {/* Primary CTA Buttons — Pixel-aligned with matching h-12 */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4">
            <a
              href="#bowls"
              className="h-12 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 rounded-full text-sm sm:text-base font-bold text-white bg-[#0F3826] hover:bg-[#164D35] transition-all hover:scale-[1.03] active:scale-[0.98] shadow-md shadow-[#0F3826]/20 cursor-pointer"
            >
              <span>Find Your Bowl</span>
              <span className="text-lg leading-none">→</span>
            </a>

            <Link
              href="/calculator"
              className="h-12 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 rounded-full text-sm font-semibold text-[#0D2818] bg-white border border-[#DDD5C0] hover:bg-[#F4EFE6] transition-all shadow-xs"
            >
              <span>✨ Free Bio Calculator</span>
            </Link>
          </div>

          {/* 4 Trust Feature Badges */}
          <div className="pt-4 sm:pt-5 border-t border-[#E8E2D2]">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {heroBadges.map((badge, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center lg:items-start text-center lg:text-left p-2 sm:p-2.5 rounded-xl bg-white/60 border border-[#EBE5D6]/80 shadow-2xs hover:bg-white transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#F3EFE6] flex items-center justify-center mb-1.5 shadow-2xs">
                    {badge.icon}
                  </div>
                  <span className="text-xs font-black text-[#0D2818] leading-tight">
                    {badge.title}
                  </span>
                  <span className="text-[11px] font-medium text-[#5E7A67] leading-tight">
                    {badge.subtitle}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Hero Visuals + Patna Ghat Background + Sticky Note */}
        <div className="lg:col-span-6 relative flex flex-col items-center pt-2 sm:pt-4 lg:pt-0">
          {/* Handwritten Tag positioned above the image frame */}
          <div className="w-full max-w-lg flex justify-end pr-2 pb-2">
            <span className="font-script text-xl sm:text-2xl font-bold text-[#8C3A27] tracking-wide drop-shadow-xs rotate-2 block whitespace-nowrap">
              Good Food Happier People A Healthier Patna ❤️
            </span>
          </div>

          {/* Main Visual Frame with Auto-Moving Carousel */}
          <div
            className="relative w-full max-w-lg aspect-4/3 sm:aspect-16/11 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/90 bg-[#EFE8DC] group"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {heroSlides.map((slide, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  currentSlide === idx ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                <Image
                  src={slide.image}
                  alt={slide.tag}
                  fill
                  priority={idx === 0}
                  sizes="(max-width: 768px) 100vw, 600px"
                  className="object-cover object-center"
                />
              </div>
            ))}

            {/* Overhanging Botanical Glow Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/15 pointer-events-none z-20" />

            {/* Branded bowl caption tag */}
            <div className="absolute bottom-4 left-4 z-20 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#E6E0CF] shadow-md flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span className="text-xs font-bold text-[#0D2818]">Thebloomaa</span>
              <span className="text-[10px] text-[#5E7A67] italic font-serif">Bloom your day with bloomaa</span>
            </div>

            {/* Carousel navigation arrows */}
            <button
              onClick={prevSlide}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs transition-transform active:scale-90 cursor-pointer shadow-md"
            >
              ‹
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs transition-transform active:scale-90 cursor-pointer shadow-md"
            >
              ›
            </button>
          </div>

          {/* Sticky Post-it Note (tilted with push-pin) */}
          <div className="relative -mt-6 sm:-mt-8 self-end mr-4 sm:mr-8 z-30 sticky-note px-5 py-3.5 rounded-sm max-w-[200px] border border-[#E8DD9E]">
            {/* Red push-pin */}
            <div className="w-3.5 h-3.5 rounded-full bg-red-600 border border-white shadow-xs mx-auto -mt-5 mb-1.5" />
            <p className="font-script text-lg sm:text-xl font-bold text-[#4A3B1B] text-center leading-snug">
              {heroSlides[currentSlide].note}
            </p>
          </div>

          {/* Carousel Pagination Dots */}
          <div className="flex items-center gap-2 mt-4 z-20">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all rounded-full ${
                  currentSlide === idx
                    ? 'w-6 h-2 bg-[#0F3826]'
                    : 'w-2 h-2 bg-[#DDD5C0] hover:bg-[#0F3826]/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
