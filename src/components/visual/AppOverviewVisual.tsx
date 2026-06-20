import { Calendar, BookOpen, Route, User } from "lucide-react";

const TABS = [
  { Icon: Calendar, label: "Сегодня", desc: "План и выбор еды / тренировки" },
  { Icon: BookOpen, label: "Дневник", desc: "Единственное место для записей" },
  { Icon: Route, label: "Путь", desc: "Прогресс и аналитика" },
  { Icon: User, label: "Профиль", desc: "Настройки и анализы" },
];

export function AppOverviewVisual() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {TABS.map(({ Icon, label, desc }) => (
        <div
          key={label}
          className="rounded-2xl border border-[var(--border)] bg-[var(--elevated)] p-4 text-left"
        >
          <Icon size={22} className="text-[var(--accent)] mb-2" />
          <p className="text-[14px] font-semibold text-[var(--text)]">{label}</p>
          <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-snug">{desc}</p>
        </div>
      ))}
    </div>
  );
}
