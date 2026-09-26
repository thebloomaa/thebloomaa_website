'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useBundleStore } from '@/store/useBundleStore';

interface BowlItem {
  id: string;
  day: string;
  name: string;
  subtitle: string;
  badgeColor: string;
  bgClass: string;
  borderClass: string;
  image: string;
  benefits: { icon: string; label: string }[];
  ingredientTypes: { icon: string; label: string }[];
  macros: { protein: string; fiber: string; calories: string };
  target: string;
}

const weeklyBowls: BowlItem[] = [
  {
    id: 'monday-vitality-reset',
    day: 'Monday',
    name: 'Vitality & Digestive Reset Bowl',
    subtitle: 'Nourish your natural glow & gentle digestive reset.',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    bgClass: 'bg-[#FDF2F4]',
    borderClass: 'border-[#F8D2DA]',
    image: '/bowls/monday-vitality.jpg',
    benefits: [
      { icon: '🩸', label: 'Rich in Antioxidants' },
      { icon: '🧬', label: 'Omega-3 Sources' },
      { icon: '✨', label: 'Collagen Boosters' },
      { icon: '🥑', label: 'Healthy Fats' },
    ],
    ingredientTypes: [
      { icon: '🍎', label: 'Fruits' },
      { icon: '🌱', label: 'Sprouts' },
      { icon: '🌰', label: 'Dry Fruits' },
      { icon: '🌻', label: 'Seeds' },
    ],
    macros: { protein: '16.2g', fiber: '9.3g', calories: '325 kcal' },
    target: 'For Women & Everyone Who Loves Healthy, Glowing Skin',
  },
  {
    id: 'tuesday-muscle-fuel',
    day: 'Tuesday',
    name: 'High-Protein Muscle Fuel Bowl',
    subtitle: 'Fuel your active lifestyle with real plant protein.',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    bgClass: 'bg-[#F2F7F2]',
    borderClass: 'border-[#D4E7D6]',
    image: '/bowls/tuesday-muscle.jpg',
    benefits: [
      { icon: '🟢', label: 'High Plant Protein' },
      { icon: '⚡', label: 'Sustained Energy' },
      { icon: '🥑', label: 'Healthy Fats' },
      { icon: '💪', label: 'Muscle Support' },
    ],
    ingredientTypes: [
      { icon: '🍎', label: 'Fruits' },
      { icon: '🌱', label: 'Sprouts & Crunch' },
      { icon: '🌰', label: 'Dry Fruits' },
      { icon: '🌻', label: 'Seeds' },
    ],
    macros: { protein: '16.8g', fiber: '10.2g', calories: '340 kcal' },
    target: 'For Fitness Enthusiasts, Active Lifestyles & Busy Professionals',
  },
  {
    id: 'wednesday-radiance-glow',
    day: 'Wednesday',
    name: 'Cellular Radiance & Glow Bowl',
    subtitle: 'Wholesome vibrant nutrients for sharper days.',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    bgClass: 'bg-[#FEF9EC]',
    borderClass: 'border-[#FDE3B2]',
    image: '/bowls/wednesday-radiance.jpg',
    benefits: [
      { icon: '🧠', label: 'Brain Nutrients' },
      { icon: '🎯', label: 'Better Focus' },
      { icon: '⚡', label: 'Sustained Energy' },
      { icon: '✨', label: 'Mental Wellbeing' },
    ],
    ingredientTypes: [
      { icon: '🥝', label: 'Exotic Fruits' },
      { icon: '🌱', label: 'Sprouts & Crunch' },
      { icon: '🌰', label: 'Dry Fruits' },
      { icon: '🌻', label: 'Seeds' },
    ],
    macros: { protein: '15.6g', fiber: '8.0g', calories: '350 kcal' },
    target: 'For Students, Professionals & Lifelong Learners',
  },
  {
    id: 'thursday-brain-boost',
    day: 'Thursday',
    name: 'Sustained Energy & Brain Boost Bowl',
    subtitle: 'Move better, think sharper, live brighter.',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
    bgClass: 'bg-[#FEF3EE]',
    borderClass: 'border-[#FCD8C7]',
    image: '/bowls/thursday-energy.jpg',
    benefits: [
      { icon: '⚡', label: 'Sustained Energy' },
      { icon: '🧠', label: 'Brain Nutrients' },
      { icon: '🎯', label: 'Better Focus' },
      { icon: '🛡️', label: 'Mental Wellbeing' },
    ],
    ingredientTypes: [
      { icon: '🍎', label: 'Fruits' },
      { icon: '🌱', label: 'Sprouts & Crunch' },
      { icon: '🌰', label: 'Dry Fruits' },
      { icon: '🌻', label: 'Seeds' },
    ],
    macros: { protein: '17.2g', fiber: '10.0g', calories: '385 kcal' },
    target: 'For Active Thinkers & Energy Seekers',
  },
  {
    id: 'friday-metabolic-balance',
    day: 'Friday',
    name: 'Metabolic Balance & Fiber Core Bowl',
    subtitle: 'High-fiber enzyme balance for gentle digestive ease.',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
    bgClass: 'bg-[#F0F8F4]',
    borderClass: 'border-[#D1EAE0]',
    image: '/bowls/friday-metabolic.jpg',
    benefits: [
      { icon: '🛡️', label: 'Anti-inflammatory' },
      { icon: '🦴', label: 'Bone & Joint Support' },
      { icon: '🌿', label: 'Easy to Digest' },
      { icon: '⚡', label: 'Everyday Vitality' },
    ],
    ingredientTypes: [
      { icon: '🍐', label: 'Fruits' },
      { icon: '🌱', label: 'Sprouts & Crunch' },
      { icon: '🌰', label: 'Dry Fruits' },
      { icon: '🌻', label: 'Seeds' },
    ],
    macros: { protein: '14.8g', fiber: '11.2g', calories: '285 kcal' },
    target: 'For Seniors & Everyone Who Wants to Stay Active',
  },
  {
    id: 'saturday-immunity-shield',
    day: 'Saturday',
    name: 'Immunity Shield & Power Combo Bowl',
    subtitle: 'Feel light, fresh, energized and completely balanced.',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    bgClass: 'bg-[#F6F2FC]',
    borderClass: 'border-[#E5D7FA]',
    image: '/bowls/saturday-immunity.jpg',
    benefits: [
      { icon: '🥬', label: 'High Fibre' },
      { icon: '💧', label: 'Cleansing Ingredients' },
      { icon: '🦠', label: 'Supports Digestion' },
      { icon: '🛡️', label: 'Natural Detox' },
    ],
    ingredientTypes: [
      { icon: '🍓', label: 'Fruits' },
      { icon: '🌱', label: 'Sprouts & Crunch' },
      { icon: '🌰', label: 'Dry Fruits' },
      { icon: '🌻', label: 'Seeds' },
    ],
    macros: { protein: '15.0g', fiber: '8.2g', calories: '295 kcal' },
    target: 'For All Ages & Everyday Wellness',
  },
];

