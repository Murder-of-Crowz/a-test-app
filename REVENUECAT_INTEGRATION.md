# RevenueCat SDK Integration Guide - Esthi App

## Overview

This guide documents the complete RevenueCat SDK integration for the Esthi app. RevenueCat handles subscription management, entitlement checking, and payment processing across iOS and Android.

## Features Implemented

- ✅ SDK initialization and configuration
- ✅ Customer info retrieval and management
- ✅ Entitlement checking for "Esthi Pro"
- ✅ Product configuration (Monthly, Three Month, Lifetime)
- ✅ RevenueCat Paywall UI integration
- ✅ Customer Center UI integration
- ✅ Purchase management and restoration
- ✅ Global subscription state management (Zustand)
- ✅ Custom hooks for easy subscription access
- ✅ Settings integration for subscription management

## File Structure

```
src/
├── revenuecat/
│   ├── config.ts                 # SDK configuration and initialization
│   ├── subscriptionManager.ts    # Core subscription functions
│   └── index.ts                  # Module exports
├── stores/
│   └── subscriptionStore.ts      # Zustand store for subscription state
├── hooks/
│   └── useSubscription.ts        # Custom hook for subscription access
└── components/
    ├── Paywall.tsx              # RevenueCat Paywall component
    ├── CustomerCenter.tsx       # RevenueCat Customer Center component
    └── SubscriptionStatus.tsx   # Subscription status display
```

## Configuration

### API Key

The RevenueCat API key is configured in `src/revenuecat/config.ts`:

```typescript
export const REVENUECAT_API_KEY = 'test_shvqxUHedVYHANlkMFhIGVJpKqL';
```

⚠️ **Important**: In production, move this to environment variables:

```typescript
const REVENUECAT_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY!;
```

### Product IDs

Products are configured as:
- `monthly` - Monthly subscription
- `three_month` - Three-month subscription
- `lifetime` - Lifetime purchase

### Entitlements

Configured entitlement:
- `Esthi Pro` - Premium access

## Usage Examples

### 1. Basic Subscription Status

Get the current user's subscription status in any component:

```typescript
import { useSubscription } from '@/src/hooks/useSubscription';

function MyComponent() {
  const { hasEsthiPro, isLoading, error, customerInfo } = useSubscription();

  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error}</Text>;

  return (
    <Text>
      {hasEsthiPro ? 'Pro User' : 'Free User'}
    </Text>
  );
}
```

### 2. Display Paywall

Show the RevenueCat paywall for purchases:

```typescript
import { Paywall } from '@/src/components/Paywall';
import { useState } from 'react';
import { Modal, Pressable, Text } from 'react-native';

function MyScreen() {
  const [paywallVisible, setPaywallVisible] = useState(false);

  return (
    <>
      <Pressable onPress={() => setPaywallVisible(true)}>
        <Text>Subscribe</Text>
      </Pressable>

      <Modal visible={paywallVisible} animationType="slide">
        <Paywall
          onPurchaseSuccess={() => {
            setPaywallVisible(false);
            // Handle successful purchase
          }}
          onPurchaseError={(error) => {
            console.error('Purchase failed:', error);
          }}
          onClose={() => setPaywallVisible(false)}
        />
      </Modal>
    </>
  );
}
```

### 3. Customer Center (Manage Subscriptions)

Allow users to manage their subscriptions:

```typescript
import { CustomerCenter } from '@/src/components/CustomerCenter';

function SettingsScreen() {
  const [customerCenterVisible, setCustomerCenterVisible] = useState(false);

  return (
    <>
      <Pressable onPress={() => setCustomerCenterVisible(true)}>
        <Text>Manage Subscription</Text>
      </Pressable>

      <Modal visible={customerCenterVisible} animationType="slide">
        <CustomerCenter
          onClose={() => setCustomerCenterVisible(false)}
        />
      </Modal>
    </>
  );
}
```

### 4. Subscription Status Display

Show detailed subscription information:

```typescript
import { SubscriptionStatus } from '@/src/components/SubscriptionStatus';

function ProfileScreen() {
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [customerCenterVisible, setCustomerCenterVisible] = useState(false);

  return (
    <>
      <SubscriptionStatus
        onPurchasePressed={() => setPaywallVisible(true)}
        onManagePressed={() => setCustomerCenterVisible(true)}
      />
      
      <Modal visible={paywallVisible} animationType="slide">
        <Paywall onClose={() => setPaywallVisible(false)} />
      </Modal>

      <Modal visible={customerCenterVisible} animationType="slide">
        <CustomerCenter onClose={() => setCustomerCenterVisible(false)} />
      </Modal>
    </>
  );
}
```

### 5. Manual Purchase Handling

For custom purchase flows:

```typescript
import {
  purchasePackage,
  getOfferings,
  getCustomerInfo,
} from '@/src/revenuecat/subscriptionManager';

async function handleCustomPurchase() {
  try {
    // Get available offerings
    const offerings = await getOfferings();
    if (!offerings) return;

    // Get a specific package
    const monthlyPackage = offerings[0].getPackage('$rc_monthly');
    
    if (monthlyPackage) {
      // Make the purchase
      const customerInfo = await purchasePackage(monthlyPackage);
      console.log('Purchase successful!', customerInfo);
    }
  } catch (error) {
    console.error('Purchase failed:', error);
  }
}
```

### 6. Restore Purchases

