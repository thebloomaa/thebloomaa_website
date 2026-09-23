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
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-slide every 4.5 seconds (paused on mouse enter / touch)
  React.useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === bowlPairs.length - 1 ? 0 : prev + 1));
    }, 4500);

    return () => clearInterval(timer);
  }, [isPaused]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? bowlPairs.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === bowlPairs.length - 1 ? 0 : prev + 1));
  };

  const goToDay = (dayIdx: number) => {
    // 0, 1 -> Slide 0 (Mon, Tue)
    // 2, 3 -> Slide 1 (Wed, Thu)
    // 4, 5 -> Slide 2 (Fri, Sat)
    const slideIdx = Math.floor(dayIdx / 2);
    setCurrentSlide(slideIdx);
  };

  const handleSelectBowl = (bowl: BowlItem) => {
    selectProduct({
      id: bowl.id,
      name: `${bowl.day}: ${bowl.name}`,
      description: bowl.subtitle,
      price: 0, // Handled as TBA / Pre-order
      imageUrl: bowl.image,
      type: 'WEEKLY_BOWL_PLAN',
      calories: parseInt(bowl.macros.calories) || 350,
      protein: parseFloat(bowl.macros.protein) || 16,
      carbs: 45,
      fats: 14,
      dietaryPreference: 'LIVING_RAW',
      isTrialPlan: false,
    });
    router.push('/checkout?plan=single');
  };

  return (
    <section id="bowls" className="py-16 sm:py-20 px-3 sm:px-6 lg:px-8 bg-[#FAF7F2] overflow-hidden">
      <div className="max-w-[1536px] mx-auto">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🌱</span>
            <span className="text-xs sm:text-sm font-bold tracking-[0.2em] text-[#2A5237] uppercase">
              The Blooमाँ Weekly Diet Bowl Menu
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0D2818] tracking-tight">
            Your Goal. <span className="text-[#16A34A]">Your Bowl.</span> Your Bloom.
          </h2>

          <div className="flex items-center justify-center gap-2 mt-2 text-sm sm:text-base font-medium text-[#5E7A67]">
            <span className="text-red-500">❤️</span>
            <span className="font-script text-xl sm:text-2xl text-[#8C3A27]">
              Good Food, Happier People, A Healthier Patna
            </span>
            <span className="text-red-500">❤️</span>
          </div>

          {/* 4 Mini Trust Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-4">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white border border-[#DDD5C0] text-[#0D2818] shadow-2xs">
              ✓ 100% Natural
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white border border-[#DDD5C0] text-[#0D2818] shadow-2xs">
              🚫 0% Cooking
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white border border-[#DDD5C0] text-[#0D2818] shadow-2xs">
              📍 Fresh Daily in Patna
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white border border-[#DDD5C0] text-[#0D2818] shadow-2xs">
              ❤️ Made with Care
            </span>
          </div>

          {/* Day Tabs with Navigation Controls */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-6 max-w-full overflow-x-auto pb-1 no-scrollbar px-2">
            {/* Quick Prev Arrow in Tab Bar */}
            <button
              onClick={prevSlide}
              aria-label="Previous 2 bowls"
              className="w-8 h-8 rounded-full bg-white border border-[#DDD5C0] text-[#0D2818] hover:bg-[#0F3826] hover:text-white transition-all shadow-2xs flex items-center justify-center text-sm font-bold cursor-pointer active:scale-95 shrink-0"
            >
              ‹
            </button>

            {weeklyBowls.map((bowl, idx) => {
              const pairIndex = Math.floor(idx / 2);
              const isActive = currentSlide === pairIndex;
              return (
                <button
                  key={idx}
                  onClick={() => goToDay(idx)}
                  className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-2xs cursor-pointer whitespace-nowrap active:scale-95 border ${
                    isActive
                      ? 'bg-[#0F3826] text-white border-[#0F3826] shadow-sm'
                      : 'bg-white hover:bg-[#0F3826] hover:text-white text-[#0D2818] border-[#DDD5C0]'
                  }`}
                >
                  {bowl.day}
                </button>
              );
            })}

            {/* Quick Next Arrow in Tab Bar */}
            <button
              onClick={nextSlide}
              aria-label="Next 2 bowls"
              className="w-8 h-8 rounded-full bg-white border border-[#DDD5C0] text-[#0D2818] hover:bg-[#0F3826] hover:text-white transition-all shadow-2xs flex items-center justify-center text-sm font-bold cursor-pointer active:scale-95 shrink-0"
            >
              ›
            </button>
          </div>
        </div>

        {/* ========================================================
            2-CARDS-AT-A-TIME AUTO-SLIDING CAROUSEL CONTAINER
           ======================================================== */}
        <div
          className="relative max-w-4xl lg:max-w-5xl mx-auto px-2 sm:px-8 py-2"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Floating Left Arrow Sign */}
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Slide to previous two cards"
            className="absolute -left-1 sm:-left-3 lg:-left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white/95 border-2 border-[#DDD5C0] text-[#0D2818] shadow-xl hover:bg-[#0F3826] hover:text-white hover:border-[#0F3826] transition-all flex items-center justify-center text-xl sm:text-2xl font-bold cursor-pointer active:scale-90"
          >
            ‹
          </button>

          {/* Floating Right Arrow Sign */}
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Slide to next two cards"
            className="absolute -right-1 sm:-right-3 lg:-right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white/95 border-2 border-[#DDD5C0] text-[#0D2818] shadow-xl hover:bg-[#0F3826] hover:text-white hover:border-[#0F3826] transition-all flex items-center justify-center text-xl sm:text-2xl font-bold cursor-pointer active:scale-90"
          >
            ›
          </button>

          {/* Overflow Viewport */}
          <div className="overflow-hidden rounded-[2rem] p-1">
            <div
              className="flex transition-transform duration-600 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {bowlPairs.map((pair, pairIdx) => (
                <div
                  key={pairIdx}
                  className="w-full shrink-0 grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 px-1 sm:px-2"
                >
                  {pair.map((bowl) => (
                    <div
                      key={bowl.id}
                      className={`w-full rounded-[2rem] p-5 sm:p-6 lg:p-7 ${bowl.bgClass} border ${bowl.borderClass} flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl shadow-sm group`}
                    >
                      <div>
                        {/* Day Badge & Bowl Title */}
                        <div className="text-center mb-3">
                          <span className={`inline-block px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${bowl.badgeColor} mb-2 shadow-2xs`}>
                            {bowl.day} Bowl
                          </span>
                          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0D2818] tracking-tight leading-snug">
                            {bowl.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-[#5E7A67] mt-1 leading-relaxed">
                            {bowl.subtitle}
                          </p>
                        </div>

                        {/* Circular Bowl Image */}
                        <div className="relative w-36 h-36 sm:w-40 sm:h-40 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg my-4 group-hover:scale-105 transition-transform duration-500 bg-white">
                          <Image
                            src={bowl.image}
                            alt={bowl.name}
                            fill
                            sizes="200px"
                            className="object-cover"
                          />
                          <div className="absolute inset-0 rounded-full shadow-inner pointer-events-none" />
                        </div>

                        {/* 4 Goal Benefit Pills with Full Labels (No Ellipsis) */}
                        <div className="grid grid-cols-2 gap-2 mb-3.5">
                          {bowl.benefits.map((b, bIdx) => (
                            <div
                              key={bIdx}
                              className="flex items-center gap-1.5 p-2 rounded-xl bg-white/85 border border-black/5 text-xs font-semibold text-[#0D2818] shadow-2xs"
                            >
                              <span className="text-sm shrink-0">{b.icon}</span>
                              <span className="leading-tight">{b.label}</span>
                            </div>
                          ))}
                        </div>

                        {/* Key Ingredients (Types only: Fruits, Sprouts, Dry Fruits, Seeds) */}
                        <div className="mb-3.5 p-2.5 rounded-2xl bg-white/90 border border-black/5">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <div className="h-px w-4 bg-[#0D2818]/20" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#0D2818]/80">
                              Key Ingredients
                            </span>
                            <div className="h-px w-4 bg-[#0D2818]/20" />
                          </div>

                          <div className="grid grid-cols-2 gap-1.5">
                            {bowl.ingredientTypes.map((item, iIdx) => (
                              <div
                                key={iIdx}
                                className="flex items-center gap-1.5 p-1.5 rounded-lg bg-[#FAF7F2] border border-[#EAE2D2] text-xs font-bold text-[#0D2818]"
                              >
                                <span className="text-sm shrink-0">{item.icon}</span>
                                <span className="truncate">{item.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Macros Breakdown Bar */}
                        <div className="flex justify-between items-center bg-white/95 p-2.5 rounded-2xl mb-3.5 border border-black/5 shadow-2xs">
                          <div className="flex flex-col items-center flex-1 border-r border-[#EAE2D2] px-1">
                            <span className="text-sm font-black text-[#0D2818]">{bowl.macros.protein}</span>
                            <span className="text-[9px] uppercase text-[#5E7A67] font-bold tracking-wider">Protein</span>
                          </div>
                          <div className="flex flex-col items-center flex-1 border-r border-[#EAE2D2] px-1">
                            <span className="text-sm font-black text-[#0D2818]">{bowl.macros.fiber}</span>
                            <span className="text-[9px] uppercase text-[#5E7A67] font-bold tracking-wider">Fiber</span>
                          </div>
                          <div className="flex flex-col items-center flex-1 px-1">
                            <span className="text-sm font-black text-[#D97706]">{bowl.macros.calories}</span>
                            <span className="text-[9px] uppercase text-[#5E7A67] font-bold tracking-wider">Calories</span>
                          </div>
                        </div>

                        {/* Target Audience Banner */}
                        <div className="text-center py-2 px-3 rounded-xl bg-white/60 border border-black/5 mb-4 min-h-[38px] flex items-center justify-center">
                          <p className="text-xs font-bold text-[#0D2818]/90 leading-tight">
                            {bowl.target}
                          </p>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => setSelectedBowlModal(bowl)}
                          className="w-full py-3 rounded-full text-xs sm:text-sm font-bold text-white bg-[#0F3826] hover:bg-[#185338] transition-all flex items-center justify-center gap-2 shadow-md active:scale-98 cursor-pointer"
                        >
                          <span>View Details & Nutrition</span>
                          <span className="text-sm">→</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Slide Indicator Dots + Current Pair Label */}
          <div className="flex flex-col items-center gap-2 mt-5">
            <div className="flex items-center gap-2.5">
              {bowlPairs.map((pair, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    currentSlide === idx
                      ? 'w-10 h-3 bg-[#0F3826] shadow-xs'
                      : 'w-3 h-3 bg-[#DDD5C0] hover:bg-[#A89F8B]'
                  }`}
                  aria-label={`Slide ${idx + 1}: ${pair[0].day} & ${pair[1].day}`}
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-[#5E7A67]">
              Showing: {bowlPairs[currentSlide][0].day} & {bowlPairs[currentSlide][1].day} (Auto-sliding • Hover to pause)
            </span>
          </div>
        </div>

        {/* Section Bottom Banner & CTA */}
        <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-white border border-[#E6DFC6] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden max-w-4xl lg:max-w-5xl mx-auto">
          {/* Left Side: Delivery Badges & Tagline */}
          <div className="space-y-2 text-center md:text-left">
            <h3 className="font-serif text-2xl font-bold text-[#0D2818]">
              Wholesome Bowls. Happier People. A Healthier Patna.
            </h3>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-semibold text-[#5E7A67] pt-1">
              <span className="flex items-center gap-1.5">
                <span>🛵</span>
                <span>Freshly Prepared Daily</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <span>📍</span>
                <span>Doorstep Morning Drops in Patna</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <span>📅</span>
                <span>Daily · Weekly · Monthly Plans</span>
              </span>
            </div>
          </div>

          {/* Right Side: CTA Button */}
          <div className="shrink-0 w-full md:w-auto">
            <a
              href="#plans"
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold text-white bg-[#0F3826] hover:bg-[#185338] transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>Choose Your Bowl</span>
              <span className="text-base">→</span>
            </a>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {selectedBowlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 border border-[#DDD5C0] shadow-2xl relative">
            <button
              onClick={() => setSelectedBowlModal(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#FAF7F2] text-[#0D2818] flex items-center justify-center hover:bg-[#EAE2D2] transition-colors"
            >
              ✕
            </button>

            <div className="text-center">
              <span className={`inline-block px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider border ${selectedBowlModal.badgeColor} mb-2`}>
                {selectedBowlModal.day} Special
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#0D2818] mb-1">
                {selectedBowlModal.name}
              </h3>
              <p className="text-xs text-[#5E7A67] mb-4">
                {selectedBowlModal.subtitle}
              </p>

              {/* Bowl Image in Modal */}
              <div className="relative w-36 h-36 mx-auto rounded-full overflow-hidden border-4 border-[#FAF7F2] shadow-md mb-4 bg-white">
                <Image
                  src={selectedBowlModal.image}
                  alt={selectedBowlModal.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Ingredient Types */}
              <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#EAE2D2] mb-4 text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5E7A67] block mb-2 text-center">
                  Key Ingredients Breakdown
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {selectedBowlModal.ingredientTypes.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-1.5 rounded-lg bg-white border border-[#EAE2D2] text-xs font-semibold text-[#0D2818]">
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Macros */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-[#FAF7F2] border border-[#EAE2D2] mb-6">
                <div>
                  <span className="text-[10px] text-[#5E7A67] block">Protein</span>
                  <strong className="text-sm font-black text-[#16A34A]">{selectedBowlModal.macros.protein}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-[#5E7A67] block">Fiber</span>
                  <strong className="text-sm font-black text-[#D97706]">{selectedBowlModal.macros.fiber}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-[#5E7A67] block">Calories</span>
                  <strong className="text-sm font-black text-[#0D2818]">{selectedBowlModal.macros.calories}</strong>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedBowlModal(null)}
                  className="flex-1 py-3 rounded-full text-xs font-bold text-[#3D5A47] bg-[#FAF7F2] hover:bg-[#F3EFE6] border border-[#DDD5C0] transition-all"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleSelectBowl(selectedBowlModal);
                    setSelectedBowlModal(null);
                  }}
                  className="flex-1 py-3 rounded-full text-xs font-bold text-white bg-[#0F3826] hover:bg-[#185338] transition-all shadow-md cursor-pointer"
                >
                  Pre-order {selectedBowlModal.day} Bowl →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
