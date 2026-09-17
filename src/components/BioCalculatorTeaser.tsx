'use client';

import React from 'react';
import Link from 'next/link';

export default function BioCalculatorTeaser() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/3 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none bg-brand-mustard" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl pointer-events-none bg-brand-mustard" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="rounded-3xl p-8 sm:p-12 backdrop-blur-xl bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 border border-brand-border/60 shadow-2xl relative overflow-hidden">
          {/* Subtle Top Border Highlight */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-mustard via-brand-mustard to-brand-mustard" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-mustard/10 text-brand-mustard border border-brand-mustard/20">
                <span className="w-2 h-2 rounded-full bg-brand-mustard animate-pulse" />
                Raw &amp; Fresh Nutrition Intelligence
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-forest tracking-tight leading-tight">
                Discover Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-mustard to-brand-mustard-hover">Fresh &amp; Raw Vitality</span> Score
              </h2>

              <p className="text-sm sm:text-base text-brand-forest-muted max-w-xl leading-relaxed">
                Cooking food above 48°C denatures active enzymes and depletes heat-sensitive micronutrients. 
                Find out how your ratio of cooked diets vs. raw fruits, sprouts, and crisp raw greens impacts your 
                daily energy, gut microbiome, and biological diet age.
              </p>

              {/* Feature Chips */}
              <div className="flex flex-wrap gap-2.5 pt-2 justify-center lg:justify-start">
                <span className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-brand-cream/90 text-brand-forest border border-brand-border flex items-center gap-1.5 shadow-sm">
                  ⚡ <strong className="text-brand-mustard">Natural Enzyme Ratio</strong>
                </span>
                <span className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-brand-cream/90 text-brand-forest border border-brand-border flex items-center gap-1.5 shadow-sm">
                  🧬 <strong className="text-brand-mustard">Biological Diet Age</strong>
                </span>
                <span className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-brand-cream/90 text-brand-forest border border-brand-border flex items-center gap-1.5 shadow-sm">
                  🥗 <strong className="text-blue-400">Mifflin-St Jeor TDEE</strong>
                </span>
                <span className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-brand-cream/90 text-brand-forest border border-brand-border flex items-center gap-1.5 shadow-sm">
                  🌱 <strong className="text-brand-mustard-hover">Patna Fresh Prep Match</strong>
                </span>
              </div>

              {/* Action Button */}
              <div className="pt-4">
                <Link
                  href="/calculator"
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-sm font-black text-brand-forest bg-brand-mustard hover:bg-brand-mustard transition-all shadow-xl shadow-brand-mustard/25 hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <span>Launch Free Bio Calculator</span>
                  <span className="text-lg">→</span>
                </Link>
                <span className="block text-xs text-brand-forest-muted mt-2">Takes only 60 seconds · No credit card required</span>
              </div>
            </div>

            {/* Right Preview Card Column */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-sm rounded-2xl p-6 bg-brand-cream/70 border border-brand-border relative shadow-xl backdrop-blur-md">
                <div className="flex items-center justify-between pb-4 border-b border-brand-border/80">
                  <span className="text-xs font-bold uppercase text-brand-forest-muted tracking-wider">
                    Interactive Report Preview
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-mustard/20 text-brand-mustard border border-brand-mustard/30">
                    Live Engine
                  </span>
                </div>

                <div className="py-5 space-y-4">
                  {/* Gauge Mockup */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full border-4 border-brand-mustard border-t-slate-800 flex items-center justify-center font-mono font-black text-lg text-brand-mustard bg-brand-card shadow-inner">
                      78%
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-brand-forest">Vitality Index</h4>
                      <p className="text-xs text-brand-mustard font-semibold">Balanced Living State</p>
                      <span className="text-[10px] text-brand-forest-muted">Biological Age: -3 Years</span>
                    </div>
                  </div>

                  {/* Comparison preview bar */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-brand-forest-muted">Your Current Diet:</span>
                      <span className="font-semibold text-brand-mustard font-mono">75% Cooked / Low Enzymes</span>
                    </div>
                    <div className="w-full h-2 bg-brand-cream rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-brand-mustard to-red-500 w-3/4 rounded-full" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-brand-forest-muted">Target Living State:</span>
                      <span className="font-semibold text-brand-mustard font-mono">65% Living / Active Enzymes</span>
                    </div>
                    <div className="w-full h-2 bg-brand-cream rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-brand-mustard to-teal-400 w-[65%] rounded-full" />
                    </div>
                  </div>
                </div>

                <Link
                  href="/calculator"
                  className="w-full py-2.5 block text-center rounded-xl text-xs font-bold text-brand-mustard-hover bg-brand-mustard/15 border border-brand-mustard/30 hover:bg-brand-mustard/25 transition-all"
                >
                  Calculate My Score →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
