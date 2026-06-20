"use client";

import { useState } from "react";
import { Calendar, CalendarDays, CalendarRange, TrendingDown } from "lucide-react";
import type { HorizonPlan, HorizonKind } from "@/lib/horizon-plan";
import { LIFE_SPHERES } from "@/lib/life-spheres";
import { actionImpact } from "@/lib/impact-motivation";
import { ImpactLine } from "./ImpactLine";

const TABS: { id: HorizonKind; label: string; icon: typeof Calendar }[] = [
  { id: "day", label: "День", icon: Calendar },
  { id: "week", label: "Неделя", icon: CalendarDays },
  { id: "month", label: "Месяц", icon: CalendarRange },
];

const DOMAIN_DOT: Record<string, string> = {
  nutrition: "var(--accent)",
  sport: "var(--success)",
  leisure: "var(--purple)",
  health: "var(--warning)",
  work: "var(--brown)",
  life: "var(--text-secondary)",
  care: "var(--purple)",
};

const PLAN_KEY: Record<HorizonKind, keyof Pick<HorizonPlan, "today" | "week" | "month">> = {
  day: "today",
  week: "week",
  month: "month",
};

export function HorizonPlanCard({
  plan,
  compact = false,
}: {
  plan: HorizonPlan;
  compact?: boolean;
}) {
  const [tab, setTab] = useState<HorizonKind>("day");
  const [showSlipping, setShowSlipping] = useState(!compact);
  const items = plan[PLAN_KEY[tab]].slice(0, compact ? 3 : 6);

  return (
    <div className="vc-glass-card rounded-3xl p-4 space-y-3">
      <div>
        <p className="text-[15px] font-bold">План по горизонтам</p>
        <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-snug">{plan.summary}</p>
      </div>

      <div className="flex gap-1 p-1 rounded-xl bg-[var(--bg-subtle)]">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[11px] font-semibold transition-colors ${
              tab === id
                ? "bg-[var(--elevated)] text-[var(--text)] shadow-sm"
                : "text-[var(--text-secondary)]"
            }`}
          >
            <Icon size={12} />
            {label}
          </button>
        ))}
      </div>

      <ul className="space-y-2">
        {items.length === 0 && (
          <li className="text-[12px] text-[var(--text-tertiary)] py-2">Пока нет приоритетов — заполни колесо жизни</li>
        )}
        {items.map((item) => (
          <li
            key={item.id}
            className="rounded-xl border border-[var(--border)] bg-[var(--elevated)] px-3 py-2.5"
          >
            <div className="flex items-start gap-2">
              <span
                className="w-2 h-2 rounded-full shrink-0 mt-1.5"
                style={{ background: DOMAIN_DOT[item.domain] ?? "var(--accent)" }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold leading-tight">{item.title}</p>
                <p className="text-[10px] text-[var(--text-secondary)] mt-0.5 leading-snug">{item.why}</p>
                <ImpactLine text={actionImpact(item.domain, item.title)} />
              </div>
              {item.priority === "high" && (
                <span className="text-[9px] font-bold text-[var(--warning)] shrink-0">!</span>
              )}
            </div>
          </li>
        ))}
      </ul>

      {plan.slippingSpheres.length > 0 && (
        <div className="pt-2 border-t border-[var(--border)]">
          <button
            type="button"
            onClick={() => setShowSlipping((v) => !v)}
            className="flex items-center gap-1.5 mb-2 w-full text-left"
          >
            <TrendingDown size={13} className="text-[var(--warning)]" />
            <span className="text-[11px] font-semibold">
              Проседают · {plan.slippingSpheres.length}
            </span>
            <span className="text-[10px] text-[var(--accent)] ml-auto">
              {showSlipping ? "Свернуть" : "Показать"}
            </span>
          </button>
          {showSlipping && (
          <div className="space-y-2">
            {plan.slippingSpheres.slice(0, compact ? 2 : 3).map((s) => {
              const color =
                LIFE_SPHERES.find((sp) => sp.key === s.key)?.color ?? "var(--text-secondary)";
              return (
                <div
                  key={String(s.key)}
                  className="rounded-xl bg-[var(--bg-subtle)] px-3 py-2 text-[11px]"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span>{s.emoji}</span>
                    <span className="font-semibold" style={{ color }}>
                      {s.label}
                    </span>
                    <span className="text-[var(--text-tertiary)] ml-auto">{s.score}/10</span>
                  </div>
                  <p className="text-[var(--text-secondary)] leading-snug">
                    <span className="text-[var(--text-tertiary)]">Сегодня:</span> {s.todayAction}
                  </p>
                  <p className="text-[var(--text-secondary)] leading-snug mt-0.5">
                    <span className="text-[var(--text-tertiary)]">Неделя:</span> {s.weekAction}
                  </p>
                  <p className="text-[var(--text-secondary)] leading-snug mt-0.5">
                    <span className="text-[var(--text-tertiary)]">Месяц:</span> {s.monthAction}
                  </p>
                </div>
              );
            })}
          </div>
          )}
        </div>
      )}
    </div>
  );
}
