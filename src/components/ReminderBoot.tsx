"use client";

import { useEffect } from "react";
import {
  buildReminder,
  fireNotification,
  parseNotificationPrefs,
  REMINDER_STORAGE_KEYS,
  shouldFireReminder,
} from "@/lib/push-reminders";

const CHECK_MS = 60_000;

export function ReminderBoot({
  prefsJson,
  taskLabels,
  briefing,
  todaySteps,
  diaryDone,
}: {
  prefsJson?: string | null;
  taskLabels?: string[];
  briefing?: string;
  todaySteps?: number;
  diaryDone?: boolean;
}) {
  useEffect(() => {
    const prefs = parseNotificationPrefs(prefsJson);
    if (!prefs.enabled) return;

    const eveningCtx = { todaySteps, diaryDone };

    const tick = () => {
      const p = parseNotificationPrefs(prefsJson);
      if (!p.enabled) return;
      if (shouldFireReminder(p, "morning", REMINDER_STORAGE_KEYS.morning)) {
        fireNotification(buildReminder("morning", { tasks: taskLabels, briefing }));
      }
      if (shouldFireReminder(p, "evening", REMINDER_STORAGE_KEYS.evening)) {
        fireNotification(buildReminder("evening", eveningCtx));
      }
    };

    tick();
    const id = window.setInterval(tick, CHECK_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [prefsJson, taskLabels, briefing, todaySteps, diaryDone]);

  return null;
}
