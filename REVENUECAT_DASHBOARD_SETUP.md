# RevenueCat Dashboard Configuration Checklist

Follow these steps to configure RevenueCat for the Esthi app.

## Account Setup

- [ ] Create RevenueCat account at https://app.revenuecat.com
- [ ] Create a new "Esthi" project
- [ ] Note the API key: `test_shvqxUHedVYHANlkMFhIGVJpKqL` (for testing)
- [ ] Generate production API key for live deployment

## iOS App Configuration

### 1. Create App in RevenueCat Dashboard

- [ ] Go to "Projects" → "Esthi"
- [ ] Click "Add app" → iOS
- [ ] Set app bundle ID: `com.studyprep.esthetics` (from app.json)
- [ ] Connect App Store

### 2. Configure Products in App Store Connect

Products to create in App Store Connect:
- [ ] `monthly` - Monthly auto-renewable subscription
- [ ] `three_month` - 3-month auto-renewable subscription  
- [ ] `lifetime` - Non-consumable purchase (lifetime)

### 3. Create Subscription Groups (iOS)

- [ ] Create "Premium" subscription group
- [ ] Add all subscription products to group:
  - monthly
  - three_month
  - (Lifetime is non-renewable, not in group)

### 4. Link Products to RevenueCat

- [ ] In RevenueCat, create "Premium" entitlement
- [ ] Add products to entitlement:
  - monthly → Premium
  - three_month → Premium
  - lifetime → Premium

## Android App Configuration

### 1. Create App in RevenueCat Dashboard

- [ ] Go to "Projects" → "Esthi"
- [ ] Click "Add app" → Android
- [ ] Set package name: `com.anonymous.atestapp` (from app.json)
- [ ] Connect Google Play Console

### 2. Configure Products in Google Play Console

Products to create:
- [ ] `monthly` - Monthly subscription
- [ ] `three_month` - 3-month subscription
- [ ] `lifetime` - One-time purchase

### 3. Create Entitlements in RevenueCat

- [ ] Go to "Entitlements"
- [ ] Create "Esthi Pro" entitlement
- [ ] Add all products:
  - monthly → Esthi Pro
  - three_month → Esthi Pro
  - lifetime → Esthi Pro

## Offerings Configuration

### Create Paywall Offerings

In RevenueCat Dashboard:

1. [ ] Go to "Offerings"
2. [ ] Create offering: "Default"
3. [ ] Add packages in priority order:
   - Lifetime (most attractive)
   - Three Month
   - Monthly

### Configure Each Package

**Lifetime Package:**
- Product: `lifetime`
- Display name: "Lifetime Access"
- Entitlements: Esthi Pro

**Three Month Package:**
- Product: `three_month`
- Display name: "3-Month Premium"
- Entitlements: Esthi Pro

**Monthly Package:**
- Product: `monthly`
- Display name: "Monthly Premium"
- Entitlements: Esthi Pro

## Paywall Setup

### Create RevenueCat Paywall

1. [ ] Go to "Paywalls"
2. [ ] Click "Create paywall"
3. [ ] Select template: "Standard" or custom
4. [ ] Configure design:
   - Title: "Unlock Esthi Pro"
   - Subtitle: "Get unlimited study materials"
   - Features to highlight:
     - Unlimited practice exams
     - Full question bank access
     - Offline materials
     - Ad-free experience
5. [ ] Assign offering: "Default"
6. [ ] Test on preview

### Paywall Features

Add these features to the paywall:
- ✓ Unlimited Practice Exams
- ✓ Full Question Bank
- ✓ Offline Study Materials
- ✓ Ad-Free Experience
- ✓ Custom Study Paths
- ✓ Performance Analytics
- ✓ Premium Support

## Customer Center Setup

### Configure Customer Center

1. [ ] Go to "Tools" → "Customer Center"
2. [ ] Enable Customer Center
3. [ ] Customize appearance:
   - Brand colors (match Esthi theme)
   - Support contact information
   - Support email: support@esthi.com
4. [ ] Test links work correctly

## Testing Configuration

### Sandbox Testing Setup

**iOS:**
- [ ] Create Sandbox Apple ID in App Store Connect
- [ ] Use for testing purchases in development
- [ ] Never use real App Store account

**Android:**
- [ ] Set up test license key in Google Play Console
- [ ] Create test users in Google Play Console
- [ ] Add your Google account as tester

### Test Purchases

1. [ ] Install app on iOS device (registered with Sandbox Apple ID)
2. [ ] Open paywall
3. [ ] Attempt purchase of each product:
   - [ ] Monthly subscription
   - [ ] 3-month subscription
   - [ ] Lifetime purchase
4. [ ] Verify entitlements update immediately
5. [ ] Test restore purchases
6. [ ] Open Customer Center and verify it works

## Webhook Configuration (Optional)

For backend integration:

- [ ] Go to "Project Settings" → "Webhooks"
- [ ] Add webhook endpoint for purchase events:
  - PURCHASE_COMPLETE
  - SUBSCRIPTION_RENEWED
  - SUBSCRIPTION_CANCELLED
  - ENTITLEMENT_GRANTED
  - ENTITLEMENT_REVOKED

Webhook URL format:
```
https://your-backend.com/api/webhooks/revenuecat
```

## Analytics & Monitoring

### Dashboard Metrics

Monitor in RevenueCat Dashboard:
- [ ] Daily Active Users
- [ ] Install Rate
- [ ] Trial Conversion Rate
- [ ] Revenue Breakdown
- [ ] Churn Rate
- [ ] LTV (Lifetime Value)

### Set Up Alerts

- [ ] High churn rate (>5% daily)
- [ ] Payment failures
- [ ] App not sending events

## Production Deployment

### Pre-Launch Checklist

- [ ] Switch to production API key
- [ ] Update app.json bundle IDs
- [ ] Test on physical iOS device
- [ ] Test on physical Android device
- [ ] Verify app store prices are correct
- [ ] Set up tax information
- [ ] Configure compliance settings

### Launch Steps

1. [ ] Submit iOS app to App Store (with Sandbox App Store Connect)
2. [ ] Submit Android app to Google Play Console
3. [ ] Wait for approvals
4. [ ] In RevenueCat, switch from sandbox to production
5. [ ] Monitor for any issues

## Ongoing Maintenance

- [ ] Monitor RevenueCat dashboard daily for first week
- [ ] Check payment success rates
- [ ] Monitor customer feedback
- [ ] Review analytics weekly
- [ ] Update pricing/offerings based on performance

## Support

- RevenueCat Support: support@revenuecat.com
- Documentation: https://www.revenuecat.com/docs
- Community: https://community.revenuecat.com

## Quick Reference

**Test API Key:** `test_shvqxUHedVYHANlkMFhIGVJpKqL`

**Entitlements:**
- `Esthi Pro` - Premium access

**Products:**
- `monthly` - Monthly subscription
- `three_month` - 3-month subscription
- `lifetime` - Lifetime purchase

**Bundle IDs:**
- iOS: `com.studyprep.esthetics`
- Android: `com.anonymous.atestapp`
