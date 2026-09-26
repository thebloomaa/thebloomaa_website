'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useBundleStore } from '@/store/useBundleStore';
import PincodeModal from '@/components/PincodeModal';
import TopAnnouncementBar from '@/components/TopAnnouncementBar';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isPincodeOpen, setIsPincodeOpen] = useState(false);
  const { data: session } = useSession();
  const { selectedProduct, openDrawer, pincode, setPincode } = useBundleStore();

  const handlePincodeVerified = (newPin: string) => {
    setPincode(newPin);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 transition-all">
        <TopAnnouncementBar />
        <nav className="bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8E2D2] transition-all">
          <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-18 sm:h-20 gap-3 xl:gap-4">
            {/* Brand Logo Left */}
            <Link href="/" className="flex items-center gap-2.5 group shrink-0 mr-2 sm:mr-4 lg:mr-6">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-[#0F3826] bg-white flex items-center justify-center shadow-xs">
                <Image
                  src="/logo.jpg"
                  alt="Thebloomaa"
                  fill
                  sizes="40px"
                  className="object-cover"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl sm:text-2xl font-bold text-[#0D2818] tracking-tight leading-tight">
                  Thebloomaa
                </span>
                <span className="text-[10px] text-[#5E7A67] italic font-serif leading-none hidden sm:block">
                  Bloom your day with bloomaa
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links (FAQ removed as requested) */}
            <div className="hidden xl:flex items-center gap-4 2xl:gap-6 shrink">
              <Link href="/" className="text-xs xl:text-sm font-semibold text-[#0D2818] hover:text-[#D97706] transition-colors whitespace-nowrap">
                Home
              </Link>
              <a href="/#bowls" className="text-xs xl:text-sm font-semibold text-[#0D2818] hover:text-[#D97706] transition-colors whitespace-nowrap">
                Our Bowls
              </a>
              <a href="/#how-it-works" className="text-xs xl:text-sm font-semibold text-[#0D2818] hover:text-[#D97706] transition-colors whitespace-nowrap">
                How It Works
              </a>
              <a href="/#plans" className="text-xs xl:text-sm font-semibold text-[#0D2818] hover:text-[#D97706] transition-colors whitespace-nowrap">
                Plans
              </a>
              <a href="/#reviews" className="text-xs xl:text-sm font-semibold text-[#0D2818] hover:text-[#D97706] transition-colors whitespace-nowrap">
                Reviews
              </a>
              <Link
                href="/calculator"
                className="text-xs xl:text-sm font-bold text-[#D97706] hover:text-[#B45309] transition-colors flex items-center gap-1 whitespace-nowrap"
              >
                <span>Bio Calc</span>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-[#D97706]/15 font-black">NEW</span>
              </Link>
            </div>

            {/* Right Action Icons: Perfectly Aligned with Uniform h-10 Height */}
            <div className="hidden sm:flex items-center gap-2 xl:gap-2.5 shrink-0">
              {/* Location Pill */}
              <button
                type="button"
                onClick={() => setIsPincodeOpen(true)}
                className="h-10 px-3.5 rounded-full bg-white border border-[#DDD5C0] text-xs font-semibold text-[#0D2818] hover:bg-[#F3EFE6] transition-all cursor-pointer shadow-2xs flex items-center gap-2"
                title="Verify delivery pincode in Patna"
              >
                <span className="text-red-500 text-sm leading-none shrink-0">📍</span>
                <div className="flex flex-col text-left justify-center leading-none">
                  <span className="font-bold text-[11px] text-[#0D2818]">Patna</span>
                  <span className="text-[9px] text-[#5E7A67]">{pincode ? `Pin: ${pincode}` : 'Freshly Delivered'}</span>
                </div>
              </button>

              {/* Cart Indicator */}
              <button
                type="button"
                onClick={openDrawer}
                className="h-10 w-10 rounded-full bg-white border border-[#DDD5C0] text-[#0D2818] hover:bg-[#F3EFE6] transition-all cursor-pointer shadow-2xs flex items-center justify-center relative shrink-0"
                title="View Cart"
              >
                <span className="text-base leading-none">🛒</span>
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#0F3826] text-white text-[10px] font-bold flex items-center justify-center">
                  {selectedProduct ? 1 : 0}
                </span>
              </button>

              {/* User Session or Login */}
              {session?.user ? (
                <Link
                  href="/dashboard"
                  className="h-10 px-4 text-xs font-semibold rounded-full bg-white border border-[#DDD5C0] text-[#0D2818] hover:bg-[#F3EFE6] transition-all flex items-center justify-center whitespace-nowrap"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="h-10 px-4 text-xs font-semibold rounded-full bg-white border border-[#DDD5C0] text-[#0D2818] hover:bg-[#F3EFE6] transition-all flex items-center justify-center whitespace-nowrap"
                >
                  Log In
                </Link>
              )}

              {/* Primary Pre-Book Button */}
              <Link
                href="/checkout?plan=trial"
                className="h-10 px-5 rounded-full text-xs font-bold text-white bg-[#0F3826] hover:bg-[#185338] transition-all hover:scale-105 active:scale-95 shadow-sm flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <span>Pre-Book</span>
                <span className="text-sm">→</span>
              </Link>
            </div>

            {/* Mobile hamburger button */}
            <div className="flex xl:hidden items-center gap-2">
              <button
                type="button"
                onClick={openDrawer}
                className="h-10 w-10 rounded-full bg-white border border-[#DDD5C0] text-[#0D2818] relative flex items-center justify-center"
              >
                <span>🛒</span>
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#0F3826] text-white text-[9px] font-black flex items-center justify-center">
                  {selectedProduct ? 1 : 0}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setMobileOpen(!mobileOpen)}
                className="h-10 w-10 rounded-xl bg-white border border-[#DDD5C0] text-[#0D2818] flex items-center justify-center"
                aria-label="Toggle Navigation"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileOpen && (
          <div className="xl:hidden px-4 pt-2 pb-6 bg-[#FAF7F2] border-b border-[#E8E2D2] space-y-3 animate-fade-in">
            <div className="grid grid-cols-2 gap-2 pb-3 border-b border-[#EAE2D2]">
              <button
                onClick={() => {
                  setMobileOpen(false);
                  setIsPincodeOpen(true);
                }}
                className="p-2.5 rounded-xl bg-white border border-[#DDD5C0] text-xs font-semibold text-left flex items-center gap-2"
              >
                <span>📍</span>
                <span>Patna ({pincode || 'Check Area'})</span>
              </button>
              <Link
                href="/calculator"
                onClick={() => setMobileOpen(false)}
                className="p-2.5 rounded-xl bg-white border border-[#DDD5C0] text-xs font-bold text-[#D97706] text-center"
              >
                Bio Calculator ✨
              </Link>
            </div>

            <div className="flex flex-col space-y-2 text-sm font-semibold text-[#0D2818]">
              <Link href="/" onClick={() => setMobileOpen(false)} className="py-1">Home</Link>
              <a href="/#bowls" onClick={() => setMobileOpen(false)} className="py-1">Our Bowls</a>
              <a href="/#how-it-works" onClick={() => setMobileOpen(false)} className="py-1">How It Works</a>
              <a href="/#plans" onClick={() => setMobileOpen(false)} className="py-1">Plans</a>
              <a href="/#reviews" onClick={() => setMobileOpen(false)} className="py-1">Reviews</a>
            </div>

            <div className="pt-2 flex gap-2">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex-1 py-3 rounded-full text-center text-xs font-semibold text-[#0D2818] bg-white border border-[#DDD5C0]"
              >
                Log In
              </Link>
              <Link
                href="/checkout?plan=trial"
                onClick={() => setMobileOpen(false)}
                className="flex-1 py-3 rounded-full text-center text-xs font-bold text-white bg-[#0F3826]"
              >
                Pre-Book →
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>

      {/* Embedded Pincode Modal */}
      <PincodeModal
        isOpen={isPincodeOpen}
        onClose={() => setIsPincodeOpen(false)}
        onVerified={handlePincodeVerified}
      />
    </>
  );
}
