/**
 * Customer Center Component
 * Displays RevenueCat Customer Center for subscription management
 * Uses react-native-purchases-ui for the official customer center
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { RevenueCatUI } from 'react-native-purchases-ui';
import { getManagementURL, getCustomerInfo } from '../revenuecat/subscriptionManager';

interface CustomerCenterProps {
  onClose?: () => void;
  onError?: (error: Error) => void;
}

export function CustomerCenter({ onClose, onError }: CustomerCenterProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [managementURL, setManagementURL] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadManagementURL = useCallback(async () => {
    try {
      setIsLoading(true);
      const customerInfo = await getCustomerInfo();
      const url = getManagementURL(customerInfo);
      setManagementURL(url);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load customer center';
      setError(errorMsg);
      onError?.(err instanceof Error ? err : new Error(errorMsg));
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  useEffect(() => {
    loadManagementURL();
  }, [loadManagementURL]);

  const handleOpenManagementURL = async () => {
    if (managementURL) {
      const canOpen = await Linking.canOpenURL(managementURL);
      if (canOpen) {
        await Linking.openURL(managementURL);
      } else {
        setError('Cannot open subscription management URL');
      }
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading customer center...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.button} onPress={loadManagementURL}>
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Using RevenueCat's official customer center UI */}
      <RevenueCatUI.CustomerCenter
        onDismissed={() => {
          console.log('[CustomerCenter] Dismissed');
          onClose?.();
        }}
      />

      {/* Fallback option to open management URL directly */}
      {managementURL && (
        <TouchableOpacity
          style={styles.manageButton}
          onPress={handleOpenManagementURL}
        >
          <Text style={styles.manageButtonText}>
            Manage Subscriptions (Alternative)
          </Text>
        </TouchableOpacity>
      )}

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
    backgroundColor: '#FFF',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
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
  manageButton: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
    backgroundColor: '#34C759',
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  manageButtonText: {
    color: '#FFF',
    fontSize: 14,
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
