"use client";

export function DynamicInsightsCard({ insights }: { insights: string[] }) {
  const items = insights.filter(Boolean).slice(0, 4);
  if (items.length === 0) return null;

  return (
    <div className="vc-glass-card rounded-2xl space-y-2">
      <p className="vc-text-sm font-semibold text-[var(--text)]">Из твоей недели</p>
      <ul className="space-y-1.5">
        {items.map((line) => (
          <li key={line} className="vc-text-xs text-[var(--text-secondary)] leading-relaxed pl-3 relative before:content-[''] before:absolute before:left-0 before:top-[0.45em] before:w-1 before:h-1 before:rounded-full before:bg-[var(--accent)]">
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}
