'use client';

import React from 'react';

const trustItems = [
  {
    icon: (
      <svg className="w-5 h-5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    label: 'Locally Sourced Ingredients',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    label: 'Hygienically Prepared',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-emerald-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    ),
    label: 'No Artificial Preservatives',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    label: 'Eco-friendly Packaging',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    label: 'Supporting a Healthier Patna',
  },
];

export default function TrustBanner() {
  return (
    <div className="w-full bg-[#F5F1E8] border-y border-[#E6DFC6] py-3.5 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* 5 Quality Badges */}
        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 lg:gap-8">
          {trustItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 group">
              <div className="w-7 h-7 rounded-full bg-white/80 border border-[#DDD5C0] flex items-center justify-center shadow-xs">
                {item.icon}
              </div>
              <span className="text-xs sm:text-[13px] font-semibold text-[#183925] tracking-tight">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Patna Eats Better Together Sketch & Handwritten note */}
        <div className="flex items-center gap-3 shrink-0 pt-2 lg:pt-0">
          {/* Subtle Golghar / Patna architectural monument sketch */}
          <div className="opacity-75 hidden sm:block">
            <svg width="86" height="34" viewBox="0 0 100 40" fill="none" stroke="#7A6A53" strokeWidth="1.2">
              <path d="M10 38 Q30 38 35 24 Q50 6 65 24 Q70 38 90 38" />
              <path d="M44 6 L56 6 L50 2 Z" fill="#7A6A53" />
              <line x1="2" y1="38" x2="98" y2="38" strokeWidth="1.5" />
              <circle cx="50" cy="18" r="3" />
              <path d="M22 38 L22 30 Q28 26 34 30 L34 38" />
              <path d="M66 38 L66 30 Q72 26 78 30 L78 38" />
            </svg>
          </div>
          <span className="font-script text-lg sm:text-xl font-bold text-[#8C3A27] tracking-wide whitespace-nowrap">
            Patna Eats Better Together ❤️
          </span>
        </div>
      </div>
    </div>
  );
}
