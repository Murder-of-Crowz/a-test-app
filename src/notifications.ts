import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

async function ensureChannel() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.MAX,
    });
  }  
}

export async function requestPermission(): Promise<boolean> {
  await ensureChannel();
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function getPermissionStatus() {
  const { status } = await Notifications.getPermissionsAsync();
  return status;  
}

export async function scheduleReminder(hour: number, minute: number): Promise<void> {
  await ensureChannel();
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Time to Study!",
      body: "Don't slack off now, you got this!",
      sound: true,
      ...(Platform.OS === "android" && { channelId: "default" }),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function sendTestNotif(): Promise<void> {
  await ensureChannel();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Test",
      body: "Text is good!",
      sound: true,
      ...(Platform.OS === "android" && { channelId: "default" })
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 1,
    },
  });
}

export async function cancelReminder(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function hasScheduledReminder(): Promise<boolean> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  return scheduled.length > 0;
}