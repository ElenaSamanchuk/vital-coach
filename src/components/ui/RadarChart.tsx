"use client";

interface RadarChartProps {
  stats: { label: string; value: number; color: string }[];
  size?: number;
}

export function RadarChart({ stats, size = 200 }: RadarChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.38;
  const n = stats.length;
  const angleStep = (2 * Math.PI) / n;

  const point = (i: number, val: number) => {
    const a = i * angleStep - Math.PI / 2;
    const r = (val / 100) * maxR;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  };

  const gridLevels = [25, 50, 75, 100];
  const dataPoints = stats.map((s, i) => point(i, Math.min(100, s.value)));

  const polygon = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg width={size} height={size} className="mx-auto">
      {gridLevels.map((lvl) => {
        const pts = stats
          .map((_, i) => point(i, lvl))
          .map((p) => `${p.x},${p.y}`)
          .join(" ");
        return (
          <polygon
            key={lvl}
            points={pts}
            fill="none"
            stroke="#e8e8ed"
            strokeWidth="1"
          />
        );
      })}
      {stats.map((s, i) => {
        const outer = point(i, 100);
        const label = point(i, 115);
        return (
          <g key={s.label}>
            <line x1={cx} y1={cy} x2={outer.x} y2={outer.y} stroke="#e8e8ed" strokeWidth="1" />
            <text
              x={label.x}
              y={label.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-[#86868b] text-[9px] font-medium"
            >
              {s.label.slice(0, 4)}
            </text>
          </g>
        );
      })}
      <polygon
        points={polygon}
        fill="rgba(0,113,227,0.2)"
        stroke="#0071e3"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill={stats[i].color} />
      ))}
    </svg>
  );
}
