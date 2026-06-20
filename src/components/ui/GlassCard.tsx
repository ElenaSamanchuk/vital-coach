"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function GlassCard({
  children,
  className,
  title,
  subtitle,
  glow,
  animate = true,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  glow?: "accent" | "premium" | "success";
  animate?: boolean;
}) {
  return (
    <div
      className={cn(
        "vc-glass-card rounded-[var(--radius)] p-4 md:p-5",
        animate && "vc-animate-in",
        glow === "accent" && "vc-glow-accent",
        glow === "premium" && "vc-glow-premium",
        glow === "success" && "vc-glow-success",
        className,
      )}
    >
      {(title || subtitle) && (
        <div className="mb-3">
          {title && <h3 className="vc-title text-[17px]">{title}</h3>}
          {subtitle && <p className="vc-subtitle mt-0.5">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
