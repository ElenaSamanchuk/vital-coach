"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Плашка выбора — еда, движение, досуг, победы дня */
export function PickChip({
  selected,
  onClick,
  children,
  className,
}: {
  selected: boolean;
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
        className,
      )}
    >
      {children}
    </button>
  );
}
