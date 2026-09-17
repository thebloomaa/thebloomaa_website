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
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#070b14] text-brand-forest">
        <div className="w-10 h-10 border-3 border-brand-mustard border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-mono text-brand-forest-muted">Loading delivery stops & GPS route...</p>
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
    <main className="min-h-screen bg-[#070b14] text-brand-forest pb-20 px-3 sm:px-6 pt-4 max-w-xl mx-auto">
      {/* Top Rider Header */}
      <div className="p-4 rounded-3xl bg-brand-card border border-brand-border shadow-xl mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-brand-mustard/10 border border-brand-mustard/30 flex items-center justify-center text-xl">
              🚴
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-black text-brand-forest">
                  {data?.rider?.name || 'Patna Rider'}
                </h1>
                <span className="w-2 h-2 rounded-full bg-brand-mustard animate-pulse" />
              </div>
              <p className="text-[11px] font-mono text-brand-forest-muted">
                {data?.rider?.vehicleType} · {data?.rider?.vehicleNumber}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-brand-cream border border-brand-border text-brand-forest-muted hover:text-red-400 transition-colors cursor-pointer"
          >
            Logout
          </button>
        </div>

        {/* Assigned Zone banner */}
        <div className="mt-3 pt-3 border-t border-brand-border/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-brand-mustard">📍</span>
            <span className="font-bold text-brand-forest">
              Zone: {data?.rider?.assignedZone || 'All Patna'}
            </span>
          </div>
          <span className="font-mono text-[11px] text-brand-forest-muted">{data?.date}</span>
        </div>
      </div>

      {/* Progress & Quick Stats */}
      <div className="p-4 rounded-3xl bg-brand-card/90 border border-brand-border mb-4 shadow-lg">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-bold text-brand-forest-muted">Shift Completion</span>
          <span className="font-mono font-bold text-brand-mustard">{completionPct}% Done</span>
        </div>
        <div className="w-full bg-brand-cream rounded-full h-2 overflow-hidden border border-brand-border mb-4">
          <div
            className="bg-gradient-to-r from-brand-mustard to-brand-mustard h-full rounded-full transition-all duration-500"
            style={{ width: `${completionPct}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-2xl bg-brand-cream/80 border border-brand-border">
            <p className="text-lg font-black font-mono text-blue-400">
              {data?.pendingCount || 0}
            </p>
            <p className="text-[10px] uppercase font-bold text-brand-forest-muted">Pending</p>
          </div>
          <div className="p-2.5 rounded-2xl bg-brand-cream/80 border border-brand-mustard/20">
            <p className="text-lg font-black font-mono text-brand-mustard">
              {data?.deliveredCount || 0}
            </p>
            <p className="text-[10px] uppercase font-bold text-brand-mustard/80">Delivered</p>
          </div>
          <div className="p-2.5 rounded-2xl bg-brand-cream/80 border border-brand-border">
            <p className="text-lg font-black font-mono text-brand-forest">
              {data?.totalStops || 0}
            </p>
            <p className="text-[10px] uppercase font-bold text-brand-forest-muted">Total Stops</p>
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
                ? 'bg-brand-mustard text-brand-forest shadow-md shadow-brand-mustard/10'
                : 'bg-brand-card text-brand-forest-muted hover:text-brand-forest border border-brand-border'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Delivery Stops List */}
      {filteredStops.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-brand-card/60 border border-brand-border text-brand-forest-muted text-xs">
          <p className="text-2xl mb-2">🎉</p>
          <p className="font-bold text-brand-forest">No stops in this view!</p>
          <p className="text-[11px] text-brand-forest-muted/70 mt-1">
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
                    ? 'bg-emerald-950/30 border-brand-mustard/40'
                    : stop.status === 'RIDER_DELIVERED'
                    ? 'bg-amber-950/20 border-brand-mustard/30'
                    : isFailed
                    ? 'bg-red-950/20 border-red-500/30'
                    : 'bg-brand-card/90 border-brand-border shadow-md'
                }`}
              >
                {/* Stop Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-brand-cream text-brand-mustard border border-brand-border font-mono">
                      STOP #{stop.stopNumber}
                    </span>
                    <span className="text-xs font-bold text-brand-forest">{stop.customer}</span>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      stop.status === 'DELIVERED'
                        ? 'bg-brand-mustard/20 text-brand-mustard border border-brand-mustard/40'
                        : stop.status === 'RIDER_DELIVERED'
                        ? 'bg-brand-mustard/20 text-brand-forest-muted border border-brand-mustard/40'
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
                <div className="p-3 rounded-2xl bg-brand-cream/70 border border-brand-border/80 mb-3">
                  <p className="text-xs font-semibold text-brand-forest leading-relaxed">
                    {stop.street}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 text-[11px] text-brand-forest-muted font-mono">
                    <span className="text-brand-mustard font-bold">PIN: {stop.pincode}</span>
                    <span>• {stop.city}</span>
                    {stop.gpsCoords && <span>• 📍 GPS Pinned</span>}
                  </div>
                </div>

                {/* Meal Info & Special Notes */}
                <div className="flex items-center justify-between text-xs mb-3 text-brand-forest-muted">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-brand-mustard/10 text-brand-mustard border border-brand-mustard/30">
                      {stop.dietary}
                    </span>
                    <span className="font-bold text-xs">{stop.meal}</span>
                  </div>
                  <span className="font-mono text-[11px] text-brand-forest-muted">
                    ⏰ {stop.time}
                  </span>
                </div>

                {stop.deliveryNote && (
                  <div className="p-2 rounded-xl bg-brand-mustard/10 border border-brand-mustard/20 text-brand-forest-muted text-[11px] font-medium mb-3">
                    💬 Note: {stop.deliveryNote}
                  </div>
                )}

                {/* Action Buttons: Google Maps, Call, WhatsApp */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <a
                    href={stop.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-2 rounded-xl text-xs font-black bg-gradient-to-r from-brand-mustard to-teal-500 hover:from-brand-mustard hover:to-teal-400 text-brand-forest transition-all flex items-center justify-center gap-1 shadow-sm"
                  >
                    <span>🗺️</span>
                    <span>Maps ↗</span>
                  </a>

                  {stop.phone ? (
                    <>
                      <a
                        href={`tel:${stop.phone}`}
                        className="py-2.5 px-2 rounded-xl text-xs font-bold bg-brand-cream border border-brand-border hover:border-slate-500 text-brand-forest transition-all flex items-center justify-center gap-1"
                      >
                        <span>📞</span>
                        <span>Call</span>
                      </a>
                      <a
                        href={`https://wa.me/91${stop.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 px-2 rounded-xl text-xs font-bold bg-brand-cream border border-brand-mustard/30 text-brand-mustard hover:bg-brand-mustard/10 transition-all flex items-center justify-center gap-1"
                      >
                        <span>💬</span>
                        <span>WhatsApp</span>
                      </a>
                    </>
                  ) : (
                    <span className="col-span-2 py-2.5 text-center text-xs text-brand-forest-muted/70 bg-brand-cream rounded-xl border border-brand-border">
                      No Phone on file
                    </span>
                  )}
                </div>

                {/* Delivery Completion Buttons */}
                {!isDelivered && (
                  <div className="pt-3 border-t border-brand-border/80 flex items-center gap-2">
                    <button
                      type="button"
                      disabled={updatingId === stop.id}
                      onClick={() => handleUpdateStatus(stop.id, 'DELIVERED')}
                      className="flex-1 py-2.5 px-3 rounded-xl font-black text-xs bg-brand-mustard hover:bg-brand-mustard-hover text-brand-forest shadow-md shadow-brand-mustard/20 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <span>✓</span>
                      <span>Mark Delivered</span>
                    </button>

                    <button
                      type="button"
                      disabled={updatingId === stop.id}
                      onClick={() => handleUpdateStatus(stop.id, 'FAILED')}
                      className="py-2.5 px-3 rounded-xl font-bold text-xs bg-brand-cream border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all cursor-pointer disabled:opacity-50"
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
          className="text-xs font-mono text-brand-forest-muted/70 hover:text-brand-forest-muted transition-colors"
        >
          thebloomaa Patna Kitchen Dispatch • 2026
        </Link>
      </div>
    </main>
  );
}
