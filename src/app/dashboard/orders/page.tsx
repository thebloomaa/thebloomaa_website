'use client';

import React from 'react';

// Mock order data
const orders = [
  { id: 'ORD-0008', date: 'Sep 3, 2026', meal: 'Lean Muscle Chicken Prep', status: 'DELIVERED', time: '6:42 AM', rider: 'Raju', amount: 280 },
  { id: 'ORD-0007', date: 'Sep 2, 2026', meal: 'Lean Muscle Chicken Prep', status: 'DELIVERED', time: '7:15 AM', rider: 'Raju', amount: 280 },
  { id: 'ORD-0006', date: 'Sep 1, 2026', meal: 'Lean Muscle Chicken Prep', status: 'SKIPPED', time: '—', rider: '—', amount: 0 },
  { id: 'ORD-0005', date: 'Aug 31, 2026', meal: 'Lean Muscle Chicken Prep', status: 'DELIVERED', time: '6:28 AM', rider: 'Raju', amount: 280 },
  { id: 'ORD-0004', date: 'Aug 30, 2026', meal: 'Lean Muscle Chicken Prep', status: 'DELIVERED', time: '7:02 AM', rider: 'Raju', amount: 280 },
  { id: 'ORD-0003', date: 'Aug 29, 2026', meal: 'Lean Muscle Chicken Prep', status: 'DELIVERED', time: '6:55 AM', rider: 'Raju', amount: 280 },
  { id: 'ORD-0002', date: 'Aug 28, 2026', meal: 'Lean Muscle Chicken Prep', status: 'FAILED', time: '—', rider: 'Raju', amount: 280 },
  { id: 'ORD-0001', date: 'Aug 27, 2026', meal: 'Lean Muscle Chicken Prep', status: 'DELIVERED', time: '6:33 AM', rider: 'Raju', amount: 280 },
];

const statusConfig: Record<string, { bg: string; color: string; label: string }> = {
  DELIVERED: { bg: 'rgba(16, 185, 129, 0.1)', color: '#6EE7B7', label: 'Delivered' },
  SKIPPED: { bg: 'rgba(245, 158, 11, 0.1)', color: '#FCD34D', label: 'Skipped' },
  FAILED: { bg: 'rgba(239, 68, 68, 0.1)', color: '#FCA5A5', label: 'Failed' },
  QUEUED: { bg: 'rgba(96, 165, 250, 0.1)', color: '#93C5FD', label: 'Queued' },
  PACKED: { bg: 'rgba(168, 85, 247, 0.1)', color: '#C4B5FD', label: 'Packed' },
  OUT_FOR_DELIVERY: { bg: 'rgba(245, 158, 11, 0.1)', color: '#FCD34D', label: 'Out for Delivery' },
  PENDING: { bg: 'rgba(148, 163, 184, 0.1)', color: '#94A3B8', label: 'Pending' },
};

export default function OrdersPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black">Order History</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Track all your past and upcoming deliveries.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Orders', value: '8', icon: '📦' },
          { label: 'Delivered', value: '6', icon: '✅' },
          { label: 'Skipped', value: '1', icon: '⏭️' },
          { label: 'Failed', value: '1', icon: '❌' },
        ].map((stat, i) => (
          <div key={i} className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
            <span className="text-lg">{stat.icon}</span>
            <p className="text-xl font-black mt-1" style={{ fontFamily: 'var(--font-mono)' }}>{stat.value}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
        {/* Desktop header */}
        <div className="hidden sm:grid grid-cols-6 gap-4 px-6 py-3 text-xs font-bold uppercase tracking-wider" style={{ background: 'var(--bg-dark)', color: 'var(--text-muted)' }}>
          <span>Order ID</span>
          <span>Date</span>
          <span>Meal</span>
          <span>Status</span>
          <span>Time</span>
          <span className="text-right">Amount</span>
        </div>

        {/* Rows */}
        <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
          {orders.map((order, i) => {
            const status = statusConfig[order.status] || statusConfig.PENDING;
            return (
              <div key={i} className="grid grid-cols-2 sm:grid-cols-6 gap-2 sm:gap-4 px-6 py-4 items-center hover:bg-white/[0.02] transition-colors">
                <span className="text-sm font-bold" style={{ fontFamily: 'var(--font-mono)' }}>{order.id}</span>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{order.date}</span>
                <span className="text-sm font-medium hidden sm:block" style={{ color: 'var(--text-secondary)' }}>{order.meal}</span>
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase" style={{ background: status.bg, color: status.color }}>
                    {status.label}
                  </span>
                </div>
                <span className="text-sm hidden sm:block" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{order.time}</span>
                <span className="text-sm font-semibold text-right" style={{ fontFamily: 'var(--font-mono)', color: order.status === 'SKIPPED' ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                  {order.status === 'SKIPPED' ? '—' : `₹${order.amount}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
