import { create } from 'zustand';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  type: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  dietaryPreference: string;
}

export type BundleType = 'DAYS_7' | 'DAYS_15' | 'DAYS_30';

interface BundleState {
  // State
  selectedProduct: Product | null;
  bundleType: BundleType | null;
  pincode: string | null;
  deliveryTime: string | null;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  } | null;

  // Computed
  getBundleDays: () => number;
  getTotalPrice: () => number;
  getPerDayPrice: () => number;

  // Actions
  selectProduct: (product: Product) => void;
  selectBundle: (type: BundleType) => void;
  setPincode: (pincode: string) => void;
  setDeliveryTime: (time: string) => void;
  setAddress: (address: { street: string; city: string; state: string; pincode: string }) => void;
  reset: () => void;
}

const BUNDLE_DAYS: Record<BundleType, number> = {
  DAYS_7: 7,
  DAYS_15: 15,
  DAYS_30: 30,
};

// Discount multiplier: longer bundles get better per-day pricing
const BUNDLE_DISCOUNT: Record<BundleType, number> = {
  DAYS_7: 1.0,
  DAYS_15: 0.92,
  DAYS_30: 0.8,
};

export const useBundleStore = create<BundleState>((set, get) => ({
  selectedProduct: null,
  bundleType: null,
  pincode: null,
  deliveryTime: null,
  address: null,

  getBundleDays: () => {
    const { bundleType } = get();
    return bundleType ? BUNDLE_DAYS[bundleType] : 0;
  },

  getPerDayPrice: () => {
    const { selectedProduct, bundleType } = get();
    if (!selectedProduct || !bundleType) return 0;
    return Math.round(Number(selectedProduct.price) * BUNDLE_DISCOUNT[bundleType]);
  },

  getTotalPrice: () => {
    const state = get();
    return state.getPerDayPrice() * state.getBundleDays();
  },

  selectProduct: (product) => set({ selectedProduct: product }),
  selectBundle: (type) => set({ bundleType: type }),
  setPincode: (pincode) => set({ pincode }),
  setDeliveryTime: (time) => set({ deliveryTime: time }),
  setAddress: (address) => set({ address }),
  reset: () => set({ selectedProduct: null, bundleType: null, pincode: null, deliveryTime: null, address: null }),
}));
