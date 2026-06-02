# RevenueCat Quick Start Guide

## Installation & Setup (Completed ✅)

### Packages Installed
- `react-native-purchases` (^10.2.0) - RevenueCat SDK
- `react-native-purchases-ui` (^10.2.0) - Official Paywall & Customer Center UI

### Files Created

#### Core Configuration
- `src/revenuecat/config.ts` - SDK initialization
- `src/revenuecat/subscriptionManager.ts` - Subscription functions
- `src/revenuecat/index.ts` - Module exports

#### State Management
- `src/stores/subscriptionStore.ts` - Zustand store
- `src/hooks/useSubscription.ts` - Custom hook

#### UI Components
- `src/components/Paywall.tsx` - RevenueCat Paywall
- `src/components/CustomerCenter.tsx` - Customer Center
- `src/components/SubscriptionStatus.tsx` - Status display

#### Integration
- `app/_layout.tsx` - Updated with RevenueCat initialization
- `app/settings.tsx` - Updated with subscription management UI

#### Documentation
- `REVENUECAT_INTEGRATION.md` - Complete integration guide
- `REVENUECAT_DASHBOARD_SETUP.md` - Dashboard configuration checklist

## 5-Minute Quick Start

### 1. Show Subscription Status Anywhere

```typescript
import { useSubscription } from '@/src/hooks/useSubscription';

function MyScreen() {
  const { hasEsthiPro } = useSubscription();
  
  return (
    <Text>
      Status: {hasEsthiPro ? '🎉 Esthi Pro' : 'Free User'}
    </Text>
  );
}
```

### 2. Add Paywall to Your Screen

```typescript
import { Paywall } from '@/src/components/Paywall';
import { useState } from 'react';
import { Modal, Pressable, Text } from 'react-native';

function UpgradeScreen() {
  const [showPaywall, setShowPaywall] = useState(false);

  return (
    <>
      <Pressable onPress={() => setShowPaywall(true)}>
        <Text>Subscribe Now</Text>
      </Pressable>

      <Modal visible={showPaywall}>
        <Paywall onClose={() => setShowPaywall(false)} />
      </Modal>
    </>
  );
}
```

### 3. Add Subscription Status Display

```typescript
import { SubscriptionStatus } from '@/src/components/SubscriptionStatus';

function ProfileScreen() {
  return <SubscriptionStatus />;
}
```

### 4. Check Entitlements in Code

```typescript
import { useSubscription } from '@/src/hooks/useSubscription';

function ContentScreen() {
  const { hasEsthiPro } = useSubscription();

  if (!hasEsthiPro) {
    return <PromoScreen />;
  }

  return <PremiumContent />;
}
```

## Current Integration Status

### ✅ Complete
- [x] SDK installed and configured
- [x] API key configured (test_shvqxUHedVYHANlkMFhIGVJpKqL)
- [x] SDK initialized in app startup
- [x] Paywall component ready
- [x] Customer Center component ready
- [x] Subscription status component ready
- [x] Settings page integrated
- [x] Custom hook for easy access
- [x] Global state management with Zustand

### 📋 Next Steps (In RevenueCat Dashboard)

1. **Create Products**
   - Create 3 products: `monthly`, `three_month`, `lifetime`
   - Prices in local currency
   - Localized descriptions

2. **Create Entitlements**
   - Create "Esthi Pro" entitlement
   - Link all 3 products to it

3. **Create Offerings**
   - Create default offering
   - Add all products
   - Set display order

4. **Create Paywall**
   - Use RevenueCat's Paywall builder
   - Preview on mobile

5. **Test**
   - Install app
   - Test paywall flow
   - Test entitlement checking
   - Test customer center

## Architecture Overview

