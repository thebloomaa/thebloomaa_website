'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Image from 'next/image';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 bg-slate-950 text-slate-100">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-amber-400/60 shadow-lg mx-auto mb-2 bg-slate-900 ring-2 ring-emerald-500/20">
              <Image
                src="/logo.jpg"
                alt="thebloomaa"
                fill
                className="object-cover"
              />
            </div>
            <span className="text-xs text-amber-300 font-serif italic block">
              Bloom your day with BlooMaa
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
              Get in Touch with Our Team
            </h1>
            <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
              Have questions about our living food preps, corporate subscription bundles, or morning delivery timing in Patna? We're here for you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Details Card */}
            <div className="rounded-3xl p-6 sm:p-8 bg-slate-900 border border-slate-800 shadow-xl space-y-6">
              <h2 className="text-lg font-bold text-emerald-400 uppercase tracking-wider">
                Patna Cloud Kitchen
              </h2>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <span className="text-xl">📍</span>
                  <div>
                    <strong className="block text-slate-200">Central Kitchen Location</strong>
                    <span className="text-slate-400">Boring Road, Patna, Bihar — 800001</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-xl">⏰</span>
                  <div>
                    <strong className="block text-slate-200">Morning Delivery Window</strong>
                    <span className="text-slate-400">6:00 AM – 9:00 AM daily (7 days a week)</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-xl">📞</span>
                  <div>
                    <strong className="block text-slate-200">Phone Support</strong>
                    <a href="tel:+916207654684" className="text-emerald-400 hover:underline">
                      +91 62076 54684
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-xl">✉️</span>
                  <div>
                    <strong className="block text-slate-200">Email Inquiries</strong>
                    <a href="mailto:admin@thebloomaa.com" className="text-emerald-400 hover:underline">
                      admin@thebloomaa.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <a
                  href="https://wa.me/916207654684?text=Hi%20Thebloomaa%2C%20I%20have%20a%20question%20about%20your%20diet%20plans"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 rounded-2xl font-black text-sm bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <span>💬 Chat on WhatsApp (+91 62076 54684)</span>
                </a>
              </div>
            </div>

            {/* Quick Inquiry Form */}
            <div className="rounded-3xl p-6 sm:p-8 bg-slate-900 border border-slate-800 shadow-xl">
              <h2 className="text-lg font-bold text-slate-100 mb-4">Send a Message</h2>

              {submitted ? (
                <div className="p-6 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-center space-y-2">
                  <span className="text-3xl block">💌</span>
                  <h3 className="font-bold text-sm">Message Received!</h3>
                  <p className="text-xs text-slate-300">
                    Thank you! Our nutrition team will get back to you via WhatsApp or email shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Aman Verma"
                      className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Phone / WhatsApp</label>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="aman@example.com"
                      className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Your Message</label>
                    <textarea
                      rows={3}
                      required
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Tell us about your fitness goal or inquiry..."
                      className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl font-black text-sm bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
                  >
                    Submit Inquiry →
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
