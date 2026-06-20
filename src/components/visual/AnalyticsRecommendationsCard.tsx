"use client";

import Link from "next/link";
import {
  buildAnalyticsRecommendations,
  REC_CATEGORY_META,
  type AnalyticsRecommendation,
  type RecCategory,
} from "@/lib/analytics-recommendations";
import type { WeeklyInsights } from "@/lib/types";

function RecRow({ rec }: { rec: AnalyticsRecommendation }) {
  const meta = REC_CATEGORY_META[rec.category];
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--elevated)] p-3">
      <div className="flex items-start gap-2">
        <span className="text-base shrink-0" aria-hidden>
          {rec.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="vc-text-xs font-semibold px-1.5 py-0.5 rounded-md"
              style={{ background: `${meta.color}18`, color: meta.color }}
            >
              {rec.categoryLabel}
            </span>
            {rec.priority === "high" && (
              <span className="vc-text-xs font-semibold text-[var(--warning)]">важно</span>
            )}
          </div>
          <p className="vc-text-sm font-semibold text-[var(--text)] mt-1 leading-snug">{rec.title}</p>
          <p className="vc-text-xs text-[var(--text-secondary)] mt-0.5 leading-snug">{rec.detail}</p>
          <p className="vc-text-xs text-[var(--accent)] mt-1.5 leading-snug">→ {rec.action}</p>
        </div>
      </div>
    </div>
  );
}

export function AnalyticsRecommendationsCard({
  insights,
  logs,
  waterTargetMl,
  sleepTargetMin,
  proteinTargetG,
  compact,
  limit = 6,
}: {
  insights: WeeklyInsights | null;
  logs: {
    mealChoices?: string | null;
    leisureJson?: string | null;
    workoutChoice?: string | null;
    mood?: number | null;
    weightKg?: number | null;
    steps?: number | null;
    waterMl?: number | null;
    sleepMinutes?: number | null;
    postMealWalks?: number | null;
  }[];
  waterTargetMl?: number;
  sleepTargetMin?: number;
  proteinTargetG?: number;
  compact?: boolean;
  limit?: number;
}) {
  const recs = buildAnalyticsRecommendations(insights, logs, {
    waterTargetMl,
    sleepTargetMin,
    proteinTargetG,
  }).slice(0, limit);

  if (recs.length === 0) return null;

  if (compact) {
    return (
      <div className="space-y-2">
        {recs.slice(0, 3).map((r) => (
          <RecRow key={`${r.category}-${r.id}`} rec={r} />
        ))}
        <Link href="/path" className="vc-text-xs text-[var(--accent)] inline-block mt-1">
          Все рекомендации →
        </Link>
      </div>
    );
  }

  const byCategory = recs.reduce(
    (acc, r) => {
      const bucket = acc[r.category] ?? [];
      bucket.push(r);
      acc[r.category] = bucket;
      return acc;
    },
    {} as Partial<Record<RecCategory, AnalyticsRecommendation[]>>,
  );

  const categories = (Object.keys(byCategory) as RecCategory[]).filter((c) => byCategory[c]?.length);

  return (
    <div className="space-y-3">
      {categories.map((cat) => (
        <div key={cat}>
          {!compact && categories.length > 1 && (
            <p className="vc-overline mb-1.5">{REC_CATEGORY_META[cat].label}</p>
          )}
          <div className="space-y-2">
            {byCategory[cat]!.map((r) => (
              <RecRow key={`${r.category}-${r.id}`} rec={r} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
