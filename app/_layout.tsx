import { Stack } from "expo-router";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as Notifications from "expo-notifications";
import Purchases, { CustomerInfo } from "react-native-purchases";
import { initializeRevenueCat } from "@/src/revenuecat/config";
import { useSubscriptionStore } from "@/src/stores/subscriptionStore";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  useEffect(() => {
    const handleCustomerInfoUpdate = (customerInfo: CustomerInfo) => {
      useSubscriptionStore.getState().updateCustomerInfo(customerInfo);
    };

    // Initialize RevenueCat SDK
    initializeRevenueCat()
      .then(async () => {
        Purchases.addCustomerInfoUpdateListener(handleCustomerInfoUpdate);
        await useSubscriptionStore.getState().fetchCustomerInfo();
        if (__DEV__) {
          console.log("[RevenueCat] Initialized successfully");
        }
      })
      .catch((error) => console.error("[RevenueCat] Failed to initialize:", error));

    return () => {
      Purchases.removeCustomerInfoUpdateListener(handleCustomerInfoUpdate);
    };
  }, []);

  return (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <Stack screenOptions={{ headerShown: false }}/>
  </GestureHandlerRootView>
  )
}
