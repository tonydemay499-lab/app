import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import type { TaskStatus } from "@/src/store";

export const REMINDER_HOUR = 9;
export const notificationsSupported = Platform.OS !== "web";
const CHANNEL_ID = "rappels-entretien";
const DAYS_AHEAD = 14;

if (notificationsSupported) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export type PermissionState = "granted" | "undetermined" | "denied" | "blocked";

export async function getPermissionState(): Promise<PermissionState> {
  if (!notificationsSupported) return "blocked";
  const p = await Notifications.getPermissionsAsync();
  if (p.granted) return "granted";
  if (p.status === "undetermined") return "undetermined";
  return p.canAskAgain ? "denied" : "blocked";
}

export async function requestPermission(): Promise<PermissionState> {
  if (!notificationsSupported) return "blocked";
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: "Rappels d'entretien",
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  const current = await getPermissionState();
  if (current === "granted" || current === "blocked") return current;
  const p = await Notifications.requestPermissionsAsync();
  if (p.granted) return "granted";
  return p.canAskAgain ? "denied" : "blocked";
}

// Re-plans one 9 h notification per upcoming day, listing the tasks due that day.
export async function syncReminders(tasks: TaskStatus[], enabled: boolean) {
  if (!notificationsSupported) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!enabled || (await getPermissionState()) !== "granted") return;

  const now = new Date();
  for (let d = 0; d < DAYS_AHEAD; d++) {
    const when = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d, REMINDER_HOUR, 0, 0);
    if (when <= now) continue;
    const due = tasks.filter((t) => t.dueIn <= d);
    if (!due.length) continue;
    const names = due.slice(0, 2).map((t) => t.title);
    const more = due.length > 2 ? ` (+${due.length - 2})` : "";
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Entretien de votre matériel",
        body: `Aujourd'hui : ${names.join(", ")}${more}`,
        data: { url: "/entretien" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: when,
        ...(Platform.OS === "android" ? { channelId: CHANNEL_ID } : {}),
      },
    });
  }
}
