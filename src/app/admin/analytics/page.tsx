'use client';

import React from 'react';

// Mock analytics data
const metrics = [
  { label: 'Total Revenue (30d)', value: '₹4.2L', trend: '+12%', positive: true },
  { label: 'Active Subscribers', value: '487', trend: '+5%', positive: true },
  { label: 'Churn Rate', value: '3.2%', trend: '-0.5%', positive: true },
  { label: 'CAC (Customer Acq Cost)', value: '₹450', trend: '+₹50', positive: false },
];

const churnReasons = [
  { reason: 'Moving out of city', percentage: 40 },
  { reason: 'Too expensive', percentage: 25 },
  { reason: 'Diet change', percentage: 20 },
  { reason: 'Delivery issues', percentage: 15 },
];

export default function AdminAnalyticsPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black">Analytics</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Deep dive into retention, revenue, and growth.</p>
      </div>

      {/* Top Level Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((m, i) => (
          <div key={i} className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
            <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{m.label}</p>
            <div className="flex items-end gap-3">
              <p className="text-2xl font-black" style={{ fontFamily: 'var(--font-mono)' }}>{m.value}</p>
              <span className="text-xs font-bold mb-1" style={{ color: m.positive ? '#6EE7B7' : '#FCA5A5' }}>
                {m.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Mock Chart: Active Subs over time */}
        <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
          <h3 className="text-sm font-bold mb-6">Active Subscriptions (Last 6 Months)</h3>
          <div className="h-48 flex items-end justify-between gap-2">
            {[120, 180, 250, 310, 420, 487].map((val, i) => (
              <div key={i} className="w-full flex flex-col items-center gap-2">
                <div className="w-full rounded-t-sm transition-all hover:opacity-80" style={{ height: `${(val / 500) * 100}%`, background: 'linear-gradient(180deg, var(--brand-primary) 0%, rgba(16, 185, 129, 0.2) 100%)' }} />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'][i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Churn Breakdown */}
        <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
          <h3 className="text-sm font-bold mb-6">Churn Reason Breakdown</h3>
          <div className="space-y-4">
            {churnReasons.map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span style={{ color: 'var(--text-secondary)' }}>{item.reason}</span>
                  <span className="font-bold" style={{ fontFamily: 'var(--font-mono)' }}>{item.percentage}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
                  <div className="h-full rounded-full" style={{ width: `${item.percentage}%`, background: 'var(--danger)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
