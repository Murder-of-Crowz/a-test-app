/**
 * Subscription Status Component
 * Displays user's current subscription status and entitlements
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSubscription } from '../hooks/useSubscription';
import {
  getActiveSubscriptions,
} from '../revenuecat/subscriptionManager';

interface SubscriptionStatusProps {
  onPurchasePressed?: () => void;
  onManagePressed?: () => void;
}

export function SubscriptionStatus({
  onPurchasePressed,
  onManagePressed,
}: SubscriptionStatusProps) {
  const {
    hasEsthiPro,
    customerInfo,
    isLoading,
    error,
    refresh,
  } = useSubscription();

  const activeSubscriptions = customerInfo
    ? getActiveSubscriptions(customerInfo)
    : null;

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
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Esthi Pro Status */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Text style={styles.statusTitle}>Esthi Pro Status</Text>
          <View
            style={[
              styles.statusBadge,
              hasEsthiPro ? styles.activeBadge : styles.inactiveBadge,
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                hasEsthiPro ? styles.activeBadgeText : styles.inactiveBadgeText,
              ]}
            >
              {hasEsthiPro ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>

        {hasEsthiPro && (
          <Text style={styles.proFeatures}>
            You have access to all Esthi Pro features
          </Text>
        )}

        {!hasEsthiPro && (
          <Text style={styles.noProFeatures}>
            Upgrade to Esthi Pro to unlock premium features
          </Text>
        )}
      </View>

      {/* Active Subscriptions */}
      {activeSubscriptions && activeSubscriptions.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Active Subscriptions</Text>
          {Array.from(activeSubscriptions).map((subscription, index) => (
            <View key={index} style={styles.listItem}>
              <Text style={styles.listItemText}>• {subscription}</Text>
            </View>
          ))}
        </View>
      )}

      {/* All Purchases */}
      {customerInfo && customerInfo.allPurchasedProductIdentifiers.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>All Purchases</Text>
          {Array.from(customerInfo.allPurchasedProductIdentifiers).map(
            (purchase, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.listItemText}>• {purchase}</Text>
              </View>
            )
          )}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        {!hasEsthiPro && onPurchasePressed && (
          <TouchableOpacity style={styles.purchaseButton} onPress={onPurchasePressed}>
            <Text style={styles.purchaseButtonText}>Subscribe Now</Text>
          </TouchableOpacity>
        )}

        {onManagePressed && (
          <TouchableOpacity style={styles.manageButton} onPress={onManagePressed}>
            <Text style={styles.manageButtonText}>Manage Subscription</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.refreshButton} onPress={refresh}>
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* Additional Info */}
      {customerInfo && (
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Account Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Entitlements:</Text>
            <Text style={styles.infoValue}>
              {Object.keys(customerInfo.entitlements.all).length}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Purchases:</Text>
            <Text style={styles.infoValue}>
              {customerInfo.allPurchasedProductIdentifiers.length}
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  statusCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  activeBadge: {
    backgroundColor: '#D1FAE5',
  },
  inactiveBadge: {
    backgroundColor: '#FEE2E2',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeBadgeText: {
    color: '#047857',
  },
  inactiveBadgeText: {
    color: '#DC2626',
  },
  proFeatures: {
    fontSize: 14,
    color: '#047857',
    fontWeight: '500',
  },
  noProFeatures: {
    fontSize: 14,
    color: '#DC2626',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000',
  },
  listItem: {
    paddingVertical: 8,
  },
  listItemText: {
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
    marginBottom: 16,
    gap: 12,
  },
  purchaseButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  purchaseButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  manageButton: {
    backgroundColor: '#34C759',
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  manageButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  refreshButton: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
  },
});
