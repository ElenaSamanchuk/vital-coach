"use client";

import type { ReactNode } from "react";

/** Кнопка над нижней навигацией — всегда внутри рамки приложения (480px) */
export function ShellDock({ children }: { children: ReactNode }) {
  return <div className="vc-shell-dock">{children}</div>;
}
