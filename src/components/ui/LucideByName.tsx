"use client";

import * as LucideIcons from "lucide-react";
import { Sparkles, type LucideIcon } from "lucide-react";

/** Lucide-иконка по имени (как в TodayOptionsStrip) — зелёный контур */
export function LucideByName({
  name,
  size = 16,
  className = "text-[var(--accent)] shrink-0",
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const Icon = (LucideIcons as unknown as Record<string, LucideIcon>)[name];
  if (!Icon) return <Sparkles size={size} className={className} />;
  return <Icon size={size} className={className} strokeWidth={1.75} />;
}
