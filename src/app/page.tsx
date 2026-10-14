import React from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import BowlsSection from '@/components/BowlsSection';
import NutritionAndPlansSection from '@/components/NutritionAndPlansSection';
import TestimonialsAndFaqSection from '@/components/TestimonialsAndFaqSection';
import CtaBannerPatna from '@/components/CtaBannerPatna';
import Footer from '@/components/Footer';

export const revalidate = 60;

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FAF7F2] text-[#0D2818] font-sans selection:bg-[#E6BE68] selection:text-[#0D2818]">
      {/* 1. Navigation Bar */}
      <Navbar />

      {/* 2. Hero Section: Bloom your day with Bloomaa */}
      <HeroSection />

      {/* 3. Our Bowls: Five Goals. A Healthier You. */}
      <BowlsSection />

      {/* 4. Nutrition You Can See & Choose Your Plan */}
      <NutritionAndPlansSection />

      {/* 5. Real People. Real Stories & Frequently Asked Questions */}
      <TestimonialsAndFaqSection />

      {/* 6. Pre-Footer Call to Action Banner with Patna Bridge Artwork */}
      <CtaBannerPatna />

      {/* 7. Footer */}
      <Footer />
    </main>
  );
}
