import { Stack } from "expo-router";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
// @ts-ignore
import { initPremDB, getPremQuestions } from "@/src/premDB";
import * as Notifications from "expo-notifications";

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
