'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-amber-400/70 shadow-md shadow-emerald-500/10 transition-transform group-hover:scale-105 shrink-0 bg-slate-900 ring-2 ring-emerald-500/20">
              <Image
                src="/logo.jpg"
                alt="Bloom your day with BlooMaa"
                fill
                sizes="40px"
                className="object-cover"
                priority
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 leading-tight">
                <span className="text-xl font-black tracking-tight text-slate-100 font-sans">
                  thebloo<span className="text-emerald-400">maa</span>
                </span>
              </div>
              <span className="text-[10px] text-amber-300/90 font-serif italic tracking-wide hidden sm:block leading-none">
                Bloom your day with BlooMaa
              </span>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-7">
            <a href="/#trial" className="text-sm font-semibold transition-colors hover:text-emerald-400 text-slate-100 flex items-center gap-1.5">
              <span>🌱 7D Trial</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                ₹451
              </span>
            </a>
            <Link href="/calculator" className="text-sm font-semibold transition-all hover:text-emerald-300 flex items-center gap-1.5 text-slate-100">
              <span>Bio Calculator</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
                New
              </span>
            </Link>
            <a href="/#how-it-works" className="text-sm font-medium transition-colors hover:text-emerald-400" style={{ color: 'var(--text-muted)' }}>How It Works</a>
            <a href="/#pricing" className="text-sm font-medium transition-colors hover:text-emerald-400" style={{ color: 'var(--text-muted)' }}>Pricing</a>
            <a href="/#faq" className="text-sm font-medium transition-colors hover:text-emerald-400" style={{ color: 'var(--text-muted)' }}>FAQ</a>
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-xl text-slate-200 hover:text-emerald-400 hover:bg-slate-800/80 border border-slate-700/60 hover:border-emerald-500/40 transition-all group"
              title="Customer Login & Sign Up"
            >
              <svg
                className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span>Log In</span>
            </Link>
            <a
              href="/#trial"
              className="px-5 py-2.5 text-sm font-bold rounded-xl text-slate-950 bg-emerald-500 hover:bg-emerald-400 transition-all hover:scale-105 shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
            >
              <span>Get 7D Trial</span>
              <span className="text-[11px] bg-slate-950/20 px-1.5 py-0.5 rounded font-black">₹451</span>
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-200 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 pt-2 space-y-2 border-t border-slate-800 animate-fade-in-up">
            <a href="/#trial" className="flex items-center justify-between px-3 py-2.5 text-sm font-bold rounded-lg text-slate-100 hover:bg-slate-800" onClick={() => setMobileOpen(false)}>
              <span className="flex items-center gap-2">🌱 7D Living Food Trial</span>
              <span className="text-xs px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-black">₹451</span>
            </a>
            <Link href="/calculator" className="flex items-center justify-between px-3 py-2 text-sm font-bold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" onClick={() => setMobileOpen(false)}>
              <span>🧬 Bio Calculator</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-black">NEW</span>
            </Link>
            <a href="/#how-it-works" className="block px-3 py-2 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-800" onClick={() => setMobileOpen(false)}>How It Works</a>
            <a href="/#pricing" className="block px-3 py-2 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-800" onClick={() => setMobileOpen(false)}>Pricing</a>
            <a href="/#faq" className="block px-3 py-2 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-800" onClick={() => setMobileOpen(false)}>FAQ</a>
            <Link
              href="/login"
              className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-lg text-slate-200 hover:bg-slate-800 hover:text-emerald-400"
              onClick={() => setMobileOpen(false)}
            >
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Log In / Sign Up</span>
            </Link>
            <a href="/#trial" className="w-full mt-2 px-5 py-2.5 text-sm font-bold text-center rounded-xl text-slate-950 bg-emerald-500 hover:bg-emerald-400 block shadow-md" onClick={() => setMobileOpen(false)}>
              Claim 7D Trial (₹451) →
            </a>
          </div>
        )}
      </div>
    </nav>
  );
}
