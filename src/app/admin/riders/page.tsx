'use client';

import React, { useState, useEffect } from 'react';

interface ZoneOption {
  id: string;
  pincode: string;
  neighborhood: string;
}

interface RiderItem {
  id: string;
  name: string;
  phone: string;
  active: boolean;
  vehicleType: string;
  vehicleNumber: string;
  assignedZone: {
    id: string;
    pincode: string;
    neighborhood: string;
    city: string;
  } | null;
  stats: {
    totalAssigned: number;
    delivered: number;
    failed: number;
    pending: number;
  };
  createdAt: string;
}

export default function AdminRidersPage() {
  const [riders, setRiders] = useState<RiderItem[]>([]);
  const [zones, setZones] = useState<ZoneOption[]>([]);
  const [unassignedOrders, setUnassignedOrders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [autoAssigning, setAutoAssigning] = useState(false);
  const [autoAssignMsg, setAutoAssignMsg] = useState<string | null>(null);

  // Add rider form modal
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [newRider, setNewRider] = useState({
    name: '',
    phone: '',
    vehicleType: 'EV Scooter',
    vehicleNumber: '',
    assignedZoneId: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/riders');
      if (res.ok) {
        const data = await res.json();
        setRiders(data.riders || []);
        setZones(data.zones || []);
        setUnassignedOrders(data.unassignedOrdersCount || 0);
      }
    } catch (err) {
      console.error('Failed to fetch fleet riders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAutoAssign = async () => {
    setAutoAssigning(true);
    setAutoAssignMsg(null);
    try {
      const res = await fetch('/api/admin/riders/auto-assign', {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        setAutoAssignMsg(
          `Successfully auto-routed ${data.assignedCount} order(s) to designated zone riders!`
        );
        fetchData();
      } else {
        setAutoAssignMsg(data.error || 'Failed to auto-assign orders.');
      }
    } catch {
      setAutoAssignMsg('Network error while auto-assigning.');
    } finally {
      setAutoAssigning(false);
    }
  };

  const handleZoneChange = async (riderId: string, newZoneId: string) => {
    try {
      const res = await fetch(`/api/admin/riders/${riderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedZoneId: newZoneId || null }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Failed to update rider zone:', err);
    }
  };

  const handleToggleActive = async (riderId: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/riders/${riderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentActive }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Failed to toggle rider status:', err);
    }
  };

  const handleDeleteRider = async (riderId: string, name: string) => {
    if (!confirm(`Are you sure you want to remove rider "${name}" from the fleet?`)) return;
    try {
      const res = await fetch(`/api/admin/riders/${riderId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Failed to delete rider:', err);
    }
  };

  const handleAddRider = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError(null);

    try {
      const res = await fetch('/api/admin/riders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRider),
      });
      const data = await res.json();
      if (res.ok) {
        setShowModal(false);
        setNewRider({
          name: '',
          phone: '',
          vehicleType: 'EV Scooter',
          vehicleNumber: '',
          assignedZoneId: '',
        });
        fetchData();
      } else {
        setModalError(data.error || 'Failed to enroll rider.');
      }
    } catch {
      setModalError('Network error while enrolling rider.');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-400/10 text-amber-300 border border-amber-400/30">
              Fleet Logistics
            </span>
            <span className="text-xs text-slate-400 font-mono">Patna Dispatch</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Delivery Fleet & Zone Assignment
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Assign designated riders to specific Patna zones and monitor delivery manifests in real time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleAutoAssign}
            disabled={autoAssigning}
            className="px-4 py-2.5 rounded-xl font-black text-xs bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 transition-all shadow-md shadow-amber-400/10 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>⚡</span>
            <span>{autoAssigning ? 'Routing Orders...' : 'Auto-Assign Zone Orders'}</span>
            {unassignedOrders > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-slate-950 text-amber-300 text-[10px] font-mono">
                {unassignedOrders} Unassigned
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>+</span>
            <span>Enroll New Rider</span>
          </button>
        </div>
      </div>

      {/* Auto-assign feedback banner */}
      {autoAssignMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span className="font-semibold">{autoAssignMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setAutoAssignMsg(null)}
            className="text-emerald-400 hover:text-white cursor-pointer font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl p-5 bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xl">🚴</span>
            <span className="text-[10px] font-bold uppercase text-slate-400">Riders</span>
          </div>
          <p className="text-3xl font-black font-mono text-slate-100">{riders.length}</p>
          <p className="text-xs font-bold text-slate-300 mt-1">Total Fleet Roster</p>
        </div>

        <div className="rounded-2xl p-5 bg-slate-900/80 border border-emerald-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xl">🟢</span>
            <span className="text-[10px] font-bold uppercase text-emerald-400">On Duty</span>
          </div>
          <p className="text-3xl font-black font-mono text-emerald-400">
            {riders.filter((r) => r.active).length}
          </p>
          <p className="text-xs font-bold text-slate-300 mt-1">Active on Shift</p>
        </div>

        <div className="rounded-2xl p-5 bg-slate-900/80 border border-blue-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xl">📍</span>
            <span className="text-[10px] font-bold uppercase text-blue-400">Zones</span>
          </div>
          <p className="text-3xl font-black font-mono text-blue-400">{zones.length}</p>
          <p className="text-xs font-bold text-slate-300 mt-1">Delivery Hubs in Patna</p>
        </div>

        <div
          className={`rounded-2xl p-5 bg-slate-900/80 border ${
            unassignedOrders > 0 ? 'border-amber-500/40' : 'border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xl">📦</span>
            <span
              className={`text-[10px] font-bold uppercase ${
                unassignedOrders > 0 ? 'text-amber-400' : 'text-slate-400'
              }`}
            >
              Pending
            </span>
          </div>
          <p
            className={`text-3xl font-black font-mono ${
              unassignedOrders > 0 ? 'text-amber-400' : 'text-slate-100'
            }`}
          >
            {unassignedOrders}
          </p>
          <p className="text-xs font-bold text-slate-300 mt-1">Unassigned Orders Today</p>
        </div>
      </div>

      {/* Zone Coverage Matrix */}
      <div className="rounded-3xl p-6 sm:p-8 bg-slate-900/90 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span>📍</span> Patna Zone Coverage Matrix
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live mapping of active designated delivery riders per pincode.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {zones.map((zone) => {
            const assignedRider = riders.find((r) => r.assignedZone?.id === zone.id);

            return (
              <div
                key={zone.id}
                className="rounded-2xl p-5 bg-slate-950/70 border border-slate-800/90 relative overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-sm text-slate-100">{zone.neighborhood}</h3>
                      <span className="text-xs font-mono font-bold text-amber-400">
                        PIN: {zone.pincode}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-800 text-slate-300">
                      Patna
                    </span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-800/80">
                    <p className="text-[10px] uppercase font-black tracking-wider text-slate-400 mb-1.5">
                      Designated Rider
                    </p>
                    {assignedRider ? (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                            <span>🚴</span>
                            <span>{assignedRider.name}</span>
                          </p>
                          <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                            {assignedRider.phone} · {assignedRider.vehicleType}
                          </p>
                        </div>
                        <span
                          className={`w-2 h-2 rounded-full ${
                            assignedRider.active ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                          }`}
                        />
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-red-950/30 border border-red-500/20 text-red-300 text-[11px] font-semibold flex items-center gap-2">
                        <span>⚠️</span>
                        <span>No rider assigned to this zone!</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">
                    Today&apos;s Stops: {assignedRider?.stats.totalAssigned || 0}
                  </span>
                  <select
                    value={assignedRider?.id || ''}
                    onChange={(e) => {
                      const selectedRiderId = e.target.value;
                      if (selectedRiderId) {
                        handleZoneChange(selectedRiderId, zone.id);
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-[11px] font-bold text-slate-200 focus:outline-none focus:border-amber-400"
                  >
                    <option value="">Select rider to assign...</option>
                    {riders.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.vehicleType})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fleet Roster Table */}
      <div className="rounded-3xl p-6 sm:p-8 bg-slate-900/90 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span>👥</span> Active Fleet Roster
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage rider assignments, contact details, and vehicle information.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs font-mono">
            Loading delivery fleet data...
          </div>
        ) : riders.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            No riders registered yet. Click &quot;Enroll New Rider&quot; above to add one.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-black tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Rider Details</th>
                  <th className="py-3.5 px-4">Vehicle Specs</th>
                  <th className="py-3.5 px-4">Assigned Delivery Zone</th>
                  <th className="py-3.5 px-4">Today&apos;s Stops Progress</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {riders.map((rider) => (
                  <tr key={rider.id} className="hover:bg-slate-800/30 transition-colors">
                    {/* Rider details */}
                    <td className="py-4 px-4 align-middle">
                      <div className="font-bold text-slate-100 text-sm">{rider.name}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-emerald-400 font-semibold text-[11px]">
                          📱 {rider.phone}
                        </span>
                        <a
                          href={`https://wa.me/91${rider.phone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-bold text-emerald-400/80 hover:text-emerald-300 hover:underline"
                        >
                          (WhatsApp)
                        </a>
                      </div>
                    </td>

                    {/* Vehicle */}
                    <td className="py-4 px-4 align-middle">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase bg-blue-500/10 text-blue-300 border border-blue-500/30">
                        {rider.vehicleType}
                      </span>
                      <p className="font-mono text-[11px] text-slate-400 mt-1">
                        {rider.vehicleNumber}
                      </p>
                    </td>

                    {/* Assigned Zone selector */}
                    <td className="py-4 px-4 align-middle">
                      <select
                        value={rider.assignedZone?.id || ''}
                        onChange={(e) => handleZoneChange(rider.id, e.target.value)}
                        className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-slate-200 focus:outline-none focus:border-amber-400"
                      >
                        <option value="">Unassigned</option>
                        {zones.map((z) => (
                          <option key={z.id} value={z.id}>
                            {z.neighborhood} ({z.pincode})
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Today's stops progress */}
                    <td className="py-4 px-4 align-middle">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-mono">
                          <span className="text-slate-300">
                            {rider.stats.delivered} / {rider.stats.totalAssigned} Delivered
                          </span>
                          <span className="text-amber-400 font-bold">
                            {rider.stats.pending} Pending
                          </span>
                        </div>
                        <div className="w-36 bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                          <div
                            className="bg-emerald-400 h-full rounded-full"
                            style={{
                              width:
                                rider.stats.totalAssigned > 0
                                  ? `${Math.round(
                                      (rider.stats.delivered / rider.stats.totalAssigned) * 100
                                    )}%`
                                  : '0%',
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 align-middle">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(rider.id, rider.active)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all ${
                          rider.active
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        {rider.active ? '🟢 On Duty' : '⚪ Offline'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 align-middle text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteRider(rider.id, rider.name)}
                        className="px-2.5 py-1 rounded-lg text-red-400 hover:text-white hover:bg-red-500/20 text-xs font-bold transition-all cursor-pointer"
                        title="Remove rider"
                      >
                        🗑️ Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Rider Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl p-6 sm:p-8 bg-slate-900 border border-slate-800 shadow-2xl relative">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-black text-white">Enroll Delivery Rider</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Add a rider to your Patna distribution network.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-semibold">
                ⚠️ {modalError}
              </div>
            )}

            <form onSubmit={handleAddRider} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Rider Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suresh Kumar"
                  value={newRider.name}
                  onChange={(e) => setNewRider({ ...newRider, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Mobile Number (10 digits)
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  maxLength={10}
                  value={newRider.phone}
                  onChange={(e) =>
                    setNewRider({
                      ...newRider,
                      phone: e.target.value.replace(/\D/g, '').slice(0, 10),
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 font-mono placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Vehicle Type
                  </label>
                  <select
                    value={newRider.vehicleType}
                    onChange={(e) => setNewRider({ ...newRider, vehicleType: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 font-bold focus:outline-none focus:border-amber-400"
                  >
                    <option value="EV Scooter">EV Scooter</option>
                    <option value="Motorcycle">Motorcycle</option>
                    <option value="Bike">Bike / Moped</option>
                    <option value="Bicycle">Bicycle</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Vehicle Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BR 01 EA 9901"
                    value={newRider.vehicleNumber}
                    onChange={(e) =>
                      setNewRider({ ...newRider, vehicleNumber: e.target.value.toUpperCase() })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 font-mono placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Assigned Delivery Zone (Patna)
                </label>
                <select
                  value={newRider.assignedZoneId}
                  onChange={(e) => setNewRider({ ...newRider, assignedZoneId: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 font-bold focus:outline-none focus:border-amber-400"
                >
                  <option value="">Select primary zone...</option>
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.neighborhood} ({z.pincode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading || !newRider.name || newRider.phone.length < 10}
                  className="px-5 py-2.5 rounded-xl text-xs font-black bg-amber-400 text-slate-950 hover:bg-amber-300 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {modalLoading ? 'Enrolling...' : 'Enroll Rider →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
