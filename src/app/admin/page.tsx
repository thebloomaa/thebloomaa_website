'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface OrderRecord {
  id: string;
  status: string;
  deliveryDate: string;
  deliveryTime: string | null;
  deliveryNote: string | null;
  deliveredAt: string | null;
  riderDeliveredAt: string | null;
  adminVerifiedAt: string | null;
  user: {
    id: string;
    name: string;
    phone: string;
    email: string;
  };
  address: {
    id: string;
    street: string;
    pincode: string;
    city: string;
    gpsCoords: string | null;
    mapsUrl: string | null;
  };
  subscription: {
    id: string;
    status: string;
    bundleType: string;
    deliveriesLeft: number;
    utr: string | null;
    product: {
      name: string;
      calories: number;
      type: string;
    };
  } | null;
  riderId: string | null;
  rider: {
    id: string;
    name: string;
    phone: string;
    vehicleType: string | null;
  } | null;
}

interface RiderRecord {
  id: string;
  name: string;
  phone: string;
  vehicleType: string;
  vehicleNumber: string;
  active: boolean;
  assignedZone: { pincode: string; neighborhood: string | null } | null;
  todayTotalDrops: number;
  todayCompletedDrops: number;
}

interface ZoneRecord {
  id: string;
  pincode: string;
  neighborhood: string;
  city: string;
  state: string;
  isActive: boolean;
  ridersCount: number;
  riders: Array<{ id: string; name: string }>;
}

interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  fitnessGoal: string;
  dietaryPreference: string;
  allergies: string;
  age: number | null;
  gender: string | null;
  createdAt: string;
  address: {
    street: string;
    pincode: string;
    city: string;
    gpsCoords: string | null;
    mapsUrl: string | null;
  };
  subscription: {
    id: string;
    status: string;
    planName: string;
    utr: string | null;
    deliveriesLeft: number;
  } | null;
  activeSubscription: string | null;
  totalOrders: number;
}

interface DashboardData {
  metrics: {
    totalCustomers: number;
    activeSubs: number;
    todaysOrders: number;
    monthlyRevenue: number;
    deliveryRate: string;
    failedToday: number;
    unassignedOrdersCount: number;
    needsVerificationCount: number;
    doubleVerifiedCount: number;
    activeRidersCount: number;
  };
  orders: OrderRecord[];
  riders: RiderRecord[];
  customers: CustomerRecord[];
  zones: ZoneRecord[];
  topMeals: Array<{ name: string; subs: number; pct: number }>;
  topZones: Array<{ zone: string; orders: number }>;
}

