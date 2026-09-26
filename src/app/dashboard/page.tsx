'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';

// Generate calendar from actual orders
const generateDeliveryDays = (orders: any[]) => {
  const days: Record<string, 'DELIVERED' | 'SCHEDULED' | 'SKIPPED'> = {};
  if (!orders) return days;
  orders.forEach((o) => {
    if (!o.deliveryDate) return;
    const key = o.deliveryDate.split('T')[0];
    if (o.status === 'DELIVERED') days[key] = 'DELIVERED';
    else if (o.status === 'SKIPPED') days[key] = 'SKIPPED';
    else if (o.status === 'QUEUED' || o.status === 'PENDING' || o.status === 'PACKED' || o.status === 'OUT_FOR_DELIVERY') {
      days[key] = 'SCHEDULED';
    }
  });
  return days;
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export default function DashboardPage() {
  const [sub, setSub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deliveryDays, setDeliveryDays] = useState<Record<string, string>>({});

  const now = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => {
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }, [now]);

  // 8:30 PM cutoff calculation (20:30)
  const isPastCutoff = useMemo(() => {
    return now.getHours() > 20 || (now.getHours() === 20 && now.getMinutes() >= 30);
  }, [now]);

  const tomorrowFormatted = useMemo(() => {
    const d = new Date(now);
    d.setDate(now.getDate() + 1);
    return d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
  }, [now]);

  const dayAfterTomorrowFormatted = useMemo(() => {
    const d = new Date(now);
    d.setDate(now.getDate() + 2);
    return d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
  }, [now]);

  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear] = useState(now.getFullYear());

  // Modal and action states
  const [skipConfirmDate, setSkipConfirmDate] = useState<string | null>(null);
  const [skipLoading, setSkipLoading] = useState(false);
  const [skipError, setSkipError] = useState<string | null>(null);

  const [pauseModalOpen, setPauseModalOpen] = useState(false);
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [pauseType, setPauseType] = useState<'INDEFINITE' | 'ONE_DAY'>('INDEFINITE');
  const [pauseLoading, setPauseLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard', { cache: 'no-store' });
      const data = await res.json();
      if (data.subscription) {
        const bundleDays =
          data.subscription.bundleType === 'DAYS_30'
            ? 30
            : data.subscription.bundleType === 'DAYS_15'
            ? 15
            : 7;

        setSub({
          id: data.subscription.id,
          meal: data.subscription.product?.name || 'Just Bloom Plan',
          bundleDays,
          deliveriesLeft: data.subscription.deliveriesLeft,
          status: data.subscription.status,
          startDate: data.subscription.startDate,
          nextDeliveryDate: data.subscription.nextDeliveryDate,
          deliveryTime: data.subscription.deliveryTime || '07:00 AM',
          perDay: Math.round((data.subscription.product?.price || 499) / bundleDays),
          orders: data.subscription.orders || [],
          pauseEndDate: data.subscription.pauses?.[0]?.endDate || null,
        });

        setDeliveryDays(generateDeliveryDays(data.subscription.orders));
      } else {
        setSub(null);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

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

  const getDateStr = (day: number) => {
    return `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getStatusStyle = (status: string | undefined) => {
    switch (status) {
      case 'DELIVERED':
        return { bg: 'rgba(16, 185, 129, 0.15)', color: '#6EE7B7', border: 'rgba(16, 185, 129, 0.25)' };
      case 'SCHEDULED':
        return { bg: 'rgba(245, 158, 11, 0.12)', color: '#FCD34D', border: 'rgba(245, 158, 11, 0.2)' };
      case 'SKIPPED':
        return { bg: 'rgba(239, 68, 68, 0.12)', color: '#FCA5A5', border: 'rgba(239, 68, 68, 0.2)' };
      default:
        return { bg: 'transparent', color: 'var(--text-muted)', border: 'transparent' };
    }
  };

  // --- Real Skip Day Handler ---
  const handleConfirmSkipDay = async () => {
    if (!skipConfirmDate || !sub) return;
    setSkipLoading(true);
    setSkipError(null);

    // Find the corresponding queued order for this date
    const matchingOrder = (sub.orders || []).find((o: any) =>
      o.deliveryDate?.startsWith(skipConfirmDate) && (o.status === 'QUEUED' || o.status === 'PENDING')
    );

    if (!matchingOrder) {
      setSkipError('No active scheduled order found for this date.');
      setSkipLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/orders/${matchingOrder.id}/skip`, {
        method: 'POST',
      });
      const data = await res.json();

      if (res.ok) {
        setDeliveryDays((prev) => ({
          ...prev,
          [skipConfirmDate]: 'SKIPPED',
        }));
        setSkipConfirmDate(null);
        setActionFeedback({
          type: 'success',
          text: `Delivery on ${skipConfirmDate} skipped! Your remaining delivery days are safely preserved.`,
        });
        fetchDashboardData();
      } else {
        setSkipError(data.error || 'Failed to skip order.');
      }
    } catch {
      setSkipError('Network error while processing skip request.');
    } finally {
      setSkipLoading(false);
    }
  };

  // --- Real Pause / Resume Handlers ---
  const handlePauseSubscription = async () => {
    if (!sub) return;
    setPauseLoading(true);
    setActionFeedback(null);

    try {
      const res = await fetch(`/api/subscriptions/${sub.id}/pause`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: new Date().toISOString(),
          pauseType: pauseType,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setPauseModalOpen(false);
        setActionFeedback({
          type: 'success',
          text:
            data.message ||
            (pauseType === 'ONE_DAY'
              ? 'Tomorrow’s delivery is paused. Your plan automatically resumes the day after tomorrow!'
              : 'Subscription successfully paused. Morning deliveries are on hold until you tap Resume Plan.'),
        });
        fetchDashboardData();
      } else {
        setActionFeedback({ type: 'error', text: data.error || 'Could not pause subscription.' });
      }
    } catch {
      setActionFeedback({ type: 'error', text: 'Network connection issue while pausing.' });
    } finally {
      setPauseLoading(false);
    }
  };

  const handleResumeSubscription = async () => {
    if (!sub) return;
    setPauseLoading(true);
    setActionFeedback(null);

    try {
      const res = await fetch(`/api/subscriptions/${sub.id}/resume`, {
        method: 'POST',
      });
      const data = await res.json();

      if (res.ok) {
        setResumeModalOpen(false);
        setActionFeedback({
          type: 'success',
          text: data.message || 'Plan resumed! Morning deliveries scheduled.',
        });
        fetchDashboardData();
      } else {
        setActionFeedback({ type: 'error', text: data.error || 'Could not resume subscription.' });
      }
    } catch {
      setActionFeedback({ type: 'error', text: 'Network error while resuming subscription.' });
    } finally {
      setPauseLoading(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-[var(--text-muted)] font-mono text-sm">Loading your diet dashboard...</div>;
  }

  if (!sub) {
    return (
      <div className="max-w-4xl mx-auto text-center p-12">
        <h1 className="text-2xl font-black mb-4">No Active Subscription</h1>
        <p className="text-[var(--text-muted)] mb-8">You don&apos;t have any active diet plans right now.</p>
        <Link
          href="/#trial"
          className="inline-block px-6 py-3 rounded-xl font-bold text-brand-forest transition-all hover:scale-105"
          style={{ background: 'var(--brand-primary)' }}
        >
          Explore Diet Plans &amp; 7D Trial
        </Link>
      </div>
    );
  }

  const isPaused = sub.status === 'PAUSED';
  const progress = Math.min(100, Math.max(0, ((sub.bundleDays - sub.deliveriesLeft) / sub.bundleDays) * 100));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black">My Dashboard</h1>
          <p className="text-xs text-brand-forest-muted mt-1">Manage your living diet subscription and morning deliveries.</p>
        </div>

        {/* WhatsApp Concierge Trigger */}
        <a
          href="https://wa.me/919999999999?text=Hi%20BlooMaa%20Team,%20I%20have%20a%20question%20about%20my%20morning%20diet%20delivery"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-brand-mustard/15 border border-brand-mustard/30 text-brand-mustard-hover hover:bg-brand-mustard/25 transition-all w-fit cursor-pointer"
        >
          <span>💬</span>
          <span>WhatsApp Concierge</span>
        </a>
      </div>

      {/* Global Feedback Alert */}
      {actionFeedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between animate-fade-in ${
            actionFeedback.type === 'success'
              ? 'bg-brand-mustard/15 border border-brand-mustard/30 text-brand-mustard-hover'
              : 'bg-red-500/15 border border-red-500/30 text-red-300'
          }`}
        >
          <span>{actionFeedback.text}</span>
          <button onClick={() => setActionFeedback(null)} className="font-bold cursor-pointer ml-4">✕</button>
        </div>
      )}

      {/* Subscription Status Card */}
      <div
        className="rounded-3xl p-6 sm:p-7 shadow-xl"
        style={{
          background: isPaused
            ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(245, 158, 11, 0.02))'
            : 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(16, 185, 129, 0.02))',
          border: isPaused
            ? '2px solid rgba(245, 158, 11, 0.25)'
            : '2px solid rgba(16, 185, 129, 0.2)',
        }}
      >
        {sub.status === 'PENDING' && (
          <div className="mb-4 p-3.5 rounded-xl bg-brand-mustard/10 border border-brand-mustard/30 text-xs text-brand-forest-muted flex items-center gap-2.5">
            <span className="text-base">✨</span>
            <span>
              <strong>Prep Queued &amp; Scheduled:</strong> Your subscription is confirmed! Kitchen prep begins at 5:00 AM and morning delivery runs 6:00 AM – 9:00 AM.
            </span>
          </div>
        )}

        {isPaused && (
          <div className="mb-4 p-3.5 rounded-xl bg-brand-mustard/15 border border-brand-mustard/30 text-xs text-brand-forest flex items-start gap-2.5">
            <span className="text-base leading-none mt-0.5">⏸️</span>
            <div>
              {sub.pauseEndDate ? (
                <>
                  <strong>1-Day Pause Active:</strong> Tomorrow&apos;s morning delivery is skipped. Deliveries will automatically resume on{' '}
                  <span className="font-bold underline">
                    {new Date(sub.nextDeliveryDate).toLocaleDateString('en-IN', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  . Tap <strong>&quot;Resume Plan&quot;</strong> anytime to restart sooner.
                </>
              ) : (
                <>
                  <strong>Plan Paused Indefinitely:</strong> Morning deliveries are on hold and your remaining {sub.deliveriesLeft} days are safely preserved. Tap <strong>&quot;Resume Plan&quot;</strong> whenever you&apos;re ready to restart.
                </>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{
                  background: isPaused
                    ? '#F59E0B'
                    : sub.status === 'ACTIVE'
                    ? 'var(--brand-primary)'
                    : 'var(--brand-accent)',
                }}
              />
              <span
                className="text-xs font-black uppercase tracking-wider"
                style={{
                  color: isPaused
                    ? '#F59E0B'
                    : sub.status === 'ACTIVE'
                    ? 'var(--brand-primary)'
                    : 'var(--brand-accent)',
                }}
              >
                {sub.status === 'PENDING' ? 'Scheduled & Queued' : isPaused ? '⏸️ PAUSED' : sub.status}
              </span>
            </div>
            <h2 className="text-xl font-black text-brand-forest">{sub.meal}</h2>
            <p className="text-xs text-brand-forest-muted mt-1">
              Next delivery:{' '}
              <span className="font-semibold text-brand-forest">
                {isPaused
                  ? sub.pauseEndDate
                    ? `Auto-resumes ${new Date(sub.nextDeliveryDate).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })} · ${sub.deliveryTime}`
                    : 'Paused (On hold until you tap Resume)'
                  : `${new Date(sub.nextDeliveryDate).toLocaleDateString('en-IN', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })} · ${sub.deliveryTime}`}
              </span>
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-1.5">
            <div className="flex flex-wrap gap-2">
              {isPaused ? (
                <button
                  type="button"
                  onClick={() => setResumeModalOpen(true)}
                  disabled={pauseLoading}
                  className="px-4 py-2 rounded-xl text-xs font-black bg-brand-mustard text-brand-forest hover:bg-brand-mustard transition-all hover:scale-105 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {pauseLoading ? 'Resuming...' : '▶️ Resume Plan'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setPauseModalOpen(true)}
                  disabled={pauseLoading}
                  className="px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 cursor-pointer bg-brand-mustard/15 text-brand-forest-muted border border-brand-border hover:bg-brand-mustard/25"
                >
                  ⏸️ Pause Plan
                </button>
              )}

              <Link
                href="/#trial"
                className="px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 flex items-center bg-brand-cream text-brand-forest-muted border border-brand-border hover:bg-brand-border"
              >
                🔄 Change Plan
              </Link>
            </div>

            {/* Clear 8:30 PM cutoff notice right next to buttons */}
            <div className="text-[11px] text-brand-forest-muted flex items-center gap-1.5 font-medium">
              <span className={`w-2 h-2 rounded-full shrink-0 ${isPastCutoff ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              <span>
                {isPaused
                  ? isPastCutoff
                    ? `Past 8:30 PM: Resumes ${dayAfterTomorrowFormatted}`
                    : `Before 8:30 PM: Resumes tomorrow (${tomorrowFormatted})`
                  : isPastCutoff
                  ? `Past 8:30 PM: Pauses from ${dayAfterTomorrowFormatted}`
                  : `Before 8:30 PM: Pauses from tomorrow (${tomorrowFormatted})`}
              </span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex items-center justify-between text-xs mb-2 text-brand-forest-muted">
          <span>{sub.bundleDays - sub.deliveriesLeft} of {sub.bundleDays} delivered</span>
          <span className="font-bold text-brand-mustard">{sub.deliveriesLeft} days left</span>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden bg-brand-cream">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #10B981, #34D399)' }}
          />
        </div>
        <p className="text-xs font-medium mt-2 font-mono text-brand-forest-muted">
          ₹{sub.perDay}/day · Fresh Living Box drop 6:00 AM – 9:00 AM
        </p>
      </div>

      {/* Delivery Calendar */}
      <div className="rounded-3xl p-6 sm:p-7 bg-brand-card border border-brand-border shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-brand-forest">Delivery Calendar</h3>
            <p className="text-xs text-brand-forest-muted mt-0.5">Tap any scheduled morning drop to skip it before 8:30 PM</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentMonth((m) => Math.max(m - 1, 0))}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm bg-brand-cream text-brand-forest-muted hover:bg-brand-border cursor-pointer"
            >
              ←
            </button>
            <span className="text-xs font-bold min-w-[110px] text-center text-brand-forest">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </span>
            <button
              onClick={() => setCurrentMonth((m) => Math.min(m + 1, 11))}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm bg-brand-cream text-brand-forest-muted hover:bg-brand-border cursor-pointer"
            >
              →
            </button>
          </div>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 gap-1.5 mb-2">
          {DAY_LABELS.map((d) => (
            <div key={d} className="text-center text-xs font-bold py-1 text-brand-forest-muted">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {calendarDays.map((day, i) => {
            if (!day) return <div key={i} className="aspect-square" />;
            const dateStr = getDateStr(day);
            const status = deliveryDays[dateStr];
            const style = getStatusStyle(status);
            const isScheduled = status === 'SCHEDULED';
            const isToday = dateStr === todayStr;

            return (
              <button
                key={i}
                type="button"
                onClick={() => {
                  if (isScheduled) {
                    setSkipConfirmDate(dateStr);
                    setSkipError(null);
                  }
                }}
                disabled={!isScheduled}
                className="relative aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-bold transition-all disabled:cursor-default"
                style={{
                  background: style.bg,
                  color: style.color,
                  border: isToday ? '2px solid var(--brand-primary)' : `1px solid ${style.border}`,
                }}
                title={status ? `${dateStr}: ${status}` : dateStr}
              >
                <span>{day}</span>
                {status === 'DELIVERED' && <span className="text-[9px] mt-0.5 font-bold">✓</span>}
                {status === 'SKIPPED' && <span className="text-[9px] mt-0.5 font-bold">✕</span>}
                {isScheduled && <span className="text-[9px] mt-0.5 text-brand-mustard">●</span>}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mt-5 pt-4 border-t border-brand-border text-xs text-brand-forest-muted">
          {[
            { label: 'Delivered', color: '#6EE7B7', symbol: '✓' },
            { label: 'Scheduled', color: '#FCD34D', symbol: '●' },
            { label: 'Skipped', color: '#FCA5A5', symbol: '✕' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span style={{ color: item.color }} className="font-bold">{item.symbol}</span>
              <span>{item.label}</span>
            </div>
          ))}
          <span className="ml-auto text-[11px] text-brand-forest-muted/70">
            ⏰ 8:30 PM eve cutoff for skips
          </span>
        </div>
      </div>

      {/* Skip Confirmation Modal */}
      {skipConfirmDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-cream/80 backdrop-blur-sm animate-fade-in">
          <div className="rounded-3xl p-6 sm:p-7 w-full max-w-sm bg-brand-card border border-brand-border shadow-2xl animate-fade-in-up">
            <div className="text-center">
              <div className="text-3xl mb-2">⏭️</div>
              <h3 className="text-lg font-bold text-brand-forest">Skip This Delivery?</h3>
              <p className="text-xs text-brand-forest-muted mt-2 leading-relaxed">
                Skip your morning drop on{' '}
                <span className="font-bold text-brand-mustard">
                  {new Date(skipConfirmDate).toLocaleDateString('en-IN', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                . Your plan day is not lost—it will be automatically extended at the end.
              </p>

              {/* 8:30 PM cutoff notice in Skip Modal */}
              <div className="mt-3 p-3 rounded-2xl bg-brand-mustard/10 border border-brand-mustard/25 text-xs text-brand-forest-muted flex items-start gap-2 text-left">
                <span className="text-base leading-none mt-0.5">⏰</span>
                <div>
                  <span className="font-bold text-brand-forest">8:30 PM Evening Cut-off:</span>
                  <p className="text-[11px] mt-0.5 leading-relaxed">
                    Skips must be requested before 8:30 PM on the evening before delivery so the kitchen doesn&apos;t prep the morning harvest.
                  </p>
                </div>
              </div>

              {skipError && (
                <div className="mt-3 p-2.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs text-left">
                  ⚠️ {skipError}
                </div>
              )}

              <div className="flex gap-3 mt-5">
                <button
                  type="button"
                  disabled={skipLoading}
                  onClick={() => setSkipConfirmDate(null)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-brand-cream text-brand-forest-muted hover:bg-brand-border border border-brand-border cursor-pointer"
                >
                  Keep Delivery
                </button>
                <button
                  type="button"
                  disabled={skipLoading}
                  onClick={handleConfirmSkipDay}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-brand-mustard text-brand-forest hover:bg-brand-mustard cursor-pointer disabled:opacity-50"
                >
                  {skipLoading ? 'Skipping...' : 'Confirm Skip'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pause Confirmation Modal */}
      {pauseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="rounded-3xl p-6 sm:p-7 w-full max-w-md bg-brand-card border border-brand-border shadow-2xl animate-fade-in-up">
            <div className="text-left">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl p-2.5 rounded-2xl bg-brand-mustard/15 border border-brand-mustard/30 text-brand-mustard">⏸️</span>
                <div>
                  <h3 className="text-lg font-bold text-brand-forest">Pause Subscription</h3>
                  <p className="text-xs text-brand-forest-muted">Choose your pause duration for morning deliveries</p>
                </div>
              </div>

              {/* Pause duration options */}
              <div className="space-y-3 my-4">
                {/* Option 1: Indefinite */}
                <button
                  type="button"
                  onClick={() => setPauseType('INDEFINITE')}
                  className={`w-full p-3.5 rounded-2xl text-left border transition-all cursor-pointer flex items-start gap-3 ${
                    pauseType === 'INDEFINITE'
                      ? 'border-brand-mustard bg-brand-mustard/10 shadow-sm ring-1 ring-brand-mustard'
                      : 'border-brand-border bg-brand-cream/60 hover:bg-brand-cream'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-1 shrink-0 ${
                    pauseType === 'INDEFINITE' ? 'border-brand-mustard' : 'border-brand-forest-muted/50'
                  }`}>
                    {pauseType === 'INDEFINITE' && (
                      <div className="w-2 h-2 rounded-full bg-brand-mustard" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-brand-forest">Permanent Pause (Until I Resume)</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-brand-mustard/20 text-brand-mustard">Vacation</span>
                    </div>
                    <p className="text-[11px] text-brand-forest-muted mt-1 leading-relaxed">
                      Deliveries remain on hold until you tap &quot;Resume Plan&quot;. All your {sub.deliveriesLeft} remaining days are saved safely.
                    </p>
                  </div>
                </button>

                {/* Option 2: 1-Day Pause */}
                <button
                  type="button"
                  onClick={() => setPauseType('ONE_DAY')}
                  className={`w-full p-3.5 rounded-2xl text-left border transition-all cursor-pointer flex items-start gap-3 ${
                    pauseType === 'ONE_DAY'
                      ? 'border-brand-mustard bg-brand-mustard/10 shadow-sm ring-1 ring-brand-mustard'
                      : 'border-brand-border bg-brand-cream/60 hover:bg-brand-cream'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-1 shrink-0 ${
                    pauseType === 'ONE_DAY' ? 'border-brand-mustard' : 'border-brand-forest-muted/50'
                  }`}>
                    {pauseType === 'ONE_DAY' && (
                      <div className="w-2 h-2 rounded-full bg-brand-mustard" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-brand-forest">Pause for 1 Day</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/15 text-blue-600">Quick 24h</span>
                    </div>
                    <p className="text-[11px] text-brand-forest-muted mt-1 leading-relaxed">
                      {isPastCutoff
                        ? `Skips ${dayAfterTomorrowFormatted}. Deliveries automatically restart the following day. No days lost.`
                        : `Skips tomorrow morning (${tomorrowFormatted}). Deliveries automatically restart ${dayAfterTomorrowFormatted}. No days lost.`}
                    </p>
                  </div>
                </button>
              </div>

              {/* Real-time 8:30 PM Cutoff Alert Box */}
              <div className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${
                isPastCutoff
                  ? 'bg-amber-500/10 border-amber-500/30 text-brand-forest'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-brand-forest'
              }`}>
                <span className="text-base leading-none mt-0.5">{isPastCutoff ? '🌙' : '🟢'}</span>
                <div>
                  <div className="font-bold flex items-center gap-1.5">
                    <span>{isPastCutoff ? 'Past 8:30 PM Kitchen Cut-off' : 'Before 8:30 PM Cut-off (On Time)'}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/5 font-semibold">
                      {isPastCutoff ? 'Starts Day After Tomorrow' : 'Starts Tomorrow Morning'}
                    </span>
                  </div>
                  <p className="text-[11px] text-brand-forest-muted mt-0.5 leading-relaxed">
                    {isPastCutoff
                      ? `Tomorrow's (${tomorrowFormatted}) 5:00 AM harvest is locked. Your pause will take effect starting ${dayAfterTomorrowFormatted}.`
                      : `Pausing now will stop deliveries starting tomorrow morning (${tomorrowFormatted}) at 6:00 AM – 9:00 AM.`}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-5">
                <button
                  type="button"
                  disabled={pauseLoading}
                  onClick={() => setPauseModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-brand-cream text-brand-forest-muted hover:bg-brand-border border border-brand-border cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={pauseLoading}
                  onClick={handlePauseSubscription}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-brand-mustard text-brand-forest hover:bg-brand-mustard cursor-pointer disabled:opacity-50 shadow-md"
                >
                  {pauseLoading
                    ? 'Pausing...'
                    : pauseType === 'ONE_DAY'
                    ? 'Pause 1 Day'
                    : 'Pause Until Resumed'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resume Confirmation Modal */}
      {resumeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="rounded-3xl p-6 sm:p-7 w-full max-w-md bg-brand-card border border-brand-border shadow-2xl animate-fade-in-up">
            <div className="text-left">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl p-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600">▶️</span>
                <div>
                  <h3 className="text-lg font-bold text-brand-forest">Resume Subscription</h3>
                  <p className="text-xs text-brand-forest-muted">Restart your fresh living diet morning deliveries</p>
                </div>
              </div>

              {/* 8:30 PM Cutoff Explainer in Resume Modal */}
              <div className="my-4 space-y-3">
                <div className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${
                  isPastCutoff
                    ? 'bg-amber-500/10 border-amber-500/30 text-brand-forest'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-brand-forest'
                }`}>
                  <span className="text-base leading-none mt-0.5">{isPastCutoff ? '🌙' : '🟢'}</span>
                  <div>
                    <div className="font-bold flex items-center gap-1.5">
                      <span>{isPastCutoff ? 'Past 8:30 PM Kitchen Cut-off' : 'Before 8:30 PM Cut-off (Active)'}</span>
                    </div>
                    <p className="text-[11px] text-brand-forest-muted mt-0.5 leading-relaxed">
                      {isPastCutoff
                        ? `Tomorrow's (${tomorrowFormatted}) 5:00 AM kitchen prep list is already closed. Morning deliveries will restart on ${dayAfterTomorrowFormatted} between 6:00 AM – 9:00 AM.`
                        : `Great timing! Resuming now means your Living Box will be freshly harvested and delivered tomorrow morning (${tomorrowFormatted}) between 6:00 AM – 9:00 AM.`}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-brand-cream/80 border border-brand-border text-xs text-brand-forest-muted space-y-1.5">
                  <div className="flex justify-between font-bold text-brand-forest">
                    <span>Remaining Days in Bundle:</span>
                    <span className="text-brand-mustard">{sub.deliveriesLeft} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Morning Delivery Slot:</span>
                    <span>6:00 AM – 9:00 AM ({sub.deliveryTime || '07:00 AM'})</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-5">
                <button
                  type="button"
                  disabled={pauseLoading}
                  onClick={() => setResumeModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-brand-cream text-brand-forest-muted hover:bg-brand-border border border-brand-border cursor-pointer"
                >
                  Keep Paused
                </button>
                <button
                  type="button"
                  disabled={pauseLoading}
                  onClick={handleResumeSubscription}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-brand-mustard text-brand-forest hover:bg-brand-mustard cursor-pointer disabled:opacity-50 shadow-md"
                >
                  {pauseLoading ? 'Resuming...' : 'Confirm Resume'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Deliveries (Real orders from DB) */}
      <div className="rounded-3xl p-6 sm:p-7 bg-brand-card border border-brand-border shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-brand-forest">Recent Deliveries</h3>
          <Link href="/dashboard/orders" className="text-xs font-bold text-brand-mustard hover:text-brand-mustard-hover">
            View All Orders →
          </Link>
        </div>

        {sub.orders && sub.orders.length > 0 ? (
          <div className="space-y-2.5">
            {sub.orders.slice(0, 5).map((order: any) => {
              const shortId = `ORD-${order.id.slice(-4).toUpperCase()}`;
              const formattedDate = order.deliveryDate
                ? new Date(order.deliveryDate).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Scheduled';

              return (
                <div
                  key={order.id}
                  className="flex items-center justify-between py-3 px-4 rounded-2xl bg-brand-cream/60 border border-brand-border/80 hover:bg-brand-cream transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                        order.status === 'DELIVERED'
                          ? 'bg-brand-mustard/15 text-brand-mustard-hover'
                          : order.status === 'SKIPPED'
                          ? 'bg-red-500/15 text-red-300'
                          : 'bg-blue-500/15 text-blue-300'
                      }`}
                    >
                      {order.status === 'DELIVERED' ? '✓' : order.status === 'SKIPPED' ? '✕' : '●'}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-brand-forest">{shortId}</span>
                        <span className="text-xs text-brand-forest-muted">{formattedDate}</span>
                      </div>
                      <p className="text-[11px] text-brand-forest-muted mt-0.5">
                        {order.status === 'DELIVERED'
                          ? `Delivered by Patna Fleet · ${order.deliveryTime || 'Morning Slot'}`
                          : order.status === 'SKIPPED'
                          ? 'Delivery skipped by user'
                          : `Scheduled for ${order.deliveryTime || '07:00 AM'}`}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      order.status === 'DELIVERED'
                        ? 'bg-brand-mustard/15 text-brand-mustard border border-brand-mustard/30'
                        : order.status === 'SKIPPED'
                        ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                        : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-brand-forest-muted rounded-2xl bg-brand-cream/30 border border-dashed border-brand-border">
            No previous deliveries yet. Your fresh living diet box is scheduled for tomorrow morning!
          </div>
        )}
      </div>
    </div>
  );
}
