"use client";

import { backupIncludesLine, UI } from "@/lib/product-copy";
import { apiClient } from "@/lib/api-client";
import { GENERIC_MODE, STANDALONE_MODE } from "@/lib/app-config";
import { useEffect, useRef, useState } from "react";
import { GlassCard } from "./ui/GlassCard";
import { Badge } from "./ui/Badge";
import { Download, Shield, Upload } from "lucide-react";

export function BackupPanel() {
  const [lastBackup, setLastBackup] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importOk, setImportOk] = useState(false);
  const [importErr, setImportErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    apiClient("/api/profile")
      .then((r) => r.json())
      .then((p) => setLastBackup(p.lastBackupAt ?? null));
  }, [importOk]);

  const download = async () => {
    const res = await apiClient("/api/backup");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vital-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setLastBackup(new Date().toISOString());
  };

  const onFile = async (file: File) => {
    setImporting(true);
    setImportErr(null);
    setImportOk(false);
    try {
      const text = await file.text();
      const data = JSON.parse(text) as Record<string, unknown>;
      if (!data.profile && !data.dailyLogs) {
        throw new Error("Неверный формат файла");
      }
      const res = await apiClient("/api/backup/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: data.profile,
          dailyLogs: data.dailyLogs,
          labResults: data.labResults,
          examinations: data.examinations,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error ?? "Ошибка импорта");
      setImportOk(true);
      setTimeout(() => window.location.reload(), 800);
    } catch (e) {
      setImportErr(e instanceof Error ? e.message : "Не удалось импортировать");
    } finally {
      setImporting(false);
    }
  };

  return (
    <GlassCard
      title="Резервная копия"
      subtitle="Экспорт и восстановление на новом телефоне"
      glow="success"
    >
      <div className="flex items-start gap-3">
        <Shield className="text-[var(--success)] shrink-0" size={24} />
        <div className="text-[13px]">
          <p>
            Данные {STANDALONE_MODE ? "на этом устройстве (IndexedDB)" : "в приложении"}. JSON — перенос
            на новый телефон.
          </p>
          <p className="text-[var(--text-secondary)] mt-2">
            Профиль, дневники, фото дня, {backupIncludesLine()}, XP.
          </p>
          {GENERIC_MODE && (
            <p className="text-[var(--text-secondary)] mt-1 text-[12px]">{UI.backupTech}</p>
          )}
        </div>
      </div>
      {lastBackup && (
        <Badge variant="success" className="mt-3">
          Последний бэкап: {new Date(lastBackup).toLocaleDateString("ru")}
        </Badge>
      )}
      {importOk && (
        <Badge variant="success" className="mt-3">
          Импорт OK — обновляем…
        </Badge>
      )}
      {importErr && (
        <p className="mt-3 text-[13px] text-[var(--danger)]">{importErr}</p>
      )}
      <div className="flex flex-col gap-2 mt-4">
        <button
          type="button"
          onClick={download}
          className="apple-btn apple-btn-primary w-full flex items-center justify-center gap-2"
        >
          <Download size={18} />
          Скачать JSON
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          disabled={importing}
          onClick={() => fileRef.current?.click()}
          className="apple-btn apple-btn-secondary w-full flex items-center justify-center gap-2"
        >
          <Upload size={18} />
          {importing ? "Импорт…" : "Восстановить из JSON"}
        </button>
      </div>
    </GlassCard>
  );
}
