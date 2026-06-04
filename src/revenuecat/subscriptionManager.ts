/**
 * RevenueCat Subscription Manager
 * Handles customer info, purchases, and entitlement checking
 */

import Purchases, {
  CustomerInfo,
  PurchasesPackage,
  PurchasesOffering,
  PurchasesStoreTransaction,
} from 'react-native-purchases';
import { ENTITLEMENTS } from './config';

/**
 * Get current customer info
 */
export async function getCustomerInfo(): Promise<CustomerInfo> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.error('[RevenueCat] Failed to get customer info:', error);
    throw error;
  }
}

/**
 * Check if user has a specific entitlement
 */
export function hasEntitlement(
  customerInfo: CustomerInfo,
  entitlementID: string
): boolean {
  const entitlements = customerInfo.entitlements.active;
  return entitlementID in entitlements;
}

/**
 * Check if user has Esthi Pro
 */
export function hasEsthiPro(customerInfo: CustomerInfo): boolean {
  return hasEntitlement(customerInfo, ENTITLEMENTS.ESTHI_PRO);
}

/**
 * Get all offerings from RevenueCat
 */
export async function getOfferings(): Promise<PurchasesOffering[] | null> {
  try {
    const offerings = await Purchases.getOfferings();
    const allOfferings = Object.values(offerings.all);
    return allOfferings.length > 0 ? allOfferings : null;
  } catch (error) {
    console.error('[RevenueCat] Failed to get offerings:', error);
    throw error;
  }
}

/**
 * Get current offering
 */
export async function getCurrentOffering(): Promise<PurchasesOffering | null> {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch (error) {
    console.error('[RevenueCat] Failed to get current offering:', error);
    throw error;
  }
}

/**
 * Get a specific package from an offering
 */
export function getPackageFromOffering(
  offering: PurchasesOffering | null,
  packageType: string
): PurchasesPackage | null {
  if (!offering) return null;
  const normalizedPackageType = packageType.toLowerCase();
  return (
    offering.availablePackages.find((pkg) => {
      return (
        pkg.identifier.toLowerCase() === normalizedPackageType ||
        pkg.packageType.toLowerCase() === normalizedPackageType
      );
    }) ?? null
  );
}

/**
 * Purchase a package
 */
export async function purchasePackage(
  packageToPurchase: PurchasesPackage
): Promise<CustomerInfo> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
    console.log('[RevenueCat] Purchase successful');
    return customerInfo;
  } catch (error: any) {
    if (error.userCancelled) {
      console.log('[RevenueCat] Purchase cancelled by user');
    } else {
      console.error('[RevenueCat] Purchase failed:', error);
    }
    throw error;
  }
}

/**
 * Restore purchases
 */
export async function restorePurchases(): Promise<CustomerInfo> {
  try {
    const customerInfo = await Purchases.restorePurchases();
    console.log('[RevenueCat] Purchases restored');
    return customerInfo;
  } catch (error) {
    console.error('[RevenueCat] Failed to restore purchases:', error);
    throw error;
  }
}

/**
 * Get active subscriptions
 */
export function getActiveSubscriptions(
  customerInfo: CustomerInfo
): string[] {
  return customerInfo.activeSubscriptions;
}

/**
 * Get all purchases
 */
export function getAllPurchases(customerInfo: CustomerInfo): string[] {
  return customerInfo.allPurchasedProductIdentifiers;
}

/**
 * Get non-subscription purchases (consumables, non-renewing subscriptions)
 */
export function getNonSubscriptionPurchases(
  customerInfo: CustomerInfo
): PurchasesStoreTransaction[] {
  return customerInfo.nonSubscriptionTransactions;
}

/**
 * Get management URL for managing subscriptions
 */
export function getManagementURL(customerInfo: CustomerInfo): string | null {
  return customerInfo.managementURL;
}

/**
 * Get original app user ID
 */
export async function getAppUserID(): Promise<string> {
  try {
    const appUserID = await Purchases.getAppUserID();
    return appUserID;
  } catch (error) {
    console.error('[RevenueCat] Failed to get app user ID:', error);
    throw error;
  }
}
