'use client';

import React, { useState } from 'react';

const initialZones = [
  { id: '1', pincode: '560034', neighborhood: 'Koramangala', city: 'Bengaluru', state: 'Karnataka', isActive: true, orders: 145 },
  { id: '2', pincode: '560038', neighborhood: 'Indiranagar', city: 'Bengaluru', state: 'Karnataka', isActive: true, orders: 112 },
  { id: '3', pincode: '560102', neighborhood: 'HSR Layout', city: 'Bengaluru', state: 'Karnataka', isActive: true, orders: 85 },
];

export default function AdminZonesPage() {
  const [zones, setZones] = useState(initialZones);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ pincode: '', neighborhood: '', city: 'Bengaluru', state: 'Karnataka' });

  const handleAdd = () => {
    if (!form.pincode || !form.neighborhood) return;
    setZones([...zones, { id: String(Date.now()), ...form, isActive: true, orders: 0 }]);
    setShowForm(false);
    setForm({ pincode: '', neighborhood: '', city: 'Bengaluru', state: 'Karnataka' });
  };

  const toggleZone = (id: string) => {
    setZones(zones.map(z => z.id === id ? { ...z, isActive: !z.isActive } : z));
  };

  const deleteZone = (id: string) => {
    setZones(zones.filter(z => z.id !== id));
  };

  const inputStyle = { background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black">Delivery Zones</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Manage which pincodes you deliver to.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-xl text-sm font-bold text-white"
          style={{ background: showForm ? 'var(--danger)' : 'var(--brand-primary)' }}>
          {showForm ? '✕ Cancel' : '+ Add Zone'}
        </button>
      </div>

      {/* Add Zone Form */}
      {showForm && (
        <div className="rounded-2xl p-6 mb-6 animate-fade-in-up" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
          <h3 className="text-sm font-bold mb-4">New Delivery Zone</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <input type="text" placeholder="Pincode (e.g. 560001)" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })} maxLength={6} className="px-4 py-2.5 rounded-xl text-sm" style={inputStyle} />
            <input type="text" placeholder="Neighborhood (e.g. Whitefield)" value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} className="px-4 py-2.5 rounded-xl text-sm" style={inputStyle} />
            <input type="text" value={form.city} disabled className="px-4 py-2.5 rounded-xl text-sm opacity-60" style={inputStyle} />
            <input type="text" value={form.state} disabled className="px-4 py-2.5 rounded-xl text-sm opacity-60" style={inputStyle} />
          </div>
          <button onClick={handleAdd} disabled={!form.pincode || !form.neighborhood} className="px-6 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-40" style={{ background: 'var(--brand-primary)' }}>
            Add Zone
          </button>
        </div>
      )}

      {/* Zones Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {zones.map(zone => (
          <div key={zone.id} className="rounded-xl p-5 transition-all" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', opacity: zone.isActive ? 1 : 0.5 }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-base font-bold">{zone.neighborhood}</h3>
                <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>📍 {zone.pincode}</p>
              </div>
              <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase" style={{
                background: zone.isActive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                color: zone.isActive ? '#6EE7B7' : '#FCA5A5',
              }}>
                {zone.isActive ? 'Active' : 'Disabled'}
              </span>
            </div>
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>{zone.city}, {zone.state}</p>
            <div className="flex items-center justify-between mb-4 py-2 px-3 rounded-lg" style={{ background: 'var(--bg-dark)' }}>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Active Orders</span>
              <span className="text-sm font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--brand-primary)' }}>{zone.orders}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => toggleZone(zone.id)} className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all" style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                {zone.isActive ? 'Disable' : 'Enable'}
              </button>
              <button onClick={() => deleteZone(zone.id)} className="py-2 px-3 rounded-lg text-xs font-semibold" style={{ background: 'rgba(239,68,68,0.1)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.15)' }}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
