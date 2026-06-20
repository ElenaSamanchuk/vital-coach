"use client";

import type { ConditionCard } from "@/lib/health-matrix";

export function ConditionMatrix({ conditions }: { conditions: ConditionCard[] }) {
  const active = conditions.filter((c) => c.active);
  const inactive = conditions.filter((c) => !c.active);

  return (
    <div className="space-y-3">
      {active.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b]">
            Активные — коуч учитывает
          </p>
          {active.map((c) => (
            <ConditionRow key={c.key} card={c} />
          ))}
        </div>
      )}
      {inactive.length > 0 && (
        <details className="group">
          <summary className="text-[11px] font-semibold uppercase tracking-wider text-[#c7c7cc] cursor-pointer">
            Не отмечено ({inactive.length})
          </summary>
          <div className="mt-2 space-y-2 opacity-60">
            {inactive.map((c) => (
              <ConditionRow key={c.key} card={c} dimmed />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function ConditionRow({ card, dimmed }: { card: ConditionCard; dimmed?: boolean }) {
  return (
    <div
      className={`rounded-2xl overflow-hidden border ${dimmed ? "border-[#e8e8ed]" : "border-transparent"}`}
      style={{ boxShadow: dimmed ? "none" : `0 2px 12px ${card.color}25` }}
    >
      <div
        className="px-3 py-2 flex items-center gap-2"
        style={{ backgroundColor: dimmed ? "#fbfbfd" : `${card.color}18` }}
      >
        <span className="text-lg">{card.emoji}</span>
        <span className="font-semibold text-[14px]" style={{ color: dimmed ? "#86868b" : card.color }}>
          {card.label}
        </span>
      </div>
      {!dimmed && (
        <div className="px-3 py-2 bg-white text-[12px] space-y-2">
          <Row label="Вес" text={card.impact} />
          <Row label="Еда" text={card.nutrition} icon="🥗" />
          <Row label="Движение" text={card.movement} icon="🏃" />
          <Row label="Анализы" text={card.labs} icon="🔬" />
        </div>
      )}
    </div>
  );
}

function Row({ label, text, icon }: { label: string; text: string; icon?: string }) {
  return (
    <div className="grid grid-cols-[52px_1fr] gap-1">
      <span className="text-[#86868b] font-medium">
        {icon ?? ""} {label}
      </span>
      <span>{text}</span>
    </div>
  );
}
