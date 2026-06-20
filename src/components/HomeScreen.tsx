"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { AppShell } from "./AppShell";
import { CoachDashboard } from "./CoachDashboard";
import { ShellDock } from "./layout/ShellDock";
import { UI } from "@/lib/product-copy";

export function HomeScreen() {
  return (
    <CoachDashboard
      renderShell={(content, { diaryDone, isEvening }) => (
        <AppShell
          dock={
            <ShellDock>
              <Link
                href="/log"
                className={`apple-btn py-4 text-[16px] shadow-lg ${
                  diaryDone ? "apple-btn-secondary" : "apple-btn-primary"
                }`}
              >
                {diaryDone ? UI.diaryDone : isEvening ? UI.diaryClose : UI.diaryOpen}
                <ChevronRight size={18} />
              </Link>
            </ShellDock>
          }
        >
          {content}
        </AppShell>
      )}
    />
  );
}
