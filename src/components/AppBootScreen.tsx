"use client";

import { Leaf } from "lucide-react";
import { APP_NAME } from "@/lib/app-config";
import { BRAND_GRADIENT } from "@/lib/design-tokens";
import { PageSkeleton } from "./ui/Skeleton";

/** Брендированный экран загрузки standalone */
export function AppBootScreen({ label = "Загрузка…" }: { label?: string }) {
  return (
    <div className="vc-app-shell vc-app-shell--page">
      <main className="vc-app-main flex flex-col items-center justify-center px-4 vc-header-safe">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: BRAND_GRADIENT }}
          aria-hidden
        >
          <Leaf className="text-white" size={28} />
        </div>
        <p className="vc-display text-[20px] mb-1">{APP_NAME}</p>
        <p className="vc-subtitle mb-8">{label}</p>
        <div className="w-full max-w-sm">
          <PageSkeleton cards={2} />
        </div>
      </main>
    </div>
  );
}
