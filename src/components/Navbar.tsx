'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-black" style={{ background: 'var(--brand-primary)' }}>
              T
            </div>
            <span className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              TheBloo<span style={{ color: 'var(--brand-primary)' }}>Maa</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm font-medium transition-colors hover:text-emerald-400" style={{ color: 'var(--text-muted)' }}>How It Works</a>
            <a href="#meals" className="text-sm font-medium transition-colors hover:text-emerald-400" style={{ color: 'var(--text-muted)' }}>Our Meals</a>
            <a href="#pricing" className="text-sm font-medium transition-colors hover:text-emerald-400" style={{ color: 'var(--text-muted)' }}>Pricing</a>
            <a href="#faq" className="text-sm font-medium transition-colors hover:text-emerald-400" style={{ color: 'var(--text-muted)' }}>FAQ</a>
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <button className="px-4 py-2 text-sm font-semibold rounded-xl transition-colors" style={{ color: 'var(--text-secondary)' }}>
              Log In
            </button>
            <button className="px-5 py-2.5 text-sm font-bold rounded-xl text-white transition-all hover:scale-105" style={{ background: 'var(--brand-primary)' }}>
              Start Your Plan
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--text-primary)' }}>
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
          <div className="md:hidden pb-4 pt-2 space-y-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
            <a href="#how-it-works" className="block px-3 py-2 text-sm font-medium rounded-lg hover:bg-slate-800" style={{ color: 'var(--text-muted)' }}>How It Works</a>
            <a href="#meals" className="block px-3 py-2 text-sm font-medium rounded-lg hover:bg-slate-800" style={{ color: 'var(--text-muted)' }}>Our Meals</a>
            <a href="#pricing" className="block px-3 py-2 text-sm font-medium rounded-lg hover:bg-slate-800" style={{ color: 'var(--text-muted)' }}>Pricing</a>
            <a href="#faq" className="block px-3 py-2 text-sm font-medium rounded-lg hover:bg-slate-800" style={{ color: 'var(--text-muted)' }}>FAQ</a>
            <button className="w-full mt-2 px-5 py-2.5 text-sm font-bold rounded-xl text-white" style={{ background: 'var(--brand-primary)' }}>
              Start Your Plan
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
