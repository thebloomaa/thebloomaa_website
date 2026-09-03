'use client';

import React, { useState } from 'react';

const initialProducts = [
  { id: '1', name: 'Lean Muscle Chicken Prep', type: 'MEAL_PLAN', diet: 'HIGH_PROTEIN', price: 350, calories: 650, protein: 55, carbs: 45, fats: 15, active: true },
  { id: '2', name: 'Vegan Keto Power Bowl', type: 'MEAL_PLAN', diet: 'VEGAN', price: 300, calories: 500, protein: 20, carbs: 12, fats: 40, active: true },
  { id: '3', name: 'Standard Weight Loss Diet', type: 'MEAL_PLAN', diet: 'VEG', price: 250, calories: 400, protein: 18, carbs: 55, fats: 8, active: true },
];

const dietColors: Record<string, { bg: string; color: string }> = {
  HIGH_PROTEIN: { bg: 'rgba(239, 68, 68, 0.1)', color: '#FCA5A5' },
  VEGAN: { bg: 'rgba(16, 185, 129, 0.1)', color: '#6EE7B7' },
  VEG: { bg: 'rgba(52, 211, 153, 0.1)', color: '#A7F3D0' },
  KETO: { bg: 'rgba(168, 85, 247, 0.1)', color: '#C4B5FD' },
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState(initialProducts);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'MEAL_PLAN', diet: 'VEG', price: '', calories: '', protein: '', carbs: '', fats: '' });

  const handleAdd = () => {
    const newProduct = {
      id: String(Date.now()),
      name: form.name,
      type: form.type,
      diet: form.diet,
      price: Number(form.price),
      calories: Number(form.calories),
      protein: Number(form.protein),
      carbs: Number(form.carbs),
      fats: Number(form.fats),
      active: true,
    };
    setProducts([...products, newProduct]);
    setShowForm(false);
    setForm({ name: '', type: 'MEAL_PLAN', diet: 'VEG', price: '', calories: '', protein: '', carbs: '', fats: '' });
  };

  const toggleActive = (id: string) => {
    setProducts(products.map(p => p.id === id ? { ...p, active: !p.active } : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const inputStyle = { background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black">Products</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Manage your meal plans and beverages.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-xl text-sm font-bold text-white"
          style={{ background: showForm ? 'var(--danger)' : 'var(--brand-primary)' }}>
          {showForm ? '✕ Cancel' : '+ Add Product'}
        </button>
      </div>

      {/* Add Product Form */}
      {showForm && (
        <div className="rounded-2xl p-6 mb-6 animate-fade-in-up" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
          <h3 className="text-sm font-bold mb-4">New Product</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <input type="text" placeholder="Meal name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="px-4 py-2.5 rounded-xl text-sm" style={inputStyle} />
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="px-4 py-2.5 rounded-xl text-sm" style={inputStyle}>
              <option value="MEAL_PLAN">Meal Plan</option>
              <option value="A_LA_CARTE">A La Carte</option>
              <option value="BEVERAGE">Beverage</option>
            </select>
            <select value={form.diet} onChange={(e) => setForm({ ...form, diet: e.target.value })} className="px-4 py-2.5 rounded-xl text-sm" style={inputStyle}>
              <option value="VEG">Veg</option>
              <option value="VEGAN">Vegan</option>
              <option value="KETO">Keto</option>
              <option value="HIGH_PROTEIN">High Protein</option>
            </select>
            <input type="number" placeholder="Price (₹)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="px-4 py-2.5 rounded-xl text-sm" style={inputStyle} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <input type="number" placeholder="Calories" value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value })} className="px-4 py-2.5 rounded-xl text-sm" style={inputStyle} />
            <input type="number" placeholder="Protein (g)" value={form.protein} onChange={(e) => setForm({ ...form, protein: e.target.value })} className="px-4 py-2.5 rounded-xl text-sm" style={inputStyle} />
            <input type="number" placeholder="Carbs (g)" value={form.carbs} onChange={(e) => setForm({ ...form, carbs: e.target.value })} className="px-4 py-2.5 rounded-xl text-sm" style={inputStyle} />
            <input type="number" placeholder="Fats (g)" value={form.fats} onChange={(e) => setForm({ ...form, fats: e.target.value })} className="px-4 py-2.5 rounded-xl text-sm" style={inputStyle} />
          </div>
          <button onClick={handleAdd} disabled={!form.name || !form.price} className="px-6 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-40" style={{ background: 'var(--brand-primary)' }}>
            Save Product
          </button>
        </div>
      )}

      {/* Products Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
        <div className="hidden sm:grid grid-cols-8 gap-2 px-5 py-3 text-[10px] font-bold uppercase tracking-wider" style={{ background: 'var(--bg-dark)', color: 'var(--text-muted)' }}>
          <span className="col-span-2">Name</span><span>Type</span><span>Diet</span><span>Price</span><span>Calories</span><span>Status</span><span>Actions</span>
        </div>
        <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
          {products.map(p => {
            const dc = dietColors[p.diet] || dietColors.VEG;
            return (
              <div key={p.id} className="grid grid-cols-2 sm:grid-cols-8 gap-2 px-5 py-3.5 items-center hover:bg-white/[0.02]" style={{ opacity: p.active ? 1 : 0.5 }}>
                <span className="col-span-2 text-sm font-semibold">{p.name}</span>
                <span className="text-xs hidden sm:block" style={{ color: 'var(--text-muted)' }}>{p.type.replace('_', ' ')}</span>
                <span><span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase" style={{ background: dc.bg, color: dc.color }}>{p.diet.replace('_', ' ')}</span></span>
                <span className="text-sm font-bold" style={{ fontFamily: 'var(--font-mono)' }}>₹{p.price}</span>
                <span className="text-sm hidden sm:block" style={{ fontFamily: 'var(--font-mono)', color: 'var(--brand-accent)' }}>🔥{p.calories}</span>
                <button onClick={() => toggleActive(p.id)} className="text-left">
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase" style={{ background: p.active ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: p.active ? '#6EE7B7' : '#FCA5A5' }}>
                    {p.active ? 'Active' : 'Hidden'}
                  </span>
                </button>
                <button onClick={() => deleteProduct(p.id)} className="text-xs font-semibold" style={{ color: '#FCA5A5' }}>Delete</button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
