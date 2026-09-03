'use client';

import React, { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch admin dashboard:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center py-20 text-[var(--text-muted)]">Loading metrics...</div>;
  }

  if (!data || data.error) {
    return <div className="text-center py-20 text-[var(--text-muted)]">Failed to load dashboard. Ensure you are logged in as admin.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black">Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Overview of business operations for today.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Active Subscriptions', value: data.metrics.activeSubs.toString(), change: 'Total active', icon: '📈', color: '#6EE7B7' },
          { label: "Today's Orders", value: data.metrics.todaysOrders.toString(), change: 'Deliveries today', icon: '📦', color: '#93C5FD' },
          { label: 'Monthly Revenue', value: `₹${(data.metrics.monthlyRevenue / 1000).toFixed(1)}k`, change: 'Based on active', icon: '💰', color: '#FCD34D' },
          { label: 'Delivery Rate', value: `${data.metrics.deliveryRate}%`, change: `${data.metrics.failedToday} failed today`, icon: '🚴', color: '#C4B5FD' },
        ].map((m, i) => (
          <div key={i} className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
            <div className="flex items-start justify-between mb-3">
              <span className="text-xl">{m.icon}</span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-md" style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)' }}>{m.change}</span>
            </div>
            <p className="text-2xl font-black" style={{ fontFamily: 'var(--font-mono)', color: m.color }}>{m.value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{m.label}</p>
          </div>
        ))}
      </div>

      {/* Two Column: Recent Orders + Top Meals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
          <h3 className="text-sm font-bold mb-4">Recent Orders</h3>
          <div className="space-y-2.5">
            {data.recentOrders.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">No recent orders.</p>
            ) : data.recentOrders.map((o: any, i: number) => {
              // Extract last 4 chars for short ID
              const shortId = `ORD-${o.id.substring(o.id.length - 4).toUpperCase()}`;
              return (
                <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ background: 'var(--bg-dark)' }}>
                  <div>
                    <p className="text-xs font-bold" style={{ fontFamily: 'var(--font-mono)' }}>{shortId}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{o.customer} · {o.meal}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-0.5 rounded-md text-[9px] font-bold uppercase" style={{
                      background: o.status === 'DELIVERED' ? 'rgba(16,185,129,0.1)' : o.status === 'FAILED' ? 'rgba(239,68,68,0.1)' : 'rgba(96,165,250,0.1)',
                      color: o.status === 'DELIVERED' ? '#6EE7B7' : o.status === 'FAILED' ? '#FCA5A5' : '#93C5FD',
                    }}>{o.status}</span>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{o.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Performing Meals */}
        <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
          <h3 className="text-sm font-bold mb-4">Top Performing Meals</h3>
          <div className="space-y-4">
            {data.topMeals.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">No active subscriptions yet.</p>
            ) : data.topMeals.map((meal: any, i: number) => {
              const colors = ['#60A5FA', '#34D399', '#FBBF24'];
              const color = colors[i % colors.length];
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium truncate mr-2">{meal.name}</span>
                    <span className="font-bold flex-shrink-0" style={{ fontFamily: 'var(--font-mono)', color }}>{meal.subs} subs</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${meal.pct}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Zone breakdown */}
          <h3 className="text-sm font-bold mt-6 mb-3">Orders by Zone</h3>
          <div className="space-y-2">
            {data.topZones.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">No orders today.</p>
            ) : data.topZones.map((z: any, i: number) => (
              <div key={i} className="flex justify-between items-center py-2 px-3 rounded-lg" style={{ background: 'var(--bg-dark)' }}>
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>📍 {z.zone}</span>
                <span className="text-xs font-bold" style={{ fontFamily: 'var(--font-mono)' }}>{z.orders}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
