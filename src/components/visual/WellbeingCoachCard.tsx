"use client";

import { Check, Heart } from "lucide-react";
import type { WellbeingPlan } from "@/lib/wellbeing-coach";
import { EvidenceWhy } from "../ui/EvidenceWhy";
import { hapticLight, hapticSuccess } from "@/lib/haptics";

export function WellbeingCoachCard({
  plan,
  onToggleAction,
}: {
  plan: WellbeingPlan;
  onToggleAction: (actionId: string) => Promise<void>;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--elevated)] p-4 space-y-3">
      <div className="flex items-start gap-2">
        <Heart size={18} className="text-[var(--accent)] shrink-0 mt-0.5" />
        <div>
          <p className="text-[14px] font-semibold">{plan.headline}</p>
          <p className="text-[12px] text-[var(--text-secondary)] mt-0.5 leading-snug">{plan.summary}</p>
        </div>
        <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] shrink-0">
          {plan.focusLabelRu}
        </span>
      </div>

      <div className="space-y-2">
        {plan.actions.map((action) => {
          const done = plan.actionsDone.includes(action.id);
          return (
            <button
              key={action.id}
              type="button"
              onClick={async () => {
                hapticLight();
                await onToggleAction(action.id);
                if (!done) hapticSuccess();
              }}
              className={`w-full flex items-start gap-3 rounded-xl p-3 text-left border transition-colors ${
                done
                  ? "border-[var(--success)] bg-[var(--success-soft)]"
                  : "border-[var(--border)] bg-[var(--bg-subtle)] hover:border-[var(--accent)]"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  done ? "bg-[var(--success)] text-white" : "border border-[var(--border)]"
                }`}
              >
                {done && <Check size={12} />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium">{action.title}</p>
                <p className="text-[11px] text-[var(--text-secondary)]">{action.subtitle}</p>
                <p className="text-[10px] text-[var(--text-tertiary)] mt-1">{action.why}</p>
              </div>
            </button>
          );
        })}
      </div>

      {!plan.moodLogged && (
        <p className="text-[11px] text-[var(--warning)]">
          Запиши настроение в дневнике — коуч точнее подстроит завтрашний план.
        </p>
      )}

      <EvidenceWhy block={plan.evidence} compact />
    </div>
  );
}
