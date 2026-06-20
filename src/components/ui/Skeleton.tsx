export function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={`vc-skeleton rounded-lg bg-[var(--gray-soft)] ${className ?? ""}`}
      aria-hidden
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="vc-glass-card space-y-3">
      <SkeletonBlock className="h-3.5 w-28" />
      <SkeletonBlock className="h-24 w-full rounded-xl" />
      <div className="flex gap-2">
        <SkeletonBlock className="h-11 flex-1 rounded-xl" />
        <SkeletonBlock className="h-11 flex-1 rounded-xl" />
      </div>
    </div>
  );
}

export function PageSkeleton({ cards = 2 }: { cards?: number }) {
  return (
    <div className="vc-page" aria-busy="true" aria-label="Загрузка">
      {Array.from({ length: cards }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
