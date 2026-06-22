"use client";

import { format } from "date-fns";
import { Droplets } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { hapticLight, hapticSuccess } from "@/lib/haptics";
import {
  cycleStatus,
  mergePeriodStarts,
} from "@/lib/period-tracking";

export function CycleDayCard({
  lastPeriodStart,
  cycleLength,
  periodDays = 5,
  onUpdated,
}: {
  lastPeriodStart: string | null;
  cycleLength: number;
  periodDays?: number;
  onUpdated?: () => void;
}) {
  const status = cycleStatus(lastPeriodStart, cycleLength);
  const today = format(new Date(), "yyyy-MM-dd");
  const startedToday =
    lastPeriodStart?.split("T")[0] === today;

  const markStart = async () => {
    hapticLight();
    const profileRes = await apiClient("/api/profile");
    const profile = await profileRes.json();
    await apiClient("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lastPeriodStart: today,
        cycleLength: profile.cycleLength ?? cycleLength,
        assessmentJson: mergePeriodStarts(profile.assessmentJson, today, periodDays),
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
            Месячные ~{periodDays} дн. · достаточно отметить 1-й день
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => void markStart()}
        className={`w-full py-2.5 rounded-xl text-[13px] font-semibold transition-colors ${
          startedToday
            ? "bg-[var(--pink-soft,#fce4ec)] text-[var(--pink,#D4869C)]"
            : "bg-[var(--bg-subtle)] text-[var(--text)] hover:bg-[var(--accent-soft)]"
        }`}
      >
        {startedToday ? "✓ Месячные начались сегодня" : "Месячные начались сегодня"}
      </button>
    </div>
  );
}
