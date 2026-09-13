'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

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
  };
  recentOrders: Array<{
    id: string;
    customer: string;
    phone: string;
    meal: string;
    status: string;
    time: string;
  }>;
  topMeals: Array<{
    name: string;
    subs: number;
    pct: number;
  }>;
  topZones: Array<{
    zone: string;
    orders: number;
  }>;
  customers: CustomerRecord[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dietFilter, setDietFilter] = useState('ALL');
  const [refreshing, setRefreshing] = useState(false);

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="w-10 h-10 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-mono text-slate-400">Loading live operational data...</p>
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

  // Filter customers
  const filteredCustomers = (data.customers || []).filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      c.address.street.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.address.pincode.includes(searchTerm);

    const matchDiet =
      dietFilter === 'ALL' ||
      c.dietaryPreference?.toUpperCase() === dietFilter.toUpperCase();

    return matchSearch && matchDiet;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-400/10 text-amber-300 border border-amber-400/30">
              Live Telemetry
            </span>
            <span className="text-xs text-slate-400 font-mono">Patna Central Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Operations & Customer Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time subscriber roster, pinned delivery coordinates, and kitchen prep orders.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchDashboardData}
            disabled={refreshing}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <span className={refreshing ? 'animate-spin' : ''}>🔄</span>
            <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Registered Members',
            value: data.metrics.totalCustomers.toString(),
            sub: 'Active Customer Profiles',
            icon: '👥',
            color: '#6EE7B7',
            border: 'border-emerald-500/20',
          },
          {
            label: 'Active Subscriptions',
            value: data.metrics.activeSubs.toString(),
            sub: 'Enrolled in Meal Plans',
            icon: '🥗',
            color: '#93C5FD',
            border: 'border-blue-500/20',
          },
          {
            label: "Today's Deliveries",
            value: data.metrics.todaysOrders.toString(),
            sub: `${data.metrics.deliveryRate}% Success Rate`,
            icon: '📦',
            color: '#FCD34D',
            border: 'border-amber-500/20',
          },
          {
            label: 'Estimated Revenue',
            value: `₹${(data.metrics.monthlyRevenue / 1000).toFixed(1)}k`,
            sub: 'Active Bundle Value',
            icon: '💰',
            color: '#C4B5FD',
            border: 'border-purple-500/20',
          },
        ].map((kpi, idx) => (
          <div
            key={idx}
            className={`rounded-2xl p-5 bg-slate-900/80 border ${kpi.border} shadow-lg backdrop-blur-sm`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xl p-2 rounded-xl bg-slate-950 border border-slate-800">
                {kpi.icon}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Patna
              </span>
            </div>
            <p className="text-3xl font-black font-mono tracking-tight" style={{ color: kpi.color }}>
              {kpi.value}
            </p>
            <p className="text-xs font-bold text-slate-200 mt-1">{kpi.label}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* ========================================================= */}
      {/* SECTION 2: REGISTERED CUSTOMER DIRECTORY & MAPS           */}
      {/* ========================================================= */}
      <div className="rounded-3xl p-6 sm:p-8 bg-slate-900/90 border border-slate-800 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>📍</span> Registered Members Directory
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {filteredCustomers.length} Users
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              All member sign-ups, fitness goals, and verified Google Maps pinned delivery addresses.
            </p>
          </div>

          {/* Search & Filter controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search name, phone, email, street..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 sm:w-80 px-4 py-2 pl-9 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-all font-medium"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                🔍
              </span>
            </div>

            <select
              value={dietFilter}
              onChange={(e) => setDietFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-300 font-bold focus:outline-none focus:border-amber-400"
            >
              <option value="ALL">All Diets</option>
              <option value="VEG">Pure Veg</option>
              <option value="NON_VEG">High-Protein Non-Veg</option>
              <option value="LIVING_RAW">Living Raw</option>
            </select>
          </div>
        </div>

        {/* Customer Table */}
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-xs">
            No customers match the current filter or search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-black tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Member Info</th>
                  <th className="py-3.5 px-4">Nutrition Profile</th>
                  <th className="py-3.5 px-4">Delivery Address & Pinned GPS</th>
                  <th className="py-3.5 px-4">Navigation Link</th>
                  <th className="py-3.5 px-4 text-right">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Member Info */}
                    <td className="py-4 px-4 align-top">
                      <div className="font-bold text-slate-100 text-sm">{cust.name}</div>
                      <div className="font-mono text-[11px] text-slate-400 mt-0.5">{cust.email}</div>
                      {cust.phone && cust.phone !== 'N/A' && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="font-mono text-[11px] text-emerald-400 font-semibold">
                            📱 {cust.phone}
                          </span>
                          <a
                            href={`https://wa.me/91${cust.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-bold text-emerald-400/80 hover:text-emerald-300 hover:underline"
                          >
                            (WhatsApp)
                          </a>
                        </div>
                      )}
                    </td>

                    {/* Nutrition Profile */}
                    <td className="py-4 px-4 align-top">
                      <div className="flex flex-wrap gap-1.5 mb-1.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wide bg-blue-500/10 text-blue-300 border border-blue-500/30">
                          {cust.fitnessGoal.replace(/_/g, ' ')}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wide bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                          {cust.dietaryPreference.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {cust.age ? `Age: ${cust.age}y` : ''} {cust.gender ? `• ${cust.gender}` : ''}
                      </div>
                      {cust.allergies && cust.allergies !== 'None' && (
                        <div className="text-[10px] text-amber-300/90 font-medium mt-1">
                          ⚠️ Allergies: {cust.allergies}
                        </div>
                      )}
                    </td>

                    {/* Delivery Address */}
                    <td className="py-4 px-4 align-top max-w-xs">
                      <p className="font-medium text-slate-200 text-xs leading-relaxed">
                        {cust.address.street}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-300 font-bold">
                          PIN: {cust.address.pincode}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">Patna, Bihar</span>
                      </div>
                      {cust.address.gpsCoords && (
                        <div className="mt-1 text-[10px] font-mono text-amber-400 flex items-center gap-1">
                          <span>📍 Coordinates:</span>
                          <span>{cust.address.gpsCoords}</span>
                        </div>
                      )}
                    </td>

                    {/* Google Maps Link */}
                    <td className="py-4 px-4 align-top">
                      {cust.address.mapsUrl ? (
                        <a
                          href={cust.address.mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500 hover:text-slate-950 transition-all shadow-sm"
                        >
                          <span>🗺️</span>
                          <span>Open in Maps</span>
                          <span>↗</span>
                        </a>
                      ) : (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            `${cust.address.street}, Patna ${cust.address.pincode}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                        >
                          <span>🔍 Search Map</span>
                          <span>↗</span>
                        </a>
                      )}
                    </td>

                    {/* Joined Date */}
                    <td className="py-4 px-4 align-top text-right font-mono text-[11px] text-slate-400 whitespace-nowrap">
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
        )}
      </div>

      {/* Two Column Section: Recent Orders & Top Meals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Kitchen Prep & Dispatch */}
        <div className="rounded-3xl p-6 bg-slate-900/80 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <span>🍳</span> Live Kitchen Dispatch
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Last 8 dispatches</span>
          </div>

          <div className="space-y-2.5">
            {data.recentOrders.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No recent kitchen dispatches.</p>
            ) : (
              data.recentOrders.map((o, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-2.5 px-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-200">
                        {o.customer}
                      </span>
                      {o.phone && (
                        <span className="text-[10px] font-mono text-slate-400">
                          ({o.phone})
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-amber-400/90 font-medium mt-0.5">{o.meal}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                        o.status === 'DELIVERED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : o.status === 'FAILED'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {o.status}
                    </span>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{o.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Demand Meal Plans & Patna Zones */}
        <div className="rounded-3xl p-6 bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
          <div>
            <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2">
              <span>🔥</span> High-Demand Meal Plans
            </h3>
            <div className="space-y-3">
              {data.topMeals.length === 0 ? (
                <p className="text-xs text-slate-500">No active meal subscriptions recorded yet.</p>
              ) : (
                data.topMeals.map((m, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">{m.name}</span>
                      <span className="font-mono text-amber-400">{m.subs} subscribers</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div
                        className="bg-gradient-to-r from-amber-400 to-emerald-400 h-2 rounded-full"
                        style={{ width: `${Math.min(100, m.pct || 30)}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <h3 className="text-sm font-black text-white mb-3 flex items-center gap-2">
              <span>🚴</span> Highest Volume Delivery Zones
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {data.topZones.length === 0 ? (
                <p className="text-xs text-slate-500 col-span-2">No zone activity today.</p>
              ) : (
                data.topZones.map((z, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-mono font-bold text-slate-200">PIN: {z.zone}</p>
                      <p className="text-[10px] text-slate-400">Patna</p>
                    </div>
                    <span className="text-xs font-black text-emerald-400 font-mono">
                      {z.orders} ord
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
