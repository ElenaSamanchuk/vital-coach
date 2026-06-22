"use client";

import { GENERIC_MODE } from "@/lib/app-config";
import { PotokAnalytics } from "@/components/PotokAnalytics";
import { PathDashboard } from "@/components/PathDashboard";

export function PathPageContent() {
  if (GENERIC_MODE) {
    return (
      <div className="vc-page">
        <PotokAnalytics />
      </div>
    );
  }
  return <PathDashboard />;
}
