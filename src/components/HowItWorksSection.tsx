'use client';

import React from 'react';
import Image from 'next/image';

const steps = [
  {
    number: '1',
    title: 'We Source Fresh Ingredients',
    icon: (
      <svg className="w-6 h-6 sm:w-7 sm:h-7 text-[#166534]" viewBox="0 0 32 32" fill="currentColor">
        <path d="M16 28c0-7 2-13 8-16-1 7-4 11-8 16z" fill="#15803D" />
        <path d="M16 28c0-8-3-15-11-18 2 9 6 13 11 18z" fill="#166534" />
        <path d="M16 28v-9" stroke="#0F3826" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    number: '2',
    title: 'Carefully Washed & Cleaned',
    icon: (
      <svg className="w-6 h-6 sm:w-7 sm:h-7 text-[#0F3826]" viewBox="0 0 32 32" fill="currentColor">
        <path d="M16 4C16 4 7 15 7 21a9 9 0 0018 0c0-6-9-17-9-17z" fill="#0F3826" />
        <circle cx="16" cy="22" r="3" fill="#86EFAC" />
      </svg>
    ),
  },
  {
    number: '3',
    title: 'Soaked & Prepared Fresh',
    icon: (
      <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 32 32" fill="none">
        <path d="M6 14h20c0 7-4.5 12-10 12s-10-5-10-12z" fill="#B45309" />
        <path d="M5 13h22v2H5z" fill="#92400E" />
        <circle cx="11" cy="11" r="2.8" fill="#22C55E" />
        <circle cx="16" cy="9" r="3.2" fill="#16A34A" />
        <circle cx="21" cy="11" r="2.8" fill="#15803D" />
        <path d="M16 9l-2-4m2 4l3-3" stroke="#15803D" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    number: '4',
    title: 'Packed with Care',
    icon: (
      <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 32 32" fill="currentColor">
        <path d="M16 3l11 6-11 6-11-6 11-6z" fill="#166534" />
        <path d="M5 10.5v11l11 6v-11L5 10.5z" fill="#0F3826" />
        <path d="M27 10.5v11l-11 6v-11l11-6z" fill="#14532D" />
        <path d="M16 16v11M5 10.5l11 6 11-6" stroke="#4ADE80" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    number: '5',
    title: 'Delivered in Patna',
    icon: (
      <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 32 32" fill="currentColor">
        <circle cx="10" cy="22" r="3.5" fill="#0F3826" stroke="#FAF7F2" strokeWidth="1.5" />
        <circle cx="23" cy="22" r="3.5" fill="#0F3826" stroke="#FAF7F2" strokeWidth="1.5" />
        <path d="M7 16h6l3 6h-9z" fill="#166534" />
        <path d="M19 16h4l2 6h-6z" fill="#166534" />
        <path d="M13 16l4-7h4" stroke="#0F3826" strokeWidth="2" strokeLinecap="round" />
        <rect x="7" y="11" width="5" height="5" rx="1" fill="#D97706" />
      </svg>
    ),
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-6 sm:py-8 lg:py-10 px-3 sm:px-6 lg:px-8 bg-[#FAF7F2]">
      <div className="max-w-[1536px] mx-auto">
        {/* Contained Panoramic Card Banner Recreating the Mockup */}
        <div className="relative rounded-2xl lg:rounded-3xl border border-[#E4DCC5] bg-gradient-to-r from-[#F5ECE0] via-[#FAF6EE] to-[#F3E7D8] shadow-sm overflow-hidden">
          {/* Subtle Ambient Watercolor Glow Behind Leaves */}
          <div className="absolute -left-6 top-0 bottom-0 w-28 bg-[#EADCC8]/50 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -right-6 top-0 bottom-0 w-28 bg-[#EADCC8]/50 rounded-full blur-2xl pointer-events-none" />

          {/* Left Foliage Frame - Pure Transparent PNG */}
          <div className="absolute left-0 top-0 bottom-0 w-14 sm:w-16 lg:w-20 z-10 pointer-events-none select-none">
            <Image
              src="/foliage-left.png"
              alt=""
              fill
              className="object-contain object-left"
              priority
            />
          </div>

          {/* Right Foliage Frame - Pure Transparent PNG */}
          <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-14 lg:w-16 z-10 pointer-events-none select-none">
            <Image
              src="/foliage-right.png"
              alt=""
              fill
              className="object-contain object-right"
              priority
            />
          </div>

          {/* Main Content Area */}
          <div className="overflow-x-auto no-scrollbar py-6 lg:py-7 pl-14 sm:pl-18 lg:pl-[84px] pr-14 sm:pr-18 lg:pr-[84px] relative z-20">
            <div className="min-w-[920px] xl:min-w-0 flex items-center justify-between gap-4 lg:gap-6">
              
              {/* Left Column: Heading + 5 Steps */}
              <div className="flex flex-col shrink">
                {/* Section Header */}
                <div className="flex items-center gap-2 mb-3.5">
                  <div className="w-7 h-7 rounded-full bg-[#0F3826]/10 flex items-center justify-center shrink-0">
                    <span className="text-base">🍃</span>
                  </div>
                  <div>
                    <h2 className="font-serif text-lg sm:text-xl lg:text-2xl font-bold text-[#0D2818] tracking-tight leading-tight">
                      How It Works
                    </h2>
                    <p className="text-[11px] sm:text-xs text-[#5E7A67] font-medium leading-none mt-0.5">
                      From nature&apos;s best to your doorstep.
                    </p>
                  </div>
                </div>

                {/* 5 Sequential Steps with Connecting Arrows */}
                <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                  {steps.map((step, idx) => (
                    <React.Fragment key={idx}>
                      <div className="flex flex-col items-center text-center group w-[90px] sm:w-[100px] lg:w-[110px] shrink-0">
                        {/* Circular 3D White Disc + Step Number Badge */}
                        <div className="relative mb-2">
                          <div className="w-13 h-13 sm:w-15 sm:h-15 lg:w-16 lg:h-16 rounded-full bg-white shadow-md border border-[#EAE2D2] flex items-center justify-center transition-transform group-hover:scale-105 duration-300">
                            {step.icon}
                          </div>
                          <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-[#0F3826] text-white text-[10px] font-black flex items-center justify-center border border-white shadow-xs">
                            {step.number}
                          </span>
                        </div>

                        {/* Step Title Label (2 Lines max) */}
                        <p className="text-[10px] sm:text-[11px] font-bold text-[#0D2818] leading-tight text-center">
                          {step.title}
                        </p>
                      </div>

                      {/* Directional Arrow between steps */}
                      <div className="text-[#8C7A5B] font-bold text-sm sm:text-base shrink-0 -mt-6 select-none opacity-80">
                        →
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Right Column: Polaroid Mother & Child Photo + Script Note */}
              <div className="flex items-center gap-3 sm:gap-4 lg:gap-5 shrink-0 pl-2">
                {/* Polaroid Frame */}
                <div className="w-[140px] sm:w-[165px] lg:w-[185px] bg-white p-2 sm:p-2.5 pb-5 sm:pb-6 rounded-xs shadow-[0_12px_28px_rgba(0,0,0,0.16)] border border-[#DDD5C0] rotate-2 hover:rotate-0 transition-transform duration-300 shrink-0">
                  <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#FAF7F2] rounded-2xs">
                    <Image
                      src="/mother-child-polaroid.png"
                      alt="Maa-like Care at Thebloomaa"
                      fill
                      sizes="200px"
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Handwritten Script Note */}
                <div className="font-script text-lg sm:text-xl lg:text-2xl text-[#264638] font-bold leading-tight rotate-2 shrink-0 select-none max-w-[110px] sm:max-w-[130px]">
                  Because<br />
                  Good Food<br />
                  Is Also Care<br />
                  <span className="text-red-500 text-xl sm:text-2xl inline-block mt-0.5 animate-pulse">❤️</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Small Screen Swipe Prompt */}
        <div className="xl:hidden flex items-center justify-center gap-1.5 mt-2 text-[11px] font-medium text-[#5E7A67]">
          <span>👈</span>
          <span>Swipe to explore all 5 steps</span>
          <span>👉</span>
        </div>
      </div>
    </section>
  );
}
