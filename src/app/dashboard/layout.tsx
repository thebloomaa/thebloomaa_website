'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: '📊' },
  { href: '/dashboard/orders', label: 'Order History', icon: '📦' },
  { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-dark)' }}>
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 p-5 fixed top-0 left-0 h-full z-40" style={{ background: '#0B1120', borderRight: '1px solid var(--border-subtle)' }}>
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-black" style={{ background: 'var(--brand-primary)' }}>
            T
          </div>
          <span className="text-xl font-extrabold tracking-tight">
            TheBloo<span style={{ color: 'var(--brand-primary)' }}>Maa</span>
          </span>
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

        {/* User */}
        <div className="pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: 'var(--bg-surface)', color: 'var(--brand-primary)' }}>
              R
            </div>
            <div>
              <p className="text-sm font-semibold">Rahul K.</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>+91 98765 43210</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 flex items-center justify-between px-4 glass">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black" style={{ background: 'var(--brand-primary)' }}>T</div>
          <span className="text-lg font-extrabold">TheBloo<span style={{ color: 'var(--brand-primary)' }}>Maa</span></span>
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
