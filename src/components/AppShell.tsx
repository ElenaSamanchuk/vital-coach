"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map, ClipboardList, Settings } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { NAV_ITEMS, PAGE_META } from "@/lib/app-system";
import { BRAND_GRADIENT } from "@/lib/design-tokens";

const ICONS = [Home, ClipboardList, Map, Settings];

export function AppShell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}) {
  const pathname = usePathname();
  const meta = PAGE_META[pathname] ?? { title: "Vital Coach", subtitle: "" };

  return (
    <div className="min-h-screen flex flex-col vc-container w-full max-w-none md:max-w-2xl lg:max-w-3xl">
      <header className="sticky top-0 z-40 vc-header px-4 py-3 md:py-4">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: BRAND_GRADIENT }}
          >
            <Map size={16} className="text-white" />
          </div>
          <div>
            <h1 className="vc-display text-[20px] md:text-[22px]">{title ?? meta.title}</h1>
            {(subtitle ?? meta.subtitle) && (
              <p className="vc-subtitle text-[12px]">{subtitle ?? meta.subtitle}</p>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 pt-2 safe-bottom vc-page-enter">{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 z-50 vc-nav">
        <div className="flex justify-around max-w-none md:max-w-2xl lg:max-w-3xl mx-auto py-2 pb-[max(8px,env(safe-area-inset-bottom))] px-2">
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