```
┌─────────────────────────────────────┐
│  RevenueCat Cloud                   │
│  - Offerings                        │
│  - Products                         │
│  - Entitlements                     │
└─────────────────────────────────────┘
         ▲              ▼
         │              │
         │        ┌──────────────────┐
         │        │ SDK Core         │
         │        │ (config.ts)      │
         │        └──────────────────┘
         │              ▲
         │              │
    ┌────┴──────────────┴────┐
    │  subscriptionManager   │
    │  - Purchase            │
    │  - Restore             │
    │  - Check entitlements  │
    └────────────┬───────────┘
                 │
         ┌───────┴────────┐
         │                │
    ┌────▼────┐      ┌───▼─────┐
    │ Store   │      │  Hooks  │
    │ (Zustand)      │ Custom  │
    └────┬────┘      └────┬────┘
         │                │
    ┌────┴────────────────┴─────┐
    │      UI Components        │
    │  - Paywall               │
    │  - CustomerCenter        │
    │  - SubscriptionStatus    │
    └──────────────────────────┘
```

## Key Features

### 🎯 Entitlement Checking
```typescript
const { hasEsthiPro } = useSubscription();
```

### 💳 Purchase Flow
- User opens paywall
- Selects plan
- Completes payment
- Entitlements update automatically

### 🔄 Restore Purchases
- Users can restore previous purchases
- One-tap in settings

### 👤 Customer Center
- Users manage subscriptions
- Cancel, downgrade, upgrade
- View purchase history

### 📊 Analytics Ready
- Built-in logging
- Debug mode available
- Revenue tracking

## Configuration Files

### API Key Location
`src/revenuecat/config.ts` - Line 9

⚠️ **For Production:**
- Move to environment variables
- Use: `EXPO_PUBLIC_REVENUECAT_API_KEY`

### Product IDs
`src/revenuecat/config.ts` - Lines 70-76

Match these with RevenueCat dashboard:
- `monthly`
- `three_month`  
- `lifetime`

### Entitlements
`src/revenuecat/config.ts` - Lines 79-81

```typescript
ESTHI_PRO: 'Esthi Pro'
```

## Usage Patterns

### Pattern 1: Paywall Behind Feature
```typescript
if (!hasEsthiPro) {
  return <Paywall />;
}
return <PremiumFeature />;
```

### Pattern 2: Show Upgrade Banner
```typescript
{!hasEsthiPro && (
  <UpgradeBanner onPress={() => setPaywallVisible(true)} />
)}
```

### Pattern 3: Limited Free Trial
```typescript
const { customerInfo } = useSubscription();
const daysLeft = calculateTrialDays(customerInfo);

if (daysLeft === 0) {
  showPaywall();
}
```

## Error Handling

All operations include error handling:

```typescript
try {
  await purchasePackage(pkg);
} catch (error) {
  if (error.userCancelled) {
    // User cancelled
  } else {
    // Show error message
  }
}
```

## Debugging

Enable debug logging:

```typescript
import Purchases, { LogLevel } from 'react-native-purchases';
Purchases.setLogLevel(LogLevel.DEBUG);
```

Check console for:
- `[RevenueCat]` prefixed messages
- SDK initialization status
- Purchase flow events

## Next: Full Documentation

See detailed guides:
- `REVENUECAT_INTEGRATION.md` - Complete usage examples
- `REVENUECAT_DASHBOARD_SETUP.md` - Dashboard setup checklist

## Support

- RevenueCat Docs: https://www.revenuecat.com/docs
- Community: https://community.revenuecat.com
- This guide: `REVENUECAT_INTEGRATION.md`

## What's Ready to Use Now

✅ Open any screen and add:
```typescript
import { useSubscription } from '@/src/hooks/useSubscription';

const { hasEsthiPro } = useSubscription();
```

✅ Show paywall in settings (already integrated)

✅ Check entitlements anywhere in app

✅ Manage subscriptions via Customer Center

## Before Production

⚠️ Review these sections in docs:
1. Environment variables setup
2. Production API key configuration
3. iOS/Android app store setup
4. RevenueCat dashboard configuration
5. Testing checklist
