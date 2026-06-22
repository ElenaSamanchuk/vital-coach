"use client";

import { Download, Smartphone } from "lucide-react";
import { APK_DOWNLOAD_URL, APP_NAME } from "@/lib/app-config";
import { isStandaloneDisplay } from "@/lib/pwa-install";
import { GlassCard } from "./ui/GlassCard";

export function ApkDownloadCard() {
  const installed = typeof window !== "undefined" && isStandaloneDisplay();

  return (
    <GlassCard title="Android-приложение" subtitle="Установка без Play Store">
      <div className="flex items-start gap-3">
        <Smartphone className="text-[var(--accent)] shrink-0" size={22} />
        <div className="text-[13px] space-y-2">
          <p>
            Скачай <strong>{APP_NAME}</strong> как APK — иконка на экране, без адресной строки.
          </p>
          {installed && (
            <p className="text-[12px] text-[var(--success)]">Уже установлено как приложение ✓</p>
          )}
          <p className="text-[11px] text-[var(--text-secondary)]">
            Разреши установку из неизвестных источников, если Android спросит.
          </p>
        </div>
      </div>
      <a
        href={APK_DOWNLOAD_URL}
        download="potok.apk"
        className="apple-btn apple-btn-primary w-full mt-4 flex items-center justify-center gap-2"
      >
        <Download size={18} />
        Скачать potok.apk
      </a>
    </GlassCard>
  );
}
