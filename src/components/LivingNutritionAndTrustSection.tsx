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
      <svg className="w-5 h-5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    title: 'Locally Sourced Ingredients',
    desc: 'Farm-fresh raw produce procured each morning in Bihar',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Hygienically Prepared',
    desc: 'Purified RO triple cold-wash & sanitized kitchen standards',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-emerald-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    ),
    title: 'No Artificial Preservatives',
    desc: 'Zero chemicals, zero denatured cooked oils, 100% natural',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    title: 'Eco-Friendly Packaging',
    desc: 'Bio-degradable, food-grade eco containers delivered to door',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    title: 'Supporting a Healthier Patna',
    desc: 'Maa-like nourishment for working professionals & families',
  },
];

export default function LivingNutritionAndTrustSection() {
  return (
    <section className="py-6 sm:py-8 lg:py-10 px-4 sm:px-6 lg:px-8 bg-[#FAF7F2] border-t border-[#EAE2D2]">
      <div className="max-w-[1536px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          
          {/* ========================================================
              CARD 1 (LEFT): Nutrition You Can See (Real Food Proof)
             ======================================================== */}
          <div className="lg:col-span-6 rounded-3xl bg-white border border-[#DDD5C0] p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#16A34A] bg-[#F4FAF6] px-2.5 py-0.5 rounded-md border border-[#16A34A]/20">
                    Living Nutrition Proof
                  </span>
                  <span className="text-xs text-[#5E7A67]">• Zero Supplements</span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0D2818] tracking-tight">
                  Nutrition You Can See
                </h2>
                <p className="text-xs sm:text-sm text-[#5E7A67] font-medium mt-1">
                  Real food. Real living nutrition. No artificial supplements or fillers.
                </p>
              </div>

              {/* Split Content: Metric Rings & Ingredient Chips on left, Bowl on right */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center my-3">
                
                {/* Left Sub-column: 3 Metric Rings + Ingredients */}
                <div className="sm:col-span-7 flex flex-col justify-between space-y-4">
                  {/* 3 Circular Metric Discs */}
                  <div className="flex items-center gap-2 sm:gap-2.5">
                    {/* 15g Protein */}
                    <div className="w-[68px] h-[68px] sm:w-[74px] sm:h-[74px] rounded-full border-2 border-[#16A34A] bg-[#F4FAF6] flex flex-col items-center justify-center text-center shadow-2xs shrink-0">
                      <span className="text-base sm:text-lg font-black text-[#0D2818] leading-none">15g</span>
                      <span className="text-[10px] font-semibold text-[#16A34A] mt-0.5">Protein</span>
                    </div>

                    {/* 8g Fibre */}
                    <div className="w-[68px] h-[68px] sm:w-[74px] sm:h-[74px] rounded-full border-2 border-[#D97706] bg-[#FEFBF6] flex flex-col items-center justify-center text-center shadow-2xs shrink-0">
                      <span className="text-base sm:text-lg font-black text-[#0D2818] leading-none">8g</span>
                      <span className="text-[10px] font-semibold text-[#D97706] mt-0.5">Fibre</span>
                    </div>

                    {/* 20+ Micronutrients */}
                    <div className="w-[68px] h-[68px] sm:w-[74px] sm:h-[74px] rounded-full border-2 border-[#E11D48] bg-[#FFF5F7] flex flex-col items-center justify-center text-center shadow-2xs shrink-0">
                      <span className="text-base sm:text-lg font-black text-[#0D2818] leading-none">20+</span>
                      <span className="text-[9px] font-semibold text-[#E11D48] mt-0.5 leading-tight">Micronutrients</span>
                    </div>
                  </div>

                  {/* 5 Ingredient Category Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-1">
                    {ingredientTags.map((tag, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FAF7F2] border border-[#E4DCC5] text-[11px] font-semibold text-[#0D2818] shadow-2xs hover:bg-white transition-colors"
                      >
                        <span className="text-xs">{tag.icon}</span>
                        <span>{tag.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Sub-column: Living Bowl Image with Sticky Note */}
                <div className="sm:col-span-5 flex items-center justify-center relative">
                  <div className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-2xl overflow-hidden shadow-md border border-[#E6DFC6] bg-[#FAF7F2]">
                    <Image
                      src="/nutrition-bowl.jpg"
                      alt="Real Living Nutrition at Thebloomaa"
                      fill
                      sizes="180px"
                      className="object-cover"
                    />
                    {/* Handwritten Sticky Note */}
                    <div className="absolute -bottom-1 -right-1 sticky-note px-2.5 py-1.5 rounded-xs border border-[#E8DD9E] max-w-[125px] z-10 shadow-md">
                      <p className="font-script text-xs sm:text-sm font-bold text-[#4A3B1B] text-center leading-tight">
                        Good Food<br />Brighter Days ❤️
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Subtle Note */}
            <div className="pt-3.5 border-t border-[#F0EAE1] mt-4 flex items-center justify-between text-xs text-[#5E7A67]">
              <span>🌱 100% Raw Whole Ingredients</span>
              <span className="font-bold text-[#0F3826]">Patna Sunrise Harvest</span>
            </div>
          </div>


          {/* ========================================================
              CARD 2 (RIGHT): Patna Purity & Trust Guarantee
             ======================================================== */}
          <div className="lg:col-span-6 rounded-3xl bg-white border border-[#DDD5C0] p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              {/* Header with Patna Sketch */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#D97706] bg-[#FEF9EC] px-2.5 py-0.5 rounded-md border border-[#D97706]/20">
                      Clean Kitchen Guarantee
                    </span>
                    <span className="text-xs text-[#5E7A67]">• 0% Cooking</span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0D2818] tracking-tight">
                    Patna Purity &amp; Trust
                  </h2>
                  <p className="text-xs sm:text-sm text-[#5E7A67] font-medium mt-1">
                    Every morning living food bowl prepared fresh with motherly care.
                  </p>
                </div>

                {/* Golghar Monument Sketch */}
                <div className="opacity-85 shrink-0 hidden sm:block">
                  <svg width="76" height="32" viewBox="0 0 100 40" fill="none" stroke="#7A6A53" strokeWidth="1.3">
                    <path d="M10 38 Q30 38 35 24 Q50 6 65 24 Q70 38 90 38" />
                    <path d="M44 6 L56 6 L50 2 Z" fill="#7A6A53" />
                    <line x1="2" y1="38" x2="98" y2="38" strokeWidth="1.5" />
                    <circle cx="50" cy="18" r="3" />
                    <path d="M22 38 L22 30 Q28 26 34 30 L34 38" />
                    <path d="M66 38 L66 30 Q72 26 78 30 L78 38" />
                  </svg>
                </div>
              </div>

              {/* 5 Quality Trust Items in Stacked Grid */}
              <div className="space-y-2.5 my-2">
                {trustItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-2 rounded-xl bg-[#FAF7F2]/80 border border-[#EAE2D2] hover:bg-[#FAF7F2] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-white border border-[#DDD5C0] flex items-center justify-center shadow-2xs shrink-0">
                      {item.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <strong className="text-xs font-bold text-[#0D2818] block leading-tight">
                        {item.title}
                      </strong>
                      <span className="text-[11px] text-[#5E7A67] leading-tight block truncate">
                        {item.desc}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Note & Script Tag */}
            <div className="pt-3.5 border-t border-[#F0EAE1] mt-4 flex items-center justify-between text-xs">
              <span className="text-[#5E7A67] flex items-center gap-1">
                <span>📍</span>
                <span>Punaichak Central Cloud Kitchen</span>
              </span>
              <span className="font-script text-base sm:text-lg font-bold text-[#8C3A27] tracking-wide whitespace-nowrap">
                Patna Eats Better Together ❤️
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
