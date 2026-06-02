import { Stack } from "expo-router";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
// @ts-ignore
import { initPremDB, getPremQuestions } from "@/src/premDB";
import * as Notifications from "expo-notifications";
import { initializeRevenueCat } from "@/src/revenuecat/config";

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
    // Initialize RevenueCat SDK
    initializeRevenueCat()
      .then(() => console.log("[RevenueCat] Initialized successfully"))
      .catch((error) => console.error("[RevenueCat] Failed to initialize:", error));

    // Initialize premium database
    initPremDB()
      .then(() => console.log("premDB ready:", getPremQuestions().length, "questions"))
      .catch(console.error);
    }, []);

  return (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <Stack screenOptions={{ headerShown: false }}/>
  </GestureHandlerRootView>
  )
}
