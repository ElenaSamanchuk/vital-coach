"use client";

import type { ConcreteDayRecommendation } from "@/lib/personalized-day-recs";
import type { PersonalizedDayPlan } from "@/lib/personalized-day-recs";
import { Utensils, Activity, Sparkles } from "lucide-react";

const DOMAIN_META = {
  nutrition: { label: "Еда", icon: Utensils, color: "var(--accent)" },
  workout: { label: "Движение", icon: Activity, color: "#4A7FD4" },
  leisure: { label: "Досуг", icon: Sparkles, color: "#C45C9A" },
} as const;

function RecBlock({ rec, featured }: { rec: ConcreteDayRecommendation; featured?: boolean }) {
  const meta = DOMAIN_META[rec.domain];
  const Icon = meta.icon;
  return (
    <div
      className={`rounded-xl border p-3 ${
        featured
          ? "border-[var(--accent)] bg-[var(--accent-soft)]"
          : "border-[var(--border)] bg-[var(--elevated)]"
      }`}
    >
      <div className="flex items-start gap-2">
        <Icon size={16} style={{ color: meta.color }} className="shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="vc-text-xs font-semibold" style={{ color: meta.color }}>
              {meta.label}
            </span>
            <span className="vc-text-xs text-[var(--text-tertiary)]">{rec.effort}</span>
          </div>
          <p className="vc-text-sm font-semibold text-[var(--text)] mt-1 leading-snug">{rec.title}</p>
          <p className="vc-text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">{rec.why}</p>
          <p className="vc-text-xs text-[var(--accent)] mt-1.5 font-medium">→ {rec.action}</p>
        </div>
      </div>
    </div>
  );
}

export function TodayPersonalRecsCard({ plan }: { plan: PersonalizedDayPlan }) {
  const { topPick, recommendations } = plan;
  if (!topPick && recommendations.length === 0) return null;

  const rest = recommendations.filter((r) => r.id !== topPick?.id).slice(0, 2);

  return (
    <div className="vc-glass-card rounded-2xl space-y-3">
      <div>
        <p className="vc-text-lg">Рекомендации на сегодня</p>
        <p className="vc-subtitle vc-text-xs mt-0.5">
          По твоим данным и динамике недели · минимум усилий, максимум пользы
        </p>
      </div>
      {topPick && <RecBlock rec={topPick} featured />}
      {rest.length > 0 && (
        <div className="space-y-2">
          {rest.map((r) => (
            <RecBlock key={r.id} rec={r} />
          ))}
        </div>
      )}
      <p className="vc-text-xs text-[var(--text-tertiary)] text-center">
        ★ в подборке ниже — рекомендованные варианты
      </p>
    </div>
  );
}
