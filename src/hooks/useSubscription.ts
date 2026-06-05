/**
 * Custom Hook for Subscription
 * Provides easy access to subscription state and actions
 */

import { useEffect } from 'react';
import { useSubscriptionStore } from '../stores/subscriptionStore';
import { useSettingsStore } from '../settingsStore';

type UseSubscriptionOptions = {
  refreshOnMount?: boolean;
  fetchOfferings?: boolean;
};

export function useSubscription(options: UseSubscriptionOptions = {}) {
  const {
    refreshOnMount = false,
    fetchOfferings: shouldFetchOfferings = false,
  } = options;
  const forceFreeForTesting = useSettingsStore((state) => state.forceFreeForTesting);
  const {
    customerInfo,
    hasEsthiPro,
    currentOffering,
    allOfferings,
    isLoading,
    error,
    fetchCustomerInfo,
    fetchOfferings,
    refreshCustomerInfo,
    updateCustomerInfo,
    clearError,
  } = useSubscriptionStore();

  // Most screens only need the cached subscription state. RevenueCat is
  // refreshed once at app startup and then kept current by its listener.
  useEffect(() => {
    if (refreshOnMount) {
      fetchCustomerInfo();
    }
    if (shouldFetchOfferings) {
      fetchOfferings();
    }
  }, [fetchCustomerInfo, fetchOfferings, refreshOnMount, shouldFetchOfferings]);

  return {
    // State
    customerInfo,
    hasEsthiPro: forceFreeForTesting ? false : hasEsthiPro,
    currentOffering,
    allOfferings,
    isLoading,
    error,

    // Actions
    refresh: refreshCustomerInfo,
    updateCustomerInfo,
    fetchOfferings,
    clearError,
  };
}
