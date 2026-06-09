/**
 * RevenueCat Configuration
 * Handles SDK initialization and setup
 */

import Purchases, {
  LOG_LEVEL,
} from 'react-native-purchases';

// API Key - Store this securely in your environment
// IMPORTANT: Never hardcode this in production - use environment variables or secure storage
export const REVENUECAT_API_KEY = 'test_shvqxUHedVYHANlkMFhIGVJpKqL';

/**
 * Initialize RevenueCat SDK
 * Must be called before any other RevenueCat functionality
 */
export async function initializeRevenueCat(): Promise<void> {
  try {
    Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.ERROR);

    // Configure the SDK with API key
    Purchases.configure({
      apiKey: REVENUECAT_API_KEY,
      appUserID: undefined, // Let RevenueCat handle anonymous user ID, or set custom ID
    });

    if (__DEV__) {
      console.log('[RevenueCat] SDK initialized successfully');
    }
  } catch (error) {
    console.error('[RevenueCat] Failed to initialize SDK:', error);
    throw error;
  }
}

/**
 * Product IDs configuration for different platforms
 */
export const PRODUCT_IDS = {
  MONTHLY: 'monthly',
  THREE_MONTH: 'three_month',
  LIFETIME: 'lifetime',
};

/**
 * Entitlements configuration
 */
export const ENTITLEMENTS = {
  ESTHI_PRO: 'Esthi Pro',
};
