"use client";

import { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { STANDALONE_MODE, BASE_PATH } from "@/lib/app-config";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const swPath = `${BASE_PATH}/sw.js`.replace(/\/+/g, "/");
    navigator.serviceWorker
      .register(swPath, { scope: `${BASE_PATH}/`.replace(/\/+/g, "/") || "/" })
      .catch(() => {});
  }, []);

  if (STANDALONE_MODE) {
    return <>{children}</>;
  }

  return <SessionProvider>{children}</SessionProvider>;
}
