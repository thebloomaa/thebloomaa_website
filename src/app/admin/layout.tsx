'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/admin', label: 'Overview', icon: '📊' },
  { href: '/admin/products', label: 'Products', icon: '🥗' },
  { href: '/admin/zones', label: 'Delivery Zones', icon: '📍' },
  { href: '/admin/orders', label: 'Orders', icon: '📦' },
  { href: '/admin/analytics', label: 'Analytics', icon: '📈' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-dark)' }}>
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-60 p-5 fixed top-0 left-0 h-full z-40" style={{ background: '#0B1120', borderRight: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black" style={{ background: 'var(--danger)' }}>A</div>
          <span className="text-lg font-extrabold">Admin Panel</span>
        </div>
        <nav className="space-y-1 flex-grow">
          {navItems.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{ background: isActive ? 'rgba(239, 68, 68, 0.08)' : 'transparent', color: isActive ? '#FCA5A5' : 'var(--text-muted)', border: isActive ? '1px solid rgba(239, 68, 68, 0.12)' : '1px solid transparent' }}>
                <span>{item.icon}</span>{item.label}
              </Link>
            );
          })}
        </nav>
        <Link href="/" className="flex items-center gap-2 px-3 py-2 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
          ← Back to site
        </Link>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 flex items-center justify-between px-4 glass">
        <span className="text-lg font-extrabold">Admin</span>
        <div className="flex gap-1">
          {navItems.map(item => (
            <Link key={item.href} href={item.href}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-sm"
              style={{ background: pathname === item.href ? 'rgba(239, 68, 68, 0.08)' : 'transparent' }}>
              {item.icon}
            </Link>
          ))}
        </div>
      </div>

      <main className="flex-1 md:ml-60 pt-16 md:pt-8 pb-8 px-4 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
