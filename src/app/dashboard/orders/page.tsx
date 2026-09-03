'use client';

import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';

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
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        if (data.orders) setOrders(data.orders);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch orders:', err);
        setLoading(false);
      });
  }, []);

  const deliveredCount = orders.filter(o => o.status === 'DELIVERED').length;
  const skippedCount = orders.filter(o => o.status === 'SKIPPED').length;
  const failedCount = orders.filter(o => o.status === 'FAILED').length;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black">Order History</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Track all your past and upcoming deliveries.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Orders', value: orders.length.toString(), icon: '📦' },
          { label: 'Delivered', value: deliveredCount.toString(), icon: '✅' },
          { label: 'Skipped', value: skippedCount.toString(), icon: '⏭️' },
          { label: 'Failed', value: failedCount.toString(), icon: '❌' },
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
          {loading ? (
            <div className="text-center py-10 text-[var(--text-muted)]">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-10 text-[var(--text-muted)]">No orders found.</div>
          ) : orders.map((order, i) => {
            const status = statusConfig[order.status] || statusConfig.PENDING;
            const dateStr = format(parseISO(order.deliveryDate), 'MMM d, yyyy');
            const mealName = order.subscription?.product?.name || 'Unknown Meal';
            const timeStr = order.deliveredAt ? format(parseISO(order.deliveredAt), 'h:mm a') : '—';
            
            // Sub string for ID ORD-XXXX
            const shortId = `ORD-${order.id.substring(order.id.length - 4).toUpperCase()}`;

            return (
              <div key={order.id} className="grid grid-cols-2 sm:grid-cols-6 gap-2 sm:gap-4 px-6 py-4 items-center hover:bg-white/[0.02] transition-colors">
                <span className="text-sm font-bold" style={{ fontFamily: 'var(--font-mono)' }}>{shortId}</span>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{dateStr}</span>
                <span className="text-sm font-medium hidden sm:block truncate" style={{ color: 'var(--text-secondary)' }}>{mealName}</span>
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase" style={{ background: status.bg, color: status.color }}>
                    {status.label}
                  </span>
                </div>
                <span className="text-sm hidden sm:block" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{timeStr}</span>
                <span className="text-sm font-semibold text-right" style={{ fontFamily: 'var(--font-mono)', color: order.status === 'SKIPPED' ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                  {order.status === 'SKIPPED' ? '—' : `₹${Math.round(order.subscription?.totalAmount / order.subscription?.totalDays) || 0}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
