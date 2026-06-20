"use client";

export function ActionChipGrid({
  actions,
  selected,
  onToggle,
}: {
  actions: { id: string; label: string; emoji: string }[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((a) => {
        const on = selected.includes(a.id);
        return (
          <button
            key={a.id}
            type="button"
            onClick={() => onToggle(a.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-[12px] font-medium border-2 transition-all ${
              on
                ? "border-[#0071e3] bg-[#e8f2ff] text-[#0071e3]"
                : "border-transparent bg-[#fbfbfd] text-[#1d1d1f]"
            }`}
          >
            <span>{a.emoji}</span>
            {a.label}
          </button>
        );
      })}
    </div>
  );
}
