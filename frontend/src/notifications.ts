import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import type { TaskStatus, Settings } from "@/src/store";

export const formatTime = (min: number) => `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, "0")}`;
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
export async function syncReminders(tasks: TaskStatus[], enabled: boolean, surveyDueIn: number, settings: Settings) {
  if (!notificationsSupported) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!enabled || (await getPermissionState()) !== "granted") return;

  const now = new Date();
  const h = Math.floor(settings.time / 60);
  const m = settings.time % 60;
  for (let d = 0; settings.entretien && d < DAYS_AHEAD; d++) {
    const when = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d, h, m, 0);
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

  // Weekly questionnaire: remind 1 minute after the chosen time on the due day, then each week after.
  for (let k = 0; settings.questionnaire && k < 3; k++) {
    const d = Math.max(0, surveyDueIn) + k * 7;
    const when = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d, h, m + 1, 0);
    if (when <= now) continue;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Votre questionnaire de la semaine",
        body: "2 minutes pour dire comment vous vous sentez avec votre traitement.",
        data: { url: "/questionnaire" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: when,
        ...(Platform.OS === "android" ? { channelId: CHANNEL_ID } : {}),
      },
    });
  }
}
