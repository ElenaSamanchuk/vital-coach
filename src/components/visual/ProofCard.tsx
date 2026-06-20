import { cn } from "@/lib/cn";
import type { ResearchFramework } from "@/lib/evidence-library";

const EVIDENCE_LABELS: Record<ResearchFramework["evidence"], string> = {
  meta: "Мета-анализ",
  rct: "РКИ",
  longitudinal: "Лонгитюд",
  expert: "Экспертная модель",
  mixed: "Смешанные данные",
};

export function ProofCard({ framework, compact }: { framework: ResearchFramework; compact?: boolean }) {
  return (
    <div className={cn("vc-glass-card rounded-xl p-3", !compact && "vc-animate-in")}>
      <div className="flex justify-between items-start gap-2">
        <p className="font-semibold text-[13px]">{framework.name}</p>
        <span className="vc-badge vc-badge--accent shrink-0">{EVIDENCE_LABELS[framework.evidence]}</span>
      </div>
      <p className="text-[11px] text-[var(--text-secondary)] mt-1">
        {framework.authors}, {framework.year}
      </p>
      {!compact && (
        <>
          <p className="text-[12px] mt-2">{framework.summary}</p>
          <ul className="mt-2 space-y-1">
            {framework.interventions.slice(0, 2).map((i) => (
              <li key={i} className="text-[11px] flex gap-1.5">
                <span className="text-[var(--success)]">✓</span> {i}
              </li>
            ))}
          </ul>
          {framework.doi && (
            <p className="text-[9px] text-[var(--text-tertiary)] mt-2 font-mono">DOI: {framework.doi}</p>
          )}
        </>
      )}
    </div>
  );
}
