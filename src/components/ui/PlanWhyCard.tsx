"use client";

import { useState } from "react";
import { ChevronDown, Info } from "lucide-react";
import type { EvidenceBlock } from "@/lib/evidence-why";

export function PlanWhyCard({ blocks }: { blocks: EvidenceBlock[] }) {
  const [open, setOpen] = useState(false);
  const filtered = blocks.filter(Boolean);
  if (filtered.length === 0) return null;

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--elevated)] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 p-4 text-left"
      >
        <Info size={16} className="text-[var(--accent)] shrink-0" />
        <span className="text-[13px] font-semibold flex-1">Почему такой план сегодня</span>
        <ChevronDown
          size={16}
          className={`text-[var(--text-tertiary)] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-2 border-t border-[var(--border)] pt-3">
          {filtered.map((b) => (
            <div key={b.title} className="text-[12px]">
              <p className="font-semibold text-[var(--text)]">{b.title}</p>
              <p className="text-[var(--text-secondary)] mt-0.5 leading-snug">{b.why}</p>
              {b.action && <p className="text-[var(--accent)] mt-0.5">{b.action}</p>}
              <p className="text-[10px] text-[var(--text-tertiary)] mt-1 uppercase tracking-wide">{b.source}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
