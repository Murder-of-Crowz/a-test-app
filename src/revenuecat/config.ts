/**
 * RevenueCat Configuration
 * Handles SDK initialization and setup
 */

import Purchases, {
  PurchasesConfiguration,
  LogLevel,
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
    // Configure the SDK
    const configuration = new PurchasesConfiguration({
      apiKey: REVENUECAT_API_KEY,
      appUserID: undefined, // Let RevenueCat handle anonymous user ID, or set custom ID
    });

    // Set log level for development (optional, remove or set to ERROR in production)
    Purchases.setLogLevel(LogLevel.DEBUG);

    // Initialize the SDK
    await Purchases.configure(configuration);

    console.log('[RevenueCat] SDK initialized successfully');
  } catch (error) {
    console.error('[RevenueCat] Failed to initialize SDK:', error);
    throw error;
  }
}

/**
 * Set a custom user ID for subscription tracking
 * Call this after user login
 */
export async function setRevenueCatUserID(userID: string): Promise<void> {
  try {
    // Set the app user ID for tracking and analytics
    await Purchases.logIn(userID);
    console.log(`[RevenueCat] User ID set: ${userID}`);
  } catch (error) {
    console.error('[RevenueCat] Failed to set user ID:', error);
    throw error;
  }
}

/**
 * Log out the current user
 */
export async function logOutRevenueCatUser(): Promise<void> {
  try {
    await Purchases.logOut();
    console.log('[RevenueCat] User logged out');
  } catch (error) {
    console.error('[RevenueCat] Failed to log out user:', error);
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
