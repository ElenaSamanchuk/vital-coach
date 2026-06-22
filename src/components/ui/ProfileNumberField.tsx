"use client";

import { useState } from "react";

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
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const display =
    editing ? draft : value != null && value > 0 ? String(value) : "";

  return (
    <label className="block">
      <span className="vc-label">{label}</span>
      <input
        type="number"
        step={step}
        min={min}
        max={max}
        className="apple-input mt-1"
        value={display}
        onFocus={() => {
          setEditing(true);
          setDraft(value != null && value > 0 ? String(value) : "");
        }}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          setEditing(false);
          if (draft.trim() === "") return;
          const n = parseFloat(draft);
          if (Number.isNaN(n)) return;
          onCommit(n);
        }}
      />
    </label>
  );
}
