/**
 * Paywall Component
 * Displays RevenueCat paywall UI for subscription management
 * Uses react-native-purchases-ui for the official paywall
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import RevenueCatUI from 'react-native-purchases-ui';
import { CustomerInfo, PurchasesError, PurchasesOffering } from 'react-native-purchases';

interface PaywallProps {
  onPurchaseSuccess?: (customerInfo?: CustomerInfo) => void;
  onPurchaseError?: (error: PurchasesError) => void;
  onClose?: () => void;
  offering?: PurchasesOffering | null;
}

export function Paywall({
  onPurchaseSuccess,
  onPurchaseError,
  onClose,
  offering,
}: PaywallProps) {
  return (
    <View style={styles.container}>
      {/* Using RevenueCat's official paywall UI */}
      <RevenueCatUI.Paywall
        options={{
          offering,
          displayCloseButton: true,
        }}
        onPurchaseCompleted={({ customerInfo }) => {
          onPurchaseSuccess?.(customerInfo);
        }}
        onPurchaseError={({ error }: { error: PurchasesError }) => {
          console.error('[Paywall] Purchase failed:', error);
          onPurchaseError?.(error);
        }}
        onPurchaseCancelled={() => {
          onClose?.();
        }}
        onRestoreCompleted={({ customerInfo }) => {
          onPurchaseSuccess?.(customerInfo);
        }}
        onRestoreError={({ error }: { error: PurchasesError }) => {
          console.error('[Paywall] Restore failed:', error);
          onPurchaseError?.(error);
        }}
        onDismiss={() => {
          onClose?.();
        }}
      />

      {onClose && (
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
