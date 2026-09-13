import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 bg-slate-950 text-slate-100">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="border-b border-slate-800 pb-6">
            <span className="text-xs text-amber-300 font-serif italic block mb-1">
              Bloom your day with bloomaa
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-100">
              Privacy Policy
            </h1>
            <p className="text-xs text-slate-400 mt-2">
              Last updated: September 2026 · thebloomaa Technologies, Patna
            </p>
          </div>

          <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-100">1. Information We Collect</h2>
              <p>
                To deliver fresh chef-prepared meal preps and cellular living foods every morning, we collect your name, phone/WhatsApp number, email, delivery address (house number, street, Patna postal pincode), and preferred delivery time slots (6:00 AM – 9:00 AM).
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-100">2. How We Use Your Data</h2>
              <p>
                Your delivery details are shared strictly with our verified in-house rider fleet for daily route dispatching. We never sell, rent, or trade your personal or nutritional data with third-party advertising brokers.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-100">3. Payment &amp; UPI Security</h2>
              <p>
                All transactions are processed directly through UPI rails (PhonePe, Google Pay, Paytm, BHIM) and standard banking channels. We do not store sensitive UPI PINs or card credentials on our servers.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-100">4. Bio Calculator &amp; Macro Data</h2>
              <p>
                Nutritional metrics entered into our Bio Calculator (such as cooked food percentages, living enzyme scores, and biological diet age deltas) are processed in real-time to personalize your meal recommendations and may be stored locally in your browser for convenience.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-100">5. Contacting Us</h2>
              <p>
                For data access or account deletion requests, reach our compliance officer at{' '}
                <a href="mailto:admin@thebloomaa.com" className="text-emerald-400 underline">
                  admin@thebloomaa.com
                </a>{' '}
                or visit our Boring Road kitchen hub in Patna.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
