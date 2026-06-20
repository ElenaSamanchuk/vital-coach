export function SliderField({
  label,
  value,
  onChange,
  min = 1,
  max = 10,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div>
      <div className="flex justify-between text-[13px] mb-2">
        <span>{label}</span>
        <span className="font-semibold text-[var(--accent)]">{value}/{max}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="w-full accent-[var(--accent)]"
      />
    </div>
  );
}
