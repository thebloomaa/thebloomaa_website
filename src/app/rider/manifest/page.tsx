'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface StopItem {
  id: string;
  stopNumber: number;
  customer: string;
  phone: string;
  street: string;
  pincode: string;
  city: string;
  gpsCoords: string | null;
  mapsUrl: string;
  meal: string;
  calories: number;
  dietary: string;
  time: string;
  deliveryNote?: string | null;
  status: 'QUEUED' | 'DELIVERED' | 'RIDER_DELIVERED' | 'FAILED';
}

interface RiderManifestData {
  date: string;
  rider: {
    id: string;
    name: string;
    phone: string;
    vehicleType: string;
    vehicleNumber: string;
    assignedZone: string;
  } | null;
  stops: StopItem[];
  totalStops: number;
  deliveredCount: number;
  failedCount: number;
  pendingCount: number;
}

export default function RiderManifestPage() {
  const [data, setData] = useState<RiderManifestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'DELIVERED'>('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchManifest = async () => {
    try {
      const res = await fetch('/api/rider/manifest');
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (err) {
      console.error('Failed to fetch manifest:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManifest();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: 'DELIVERED' | 'FAILED') => {
    setUpdatingId(orderId);
    try {
      const res = await fetch('/api/rider/manifest', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      if (res.ok) {
        const finalStatus: StopItem['status'] = newStatus === 'DELIVERED' ? 'RIDER_DELIVERED' : newStatus;
        setData((prev) => {
          if (!prev) return null;
          const updatedStops = prev.stops.map((s) =>
            s.id === orderId ? { ...s, status: finalStatus } : s
          );
          const deliveredCount = updatedStops.filter((s) => s.status === 'DELIVERED' || s.status === 'RIDER_DELIVERED').length;
          const failedCount = updatedStops.filter((s) => s.status === 'FAILED').length;
          const pendingCount = updatedStops.filter((s) => s.status === 'QUEUED').length;

          return {
            ...prev,
            stops: updatedStops,
            deliveredCount,
            failedCount,
            pendingCount,
          };
        });
      }
    } catch (err) {
      console.error('Failed to update stop status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('thebloomaa_rider_id');
      localStorage.removeItem('thebloomaa_rider_name');
      localStorage.removeItem('thebloomaa_rider_zone');
      document.cookie = 'thebloomaa_rider_id=; path=/; max-age=0';
    }
    window.location.href = '/rider';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#070b14] text-slate-100">
        <div className="w-10 h-10 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-mono text-slate-400">Loading delivery stops & GPS route...</p>
      </div>
    );
  }

  const stops = data?.stops || [];
  const filteredStops = stops.filter((s) => {
    if (filter === 'PENDING') return s.status === 'QUEUED';
    if (filter === 'DELIVERED') return s.status === 'DELIVERED' || s.status === 'RIDER_DELIVERED';
    return true;
  });

  const completionPct =
    data && data.totalStops > 0
      ? Math.round((data.deliveredCount / data.totalStops) * 100)
      : 0;

  return (
    <main className="min-h-screen bg-[#070b14] text-slate-100 pb-20 px-3 sm:px-6 pt-4 max-w-xl mx-auto">
      {/* Top Rider Header */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-xl">
              🚴
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-black text-white">
                  {data?.rider?.name || 'Patna Rider'}
                </h1>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-[11px] font-mono text-slate-400">
                {data?.rider?.vehicleType} · {data?.rider?.vehicleNumber}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-950 border border-slate-800 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
          >
            Logout
          </button>
        </div>

        {/* Assigned Zone banner */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-amber-400">📍</span>
            <span className="font-bold text-slate-200">
              Zone: {data?.rider?.assignedZone || 'All Patna'}
            </span>
          </div>
          <span className="font-mono text-[11px] text-slate-400">{data?.date}</span>
        </div>
      </div>

      {/* Progress & Quick Stats */}
      <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 mb-4 shadow-lg">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-bold text-slate-300">Shift Completion</span>
          <span className="font-mono font-bold text-emerald-400">{completionPct}% Done</span>
        </div>
        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800 mb-4">
          <div
            className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${completionPct}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800">
            <p className="text-lg font-black font-mono text-blue-400">
              {data?.pendingCount || 0}
            </p>
            <p className="text-[10px] uppercase font-bold text-slate-400">Pending</p>
          </div>
          <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-emerald-500/20">
            <p className="text-lg font-black font-mono text-emerald-400">
              {data?.deliveredCount || 0}
            </p>
            <p className="text-[10px] uppercase font-bold text-emerald-400/80">Delivered</p>
          </div>
          <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800">
            <p className="text-lg font-black font-mono text-slate-100">
              {data?.totalStops || 0}
            </p>
            <p className="text-[10px] uppercase font-bold text-slate-400">Total Stops</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'ALL', label: `All Stops (${stops.length})` },
          { key: 'PENDING', label: `Pending (${data?.pendingCount || 0})` },
          { key: 'DELIVERED', label: `Delivered (${data?.deliveredCount || 0})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === tab.key
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/10'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Delivery Stops List */}
      {filteredStops.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs">
          <p className="text-2xl mb-2">🎉</p>
          <p className="font-bold text-slate-200">No stops in this view!</p>
          <p className="text-[11px] text-slate-500 mt-1">
            {filter === 'PENDING'
              ? 'All deliveries for your current zone are completed.'
              : 'No orders dispatched for this criteria yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredStops.map((stop) => {
            const isDelivered = stop.status === 'DELIVERED' || stop.status === 'RIDER_DELIVERED';
            const isFailed = stop.status === 'FAILED';

            return (
              <div
                key={stop.id}
                className={`rounded-3xl p-5 border transition-all ${
                  stop.status === 'DELIVERED'
                    ? 'bg-emerald-950/30 border-emerald-500/40'
                    : stop.status === 'RIDER_DELIVERED'
                    ? 'bg-amber-950/20 border-amber-500/30'
                    : isFailed
                    ? 'bg-red-950/20 border-red-500/30'
                    : 'bg-slate-900/90 border-slate-800 shadow-md'
                }`}
              >
                {/* Stop Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-slate-950 text-amber-400 border border-slate-800 font-mono">
                      STOP #{stop.stopNumber}
                    </span>
                    <span className="text-xs font-bold text-slate-200">{stop.customer}</span>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      stop.status === 'DELIVERED'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : stop.status === 'RIDER_DELIVERED'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : isFailed
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                    }`}
                  >
                    {stop.status === 'RIDER_DELIVERED'
                      ? 'Dropped Off ✓ (Pending Admin)'
                      : stop.status === 'DELIVERED'
                      ? 'Verified ✓✓'
                      : stop.status}
                  </span>
                </div>

                {/* Delivery Address */}
                <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 mb-3">
                  <p className="text-xs font-semibold text-slate-200 leading-relaxed">
                    {stop.street}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400 font-mono">
                    <span className="text-amber-400 font-bold">PIN: {stop.pincode}</span>
                    <span>• {stop.city}</span>
                    {stop.gpsCoords && <span>• 📍 GPS Pinned</span>}
                  </div>
                </div>

                {/* Meal Info & Special Notes */}
                <div className="flex items-center justify-between text-xs mb-3 text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {stop.dietary}
                    </span>
                    <span className="font-bold text-xs">{stop.meal}</span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-400">
                    ⏰ {stop.time}
                  </span>
                </div>

                {stop.deliveryNote && (
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-medium mb-3">
                    💬 Note: {stop.deliveryNote}
                  </div>
                )}

                {/* Action Buttons: Google Maps, Call, WhatsApp */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <a
                    href={stop.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-2 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 transition-all flex items-center justify-center gap-1 shadow-sm"
                  >
                    <span>🗺️</span>
                    <span>Maps ↗</span>
                  </a>

                  {stop.phone ? (
                    <>
                      <a
                        href={`tel:${stop.phone}`}
                        className="py-2.5 px-2 rounded-xl text-xs font-bold bg-slate-950 border border-slate-700 hover:border-slate-500 text-slate-200 transition-all flex items-center justify-center gap-1"
                      >
                        <span>📞</span>
                        <span>Call</span>
                      </a>
                      <a
                        href={`https://wa.me/91${stop.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 px-2 rounded-xl text-xs font-bold bg-slate-950 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-all flex items-center justify-center gap-1"
                      >
                        <span>💬</span>
                        <span>WhatsApp</span>
                      </a>
                    </>
                  ) : (
                    <span className="col-span-2 py-2.5 text-center text-xs text-slate-500 bg-slate-950 rounded-xl border border-slate-800">
                      No Phone on file
                    </span>
                  )}
                </div>

                {/* Delivery Completion Buttons */}
                {!isDelivered && (
                  <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
                    <button
                      type="button"
                      disabled={updatingId === stop.id}
                      onClick={() => handleUpdateStatus(stop.id, 'DELIVERED')}
                      className="flex-1 py-2.5 px-3 rounded-xl font-black text-xs bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-md shadow-emerald-400/20 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <span>✓</span>
                      <span>Mark Delivered</span>
                    </button>

                    <button
                      type="button"
                      disabled={updatingId === stop.id}
                      onClick={() => handleUpdateStatus(stop.id, 'FAILED')}
                      className="py-2.5 px-3 rounded-xl font-bold text-xs bg-slate-950 border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all cursor-pointer disabled:opacity-50"
                    >
                      Report Issue
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Bottom Link to site */}
      <div className="mt-8 text-center">
        <Link
          href="/"
          className="text-xs font-mono text-slate-500 hover:text-slate-300 transition-colors"
        >
          thebloomaa Patna Kitchen Dispatch • 2026
        </Link>
      </div>
    </main>
  );
}
