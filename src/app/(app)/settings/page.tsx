import { Suspense } from "react";
import { SettingsForm } from "@/components/SettingsForm";

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="text-center py-8 text-[var(--text-secondary)]">Загрузка…</div>}>
      <SettingsForm />
    </Suspense>
  );
}
