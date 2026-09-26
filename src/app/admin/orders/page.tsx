'use client';

import React, { useState, useEffect, useCallback } from 'react';

type OrderStatus = 'QUEUED' | 'RIDER_DELIVERED' | 'DELIVERED' | 'FAILED' | 'SKIPPED';
type DeliveryDateMode = 'TODAY' | 'TOMORROW' | 'CUSTOM';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [allRiders, setAllRiders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Delivery Date Mode
  const [deliveryDateMode, setDeliveryDateMode] = useState<DeliveryDateMode>('TODAY');
  const [customDeliveryDate, setCustomDeliveryDate] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [autoAssigning, setAutoAssigning] = useState(false);
  const [autoAssignMsg, setAutoAssignMsg] = useState<string | null>(null);

  // Fail dialog state
  const [failingOrderId, setFailingOrderId] = useState<string | null>(null);
  const [failingOrderName, setFailingOrderName] = useState<string>('');
  const [failReason, setFailReason] = useState('Customer unreachable / phone switched off');
  const [customFailReason, setCustomFailReason] = useState('');
  const [submittingFail, setSubmittingFail] = useState(false);

  // Receipt preview
  const [previewReceipt, setPreviewReceipt] = useState<{
    url: string;
    orderId: string;
    customerName: string;
    customerPhone: string;
    utr?: string | null;
    mode?: string;
  } | null>(null);

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const getTargetDeliveryDateStr = useCallback(
    (mode: DeliveryDateMode, custom: string): string => {
      if (mode === 'CUSTOM' && custom) return custom;
      const base = new Date();
      if (mode === 'TOMORROW') base.setDate(base.getDate() + 1);
      const istMs = base.getTime() + 5.5 * 60 * 60 * 1000;
      const d = new Date(istMs);
      const yyyy = d.getUTCFullYear();
      const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
      const dd = String(d.getUTCDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    },
    []
  );

  const parsePaymentInfo = (order: any) => {
    const note = order.deliveryNote || '';
    let screenshotUrl: string | null = null;
    const proofMatch = note.match(/PROOF:\s*([^\s|\]]+)/);
    if (proofMatch) screenshotUrl = proofMatch[1];

    let mode = 'UPI Payment';
    const modeMatch = note.match(/Mode:\s*([^|\]]+)/);
    if (modeMatch) mode = modeMatch[1].trim();

    let utr = order.subscription?.utr || null;
    const utrMatch = note.match(/UTR:\s*([^|\]]+)/);
    if (utrMatch) utr = utrMatch[1].trim();

    return { mode, utr, screenshotUrl };
  };

  const displayNote = (note: string | null): string => {
    if (!note) return '';
    return note
      .replace(/PROOF:\s*data:[^\s|\]]+/g, 'PROOF: [📸 Screenshot]')
      .replace(/\s*\|\s*$/, '')
      .trim();
  };

  const formatPlanName = (rawName?: string | null) => {
    if (!rawName) return 'Fresh Bloom Prep';
    return rawName
      .replace(/7D\s*Trial/gi, 'Trial')
      .replace(/7-DAY\s*WEEKLY\s*PLAN\s*\(7\s*Days\)/gi, 'Weekly Plan')
      .replace(/7-Day/gi, 'Weekly')
      .trim();
  };

  const extractMapsUrl = (street: string): string | null => {
    const mapsMatch = street.match(/https:\/\/maps\.google\.com\/\?q=[^\]\s]+/);
    if (mapsMatch) return mapsMatch[0];
    const gpsMatch = street.match(/📍 GPS:\s*([0-9.-]+),\s*([0-9.-]+)/);
    if (gpsMatch) return `https://www.google.com/maps/search/?api=1&query=${gpsMatch[1]},${gpsMatch[2]}`;
    return null;
  };

  const cleanStreet = (street: string): string =>
    street.replace(/\s*\[📍 GPS:.*?\]/, '').replace(/https:\/\/maps\.google\.com\/\?q=[^\]\s]+/, '').trim();

  // ─── Data Fetching ────────────────────────────────────────────────────────

  const fetchOrders = useCallback(
    async (mode?: DeliveryDateMode, custom?: string) => {
      const resolvedMode = mode ?? deliveryDateMode;
      const resolvedCustom = custom ?? customDeliveryDate;
      const dateStr = getTargetDeliveryDateStr(resolvedMode, resolvedCustom);
      setRefreshing(true);
      try {
        const res = await fetch(`/api/admin/orders?status=${statusFilter}&deliveryDate=${dateStr}`);
        const data = await res.json();
        if (data.orders) setOrders(data.orders);
        if (data.allRiders) setAllRiders(data.allRiders);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [deliveryDateMode, customDeliveryDate, statusFilter, getTargetDeliveryDateStr]
  );

  // On mount: smart 10pm default
  useEffect(() => {
    const hourIST = new Date(Date.now() + 5.5 * 60 * 60 * 1000).getUTCHours();
    const initialMode: DeliveryDateMode = hourIST >= 22 ? 'TOMORROW' : 'TODAY';
    setDeliveryDateMode(initialMode);
    fetchOrders(initialMode, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch when status filter changes
  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  // Auto-refresh every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => fetchOrders(), 2 * 60 * 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveryDateMode, customDeliveryDate, statusFilter]);

  // ─── Action Handlers ──────────────────────────────────────────────────────

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: newStatus,
                  subscription:
                    newStatus === 'DELIVERED' && o.subscription
                      ? { ...o.subscription, status: 'ACTIVE' }
                      : o.subscription,
                }
              : o
          )
        );
      }
    } catch {
      alert('Failed to update status');
    }
  };

  const handleActivateSubscription = async (orderId: string) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, activateSubscription: true }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId && o.subscription
              ? { ...o, subscription: { ...o.subscription, status: 'ACTIVE' } }
              : o
          )
        );
      }
    } catch {
      alert('Failed to activate subscription');
    }
  };

  const handleDoubleVerify = async (orderId: string) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, doubleVerify: true }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: 'DELIVERED',
                  adminVerifiedAt: new Date().toISOString(),
                  subscription: o.subscription
                    ? { ...o.subscription, status: 'ACTIVE' }
                    : o.subscription,
                }
              : o
          )
        );
      }
    } catch {
      alert('Failed to double-verify order');
    }
  };

  const handleAssignRider = async (orderId: string, riderId: string) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, riderId: riderId || null }),
      });
      if (res.ok) {
        const selectedRider = allRiders.find((r) => r.id === riderId) || null;
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, rider: selectedRider, riderId: riderId || null } : o))
        );
      }
    } catch {
      alert('Failed to assign rider');
    }
  };

  const handleAutoAssign = async () => {
    setAutoAssigning(true);
    setAutoAssignMsg(null);
    try {
      const res = await fetch('/api/admin/riders/auto-assign', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setAutoAssignMsg(`Auto-routed ${data.assignedCount} order(s) by zone!`);
        fetchOrders();
      } else {
        setAutoAssignMsg(data.error || 'Failed to auto-assign orders.');
      }
    } catch {
      setAutoAssignMsg('Network error while auto-assigning.');
    } finally {
      setAutoAssigning(false);
    }
  };

  const handleConfirmFail = async () => {
    if (!failingOrderId) return;
    const finalReason = failReason === 'OTHER' ? customFailReason.trim() : failReason;
    if (!finalReason) {
      alert('Please select or type a failure reason.');
      return;
    }
    setSubmittingFail(true);
    try {
      const order = orders.find((o) => o.id === failingOrderId);
      const existingNote = order?.deliveryNote ? `${order.deliveryNote} | ` : '';
      const updatedNote = `${existingNote}⚠️ FAILED: ${finalReason}`;
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: failingOrderId, status: 'FAILED', deliveryNote: updatedNote }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === failingOrderId ? { ...o, status: 'FAILED', deliveryNote: updatedNote } : o
          )
        );
        setFailingOrderId(null);
        setFailReason('Customer unreachable / phone switched off');
        setCustomFailReason('');
      }
    } catch {
      alert('Failed to mark order as failed');
    } finally {
      setSubmittingFail(false);
    }
  };

  // ─── Derived State ────────────────────────────────────────────────────────

  const filteredOrders = orders.filter((o) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.id.toLowerCase().includes(q) ||
      (o.user?.name && o.user.name.toLowerCase().includes(q)) ||
      (o.user?.phone && o.user.phone.includes(q)) ||
      (o.address?.pincode && o.address.pincode.includes(q)) ||
      (o.subscription?.product?.name && o.subscription.product.name.toLowerCase().includes(q))
    );
  });

  // Summary counters
  const unassignedCount = orders.filter((o) => !o.riderId && o.status !== 'DELIVERED' && o.status !== 'FAILED').length;
  const needsVerifyCount = orders.filter((o) => o.status === 'RIDER_DELIVERED').length;
  const deliveredCount = orders.filter((o) => o.status === 'DELIVERED').length;
  const failedCount = orders.filter((o) => o.status === 'FAILED').length;

  // Date label helper
  const deliveryDateLabel =
    deliveryDateMode === 'TODAY' && !customDeliveryDate
      ? 'today'
      : deliveryDateMode === 'TOMORROW' && !customDeliveryDate
      ? 'tomorrow'
      : customDeliveryDate
      ? new Date(`${customDeliveryDate}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
      : '';

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-brand-forest">Order Management</h1>
          <p className="text-xs text-brand-forest-muted mt-1">
            View today&apos;s scheduled deliveries, assign riders, verify drops, and prep tomorrow&apos;s manifest.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleAutoAssign}
            disabled={autoAssigning}
            className="px-3.5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-brand-mustard to-brand-mustard hover:opacity-90 text-brand-forest transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
          >
            <span>⚡</span>
            <span>{autoAssigning ? 'Routing...' : 'Auto-Assign by Zone'}</span>
          </button>
          <input
            type="text"
            placeholder="Search customer, phone, PIN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-brand-card border border-brand-border text-xs text-brand-forest placeholder:text-brand-forest-muted/70 focus:outline-none focus:border-brand-mustard w-52"
          />
          <button
            onClick={() => fetchOrders()}
            disabled={refreshing}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-brand-cream hover:bg-brand-border text-brand-forest border border-brand-border transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span className={refreshing ? 'animate-spin inline-block' : ''}>🔄</span>
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* ── Auto-assign feedback ── */}
      {autoAssignMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center justify-between animate-fade-in shadow-xs">
          <span className="font-semibold">✓ {autoAssignMsg}</span>
          <button onClick={() => setAutoAssignMsg(null)} className="font-bold text-emerald-800 cursor-pointer">✕</button>
        </div>
      )}

      {/* ── Summary Action Bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`text-left rounded-2xl p-3 border transition-all cursor-pointer ${
            unassignedCount > 0
              ? 'bg-amber-50 border-amber-300 hover:border-amber-400 shadow-sm'
              : 'bg-brand-card border-brand-border hover:border-brand-mustard/40'
          }`}
        >
          <p className="text-[10px] font-black uppercase tracking-wider text-brand-forest-muted mb-0.5">🚨 Unassigned</p>
          <p className={`text-2xl font-black font-mono ${unassignedCount > 0 ? 'text-amber-700' : 'text-brand-forest-muted'}`}>
            {unassignedCount}
          </p>
          <p className="text-[10px] text-brand-forest-muted mt-0.5">Need a rider</p>
        </button>

        <button
          onClick={() => setStatusFilter('RIDER_DELIVERED')}
          className={`text-left rounded-2xl p-3 border transition-all cursor-pointer ${
            needsVerifyCount > 0
              ? 'bg-yellow-50 border-yellow-300 hover:border-yellow-400 shadow-sm animate-pulse'
              : 'bg-brand-card border-brand-border'
          }`}
        >
          <p className="text-[10px] font-black uppercase tracking-wider text-brand-forest-muted mb-0.5">⏳ Needs Verify</p>
          <p className={`text-2xl font-black font-mono ${needsVerifyCount > 0 ? 'text-yellow-700' : 'text-brand-forest-muted'}`}>
            {needsVerifyCount}
          </p>
          <p className="text-[10px] text-brand-forest-muted mt-0.5">Double-mark needed</p>
        </button>

        <button
          onClick={() => setStatusFilter('DELIVERED')}
          className="text-left rounded-2xl p-3 border border-brand-border bg-brand-card hover:border-brand-mustard/40 transition-all cursor-pointer"
        >
          <p className="text-[10px] font-black uppercase tracking-wider text-brand-forest-muted mb-0.5">✓✓ Delivered</p>
          <p className="text-2xl font-black font-mono text-brand-mustard">{deliveredCount}</p>
          <p className="text-[10px] text-brand-forest-muted mt-0.5">Completed drops</p>
        </button>

        <button
          onClick={() => setStatusFilter('FAILED')}
          className={`text-left rounded-2xl p-3 border transition-all cursor-pointer ${
            failedCount > 0
              ? 'bg-red-50 border-red-200 hover:border-red-300 shadow-sm'
              : 'bg-brand-card border-brand-border'
          }`}
        >
          <p className="text-[10px] font-black uppercase tracking-wider text-brand-forest-muted mb-0.5">❌ Failed</p>
          <p className={`text-2xl font-black font-mono ${failedCount > 0 ? 'text-red-600' : 'text-brand-forest-muted'}`}>
            {failedCount}
          </p>
          <p className="text-[10px] text-brand-forest-muted mt-0.5">Could not deliver</p>
        </button>
      </div>

      {/* ── Status Filter Tabs ── */}
      <div className="flex gap-2 border-b border-brand-border pb-3 overflow-x-auto no-scrollbar">
        {[
          { id: 'ALL', label: 'All Orders' },
          { id: 'QUEUED', label: 'Queued' },
          { id: 'RIDER_DELIVERED', label: `⏳ Rider Delivered (${needsVerifyCount})` },
          { id: 'DELIVERED', label: '✓✓ Double Verified' },
          { id: 'FAILED', label: 'Failed' },
          { id: 'SKIPPED', label: 'Skipped' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === tab.id
                ? 'bg-brand-mustard text-brand-forest shadow-sm'
                : 'bg-brand-card text-brand-forest-muted hover:text-brand-forest border border-brand-border'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Delivery Date Switcher ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-brand-card/90 border border-brand-border">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-brand-forest flex items-center gap-1.5">
            <span className="text-sm">🚚</span>
            <span>Delivery Date:</span>
          </span>

          <div className="flex flex-wrap gap-1.5">
            {([
              { id: 'TODAY' as const, label: "Today's Deliveries" },
              { id: 'TOMORROW' as const, label: '🌙 Tomorrow (Prep Mode)' },
            ] as { id: DeliveryDateMode; label: string }[]).map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => {
                  setDeliveryDateMode(btn.id);
                  setCustomDeliveryDate('');
                  fetchOrders(btn.id, '');
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  deliveryDateMode === btn.id && !customDeliveryDate
                    ? 'bg-brand-mustard text-brand-forest shadow-xs'
                    : 'bg-brand-cream/80 text-brand-forest-muted hover:text-brand-forest border border-brand-border'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-brand-forest-muted">or Pick Date:</span>
            <input
              type="date"
              value={customDeliveryDate}
              onChange={(e) => {
                const val = e.target.value;
                setCustomDeliveryDate(val);
                if (val) {
                  setDeliveryDateMode('CUSTOM');
                  fetchOrders('CUSTOM', val);
                } else {
                  setDeliveryDateMode('TODAY');
                  fetchOrders('TODAY', '');
                }
              }}
              className="px-2.5 py-1 rounded-lg text-xs bg-brand-cream border border-brand-border text-brand-forest focus:outline-none focus:border-brand-mustard font-mono cursor-pointer"
            />
            {customDeliveryDate && (
              <button
                type="button"
                onClick={() => {
                  setCustomDeliveryDate('');
                  setDeliveryDateMode('TODAY');
                  fetchOrders('TODAY', '');
                }}
                className="px-2 py-1 rounded-lg text-[11px] font-bold bg-brand-cream text-brand-forest-muted hover:text-red-500 border border-brand-border cursor-pointer"
              >
                ✕ Clear
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {deliveryDateMode === 'TOMORROW' && !customDeliveryDate && (
            <div className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 flex items-center gap-1.5 animate-pulse">
              <span>🌙</span>
              <span>Prep Mode — Tomorrow&apos;s orders</span>
            </div>
          )}
          <div className="text-xs font-semibold text-brand-mustard bg-brand-mustard/15 px-3 py-1 rounded-full border border-brand-mustard/30 flex items-center gap-1.5">
            <span>📦</span>
            <span className="font-bold font-mono text-brand-forest">{filteredOrders.length}</span>
            <span>order{filteredOrders.length === 1 ? '' : 's'} for {deliveryDateLabel}</span>
          </div>
        </div>
      </div>

      {/* ── Orders Table ── */}
      <div className="rounded-2xl bg-brand-card border border-brand-border overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-brand-mustard border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-brand-forest-muted/70">Loading orders for {deliveryDateLabel}...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <p className="text-brand-forest-muted/70 text-sm font-medium">
              No orders scheduled for delivery on <strong>{deliveryDateLabel}</strong>.
            </p>
            <p className="text-xs text-brand-forest-muted/50">Try switching to a different delivery date above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-brand-cream/80 border-b border-brand-border text-brand-forest-muted uppercase tracking-wider text-[10px] font-black">
                  <th className="p-3.5 w-[175px]">Order / Customer</th>
                  <th className="p-3.5 w-[185px]">Delivery Address</th>
                  <th className="p-3.5 w-[120px]">Diet Item</th>
                  <th className="p-3.5 w-[165px]">Slot &amp; Note</th>
                  <th className="p-3.5 w-[150px]">Assigned Rider</th>
                  <th className="p-3.5 w-[175px]">Status &amp; Payment</th>
                  <th className="p-3.5 text-right w-[155px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/80">
                {filteredOrders.map((order) => {
                  const shortId = `ORD-${order.id.slice(-5).toUpperCase()}`;
                  const isRiderDelivered = order.status === 'RIDER_DELIVERED';
                  const isDelivered = order.status === 'DELIVERED';
                  const paymentInfo = parsePaymentInfo(order);
                  const mapsUrl = order.address?.street ? extractMapsUrl(order.address.street) : null;
                  const streetClean = order.address?.street ? cleanStreet(order.address.street) : 'Local Delivery';
                  const deliveryDateStr = order.deliveryDate
                    ? new Date(order.deliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                    : null;

                  return (
                    <tr key={order.id} className={`hover:bg-brand-cream/40 transition-colors ${isRiderDelivered ? 'bg-yellow-50/30' : ''}`}>

                      {/* Order / Customer */}
                      <td className="p-3.5 align-top">
                        <span className="font-mono font-bold text-brand-forest block text-xs">{shortId}</span>
                        <span className="font-semibold text-brand-forest-muted block mt-0.5 text-[11px]">
                          {order.user?.name || 'Customer'}
                        </span>
                        {deliveryDateStr && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-brand-mustard bg-brand-mustard/10 px-1.5 py-0.5 rounded border border-brand-mustard/20 mt-1">
                            📅 {deliveryDateStr}
                          </span>
                        )}
                        {order.user?.phone ? (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-brand-forest-muted font-mono">📱 {order.user.phone}</span>
                            <a
                              href={`https://wa.me/91${order.user.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] font-bold text-brand-mustard hover:underline"
                            >
                              (WA)
                            </a>
                          </div>
                        ) : (
                          <span className="text-[10px] text-brand-forest-muted/70 block font-mono">No phone</span>
                        )}
                      </td>

                      {/* Delivery Address */}
                      <td className="p-3.5 align-top max-w-[185px]">
                        <p className="font-medium text-brand-forest-muted text-[11px] line-clamp-2">{streetClean}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-black text-brand-mustard uppercase font-mono">
                            PIN: {order.address?.pincode || '800001'}
                          </span>
                          {mapsUrl && (
                            <a
                              href={mapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] font-bold text-brand-mustard hover:underline flex items-center gap-0.5"
                              title="Open in Google Maps"
                            >
                              <span>🗺️</span>
                              <span>Map</span>
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Diet Item */}
                      <td className="p-3.5 align-top">
                        <span className="font-bold text-brand-forest block text-[11px]">
                          {formatPlanName(order.subscription?.product?.name)}
                        </span>
                        <span className="text-[10px] text-brand-forest-muted block mt-0.5">
                          🔥 {order.subscription?.product?.calories || 520} kcal
                        </span>
                        {order.user?.dietaryPreference && (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 mt-1">
                            {order.user.dietaryPreference}
                          </span>
                        )}
                      </td>

                      {/* Slot & Note */}
                      <td className="p-3.5 align-top w-[165px] max-w-[165px]">
                        <span className="inline-block px-2 py-0.5 rounded bg-brand-cream text-brand-forest-muted font-mono text-[10px] mb-1">
                          ⏰ {order.deliveryTime || '07:00 AM'}
                        </span>
                        {order.user?.allergies && order.user.allergies !== 'None' && (
                          <div className="mb-1 p-1.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-[10px] font-bold leading-tight flex items-start gap-1 shadow-xs">
                            <span>⚠️</span>
                            <span className="truncate">Allergies: {order.user.allergies}</span>
                          </div>
                        )}
                        {order.deliveryNote && (
                          <div className="p-1.5 rounded-lg bg-brand-mustard/10 border border-brand-mustard/30 text-brand-forest text-[10px] font-medium cursor-default line-clamp-3 break-words">
                            <span>📝 </span>
                            <span>{displayNote(order.deliveryNote)}</span>
                          </div>
                        )}
                      </td>

                      {/* Assigned Rider */}
                      <td className="p-3.5 align-top">
                        <select
                          value={order.riderId || ''}
                          onChange={(e) => handleAssignRider(order.id, e.target.value)}
                          className={`px-2 py-1 rounded-lg border text-xs font-bold text-brand-forest focus:outline-none focus:border-brand-mustard max-w-[145px] ${
                            !order.riderId
                              ? 'bg-amber-50 border-amber-300 text-amber-800'
                              : 'bg-brand-cream border-brand-border'
                          }`}
                        >
                          <option value="">🚨 Unassigned</option>
                          {allRiders.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name} ({r.vehicleType})
                            </option>
                          ))}
                        </select>
                        {order.rider && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[10px] font-mono text-brand-mustard">📱 {order.rider.phone}</span>
                            <a
                              href={`https://wa.me/91${order.rider.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[9px] font-bold text-brand-mustard hover:underline"
                            >
                              (WA)
                            </a>
                          </div>
                        )}
                      </td>

                      {/* Status & Payment */}
                      <td className="p-3.5 align-top">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider w-fit ${
                              isDelivered
                                ? 'bg-brand-mustard/20 text-brand-mustard border border-brand-mustard/40'
                                : isRiderDelivered
                                ? 'bg-yellow-100 text-yellow-800 border border-yellow-400 animate-pulse'
                                : order.status === 'FAILED'
                                ? 'bg-red-500/15 text-red-600 border border-red-500/30'
                                : 'bg-blue-500/15 text-blue-600 border border-blue-500/30'
                            }`}
                          >
                            {isRiderDelivered
                              ? '🚴 Needs Check'
                              : isDelivered
                              ? '✓✓ Verified'
                              : order.status}
                          </span>

                          {order.subscription?.status && (
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase w-fit ${
                                order.subscription.status === 'ACTIVE'
                                  ? 'bg-brand-mustard/20 text-brand-mustard border border-brand-mustard/30'
                                  : 'bg-amber-50 text-amber-700 border border-amber-300'
                              }`}
                            >
                              Plan: {order.subscription.status}
                            </span>
                          )}

                          {order.riderDeliveredAt && (
                            <span className="text-[10px] font-mono text-brand-forest-muted/90 flex items-center gap-1">
                              <span>🚴 Drop:</span>
                              <span>{new Date(order.riderDeliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </span>
                          )}
                          {order.adminVerifiedAt && (
                            <span className="text-[10px] font-mono text-brand-mustard/90 flex items-center gap-1">
                              <span>🛡️ Verified:</span>
                              <span>{new Date(order.adminVerifiedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </span>
                          )}

                          {/* Payment proof */}
                          <div className="mt-0.5 flex flex-wrap gap-1">
                            {paymentInfo.utr && (
                              <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-brand-mustard/15 text-brand-forest border border-brand-mustard/30 truncate max-w-[130px]" title={paymentInfo.utr}>
                                🔑 UTR: {paymentInfo.utr}
                              </span>
                            )}
                            {paymentInfo.screenshotUrl && (
                              <button
                                type="button"
                                onClick={() =>
                                  setPreviewReceipt({
                                    url: paymentInfo.screenshotUrl!,
                                    orderId: order.id,
                                    customerName: order.user?.name || 'Customer',
                                    customerPhone: order.user?.phone || '',
                                    utr: paymentInfo.utr,
                                    mode: paymentInfo.mode,
                                  })
                                }
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs transition-all"
                              >
                                <span>📸</span>
                                <span>Receipt</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 align-top text-right">
                        <div className="flex flex-col items-end gap-1.5">
                          {order.subscription?.status === 'PENDING' && (
                            <button
                              type="button"
                              onClick={() => handleActivateSubscription(order.id)}
                              className="px-2.5 py-1 rounded-lg bg-brand-mustard/15 hover:bg-brand-mustard/25 text-brand-forest-muted border border-brand-mustard/30 font-bold text-[10px] cursor-pointer transition-all whitespace-nowrap"
                            >
                              Verify Plan ⚡
                            </button>
                          )}

                          {isRiderDelivered && (
                            <button
                              type="button"
                              onClick={() => handleDoubleVerify(order.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-brand-mustard to-teal-400 hover:opacity-90 text-brand-forest font-black text-[10px] cursor-pointer transition-all shadow-sm flex items-center gap-1 whitespace-nowrap"
                            >
                              <span>✓✓</span>
                              <span>Double-Verify</span>
                            </button>
                          )}

                          {order.status === 'QUEUED' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                              className="px-2.5 py-1.5 rounded-lg bg-brand-mustard text-brand-forest font-bold text-[10px] hover:opacity-90 cursor-pointer transition-all whitespace-nowrap"
                            >
                              Delivered ✓
                            </button>
                          )}

                          {order.status !== 'DELIVERED' && order.status !== 'FAILED' && (
                            <button
                              type="button"
                              onClick={() => {
                                setFailingOrderId(order.id);
                                setFailingOrderName(order.user?.name || shortId);
                                setFailReason('Customer unreachable / phone switched off');
                                setCustomFailReason('');
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 font-bold text-[10px] hover:bg-red-100 cursor-pointer transition-all whitespace-nowrap"
                            >
                              Fail ✕
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Fail Reason Dialog ── */}
      {failingOrderId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="relative w-full max-w-md bg-white border border-[#E6E0CF] rounded-3xl p-6 shadow-2xl space-y-4 my-8 text-brand-forest">
            <div className="flex items-start justify-between border-b border-[#E6E0CF] pb-3">
              <div>
                <h3 className="text-base font-black text-red-600 flex items-center gap-1.5">
                  <span>⚠️</span>
                  <span>Mark Order as Failed</span>
                </h3>
                <p className="text-xs text-brand-forest-muted mt-0.5">
                  ORD-{failingOrderId.slice(-5).toUpperCase()} for <strong>{failingOrderName}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFailingOrderId(null)}
                className="text-brand-forest-muted hover:text-brand-forest text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-forest-muted">
                Reason for delivery failure:
              </label>
              {[
                'Customer unreachable / phone switched off',
                'Door locked / gate security refused entry',
                'Customer requested delivery reschedule',
                'Incorrect or incomplete address provided',
                'Kitchen or food prep delay',
                'OTHER',
              ].map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-colors ${
                    failReason === reason
                      ? 'bg-amber-50 border-brand-mustard text-brand-forest'
                      : 'bg-[#FAF7F2] border-[#E6E0CF] text-brand-forest-muted hover:bg-brand-cream'
                  }`}
                >
                  <input
                    type="radio"
                    name="failReason"
                    value={reason}
                    checked={failReason === reason}
                    onChange={(e) => setFailReason(e.target.value)}
                    className="accent-brand-mustard"
                  />
                  <span>{reason === 'OTHER' ? 'Other (type below)' : reason}</span>
                </label>
              ))}
              {failReason === 'OTHER' && (
                <textarea
                  value={customFailReason}
                  onChange={(e) => setCustomFailReason(e.target.value)}
                  placeholder="Type specific failure reason..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E6E0CF] text-xs text-brand-forest focus:outline-none focus:border-brand-mustard"
                />
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E6E0CF]">
              <button
                type="button"
                disabled={submittingFail}
                onClick={() => setFailingOrderId(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-cream text-brand-forest border border-brand-border cursor-pointer hover:bg-brand-border transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submittingFail}
                onClick={handleConfirmFail}
                className="px-4 py-2 rounded-xl text-xs font-black bg-red-600 hover:bg-red-700 text-white cursor-pointer shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {submittingFail ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Confirm Failure</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Receipt Lightbox ── */}
      {previewReceipt && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-brand-card border border-brand-border rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 sm:p-5 border-b border-brand-border flex items-center justify-between bg-brand-cream/40">
              <div>
                <h3 className="text-base font-black text-brand-forest flex items-center gap-2">
                  <span>📸</span>
                  <span>Payment Receipt Verification</span>
                </h3>
                <p className="text-xs text-brand-forest-muted mt-0.5">
                  ORD-{previewReceipt.orderId.slice(-5).toUpperCase()} · <strong>{previewReceipt.customerName}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewReceipt(null)}
                className="w-8 h-8 rounded-full bg-brand-cream border border-brand-border hover:bg-brand-card text-brand-forest font-bold flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 sm:p-6 bg-black/20 flex items-center justify-center min-h-[300px]">
              {previewReceipt.url.startsWith('data:') ? (
                <iframe
                  src={previewReceipt.url}
                  title="Receipt"
                  className="max-h-[60vh] w-full rounded-xl border border-brand-border shadow-lg"
                  style={{ minHeight: 300 }}
                />
              ) : (
                <img
                  src={previewReceipt.url}
                  alt="Payment Receipt"
                  className="max-h-[60vh] max-w-full object-contain rounded-xl border border-brand-border shadow-lg"
                />
              )}
            </div>

            <div className="p-4 sm:p-5 border-t border-brand-border bg-brand-card flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-brand-forest-muted space-y-0.5">
                {previewReceipt.utr && (
                  <div>UTR: <span className="font-mono font-bold text-brand-forest">{previewReceipt.utr}</span></div>
                )}
                {previewReceipt.customerPhone && (
                  <div className="flex items-center gap-2">
                    <span>📱 {previewReceipt.customerPhone}</span>
                    <a
                      href={`https://wa.me/91${previewReceipt.customerPhone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-mustard hover:underline font-bold"
                    >
                      (WhatsApp)
                    </a>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (previewReceipt.url.startsWith('data:')) {
                      const win = window.open();
                      win?.document.write(`<iframe src="${previewReceipt.url}" frameborder="0" style="border:0;top:0;left:0;bottom:0;right:0;width:100%;height:100%;" allowfullscreen></iframe>`);
                    } else {
                      window.open(previewReceipt.url, '_blank');
                    }
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-cream hover:bg-brand-border text-brand-forest border border-brand-border transition-all cursor-pointer"
                >
                  Open Full ↗
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleActivateSubscription(previewReceipt.orderId);
                    setPreviewReceipt(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-black bg-brand-mustard text-brand-forest hover:opacity-90 transition-all shadow-md cursor-pointer"
                >
                  Verify &amp; Activate Plan ⚡
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
