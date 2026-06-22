"use client";

import { useEffect } from "react";
import {
  buildReminder,
  fireNotification,
  parseNotificationPrefs,
  REMINDER_STORAGE_KEYS,
  shouldFireReminder,
} from "@/lib/push-reminders";

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

    if (shouldFireReminder(prefs, "morning", REMINDER_STORAGE_KEYS.morning)) {
      fireNotification(buildReminder("morning", { tasks: taskLabels, briefing }));
    }
    if (shouldFireReminder(prefs, "evening", REMINDER_STORAGE_KEYS.evening)) {
      fireNotification(buildReminder("evening", eveningCtx));
    }
  }, [prefsJson, taskLabels, briefing, todaySteps, diaryDone]);

  return null;
}
