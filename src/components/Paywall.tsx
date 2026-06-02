/**
 * Paywall Component
 * Displays RevenueCat paywall UI for subscription management
 * Uses react-native-purchases-ui for the official paywall
 */

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { RevenueCatUI } from 'react-native-purchases-ui';
import { useSubscription } from '../hooks/useSubscription';

interface PaywallProps {
  onPurchaseSuccess?: () => void;
  onPurchaseError?: (error: Error) => void;
  onClose?: () => void;
  offering?: any; // PurchasesOffering
}

export function Paywall({
  onPurchaseSuccess,
  onPurchaseError,
  onClose,
}: PaywallProps) {
  const { currentOffering, isLoading, error } = useSubscription();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
        {onClose && (
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Using RevenueCat's official paywall UI */}
      <RevenueCatUI.Paywall
        offering={currentOffering}
        onPurchaseCompleted={(customerInfo) => {
          console.log('[Paywall] Purchase completed');
          onPurchaseSuccess?.();
        }}
        onPurchaseFailed={(error) => {
          console.error('[Paywall] Purchase failed:', error);
          onPurchaseError?.(error);
        }}
        onPurchaseCancelled={() => {
          console.log('[Paywall] Purchase cancelled');
        }}
        onRestoreCompleted={(customerInfo) => {
          console.log('[Paywall] Restore completed');
          onPurchaseSuccess?.();
        }}
        onRestoreFailed={(error) => {
          console.error('[Paywall] Restore failed:', error);
          onPurchaseError?.(error);
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
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
