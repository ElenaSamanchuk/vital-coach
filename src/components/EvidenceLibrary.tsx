"use client";

import { RESEARCH_FRAMEWORKS } from "@/lib/evidence-library";
import type { ResearchFramework } from "@/lib/evidence-library";

const EVIDENCE_LABELS: Record<ResearchFramework["evidence"], string> = {
  meta: "Мета-анализ",
  rct: "РКИ",
  longitudinal: "Лонгитюд",
  expert: "Экспертная модель",
  mixed: "Смешанные данные",
};

export function EvidenceLibrary({ highlightIds }: { highlightIds?: string[] }) {
  const sorted = [...RESEARCH_FRAMEWORKS].sort((a, b) => {
    const ah = highlightIds?.includes(a.id) ? 0 : 1;
    const bh = highlightIds?.includes(b.id) ? 0 : 1;
    return ah - bh;
  });

  return (
    <div className="space-y-2">
      {sorted.map((fw) => {
        const highlighted = highlightIds?.includes(fw.id);
        return (
          <details
            key={fw.id}
            className={`rounded-xl border ${highlighted ? "border-[#0071e3] bg-[#f8fbff]" : "border-black/5 bg-[#fbfbfd]"}`}
            open={highlighted}
          >
            <summary className="p-3 cursor-pointer text-[13px] font-medium">
              {fw.name}
              <span className="ml-2 text-[10px] text-[#86868b] font-normal">
                {fw.authors}, {fw.year} · {EVIDENCE_LABELS[fw.evidence]}
              </span>
            </summary>
            <div className="px-3 pb-3 text-[12px] space-y-2">
              <p>{fw.summary}</p>
              <p className="text-[#0071e3]">В приложении: {fw.appHook}</p>
              <ul className="list-disc pl-4">
                {fw.interventions.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
              {fw.doi && (
                <p className="text-[10px] text-[#86868b]">DOI: {fw.doi}</p>
              )}
            </div>
          </details>
        );
      })}
      <p className="text-[10px] text-[#86868b] pt-2">
        База офлайн. В будущем: OpenAlex / Semantic Scholar по DOI для обновлений.
      </p>
    </div>
  );
}
