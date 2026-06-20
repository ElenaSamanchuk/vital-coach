"use client";

import { AlertCircle, Bell, Info } from "lucide-react";
import type { HealthBrief } from "@/lib/health-briefing";

const LEVEL_STYLE = {
  action: {
    icon: AlertCircle,
    border: "border-[var(--pink)]/40",
    bg: "bg-[var(--pink-soft)]",
    badge: "text-[var(--pink)]",
  },
  attention: {
    icon: Bell,
    border: "border-[var(--brown)]/40",
    bg: "bg-[var(--brown-soft)]",
    badge: "text-[var(--brown)]",
  },
  info: {
    icon: Info,
    border: "border-[var(--accent)]/30",
    bg: "bg-[var(--accent-soft)]",
    badge: "text-[var(--accent)]",
  },
};

export function HealthBriefingCard({ briefs }: { briefs: HealthBrief[] }) {
  if (briefs.length === 0) return null;

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--elevated)] p-4 space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <Bell size={16} className="text-[var(--accent)]" />
        <span className="text-[13px] font-semibold">Состояние и почему так</span>
        <span className="ml-auto text-[10px] text-[var(--text-tertiary)]">{briefs.length}</span>
      </div>
      {briefs.map((b) => {
        const s = LEVEL_STYLE[b.level];
        const Icon = s.icon;
        return (
          <div
            key={b.id}
            className={`rounded-xl border p-3 ${s.border} ${s.bg}`}
          >
            <div className="flex items-start gap-2">
              <Icon size={14} className={`shrink-0 mt-0.5 ${s.badge}`} />
              <div className="min-w-0">
                <p className="text-[12px] font-semibold">{b.title}</p>
                <p className="text-[11px] text-[var(--text)] mt-0.5 leading-snug">{b.body}</p>
                <p className="text-[10px] text-[var(--text-secondary)] mt-1.5 leading-snug">
                  <span className="font-medium">Почему: </span>
                  {b.why}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
