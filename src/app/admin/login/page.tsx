'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please provide both admin username/email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });

      if (res?.error) {
        setError('Invalid administrator credentials. Access restricted to authorized personnel.');
        setLoading(false);
      } else {
        router.push('/admin');
        router.refresh();
      }
    } catch {
      setError('Network communication failed. Please verify server connection.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#070b14] text-slate-100 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo and Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-900 border border-amber-400/40 shadow-xl shadow-amber-400/10 mb-4 overflow-hidden relative">
            <Image
              src="/logo.jpg"
              alt="thebloomaa logo"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <h1 className="text-2xl font-black tracking-tight text-white">thebloomaa</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-400/10 border border-amber-400/40 text-amber-300">
              Admin Ops
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Protected Command & Operations Center • Patna, Bihar
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl p-8 bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>🔐</span> Admin Authentication
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Enter your master administrative key to access dispatch, kitchen prep, and customer analytics.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-2xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs flex items-start gap-2.5 animate-fade-in">
              <span className="text-sm mt-0.5">⚠️</span>
              <p className="font-semibold leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Admin Email / Username
              </label>
              <input
                type="text"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter admin email..."
                className="w-full px-4 py-3.5 rounded-2xl bg-slate-950/80 border border-slate-700 text-slate-100 text-sm placeholder:text-slate-600 focus:outline-none focus:border-amber-400 transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Secret Master Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3.5 pr-12 rounded-2xl bg-slate-950/80 border border-slate-700 text-slate-100 text-sm placeholder:text-slate-600 focus:outline-none focus:border-amber-400 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-200 transition-colors text-xs font-bold cursor-pointer"
                >
                  {showPassword ? '🙈 Hide' : '👁️ Show'}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5 flex items-center justify-between">
                <span>Master password from your environment configuration</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl font-black text-sm bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Unlock Admin Operations</span>
                  <span>→</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <Link
              href="/"
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 font-medium"
            >
              <span>←</span>
              <span>Back to Storefront</span>
            </Link>
            <span className="text-[11px] text-slate-500 font-mono">v2.0 • Secured</span>
          </div>
        </div>
      </div>
    </div>
  );
}
