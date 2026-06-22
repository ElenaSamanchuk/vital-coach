"use client";

import { Bell } from "lucide-react";
import {
  parseNotificationPrefs,
  requestNotificationPermission,
  type NotificationPrefs,
} from "@/lib/push-reminders";

export function ReminderSettings({
  value,
  onChange,
  onPersist,
}: {
  value: string;
  onChange: (json: string) => void;
  /** Сохранить в профиль сразу (важно для APK/PWA) */
  onPersist: (json: string) => void | Promise<void>;
}) {
  const prefs = parseNotificationPrefs(value);

  const commit = (patch: Partial<NotificationPrefs>) => {
    const json = JSON.stringify({ ...prefs, ...patch });
    onChange(json);
    void onPersist(json);
  };

  const enable = async () => {
    const ok = await requestNotificationPermission();
    commit({ enabled: ok, askedPermission: true });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Bell size={14} className="text-[var(--accent)]" />
        <span className="text-[12px] font-semibold">Напоминания</span>
      </div>
      <p className="text-[11px] text-[var(--text-secondary)]">
        Утро: briefing + 3 дела · Вечер: ритуал (когда приложение открыто или PWA)
      </p>
      <label className="flex items-center gap-2 text-[13px]">
        <input
          type="checkbox"
          checked={prefs.enabled}
          onChange={(e) => (e.target.checked ? enable() : commit({ enabled: false }))}
          className="accent-[var(--accent)]"
        />
        Включить уведомления
      </label>
      {prefs.enabled && (
        <div className="grid grid-cols-2 gap-2">
          <label className="text-[11px]">
            Утро, час
            <input
              type="number"
              min={6}
              max={11}
              className="apple-input apple-input--compact mt-1"
              value={prefs.morningHour}
              onChange={(e) => {
                const h = parseInt(e.target.value, 10);
                if (!Number.isNaN(h)) commit({ morningHour: h });
              }}
            />
          </label>
          <label className="text-[11px]">
            Вечер, час
            <input
              type="number"
              min={18}
              max={23}
              className="apple-input apple-input--compact mt-1"
              value={prefs.eveningHour}
              onChange={(e) => {
                const h = parseInt(e.target.value, 10);
                if (!Number.isNaN(h)) commit({ eveningHour: h });
              }}
            />
          </label>
        </div>
      )}
    </div>
  );
}
