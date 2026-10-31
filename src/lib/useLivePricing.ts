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
  isLocked: boolean;
  opensAt: string;
  opensAtLabel: string;
}

const DEFAULT: LivePricing = {
  price: 599,
  originalPrice: 699,
  earlyBirdPrice: 599,
  bookedCount: 0,
  spotsLeft: 0,
  totalSlots: 100,
  isEarlyBird: false,
  percentFilled: 100,
  isLoading: true,
  isLocked: false,
  opensAt: '',
  opensAtLabel: '',
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
