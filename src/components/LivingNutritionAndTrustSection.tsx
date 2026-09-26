'use client';

import React from 'react';
import Image from 'next/image';

const ingredientTags = [
  { name: 'Fruits', icon: '🍓' },
  { name: 'Soaked Seeds', icon: '🌱' },
  { name: 'Nuts', icon: '🥜' },
  { name: 'Leafy Greens', icon: '🥬' },
  { name: 'Vegetables', icon: '🥕' },
];

const trustItems = [
  {
    icon: (
      <svg className="w-4.5 h-4.5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    label: 'Locally Sourced Ingredients',
  },
  {
    icon: (
      <svg className="w-4.5 h-4.5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    label: 'Hygienically Prepared',
  },
  {
    icon: (
      <svg className="w-4.5 h-4.5 text-emerald-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    ),
    label: 'No Artificial Preservatives',
  },
  {
    icon: (
      <svg className="w-4.5 h-4.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    label: 'Eco-friendly Packaging',
  },
  {
    icon: (
      <svg className="w-4.5 h-4.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    label: 'Supporting a Healthier Patna',
  },
];

export default function LivingNutritionAndTrustSection() {
  return (
    <section className="py-5 sm:py-6 lg:py-8 px-3 sm:px-6 lg:px-8 bg-[#FAF7F2] border-t border-[#EAE2D2]">
      <div className="max-w-[1536px] mx-auto">
        {/* ========================================================
            UNIFIED PANORAMIC LIVING PANEL (OPTION B)
            Combines Nutrition You Can See + Patna Trust Guarantee
           ======================================================== */}
        <div className="rounded-3xl bg-white border border-[#DDD5C0] shadow-sm hover:shadow-md transition-all overflow-hidden">
          
          {/* ────────────────────────────────────────────────────────
              TOP PORTION: NUTRITION YOU CAN SEE
             ──────────────────────────────────────────────────────── */}
          <div className="p-5 sm:p-7 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
              
              {/* Left Sub-column: Header + 3 Macro Discs + 5 Ingredient Pills */}
              <div className="lg:col-span-8 space-y-5">
                <div>
                  <div className="inline-flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#16A34A] bg-[#F4FAF6] px-2.5 py-0.5 rounded-md border border-[#16A34A]/20">
                      Living Nutrition Proof
                    </span>
                    <span className="text-xs font-semibold text-[#5E7A67]">• Zero Cooked Oils • 100% Raw</span>
                  </div>

                  <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0D2818] tracking-tight leading-tight">
                    Nutrition You Can See
                  </h2>
                  <p className="text-xs sm:text-sm text-[#5E7A67] font-medium mt-1">
                    Real food. Real living nutrition. No artificial supplements or synthetic powders.
                  </p>
                </div>

                {/* 3 Circular Metric Discs + 5 Ingredient Category Chips */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-5 pt-1">
                  {/* 3 Discs */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    {/* 15g Protein */}
                    <div className="w-[72px] h-[72px] sm:w-[78px] sm:h-[78px] rounded-full border-2 border-[#16A34A] bg-[#F4FAF6] flex flex-col items-center justify-center text-center shadow-2xs shrink-0">
                      <span className="text-base sm:text-lg font-black text-[#0D2818] leading-none">15g</span>
                      <span className="text-[10px] font-bold text-[#16A34A] mt-0.5">Protein</span>
                    </div>

                    {/* 8g Fibre */}
                    <div className="w-[72px] h-[72px] sm:w-[78px] sm:h-[78px] rounded-full border-2 border-[#D97706] bg-[#FEFBF6] flex flex-col items-center justify-center text-center shadow-2xs shrink-0">
                      <span className="text-base sm:text-lg font-black text-[#0D2818] leading-none">8g</span>
                      <span className="text-[10px] font-bold text-[#D97706] mt-0.5">Fibre</span>
                    </div>

                    {/* 20+ Micronutrients */}
                    <div className="w-[72px] h-[72px] sm:w-[78px] sm:h-[78px] rounded-full border-2 border-[#E11D48] bg-[#FFF5F7] flex flex-col items-center justify-center text-center shadow-2xs shrink-0">
                      <span className="text-base sm:text-lg font-black text-[#0D2818] leading-none">20+</span>
                      <span className="text-[9px] font-bold text-[#E11D48] mt-0.5 leading-tight">Micronutrients</span>
                    </div>
                  </div>

                  {/* Divider line on tablet/desktop */}
                  <div className="hidden sm:block h-14 w-px bg-[#EAE2D2] shrink-0" />

                  {/* 5 Ingredient Category Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    {ingredientTags.map((tag, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF7F2] border border-[#E4DCC5] text-xs font-semibold text-[#0D2818] shadow-2xs hover:bg-white transition-colors"
                      >
                        <span className="text-sm">{tag.icon}</span>
                        <span>{tag.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Sub-column: Bowl Image with Handwritten Sticky Note */}
              <div className="lg:col-span-4 flex items-center justify-center lg:justify-end">
                <div className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-2xl overflow-hidden shadow-md border-2 border-[#E6DFC6] bg-[#FAF7F2]">
                  <Image
                    src="/nutrition-bowl.jpg"
                    alt="Real Food Living Nutrition at Thebloomaa"
                    fill
                    sizes="220px"
                    className="object-cover"
                  />
                  {/* Handwritten Sticky Note */}
                  <div className="absolute -bottom-1 -right-1 sticky-note px-3 py-2 rounded-xs border border-[#E8DD9E] max-w-[135px] z-10 shadow-md">
                    <p className="font-script text-sm sm:text-base font-bold text-[#4A3B1B] text-center leading-tight">
                      Good Food<br />Brighter Days ❤️
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* ────────────────────────────────────────────────────────
              BOTTOM PORTION: PATNA TRUST & CLEAN STANDARDS STRIP
              Directly attached to the bottom of the card!
             ──────────────────────────────────────────────────────── */}
          <div className="w-full bg-[#FAF7F2] border-t border-[#EAE2D2] px-5 sm:px-7 lg:px-8 py-3.5 sm:py-4">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-3 sm:gap-4">
              
              {/* 5 Quality Trust Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-5 lg:gap-6">
                {trustItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 group">
                    <div className="w-7 h-7 rounded-full bg-white border border-[#DDD5C0] flex items-center justify-center shadow-2xs shrink-0">
                      {item.icon}
                    </div>
                    <span className="text-xs sm:text-[12.5px] font-semibold text-[#183925] tracking-tight whitespace-nowrap">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Patna Monument Sketch + Handwritten Note */}
              <div className="flex items-center gap-3 shrink-0 pt-2 lg:pt-0">
                {/* Subtle Golghar / Patna architectural monument sketch */}
                <div className="opacity-80 hidden sm:block shrink-0">
                  <svg width="76" height="30" viewBox="0 0 100 40" fill="none" stroke="#7A6A53" strokeWidth="1.3">
                    <path d="M10 38 Q30 38 35 24 Q50 6 65 24 Q70 38 90 38" />
                    <path d="M44 6 L56 6 L50 2 Z" fill="#7A6A53" />
                    <line x1="2" y1="38" x2="98" y2="38" strokeWidth="1.5" />
                    <circle cx="50" cy="18" r="3" />
                    <path d="M22 38 L22 30 Q28 26 34 30 L34 38" />
                    <path d="M66 38 L66 30 Q72 26 78 30 L78 38" />
                  </svg>
                </div>
                <span className="font-script text-base sm:text-lg font-bold text-[#8C3A27] tracking-wide whitespace-nowrap">
                  Patna Eats Better Together ❤️
                </span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