Allow users to restore previous purchases:

```typescript
import { restorePurchases } from '@/src/revenuecat/subscriptionManager';

async function handleRestorePurchases() {
  try {
    const customerInfo = await restorePurchases();
    console.log('Purchases restored!', customerInfo);
  } catch (error) {
    console.error('Restore failed:', error);
  }
}
```

### 7. Set Custom User ID

When user logs in:

```typescript
import { setRevenueCatUserID } from '@/src/revenuecat/config';

async function handleUserLogin(userID: string) {
  try {
    await setRevenueCatUserID(userID);
    // User ID is now tracked in RevenueCat
  } catch (error) {
    console.error('Failed to set user ID:', error);
  }
}
```

### 8. Get Customer Information

Access detailed customer info:

```typescript
import { getCustomerInfo } from '@/src/revenuecat/subscriptionManager';

async function getDetails() {
  const customerInfo = await getCustomerInfo();
  
  console.log('Active subscriptions:', customerInfo.activeSubscriptions);
  console.log('All purchases:', customerInfo.allPurchasedProductIdentifiers);
  console.log('Entitlements:', customerInfo.entitlements.active);
}
```

## Integration Points

### App Initialization

RevenueCat is initialized in `app/_layout.tsx`:

```typescript
import { initializeRevenueCat } from '@/src/revenuecat/config';

useEffect(() => {
  initializeRevenueCat()
    .then(() => console.log('[RevenueCat] Initialized successfully'))
    .catch((error) => console.error('[RevenueCat] Failed to initialize:', error));
}, []);
```

### Settings Screen

The settings screen (`app/settings.tsx`) includes:
- Current plan display (Free/Esthi Pro)
- Restore purchases button
- Manage subscription button (opens Customer Center)
- Upgrade button (opens Paywall)

## Error Handling

All functions include error handling:

```typescript
try {
  await purchasePackage(package);
} catch (error) {
  if (error.userCancelled) {
    console.log('User cancelled purchase');
  } else {
    console.error('Purchase failed:', error.message);
    // Show error to user
  }
}
```

## Best Practices

### 1. Entitlement Checking

Always check entitlements before granting access:

```typescript
import { hasEsthiPro } from '@/src/revenuecat/subscriptionManager';

if (hasEsthiPro(customerInfo)) {
  // Show premium features
} else {
  // Show paywall or limited features
}
```

### 2. Refresh on App Focus

Refresh subscription status when app comes to foreground:

```typescript
import { useFocusEffect } from '@react-navigation/native';

useFocusEffect(
  useCallback(() => {
    subscriptionStore.refreshCustomerInfo();
  }, [])
);
```

### 3. Store User ID

Always set custom user ID after login to track subscriptions:

```typescript
// In login flow
await setRevenueCatUserID(user.id);
```

### 4. Test on Both Platforms

RevenueCat works differently on iOS and Android:
- iOS: Uses StoreKit
- Android: Uses Google Play Billing

Test on both platforms before release.

### 5. Use Customer Center

Let RevenueCat handle subscription management:
- Don't build custom cancellation flows
- Use Customer Center for refunds, downgrades, upgrades
- More reliable and compliant

## Testing

### Test Account

Use the test API key provided (test_shvqxUHedVYHANlkMFhIGVJpKqL) for sandbox testing.

### Sandbox Testing

1. **iOS**: Use Sandbox Apple ID in settings
2. **Android**: Use test license key in Google Play Console

### Debug Logging

Enable debug logging in development:

```typescript
import Purchases, { LogLevel } from 'react-native-purchases';

Purchases.setLogLevel(LogLevel.DEBUG); // In config.ts
```

## Production Deployment

### Before Going Live

1. ✅ Replace test API key with production key
2. ✅ Move API key to environment variables
3. ✅ Test on physical iOS and Android devices
4. ✅ Configure offerings in RevenueCat dashboard
5. ✅ Set up TestFlight/internal testing
6. ✅ Monitor RevenueCat dashboard for issues

### Environment Variables

Create `.env.local`:

```
EXPO_PUBLIC_REVENUECAT_API_KEY=sk_live_xxxxxxxxxxxx
EXPO_PUBLIC_APP_ENV=production
```

## Troubleshooting

### Issue: Paywall not showing

```typescript
// Ensure offerings are loaded
const { currentOffering, allOfferings } = useSubscription();
if (!currentOffering && !allOfferings) {
  console.log('No offerings available');
}
```

### Issue: Entitlements not updating

```typescript
// Manually refresh customer info
import { useSubscriptionStore } from '@/src/stores/subscriptionStore';
const store = useSubscriptionStore();
await store.refreshCustomerInfo();
```

### Issue: Purchases not restoring

```typescript
// Use correct entitlement ID
// Check RevenueCat dashboard for exact entitlement names
```

## Support & Resources

- **RevenueCat Docs**: https://www.revenuecat.com/docs
- **Paywalls**: https://www.revenuecat.com/docs/tools/paywalls
- **Customer Center**: https://www.revenuecat.com/docs/tools/customer-center
- **API Reference**: https://www.revenuecat.com/docs/api

## Next Steps

1. Configure offerings in RevenueCat dashboard
2. Set up iOS and Android app stores
3. Test purchase flow end-to-end
4. Monitor analytics in RevenueCat dashboard
5. Adjust pricing and offerings based on user data
