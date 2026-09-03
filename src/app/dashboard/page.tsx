'use client';

import React, { useState, useEffect, useMemo } from 'react';

// Generate calendar from actual orders
const generateDeliveryDays = (orders: any[]) => {
  const days: Record<string, 'DELIVERED' | 'SCHEDULED' | 'SKIPPED'> = {};
  orders.forEach(o => {
    const key = o.deliveryDate.split('T')[0];
    if (o.status === 'DELIVERED') days[key] = 'DELIVERED';
    else if (o.status === 'SKIPPED') days[key] = 'SKIPPED';
    else if (o.status === 'QUEUED' || o.status === 'PENDING') days[key] = 'SCHEDULED';
  });
  return days;
};

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export default function DashboardPage() {
  const [sub, setSub] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [deliveryDays, setDeliveryDays] = useState<Record<string, string>>({});
  const [currentMonth, setCurrentMonth] = useState(8); // September = 8 (0-indexed)
  const [currentYear] = useState(2026);
  const [skipConfirm, setSkipConfirm] = useState<string | null>(null);

  // Generate calendar grid for the month
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDow = (firstDay.getDay() + 6) % 7; // Monday = 0

    const days: (number | null)[] = [];
    for (let i = 0; i < startDow; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(d);
    return days;
  }, [currentMonth, currentYear]);

  const handleSkipDay = (dateStr: string) => {
    setDeliveryDays(prev => ({
      ...prev,
      [dateStr]: 'SKIPPED',
    }));
    setSkipConfirm(null);
  };

  const getDateStr = (day: number) => {
    return `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getStatusStyle = (status: string | undefined) => {
    switch (status) {
      case 'DELIVERED': return { bg: 'rgba(16, 185, 129, 0.15)', color: '#6EE7B7', border: 'rgba(16, 185, 129, 0.25)' };
      case 'SCHEDULED': return { bg: 'rgba(245, 158, 11, 0.12)', color: '#FCD34D', border: 'rgba(245, 158, 11, 0.2)' };
      case 'SKIPPED': return { bg: 'rgba(239, 68, 68, 0.12)', color: '#FCA5A5', border: 'rgba(239, 68, 68, 0.2)' };
      default: return { bg: 'transparent', color: 'var(--text-muted)', border: 'transparent' };
    }
  };

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => {
        if (data.subscription) {
          const bundleDays = data.subscription.bundleType === 'DAYS_30' ? 30 : data.subscription.bundleType === 'DAYS_15' ? 15 : 7;
          setSub({
            id: data.subscription.id,
            meal: data.subscription.product.name,
            bundleDays,
            deliveriesLeft: data.subscription.deliveriesLeft,
            status: data.subscription.status,
            startDate: data.subscription.startDate,
            nextDeliveryDate: data.subscription.nextDeliveryDate,
            deliveryTime: data.subscription.deliveryTime,
            perDay: Math.round(data.subscription.product.price / bundleDays),
            orders: data.subscription.orders,
          });
          setDeliveryDays(generateDeliveryDays(data.subscription.orders));
        }
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-center text-[var(--text-muted)]">Loading dashboard...</div>;

  if (!sub) {
    return (
      <div className="max-w-4xl mx-auto text-center p-12">
        <h1 className="text-2xl font-black mb-4">No Active Subscription</h1>
        <p className="text-[var(--text-muted)] mb-8">You don't have any active meal plans right now.</p>
        <button onClick={() => window.location.href = '/'} className="px-6 py-3 rounded-xl font-bold text-white transition-all hover:scale-105" style={{ background: 'var(--brand-primary)' }}>
          Explore Meal Plans
        </button>
      </div>
    );
  }

  const progress = ((sub.bundleDays - sub.deliveriesLeft) / sub.bundleDays) * 100;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black">My Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Manage your meal subscription and deliveries.</p>
      </div>

      {/* Subscription Status Card */}
      <div className="rounded-2xl p-6 mb-6" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(16, 185, 129, 0.02))', border: '2px solid rgba(16, 185, 129, 0.15)' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block w-2 h-2 rounded-full" style={{ background: sub.status === 'ACTIVE' ? 'var(--brand-primary)' : 'var(--brand-accent)' }} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: sub.status === 'ACTIVE' ? 'var(--brand-primary)' : 'var(--brand-accent)' }}>
                {sub.status}
              </span>
            </div>
            <h2 className="text-lg font-bold">{sub.meal}</h2>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Next delivery: <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{new Date(sub.nextDeliveryDate).toLocaleDateString()} · {sub.deliveryTime}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105" style={{ background: 'rgba(245, 158, 11, 0.12)', color: 'var(--brand-accent)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              ⏸️ Pause Plan
            </button>
            <button className="px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105" style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
              🔄 Change Plan
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex items-center justify-between text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
          <span>{sub.bundleDays - sub.deliveriesLeft} delivered</span>
          <span>{sub.deliveriesLeft} remaining</span>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #10B981, #34D399)' }} />
        </div>
        <p className="text-xs font-medium mt-2" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
          ₹{sub.perDay}/day · {sub.deliveriesLeft} days left
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'This Month', value: `₹${(sub.orders?.filter((o: any) => o.status === 'DELIVERED').length || 0) * sub.perDay}`, icon: '💰' },
          { label: 'Meals Delivered', value: `${sub.orders?.filter((o: any) => o.status === 'DELIVERED').length || 0}`, icon: '🥗' },
          { label: 'Days Skipped', value: `${sub.orders?.filter((o: any) => o.status === 'SKIPPED').length || 0}`, icon: '⏭️' },
          { label: 'Total Orders', value: `${sub.orders?.length || 0}`, icon: '📦' },
        ].map((stat, i) => (
          <div key={i} className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
            <span className="text-lg">{stat.icon}</span>
            <p className="text-lg font-black mt-1" style={{ fontFamily: 'var(--font-mono)' }}>{stat.value}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Delivery Calendar */}
      <div className="rounded-2xl p-6 mb-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold">Delivery Calendar</h3>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentMonth(m => Math.max(m - 1, 0))} className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)' }}>←</button>
            <span className="text-sm font-semibold min-w-[120px] text-center">{MONTH_NAMES[currentMonth]} {currentYear}</span>
            <button onClick={() => setCurrentMonth(m => Math.min(m + 1, 11))} className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)' }}>→</button>
          </div>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAY_LABELS.map(d => (
            <div key={d} className="text-center text-xs font-semibold py-1" style={{ color: 'var(--text-muted)' }}>{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, i) => {
            if (!day) return <div key={i} />;
            const dateStr = getDateStr(day);
            const status = deliveryDays[dateStr];
            const style = getStatusStyle(status);
            const isScheduled = status === 'SCHEDULED';
            const isToday = dateStr === '2026-09-03';

            return (
              <button
                key={i}
                onClick={() => isScheduled && setSkipConfirm(dateStr)}
                disabled={!isScheduled}
                className="relative aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-semibold transition-all disabled:cursor-default"
                style={{
                  background: style.bg,
                  color: style.color,
                  border: isToday ? '2px solid var(--brand-primary)' : `1px solid ${style.border}`,
                }}
                title={status ? `${status}` : ''}
              >
                {day}
                {status === 'DELIVERED' && <span className="text-[8px] mt-0.5">✓</span>}
                {status === 'SKIPPED' && <span className="text-[8px] mt-0.5">✕</span>}
                {isScheduled && <span className="text-[8px] mt-0.5">●</span>}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-5 pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          {[
            { label: 'Delivered', color: '#6EE7B7', symbol: '✓' },
            { label: 'Scheduled', color: '#FCD34D', symbol: '●' },
            { label: 'Skipped', color: '#FCA5A5', symbol: '✕' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span style={{ color: item.color }}>{item.symbol}</span>
              {item.label}
            </div>
          ))}
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>· Tap any scheduled day to skip it</span>
        </div>
      </div>

      {/* Skip Confirmation Modal */}
      {skipConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="rounded-2xl p-6 w-full max-w-sm animate-fade-in-up" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
            <div className="text-center">
              <div className="text-3xl mb-3">⏭️</div>
              <h3 className="text-lg font-bold mb-1">Skip This Day?</h3>
              <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
                Skip delivery on <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{new Date(skipConfirm).toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}</span>. The day will be added back to your bundle.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setSkipConfirm(null)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                  Cancel
                </button>
                <button onClick={() => handleSkipDay(skipConfirm)} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: 'var(--brand-accent)' }}>
                  Skip Day
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Deliveries */}
      <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
        <h3 className="text-lg font-bold mb-4">Recent Deliveries</h3>
        <div className="space-y-3">
          {[
            { date: 'Sep 3, 2026', time: '6:42 AM', status: 'DELIVERED', rider: 'Raju' },
            { date: 'Sep 2, 2026', time: '7:15 AM', status: 'DELIVERED', rider: 'Raju' },
            { date: 'Sep 1, 2026', time: '—', status: 'SKIPPED', rider: '—' },
            { date: 'Aug 31, 2026', time: '6:28 AM', status: 'DELIVERED', rider: 'Raju' },
            { date: 'Aug 30, 2026', time: '7:02 AM', status: 'DELIVERED', rider: 'Raju' },
          ].map((d, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-xl" style={{ background: 'var(--bg-dark)' }}>
              <div className="flex items-center gap-3">
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs"
                  style={{
                    background: d.status === 'DELIVERED' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                    color: d.status === 'DELIVERED' ? '#6EE7B7' : '#FCA5A5',
                  }}
                >
                  {d.status === 'DELIVERED' ? '✓' : '✕'}
                </span>
                <div>
                  <p className="text-sm font-semibold">{d.date}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {d.status === 'DELIVERED' ? `Delivered at ${d.time} by ${d.rider}` : 'Skipped by you'}
                  </p>
                </div>
              </div>
              <span
                className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase"
                style={{
                  background: d.status === 'DELIVERED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: d.status === 'DELIVERED' ? '#6EE7B7' : '#FCA5A5',
                }}
              >
                {d.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
