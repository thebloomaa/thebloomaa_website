'use client';

import React from 'react';
import Image from 'next/image';

const steps = [
  {
    number: '1',
    title: 'We Source Fresh Ingredients',
    icon: (
      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#166534]" viewBox="0 0 32 32" fill="currentColor">
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
      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#0F3826]" viewBox="0 0 32 32" fill="currentColor">
        <path d="M16 4C16 4 7 15 7 21a9 9 0 0018 0c0-6-9-17-9-17z" fill="#0F3826" />
        <circle cx="16" cy="22" r="3" fill="#86EFAC" />
      </svg>
    ),
  },
  {
    number: '3',
    title: 'Soaked & Prepared Fresh',
    icon: (
      <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 32 32" fill="none">
        <path d="M6 14h20c0 7-4.5 12-10 12s-10-5-10-12z" fill="#B45309" />
        <path d="M5 13h22v2H5z" fill="#92400E" />
        <circle cx="11" cy="11" r="2.5" fill="#22C55E" />
        <circle cx="16" cy="9" r="2.8" fill="#16A34A" />
        <circle cx="21" cy="11" r="2.5" fill="#15803D" />
      </svg>
    ),
  },
  {
    number: '4',
    title: 'Packed with Care',
    icon: (
      <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 32 32" fill="currentColor">
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
      <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 32 32" fill="currentColor">
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
    <section id="how-it-works" className="py-2 sm:py-3 lg:py-3.5 px-3 sm:px-6 lg:px-8 bg-[#FAF7F2]">
      <div className="max-w-[1536px] mx-auto">
        {/* Sleek, Compact Panoramic Card Banner */}
        <div className="relative rounded-2xl lg:rounded-3xl border border-[#E2D8BF] bg-gradient-to-r from-[#F6EFE5] via-[#FAF7F2] to-[#F5EEE3] shadow-xs overflow-hidden">
          
          {/* Left Botanical Accent (Vector SVG - Zero white borders, zero caching artifacts) */}
          <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-16 pointer-events-none select-none overflow-hidden opacity-85 z-10">
            <svg viewBox="0 0 80 180" fill="none" className="w-full h-full object-cover">
              <path d="M-8 10 Q24 70 2 170" stroke="#0F3826" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
              <path d="M8 25 C26 12 42 30 20 44 C8 39 4 30 8 25 Z" fill="#15803D" />
              <path d="M18 58 C40 44 56 66 28 80 C18 73 14 64 18 58 Z" fill="#166534" />
              <path d="M12 94 C32 80 48 102 24 116 C12 108 10 100 12 94 Z" fill="#22C55E" />
              <path d="M20 125 C44 114 58 135 34 149 C20 140 16 132 20 125 Z" fill="#15803D" />
              <path d="M6 155 C24 142 40 164 18 174 C6 168 4 160 6 155 Z" fill="#166534" />
            </svg>
          </div>

          {/* Right Botanical Accent (Vector SVG) */}
          <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-16 pointer-events-none select-none overflow-hidden opacity-85 scale-x-[-1] z-10">
            <svg viewBox="0 0 80 180" fill="none" className="w-full h-full object-cover">
              <path d="M-8 10 Q24 70 2 170" stroke="#0F3826" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
              <path d="M8 25 C26 12 42 30 20 44 C8 39 4 30 8 25 Z" fill="#15803D" />
              <path d="M18 58 C40 44 56 66 28 80 C18 73 14 64 18 58 Z" fill="#166534" />
              <path d="M12 94 C32 80 48 102 24 116 C12 108 10 100 12 94 Z" fill="#22C55E" />
              <path d="M20 125 C44 114 58 135 34 149 C20 140 16 132 20 125 Z" fill="#15803D" />
              <path d="M6 155 C24 142 40 164 18 174 C6 168 4 160 6 155 Z" fill="#166534" />
            </svg>
          </div>

          {/* Main Content Area - Slim & Spatially Efficient */}
          <div className="overflow-x-auto no-scrollbar py-3.5 sm:py-4 px-6 sm:px-10 lg:px-12 relative z-20">
            <div className="min-w-[880px] xl:min-w-0 flex items-center justify-between gap-3 sm:gap-5">
              
              {/* Left Column: Heading + 5 Steps */}
              <div className="flex flex-col shrink">
                {/* Section Header */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-[#0F3826]/10 flex items-center justify-center shrink-0">
                    <span className="text-sm">🍃</span>
                  </div>
                  <div>
                    <h2 className="font-serif text-base sm:text-lg lg:text-xl font-bold text-[#0D2818] tracking-tight leading-tight">
                      How It Works
                    </h2>
                    <p className="text-[10px] sm:text-[11px] text-[#5E7A67] font-medium leading-none mt-0.5">
                      From nature&apos;s best to your doorstep.
                    </p>
                  </div>
                </div>

                {/* 5 Sequential Steps with Connecting Arrows */}
                <div className="flex items-center gap-1.5 sm:gap-2.5 lg:gap-3">
                  {steps.map((step, idx) => (
                    <React.Fragment key={idx}>
                      <div className="flex flex-col items-center text-center group w-[82px] sm:w-[92px] lg:w-[100px] shrink-0">
                        {/* Circular 3D White Disc + Step Number Badge */}
                        <div className="relative mb-1">
                          <div className="w-11 h-11 sm:w-12 sm:h-12 lg:w-13 lg:h-13 rounded-full bg-white shadow-xs border border-[#E4DCC8] flex items-center justify-center transition-transform group-hover:scale-105 duration-200">
                            {step.icon}
                          </div>
                          <span className="absolute -top-1 -left-1 w-4.5 h-4.5 rounded-full bg-[#0F3826] text-white text-[9px] font-black flex items-center justify-center border border-white shadow-2xs">
                            {step.number}
                          </span>
                        </div>

                        {/* Step Title Label (2 Lines max) */}
                        <p className="text-[10px] sm:text-[10.5px] font-bold text-[#0D2818] leading-tight text-center">
                          {step.title}
                        </p>
                      </div>

                      {/* Directional Arrow between steps */}
                      <div className="text-[#8C7A5B] font-bold text-xs sm:text-sm shrink-0 -mt-4 select-none opacity-70">
                        →
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Right Column: Polaroid Mother & Child Photo + Script Note */}
              <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0 pl-1">
                {/* Polaroid Frame */}
                <div className="w-[110px] sm:w-[125px] lg:w-[135px] bg-white p-1.5 sm:p-2 pb-4 sm:pb-5 rounded-xs shadow-md border border-[#DDD5C0] rotate-2 hover:rotate-0 transition-transform duration-300 shrink-0">
                  <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#FAF7F2] rounded-2xs">
                    <Image
                      src="/mother-child-polaroid.png"
                      alt="Maa-like Care at Thebloomaa"
                      fill
                      sizes="150px"
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Handwritten Script Note */}
                <div className="font-script text-base sm:text-lg lg:text-xl text-[#264638] font-bold leading-tight rotate-1 shrink-0 select-none max-w-[95px] sm:max-w-[110px]">
                  Because<br />
                  Good Food<br />
                  Is Also Care<br />
                  <span className="text-red-500 text-base sm:text-lg inline-block mt-0.5">❤️</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Small Screen Swipe Prompt */}
        <div className="xl:hidden flex items-center justify-center gap-1.5 mt-1.5 text-[10px] font-medium text-[#5E7A67]">
          <span>👈</span>
          <span>Swipe to see all 5 steps</span>
          <span>👉</span>
        </div>
      </div>
    </section>
  );
}
