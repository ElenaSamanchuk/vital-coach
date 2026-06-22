"use client";

import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Droplets } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { hapticLight, hapticSuccess } from "@/lib/haptics";
import {
  cycleStatus,
  mergePeriodStarts,
  parsePeriodMeta,
} from "@/lib/period-tracking";

export function CycleDayCard({
  viewDate,
  lastPeriodStart,
  cycleLength,
  periodDays = 5,
  assessmentJson,
  onUpdated,
}: {
  viewDate: Date;
  lastPeriodStart: string | null;
  cycleLength: number;
  periodDays?: number;
  assessmentJson?: string | null;
  onUpdated?: () => void;
}) {
  const markDate = format(viewDate, "yyyy-MM-dd");
  const periodStarts = parsePeriodMeta(assessmentJson).periodStarts;
  const startedOnDay =
    periodStarts.includes(markDate) || lastPeriodStart?.split("T")[0] === markDate;

  const status = cycleStatus(lastPeriodStart, cycleLength, viewDate);
  const dayLabel = format(viewDate, "d MMMM", { locale: ru });

  const markStart = async () => {
    hapticLight();
    const profileRes = await apiClient("/api/profile");
    const profile = await profileRes.json();
    const newAssessmentJson = mergePeriodStarts(
      profile.assessmentJson,
      markDate,
      periodDays,
    );
    const meta = parsePeriodMeta(newAssessmentJson);
    const newestStart = meta.periodStarts[0] ?? markDate;

    await apiClient("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lastPeriodStart: newestStart,
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
            <Droplets size={16} className="text-[var(--pink,#D4869C)]" /> Цикл
          </p>
          <p className="vc-text-xs text-[var(--text-secondary)] mt-1">{status.label}</p>
          <p className="vc-text-xs text-[var(--text-tertiary)] mt-0.5">
            Месячные ~{periodDays} дн. · отметь 1-й день
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => void markStart()}
        className={`w-full py-2.5 rounded-xl text-[13px] font-semibold transition-colors ${
          startedOnDay
            ? "bg-[var(--pink-soft,#fce4ec)] text-[var(--pink,#D4869C)]"
            : "bg-[var(--bg-subtle)] text-[var(--text)] hover:bg-[var(--accent-soft)]"
        }`}
      >
        {startedOnDay
          ? `✓ Месячные начались ${dayLabel}`
          : `Месячные начались ${dayLabel}`}
      </button>
    </div>
  );
}
