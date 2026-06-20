"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { initStore, ensureProfile } from "@/lib/local-store";

export function StandaloneAppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await initStore();
      if (pathname === "/login" || pathname === "/register") {
        router.replace("/");
        return;
      }
      const profile = await ensureProfile();
      if (!profile.onboardingDone && pathname !== "/onboarding") {
        router.replace("/onboarding");
        return;
      }
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (!ready && pathname !== "/onboarding") {
    return (
      <div className="min-h-screen flex items-center justify-center text-[var(--text-secondary)]">
        Загрузка…
      </div>
    );
  }

  return <>{children}</>;
}
