"use client";

import { useEffect } from "react";
import {
  buildReminder,
  fireNotification,
  parseNotificationPrefs,
  shouldFireReminder,
} from "@/lib/push-reminders";

export function ReminderBoot({
  prefsJson,
  taskLabels,
  briefing,
}: {
  prefsJson?: string | null;
  taskLabels?: string[];
  briefing?: string;
}) {
  useEffect(() => {
    const prefs = parseNotificationPrefs(prefsJson);
    if (!prefs.enabled) return;

    if (shouldFireReminder(prefs, "morning", "vital-reminder-morning")) {
      fireNotification(buildReminder("morning", { tasks: taskLabels, briefing }));
    }
    if (shouldFireReminder(prefs, "evening", "vital-reminder-evening")) {
      fireNotification(buildReminder("evening"));
    }
  }, [prefsJson, taskLabels, briefing]);

  return null;
}
