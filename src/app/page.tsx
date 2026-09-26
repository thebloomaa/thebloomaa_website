import React from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import TrustBanner from '@/components/TrustBanner';
import ComingSoonBanner from '@/components/ComingSoonBanner';
import BowlsSection from '@/components/BowlsSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import NutritionAndPlansSection from '@/components/NutritionAndPlansSection';
import TestimonialsAndFaqSection from '@/components/TestimonialsAndFaqSection';
import CtaBannerPatna from '@/components/CtaBannerPatna';
import Footer from '@/components/Footer';
import LaunchPopupModal from '@/components/LaunchPopupModal';

export const revalidate = 60;

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FAF7F2] text-[#0D2818] font-sans selection:bg-[#E6BE68] selection:text-[#0D2818]">
      {/* 0. Launch Date Popup Modal (1.5s delay, once per session) */}
      <LaunchPopupModal />

      {/* 1. Navigation Bar */}
      <Navbar />

      {/* 2. Hero Section: Maa-like Care & Nature-like Nourishment */}
      <HeroSection />

      {/* 3. Trust Strip & Patna eats together banner */}
      <TrustBanner />

      {/* 3.5. Official Pre-Launch Countdown & Early Pre-Order Banner */}
      <ComingSoonBanner />

      {/* 4. Our Bowls: Five Goals. A Healthier You. */}
      <BowlsSection />

      {/* 5. How It Works: From nature's best to your doorstep */}
      <HowItWorksSection />

      {/* 6. Nutrition You Can See & Choose Your Plan */}
      <NutritionAndPlansSection />

      {/* 7. Real People. Real Stories & Frequently Asked Questions */}
      <TestimonialsAndFaqSection />

      {/* 8. Pre-Footer Call to Action Banner with Patna Bridge Artwork */}
      <CtaBannerPatna />

      {/* 9. Footer */}
      <Footer />
    </main>
  );
}
