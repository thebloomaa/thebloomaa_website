'use client';

import React from 'react';
import Link from 'next/link';

const planPerks = [
  'Free doorstep delivery in Patna',
  'Just Bloom & Monthly routines available',
  'Pause, skip or reschedule anytime',
  'Cold-prepared fresh at 5:00 AM daily',
  'Early bird price: ₹499 for first 100 customers',
  'Dedicated WhatsApp subscriber support',
];

export default function NutritionAndPlansSection() {
  return (
    <section id="plans" className="py-10 sm:py-12 lg:py-14 px-4 sm:px-6 lg:px-8 bg-[#FAF7F2] border-t border-[#EAE2D2]">
      <div className="max-w-[1536px] mx-auto">
        {/* Centered Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0F3826]/10 border border-[#0F3826]/20 mb-2.5">
            <span className="text-xs">🌱</span>
            <span className="text-[11px] font-black uppercase tracking-wider text-[#0F3826]">
              Transparent &amp; Flexible Living Routines
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#0D2818] tracking-tight leading-tight">
            Choose Your Plan
          </h2>
          <p className="text-xs sm:text-sm text-[#5E7A67] font-medium mt-1.5 leading-relaxed">
            Fresh living nutrition delivered across Patna every morning between <strong>6:00 AM – 9:00 AM</strong>. Lock your slot ahead of our 30th September launch.
          </p>
        </div>

        {/* 3 High-Impact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch max-w-6xl mx-auto">
          
          {/* Card 1: Just Bloom Plan (Most Popular) */}
          <div className="rounded-3xl p-6 sm:p-7 bg-white border-2 border-[#D97706] shadow-md flex flex-col justify-between text-center relative transition-all hover:shadow-xl hover:-translate-y-1">
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#D97706] text-white shadow-sm whitespace-nowrap">
              Most Popular • Early Bird
            </span>

            <div>
              <div className="w-13 h-13 rounded-2xl bg-[#FEF3EE] border border-[#FCD8C7] flex items-center justify-center mx-auto mb-3 text-2xl mt-1">
                🥗
              </div>
              <h3 className="font-serif text-xl font-bold text-[#0D2818]">Just Bloom Plan</h3>
              <p className="text-xs text-[#5E7A67] mt-1 mb-4 leading-snug">
                6 rotating raw living bowls + 1 Surprise Bloom Box — fruits, sprouts, veggies & seeds
              </p>
              
              {/* Price Block */}
              <div className="py-4 px-3 rounded-2xl bg-[#FEF9EC] border border-[#FDE3B2] mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#D97706] block">
                  🎁 First 100 Customers Only
                </span>
                <div className="flex items-baseline justify-center gap-2 my-1">
                  <span className="text-2xl font-black text-[#5E7A67] line-through font-mono">₹599</span>
                  <strong className="text-3xl font-black text-[#D97706] font-mono">₹499</strong>
                </div>
                <span className="text-[11px] text-[#5E7A67] font-semibold block">
                  7 to 9 AM Delivery • Patna
                </span>
              </div>

              {/* 3 Quick Features */}
              <div className="space-y-2 text-left mb-6 text-xs text-[#183925]">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Fruits, Sprouts, Veggies, Wet & Dry Seeds</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Daily rotating A/c to Healthy Functional</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>1 Surprise Bloom Box included 🎁</span>
                </div>
              </div>
            </div>
            
            <Link
              href="/checkout?plan=trial"
              className="w-full py-3.5 rounded-2xl text-xs sm:text-sm font-black text-white bg-[#D97706] hover:bg-[#B45309] transition-all block cursor-pointer shadow-md hover:scale-[1.02] active:scale-[0.98]"
            >
              Pre-Book Just Bloom Plan →
            </Link>
          </div>

          {/* Card 2: Custom Monthly Plan (Best Value) */}
          <div className="rounded-3xl p-6 sm:p-7 bg-white border-2 border-[#0F3826]/40 shadow-xs flex flex-col justify-between text-center relative transition-all hover:border-[#0F3826] hover:shadow-xl hover:-translate-y-1">
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#0F3826] text-white shadow-sm whitespace-nowrap">
              Best Value • 30 Days
            </span>

            <div>
              <div className="w-13 h-13 rounded-2xl bg-[#FAF7F2] border border-[#DDD5C0] flex items-center justify-center mx-auto mb-3 text-2xl mt-1">
                📅
              </div>
              <h3 className="font-serif text-xl font-bold text-[#0D2818]">Custom Monthly Plan</h3>
              <p className="text-xs text-[#5E7A67] mt-1 mb-4 leading-snug">
                Personalized 30-day complete living food transformation in Patna
              </p>
              
              {/* Price Block */}
              <div className="py-4 px-3 rounded-2xl bg-[#FAF7F2] border border-[#EAE2D2] mb-5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F3826] block">
                  Tailored Monthly Transformation
                </span>
                <strong className="text-3xl font-black text-[#0D2818] block font-sans tracking-tight my-1">
                  Price TBA
                </strong>
                <span className="text-[11px] text-[#5E7A67] font-semibold block">
                  Priority delivery slot • Pause anytime
                </span>
              </div>

              {/* 3 Quick Features */}
              <div className="space-y-2 text-left mb-6 text-xs text-[#183925]">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Fully customizable to allergy preferences</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Pause or skip days with 1-click in portal</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Dedicated cloud kitchen prep supervisor</span>
                </div>
              </div>
            </div>
            
            <Link
              href="/checkout?plan=monthly"
              className="w-full py-3.5 rounded-2xl text-xs sm:text-sm font-black text-white bg-[#0F3826] hover:bg-[#185338] transition-all block cursor-pointer shadow-md hover:scale-[1.02] active:scale-[0.98]"
            >
              Pre-Book Custom Monthly →
            </Link>
          </div>

          {/* Card 3: Plan Benefits & Flexibility (Perks) */}
          <div className="rounded-3xl p-6 sm:p-7 bg-white border border-[#DDD5C0] flex flex-col justify-between shadow-2xs hover:shadow-md transition-all">
            <div>
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#EAE2D2] mb-4">
                <span className="text-xl">🛡️</span>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#0D2818]">
                    Plan Benefits &amp; Flexibility
                  </h3>
                  <span className="text-[11px] text-[#5E7A67]">Zero commitment risk</span>
                </div>
              </div>

              <div className="space-y-3.5 my-2">
                {planPerks.map((perk, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#0F3826]/10 text-[#0F3826] text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                      ✓
                    </span>
                    <span className="text-xs font-semibold text-[#183925] leading-snug">
                      {perk}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#EAE2D2] mt-4 space-y-2 text-center">
              <p className="text-[11px] text-[#5E7A67] leading-relaxed font-medium">
                🌿 Need a custom corporate or family package?
              </p>
              <a
                href="https://wa.me/919117501404?text=Hi%20Thebloomaa%2C%20I%20would%20like%20to%20inquire%20about%20a%20custom%20monthly%20or%20family%20diet%20plan"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D97706] hover:text-[#B45309] transition-colors"
              >
                <span>Chat with Kitchen Team on WhatsApp</span>
                <span>→</span>
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
