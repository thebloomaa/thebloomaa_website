'use client';

import React from 'react';

export default function AdminDashboard() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black">Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Overview of business operations for today.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Active Subscriptions', value: '487', change: '+12 today', icon: '📈', color: '#6EE7B7' },
          { label: "Today's Orders", value: '342', change: 'Cutoff at 8:30 PM', icon: '📦', color: '#93C5FD' },
          { label: 'Monthly Revenue', value: '₹8.4L', change: '+18% vs last month', icon: '💰', color: '#FCD34D' },
          { label: 'Delivery Rate', value: '97.2%', change: '4 failed today', icon: '🚴', color: '#C4B5FD' },
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
            {[
              { id: 'ORD-0342', customer: 'Arjun M.', meal: 'Chicken Prep', status: 'QUEUED', time: '8:31 PM' },
              { id: 'ORD-0341', customer: 'Priya S.', meal: 'Keto Bowl', status: 'QUEUED', time: '8:31 PM' },
              { id: 'ORD-0340', customer: 'Vikram P.', meal: 'Weight Loss', status: 'DELIVERED', time: '6:42 AM' },
              { id: 'ORD-0339', customer: 'Neha G.', meal: 'Chicken Prep', status: 'DELIVERED', time: '7:15 AM' },
              { id: 'ORD-0338', customer: 'Rahul K.', meal: 'Chicken Prep', status: 'FAILED', time: '7:45 AM' },
            ].map((o, i) => (
              <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ background: 'var(--bg-dark)' }}>
                <div>
                  <p className="text-xs font-bold" style={{ fontFamily: 'var(--font-mono)' }}>{o.id}</p>
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
            ))}
          </div>
        </div>

        {/* Top Performing Meals */}
        <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
          <h3 className="text-sm font-bold mb-4">Top Performing Meals</h3>
          <div className="space-y-4">
            {[
              { name: 'Lean Muscle Chicken Prep', subs: 210, pct: 43, color: '#60A5FA' },
              { name: 'Vegan Keto Power Bowl', subs: 156, pct: 32, color: '#34D399' },
              { name: 'Standard Weight Loss Diet', subs: 121, pct: 25, color: '#FBBF24' },
            ].map((meal, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium">{meal.name}</span>
                  <span className="font-bold" style={{ fontFamily: 'var(--font-mono)', color: meal.color }}>{meal.subs} subs</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${meal.pct}%`, background: meal.color }} />
                </div>
              </div>
            ))}
          </div>

          {/* Zone breakdown */}
          <h3 className="text-sm font-bold mt-6 mb-3">Orders by Zone</h3>
          <div className="space-y-2">
            {[
              { zone: 'Koramangala (560034)', orders: 145 },
              { zone: 'Indiranagar (560038)', orders: 112 },
              { zone: 'HSR Layout (560102)', orders: 85 },
            ].map((z, i) => (
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
