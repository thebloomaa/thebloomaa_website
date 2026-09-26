'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const ingredientTags = [
  { name: 'Fruits', icon: '🍓' },
  { name: 'Soaked Seeds', icon: '🌱' },
  { name: 'Nuts', icon: '🥜' },
  { name: 'Leafy Greens', icon: '🥬' },
  { name: 'Vegetables', icon: '🥕' },
];

const planPerks = [
  'Free delivery in Patna',
  'Flexible plans',
  'Pause or modify anytime',
  'Freshly prepared daily',
  'Secure payments',
  'Dedicated support',
];

export default function NutritionAndPlansSection() {
  return (
    <section id="plans" className="py-8 sm:py-10 lg:py-12 px-4 sm:px-6 lg:px-8 bg-[#FAF7F2] border-t border-[#EAE2D2]">
      <div className="max-w-[1536px] mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          
          {/* ========================================================
              LEFT COLUMN: Nutrition You Can See (Contained Card)
             ======================================================== */}
          <div className="xl:col-span-5 rounded-3xl bg-white border border-[#DDD5C0] p-6 sm:p-7 shadow-xs flex flex-col justify-between">
            {/* Header */}
            <div className="mb-5">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0D2818] tracking-tight">
                Nutrition You Can See
              </h2>
              <p className="text-xs sm:text-sm text-[#5E7A67] font-medium mt-1">
                Real food. Real nutrition. No artificial supplements.
              </p>
            </div>

            {/* Split Content: Rings & Ingredients on left, Bowl on right */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center my-auto">
              
              {/* Left Sub-column: 3 Metric Rings + Ingredients */}
              <div className="sm:col-span-7 flex flex-col justify-between space-y-5">
                {/* 3 Circular Metric Discs */}
                <div className="flex items-center gap-2 sm:gap-2.5">
                  {/* 15g Protein */}
                  <div className="w-[70px] h-[70px] sm:w-[76px] sm:h-[76px] rounded-full border-2 border-[#16A34A] bg-[#F4FAF6] flex flex-col items-center justify-center text-center shadow-2xs shrink-0">
                    <span className="text-base sm:text-lg font-black text-[#0D2818] leading-none">15g</span>
                    <span className="text-[10px] font-semibold text-[#16A34A] mt-0.5">Protein</span>
                  </div>

                  {/* 8g Fibre */}
                  <div className="w-[70px] h-[70px] sm:w-[76px] sm:h-[76px] rounded-full border-2 border-[#D97706] bg-[#FEFBF6] flex flex-col items-center justify-center text-center shadow-2xs shrink-0">
                    <span className="text-base sm:text-lg font-black text-[#0D2818] leading-none">8g</span>
                    <span className="text-[10px] font-semibold text-[#D97706] mt-0.5">Fibre</span>
                  </div>

                  {/* 20+ Micronutrients */}
                  <div className="w-[70px] h-[70px] sm:w-[76px] sm:h-[76px] rounded-full border-2 border-[#E11D48] bg-[#FFF5F7] flex flex-col items-center justify-center text-center shadow-2xs shrink-0">
                    <span className="text-base sm:text-lg font-black text-[#0D2818] leading-none">20+</span>
                    <span className="text-[9px] font-semibold text-[#E11D48] mt-0.5 leading-tight">Micronutrients</span>
                  </div>
                </div>

                {/* 5 Ingredient Category Chips */}
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
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

              {/* Right Sub-column: Bowl with Sticky Note */}
              <div className="sm:col-span-5 flex items-center justify-center relative">
                <div className="relative w-40 h-40 sm:w-44 sm:h-44 rounded-2xl overflow-hidden shadow-md border border-[#E6DFC6] bg-[#FAF7F2]">
                  <Image
                    src="/nutrition-bowl.jpg"
                    alt="Real Food Nutrition at Thebloomaa"
                    fill
                    sizes="200px"
                    className="object-cover"
                  />
                  {/* Sticky Note */}
                  <div className="absolute -bottom-1 -right-1 sticky-note px-3 py-2 rounded-xs border border-[#E8DD9E] max-w-[130px] z-10 shadow-md">
                    <p className="font-script text-sm sm:text-base font-bold text-[#4A3B1B] text-center leading-tight">
                      Good Food<br />Brighter Days ❤️
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Subtle Note */}
            <div className="pt-4 border-t border-[#F0EAE1] mt-4 flex items-center justify-between text-xs text-[#5E7A67]">
              <span>🌱 100% Raw Whole Ingredients</span>
              <span className="font-semibold text-[#0F3826]">Patna Special</span>
            </div>
          </div>


          {/* ========================================================
              RIGHT COLUMN: Choose Your Plan + Perks (Aligned Cards)
             ======================================================== */}
          <div className="xl:col-span-7 flex flex-col justify-between">
            {/* Header */}
            <div className="mb-5">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0D2818] tracking-tight">
                Choose Your Plan
              </h2>
              <p className="text-xs sm:text-sm text-[#5E7A67] font-medium mt-1">
                Flexible plans for your wellness journey.
              </p>
            </div>

            {/* 3 Cards Grid: Weekly (Most Popular), Custom Monthly, and Plan Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 items-stretch h-full">
              
              {/* 1. 7-Day Weekly Plan (Most Popular) */}
              <div className="rounded-3xl p-5 sm:p-6 bg-white border-2 border-[#D97706] shadow-md flex flex-col justify-between text-center relative transition-all hover:shadow-xl">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#D97706] text-white shadow-xs whitespace-nowrap">
                  Most Popular • 7 Days
                </span>
                <div>
                  <div className="w-11 h-11 rounded-2xl bg-[#FEF3EE] border border-[#FCD8C7] flex items-center justify-center mx-auto mb-2.5 text-lg mt-1">
                    🥗
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#0D2818]">7-Day Weekly Plan</h3>
                  <p className="text-xs text-[#5E7A67] mb-3 leading-snug">7 distinct raw &amp; living bowls delivered each morning</p>
                  
                  {/* Price Block */}
                  <div className="py-3 px-2 rounded-2xl bg-[#FEF9EC] border border-[#FDE3B2] mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#D97706] block">Signature Living Routine</span>
                    <strong className="text-2xl sm:text-3xl font-black text-[#0D2818] block font-sans tracking-tight my-0.5">Price TBA</strong>
                    <span className="text-[10px] text-[#5E7A67] font-semibold block">Pre-booking open • Morning delivery</span>
                  </div>
                </div>
                
                <Link
                  href="/checkout?plan=trial"
                  className="w-full py-3 rounded-xl text-xs font-black text-white bg-[#D97706] hover:bg-[#B45309] transition-all block cursor-pointer shadow-md active:scale-[0.98]"
                >
                  Pre-Book Weekly Plan →
                </Link>
              </div>

              {/* 2. Custom Monthly Plan */}
              <div className="rounded-3xl p-5 sm:p-6 bg-white border-2 border-[#0F3826]/40 shadow-xs flex flex-col justify-between text-center relative transition-all hover:border-[#0F3826] hover:shadow-md">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#0F3826] text-white shadow-xs whitespace-nowrap">
                  Best Value • 30 Days
                </span>
                <div>
                  <div className="w-11 h-11 rounded-2xl bg-[#FAF7F2] border border-[#DDD5C0] flex items-center justify-center mx-auto mb-2.5 text-lg mt-1">
                    📅
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#0D2818]">Custom Monthly Plan</h3>
                  <p className="text-xs text-[#5E7A67] mb-3 leading-snug">Personalized 30-day complete vitality transformation</p>
                  
                  {/* Price Block */}
                  <div className="py-3 px-2 rounded-2xl bg-[#FAF7F2] border border-[#EAE2D2] mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F3826] block">Customizable Plan</span>
                    <strong className="text-2xl sm:text-3xl font-black text-[#0D2818] block font-sans tracking-tight my-0.5">Price TBA</strong>
                    <span className="text-[10px] text-[#5E7A67] font-semibold block">Pre-booking open • Priority slot</span>
                  </div>
                </div>
                
                <Link
                  href="/checkout?plan=monthly"
                  className="w-full py-3 rounded-xl text-xs font-black text-white bg-[#0F3826] hover:bg-[#185338] transition-all block cursor-pointer shadow-md active:scale-[0.98]"
                >
                  Pre-Book Custom Monthly →
                </Link>
              </div>

              {/* 3. Plan Benefits Card */}
              <div className="rounded-3xl p-5 sm:p-6 bg-[#FAF7F2] border border-[#DDD5C0] flex flex-col justify-between shadow-2xs">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0D2818] block pb-2 border-b border-[#EAE2D2] mb-3">
                    Plan Benefits &amp; Flexibility:
                  </span>
                  <div className="space-y-2.5">
                    {planPerks.map((perk, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-[#0F3826]/10 text-[#0F3826] text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                          ✓
                        </span>
                        <span className="text-xs font-semibold text-[#183925] leading-tight">
                          {perk}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#EAE2D2] mt-3">
                  <p className="text-[11px] text-[#5E7A67] leading-tight font-medium text-center">
                    🌿 Pause, skip or cancel anytime with 1-click in your portal
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
