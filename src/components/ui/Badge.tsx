import { cn } from "@/lib/cn";

const variants = {
  accent: "vc-badge--accent",
  success: "vc-badge--success",
  warning: "vc-badge--warning",
  danger: "vc-badge--danger",
  neutral: "bg-[#f2f2f7] text-[#636366]",
} as const;

export function Badge({
  children,
  variant = "accent",
  className,
}: {
  children: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}) {
  return <span className={cn("vc-badge", variants[variant], className)}>{children}</span>;
}
