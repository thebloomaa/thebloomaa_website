'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: '📊' },
  { href: '/dashboard/orders', label: 'Order History', icon: '📦' },
  { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-dark)' }}>
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 p-5 fixed top-0 left-0 h-full z-40 bg-brand-cream border-r border-brand-border">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 mb-8 group">
          <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-brand-mustard/70 shadow-md shrink-0 bg-brand-card ring-2 ring-brand-mustard/20">
            <Image
              src="/logo.jpg"
              alt="thebloomaa"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-brand-forest block leading-tight">
              thebloo<span className="text-brand-mustard">maa</span>
            </span>
            <span className="text-[10px] text-brand-forest-muted font-serif italic block">
              Bloom your day with BlooMaa
            </span>
          </div>
        </Link>

        {/* Nav */}
        <nav className="space-y-1 flex-grow">
          {navItems.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: isActive ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                  color: isActive ? 'var(--brand-primary)' : 'var(--text-muted)',
                  border: isActive ? '1px solid rgba(16, 185, 129, 0.15)' : '1px solid transparent',
                }}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Live User Session & Logout */}
        <div className="pt-4 border-t border-brand-border space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold bg-brand-mustard/20 text-brand-mustard border border-brand-mustard/30 shrink-0">
              {(session?.user?.name?.[0] || session?.user?.email?.[0] || 'U').toUpperCase()}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-semibold text-brand-forest truncate">
                {session?.user?.name || 'Patna Subscriber'}
              </p>
              <p className="text-xs text-brand-forest-muted truncate">
                {session?.user?.email || 'Logged In'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full py-2 px-3 rounded-xl text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <span>🚪</span>
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 flex items-center justify-between px-4 glass border-b border-brand-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative w-7 h-7 rounded-full overflow-hidden border border-brand-mustard/70 shrink-0">
            <Image
              src="/logo.jpg"
              alt="thebloomaa"
              fill
              className="object-cover"
            />
          </div>
          <span className="text-base font-black text-brand-forest">
            thebloo<span className="text-brand-mustard">maa</span>
          </span>
        </Link>
        <div className="flex items-center gap-1">
          {navItems.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-sm transition-all"
                style={{
                  background: isActive ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                }}
              >
                {item.icon}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="px-2.5 py-1 rounded-lg text-xs font-bold text-red-600 bg-red-50 border border-red-200 ml-1 cursor-pointer"
            title="Log Out"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 md:ml-64 pt-16 md:pt-8 pb-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
