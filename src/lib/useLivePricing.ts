'use client';

import { useState, useEffect } from 'react';

export interface LivePricing {
  price: number;
  originalPrice: number;
  earlyBirdPrice: number;
  bookedCount: number;
  spotsLeft: number;
  totalSlots: number;
  isEarlyBird: boolean;
  percentFilled: number;
  isLoading: boolean;
}

const DEFAULT: LivePricing = {
  price: 499,
  originalPrice: 599,
  earlyBirdPrice: 499,
  bookedCount: 0,
  spotsLeft: 100,
  totalSlots: 100,
  isEarlyBird: true,
  percentFilled: 0,
  isLoading: true,
};

export function useLivePricing(): LivePricing {
  const [data, setData] = useState<LivePricing>(DEFAULT);

  useEffect(() => {
    let cancelled = false;

    const fetchPricing = async () => {
      try {
        const res = await fetch('/api/pricing', { cache: 'no-store' });
        if (!res.ok) throw new Error('Pricing fetch failed');
        const json = await res.json();
        if (!cancelled) {
          setData({ ...json, isLoading: false });
        }
      } catch {
        if (!cancelled) {
          setData({ ...DEFAULT, isLoading: false });
        }
      }
    };

    fetchPricing();
    return () => { cancelled = true; };
  }, []);

  return data;
}