const bowlPairs = [
  [weeklyBowls[0], weeklyBowls[1]], // Monday & Tuesday
  [weeklyBowls[2], weeklyBowls[3]], // Wednesday & Thursday
  [weeklyBowls[4], weeklyBowls[5]], // Friday & Saturday
];

export default function BowlsSection() {
  const router = useRouter();
  const { selectProduct } = useBundleStore();
  const [selectedBowlModal, setSelectedBowlModal] = useState<BowlItem | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Responsive mobile viewport detection
  React.useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 640;
      setIsMobile((prevMobile) => {
        if (prevMobile !== mobile) {
          // Adjust currentSlide index when viewport mode changes
          setCurrentSlide(0);
        }
        return mobile;
      });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalSlides = isMobile ? weeklyBowls.length : bowlPairs.length;

  // Auto-slide every 4.5 seconds (paused on mouse enter / touch)
  React.useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev >= totalSlides - 1 ? 0 : prev + 1));
    }, 4500);

    return () => clearInterval(timer);
  }, [isPaused, totalSlides]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev >= totalSlides - 1 ? 0 : prev + 1));
  };



  const handlePreBookWeekly = () => {
    setSelectedBowlModal(null);
    router.push('/checkout?plan=trial');
  };

  const handlePreBookMonthly = () => {
    setSelectedBowlModal(null);
    router.push('/checkout?plan=monthly');
  };

  const renderBowlCard = (bowl: BowlItem) => (
    <div
      key={bowl.id}
      className={`w-full rounded-[1.75rem] p-4 sm:p-5 ${bowl.bgClass} border ${bowl.borderClass} flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-lg shadow-2xs group`}
    >
      <div>
        {/* Day Badge & Bowl Title (Clickable to view details) */}
        <div
          className="text-center mb-2.5 cursor-pointer group/title"
          onClick={() => setSelectedBowlModal(bowl)}
          title="Click to view full nutrition details"
        >
          <span className={`inline-block px-3 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider border ${bowl.badgeColor} mb-1.5 shadow-2xs`}>
            {bowl.day} Bowl
          </span>
          <h3 className="font-serif text-base sm:text-lg lg:text-xl font-bold text-[#0D2818] tracking-tight leading-snug group-hover/title:text-[#16A34A] transition-colors">
            {bowl.name}
          </h3>
          <p className="text-[11px] sm:text-xs text-[#5E7A67] mt-0.5 leading-snug line-clamp-2">
            {bowl.subtitle}
          </p>
        </div>

        {/* Circular Bowl Image (Clickable to view details) */}
        <div
          className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full overflow-hidden border-3 sm:border-4 border-white shadow-md my-2.5 group-hover:scale-105 transition-transform duration-500 bg-white cursor-pointer"
          onClick={() => setSelectedBowlModal(bowl)}
          title="Click to view full nutrition details"
        >
          <Image
            src={bowl.image}
            alt={bowl.name}
            fill
            sizes="140px"
            className="object-cover"
          />
          <div className="absolute inset-0 rounded-full shadow-inner pointer-events-none" />
        </div>

        {/* 4 Goal Benefit Pills */}
        <div className="grid grid-cols-2 gap-1.5 mb-2.5">
          {bowl.benefits.map((b, bIdx) => (
            <div
              key={bIdx}
              className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white/85 border border-black/5 text-[10.5px] sm:text-[11px] font-semibold text-[#0D2818] shadow-2xs"
            >
              <span className="text-xs shrink-0">{b.icon}</span>
              <span className="leading-tight truncate">{b.label}</span>
            </div>
          ))}
        </div>

        {/* Key Ingredients (Types only: Fruits, Sprouts, Dry Fruits, Seeds) */}
        <div className="mb-2.5 p-2 rounded-xl bg-white/90 border border-black/5">
          <div className="flex items-center justify-center gap-1.5 mb-1.5">
            <div className="h-px w-3 bg-[#0D2818]/20" />
            <span className="text-[9px] sm:text-[9.5px] font-black uppercase tracking-widest text-[#0D2818]/80">
              Key Ingredients
            </span>
            <div className="h-px w-3 bg-[#0D2818]/20" />
          </div>

          <div className="grid grid-cols-2 gap-1">
            {bowl.ingredientTypes.map((item, iIdx) => (
              <div
                key={iIdx}
                className="flex items-center gap-1 p-1 rounded-md bg-[#FAF7F2] border border-[#EAE2D2] text-[10px] sm:text-[10.5px] font-bold text-[#0D2818]"
              >
                <span className="text-xs shrink-0">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Macros Breakdown Bar */}
        <div className="flex justify-between items-center bg-white/95 p-1.5 sm:p-2 rounded-xl mb-2.5 border border-black/5 shadow-2xs">
          <div className="flex flex-col items-center flex-1 border-r border-[#EAE2D2] px-0.5">
            <span className="text-xs sm:text-[13px] font-black text-[#0D2818]">{bowl.macros.protein}</span>
            <span className="text-[8px] uppercase text-[#5E7A67] font-bold tracking-wider">Protein</span>
          </div>
          <div className="flex flex-col items-center flex-1 border-r border-[#EAE2D2] px-0.5">
            <span className="text-xs sm:text-[13px] font-black text-[#0D2818]">{bowl.macros.fiber}</span>
            <span className="text-[8px] uppercase text-[#5E7A67] font-bold tracking-wider">Fiber</span>
          </div>
          <div className="flex flex-col items-center flex-1 px-0.5">
            <span className="text-xs sm:text-[13px] font-black text-[#D97706]">{bowl.macros.calories}</span>
            <span className="text-[8px] uppercase text-[#5E7A67] font-bold tracking-wider">Calories</span>
          </div>
        </div>

        {/* Target Audience Banner */}
        <div className="text-center py-1.5 px-2 rounded-lg bg-white/60 border border-black/5 mb-3 min-h-[34px] flex items-center justify-center">
          <p className="text-[10px] sm:text-[11px] font-bold text-[#0D2818]/90 leading-tight">
            {bowl.target}
          </p>
        </div>
      </div>

      {/* Dual Action Buttons */}
      <div className="pt-1 space-y-1.5">
        <button
          type="button"
          onClick={() => handlePreBookWeekly()}
          className="w-full py-2.5 rounded-full text-xs font-black text-white bg-[#0F3826] hover:bg-[#185338] transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-98 cursor-pointer hover:scale-[1.02]"
        >
          <span>Pre-Book Just Bloom Plan</span>
          <span className="text-xs">→</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedBowlModal(bowl)}
          className="w-full py-1 text-[11px] font-semibold text-[#5E7A67] hover:text-[#0D2818] transition-colors flex items-center justify-center gap-1 cursor-pointer"
        >
          <span>🔍 View Ingredients &amp; Nutrition</span>
        </button>
      </div>
    </div>
  );

  return (
    <section id="bowls" className="py-10 sm:py-12 lg:py-14 px-3 sm:px-6 lg:px-8 bg-[#FAF7F2] overflow-hidden">
      <div className="max-w-[1536px] mx-auto">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0D2818] tracking-tight">
            TheBloomaa&apos;s Diet Bowl <span className="text-[#16A34A]">for Your Health Goal</span>
          </h2>

          <p className="text-xs sm:text-sm text-[#5E7A67] font-medium max-w-xl mx-auto mt-1 leading-snug">
            6 functional living bowls — fruits, sprouts, veggies & seeds. Daily rotating A/c to Healthy Functional. Freshly prepared at 5:00 AM.
          </p>
        </div>


        {/* ========================================================
            SLIDER CONTAINER: 1 CARD ON MOBILE, 2 CARDS ON DESKTOP
           ======================================================== */}
        <div
          className="relative max-w-sm sm:max-w-2xl lg:max-w-5xl xl:max-w-6xl mx-auto px-1 sm:px-6 py-1"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Floating Left Arrow Sign */}
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Slide to previous card"
            className="absolute -left-2 sm:-left-4 lg:-left-5 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/95 border border-[#DDD5C0] text-[#0D2818] shadow-lg hover:bg-[#0F3826] hover:text-white hover:border-[#0F3826] transition-all flex items-center justify-center text-lg sm:text-xl font-bold cursor-pointer active:scale-90"
          >
            ‹
          </button>

          {/* Floating Right Arrow Sign */}
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Slide to next card"
            className="absolute -right-2 sm:-right-4 lg:-right-5 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/95 border border-[#DDD5C0] text-[#0D2818] shadow-lg hover:bg-[#0F3826] hover:text-white hover:border-[#0F3826] transition-all flex items-center justify-center text-lg sm:text-xl font-bold cursor-pointer active:scale-90"
          >
            ›
          </button>

          {/* Overflow Viewport */}
          <div className="overflow-hidden rounded-3xl p-1">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {isMobile
                ? weeklyBowls.map((bowl) => (
                    <div key={bowl.id} className="w-full shrink-0 px-1">
                      {renderBowlCard(bowl)}
                    </div>
                  ))
                : bowlPairs.map((pair, pairIdx) => (
                    <div
                      key={pairIdx}
                      className="w-full shrink-0 grid grid-cols-2 gap-4 lg:gap-6 px-1"
                    >
                      {pair.map((bowl) => renderBowlCard(bowl))}
                    </div>
                  ))}
            </div>
          </div>

          {/* Slide Indicator Dots + Current Label */}
          <div className="flex flex-col items-center gap-1.5 mt-4">
            <div className="flex items-center gap-2">
              {Array.from({ length: totalSlides }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    currentSlide === idx
                      ? 'w-7 sm:w-8 h-2 bg-[#0F3826] shadow-xs'
                      : 'w-2 h-2 bg-[#DDD5C0] hover:bg-[#A89F8B]'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
            <span className="text-[11px] font-semibold text-[#5E7A67]">
              {isMobile
                ? `Showing: ${weeklyBowls[currentSlide]?.day} Bowl`
                : `Showing: ${bowlPairs[currentSlide]?.[0]?.day} & ${bowlPairs[currentSlide]?.[1]?.day}`}
              {' • Auto-sliding (Hover to pause)'}
            </span>

            {/* Just Bloom Plan Surprise Box Note */}
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-[#DDD5C0] shadow-2xs text-[10.5px] sm:text-[11px] font-medium text-[#183925]">
              <span className="font-bold text-[#D97706]">✨ Surprise Bloom Box:</span>
              <span>Includes 6 daily functional living bowls + 1 Surprise Bloom Box</span>
            </div>
          </div>
        </div>


      </div>

      {/* Details Modal */}
      {selectedBowlModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm sm:max-w-md w-full p-4 sm:p-6 border border-[#DDD5C0] shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto no-scrollbar">
            <button
              onClick={() => setSelectedBowlModal(null)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FAF7F2] text-[#0D2818] flex items-center justify-center hover:bg-[#EAE2D2] transition-colors text-xs sm:text-sm font-bold cursor-pointer z-10"
              aria-label="Close modal"
            >
              ✕
            </button>

            <div className="text-center">
              <span className={`inline-block px-3 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider border ${selectedBowlModal.badgeColor} mb-1.5`}>
                {selectedBowlModal.day} Special
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0D2818] mb-1 leading-snug">
                {selectedBowlModal.name}
              </h3>
              <p className="text-xs text-[#5E7A67] mb-3">
                {selectedBowlModal.subtitle}
              </p>

              {/* Bowl Image in Modal */}
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 mx-auto rounded-full overflow-hidden border-4 border-[#FAF7F2] shadow-md mb-3 bg-white">
                <Image
                  src={selectedBowlModal.image}
                  alt={selectedBowlModal.name}
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              </div>

              {/* Ingredient Types */}
              <div className="p-2.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE2D2] mb-3 text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5E7A67] block mb-1.5 text-center">
                  Key Ingredients Breakdown
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {selectedBowlModal.ingredientTypes.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 p-1 rounded-lg bg-white border border-[#EAE2D2] text-[11px] font-semibold text-[#0D2818]">
                      <span className="text-xs">{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Macros */}
              <div className="grid grid-cols-3 gap-2 p-2 rounded-2xl bg-[#FAF7F2] border border-[#EAE2D2] mb-3">
                <div>
                  <span className="text-[10px] text-[#5E7A67] block">Protein</span>
                  <strong className="text-xs sm:text-sm font-black text-[#16A34A]">{selectedBowlModal.macros.protein}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-[#5E7A67] block">Fiber</span>
                  <strong className="text-xs sm:text-sm font-black text-[#D97706]">{selectedBowlModal.macros.fiber}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-[#5E7A67] block">Calories</span>
                  <strong className="text-xs sm:text-sm font-black text-[#0D2818]">{selectedBowlModal.macros.calories}</strong>
                </div>
              </div>

              {/* Rotation Info Pill */}
              <div className="mb-3 py-1.5 px-2.5 rounded-xl bg-[#FAF7F2] border border-[#EAE2D2] text-center">
                <span className="text-[10px] sm:text-[11px] font-semibold text-[#0F3826] flex items-center justify-center gap-1.5">
                  <span>🌱</span>
                  <span>Delivered fresh every <strong>{selectedBowlModal.day} morning</strong> as part of the Just Bloom Plan</span>
                </span>
              </div>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => handlePreBookWeekly()}
                  className="w-full py-3 px-4 rounded-full text-xs sm:text-sm font-black text-white bg-[#0F3826] hover:bg-[#185338] transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Pre-Book Just Bloom Plan (Includes {selectedBowlModal.day} Bowl)</span>
                  <span>→</span>
                </button>

                <div className="flex items-center justify-between px-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedBowlModal(null)}
                    className="text-xs font-semibold text-[#5E7A67] hover:text-[#0D2818] transition-colors cursor-pointer"
                  >
                    ✕ Close Details
                  </button>
                  <button
                    type="button"
                    onClick={handlePreBookMonthly}
                    className="text-xs font-bold text-[#D97706] hover:text-[#B45309] transition-colors cursor-pointer"
                  >
                    Pre-Book 30-Day Monthly →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
