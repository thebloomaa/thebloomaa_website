'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-200 ${mobileOpen ? 'bg-brand-cream/98 border-b border-brand-border shadow-2xl' : 'glass-nav'}`}>
      <div className="relative z-50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-brand-mustard/70 shadow-md shadow-brand-mustard/10 transition-transform group-hover:scale-105 shrink-0 bg-brand-card ring-2 ring-brand-mustard/20">
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
                <span className="text-xl font-black tracking-tight text-brand-forest font-sans">
                  thebloo<span className="text-brand-mustard">maa</span>
                </span>
              </div>
              <span className="text-[10px] text-brand-forest-muted font-serif italic tracking-wide hidden sm:block leading-none">
                Bloom your day with BlooMaa
              </span>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-7">
            <Link href="/#trial" className="text-sm font-semibold transition-colors hover:text-brand-mustard text-brand-forest flex items-center gap-1.5">
              <span>🌱 7D Trial</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-brand-mustard/20 text-brand-forest border border-brand-mustard/30">
                ₹451
              </span>
            </Link>
            <Link href="/calculator" className="text-sm font-semibold transition-all hover:text-brand-mustard-hover flex items-center gap-1.5 text-brand-forest">
              <span>Bio Calculator</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-brand-mustard/20 text-brand-forest border border-brand-mustard/30 animate-pulse">
                New
              </span>
            </Link>
            <Link href="/#how-it-works" className="text-sm font-medium transition-colors hover:text-brand-mustard" style={{ color: 'var(--text-muted)' }}>How It Works</Link>
            <Link href="/#pricing" className="text-sm font-medium transition-colors hover:text-brand-mustard" style={{ color: 'var(--text-muted)' }}>Pricing</Link>
            <Link href="/#faq" className="text-sm font-medium transition-colors hover:text-brand-mustard" style={{ color: 'var(--text-muted)' }}>FAQ</Link>
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            {session?.user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-xl text-brand-forest hover:text-brand-mustard bg-brand-card/90 hover:bg-brand-cream border border-brand-mustard/30 transition-all group shadow-sm"
                  title="Go to Subscriber Dashboard"
                >
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black bg-brand-mustard text-brand-forest">
                    {(session.user.name?.[0] || session.user.email?.[0] || 'U').toUpperCase()}
                  </div>
                  <span className="max-w-[110px] truncate">
                    {session.user.name?.split(' ')[0] || 'Dashboard'}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="p-2 rounded-xl text-brand-forest-muted hover:text-red-400 hover:bg-brand-cream/80 transition-all cursor-pointer"
                  title="Log Out"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-xl text-brand-forest hover:text-brand-mustard hover:bg-brand-cream/80 border border-brand-border/60 hover:border-brand-mustard/40 transition-all group"
                title="Customer Login & Sign Up"
              >
                <svg
                  className="w-4 h-4 text-brand-mustard group-hover:scale-110 transition-transform"
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
            )}

            <Link
              href="/#trial"
              className="px-5 py-2.5 text-sm font-bold rounded-xl text-brand-forest bg-brand-mustard hover:bg-brand-mustard transition-all hover:scale-105 shadow-md shadow-brand-mustard/20 flex items-center gap-1.5"
            >
              <span>Get 7D Trial</span>
              <span className="text-[11px] bg-brand-cream/20 px-1.5 py-0.5 rounded font-black">₹451</span>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2.5 rounded-xl text-brand-forest hover:text-brand-forest bg-brand-card/80 border border-brand-border active:scale-95 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
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

        {/* Mobile menu elevated drawer */}
        {mobileOpen && (
          <div className="md:hidden pb-4 pt-2 animate-fade-in-up">
            <div className="p-3.5 rounded-2xl bg-brand-card/98 border border-brand-border shadow-2xl space-y-2">
              {session?.user && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-brand-cream border border-brand-mustard/20 mb-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black bg-brand-mustard text-brand-forest shrink-0">
                      {(session.user.name?.[0] || session.user.email?.[0] || 'U').toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-brand-forest truncate">{session.user.name || 'Subscriber'}</p>
                      <p className="text-[10px] text-brand-forest-muted truncate">{session.user.email}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      signOut({ callbackUrl: '/' });
                    }}
                    className="text-xs text-red-400 hover:text-red-300 font-semibold px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 min-h-[36px]"
                  >
                    Log Out
                  </button>
                </div>
              )}

              <Link
                href="/#trial"
                className="flex items-center justify-between px-3.5 py-3 text-sm font-bold rounded-xl text-brand-forest bg-brand-cream/80 hover:bg-brand-cream border border-brand-border/60 min-h-[44px]"
                onClick={() => setMobileOpen(false)}
              >
                <span className="flex items-center gap-2">🌱 7D Fresh Nutrition Trial</span>
                <span className="text-xs px-2.5 py-1 rounded bg-brand-mustard text-brand-forest font-black">₹451</span>
              </Link>
              <Link
                href="/calculator"
                className="flex items-center justify-between px-3.5 py-3 text-sm font-bold rounded-xl bg-brand-mustard/10 text-brand-mustard border border-brand-mustard/30 min-h-[44px]"
                onClick={() => setMobileOpen(false)}
              >
                <span className="flex items-center gap-2">🧬 Bio Calculator</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-brand-mustard text-brand-forest font-black">NEW</span>
              </Link>
              <Link
                href="/#how-it-works"
                className="block px-3.5 py-2.5 text-sm font-medium rounded-xl text-brand-forest-muted hover:bg-brand-cream hover:text-brand-forest min-h-[44px] flex items-center"
                onClick={() => setMobileOpen(false)}
              >
                How It Works
              </Link>
              <Link
                href="/#pricing"
                className="block px-3.5 py-2.5 text-sm font-medium rounded-xl text-brand-forest-muted hover:bg-brand-cream hover:text-brand-forest min-h-[44px] flex items-center"
                onClick={() => setMobileOpen(false)}
              >
                Pricing &amp; Plans
              </Link>
              <Link
                href="/#faq"
                className="block px-3.5 py-2.5 text-sm font-medium rounded-xl text-brand-forest-muted hover:bg-brand-cream hover:text-brand-forest min-h-[44px] flex items-center"
                onClick={() => setMobileOpen(false)}
              >
                Frequently Asked Questions
              </Link>

              {session?.user ? (
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2.5 px-3.5 py-3 text-sm font-bold rounded-xl text-brand-mustard bg-brand-mustard/15 border border-brand-mustard/30 min-h-[44px]"
                  onClick={() => setMobileOpen(false)}
                >
                  <span>📊 My Subscriber Dashboard</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2.5 px-3.5 py-3 text-sm font-medium rounded-xl text-brand-forest hover:bg-brand-cream hover:text-brand-mustard border border-brand-border min-h-[44px]"
                  onClick={() => setMobileOpen(false)}
                >
                  <svg className="w-4 h-4 text-brand-mustard" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Log In / Sign Up</span>
                </Link>
              )}

              <Link
                href="/#trial"
                className="w-full mt-2 py-3 text-sm font-black text-center rounded-xl text-brand-forest bg-brand-mustard hover:bg-brand-mustard block shadow-lg shadow-brand-mustard/20 min-h-[44px] flex items-center justify-center"
                onClick={() => setMobileOpen(false)}
              >
                Claim 7D Trial (₹451) →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Backdrop overlay to close mobile menu when tapping outside */}
      {mobileOpen && (
        <div
          className="fixed inset-0 top-16 bg-brand-cream/60 backdrop-blur-sm z-30 md:hidden animate-fade-in"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
    </nav>
  );
}
