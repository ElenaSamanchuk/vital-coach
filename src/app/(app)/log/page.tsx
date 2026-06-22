import { Suspense } from "react";
import { DailyLogForm } from "@/components/DailyLogForm";
import { PageSkeleton } from "@/components/ui/Skeleton";

export default function LogPage() {
  return (
    <Suspense fallback={<PageSkeleton cards={2} />}>
      <DailyLogForm />
    </Suspense>
  );
}
