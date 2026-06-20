import { APP_FLOW } from "@/lib/product-copy";
import { Card } from "./ui/Card";

export function AppFlowCard() {
  return (
    <Card title={APP_FLOW.title} subtitle={APP_FLOW.note}>
      <ul className="space-y-2 text-[13px]">
        {APP_FLOW.steps.map((s) => (
          <li key={s.label} className="flex gap-2">
            <span className="font-semibold text-[var(--accent)] shrink-0 w-20">{s.label}</span>
            <span className="text-[var(--text-secondary)]">{s.desc}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
