"use client";

import type { HolisticInsight, HolisticLifePlan } from "@/lib/life-synthesis";

const PRIORITY_STYLES = {
  high: "border-l-[#ff3b30] bg-[#fff5f5]",
  medium: "border-l-[#ff9500] bg-[#fffbf0]",
  low: "border-l-[#34c759] bg-[#f0fdf4]",
};

export function HolisticInsights({ plan }: { plan: HolisticLifePlan }) {
  return (
    <div className="space-y-3">
      <p className="text-[13px] font-medium text-[#0071e3] p-3 bg-[#e8f2ff] rounded-xl">
        {plan.weeklyTheme}
      </p>

      {(plan.burnoutRisk || plan.wellbeingAlert) && (
        <div className="p-3 bg-[#fff5f5] rounded-xl text-[12px] text-[#ff3b30]">
          {plan.burnoutRisk && <p>⚠️ Сигнал выгорания — восстановление в приоритете</p>}
          {plan.wellbeingAlert && <p>⚠️ WHO-5 низкий — не ужесточай план, добавь связи и сон</p>}
        </div>
      )}

      {plan.dailyMicroHabits.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold uppercase text-[#86868b] mb-2">Микрошаги на сегодня</p>
          <ul className="space-y-1">
            {plan.dailyMicroHabits.map((h) => (
              <li key={h} className="text-[13px] flex gap-2">
                <span className="text-[#34c759]">✓</span> {h}
              </li>
            ))}
          </ul>
        </div>
      )}

      {plan.insights.slice(0, 5).map((ins: HolisticInsight) => (
        <div
          key={ins.id}
          className={`border-l-4 rounded-r-xl p-3 ${PRIORITY_STYLES[ins.priority]}`}
        >
          <p className="text-[11px] text-[#86868b]">{ins.category}</p>
          <p className="text-[14px] font-semibold">{ins.title}</p>
          <p className="text-[12px] mt-1">{ins.message}</p>
          <p className="text-[12px] text-[#0071e3] mt-2">→ {ins.action}</p>
          <p className="text-[10px] text-[#86868b] mt-1 italic">{ins.research}</p>
        </div>
      ))}

      {plan.synergies.length > 0 && (
        <details>
          <summary className="text-[12px] text-[#86868b] cursor-pointer">Связи между сферами</summary>
          <ul className="mt-2 space-y-1">
            {plan.synergies.map((s) => (
              <li key={s} className="text-[12px] text-[#5856d6]">↔ {s}</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
