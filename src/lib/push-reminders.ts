/** Локальные напоминания — PWA + Notification API */

import { APP_NAME, BASE_PATH } from "./app-config";

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

/** Ключи localStorage для «уже показывали сегодня» */
export const REMINDER_STORAGE_KEYS: Record<ReminderKind, string> = {
  morning: "potok-reminder-morning",
  evening: "potok-reminder-evening",
};

const LEGACY_REMINDER_KEYS: Record<ReminderKind, string> = {
  morning: "vital-reminder-morning",
  evening: "vital-reminder-evening",
};

function reminderAlreadyFired(storageKey: string, kind: ReminderKind): boolean {
  if (typeof localStorage === "undefined") return false;
  const today = new Date().toISOString().slice(0, 10);
  const marker = `${today}-${kind}`;
  if (localStorage.getItem(storageKey) === marker) return true;
  const legacyKey = storageKey.startsWith("potok-")
    ? LEGACY_REMINDER_KEYS[kind]
    : null;
  return legacyKey ? localStorage.getItem(legacyKey) === marker : false;
}

export interface ReminderPayload {
  kind: ReminderKind;
  title: string;
  body: string;
  href?: string;
}

export function eveningDiaryHref(): string {
  const base = BASE_PATH.replace(/\/$/, "");
  return `${base}/log?tab=quick`;
}

export function buildReminder(
  kind: ReminderKind,
  ctx?: {
    tasks?: string[];
    briefing?: string;
    todaySteps?: number;
    diaryDone?: boolean;
  },
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
  const parts: string[] = [];
  if (!ctx?.diaryDone) {
    parts.push("2 минуты в дневнике — настроение, вода, сон");
  } else {
    parts.push("День уже записан — можно отметить шаги или воду");
  }
  if (ctx?.todaySteps == null || ctx.todaySteps === 0) {
    parts.push("не забудь шаги");
  }
  return {
    kind: "evening",
    title: ctx?.diaryDone ? "Добить день" : "Закрыть день",
    body: parts.join(" · "),
    href: eveningDiaryHref(),
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
  return !reminderAlreadyFired(lastFiredKey, kind);
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
    const n = new Notification(payload.title, {
      body: payload.body,
      icon: `${BASE_PATH}/icons/icon-192.png`,
      tag: `potok-${payload.kind}`,
    });
    if (payload.href) {
      n.onclick = () => {
        window.focus();
        window.location.assign(payload.href!);
        n.close();
      };
    }
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem(REMINDER_STORAGE_KEYS[payload.kind], `${today}-${payload.kind}`);
  } catch {
    /* */
  }
}
