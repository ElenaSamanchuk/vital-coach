/** Локальные напоминания — PWA + Notification API */

import { APP_NAME } from "./app-config";

export interface NotificationPrefs {
  enabled: boolean;
  morningHour: number;
  eveningHour: number;
  askedPermission?: boolean;
}

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  enabled: false,
  morningHour: 9,
  eveningHour: 21,
};

export function parseNotificationPrefs(raw: string | null | undefined): NotificationPrefs {
  if (!raw || raw === "{}") return { ...DEFAULT_NOTIFICATION_PREFS };
  try {
    return { ...DEFAULT_NOTIFICATION_PREFS, ...(JSON.parse(raw) as NotificationPrefs) };
  } catch {
    return { ...DEFAULT_NOTIFICATION_PREFS };
  }
}

export type ReminderKind = "morning" | "evening";

export interface ReminderPayload {
  kind: ReminderKind;
  title: string;
  body: string;
}

export function buildReminder(
  kind: ReminderKind,
  ctx?: { tasks?: string[]; briefing?: string },
): ReminderPayload {
  if (kind === "morning") {
    const tasks = ctx?.tasks?.slice(0, 3).join(" · ") || "Открой дневник";
    return {
      kind,
      title: `Доброе утро — ${APP_NAME}`,
      body: ctx?.briefing
        ? `${ctx.briefing} · Дела: ${tasks}`
        : `Сегодня: ${tasks}`,
    };
  }
  return {
    kind: "evening",
    title: "Вечерний ритуал",
    body: "Маска → тёплый напиток → сон. Закрой день за 2 минуты в дневнике",
  };
}

export function shouldFireReminder(
  prefs: NotificationPrefs,
  kind: ReminderKind,
  lastFiredKey: string,
): boolean {
  if (!prefs.enabled) return false;
  const hour = new Date().getHours();
  const target = kind === "morning" ? prefs.morningHour : prefs.eveningHour;
  if (hour !== target) return false;
  const today = new Date().toISOString().slice(0, 10);
  if (typeof localStorage !== "undefined") {
    const last = localStorage.getItem(lastFiredKey);
    if (last === `${today}-${kind}`) return false;
  }
  return true;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const r = await Notification.requestPermission();
  return r === "granted";
}

export function fireNotification(payload: ReminderPayload) {
  if (typeof window === "undefined" || Notification.permission !== "granted") return;
  try {
    new Notification(payload.title, {
      body: payload.body,
      icon: "/icons/icon-192.png",
      tag: `vital-${payload.kind}`,
    });
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem(`vital-reminder-${payload.kind}`, `${today}-${payload.kind}`);
  } catch {
    /* */
  }
}
