"use client";

import { apiClient } from "@/lib/api-client";
import { useState } from "react";
import { format } from "date-fns";
import { Sun } from "lucide-react";
import { hapticLight, hapticSuccess } from "@/lib/haptics";

const PRESETS = [
  { id: "tired", label: "Устала", energy: 4, mood: 5, stress: 6 },
  { id: "ok", label: "Норм", energy: 7, mood: 7, stress: 5 },
  { id: "good", label: "Бодро", energy: 8, mood: 8, stress: 4 },
] as const;

export function MorningCheckIn({ onSaved }: { onSaved: () => void }) {
  const [saving, setSaving] = useState(false);

  const save = async (preset: (typeof PRESETS)[number]) => {
    if (saving) return;
    setSaving(true);
    hapticLight();
    await apiClient("/api/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: format(new Date(), "yyyy-MM-dd"),
        energy: preset.energy,
        mood: preset.mood,
        stress: preset.stress,
      }),
    });
    hapticSuccess();
    setSaving(false);
    onSaved();
  };

  return (
    <div className="rounded-2xl border border-[var(--accent)]/25 bg-[var(--accent-soft)] p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sun size={16} className="text-[var(--accent)]" />
        <p className="text-[13px] font-semibold">Как утро?</p>
        <span className="text-[10px] text-[var(--text-secondary)] ml-auto">30 сек</span>
      </div>
      <div className="flex gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            disabled={saving}
            onClick={() => save(p)}
            className="flex-1 rounded-xl bg-[var(--elevated)] py-2.5 text-[13px] font-medium text-[var(--text)] hover:bg-[var(--bg-subtle)] transition-colors disabled:opacity-60"
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
