import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const REMINDER_DAYS_TO_SCHEDULE = 30;
const REMINDER_NOTIFICATION_PREFIX = "daily-reminder";

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

function getNextReminderOccurrence(hour: number, minute: number): Date {
  const now = new Date();
  const reminder = new Date(now);
  reminder.setHours(hour, minute, 0, 0);

  if (reminder.getTime() <= now.getTime()) {
    reminder.setDate(reminder.getDate() + 1);
  }

  return reminder;
}

function getReminderContent() {
  return {
    title: "Time to Study!",
    body: "Don't slack off now, you got this!",
    sound: true,
  };
}

export async function scheduleReminder(hour: number, minute: number): Promise<string[]> {
  await ensureChannel();
  await cancelReminder();

  const firstReminder = getNextReminderOccurrence(hour, minute);
  const scheduledIds: string[] = [];

  for (let dayOffset = 0; dayOffset < REMINDER_DAYS_TO_SCHEDULE; dayOffset += 1) {
    const reminderDate = new Date(firstReminder);
    reminderDate.setDate(firstReminder.getDate() + dayOffset);

    const id = await Notifications.scheduleNotificationAsync({
      identifier: `${REMINDER_NOTIFICATION_PREFIX}-${dayOffset}`,
      content: getReminderContent(),
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminderDate,
        ...(Platform.OS === "android" && { channelId: "default" }),
      },
    });
    scheduledIds.push(id);
  }

  return scheduledIds;
}

export async function getNextReminderDate(hour: number, minute: number): Promise<Date | null> {
  return getNextReminderOccurrence(hour, minute);
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
      seconds: 5,
    },
  });
}

export async function cancelReminder(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((notification) =>
        notification.identifier.startsWith(REMINDER_NOTIFICATION_PREFIX),
      )
      .map((notification) =>
        Notifications.cancelScheduledNotificationAsync(notification.identifier),
      ),
  );
}

export async function hasScheduledReminder(): Promise<boolean> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  return scheduled.some((notification) =>
    notification.identifier.startsWith(REMINDER_NOTIFICATION_PREFIX),
  );
}
