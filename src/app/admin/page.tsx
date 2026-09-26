'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface OrderRecord {
  id: string;
  status: string;
  createdAt?: string;
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
    allergies?: string | null;
    fitnessGoal?: string | null;
    dietaryPreference?: string | null;
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

  // Delivery Date Mode: defaults smart based on IST time
  type DeliveryDateMode = 'TODAY' | 'TOMORROW' | 'CUSTOM';
  const [deliveryDateMode, setDeliveryDateMode] = useState<DeliveryDateMode>('TODAY');
  const [customDeliveryDate, setCustomDeliveryDate] = useState('');

  const [autoAssigning, setAutoAssigning] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Inspector & Actions Modal State
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [failingOrder, setFailingOrder] = useState<OrderRecord | null>(null);
  const [failReason, setFailReason] = useState<string>('Customer unreachable / phone switched off');
  const [customFailReason, setCustomFailReason] = useState<string>('');
  const [submittingFail, setSubmittingFail] = useState(false);

  // Filters for Customers Tab
  const [customerSearch, setCustomerSearch] = useState('');
  const [dietFilter, setDietFilter] = useState('ALL');

  // Helper: Compute the target delivery date string (YYYY-MM-DD IST)
  const getTargetDeliveryDateStr = (mode: DeliveryDateMode, custom: string): string => {
    if (mode === 'CUSTOM' && custom) return custom;
    const base = new Date();
    if (mode === 'TOMORROW') base.setDate(base.getDate() + 1);
    // Format as IST YYYY-MM-DD
    const istMs = base.getTime() + 5.5 * 60 * 60 * 1000;
    const d = new Date(istMs);
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(d.getUTCDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const fetchDashboardData = async (mode?: DeliveryDateMode, custom?: string) => {
    const resolvedMode = mode ?? deliveryDateMode;
    const resolvedCustom = custom ?? customDeliveryDate;
    const dateStr = getTargetDeliveryDateStr(resolvedMode, resolvedCustom);
    try {
      setRefreshing(true);
      const res = await fetch(`/api/admin/dashboard?deliveryDate=${dateStr}`);
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

  // On mount: smart default — after 10pm IST switch to TOMORROW
  useEffect(() => {
    const nowIST = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
    const hourIST = nowIST.getUTCHours();
    const initialMode: DeliveryDateMode = hourIST >= 22 ? 'TOMORROW' : 'TODAY';
    setDeliveryDateMode(initialMode);
    fetchDashboardData(initialMode, '');
  }, []);

  // Auto-refresh every 2 minutes when on Orders tab
  useEffect(() => {
    if (activeTab !== 'ORDERS') return;
    const interval = setInterval(() => fetchDashboardData(), 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [activeTab, deliveryDateMode, customDeliveryDate]);


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
        <div className="w-10 h-10 border-3 border-brand-mustard border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-mono text-brand-forest-muted">Loading Operations Command Center...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-24">
        <div className="inline-block p-6 rounded-3xl bg-brand-card border border-brand-border max-w-md">
          <p className="text-base font-bold text-red-400 mb-2">Access Denied or Session Expired</p>
          <p className="text-xs text-brand-forest-muted mb-4">
            Could not fetch operations telemetry. Please verify you are authenticated as Administrator.
          </p>
          <Link
            href="/admin/login"
            className="inline-block px-5 py-2.5 rounded-xl font-bold text-xs bg-brand-mustard text-brand-forest hover:bg-brand-forest-muted transition-all"
          >
            Authenticate via Admin Portal →
          </Link>
        </div>
      </div>
    );
  }

  // Filter Orders for Tab 1
  // Date filtering is now done SERVER-SIDE by deliveryDate param.
  // Client only handles status + search filters.
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

  // Helper: Sanitize Legacy Plan Names
  const formatPlanName = (rawName?: string | null) => {
    if (!rawName) return 'Fresh Bloom Prep';
    return rawName
      .replace(/7D\s*Trial/gi, 'Trial')
      .replace(/7-DAY\s*WEEKLY\s*PLAN\s*\(7\s*Days\)/gi, 'Weekly Plan')
      .replace(/7-Day/gi, 'Weekly')
      .trim();
  };

  // Helper: Strip base64 image data from delivery note for table preview
  const displayNote = (note: string | null): string => {
    if (!note) return '';
    return note
      .replace(/PROOF:\s*data:[^\s|\]]+/g, 'PROOF: [📸 Screenshot]')
      .replace(/\s*\|\s*$/, '')
      .trim();
  };


  // Helper: 1-Click Export Filtered Dispatch to CSV
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      alert('No orders in the current filtered view to export.');
      return;
    }

    const headers = [
      'Order ID',
      'Date Placed',
      'Delivery Date',
      'Delivery Slot',
      'Customer Name',
      'Phone',
      'Address',
      'Pincode',
      'Diet Plan',
      'Calories',
      'Dietary Preference',
      'Customer Allergies',
      'Delivery Note',
      'Assigned Rider',
      'Rider Phone',
      'Status',
      'Payment UTR',
    ];

    const escapeCSV = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = filteredOrders.map((o) => [
      escapeCSV(`ORD-${o.id.slice(-5).toUpperCase()}`),
      escapeCSV(o.createdAt ? new Date(o.createdAt).toLocaleString('en-IN') : ''),
      escapeCSV(new Date(o.deliveryDate).toLocaleDateString('en-IN')),
      escapeCSV(o.deliveryTime || '07:00 AM'),
      escapeCSV(o.user.name),
      escapeCSV(o.user.phone),
      escapeCSV(o.address.street),
      escapeCSV(o.address.pincode),
      escapeCSV(formatPlanName(o.subscription?.product?.name)),
      escapeCSV(o.subscription?.product?.calories || ''),
      escapeCSV(o.user.dietaryPreference || 'VEG'),
      escapeCSV(o.user.allergies || 'None'),
      escapeCSV(o.deliveryNote || ''),
      escapeCSV(o.rider?.name || 'Unassigned'),
      escapeCSV(o.rider?.phone || ''),
      escapeCSV(o.status),
      escapeCSV(o.subscription?.utr || ''),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    link.setAttribute('href', url);
    link.setAttribute('download', `thebloomaa_dispatch_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handler: Confirm Order Failure with Reason
  const handleConfirmFail = async () => {
    if (!failingOrder) return;
    const finalReason = failReason === 'OTHER' ? customFailReason.trim() : failReason;
    if (!finalReason) {
      alert('Please specify the reason why delivery could not be completed.');
      return;
    }
    setSubmittingFail(true);
    try {
      const existingNote = failingOrder.deliveryNote ? `${failingOrder.deliveryNote} | ` : '';
      const updatedNote = `${existingNote}⚠️ FAILED: ${finalReason}`;
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: failingOrder.id,
          status: 'FAILED',
          deliveryNote: updatedNote,
        }),
      });
      if (res.ok) {
        setData((prev) => {
          if (!prev) return prev;
          const updatedOrders = prev.orders.map((o) =>
            o.id === failingOrder.id
              ? { ...o, status: 'FAILED', deliveryNote: updatedNote }
              : o
          );
          const failedCount = updatedOrders.filter((o) => o.status === 'FAILED').length;
          return {
            ...prev,
            orders: updatedOrders,
            metrics: { ...prev.metrics, failedToday: failedCount },
          };
        });
        setFeedbackMsg({ text: `Order marked as FAILED (${finalReason}).`, type: 'success' });
        if (selectedOrder?.id === failingOrder.id) {
          setSelectedOrder((prev) => prev ? { ...prev, status: 'FAILED', deliveryNote: updatedNote } : null);
        }
        setFailingOrder(null);
        setFailReason('Customer unreachable / phone switched off');
        setCustomFailReason('');
      } else {
        setFeedbackMsg({ text: 'Failed to update order status.', type: 'error' });
      }
    } catch {
      setFeedbackMsg({ text: 'Network error updating order.', type: 'error' });
    } finally {
      setSubmittingFail(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-brand-border">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-brand-mustard/10 text-brand-mustard border border-brand-mustard/30">
              Systematic Command Center
            </span>
            <span className="text-xs text-brand-forest-muted font-mono">Patna Central Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-brand-forest">
            Operations &amp; Dispatch Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-brand-forest-muted mt-1">
            View today&apos;s scheduled deliveries, assign riders, verify drops, and prep tomorrow&apos;s manifest.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleAutoAssign}
            disabled={autoAssigning}
            className="px-3.5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-brand-mustard to-brand-mustard hover:from-brand-forest-muted hover:to-brand-mustard text-brand-forest transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
            title="Automatically route unassigned orders to zone riders"
          >
            <span>⚡</span>
            <span>{autoAssigning ? 'Routing...' : 'Auto-Assign Fleet'}</span>
          </button>
          <button
            type="button"
            onClick={() => fetchDashboardData()}
            disabled={refreshing}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-brand-card border border-brand-border hover:border-brand-border text-brand-forest hover:text-brand-forest transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span className={refreshing ? 'animate-spin' : ''}>🔄</span>
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Instant Action Feedback Toast */}
      {feedbackMsg && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between animate-fade-in shadow-xs ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          <span className="font-medium">
            {feedbackMsg.type === 'success' ? '✓ ' : '✕ '}
            {feedbackMsg.text}
          </span>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="font-bold ml-4 cursor-pointer text-brand-forest-muted hover:text-brand-forest"
          >
            ✕
          </button>
        </div>
      )}

      {/* Quick Action Telemetry Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {/* Unassigned Action Card */}
        <button
          onClick={() => {
            setActiveTab('ORDERS');
            setOrderFilter('UNASSIGNED');
          }}
          className={`text-left rounded-2xl p-3 sm:p-4 bg-brand-card/90 border transition-all cursor-pointer ${
            data.metrics.unassignedOrdersCount > 0
              ? 'border-brand-mustard/40 hover:border-brand-mustard shadow-lg shadow-brand-mustard/5'
              : 'border-brand-border hover:border-brand-border'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-base p-1.5 rounded-lg bg-brand-mustard/10 border border-brand-mustard/20">
              🚨
            </span>
            <span className="text-[10px] font-mono font-bold uppercase text-brand-mustard">Needs Rider</span>
          </div>
          <p className="text-2xl font-black font-mono text-brand-mustard">{data.metrics.unassignedOrdersCount}</p>
          <p className="text-xs font-bold text-brand-forest mt-0.5">Unassigned Orders</p>
          <p className="text-[10px] text-brand-forest-muted mt-0.5">Click to view &amp; assign →</p>
        </button>

        {/* Needs Verification Card */}
        <button
          onClick={() => {
            setActiveTab('ORDERS');
            setOrderFilter('RIDER_DELIVERED');
          }}
          className={`text-left rounded-2xl p-3 sm:p-4 bg-brand-card/90 border transition-all cursor-pointer ${
            data.metrics.needsVerificationCount > 0
              ? 'border-yellow-400/50 hover:border-yellow-300 shadow-lg shadow-yellow-500/10 animate-pulse'
              : 'border-brand-border hover:border-brand-border'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-base p-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              ⏳
            </span>
            <span className="text-[10px] font-mono font-bold uppercase text-yellow-300">Rider Dropped</span>
          </div>
          <p className="text-2xl font-black font-mono text-yellow-300">{data.metrics.needsVerificationCount}</p>
          <p className="text-xs font-bold text-brand-forest mt-0.5">Pending Double-Mark</p>
          <p className="text-[10px] text-yellow-400/80 mt-0.5">Double-verify deliveries →</p>
        </button>

        {/* Double-Verified Today */}
        <button
          onClick={() => {
            setActiveTab('ORDERS');
            setOrderFilter('DELIVERED');
          }}
          className="text-left rounded-2xl p-4 bg-brand-card/90 border border-brand-mustard/20 hover:border-brand-mustard/40 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-base p-1.5 rounded-lg bg-brand-mustard/10 border border-brand-mustard/20">
              ✓✓
            </span>
            <span className="text-[10px] font-mono font-bold uppercase text-brand-mustard">{data.metrics.deliveryRate}% Rate</span>
          </div>
          <p className="text-2xl font-black font-mono text-brand-mustard">{data.metrics.doubleVerifiedCount}</p>
          <p className="text-xs font-bold text-brand-forest mt-0.5">Double-Verified Deliveries</p>
          <p className="text-[10px] text-brand-forest-muted mt-0.5">Completed drops today</p>
        </button>

        {/* Active Fleet & Subscribers */}
        <div className="rounded-2xl p-4 bg-brand-card/90 border border-brand-border">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-base p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
              🚴
            </span>
            <span className="text-[10px] font-mono font-bold uppercase text-blue-400">Patna Coverage</span>
          </div>
          <p className="text-2xl font-black font-mono text-blue-400">{data.metrics.activeRidersCount} Riders</p>
          <p className="text-xs font-bold text-brand-forest mt-0.5">{data.metrics.activeSubs} Active Subscribers</p>
          <p className="text-[10px] text-brand-forest-muted mt-0.5">Across {data.zones.length} delivery zones</p>
        </div>
      </div>

      {/* Systematic 4-Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-brand-border pb-2.5 overflow-x-auto no-scrollbar">
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
                ? 'bg-brand-mustard text-brand-forest shadow-md'
                : 'bg-brand-card/80 text-brand-forest-muted hover:text-brand-forest border border-brand-border'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                activeTab === tab.id ? 'bg-brand-cream/20 text-brand-forest font-black' : 'bg-brand-cream text-brand-forest-muted'
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
          <div className="flex flex-col gap-3.5 p-4 rounded-2xl bg-brand-card/90 border border-brand-border">
            {/* Row 1: Status Pills & Search Box */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              {/* Filter Pills */}
              <div className="flex flex-nowrap sm:flex-wrap gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
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
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap min-h-[38px] ${
                      orderFilter === pill.id
                        ? 'bg-brand-mustard text-brand-forest shadow-sm'
                        : 'bg-brand-cream text-brand-forest-muted hover:text-brand-forest border border-brand-border'
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>

              {/* Search Box & Export */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Search order, customer, phone, PIN..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full sm:w-64 px-3.5 py-2 pl-8 rounded-xl bg-brand-cream border border-brand-border text-base sm:text-xs text-brand-forest placeholder:text-brand-forest-muted/70 focus:outline-none focus:border-brand-mustard min-h-[40px]"
                  />
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-brand-forest-muted/70">🔍</span>
                </div>

                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white hover:bg-brand-cream text-brand-forest border border-brand-border transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs min-h-[40px] whitespace-nowrap"
                  title="Download CSV manifest of current filtered view"
                >
                  <span>📥</span>
                  <span>Export Manifest</span>
                </button>
              </div>
            </div>

            {/* Row 2: Delivery Date Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-brand-border/70">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-brand-forest flex items-center gap-1.5">
                  <span className="text-sm">🚚</span>
                  <span>Delivery Date:</span>
                </span>

                {/* Mode Buttons */}
                <div className="flex flex-wrap gap-1.5">
                  {([
                    { id: 'TODAY' as const, label: "Today's Deliveries" },
                    { id: 'TOMORROW' as const, label: '🌙 Tomorrow (Prep Mode)' },
                  ] as { id: 'TODAY' | 'TOMORROW'; label: string }[]).map((btn) => (
                    <button
                      key={btn.id}
                      type="button"
                      onClick={() => {
                        setDeliveryDateMode(btn.id);
                        setCustomDeliveryDate('');
                        fetchDashboardData(btn.id, '');
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

                {/* Custom Date Picker */}
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
                        fetchDashboardData('CUSTOM', val);
                      } else {
                        setDeliveryDateMode('TODAY');
                        fetchDashboardData('TODAY', '');
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
                        fetchDashboardData('TODAY', '');
                      }}
                      className="px-2 py-1 rounded-lg text-[11px] font-bold bg-brand-cream text-brand-forest-muted hover:text-red-500 border border-brand-border cursor-pointer"
                      title="Clear custom date"
                    >
                      ✕ Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Status Badge: order count + prep mode banner */}
              <div className="flex items-center gap-2 flex-wrap">
                {deliveryDateMode === 'TOMORROW' && !customDeliveryDate && (
                  <div className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 flex items-center gap-1.5 animate-pulse">
                    <span>🌙</span>
                    <span>Prep Mode — Tomorrow&apos;s orders</span>
                  </div>
                )}
                <div className="text-xs font-semibold text-brand-mustard bg-brand-mustard/15 px-3 py-1 rounded-full border border-brand-mustard/30 flex items-center gap-1.5">
                  <span>📦</span>
                  <span className="font-bold font-mono text-brand-forest">{filteredOrders.length}</span>
                  <span>
                    order{filteredOrders.length === 1 ? '' : 's'}{' '}
                    {deliveryDateMode === 'TODAY' && !customDeliveryDate ? 'for today' :
                     deliveryDateMode === 'TOMORROW' && !customDeliveryDate ? 'for tomorrow' :
                     customDeliveryDate ? `for ${new Date(`${customDeliveryDate}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>


          {/* Orders Table */}
          <div className="rounded-2xl bg-brand-card/90 border border-brand-border overflow-hidden shadow-xl">
            {filteredOrders.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <p className="text-brand-forest-muted/70 text-xs font-medium">
                  No orders scheduled for delivery on{' '}
                  {deliveryDateMode === 'TODAY' && !customDeliveryDate ? 'today' :
                   deliveryDateMode === 'TOMORROW' && !customDeliveryDate ? 'tomorrow' :
                   customDeliveryDate ? new Date(`${customDeliveryDate}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'the selected date'}.
                </p>
                <p className="text-[11px] text-brand-forest-muted/50">Try switching to a different delivery date above.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-brand-cream/80 border-b border-brand-border text-brand-forest-muted uppercase tracking-wider text-[10px] font-black">
                      <th className="p-3.5 w-[170px]">Order / Customer</th>
                      <th className="p-3.5 w-[180px]">Delivery Address</th>
                      <th className="p-3.5 w-[120px]">Diet Plan</th>
                      <th className="p-3.5 w-[160px]">Slot &amp; Note</th>
                      <th className="p-3.5 w-[150px]">Assigned Rider</th>
                      <th className="p-3.5 w-[160px]">Status &amp; Payment</th>
                      <th className="p-3.5 text-right w-[180px]">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/80">
                    {filteredOrders.map((order) => {
                      const shortId = `ORD-${order.id.slice(-5).toUpperCase()}`;
                      const isRiderDelivered = order.status === 'RIDER_DELIVERED';
                      const isDoubleVerified = order.status === 'DELIVERED';

                      return (
                        <tr key={order.id} className="hover:bg-brand-cream/30 transition-colors">
                          {/* Order / Customer */}
                          <td className="p-3.5 align-top">
                            <button
                              type="button"
                              onClick={() => setSelectedOrder(order)}
                              className="font-mono font-bold text-brand-forest hover:text-brand-mustard text-xs text-left cursor-pointer underline decoration-dotted flex items-center gap-1"
                              title="Click to view full manifest & customer inspector"
                            >
                              <span>{shortId}</span>
                              <span className="text-[10px] text-brand-mustard">🔍</span>
                            </button>
                            <span className="font-semibold text-brand-forest-muted block mt-0.5">{order.user.name}</span>
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
                            {order.user.phone ? (
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[11px] text-brand-forest-muted font-mono">📱 {order.user.phone}</span>
                                <a
                                  href={`https://wa.me/91${order.user.phone.replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] font-bold text-brand-mustard hover:text-brand-mustard-hover hover:underline"
                                  title="Chat on WhatsApp"
                                >
                                  (WA)
                                </a>
                              </div>
                            ) : (
                              <span className="text-[11px] text-brand-forest-muted/70 font-mono">No phone</span>
                            )}
                          </td>

                          {/* Address & GPS */}
                          <td className="p-3.5 align-top max-w-[200px]">
                            <p className="font-medium text-brand-forest-muted line-clamp-2">{order.address.street}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-black text-brand-mustard uppercase font-mono">
                                PIN: {order.address.pincode}
                              </span>
                              {order.address.mapsUrl && (
                                <a
                                  href={order.address.mapsUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] font-bold text-brand-mustard hover:underline flex items-center gap-0.5"
                                >
                                  <span>🗺️</span>
                                  <span>Map</span>
                                </a>
                              )}
                            </div>
                          </td>

                          {/* Diet Plan */}
                          <td className="p-3.5 align-top">
                            <span className="font-bold text-brand-forest block">
                              {formatPlanName(order.subscription?.product?.name)}
                            </span>
                            <span className="text-[10px] text-brand-forest-muted block mt-0.5">
                              🔥 {order.subscription?.product?.calories || 520} kcal
                            </span>
                            {order.user.dietaryPreference && (
                              <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 mt-1">
                                {order.user.dietaryPreference}
                              </span>
                            )}
                          </td>

                          {/* Slot & Note */}
                          <td className="p-3.5 align-top w-[160px] max-w-[160px]">
                            <span className="inline-block px-2 py-0.5 rounded bg-brand-cream text-brand-forest-muted font-mono text-[10px] mb-1">
                              ⏰ {order.deliveryTime || '07:00 AM'}
                            </span>
                            {order.user.allergies && order.user.allergies !== 'None' && (
                              <div
                                onClick={() => setSelectedOrder(order)}
                                className="mb-1 p-1.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-[10px] font-bold leading-tight flex items-start gap-1 cursor-pointer hover:bg-amber-100 transition-all shadow-xs"
                                title={`Allergies: ${order.user.allergies} (Click to inspect)`}
                              >
                                <span>⚠️</span>
                                <span className="truncate">Allergies: {order.user.allergies}</span>
                              </div>
                            )}
                            {order.deliveryNote && (
                              <div
                                onClick={() => setSelectedOrder(order)}
                                className="p-1.5 rounded-lg bg-brand-mustard/10 border border-brand-mustard/30 text-brand-forest text-[10px] font-medium cursor-pointer hover:bg-brand-mustard/20 transition-all line-clamp-3 break-words"
                                title="Click to view full note & receipt in inspector"
                              >
                                <span>📝 </span>
                                <span>{displayNote(order.deliveryNote)}</span>
                              </div>
                            )}
                          </td>

                          {/* Assigned Rider (Dropdown) */}
                          <td className="p-3.5 align-top">
                            <select
                              value={order.riderId || ''}
                              onChange={(e) => handleAssignRider(order.id, e.target.value)}
                              className="px-2 py-1 rounded-lg bg-brand-cream border border-brand-border text-xs font-bold text-brand-forest focus:outline-none focus:border-brand-mustard max-w-[150px]"
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
                                <span className="text-[10px] font-mono text-brand-mustard">📱 {order.rider.phone}</span>
                                <a
                                  href={`https://wa.me/91${order.rider.phone.replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[9px] font-bold text-brand-mustard hover:text-brand-mustard-hover hover:underline"
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
                                    ? 'bg-brand-mustard/20 text-brand-mustard border border-brand-mustard/40'
                                    : isRiderDelivered
                                    ? 'bg-brand-mustard/20 text-brand-forest-muted border border-brand-mustard/40 animate-pulse'
                                    : order.status === 'FAILED'
                                    ? 'bg-red-500/20 text-red-600 border border-red-500/30'
                                    : 'bg-blue-500/20 text-blue-600 border border-blue-500/30'
                                }`}
                              >
                                {isRiderDelivered
                                  ? '🚴 Rider Delivered (Needs Check)'
                                  : isDoubleVerified
                                  ? '✓✓ Double Verified'
                                  : order.status}
                              </span>

                              {order.riderDeliveredAt && (
                                <span className="text-[10px] font-mono text-brand-forest-muted/90 flex items-center gap-1">
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
                                <span className="text-[10px] font-mono text-brand-mustard/90 flex items-center gap-1">
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
                                <span className="text-[9px] font-mono text-brand-mustard block truncate max-w-[120px]" title={order.subscription.utr}>
                                  UTR: {order.subscription.utr}
                                </span>
                              )}

                              {(() => {
                                const note = order.deliveryNote || '';
                                const proofMatch = note.match(/PROOF:\s*([^\s|\]]+)/);
                                const screenshotUrl = proofMatch ? proofMatch[1] : null;
                                const modeMatch = note.match(/Mode:\s*([^|\]]+)/);
                                const mode = modeMatch ? modeMatch[1].trim() : null;

                                return (
                                  <div className="mt-1 space-y-0.5">
                                    {mode === 'Pay on Delivery' ? (
                                      <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/15 text-amber-800 border border-amber-500/30">
                                        🚚 POD
                                      </span>
                                    ) : screenshotUrl ? (
                                      <button
                                        type="button"
                                        onClick={() => setSelectedOrder(order)}
                                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-2xs transition-all"
                                        title="Click to view payment receipt screenshot in inspector"
                                      >
                                        <span>📸</span>
                                        <span>Receipt Proof</span>
                                      </button>
                                    ) : null}
                                  </div>
                                );
                              })()}
                            </div>
                          </td>

                          {/* Admin Actions */}
                          <td className="p-3.5 align-top text-right">
                            <div className="flex flex-col items-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setSelectedOrder(order)}
                                className="px-2.5 py-1 rounded-lg bg-white hover:bg-brand-cream text-brand-forest border border-brand-border font-bold text-[10px] cursor-pointer transition-all shadow-xs flex items-center gap-1 whitespace-nowrap"
                                title="Inspect complete order details, allergies, address and rider"
                              >
                                <span>👁️</span>
                                <span>Details</span>
                              </button>

                              {order.subscription?.status === 'PENDING' && (
                                <button
                                  type="button"
                                  onClick={() => handleActivateSubscription(order.id)}
                                  className="px-2.5 py-1 rounded-lg bg-brand-mustard/20 hover:bg-brand-mustard/30 text-brand-forest-muted border border-brand-mustard/40 font-bold text-[10px] cursor-pointer transition-all whitespace-nowrap"
                                  title="Activate subscription and verify payment"
                                >
                                  Verify Plan ⚡
                                </button>
                              )}

                              {isRiderDelivered && (
                                <button
                                  type="button"
                                  onClick={() => handleDoubleVerify(order.id)}
                                  className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-brand-mustard to-teal-400 hover:opacity-90 text-brand-forest font-black text-[10px] cursor-pointer transition-all shadow-md flex items-center gap-1 whitespace-nowrap"
                                  title="Confirm doorstep drop and mark double verified"
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
                                    setFailingOrder(order);
                                    setFailReason('Customer unreachable / phone switched off');
                                    setCustomFailReason('');
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 font-bold text-[10px] hover:bg-red-100 cursor-pointer transition-all whitespace-nowrap"
                                  title="Mark order as failed with reason dialog"
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
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: DELIVERY FLEET & RIDERS                                        */}
      {/* ===================================================================== */}
      {activeTab === 'RIDERS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-brand-card/90 border border-brand-border">
            <div>
              <h2 className="text-sm font-black text-brand-forest flex items-center gap-2">
                <span>🚴</span> Active Delivery Fleet
              </h2>
              <p className="text-xs text-brand-forest-muted mt-0.5">
                Patna logistics fleet, vehicle allocation, and daily drop manifest progress.
              </p>
            </div>
            <Link
              href="/admin/riders"
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-brand-mustard text-brand-forest hover:bg-brand-forest-muted transition-all cursor-pointer"
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
                  className="p-5 rounded-2xl bg-brand-card/90 border border-brand-border hover:border-brand-border transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-mustard/10 text-brand-mustard border border-brand-mustard/30">
                        {rider.vehicleType || 'Bike'}
                      </span>
                      <span className="text-[11px] font-mono text-brand-forest-muted font-bold">
                        {rider.vehicleNumber}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-brand-forest">{rider.name}</h3>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-mono text-brand-forest-muted">📱 {rider.phone}</span>
                      <a
                        href={`https://wa.me/91${rider.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-bold text-brand-mustard hover:underline"
                      >
                        (WhatsApp)
                      </a>
                    </div>

                    <div className="mt-3 p-2.5 rounded-xl bg-brand-cream border border-brand-border/80">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-brand-forest-muted">Assigned Zone</p>
                      <p className="text-xs font-bold text-brand-forest mt-0.5">
                        {rider.assignedZone
                          ? `${rider.assignedZone.neighborhood || 'Patna Zone'} (${rider.assignedZone.pincode})`
                          : 'Central Patna (All Zones)'}
                      </p>
                    </div>

                    {/* Today's Drops Progress */}
                    <div className="mt-3 space-y-1.5">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-brand-forest-muted">Today's Manifest Load:</span>
                        <span className="text-brand-mustard font-mono">
                          {rider.todayCompletedDrops} / {rider.todayTotalDrops} Drops ({progressPct}%)
                        </span>
                      </div>
                      <div className="w-full bg-brand-cream rounded-full h-2 overflow-hidden border border-brand-border">
                        <div
                          className="bg-gradient-to-r from-brand-mustard to-brand-mustard h-2 rounded-full transition-all"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-brand-border flex items-center justify-between">
                    <Link
                      href={`/rider/manifest?riderId=${rider.id}`}
                      target="_blank"
                      className="text-xs font-black text-brand-mustard hover:text-brand-forest-muted flex items-center gap-1"
                    >
                      <span>Open Rider Manifest</span>
                      <span>↗</span>
                    </Link>
                    <button
                      onClick={() => {
                        setActiveTab('ORDERS');
                        setOrderSearch(rider.name);
                      }}
                      className="text-[11px] font-bold text-brand-forest-muted hover:text-brand-forest"
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 rounded-2xl bg-brand-card/90 border border-brand-border">
            <div>
              <h2 className="text-sm font-black text-brand-forest flex items-center gap-2">
                <span>👥</span> Registered Member Directory
              </h2>
              <p className="text-xs text-brand-forest-muted mt-0.5">
                Patna subscribers, nutrition preferences, GPS pinned locations, and active plans.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <input
                type="text"
                placeholder="Search member, phone, address..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="px-3.5 py-1.5 rounded-xl bg-brand-cream border border-brand-border text-xs text-brand-forest placeholder:text-brand-forest-muted/70 focus:outline-none focus:border-brand-mustard w-60"
              />
              <select
                value={dietFilter}
                onChange={(e) => setDietFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-brand-cream border border-brand-border text-xs text-brand-forest-muted font-bold focus:outline-none focus:border-brand-mustard"
              >
                <option value="ALL">All Diets (100% Veg)</option>
                <option value="VEG">Pure Veg</option>
                <option value="VEGAN">Vegan</option>
                <option value="HIGH_PROTEIN">High Protein Veg</option>
                <option value="LIVING_RAW">Living Raw</option>
              </select>
            </div>
          </div>

          <div className="rounded-2xl bg-brand-card/90 border border-brand-border overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-brand-cream/80 border-b border-brand-border text-brand-forest-muted uppercase tracking-wider text-[10px] font-black">
                    <th className="p-3.5">Member Profile</th>
                    <th className="p-3.5">Nutrition &amp; Allergies</th>
                    <th className="p-3.5">Pinned Street &amp; GPS</th>
                    <th className="p-3.5">Active Diet Subscription</th>
                    <th className="p-3.5 text-right">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/80">
                  {filteredCustomers.map((cust) => (
                    <tr key={cust.id} className="hover:bg-brand-cream/30 transition-colors">
                      <td className="p-3.5 align-top">
                        <div className="font-bold text-brand-forest text-sm">{cust.name}</div>
                        <div className="font-mono text-[11px] text-brand-forest-muted">{cust.email}</div>
                        {cust.phone && cust.phone !== 'N/A' && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="font-mono text-[11px] text-brand-mustard">📱 {cust.phone}</span>
                            <a
                              href={`https://wa.me/91${cust.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] font-bold text-brand-mustard hover:underline"
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
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-brand-mustard/15 text-brand-mustard-hover border border-brand-mustard/30">
                            {cust.dietaryPreference.replace(/_/g, ' ')}
                          </span>
                        </div>
                        {cust.allergies && cust.allergies !== 'None' && (
                          <p className="text-[10px] text-brand-forest-muted font-bold mt-1">⚠️ {cust.allergies}</p>
                        )}
                      </td>

                      <td className="p-3.5 align-top max-w-[220px]">
                        <p className="text-brand-forest-muted font-medium">{cust.address.street}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-mono font-black text-brand-mustard">
                            PIN: {cust.address.pincode}
                          </span>
                          {cust.address.mapsUrl && (
                            <a
                              href={cust.address.mapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] font-bold text-brand-mustard hover:underline"
                            >
                              🗺️ Maps ↗
                            </a>
                          )}
                        </div>
                      </td>

                      <td className="p-3.5 align-top">
                        {cust.subscription ? (
                          <div>
                            <span className="font-bold text-brand-forest block">{cust.subscription.planName}</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span
                                className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                  cust.subscription.status === 'ACTIVE'
                                    ? 'bg-brand-mustard/20 text-brand-mustard-hover border border-brand-mustard/30'
                                    : 'bg-brand-mustard/20 text-brand-forest-muted border border-brand-mustard/30'
                                }`}
                              >
                                {cust.subscription.status}
                              </span>
                              <span className="text-[10px] text-brand-forest-muted font-mono">
                                {cust.subscription.deliveriesLeft} drops left
                              </span>
                            </div>
                            {cust.subscription.utr && (
                              <p className="text-[9px] font-mono text-brand-mustard mt-1">
                                UTR: {cust.subscription.utr}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-brand-forest-muted/70 text-xs">No active plan</span>
                        )}
                      </td>

                      <td className="p-3.5 align-top text-right font-mono text-[11px] text-brand-forest-muted">
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
          <div className="flex items-center justify-between p-4 rounded-2xl bg-brand-card/90 border border-brand-border">
            <div>
              <h2 className="text-sm font-black text-brand-forest flex items-center gap-2">
                <span>📍</span> Patna Coverage Delivery Zones
              </h2>
              <p className="text-xs text-brand-forest-muted mt-0.5">
                Serviceable postal codes, dedicated riders, and order dispatch densities.
              </p>
            </div>
            <Link
              href="/admin/zones"
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-brand-mustard text-brand-forest hover:bg-brand-forest-muted transition-all cursor-pointer"
            >
              + Configure Zones
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.zones.map((zone) => (
              <div
                key={zone.id}
                className="p-5 rounded-2xl bg-brand-card/90 border border-brand-border space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black font-mono bg-brand-mustard/10 text-brand-mustard border border-brand-mustard/30">
                    PIN: {zone.pincode}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                      zone.isActive
                        ? 'bg-brand-mustard/20 text-brand-mustard-hover'
                        : 'bg-red-500/20 text-red-300'
                    }`}
                  >
                    {zone.isActive ? 'Active Coverage' : 'Paused'}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-black text-brand-forest">{zone.neighborhood}</h3>
                  <p className="text-xs text-brand-forest-muted">{zone.city}, {zone.state}</p>
                </div>

                <div className="pt-2 border-t border-brand-border flex items-center justify-between text-xs">
                  <span className="text-brand-forest-muted">Assigned Riders:</span>
                  <span className="font-bold font-mono text-brand-mustard">{zone.ridersCount} Active</span>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => {
                      setActiveTab('ORDERS');
                      setOrderSearch(zone.pincode);
                    }}
                    className="w-full py-1.5 rounded-lg text-[11px] font-bold bg-brand-cream hover:bg-brand-border text-brand-forest transition-all text-center"
                  >
                    View Orders in {zone.pincode} →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 1: ORDER DETAILS & MANIFEST INSPECTOR                           */}
      {/* ===================================================================== */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white border border-[#E6E0CF] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 my-8 text-brand-forest">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#E6E0CF] pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-full bg-brand-mustard/15 text-brand-forest border border-brand-mustard/30">
                    ORD-{selectedOrder.id.slice(-5).toUpperCase()}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      selectedOrder.status === 'DELIVERED'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                        : selectedOrder.status === 'RIDER_DELIVERED'
                        ? 'bg-amber-50 text-amber-800 border border-amber-300 animate-pulse'
                        : selectedOrder.status === 'FAILED'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}
                  >
                    {selectedOrder.status === 'RIDER_DELIVERED'
                      ? '🚴 Dropped (Pending Double-Verification)'
                      : selectedOrder.status === 'DELIVERED'
                      ? '✓✓ Double Verified'
                      : selectedOrder.status}
                  </span>
                </div>
                <h2 className="text-xl font-black text-brand-forest">Order Manifest Inspector</h2>
                <p className="text-xs text-brand-forest-muted mt-0.5">
                  Placed: {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString('en-IN') : 'N/A'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-xl text-brand-forest-muted hover:text-brand-forest hover:bg-brand-cream transition-colors text-sm font-bold cursor-pointer"
                title="Close dialog"
              >
                ✕
              </button>
            </div>

            {/* Allergies / Special Exclusions Banner (Priority Alert) */}
            {((selectedOrder.user.allergies && selectedOrder.user.allergies !== 'None') || selectedOrder.deliveryNote) && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 shadow-xs space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-base">⚠️</span>
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-900">
                    Kitchen Prep &amp; Allergy Caution
                  </h4>
                </div>
                {selectedOrder.user.allergies && selectedOrder.user.allergies !== 'None' && (
                  <p className="text-xs font-bold text-amber-950">
                    Customer Allergies: <span className="underline decoration-amber-500 font-extrabold">{selectedOrder.user.allergies}</span>
                  </p>
                )}
                {selectedOrder.deliveryNote && (
                  <p className="text-xs text-amber-900 leading-relaxed font-medium">
                    Delivery &amp; Customer Note: {selectedOrder.deliveryNote}
                  </p>
                )}
              </div>
            )}

            {/* Grid: Customer & Delivery Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Customer Box */}
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E6E0CF] space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-forest-muted block">
                  Customer Profile
                </span>
                <p className="text-sm font-bold text-brand-forest">{selectedOrder.user.name}</p>
                <div className="flex items-center gap-2 text-xs font-mono text-brand-forest">
                  <span>📱 {selectedOrder.user.phone || 'No phone'}</span>
                  {selectedOrder.user.phone && (
                    <a
                      href={`https://wa.me/91${selectedOrder.user.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                    >
                      WhatsApp 💬
                    </a>
                  )}
                </div>
                <p className="text-xs text-brand-forest-muted font-mono">{selectedOrder.user.email}</p>
                <div className="flex items-center gap-2 pt-1 border-t border-[#E6E0CF]/60 text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-white border border-[#E6E0CF] font-bold text-brand-forest">
                    {selectedOrder.user.dietaryPreference || 'VEG'}
                  </span>
                  <span className="text-brand-forest-muted">
                    Goal: {selectedOrder.user.fitnessGoal || 'FITNESS'}
                  </span>
                </div>
              </div>

              {/* Destination Box */}
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E6E0CF] space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-forest-muted block">
                  Delivery Destination
                </span>
                <p className="text-xs font-medium text-brand-forest leading-relaxed">
                  {selectedOrder.address.street}
                </p>
                <p className="text-xs font-mono font-bold text-brand-mustard">
                  PIN: {selectedOrder.address.pincode} · {selectedOrder.address.city}
                </p>
                {selectedOrder.address.mapsUrl && (
                  <div className="pt-1">
                    <a
                      href={selectedOrder.address.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-white hover:bg-brand-cream border border-[#E6E0CF] text-brand-forest transition-colors shadow-xs"
                    >
                      <span>🗺️</span>
                      <span>Open in Google Maps →</span>
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Grid: Plan & Assigned Fleet */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Diet Plan Box */}
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E6E0CF] space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-forest-muted block">
                  Diet Plan &amp; Slot
                </span>
                <p className="text-sm font-black text-brand-forest">
                  {formatPlanName(selectedOrder.subscription?.product?.name)}
                </p>
                <div className="flex items-center gap-3 text-xs text-brand-forest-muted">
                  <span>🔥 {selectedOrder.subscription?.product?.calories || 520} kcal</span>
                  <span>⏰ Slot: {selectedOrder.deliveryTime || '07:00 AM'}</span>
                </div>
                <p className="text-xs font-mono text-brand-forest-muted">
                  Deliveries remaining: {selectedOrder.subscription?.deliveriesLeft ?? 0}
                </p>
                {selectedOrder.subscription?.utr && (
                  <p className="text-xs font-mono text-brand-forest bg-white px-2 py-1 rounded border border-[#E6E0CF]">
                    Payment UTR: {selectedOrder.subscription.utr}
                  </p>
                )}

                {(() => {
                  const note = selectedOrder.deliveryNote || '';
                  const proofMatch = note.match(/PROOF:\s*([^\s|\]]+)/);
                  const screenshotUrl = proofMatch ? proofMatch[1] : null;
                  const modeMatch = note.match(/Mode:\s*([^|\]]+)/);
                  const mode = modeMatch ? modeMatch[1].trim() : null;

                  if (!mode && !screenshotUrl) return null;

                  return (
                    <div className="space-y-2 pt-2 border-t border-[#E6E0CF]/60">
                      {mode && (
                        <p className="text-xs font-bold text-brand-forest">
                          Payment Mode: <span className="text-brand-mustard font-black">{mode}</span>
                        </p>
                      )}
                      {screenshotUrl && (
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-forest-muted block mb-1">
                            Payment Receipt Screenshot:
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              if (screenshotUrl.startsWith('data:')) {
                                const win = window.open();
                                win?.document.write(`<iframe src="${screenshotUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                              } else {
                                window.open(screenshotUrl, '_blank');
                              }
                            }}
                            className="block relative rounded-xl overflow-hidden border border-[#E6E0CF] group max-w-[220px] cursor-pointer"
                          >
                            <img
                              src={screenshotUrl}
                              alt="Receipt proof"
                              className="w-full h-32 object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold">
                              Click to Open ↗
                            </div>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Assigned Rider & Fleet */}
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E6E0CF] space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-forest-muted block">
                  Assigned Fleet Rider
                </span>
                <div className="space-y-2">
                  <select
                    value={selectedOrder.riderId || ''}
                    onChange={(e) => {
                      const newRiderId = e.target.value;
                      handleAssignRider(selectedOrder.id, newRiderId);
                      const riderObj = data.riders.find((r) => r.id === newRiderId) || null;
                      setSelectedOrder((prev) =>
                        prev
                          ? {
                              ...prev,
                              riderId: newRiderId || null,
                              rider: riderObj
                                ? { id: riderObj.id, name: riderObj.name, phone: riderObj.phone, vehicleType: riderObj.vehicleType }
                                : null,
                            }
                          : null
                      );
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E6E0CF] text-xs font-bold text-brand-forest focus:outline-none focus:border-brand-mustard shadow-xs"
                  >
                    <option value="">🚨 Unassigned (No Rider)</option>
                    {data.riders.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.vehicleType || 'Bike'} - {r.phone})
                      </option>
                    ))}
                  </select>

                  {selectedOrder.rider && (
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="font-mono text-brand-forest">📱 {selectedOrder.rider.phone}</span>
                      <a
                        href={`https://wa.me/91${selectedOrder.rider.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-0.5 rounded text-[10px] font-bold bg-white border border-[#E6E0CF] text-brand-forest hover:text-brand-mustard"
                      >
                        WhatsApp Rider 💬
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Quick Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E6E0CF]">
              <div className="flex items-center gap-2">
                {selectedOrder.status !== 'DELIVERED' && selectedOrder.status !== 'FAILED' && (
                  <button
                    type="button"
                    onClick={() => {
                      setFailingOrder(selectedOrder);
                      setFailReason('Customer unreachable / phone switched off');
                      setCustomFailReason('');
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-all cursor-pointer shadow-xs"
                  >
                    Mark Failed ✕
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {selectedOrder.status === 'RIDER_DELIVERED' && (
                  <button
                    type="button"
                    onClick={async () => {
                      await handleDoubleVerify(selectedOrder.id);
                      setSelectedOrder((prev) =>
                        prev
                          ? {
                              ...prev,
                              status: 'DELIVERED',
                              adminVerifiedAt: new Date().toISOString(),
                              deliveredAt: prev.deliveredAt || new Date().toISOString(),
                            }
                          : null
                      );
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-brand-mustard to-teal-500 text-brand-forest hover:opacity-90 shadow-md cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    <span>Double-Mark Verified</span>
                    <span>✓✓</span>
                  </button>
                )}

                {selectedOrder.status === 'QUEUED' && (
                  <button
                    type="button"
                    onClick={async () => {
                      await handleUpdateStatus(selectedOrder.id, 'DELIVERED');
                      setSelectedOrder((prev) =>
                        prev
                          ? {
                              ...prev,
                              status: 'DELIVERED',
                              deliveredAt: new Date().toISOString(),
                              adminVerifiedAt: new Date().toISOString(),
                            }
                          : null
                      );
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-mustard hover:bg-brand-mustard-hover text-white transition-all cursor-pointer shadow-sm"
                  >
                    Mark Delivered ✓
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-cream hover:bg-brand-border text-brand-forest border border-brand-border transition-all cursor-pointer shadow-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: CONFIRM ORDER FAILURE WITH REASON                            */}
      {/* ===================================================================== */}
      {failingOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-md bg-white border border-[#E6E0CF] rounded-3xl p-6 shadow-2xl space-y-4 my-8 text-brand-forest">
            <div className="flex items-start justify-between border-b border-[#E6E0CF] pb-3">
              <div>
                <h3 className="text-base font-black text-red-600 flex items-center gap-1.5">
                  <span>⚠️</span>
                  <span>Mark Order as Failed</span>
                </h3>
                <p className="text-xs text-brand-forest-muted mt-0.5">
                  ORD-{failingOrder.id.slice(-5).toUpperCase()} for {failingOrder.user.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFailingOrder(null)}
                className="text-brand-forest-muted hover:text-brand-forest text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5">
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
                  <span>{reason === 'OTHER' ? 'Other custom reason (type below)' : reason}</span>
                </label>
              ))}

              {failReason === 'OTHER' && (
                <textarea
                  value={customFailReason}
                  onChange={(e) => setCustomFailReason(e.target.value)}
                  placeholder="Type specific failure reason here..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E6E0CF] text-xs text-brand-forest placeholder:text-brand-forest-muted/60 focus:outline-none focus:border-brand-mustard mt-1"
                />
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E6E0CF]">
              <button
                type="button"
                disabled={submittingFail}
                onClick={() => setFailingOrder(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-cream hover:bg-brand-border text-brand-forest border border-brand-border cursor-pointer transition-all"
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
    </div>
  );
}
