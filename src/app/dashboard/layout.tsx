'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

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
      <aside className="hidden md:flex flex-col w-64 p-5 fixed top-0 left-0 h-full z-40 bg-slate-950 border-r border-slate-800">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 mb-8 group">
          <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-amber-400/70 shadow-md shrink-0 bg-slate-900 ring-2 ring-emerald-500/20">
            <Image
              src="/logo.jpg"
              alt="thebloomaa"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-slate-100 block leading-tight">
              thebloo<span className="text-emerald-400">maa</span>
            </span>
            <span className="text-[10px] text-amber-300 font-serif italic block">
              Bloom your life with BlooMaa
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

        {/* Live User Session */}
        <div className="pt-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
              {(session?.user?.name?.[0] || session?.user?.email?.[0] || 'U').toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-slate-100 truncate">
                {session?.user?.name || 'Patna Subscriber'}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {session?.user?.email || 'Logged In'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 flex items-center justify-between px-4 glass border-b border-slate-800">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative w-7 h-7 rounded-full overflow-hidden border border-amber-400/70 shrink-0">
            <Image
              src="/logo.jpg"
              alt="thebloomaa"
              fill
              className="object-cover"
            />
          </div>
          <span className="text-base font-black text-slate-100">
            thebloo<span className="text-emerald-400">maa</span>
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
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 md:ml-64 pt-16 md:pt-8 pb-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
