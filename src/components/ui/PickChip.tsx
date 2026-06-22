"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Плашка выбора — еда, движение, досуг, победы дня */
export function PickChip({
  selected,
  recommended,
  onClick,
  children,
  className,
}: {
  selected: boolean;
  recommended?: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "vc-pick-chip",
        selected ? "vc-pick-chip--selected" : "vc-pick-chip--idle",
        recommended && !selected && "ring-1 ring-[var(--accent)]/40",
        className,
      )}
    >
      {recommended && !selected && (
        <span className="absolute top-1 right-1 text-[10px] text-[var(--accent)]" aria-hidden>
          ★
        </span>
      )}
      {children}
    </button>
  );
}
