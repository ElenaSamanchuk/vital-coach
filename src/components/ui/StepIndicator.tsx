import { cn } from "@/lib/cn";

export function StepIndicator({
  steps,
  current,
}: {
  steps: { title: string }[];
  current: number;
}) {
  return (
    <div className="mb-6">
      <div className="flex gap-1.5 mb-3">
        {steps.map((_, i) => (
          <div
            key={i}
            className={cn(
              "vc-step-bar flex-1",
              i <= current ? "bg-[var(--accent)]" : "bg-[#e8e8ed]",
            )}
          />
        ))}
      </div>
      <p className="vc-label">Шаг {current + 1} из {steps.length}</p>
      <p className="vc-display mt-1">{steps[current]?.title}</p>
    </div>
  );
}
