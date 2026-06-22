"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, TrendingUp, User, Leaf } from "lucide-react";
import { ReactNode, RefObject } from "react";
import { cn } from "@/lib/cn";
import { NAV_ITEMS, PAGE_META } from "@/lib/app-system";
import { APP_NAME, GENERIC_MODE } from "@/lib/app-config";
import { isNavActive, normalizeAppPath } from "@/lib/routes";
import { BRAND_GRADIENT } from "@/lib/design-tokens";
import { PotokHomeHeader } from "@/components/visual/PotokHomeHeader";

const NAV_ICONS = [Home, BookOpen, TrendingUp, User] as const;

export function AppShell({
  children,
  title,
  subtitle,
  dock,
  mainClassName,
  mainRef,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  dock?: ReactNode;
  mainClassName?: string;
  mainRef?: RefObject<HTMLElement | null>;
}) {
  const pathname = usePathname();
  const route = normalizeAppPath(pathname);
  const meta = PAGE_META[route] ?? PAGE_META[pathname] ?? { title: APP_NAME, subtitle: "" };
  const isPotokHome = GENERIC_MODE && route === "/";

  return (
    <div className="vc-app-shell">
      <header className="shrink-0 z-40 vc-header vc-header-safe px-4 pb-2">
        {isPotokHome ? (
          <PotokHomeHeader />
        ) : (
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: BRAND_GRADIENT }}
              aria-hidden
            >
              <Leaf size={17} className="text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="vc-display">{title ?? meta.title}</h1>
              {(subtitle ?? meta.subtitle) && (
                <p className="vc-subtitle vc-text-xs mt-0.5 truncate">{subtitle ?? meta.subtitle}</p>
              )}
            </div>
          </div>
        )}
      </header>

      <main ref={mainRef} className={cn("vc-app-main", mainClassName)}>
        {children}
      </main>

      {dock ? <div className="vc-shell-dock">{dock}</div> : null}

      <nav className="shrink-0 vc-nav pb-[max(6px,env(safe-area-inset-bottom))]" aria-label="Основные разделы">
        <div className="flex justify-around gap-0.5 py-1.5 px-1.5">
          {NAV_ITEMS.map(({ href, label }, i) => {
            const Icon = NAV_ICONS[i];
            const active = isNavActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "vc-nav-item flex-1 min-w-0",
                  active ? "vc-nav-item--active" : "vc-nav-item--idle",
                )}
              >
                <Icon size={18} strokeWidth={active ? 2.5 : 1.75} aria-hidden />
                <span className="text-[10px] font-semibold truncate w-full text-center">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
