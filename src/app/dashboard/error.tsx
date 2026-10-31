'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function DashboardErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard Error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-[#EAE2D2] shadow-xl text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center text-2xl mx-auto mb-4">
          ⚠️
        </div>
        <h2 className="text-xl font-black text-[#0D2818] mb-2">Something went wrong</h2>
        <p className="text-xs text-[#5E7A67] mb-6 leading-relaxed">
          We encountered an issue loading your subscriber dashboard. Please try reloading or head back to home.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-black text-xs text-white bg-[#D97706] hover:bg-[#B45309] transition-all cursor-pointer shadow-sm"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs text-[#0D2818] bg-[#FAF7F2] border border-[#EAE2D2] hover:bg-[#EAE2D2] transition-all"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

