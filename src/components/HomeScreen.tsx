"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { GENERIC_MODE } from "@/lib/app-config";
import { UnifiedDayScreen } from "./UnifiedDayScreen";
import { CoachDashboard } from "./CoachDashboard";
import { ShellDockSlot } from "./layout/ShellDockContext";
import { UI } from "@/lib/product-copy";

export function HomeScreen() {
  if (GENERIC_MODE) {
    return <UnifiedDayScreen />;
  }

  return (
    <CoachDashboard
      renderDock={({ diaryDone, isEvening }) => (
        <ShellDockSlot>
          <Link
            href="/log"
            className={`apple-btn w-full flex items-center justify-center gap-2 shadow-lg ${
              diaryDone ? "apple-btn-secondary" : "apple-btn-primary"
            }`}
          >
            {diaryDone ? UI.diaryDone : isEvening ? UI.diaryClose : UI.diaryOpen}
            <ChevronRight size={18} />
          </Link>
        </ShellDockSlot>
      )}
    />
  );
}
