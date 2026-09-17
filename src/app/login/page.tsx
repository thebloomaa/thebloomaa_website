'use client';

import React, { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Image from 'next/image';
import CustomerAuthForm from '@/components/CustomerAuthForm';

export default function LoginPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-brand-cream text-brand-forest flex items-center justify-center relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-15 blur-3xl pointer-events-none bg-brand-mustard" />
        <div className="absolute bottom-10 right-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl pointer-events-none bg-brand-mustard" />

        <div className="w-full max-w-6xl mx-auto relative z-10 my-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* ======================================================= */}
            {/* LEFT COLUMN: BRAND STORY & SUBSCRIBER COMMITMENT        */}
            {/* ======================================================= */}
            <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
              {/* Brand Emblem & Motto */}
              <div className="flex flex-col items-center lg:items-start gap-2">
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-brand-mustard/70 shadow-2xl shadow-brand-mustard/15 bg-brand-card ring-4 ring-brand-mustard/20">
                  <Image
                    src="/logo.jpg"
                    alt="Bloom your day with BlooMaa"
                    fill
                    sizes="64px"
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="mt-1">
                  <span className="text-2xl font-black tracking-tight text-brand-forest block">
                    thebloo<span className="text-brand-mustard">maa</span>
                  </span>
                  <span className="text-xs text-brand-forest-muted font-serif italic tracking-wide block">
                    Bloom your day with BlooMaa
                  </span>
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-brand-forest leading-tight">
                Your Morning Blooms, <br className="hidden lg:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-mustard to-brand-mustard-hover">
                  Delivered Fresh.
                </span>
              </h1>

              <p className="text-sm text-brand-forest-muted leading-relaxed max-w-md mx-auto lg:mx-0">
                Sign in to manage your active prepaid bundles, schedule your 6 AM – 9 AM delivery window, or register your custom nutrition profile for Patna cloud kitchen prep.
              </p>

              {/* Core Member Guarantees */}
              <div className="space-y-3.5 pt-2 text-left max-w-md mx-auto lg:mx-0">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-brand-card/80 border border-brand-border">
                  <span className="text-xl">⏰</span>
                  <div>
                    <strong className="text-xs font-bold text-brand-forest block">
                      6:00 AM – 9:00 AM Morning Drop
                    </strong>
                    <span className="text-[11px] text-brand-forest-muted leading-normal block">
                      Chef-prepared fresh at 5:00 AM and delivered to your doorstep before your gym or workday starts.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-brand-card/80 border border-brand-border">
                  <span className="text-xl">⏸️</span>
                  <div>
                    <strong className="text-xs font-bold text-brand-forest block">
                      Flexible 8:30 PM Cutoff
                    </strong>
                    <span className="text-[11px] text-brand-forest-muted leading-normal block">
                      Traveling or cheat day? Pause or skip any upcoming morning directly from your phone. You never lose a diet.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-brand-card/80 border border-brand-border">
                  <span className="text-xl">🌱</span>
                  <div>
                    <strong className="text-xs font-bold text-brand-forest block">
                      Living Enzymes &amp; Motherly Care
                    </strong>
                    <span className="text-[11px] text-brand-forest-muted leading-normal block">
                      Bloom-weighed protein, sprouted seeds, and raw living nutrition. Zero reheated grease, zero preservatives.
                    </span>
                  </div>
                </div>
              </div>

              {/* Live Trust Metrics */}
              <div className="pt-2 flex items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-brand-forest-muted">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-brand-mustard animate-pulse" />
                  Patna Fleet Active
                </span>
                <span>·</span>
                <span>98% On-Time Drops</span>
                <span>·</span>
                <span>5,000+ Preps Served</span>
              </div>
            </div>

            {/* ======================================================= */}
            {/* RIGHT COLUMN: DETAILED INTERACTIVE AUTH FORM             */}
            {/* ======================================================= */}
            <div className="lg:col-span-7">
              <Suspense
                fallback={
                  <div className="rounded-3xl p-12 bg-brand-card border border-brand-border text-center text-brand-forest-muted/70">
                    <span className="w-8 h-8 border-2 border-brand-mustard border-t-transparent rounded-full animate-spin inline-block mb-3" />
                    <p className="text-sm font-medium">Loading authentication portal...</p>
                  </div>
                }
              >
                <CustomerAuthForm />
              </Suspense>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
