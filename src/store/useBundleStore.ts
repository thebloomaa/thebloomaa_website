import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
  isTrialPlan?: boolean;
}

export type BundleType = 'DAYS_1' | 'DAYS_7' | 'DAYS_15' | 'DAYS_30';

interface BundleState {
  // State
  selectedProduct: Product | null;
  bundleType: BundleType | null;
  pincode: string | null;
  deliveryTime: string | null;
  deliveryNote: string | null;
  isDrawerOpen: boolean;
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
  setDeliveryNote: (note: string) => void;
  setAddress: (address: { street: string; city: string; state: string; pincode: string }) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  reset: () => void;
}

const BUNDLE_DAYS: Record<BundleType, number> = {
  DAYS_1: 1,
  DAYS_7: 7,
  DAYS_15: 15,
  DAYS_30: 30,
};

// Discount multiplier: longer bundles get better per-day pricing
const BUNDLE_DISCOUNT: Record<BundleType, number> = {
  DAYS_1: 1.0,
  DAYS_7: 1.0,
  DAYS_15: 0.92,
  DAYS_30: 0.8,
};

export const useBundleStore = create<BundleState>()(
  persist(
    (set, get) => ({
      selectedProduct: null,
      bundleType: null,
      pincode: null,
      deliveryTime: null,
      deliveryNote: null,
      isDrawerOpen: false,
      address: null,

      getBundleDays: () => {
        const { bundleType } = get();
        return bundleType ? BUNDLE_DAYS[bundleType] : 0;
      },

      getPerDayPrice: () => {
        const { selectedProduct, bundleType } = get();
        if (!selectedProduct) return 0;
        if (
          selectedProduct.id === 'prod-single-day-diet-pack' ||
          selectedProduct.price === 70 ||
          bundleType === 'DAYS_1' ||
          selectedProduct.name.toLowerCase().includes('single')
        ) {
          return 70;
        }
        if (selectedProduct.type === 'TRIAL_PLAN' || selectedProduct.dietaryPreference === 'LIVING_RAW' || selectedProduct.isTrialPlan) {
          return Math.round(451 / 7);
        }
        if (!bundleType) return 0;
        return Math.round(Number(selectedProduct.price) * BUNDLE_DISCOUNT[bundleType]);
      },

      getTotalPrice: () => {
        const state = get();
        const { selectedProduct, bundleType } = state;
        if (
          selectedProduct &&
          (selectedProduct.id === 'prod-single-day-diet-pack' ||
            selectedProduct.price === 70 ||
            bundleType === 'DAYS_1' ||
            selectedProduct.name.toLowerCase().includes('single'))
        ) {
          return 70;
        }
        if (selectedProduct && (selectedProduct.type === 'TRIAL_PLAN' || selectedProduct.dietaryPreference === 'LIVING_RAW' || selectedProduct.isTrialPlan)) {
          return 451;
        }
        return state.getPerDayPrice() * state.getBundleDays();
      },

      selectProduct: (product) => {
        const isSingle =
          product.id === 'prod-single-day-diet-pack' ||
          product.price === 70 ||
          product.type === 'SINGLE_PACK' ||
          product.name.toLowerCase().includes('single');
        const isTrial =
          !isSingle &&
          (product.type === 'TRIAL_PLAN' || product.dietaryPreference === 'LIVING_RAW' || Boolean(product.isTrialPlan));

        set({ 
          selectedProduct: { ...product, isTrialPlan: isTrial },
          bundleType: isSingle ? 'DAYS_1' : isTrial ? 'DAYS_7' : get().bundleType,
          isDrawerOpen: true,
        });
      },
      selectBundle: (type) => set({ bundleType: type }),
      setPincode: (pincode) => set({ pincode }),
      setDeliveryTime: (time) => set({ deliveryTime: time }),
      setDeliveryNote: (note) => set({ deliveryNote: note }),
      setAddress: (address) => set({ address }),
      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      reset: () => set({ selectedProduct: null, bundleType: null, pincode: null, deliveryTime: null, deliveryNote: null, isDrawerOpen: false, address: null }),
    }),
    {
      name: 'thebloomaa-bundle-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedProduct: state.selectedProduct,
        bundleType: state.bundleType,
        pincode: state.pincode,
        deliveryTime: state.deliveryTime,
        deliveryNote: state.deliveryNote,
        address: state.address,
      }),
    }
  )
);

