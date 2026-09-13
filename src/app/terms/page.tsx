import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function TermsPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 bg-slate-950 text-slate-100">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="border-b border-slate-800 pb-6">
            <span className="text-xs text-amber-300 font-serif italic block mb-1">
              Bloom your day with BlooMaa
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-100">
              Terms of Service
            </h1>
            <p className="text-xs text-slate-400 mt-2">
              Last updated: September 2026 · thebloomaa Diet Prep Subscriptions, Patna
            </p>
          </div>

          <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-100">1. Subscription Bundles &amp; Prepaid Models</h2>
              <p>
                thebloomaa operates on a prepaid subscription model offering 7-day, 15-day, and 30-day bundles, as well as the special ₹451 Just Bloomed 7D Trial. All plans are paid in advance via UPI or accepted payment methods.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-100">2. Daily Morning Delivery Window</h2>
              <p>
                Diets are chef-prepared fresh early every morning and delivered between 6:00 AM and 9:00 AM across serviceable pincodes in Patna. Subscribers can specify a preferred delivery time slot in their subscriber dashboard.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-100">3. 8:30 PM Cutoff &amp; Pause / Skip Policy</h2>
              <p>
                Subscribers have complete flexibility to pause or skip any upcoming delivery day directly from their dashboard. However, all skips or modifications for the following morning must be submitted before our daily <strong>8:30 PM cutoff</strong> to allow our cloud kitchen and routing engines to calibrate ingredient prep. Skipped days are never forfeited; they roll forward to extend your bundle.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-100">4. Just Bloomed 7-Day Trial Protocol</h2>
              <p>
                The ₹451 Just Bloomed 7-Day Trial is a prepaid introduction plan. As part of our logistics protocol, 7 unique living boxes are distributed over 6 active morning routes, featuring a Day 6 Double Drop (Box 6 + Box 7 delivered together).
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-100">5. Cancellations &amp; Refunds</h2>
              <p>
                Unconsumed prepaid diet days may be refunded pro-rata upon request, less applicable bundle discounts, provided written notice is submitted via WhatsApp or email to admin@thebloomaa.com.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
