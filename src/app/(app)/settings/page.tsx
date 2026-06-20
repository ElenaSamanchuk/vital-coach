import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";
import { SettingsForm } from "@/components/SettingsForm";

export default function SettingsPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="text-center py-8 text-[#86868b]">Загрузка…</div>}>
        <SettingsForm />
      </Suspense>
    </AppShell>
  );
}
