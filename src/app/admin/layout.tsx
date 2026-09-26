'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

const navItems = [
  { href: '/admin', label: 'Overview & Directory', icon: '📊' },
  { href: '/admin/riders', label: 'Delivery Fleet & Riders', icon: '🚴' },
  { href: '/admin/products', label: 'Diet Products', icon: '🥗' },
  { href: '/admin/zones', label: 'Delivery Zones', icon: '📍' },
  { href: '/admin/orders', label: 'Order Dispatch', icon: '📦' },
  { href: '/admin/analytics', label: 'Analytics', icon: '📈' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  const isLoginPage = pathname === '/admin/login';

  // Protect all /admin/* routes other than /admin/login
  useEffect(() => {
    if (!isLoginPage && status === 'unauthenticated') {
      router.replace('/admin/login');
    } else if (
      !isLoginPage &&
      status === 'authenticated' &&
      (session?.user as any)?.role !== 'ADMIN'
    ) {
      router.replace('/admin/login');
    }
  }, [isLoginPage, status, session, router]);

  // If on login page, render full screen without sidebar
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F5EE] text-brand-forest">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-brand-mustard border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-brand-forest-muted font-mono">Verifying Admin Session...</p>
        </div>
      </div>
    );
  }

  // If authenticated but not admin, prevent render while redirecting
  if (status === 'authenticated' && (session?.user as any)?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F5EE] text-brand-forest">
        <div className="text-center space-y-3 p-6 rounded-2xl bg-white border border-red-500/30 shadow-xl max-w-sm">
          <p className="text-sm font-bold text-red-600">Access Restricted</p>
          <p className="text-xs text-brand-forest-muted">Your account is not an authorized Administrator.</p>
          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-red-500 text-white cursor-pointer"
          >
            Sign Out &amp; Switch Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#F8F5EE] text-brand-forest">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 p-5 fixed top-0 left-0 h-full z-40 bg-white border-r border-[#E6E0CF] shadow-xs">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-brand-mustard/40 shrink-0 shadow-xs">
            <Image
              src="/logo.jpg"
              alt="thebloomaa"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <span className="text-sm font-black text-brand-forest block leading-tight">thebloomaa</span>
            <span className="text-[10px] text-brand-mustard font-bold uppercase tracking-wider block">Admin Ops Center</span>
          </div>
        </div>

        <nav className="space-y-1.5 flex-grow">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-brand-mustard/15 text-brand-mustard-hover border border-brand-mustard/30 shadow-xs'
                    : 'text-brand-forest-muted hover:text-brand-forest hover:bg-brand-cream/80 border border-transparent'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Admin Session Profile & Logout */}
        <div className="pt-4 mt-4 border-t border-brand-border space-y-3">
          <div className="p-3 rounded-xl bg-brand-cream/70 border border-brand-border/80">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-black text-brand-mustard tracking-wider">Logged In</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-xs font-mono font-medium text-brand-forest truncate">
              {session?.user?.email || 'Authorized Administrator'}
            </p>
          </div>

          <div className="flex items-center justify-between gap-2 text-xs">
            <Link
              href="/"
              target="_blank"
              className="text-brand-forest-muted hover:text-brand-forest transition-colors text-[11px] font-medium"
            >
              🌐 Site
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="text-red-500 hover:text-red-600 font-bold transition-colors text-[11px] cursor-pointer flex items-center gap-1"
            >
              <span>🚪</span>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 flex items-center justify-between px-4 bg-white/95 backdrop-blur-md border-b border-[#E6E0CF]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-black text-brand-forest">thebloomaa</span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-brand-mustard/20 text-brand-mustard uppercase">
            Admin
          </span>
        </div>
        <div className="flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${
                pathname === item.href ? 'bg-brand-mustard/20 text-brand-mustard-hover' : 'text-brand-forest-muted'
              }`}
            >
              {item.icon}
            </Link>
          ))}
          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs text-red-500 ml-1"
            title="Sign Out"
          >
            🚪
          </button>
        </div>
      </div>

      <main className="flex-1 md:ml-64 pt-16 md:pt-8 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl">
        {children}
      </main>
    </div>
  );
}
