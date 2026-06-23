"use client";

import { useMemo, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Search, Trash2 } from "lucide-react";
import { PickChip } from "./PickChip";
import { LucideByName } from "./LucideByName";
import { ImpactLine } from "@/components/visual/ImpactLine";
import { hapticLight } from "@/lib/haptics";

export interface HorizontalPickItem {
  id: string;
  title: string;
  subtitle?: string;
  impact?: string;
  icon?: LucideIcon;
  iconName?: string;
}

function PickStripSection({
  label,
  count,
  children,
  headerRight,
}: {
  label?: string;
  count: number;
  children: ReactNode;
  headerRight?: ReactNode;
}) {
  return (
    <div>
      {(label || count > 1 || headerRight) && (
        <div className="flex items-center justify-between gap-2 mb-1.5">
          {label ? <p className="vc-overline">{label}</p> : <span />}
          <div className="flex items-center gap-2 shrink-0">
            {count > 1 && (
              <span className="vc-text-xs text-[var(--text-tertiary)]">{count} · листай →</span>
            )}
            {headerRight}
          </div>
        </div>
      )}
      <div className="vc-pick-strip-wrap">
        <div className="vc-pick-strip">{children}</div>
      </div>
    </div>
  );
}

export function HorizontalPickSection({
  title,
  items,
  selectedIds,
  onToggle,
  searchPlaceholder = "Поиск…",
  onRemoveSlot,
  removableSlot,
  defaultSearchOpen = false,
}: {
  title: string;
  items: HorizontalPickItem[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  searchPlaceholder?: string;
  /** Удалить весь блок (например, лишний приём пищи) */
  onRemoveSlot?: () => void;
  removableSlot?: boolean;
  defaultSearchOpen?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(defaultSearchOpen || items.length > 12);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.subtitle?.toLowerCase().includes(q) ||
        i.impact?.toLowerCase().includes(q),
    );
  }, [items, search]);

  /** Выбранные — в начале полоски, в порядке выбора */
  const ordered = useMemo(() => {
    const seen = new Set<string>();
    const selected: HorizontalPickItem[] = [];
    for (const id of selectedIds) {
      const item = filtered.find((i) => i.id === id);
      if (item && !seen.has(id)) {
        selected.push(item);
        seen.add(id);
      }
    }
    const rest = filtered.filter((i) => !seen.has(i.id));
    return [...selected, ...rest];
  }, [filtered, selectedIds]);

  const selectedCount = selectedIds.length;

  return (
    <section className="vc-glass-card rounded-2xl space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="vc-text-sm font-semibold">{title}</p>
        <div className="flex items-center gap-1">
          {items.length > 8 && (
            <button
              type="button"
              onClick={() => {
                hapticLight();
                setSearchOpen((v) => !v);
              }}
              className="w-8 h-8 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center text-[var(--text-secondary)]"
              aria-label="Поиск"
            >
              <Search size={16} />
            </button>
          )}
          {removableSlot && onRemoveSlot && (
            <button
              type="button"
              onClick={() => {
                hapticLight();
                onRemoveSlot();
              }}
              className="w-8 h-8 rounded-full bg-[var(--danger-soft)] flex items-center justify-center text-[var(--danger)]"
              aria-label="Удалить"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {searchOpen && (
        <input
          type="search"
          className="apple-input w-full"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      )}

      <PickStripSection
        count={ordered.length}
        headerRight={
          selectedCount > 0 ? (
            <span className="vc-text-xs text-[var(--accent)] tabular-nums">{selectedCount} выбрано</span>
          ) : undefined
        }
      >
        {ordered.map((item) => {
          const selected = selectedIds.includes(item.id);
          const Icon = item.icon;
          return (
            <PickChip
              key={item.id}
              selected={selected}
              onClick={() => {
                hapticLight();
                onToggle(item.id);
              }}
            >
              <div className="vc-pick-chip-row">
                {Icon ? (
                  <Icon size={16} className="text-[var(--accent)] shrink-0" strokeWidth={1.75} />
                ) : item.iconName ? (
                  <LucideByName name={item.iconName} />
                ) : null}
                <p className="vc-pick-chip-title line-clamp-2">{item.title}</p>
              </div>
              {item.subtitle && (
                <p className="vc-text-xs mt-0.5 text-[var(--text-secondary)] tabular-nums">{item.subtitle}</p>
              )}
              {item.impact && <ImpactLine text={item.impact} />}
            </PickChip>
          );
        })}
      </PickStripSection>

      {filtered.length === 0 && (
        <p className="vc-text-xs text-center text-[var(--text-tertiary)] py-2">Ничего не найдено</p>
      )}

      {selectedCount > 0 && (
        <p className="vc-text-xs text-center text-[var(--text-tertiary)]">
          Повторное нажатие снимает выбор
        </p>
      )}
    </section>
  );
}
