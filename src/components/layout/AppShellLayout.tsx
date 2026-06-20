"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
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
  const [direction, setDirection] = useState<"forward" | "back" | "neutral">("neutral");

  useLayoutEffect(() => {
    const current = tabIndex(route);
    const prev = prevTabRef.current;
    if (current >= 0 && prev >= 0 && current !== prev) {
      setDirection(current > prev ? "forward" : "back");
    } else {
      setDirection("neutral");
    }
    prevTabRef.current = current;
  }, [route]);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: "auto" });
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
