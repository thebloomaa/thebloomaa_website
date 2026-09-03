'use client';

import React, { useState, useEffect } from 'react';

export default function AdminZonesPage() {
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ pincode: '', neighborhood: '', city: 'Patna', state: 'Bihar' });

  const fetchZones = () => {
    fetch('/api/admin/zones')
      .then(res => res.json())
      .then(data => {
        if (data.zones) setZones(data.zones);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch zones:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const handleAdd = async () => {
    if (!form.pincode || !form.neighborhood) return;
    try {
      const res = await fetch('/api/admin/zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        fetchZones();
        setShowForm(false);
        setForm({ pincode: '', neighborhood: '', city: 'Patna', state: 'Bihar' });
      }
    } catch (error) {
      console.error('Failed to add zone', error);
    }
  };

  const toggleZone = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/zones/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      if (res.ok) fetchZones();
    } catch (error) {
      console.error('Failed to toggle zone', error);
    }
  };

  const deleteZone = async (id: string) => {
    if (!confirm('Are you sure you want to delete this delivery zone?')) return;
    try {
      const res = await fetch(`/api/admin/zones/${id}`, { method: 'DELETE' });
      if (res.ok) fetchZones();
    } catch (error) {
      console.error('Failed to delete zone', error);
    }
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
      {loading ? (
        <div className="text-center py-20 text-[var(--text-muted)]">Loading zones...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {zones.map((zone: any) => (
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
              <button onClick={() => toggleZone(zone.id, zone.isActive)} className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all" style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                {zone.isActive ? 'Disable' : 'Enable'}
              </button>
              <button onClick={() => deleteZone(zone.id)} className="py-2 px-3 rounded-lg text-xs font-semibold" style={{ background: 'rgba(239,68,68,0.1)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.15)' }}>
                Delete
              </button>
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  );
}
