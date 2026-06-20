"use client";

import { defaultDayRings, type RingSegment } from "@/lib/day-rings";

export type { RingSegment };
export { defaultDayRings };

const SIZE = 168;
const CX = SIZE / 2;
const STROKES = [12, 10, 8, 6];
const RADII = [70, 56, 42, 28];

function arcPath(r: number, progress: number) {
  const p = Math.min(1, Math.max(0, progress));
  if (p <= 0) return "";
  const start = -90;
  const end = start + p * 360;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const x1 = CX + r * Math.cos(toRad(start));
  const y1 = CX + r * Math.sin(toRad(start));
  const x2 = CX + r * Math.cos(toRad(end));
  const y2 = CX + r * Math.sin(toRad(end));
  const large = p > 0.5 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
}

export function CompletionRings({
  rings,
  centerLabel,
  centerSub,
  celebrate,
}: {
  rings: RingSegment[];
  centerLabel: string;
  centerSub?: string;
  celebrate?: boolean;
}) {
  const ordered = rings.slice(0, 4);

  return (
    <div
      className={`flex flex-col items-center ${celebrate ? "vc-celebrate-rings" : ""}`}
    >
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="block">
        {ordered.map((ring, i) => {
          const r = RADII[i];
          const sw = STROKES[i];
          const track = `M ${CX} ${CX - r} A ${r} ${r} 0 1 1 ${CX - 0.01} ${CX - r}`;
          const fill = arcPath(r, ring.progress);
          return (
            <g key={ring.id}>
              <path
                d={track}
                fill="none"
                stroke="var(--ring-track)"
                strokeWidth={sw}
                strokeLinecap="round"
              />
              {fill && (
                <path
                  d={fill}
                  fill="none"
                  stroke={ring.color}
                  strokeWidth={sw}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              )}
            </g>
          );
        })}
        <text
          x={CX}
          y={CX - 4}
          textAnchor="middle"
          className="fill-[var(--text)] text-[22px] font-bold"
          style={{ fontSize: 22 }}
        >
          {centerLabel}
        </text>
        <text
          x={CX}
          y={CX + 16}
          textAnchor="middle"
          className="fill-[var(--text-secondary)]"
          style={{ fontSize: 11 }}
        >
          {centerSub ?? "сегодня"}
        </text>
      </svg>

      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 w-full justify-center max-w-[280px] mx-auto">
        {ordered.map((ring) => (
          <div key={ring.id} className="flex items-center gap-1.5 text-[11px]">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: ring.color }}
            />
            <span className={ring.done ? "text-[var(--text)] font-medium" : "text-[var(--text-secondary)]"}>
              {ring.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

