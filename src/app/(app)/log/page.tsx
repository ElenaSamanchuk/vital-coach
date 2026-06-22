import { redirect } from "next/navigation";
import { Suspense } from "react";
import { GENERIC_MODE } from "@/lib/app-config";
import { DailyLogForm } from "@/components/DailyLogForm";
import { PageSkeleton } from "@/components/ui/Skeleton";

export default function LogPage() {
  if (GENERIC_MODE) {
    redirect("/");
  }

  return (
    <Suspense fallback={<PageSkeleton cards={2} />}>
      <DailyLogForm />
    </Suspense>
  );
}
