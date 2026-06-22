"use client";

import { useEffect, useState } from "react";

/** Число в профиле — не пишет 0 пока печатаешь; сохранение на blur */
export function ProfileNumberField({
  label,
  value,
  onCommit,
  step,
  min,
  max,
}: {
  label: string;
  value: number | undefined;
  onCommit: (n: number) => void;
  step?: number | string;
  min?: number;
  max?: number;
}) {
  const [text, setText] = useState(value != null && value > 0 ? String(value) : "");

  useEffect(() => {
    setText(value != null && value > 0 ? String(value) : "");
  }, [value]);

  return (
    <label className="block">
      <span className="vc-label">{label}</span>
      <input
        type="number"
        step={step}
        min={min}
        max={max}
        className="apple-input mt-1"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => {
          if (text.trim() === "") return;
          const n = parseFloat(text);
          if (Number.isNaN(n)) return;
          onCommit(n);
        }}
      />
    </label>
  );
}
