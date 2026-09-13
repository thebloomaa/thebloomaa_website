import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BioCalculator from '@/components/BioCalculator';

export const metadata: Metadata = {
  title: 'Living Food Bio Calculator & Diet Comparison | TheBlooMaa',
  description:
    'Calculate your Living Food Vitality Score, Biological Diet Age, and TDEE macros based on your cooked vs. living raw food intake. Compare your current diet with optimal living nutrition.',
  keywords: ['bio calculator', 'living food vitality', 'raw vs cooked food', 'diet comparison', 'TDEE calculator', 'Thebloomaa'],
};

const livingFaqs = [
  {
    q: 'Why does the ratio of cooked vs. living food matter?',
    a: 'Cooking food above 48°C (118°F) denatures living food enzymes (amylase, protease, lipase) and destroys heat-labile vitamins (like Vitamin C, B-complex, and folate) by up to 60–80%. High-heat cooking can also generate Advanced Glycation End-products (AGEs) that contribute to cellular inflammation and post-meal sluggishness.',
  },
  {
    q: 'What is the Biological Diet Age Delta?',
    a: 'It estimates how your current dietary pattern affects cellular aging relative to your chronological age. Diets high in living raw foods, sprouted seeds, and microgreens supply dense polyphenols and antioxidant shields that support cellular mitochondrial function (-2 to -5 years younger). High cooked/fried food diets place higher metabolic oxidative load (+3 to +5 years older).',
  },
  {
    q: 'How does Thebloomaa support my living food goals?',
    a: 'Every Thebloomaa meal plan is designed to pair perfectly with living foods. Our chef preps feature fresh sprouted lentils, crisp living salads, and unheated superfood dressings alongside clean proteins and complex grains, ensuring high enzyme vitality.',
  },
  {
    q: 'Can I customize my meals after calculating my bio profile?',
    a: 'Yes! Once your profile is calculated, you can select the recommended meal plan and proceed to checkout, or customize your delivery time and bundle duration (7, 15, or 30 days) directly.',
  },
];

export default function CalculatorPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ background: 'var(--bg-dark)' }}>
        {/* Background glow effects */}
        <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: 'var(--brand-primary)' }} />
        <div className="absolute top-1/2 right-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: 'var(--brand-accent)' }} />

        {/* Header Section */}
        <div className="max-w-4xl mx-auto text-center mb-10 relative z-10">
          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
            style={{
              background: 'rgba(16, 185, 129, 0.1)',
              color: 'var(--brand-primary)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
            }}
          >
            Scientific Dietary Diagnostic 🧪
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-100 tracking-tight leading-tight">
            Bio Calculator &amp; <span style={{ color: 'var(--brand-primary)' }}>Living Diet</span> Engine
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Discover how your intake of cooked foods, raw fruits, sprouted seeds, and crisp greens 
            influences your cellular vitality, active enzyme levels, and biological diet age.
          </p>
        </div>

        {/* The Interactive Calculator Component */}
        <div className="relative z-10">
          <BioCalculator />
        </div>

        {/* Science & Living Foods FAQ Section */}
        <section className="max-w-4xl mx-auto mt-20 pt-12 border-t border-slate-800 relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-black text-slate-100">
              The Science of Living Food Vitality
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Key insights into thermal food processing, cellular enzymes, and metabolic longevity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {livingFaqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl p-6 bg-slate-900/60 border border-slate-800"
              >
                <h3 className="text-sm font-bold text-slate-200 mb-2 flex items-start gap-2">
                  <span className="text-emerald-400">Q:</span>
                  <span>{faq.q}</span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed pl-5">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
