"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map, ClipboardList, Settings } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { NAV_ITEMS, PAGE_META } from "@/lib/app-system";
import { APP_NAME } from "@/lib/app-config";
import { BRAND_GRADIENT } from "@/lib/design-tokens";

const ICONS = [Home, ClipboardList, Map, Settings];

/**
 * Mobile-first shell: header · scroll · dock (optional) · tab bar.
 * Без viewport-fixed — всё в колонке 480px, как в Ionic / native tab apps.
 */
export function AppShell({
  children,
  title,
  subtitle,
  dock,
  mainClassName,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  /** Кнопка над таб-баром (например «Записать в дневник») */
  dock?: ReactNode;
  mainClassName?: string;
}) {
  const pathname = usePathname();
  const meta = PAGE_META[pathname] ?? { title: APP_NAME, subtitle: "" };

  return (
    <div className="vc-app-shell">
      <header className="shrink-0 z-40 vc-header px-4 py-3">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: BRAND_GRADIENT }}
          >
            <Map size={16} className="text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="vc-display text-[20px] truncate">{title ?? meta.title}</h1>
            {(subtitle ?? meta.subtitle) && (
              <p className="vc-subtitle text-[12px] truncate">{subtitle ?? meta.subtitle}</p>
            )}
          </div>
        </div>
      </header>

      <main className={cn("vc-app-main px-4 pt-2 pb-4 vc-page-enter", mainClassName)}>
        {children}
      </main>

      {dock}

      <nav className="shrink-0 vc-nav pb-[max(8px,env(safe-area-inset-bottom))]">
        <div className="flex justify-around py-2 px-2">
          {NAV_ITEMS.map(({ href, label }, i) => {
            const Icon = ICONS[i];
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "vc-nav-item flex-1 max-w-[88px]",
                  active ? "vc-nav-item--active" : "vc-nav-item--idle",
                )}
              >
                <Icon size={22} strokeWidth={active ? 2.5 : 1.75} />
                <span className="text-[10px] font-semibold">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
