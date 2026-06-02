/**
 * Custom Hook for Subscription
 * Provides easy access to subscription state and actions
 */

import { useEffect } from 'react';
import { useSubscriptionStore } from '../stores/subscriptionStore';

export function useSubscription() {
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
    clearError,
  } = useSubscriptionStore();

  // Fetch customer info and offerings on mount
  useEffect(() => {
    fetchCustomerInfo();
    fetchOfferings();
  }, [fetchCustomerInfo, fetchOfferings]);

  return {
    // State
    customerInfo,
    hasEsthiPro,
    currentOffering,
    allOfferings,
    isLoading,
    error,

    // Actions
    refresh: refreshCustomerInfo,
    fetchOfferings,
    clearError,
  };
}
