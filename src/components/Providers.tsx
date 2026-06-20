"use client";

import { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { STANDALONE_MODE, BASE_PATH } from "@/lib/app-config";
import { ToastProvider } from "@/components/ui/Toast";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const swPath = `${BASE_PATH}/sw.js`.replace(/\/+/g, "/");
    navigator.serviceWorker
      .register(swPath, { scope: `${BASE_PATH}/`.replace(/\/+/g, "/") || "/" })
      .catch(() => {});
  }, []);

  const wrapped = <ToastProvider>{children}</ToastProvider>;

  if (STANDALONE_MODE) {
    return wrapped;
  }

  return <SessionProvider>{wrapped}</SessionProvider>;
}