type TabType = 'ORDERS' | 'RIDERS' | 'CUSTOMERS' | 'ZONES';

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('ORDERS');
  const [refreshing, setRefreshing] = useState(false);

  // Filters for Orders Tab
  const [orderFilter, setOrderFilter] = useState<'ALL' | 'UNASSIGNED' | 'RIDER_DELIVERED' | 'DELIVERED' | 'QUEUED'>('ALL');
  const [orderSearch, setOrderSearch] = useState('');
  const [autoAssigning, setAutoAssigning] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Filters for Customers Tab
  const [customerSearch, setCustomerSearch] = useState('');
  const [dietFilter, setDietFilter] = useState('ALL');

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const res = await fetch('/api/admin/dashboard');
      if (res.ok) {
        const d = await res.json();
        setData(d);
      }
    } catch (err) {
      console.error('Failed to fetch admin dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Handler: 1-click Rider Assignment
  const handleAssignRider = async (orderId: string, riderId: string) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, riderId: riderId || null }),
      });
      if (res.ok) {
        setData((prev) => {
          if (!prev) return prev;
          const assignedRider = prev.riders.find((r) => r.id === riderId) || null;
          const updatedOrders = prev.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  riderId: riderId || null,
                  rider: assignedRider ? { id: assignedRider.id, name: assignedRider.name, phone: assignedRider.phone, vehicleType: assignedRider.vehicleType } : null,
                }
              : o
          );
          const unassignedCount = updatedOrders.filter((o) => !o.riderId && o.status !== 'DELIVERED').length;
          return {
            ...prev,
            orders: updatedOrders,
            metrics: { ...prev.metrics, unassignedOrdersCount: unassignedCount },
          };
        });
        setFeedbackMsg({ text: 'Rider assigned successfully.', type: 'success' });
      }
    } catch (err) {
      setFeedbackMsg({ text: 'Failed to assign rider.', type: 'error' });
    }
  };

  // Handler: Two-Step Delivery Verification ("Double-Mark Verified")
  const handleDoubleVerify = async (orderId: string) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, doubleVerify: true }),
      });
      if (res.ok) {
        const nowIso = new Date().toISOString();
        setData((prev) => {
          if (!prev) return prev;
          const updatedOrders = prev.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: 'DELIVERED',
                  adminVerifiedAt: nowIso,
                  deliveredAt: o.deliveredAt || nowIso,
                  subscription: o.subscription ? { ...o.subscription, status: 'ACTIVE' } : o.subscription,
                }
              : o
          );
          const needsVerif = updatedOrders.filter((o) => o.status === 'RIDER_DELIVERED').length;
          const doubleVerif = updatedOrders.filter((o) => o.status === 'DELIVERED' && o.adminVerifiedAt).length;
          return {
            ...prev,
            orders: updatedOrders,
            metrics: {
              ...prev.metrics,
              needsVerificationCount: needsVerif,
              doubleVerifiedCount: doubleVerif,
            },
          };
        });
        setFeedbackMsg({ text: 'Order double-verified and marked fully delivered!', type: 'success' });
      }
    } catch {
      setFeedbackMsg({ text: 'Failed to verify delivery.', type: 'error' });
    }
  };

  // Handler: Direct Status Update
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      if (res.ok) {
        const nowIso = new Date().toISOString();
        setData((prev) => {
          if (!prev) return prev;
          const updatedOrders = prev.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: newStatus,
                  deliveredAt: newStatus === 'DELIVERED' ? nowIso : o.deliveredAt,
                  adminVerifiedAt: newStatus === 'DELIVERED' ? nowIso : o.adminVerifiedAt,
                  subscription:
                    newStatus === 'DELIVERED' && o.subscription
                      ? { ...o.subscription, status: 'ACTIVE' }
                      : o.subscription,
                }
              : o
          );
          return { ...prev, orders: updatedOrders };
        });
        setFeedbackMsg({ text: `Order marked as ${newStatus}.`, type: 'success' });
      }
    } catch {
      setFeedbackMsg({ text: 'Failed to update order status.', type: 'error' });
    }
  };

  // Handler: Activate Pending Subscription
  const handleActivateSubscription = async (orderId: string) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, activateSubscription: true }),
      });
      if (res.ok) {
        setData((prev) => {
          if (!prev) return prev;
          const updatedOrders = prev.orders.map((o) =>
            o.id === orderId && o.subscription
              ? { ...o, subscription: { ...o.subscription, status: 'ACTIVE' } }
              : o
          );
          return { ...prev, orders: updatedOrders };
        });
        setFeedbackMsg({ text: 'Subscription activated!', type: 'success' });
      }
    } catch {
      setFeedbackMsg({ text: 'Failed to activate subscription.', type: 'error' });
    }
  };

  // Handler: Auto-Assign by Zone
  const handleAutoAssign = async () => {
    setAutoAssigning(true);
    try {
      const res = await fetch('/api/admin/riders/auto-assign', { method: 'POST' });
      const resData = await res.json();
      if (res.ok) {
        setFeedbackMsg({
          text: `Auto-routed ${resData.assignedCount} order(s) by zone (${resData.fallbackAssignedCount} to central rider).`,
          type: 'success',
        });
        fetchDashboardData();
      } else {
        setFeedbackMsg({ text: resData.error || 'Auto-assign failed.', type: 'error' });
      }
    } catch {
      setFeedbackMsg({ text: 'Network error during auto-routing.', type: 'error' });
    } finally {
      setAutoAssigning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="w-10 h-10 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-mono text-slate-400">Loading Operations Command Center...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-24">
        <div className="inline-block p-6 rounded-3xl bg-slate-900 border border-slate-800 max-w-md">
          <p className="text-base font-bold text-red-400 mb-2">Access Denied or Session Expired</p>
          <p className="text-xs text-slate-400 mb-4">
            Could not fetch operations telemetry. Please verify you are authenticated as Administrator.
          </p>
          <Link
            href="/admin/login"
            className="inline-block px-5 py-2.5 rounded-xl font-bold text-xs bg-amber-400 text-slate-950 hover:bg-amber-300 transition-all"
          >
            Authenticate via Admin Portal →
          </Link>
        </div>
      </div>
    );
  }

  // Filter Orders for Tab 1
  const filteredOrders = (data.orders || []).filter((o) => {
    // Status Filter
    if (orderFilter === 'UNASSIGNED' && (o.riderId !== null || o.status === 'DELIVERED')) return false;
    if (orderFilter === 'RIDER_DELIVERED' && o.status !== 'RIDER_DELIVERED') return false;
    if (orderFilter === 'DELIVERED' && o.status !== 'DELIVERED') return false;
    if (orderFilter === 'QUEUED' && o.status !== 'QUEUED') return false;

    // Search Query Filter
    if (!orderSearch.trim()) return true;
    const q = orderSearch.toLowerCase();
    return (
      o.id.toLowerCase().includes(q) ||
      o.user.name.toLowerCase().includes(q) ||
      o.user.phone.includes(q) ||
      o.address.street.toLowerCase().includes(q) ||
      o.address.pincode.includes(q) ||
      (o.subscription?.product?.name && o.subscription.product.name.toLowerCase().includes(q)) ||
      (o.rider?.name && o.rider.name.toLowerCase().includes(q))
    );
  });

  // Filter Customers for Tab 3
  const filteredCustomers = (data.customers || []).filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.phone.includes(customerSearch) ||
      c.address.street.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.address.pincode.includes(customerSearch);

    const matchDiet =
      dietFilter === 'ALL' ||
      c.dietaryPreference?.toUpperCase() === dietFilter.toUpperCase();

    return matchSearch && matchDiet;
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Systematic Command Center
            </span>
            <span className="text-xs text-slate-400 font-mono">Patna Central Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Operations &amp; Dispatch Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Assign orders to riders, verify morning drops, and double-mark deliveries in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleAutoAssign}
            disabled={autoAssigning}
            className="px-3.5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
            title="Automatically route unassigned orders to zone riders"
          >
            <span>⚡</span>
            <span>{autoAssigning ? 'Routing...' : 'Auto-Assign Fleet'}</span>
          </button>
          <button
            type="button"
            onClick={fetchDashboardData}
            disabled={refreshing}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span className={refreshing ? 'animate-spin' : ''}>🔄</span>
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Instant Action Feedback Toast */}
      {feedbackMsg && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between animate-fade-in ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
              : 'bg-red-950/50 border-red-500/40 text-red-300'
          }`}
        >
          <span className="font-medium">
            {feedbackMsg.type === 'success' ? '✓ ' : '✕ '}
            {feedbackMsg.text}
          </span>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="font-bold ml-4 cursor-pointer text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Quick Action Telemetry Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Unassigned Action Card */}
        <button
          onClick={() => {
            setActiveTab('ORDERS');
            setOrderFilter('UNASSIGNED');
          }}
          className={`text-left rounded-2xl p-4 bg-slate-900/90 border transition-all cursor-pointer ${
            data.metrics.unassignedOrdersCount > 0
              ? 'border-amber-500/40 hover:border-amber-400 shadow-lg shadow-amber-500/5'
              : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-base p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
              🚨
            </span>
            <span className="text-[10px] font-mono font-bold uppercase text-amber-400">Needs Rider</span>
          </div>
          <p className="text-2xl font-black font-mono text-amber-400">{data.metrics.unassignedOrdersCount}</p>
          <p className="text-xs font-bold text-slate-200 mt-0.5">Unassigned Orders</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Click to view &amp; assign →</p>
        </button>

        {/* Needs Verification Card */}
        <button
          onClick={() => {
            setActiveTab('ORDERS');
            setOrderFilter('RIDER_DELIVERED');
          }}
          className={`text-left rounded-2xl p-4 bg-slate-900/90 border transition-all cursor-pointer ${
            data.metrics.needsVerificationCount > 0
              ? 'border-yellow-400/50 hover:border-yellow-300 shadow-lg shadow-yellow-500/10 animate-pulse'
              : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-base p-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              ⏳
            </span>
            <span className="text-[10px] font-mono font-bold uppercase text-yellow-300">Rider Dropped</span>
          </div>
          <p className="text-2xl font-black font-mono text-yellow-300">{data.metrics.needsVerificationCount}</p>
          <p className="text-xs font-bold text-slate-200 mt-0.5">Pending Double-Mark</p>
          <p className="text-[10px] text-yellow-400/80 mt-0.5">Double-verify deliveries →</p>
        </button>

        {/* Double-Verified Today */}
        <button
          onClick={() => {
            setActiveTab('ORDERS');
            setOrderFilter('DELIVERED');
          }}
          className="text-left rounded-2xl p-4 bg-slate-900/90 border border-emerald-500/20 hover:border-emerald-500/40 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-base p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              ✓✓
            </span>
            <span className="text-[10px] font-mono font-bold uppercase text-emerald-400">{data.metrics.deliveryRate}% Rate</span>
          </div>
          <p className="text-2xl font-black font-mono text-emerald-400">{data.metrics.doubleVerifiedCount}</p>
          <p className="text-xs font-bold text-slate-200 mt-0.5">Double-Verified Deliveries</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Completed drops today</p>
        </button>

        {/* Active Fleet & Subscribers */}
        <div className="rounded-2xl p-4 bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-base p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
              🚴
            </span>
            <span className="text-[10px] font-mono font-bold uppercase text-blue-400">Patna Coverage</span>
          </div>
          <p className="text-2xl font-black font-mono text-blue-400">{data.metrics.activeRidersCount} Riders</p>
          <p className="text-xs font-bold text-slate-200 mt-0.5">{data.metrics.activeSubs} Active Subscribers</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Across {data.zones.length} delivery zones</p>
        </div>
      </div>

      {/* Systematic 4-Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5 overflow-x-auto">
        {[
          { id: 'ORDERS', label: '📦 Live Order Dispatch & Verification', count: data.orders.length },
          { id: 'RIDERS', label: '🚴 Fleet & Riders', count: data.riders.length },
          { id: 'CUSTOMERS', label: '👥 Customers & Subscriptions', count: data.customers.length },
          { id: 'ZONES', label: '📍 Delivery Zones', count: data.zones.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                activeTab === tab.id ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: LIVE ORDER DISPATCH & TWO-STEP VERIFICATION                    */}
      {/* ===================================================================== */}
      {activeTab === 'ORDERS' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
            {/* Filter Pills */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'ALL', label: 'All Orders' },
                { id: 'UNASSIGNED', label: `🚨 Unassigned (${data.metrics.unassignedOrdersCount})` },
                { id: 'RIDER_DELIVERED', label: `⏳ Needs Verification (${data.metrics.needsVerificationCount})` },
                { id: 'DELIVERED', label: '✓✓ Double Verified' },
                { id: 'QUEUED', label: 'Queued' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setOrderFilter(pill.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    orderFilter === pill.id
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search order, customer, phone, PIN..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full sm:w-72 px-3.5 py-1.5 pl-8 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-500">🔍</span>
            </div>
          </div>

          {/* Orders Table */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
            {filteredOrders.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs font-medium">
                No orders found matching the filter criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px] font-black">
                      <th className="p-3.5">Order / Customer</th>
                      <th className="p-3.5">Delivery Address &amp; GPS</th>
                      <th className="p-3.5">Diet Plan</th>
                      <th className="p-3.5">Slot &amp; Note</th>
                      <th className="p-3.5">Assigned Rider</th>
                      <th className="p-3.5">Status &amp; Drop Info</th>
                      <th className="p-3.5 text-right">Admin Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredOrders.map((order) => {
                      const shortId = `ORD-${order.id.slice(-5).toUpperCase()}`;
                      const isRiderDelivered = order.status === 'RIDER_DELIVERED';
                      const isDoubleVerified = order.status === 'DELIVERED';

                      return (
                        <tr key={order.id} className="hover:bg-slate-800/30 transition-colors">
                          {/* Order / Customer */}
                          <td className="p-3.5 align-top">
                            <span className="font-mono font-bold text-slate-200 block text-xs">{shortId}</span>
                            <span className="font-semibold text-slate-300 block mt-0.5">{order.user.name}</span>
                            {order.user.phone ? (
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[11px] text-slate-400 font-mono">📱 {order.user.phone}</span>
                                <a
                                  href={`https://wa.me/91${order.user.phone.replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 hover:underline"
                                  title="Chat on WhatsApp"
                                >
                                  (WA)
                                </a>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-500 font-mono">No phone</span>
                            )}
                          </td>

                          {/* Address & GPS */}
                          <td className="p-3.5 align-top max-w-[200px]">
                            <p className="font-medium text-slate-300 line-clamp-2">{order.address.street}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-black text-emerald-400 uppercase font-mono">
                                PIN: {order.address.pincode}
                              </span>
                              {order.address.mapsUrl && (
                                <a
                                  href={order.address.mapsUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] font-bold text-emerald-400 hover:underline flex items-center gap-0.5"
                                >
                                  <span>🗺️</span>
                                  <span>Map</span>
                                </a>
                              )}
                            </div>
                          </td>

                          {/* Diet Plan */}
                          <td className="p-3.5 align-top">
                            <span className="font-bold text-slate-200 block">
                              {order.subscription?.product?.name || 'Fresh Macro Prep'}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              🔥 {order.subscription?.product?.calories || 520} kcal
                            </span>
                          </td>

                          {/* Slot & Note */}
                          <td className="p-3.5 align-top">
                            <span className="inline-block px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] mb-1">
                              ⏰ {order.deliveryTime || '07:00 AM'}
                            </span>
                            {order.deliveryNote && (
                              <div className="p-1 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold max-w-[160px]">
                                ⚠️ {order.deliveryNote}
                              </div>
                            )}
                          </td>

                          {/* Assigned Rider (Dropdown) */}
                          <td className="p-3.5 align-top">
                            <select
                              value={order.riderId || ''}
                              onChange={(e) => handleAssignRider(order.id, e.target.value)}
                              className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 text-xs font-bold text-slate-200 focus:outline-none focus:border-amber-400 max-w-[150px]"
                            >
                              <option value="">🚨 Unassigned</option>
                              {data.riders.map((r) => (
                                <option key={r.id} value={r.id}>
                                  {r.name} ({r.vehicleType})
                                </option>
                              ))}
                            </select>
                            {order.rider && (
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-[10px] font-mono text-emerald-400">📱 {order.rider.phone}</span>
                                <a
                                  href={`https://wa.me/91${order.rider.phone.replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[9px] font-bold text-emerald-400 hover:text-emerald-300 hover:underline"
                                  title="Message rider on WhatsApp"
                                >
                                  (WA)
                                </a>
                              </div>
                            )}
                          </td>

                          {/* Status & Drop Info */}
                          <td className="p-3.5 align-top">
                            <div className="flex flex-col gap-1">
                              <span
                                className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider w-fit ${
                                  isDoubleVerified
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                    : isRiderDelivered
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                                    : order.status === 'FAILED'
                                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                }`}
                              >
                                {isRiderDelivered
                                  ? '🚴 Rider Delivered (Needs Check)'
                                  : isDoubleVerified
                                  ? '✓✓ Double Verified'
                                  : order.status}
                              </span>

                              {order.riderDeliveredAt && (
                                <span className="text-[10px] font-mono text-amber-300/90 flex items-center gap-1">
                                  <span>🚴 Drop:</span>
                                  <span>
                                    {new Date(order.riderDeliveredAt).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </span>
                              )}

                              {order.adminVerifiedAt && (
                                <span className="text-[10px] font-mono text-emerald-400/90 flex items-center gap-1">
                                  <span>🛡️ Verified:</span>
                                  <span>
                                    {new Date(order.adminVerifiedAt).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </span>
                              )}

                              {order.subscription?.utr && (
                                <span className="text-[9px] font-mono text-emerald-400 block truncate max-w-[120px]" title={order.subscription.utr}>
                                  UTR: {order.subscription.utr}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Admin Verification Actions */}
                          <td className="p-3.5 align-top text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              {order.subscription?.status === 'PENDING' && (
                                <button
                                  type="button"
                                  onClick={() => handleActivateSubscription(order.id)}
                                  className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-[10px] cursor-pointer transition-all whitespace-nowrap"
                                  title="Activate subscription and verify payment"
                                >
                                  Verify Plan ⚡
                                </button>
                              )}

                              {isRiderDelivered && (
                                <button
                                  type="button"
                                  onClick={() => handleDoubleVerify(order.id)}
                                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-[11px] cursor-pointer transition-all shadow-md flex items-center gap-1 whitespace-nowrap"
                                  title="Confirm doorstep drop with customer and mark double verified"
                                >
                                  <span>Double-Mark Verified</span>
                                  <span>✓✓</span>
                                </button>
                              )}

                              {order.status === 'QUEUED' && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-[10px] hover:bg-emerald-400 cursor-pointer transition-all whitespace-nowrap"
                                >
                                  Delivered ✓
                                </button>
                              )}

                              {order.status !== 'DELIVERED' && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(order.id, 'FAILED')}
                                  className="px-2 py-1.5 rounded-lg bg-slate-800 text-red-400 font-bold text-[10px] hover:bg-slate-700 cursor-pointer transition-all"
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
      )}

      {/* ===================================================================== */}
      {/* TAB 2: DELIVERY FLEET & RIDERS                                        */}
      {/* ===================================================================== */}
      {activeTab === 'RIDERS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
            <div>
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                <span>🚴</span> Active Delivery Fleet
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Patna logistics fleet, vehicle allocation, and daily drop manifest progress.
              </p>
            </div>
            <Link
              href="/admin/riders"
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 transition-all cursor-pointer"
            >
              + Manage Fleet
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.riders.map((rider) => {
              const progressPct =
                rider.todayTotalDrops > 0
                  ? Math.round((rider.todayCompletedDrops / rider.todayTotalDrops) * 100)
                  : 0;

              return (
                <div
                  key={rider.id}
                  className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {rider.vehicleType || 'Bike'}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 font-bold">
                        {rider.vehicleNumber}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-white">{rider.name}</h3>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-mono text-slate-300">📱 {rider.phone}</span>
                      <a
                        href={`https://wa.me/91${rider.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-bold text-emerald-400 hover:underline"
                      >
                        (WhatsApp)
                      </a>
                    </div>

                    <div className="mt-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned Zone</p>
                      <p className="text-xs font-bold text-slate-200 mt-0.5">
                        {rider.assignedZone
                          ? `${rider.assignedZone.neighborhood || 'Patna Zone'} (${rider.assignedZone.pincode})`
                          : 'Central Patna (All Zones)'}
                      </p>
                    </div>

                    {/* Today's Drops Progress */}
                    <div className="mt-3 space-y-1.5">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-slate-400">Today's Manifest Load:</span>
                        <span className="text-emerald-400 font-mono">
                          {rider.todayCompletedDrops} / {rider.todayTotalDrops} Drops ({progressPct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div
                          className="bg-gradient-to-r from-amber-400 to-emerald-400 h-2 rounded-full transition-all"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <Link
                      href={`/rider/manifest?riderId=${rider.id}`}
                      target="_blank"
                      className="text-xs font-black text-amber-400 hover:text-amber-300 flex items-center gap-1"
                    >
                      <span>Open Rider Manifest</span>
                      <span>↗</span>
                    </Link>
                    <button
                      onClick={() => {
                        setActiveTab('ORDERS');
                        setOrderSearch(rider.name);
                      }}
                      className="text-[11px] font-bold text-slate-400 hover:text-white"
                    >
                      Filter Drops →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: CUSTOMERS & SUBSCRIPTIONS                                      */}
      {/* ===================================================================== */}
      {activeTab === 'CUSTOMERS' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
            <div>
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                <span>👥</span> Registered Member Directory
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Patna subscribers, nutrition preferences, GPS pinned locations, and active plans.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <input
                type="text"
                placeholder="Search member, phone, address..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-400 w-60"
              />
              <select
                value={dietFilter}
                onChange={(e) => setDietFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-300 font-bold focus:outline-none focus:border-amber-400"
              >
                <option value="ALL">All Diets (100% Veg)</option>
                <option value="VEG">Pure Veg</option>
                <option value="VEGAN">Vegan</option>
                <option value="HIGH_PROTEIN">High Protein Veg</option>
                <option value="LIVING_RAW">Living Raw</option>
              </select>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px] font-black">
                    <th className="p-3.5">Member Profile</th>
                    <th className="p-3.5">Nutrition &amp; Allergies</th>
                    <th className="p-3.5">Pinned Street &amp; GPS</th>
                    <th className="p-3.5">Active Diet Subscription</th>
                    <th className="p-3.5 text-right">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredCustomers.map((cust) => (
                    <tr key={cust.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 align-top">
                        <div className="font-bold text-slate-100 text-sm">{cust.name}</div>
                        <div className="font-mono text-[11px] text-slate-400">{cust.email}</div>
                        {cust.phone && cust.phone !== 'N/A' && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="font-mono text-[11px] text-emerald-400">📱 {cust.phone}</span>
                            <a
                              href={`https://wa.me/91${cust.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] font-bold text-emerald-400 hover:underline"
                            >
                              (WhatsApp)
                            </a>
                          </div>
                        )}
                      </td>

                      <td className="p-3.5 align-top">
                        <div className="flex flex-wrap gap-1.5 mb-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-blue-500/15 text-blue-300 border border-blue-500/30">
                            {cust.fitnessGoal.replace(/_/g, ' ')}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            {cust.dietaryPreference.replace(/_/g, ' ')}
                          </span>
                        </div>
                        {cust.allergies && cust.allergies !== 'None' && (
                          <p className="text-[10px] text-amber-300 font-bold mt-1">⚠️ {cust.allergies}</p>
                        )}
                      </td>

                      <td className="p-3.5 align-top max-w-[220px]">
                        <p className="text-slate-300 font-medium">{cust.address.street}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-mono font-black text-emerald-400">
                            PIN: {cust.address.pincode}
                          </span>
                          {cust.address.mapsUrl && (
                            <a
                              href={cust.address.mapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] font-bold text-emerald-400 hover:underline"
                            >
                              🗺️ Maps ↗
                            </a>
                          )}
                        </div>
                      </td>

                      <td className="p-3.5 align-top">
                        {cust.subscription ? (
                          <div>
                            <span className="font-bold text-slate-200 block">{cust.subscription.planName}</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span
                                className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                  cust.subscription.status === 'ACTIVE'
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                }`}
                              >
                                {cust.subscription.status}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {cust.subscription.deliveriesLeft} drops left
                              </span>
                            </div>
                            {cust.subscription.utr && (
                              <p className="text-[9px] font-mono text-emerald-400 mt-1">
                                UTR: {cust.subscription.utr}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 text-xs">No active plan</span>
                        )}
                      </td>

                      <td className="p-3.5 align-top text-right font-mono text-[11px] text-slate-400">
                        {new Date(cust.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 4: DELIVERY ZONES & HUB LOGISTICS                                 */}
      {/* ===================================================================== */}
      {activeTab === 'ZONES' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
            <div>
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                <span>📍</span> Patna Coverage Delivery Zones
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Serviceable postal codes, dedicated riders, and order dispatch densities.
              </p>
            </div>
            <Link
              href="/admin/zones"
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 transition-all cursor-pointer"
            >
              + Configure Zones
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.zones.map((zone) => (
              <div
                key={zone.id}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    PIN: {zone.pincode}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                      zone.isActive
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-red-500/20 text-red-300'
                    }`}
                  >
                    {zone.isActive ? 'Active Coverage' : 'Paused'}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-black text-white">{zone.neighborhood}</h3>
                  <p className="text-xs text-slate-400">{zone.city}, {zone.state}</p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Assigned Riders:</span>
                  <span className="font-bold font-mono text-amber-400">{zone.ridersCount} Active</span>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => {
                      setActiveTab('ORDERS');
                      setOrderSearch(zone.pincode);
                    }}
                    className="w-full py-1.5 rounded-lg text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all text-center"
                  >
                    View Orders in {zone.pincode} →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
