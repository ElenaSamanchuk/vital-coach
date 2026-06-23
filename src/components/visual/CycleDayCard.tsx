"use client";

import { format, isSameDay, startOfDay } from "date-fns";
import { ru } from "date-fns/locale";
import { Droplets } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { CYCLE_COPY, potokCycleLabel } from "@/lib/app-config";
import { hapticLight, hapticSuccess } from "@/lib/haptics";
import {
  cycleStatus,
  deriveLastPeriodStart,
  isMenstrualDay,
  parsePeriodMeta,
  toggleMenstrualDay,
} from "@/lib/period-tracking";

export function CycleDayCard({
  viewDate,
  cycleLength,
  assessmentJson,
  onUpdated,
}: {
  viewDate: Date;
  cycleLength: number;
  assessmentJson?: string | null;
  onUpdated?: () => void;
}) {
  const markDate = format(viewDate, "yyyy-MM-dd");
  const meta = parsePeriodMeta(assessmentJson);
  const isMarked = isMenstrualDay(viewDate, meta.menstrualDays);
  const lastStart = deriveLastPeriodStart(meta.menstrualDays);
  const status = cycleStatus(lastStart, cycleLength, viewDate);
  const isToday = isSameDay(viewDate, startOfDay(new Date()));
  const dayLabel = isToday ? "сегодня" : format(viewDate, "d MMMM", { locale: ru });
  const statusLabel = isMarked
    ? potokCycleLabel(status.day, "menstrual")
    : potokCycleLabel(status.day, status.phase ?? undefined);

  const toggle = async () => {
    hapticLight();
    const profileRes = await apiClient("/api/profile");
    const profile = await profileRes.json();
    const newAssessmentJson = toggleMenstrualDay(profile.assessmentJson, markDate);
    const newMeta = parsePeriodMeta(newAssessmentJson);
    const newLastStart = deriveLastPeriodStart(newMeta.menstrualDays);

    await apiClient("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lastPeriodStart: newLastStart,
        cycleLength: profile.cycleLength ?? cycleLength,
        assessmentJson: newAssessmentJson,
      }),
    });
    hapticSuccess();
    onUpdated?.();
  };

  return (
    <div className="vc-glass-card rounded-2xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="vc-text-sm font-semibold flex items-center gap-1.5">
            <Droplets size={16} className="text-[var(--pink,#D4869C)]" /> {CYCLE_COPY.cardTitle}
          </p>
          <p className="vc-text-xs text-[var(--text-secondary)] mt-1">{statusLabel}</p>
          <p className="vc-text-xs text-[var(--text-tertiary)] mt-0.5">{CYCLE_COPY.markHint}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => void toggle()}
        className={`w-full py-2.5 rounded-xl text-[13px] font-semibold transition-colors ${
          isMarked
            ? "bg-[var(--pink-soft,#fce4ec)] text-[var(--pink,#D4869C)]"
            : "bg-[var(--bg-subtle)] text-[var(--text)] hover:bg-[var(--accent-soft)]"
        }`}
      >
        {isMarked
          ? `✓ ${CYCLE_COPY.markButton} · ${dayLabel}`
          : `${CYCLE_COPY.markButton} · ${dayLabel}`}
      </button>
    </div>
  );
}
