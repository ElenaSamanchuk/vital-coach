"use client";

import { useState } from "react";
import { GENERIC_MODE } from "@/lib/app-config";
import type { EvidenceBlock } from "@/lib/evidence-why";
import { BookOpen, ChevronDown } from "lucide-react";
import Link from "next/link";

export function EvidenceWhy({
  block,
  compact,
  defaultOpen = false,
}: {
  block: EvidenceBlock;
  compact?: boolean;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className={`rounded-xl border border-[var(--border)] bg-[var(--accent-soft)] ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start gap-2 text-left"
      >
        <BookOpen size={16} className="text-[var(--accent)] mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-[var(--text)]">{block.title}</p>
          {!open && (
            <p className="text-[12px] text-[var(--text-secondary)] mt-0.5 line-clamp-1">
              {block.why}
            </p>
          )}
        </div>
        <ChevronDown
          size={16}
          className={`text-[var(--text-tertiary)] shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="mt-2 pl-6 space-y-1.5">
          <p className="text-[13px] leading-snug text-[var(--text-secondary)]">{block.why}</p>
          {block.action && (
            <p className="text-[12px] font-medium text-[var(--accent)]">{block.action}</p>
          )}
          {!GENERIC_MODE && (
            <Link
              href="/guide"
              className="text-[10px] text-[var(--text-tertiary)] tracking-wide uppercase hover:text-[var(--accent)]"
            >
              {block.source} → справочник
            </Link>
          )}
          {GENERIC_MODE && (
            <p className="text-[10px] text-[var(--text-tertiary)] tracking-wide uppercase">
              {block.source}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
