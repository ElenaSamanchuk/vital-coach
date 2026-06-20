"use client";

/** Мотивирующая подпись «что получишь» */
export function ImpactLine({ text, inverted }: { text: string; inverted?: boolean }) {
  if (!text) return null;
  return (
    <p
      className={`text-[9px] leading-snug mt-1 line-clamp-2 ${
        inverted ? "text-white/85" : "text-[var(--success)]"
      }`}
    >
      ↑ {text}
    </p>
  );
}
