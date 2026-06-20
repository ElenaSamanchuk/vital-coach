"use client";

import { Bell } from "lucide-react";
import {
  DEFAULT_NOTIFICATION_PREFS,
  parseNotificationPrefs,
  requestNotificationPermission,
  type NotificationPrefs,
} from "@/lib/push-reminders";

export function ReminderSettings({
  value,
  onChange,
  onSave,
}: {
  value: string;
  onChange: (json: string) => void;
  onSave: () => void;
}) {
  const prefs = parseNotificationPrefs(value);

  const update = (patch: Partial<NotificationPrefs>) => {
    onChange(JSON.stringify({ ...prefs, ...patch }));
  };

  const enable = async () => {
    const ok = await requestNotificationPermission();
    update({ enabled: ok, askedPermission: true });
    if (ok) onSave();
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
          onChange={(e) => (e.target.checked ? enable() : update({ enabled: false }))}
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
              className="apple-input mt-1"
              value={prefs.morningHour}
              onChange={(e) => update({ morningHour: parseInt(e.target.value, 10) || 9 })}
            />
          </label>
          <label className="text-[11px]">
            Вечер, час
            <input
              type="number"
              min={18}
              max={23}
              className="apple-input mt-1"
              value={prefs.eveningHour}
              onChange={(e) => update({ eveningHour: parseInt(e.target.value, 10) || 21 })}
            />
          </label>
        </div>
      )}
      <button type="button" onClick={onSave} className="apple-btn apple-btn-secondary w-full text-[12px]">
        Сохранить
      </button>
    </div>
  );
}
