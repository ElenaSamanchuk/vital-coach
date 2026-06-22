"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { ReminderBoot } from "./ReminderBoot";
import type { DayTask } from "@/lib/day-tasks";

export function ReminderBootContainer() {
  const [ctx, setCtx] = useState<{
    prefsJson: string;
    taskLabels: string[];
    briefing?: string;
    todaySteps?: number;
    diaryDone?: boolean;
  } | null>(null);

  useEffect(() => {
    Promise.all([apiClient("/api/profile"), apiClient("/api/coach")]).then(async ([p, c]) => {
      const profile = p.ok ? await p.json() : {};
      const coach = c.ok ? await c.json() : {};
      const dayTasks = (coach.plan?.dayTasks ?? []) as DayTask[];
      const taskLabels = dayTasks.filter((t) => !t.done).map((t) => t.label);
      const log = coach.todayLog;
      setCtx({
        prefsJson: profile.notificationPrefsJson ?? "{}",
        taskLabels,
        briefing: coach.plan?.healthBriefing?.[0]?.title,
        todaySteps: log?.steps ?? undefined,
        diaryDone: Boolean(log?.weightKg != null || log?.mood != null),
      });
    });
  }, []);

  if (!ctx) return null;

  return (
    <ReminderBoot
      prefsJson={ctx.prefsJson}
      taskLabels={ctx.taskLabels}
      briefing={ctx.briefing}
      todaySteps={ctx.todaySteps}
      diaryDone={ctx.diaryDone}
    />
  );
}
