'use client';

import React, { useState, useEffect } from 'react';

type OrderStatus = 'QUEUED' | 'DELIVERED' | 'FAILED' | 'SKIPPED';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [allRiders, setAllRiders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
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
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch (err) {
      alert('Failed to update status');
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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100">Order Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor daily morning deliveries, 6+1 physical drop notes, and rider statuses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleAutoAssign}
            disabled={autoAssigning}
            className="px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>⚡</span>
            <span>{autoAssigning ? 'Routing...' : 'Auto-Assign by Zone'}</span>
          </button>
          <input
            type="text"
            placeholder="Search customer, phone, PIN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={fetchOrders}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Auto-assign feedback banner */}
      {autoAssignMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between animate-fade-in">
          <span>✓ {autoAssignMsg}</span>
          <button onClick={() => setAutoAssignMsg(null)} className="font-bold text-emerald-400 cursor-pointer">✕</button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        {['ALL', 'QUEUED', 'DELIVERED', 'FAILED', 'SKIPPED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === st
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm font-medium">
            Loading orders...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No orders found matching the filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="p-4">Order / Customer</th>
                  <th className="p-4">Delivery Zone</th>
                  <th className="p-4">Diet Item</th>
                  <th className="p-4">Slot &amp; Logistics Note</th>
                  <th className="p-4">Assigned Rider</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredOrders.map((order) => {
                  const shortId = `ORD-${order.id.slice(-5).toUpperCase()}`;
                  const isDelivered = order.status === 'DELIVERED';
                  const hasSpecialNote = Boolean(order.deliveryNote);

                  return (
                    <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <span className="font-mono font-bold text-slate-200 block">
                          {shortId}
                        </span>
                        <span className="font-semibold text-slate-300 block mt-0.5">
                          {order.user?.name || 'Patna Customer'}
                        </span>
                        <span className="text-[11px] text-slate-400 block font-mono">
                          {order.user?.phone || 'No phone'}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="font-medium text-slate-200 block">
                          {order.address?.street || 'Local Delivery'}
                        </span>
                        <span className="text-[10px] text-emerald-400 uppercase font-black tracking-wider">
                          PIN: {order.address?.pincode || '800001'}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="font-bold text-slate-100 block">
                          {order.subscription?.product?.name || 'Chef Diet Prep'}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          🔥 {order.subscription?.product?.calories || 520} kcal
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="inline-block px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px] mb-1">
                          ⏰ {order.deliveryTime || '07:00 AM'}
                        </span>
                        {hasSpecialNote && (
                          <div className="p-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
                            ⚠️ {order.deliveryNote}
                          </div>
                        )}
                      </td>

                      {/* Assigned Rider Column */}
                      <td className="p-4">
                        <select
                          value={order.riderId || ''}
                          onChange={(e) => handleAssignRider(order.id, e.target.value)}
                          className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-xs font-bold text-slate-200 focus:outline-none focus:border-amber-400 max-w-[150px]"
                        >
                          <option value="">Unassigned</option>
                          {allRiders.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name} ({r.vehicleType})
                            </option>
                          ))}
                        </select>
                        {order.rider && (
                          <span className="block text-[10px] font-mono text-emerald-400 mt-1">
                            📱 {order.rider.phone}
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            order.status === 'DELIVERED'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : order.status === 'FAILED'
                              ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                              : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isDelivered && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-[11px] hover:bg-emerald-400 cursor-pointer transition-all"
                            >
                              Delivered ✓
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(order.id, 'FAILED')}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-red-400 font-bold text-[11px] hover:bg-slate-700 cursor-pointer transition-all"
                          >
                            Fail
                          </button>
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
