/**
 * Subscription Store
 * Manages subscription state globally using Zustand
 */

import { create } from 'zustand';
import { CustomerInfo, PurchasesOffering } from 'react-native-purchases';
import {
  getCustomerInfo,
  hasEsthiPro,
  getOfferings,
  getCurrentOffering,
} from '../revenuecat/subscriptionManager';

interface SubscriptionStore {
  // State
  customerInfo: CustomerInfo | null;
  isLoading: boolean;
  error: string | null;
  hasEsthiPro: boolean;
  currentOffering: PurchasesOffering | null;
  allOfferings: PurchasesOffering[] | null;

  // Actions
  fetchCustomerInfo: () => Promise<void>;
  fetchOfferings: () => Promise<void>;
  refreshCustomerInfo: () => Promise<void>;
  updateCustomerInfo: (customerInfo: CustomerInfo | null) => void;
  clearError: () => void;
  reset: () => void;
}

export const useSubscriptionStore = create<SubscriptionStore>((set, get) => ({
  // Initial state
  customerInfo: null,
  isLoading: false,
  error: null,
  hasEsthiPro: false,
  currentOffering: null,
  allOfferings: null,

  // Fetch customer info and offerings
  fetchCustomerInfo: async () => {
    set({ isLoading: true, error: null });
    try {
      const info = await getCustomerInfo();
      set({
        customerInfo: info,
        hasEsthiPro: hasEsthiPro(info),
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
      });
    }
  },

  // Fetch offerings
  fetchOfferings: async () => {
    set({ isLoading: true, error: null });
    try {
      const offerings = await getOfferings();
      const current = await getCurrentOffering();
      set({
        allOfferings: offerings,
        currentOffering: current,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
      });
    }
  },

  // Refresh customer info
  refreshCustomerInfo: async () => {
    const state = get();
    if (state.isLoading) return; // Prevent duplicate requests
    await state.fetchCustomerInfo();
  },

  updateCustomerInfo: (customerInfo) =>
    set({
      customerInfo,
      hasEsthiPro: customerInfo ? hasEsthiPro(customerInfo) : false,
      isLoading: false,
      error: null,
    }),

  // Clear error
  clearError: () => set({ error: null }),

  // Reset state
  reset: () =>
    set({
      customerInfo: null,
      isLoading: false,
      error: null,
      hasEsthiPro: false,
      currentOffering: null,
      allOfferings: null,
    }),
}));
