"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { cn } from "@/lib/cn";
import { normalizeAppPath } from "@/lib/routes";
import { useShellDock } from "./ShellDockContext";

const TAB_ROUTES = ["/", "/log", "/path", "/settings"] as const;

function tabIndex(route: string): number {
  return TAB_ROUTES.indexOf(route as (typeof TAB_ROUTES)[number]);
}

export function AppShellLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const route = normalizeAppPath(pathname);
  const dock = useShellDock();
  const mainRef = useRef<HTMLElement>(null);
  const prevTabRef = useRef(tabIndex(route));

  const currentTab = tabIndex(route);
  const direction =
    currentTab >= 0 && prevTabRef.current >= 0 && currentTab !== prevTabRef.current
      ? currentTab > prevTabRef.current
        ? "forward"
        : "back"
      : "neutral";

  useEffect(() => {
    prevTabRef.current = currentTab;
  }, [currentTab]);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [route]);

  return (
    <AppShell dock={dock} mainRef={mainRef}>
      <div
        key={route}
        className={cn(
          "vc-page-enter vc-page",
          direction === "forward" && "vc-page-enter--forward",
          direction === "back" && "vc-page-enter--back",
        )}
      >
        {children}
      </div>
    </AppShell>
  );
}
