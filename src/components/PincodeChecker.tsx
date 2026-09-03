'use client';

import React, { useState } from 'react';

interface PincodeCheckerProps {
  variant?: 'hero' | 'section';
}

export default function PincodeChecker({ variant = 'hero' }: PincodeCheckerProps) {
  const [pincode, setPincode] = useState('');
  const [result, setResult] = useState<{ serviceable: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const checkPincode = async () => {
    if (pincode.length !== 6) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/serviceability?pincode=${pincode}`);
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ serviceable: false, message: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={variant === 'hero' ? '' : 'max-w-md mx-auto'}>
      <div className="flex gap-2">
        <input
          type="text"
          maxLength={6}
          value={pincode}
          onChange={(e) => {
            setPincode(e.target.value.replace(/\D/g, ''));
            setResult(null);
          }}
          onKeyDown={(e) => e.key === 'Enter' && checkPincode()}
          placeholder="Enter your pincode"
          className="flex-1 px-4 py-3 rounded-xl text-sm font-medium placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
          style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
        />
        <button
          onClick={checkPincode}
          disabled={pincode.length !== 6 || loading}
          className="px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: 'var(--brand-primary)' }}
        >
          {loading ? (
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            'Check'
          )}
        </button>
      </div>
      {result && (
        <div
          className="mt-3 px-4 py-2.5 rounded-xl text-sm font-medium animate-fade-in-up"
          style={{
            background: result.serviceable ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: result.serviceable ? '#6EE7B7' : '#FCA5A5',
            border: `1px solid ${result.serviceable ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
          }}
        >
          {result.serviceable ? '✅' : '❌'} {result.message}
        </div>
      )}
    </div>
  );
}
