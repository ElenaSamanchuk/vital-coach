"use client";

import { useEffect, useState } from "react";
import { X, Smartphone, Sparkles } from "lucide-react";
import { APP_NAME, STANDALONE_MODE } from "@/lib/app-config";
import { HINT_KEYS, hintSeen, markHintSeen } from "@/lib/client-hints";
import {
  canPromptPwaInstall,
  isIosSafari,
  isStandaloneDisplay,
  listenPwaInstallPrompt,
  promptPwaInstall,
} from "@/lib/pwa-install";

export function AppPromoBanners() {
  const [showRename, setShowRename] = useState(false);
  const [showPwa, setShowPwa] = useState(false);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    if (!STANDALONE_MODE) return;
    if (!hintSeen(HINT_KEYS.rebrandNotice)) setShowRename(true);
    if (isStandaloneDisplay() || hintSeen(HINT_KEYS.pwaBannerDismissed)) return;

    listenPwaInstallPrompt();
    const t = window.setTimeout(() => {
      if (isStandaloneDisplay()) return;
      setIosHint(isIosSafari());
      setShowPwa(true);
    }, 1200);
    return () => window.clearTimeout(t);
  }, []);

  const dismissRename = () => {
    markHintSeen(HINT_KEYS.rebrandNotice);
    setShowRename(false);
  };

  const dismissPwa = () => {
    markHintSeen(HINT_KEYS.pwaBannerDismissed);
    setShowPwa(false);
  };

  const installPwa = async () => {
    if (canPromptPwaInstall()) {
      const ok = await promptPwaInstall();
      if (ok) dismissPwa();
      return;
    }
  };

  if (!showRename && !showPwa) return null;

  return (
    <div className="space-y-2 mb-3">
      {showRename && (
        <div className="rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent-soft)] p-3 flex gap-2 items-start">
          <Sparkles size={18} className="text-[var(--accent)] shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-[var(--text)]">Приложение теперь «{APP_NAME}»</p>
            <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-relaxed">
              То же самое на устройстве — новое имя на иконке. Данные сохранены.
            </p>
          </div>
          <button type="button" onClick={dismissRename} className="shrink-0 p-1 text-[var(--text-tertiary)]" aria-label="Закрыть">
            <X size={16} />
          </button>
        </div>
      )}

      {showPwa && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--elevated)] p-3 flex gap-2 items-start">
          <Smartphone size={18} className="text-[var(--accent)] shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-[var(--text)]">Установи «{APP_NAME}» на экран</p>
            <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-relaxed">
              {iosHint
                ? "Safari → Поделиться → «На экран Домой»"
                : "Быстрый доступ без адресной строки · работает офлайн"}
            </p>
            {!iosHint && canPromptPwaInstall() && (
              <button type="button" onClick={installPwa} className="mt-2 text-[12px] font-semibold text-[var(--accent)]">
                Установить →
              </button>
            )}
          </div>
          <button type="button" onClick={dismissPwa} className="shrink-0 p-1 text-[var(--text-tertiary)]" aria-label="Закрыть">
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
