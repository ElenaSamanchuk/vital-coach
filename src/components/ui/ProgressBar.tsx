export function ProgressBar({
  value,
  max,
  label,
  color = "var(--accent)",
}: {
  value: number;
  max: number;
  label?: string;
  color?: string;
}) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div>
      {label && (
        <div className="flex justify-between text-[13px] mb-1.5">
          <span className="text-[var(--text-secondary)]">{label}</span>
          <span className="font-medium">
            {value} / {max}
          </span>
        </div>
      )}
      <div className="h-2 bg-[#e8e8ed] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
