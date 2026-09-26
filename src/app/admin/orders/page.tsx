'use client';

import React, { useState, useEffect } from 'react';

type OrderStatus = 'QUEUED' | 'RIDER_DELIVERED' | 'DELIVERED' | 'FAILED' | 'SKIPPED';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [allRiders, setAllRiders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [placedDateFilter, setPlacedDateFilter] = useState<'ALL' | 'TODAY' | 'YESTERDAY' | 'LAST_7_DAYS' | 'CUSTOM'>('ALL');
  const [customPlacedDate, setCustomPlacedDate] = useState('');
  const [autoAssigning, setAutoAssigning] = useState(false);
  const [autoAssignMsg, setAutoAssignMsg] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders?status=${statusFilter}`);
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
      if (data.allRiders) setAllRiders(data.allRiders);
    } catch (err) {
      console.error('Failed to fetch admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

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
    } catch (err) {
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
    } catch (err) {
      alert('Failed to assign rider');
    }
  };

  const handleAutoAssign = async () => {
    setAutoAssigning(true);
    setAutoAssignMsg(null);
    try {
      const res = await fetch('/api/admin/riders/auto-assign', {
        method: 'POST',
      });
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

  const filteredOrders = orders.filter((o) => {
    // Placed Date Filter
    if (placedDateFilter !== 'ALL') {
      if (!o.createdAt) return false;
      const orderDate = new Date(o.createdAt);
      const now = new Date();

      const getLocalDateStr = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const orderDayStr = getLocalDateStr(orderDate);
      const todayStr = getLocalDateStr(now);

      if (placedDateFilter === 'TODAY') {
        if (orderDayStr !== todayStr) return false;
      } else if (placedDateFilter === 'YESTERDAY') {
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        if (orderDayStr !== getLocalDateStr(yesterday)) return false;
      } else if (placedDateFilter === 'LAST_7_DAYS') {
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);
        if (orderDate < sevenDaysAgo) return false;
      } else if (placedDateFilter === 'CUSTOM' && customPlacedDate) {
        if (orderDayStr !== customPlacedDate) return false;
      }
    }

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

  const formatPlanName = (rawName?: string | null) => {
    if (!rawName) return 'Fresh Bloom Prep';
    return rawName
      .replace(/7D\s*Trial/gi, 'Trial')
      .replace(/7-DAY\s*WEEKLY\s*PLAN\s*\(7\s*Days\)/gi, 'Weekly Plan')
      .replace(/7-Day/gi, 'Weekly')
      .trim();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-brand-forest">Order Management</h1>
          <p className="text-xs text-brand-forest-muted mt-1">
            Assign orders to riders, verify morning doorstep drops, and double-mark delivery completion.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleAutoAssign}
            disabled={autoAssigning}
            className="px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-brand-mustard to-brand-mustard hover:from-brand-forest-muted hover:to-brand-mustard text-brand-forest transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>⚡</span>
            <span>{autoAssigning ? 'Routing...' : 'Auto-Assign by Zone'}</span>
          </button>
          <input
            type="text"
            placeholder="Search customer, phone, PIN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 rounded-xl bg-brand-card border border-brand-border text-xs text-brand-forest placeholder:text-brand-forest-muted/70 focus:outline-none focus:border-brand-mustard"
          />
          <button
            onClick={fetchOrders}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-cream hover:bg-brand-border text-brand-forest border border-brand-border transition-all cursor-pointer"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Auto-assign feedback banner */}
      {autoAssignMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center justify-between animate-fade-in shadow-xs">
          <span className="font-semibold">✓ {autoAssignMsg}</span>
          <button onClick={() => setAutoAssignMsg(null)} className="font-bold text-emerald-800 cursor-pointer">✕</button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-brand-border pb-3 overflow-x-auto">
        {[
          { id: 'ALL', label: 'All Orders' },
          { id: 'QUEUED', label: 'Queued' },
          { id: 'RIDER_DELIVERED', label: '🚴 Rider Delivered (Needs Verification)' },
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

      {/* Date Order Placed Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-brand-card/90 border border-brand-border">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-brand-forest flex items-center gap-1.5">
            <span className="text-sm">📅</span>
            <span>Date Placed:</span>
          </span>

          {/* Quick Presets */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'ALL', label: 'All Dates' },
              { id: 'TODAY', label: 'Today' },
              { id: 'YESTERDAY', label: 'Yesterday' },
              { id: 'LAST_7_DAYS', label: 'Last 7 Days' },
            ].map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setPlacedDateFilter(preset.id as any);
                  if (preset.id !== 'CUSTOM') setCustomPlacedDate('');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  placedDateFilter === preset.id && !customPlacedDate
                    ? 'bg-brand-mustard text-brand-forest shadow-xs'
                    : 'bg-brand-cream/80 text-brand-forest-muted hover:text-brand-forest border border-brand-border'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Custom Date Input */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-brand-forest-muted">or Pick Date:</span>
            <input
              type="date"
              value={customPlacedDate}
              onChange={(e) => {
                setCustomPlacedDate(e.target.value);
                if (e.target.value) {
                  setPlacedDateFilter('CUSTOM');
                } else {
                  setPlacedDateFilter('ALL');
                }
              }}
              className="px-2.5 py-1 rounded-lg text-xs bg-brand-cream border border-brand-border text-brand-forest focus:outline-none focus:border-brand-mustard font-mono cursor-pointer"
            />
            {customPlacedDate && (
              <button
                type="button"
                onClick={() => {
                  setCustomPlacedDate('');
                  setPlacedDateFilter('ALL');
                }}
                className="px-2 py-1 rounded-lg text-[11px] font-bold bg-brand-cream text-brand-forest-muted hover:text-red-500 border border-brand-border cursor-pointer"
                title="Clear custom date"
              >
                ✕ Clear
              </button>
            )}
          </div>
        </div>

        {/* Filter feedback badge */}
        {placedDateFilter !== 'ALL' && (
          <div className="text-xs font-semibold text-brand-mustard bg-brand-mustard/15 px-3 py-1 rounded-full border border-brand-mustard/30 flex items-center gap-1.5">
            <span>Filtered:</span>
            <span className="font-bold font-mono text-brand-forest">{filteredOrders.length}</span>
            <span>order{filteredOrders.length === 1 ? '' : 's'} placed {
              placedDateFilter === 'TODAY'
                ? 'today'
                : placedDateFilter === 'YESTERDAY'
                ? 'yesterday'
                : placedDateFilter === 'LAST_7_DAYS'
                ? 'in last 7 days'
                : `on ${new Date(`${customPlacedDate}T00:00:00`).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}`
            }</span>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl bg-brand-card border border-brand-border overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-brand-forest-muted/70 text-sm font-medium">
            Loading orders...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-brand-forest-muted/70 text-sm">
            No orders found matching the filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-brand-cream/80 border-b border-brand-border text-brand-forest-muted uppercase tracking-wider text-[10px]">
                  <th className="p-4">Order / Customer</th>
                  <th className="p-4">Delivery Zone</th>
                  <th className="p-4">Diet Item</th>
                  <th className="p-4">Slot &amp; Logistics Note</th>
                  <th className="p-4">Assigned Rider</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/80">
                {filteredOrders.map((order) => {
                  const shortId = `ORD-${order.id.slice(-5).toUpperCase()}`;
                  const isDelivered = order.status === 'DELIVERED';
                  const hasSpecialNote = Boolean(order.deliveryNote);

                  return (
                    <tr key={order.id} className="hover:bg-brand-cream/40 transition-colors">
                      <td className="p-4">
                        <span className="font-mono font-bold text-brand-forest block">
                          {shortId}
                        </span>
                        <span className="font-semibold text-brand-forest-muted block mt-0.5">
                          {order.user?.name || 'Patna Customer'}
                        </span>
                        {order.createdAt && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-brand-forest-muted/80 bg-brand-cream/60 px-1.5 py-0.5 rounded border border-brand-border/60 mt-1">
                            🕒 Placed: {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                            })}, {new Date(order.createdAt).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                        {order.user?.phone ? (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[11px] text-brand-forest-muted font-mono">
                              📱 {order.user.phone}
                            </span>
                            <a
                              href={`https://wa.me/91${order.user.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] font-bold text-brand-mustard hover:text-brand-mustard-hover hover:underline"
                              title="Chat with customer on WhatsApp to confirm delivery"
                            >
                              (WA)
                            </a>
                          </div>
                        ) : (
                          <span className="text-[11px] text-brand-forest-muted/70 block font-mono">
                            No phone
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        <span className="font-medium text-brand-forest block">
                          {order.address?.street || 'Local Delivery'}
                        </span>
                        <span className="text-[10px] text-brand-mustard uppercase font-black tracking-wider">
                          PIN: {order.address?.pincode || '800001'}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="font-bold text-brand-forest block">
                          {formatPlanName(order.subscription?.product?.name)}
                        </span>
                        <span className="text-[10px] text-brand-forest-muted block">
                          🔥 {order.subscription?.product?.calories || 520} kcal
                        </span>
                        {order.user?.dietaryPreference && (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 mt-1">
                            {order.user.dietaryPreference}
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        <span className="inline-block px-2 py-0.5 rounded bg-brand-cream text-brand-forest-muted font-mono text-[11px] mb-1">
                          ⏰ {order.deliveryTime || '07:00 AM'}
                        </span>
                        {order.user?.allergies && order.user.allergies !== 'None' && (
                          <div className="mb-1 p-1.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-[10px] font-bold max-w-[170px] leading-tight flex items-start gap-1 shadow-xs">
                            <span>⚠️</span>
                            <span className="truncate">Allergies: {order.user.allergies}</span>
                          </div>
                        )}
                        {hasSpecialNote && (
                          <div className="p-1.5 rounded-lg bg-brand-mustard/15 border border-brand-mustard/30 text-brand-forest text-[10px] font-medium max-w-[170px]">
                            📝 {order.deliveryNote}
                          </div>
                        )}
                      </td>

                      {/* Assigned Rider Column */}
                      <td className="p-4">
                        <select
                          value={order.riderId || ''}
                          onChange={(e) => handleAssignRider(order.id, e.target.value)}
                          className="px-2.5 py-1 rounded-lg bg-brand-cream border border-brand-border text-xs font-bold text-brand-forest focus:outline-none focus:border-brand-mustard max-w-[150px]"
                        >
                          <option value="">Unassigned</option>
                          {allRiders.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name} ({r.vehicleType})
                            </option>
                          ))}
                        </select>
                        {order.rider && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[10px] font-mono text-brand-mustard">
                              📱 {order.rider.phone}
                            </span>
                            <a
                              href={`https://wa.me/91${order.rider.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[9px] font-bold text-brand-mustard hover:text-brand-mustard-hover hover:underline"
                              title="Chat with rider on WhatsApp"
                            >
                              (WA)
                            </a>
                          </div>
                        )}
                      </td>

                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                order.status === 'DELIVERED'
                                  ? 'bg-brand-mustard/20 text-brand-mustard border border-brand-mustard/40'
                                  : order.status === 'RIDER_DELIVERED'
                                  ? 'bg-brand-mustard/20 text-brand-forest-muted border border-brand-mustard/40 animate-pulse'
                                  : order.status === 'FAILED'
                                  ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                                  : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                              }`}
                            >
                              {order.status === 'RIDER_DELIVERED'
                                ? '🚴 Rider Delivered (Needs Check)'
                                : order.status === 'DELIVERED'
                                ? '✓✓ Double Verified'
                                : order.status}
                            </span>
                            {order.subscription?.status && (
                              <span
                                className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                                  order.subscription.status === 'ACTIVE'
                                    ? 'bg-brand-mustard/20 text-brand-mustard-hover border border-brand-mustard/30'
                                    : 'bg-brand-mustard/20 text-brand-forest-muted border border-brand-mustard/30'
                                }`}
                              >
                                Plan: {order.subscription.status}
                              </span>
                            )}
                          </div>

                          {order.riderDeliveredAt && (
                            <span className="text-[10px] font-mono text-brand-forest-muted/90 flex items-center gap-1">
                              <span>🚴 Drop-off:</span>
                              <span>{new Date(order.riderDeliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </span>
                          )}
                          {order.adminVerifiedAt && (
                            <span className="text-[10px] font-mono text-brand-mustard/90 flex items-center gap-1">
                              <span>🛡️ Admin verified:</span>
                              <span>{new Date(order.adminVerifiedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </span>
                          )}
                        </div>

                        {order.subscription?.utr && (
                          <div className="mt-1.5">
                            {order.subscription.utr.startsWith('DIRECT_UPI_') ? (
                              <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-brand-mustard/15 text-brand-forest-muted border border-brand-mustard/30" title="User paid via 1-click UPI app intent without typing UTR">
                                📲 1-Tap UPI ({order.subscription.utr.slice(-6)})
                              </span>
                            ) : (
                              <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-brand-mustard/15 text-brand-mustard-hover border border-brand-mustard/30" title="Verified UPI UTR">
                                🔑 UTR: {order.subscription.utr}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {order.subscription?.status === 'PENDING' && (
                            <button
                              type="button"
                              onClick={() => handleActivateSubscription(order.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-brand-mustard/15 hover:bg-brand-mustard/25 text-brand-forest-muted border border-brand-mustard/30 font-bold text-[11px] cursor-pointer transition-all whitespace-nowrap"
                              title="Verify payment and activate recurring daily cutoff engine"
                            >
                              Verify Plan ⚡
                            </button>
                          )}

                          {order.status === 'RIDER_DELIVERED' && (
                            <button
                              type="button"
                              onClick={() => handleDoubleVerify(order.id)}
                              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-brand-mustard to-teal-400 hover:from-brand-mustard hover:to-brand-mustard-hover text-brand-forest font-black text-[11px] cursor-pointer transition-all shadow-md flex items-center gap-1 whitespace-nowrap animate-bounce"
                              title="Confirm doorstep delivery and double-mark complete"
                            >
                              <span>Double-Mark Verified</span>
                              <span>✓✓</span>
                            </button>
                          )}

                          {order.status === 'QUEUED' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                              className="px-2.5 py-1.5 rounded-lg bg-brand-mustard text-brand-forest font-bold text-[11px] hover:bg-brand-mustard cursor-pointer transition-all whitespace-nowrap"
                              title="Admin direct mark delivered"
                            >
                              Delivered ✓
                            </button>
                          )}

                          {order.status !== 'DELIVERED' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(order.id, 'FAILED')}
                              className="px-2 py-1.5 rounded-lg bg-brand-cream text-red-400 font-bold text-[11px] hover:bg-brand-border cursor-pointer transition-all"
                            >
                              Fail
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
    </div>
  );
}
