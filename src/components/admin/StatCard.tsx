import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  icon: Icon,
  sub,
  delta,
  highlight = false,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  sub?: string;
  delta?: ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border bg-card p-5 ${
        highlight ? "border-primary/40" : "border-border"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-foreground/60">{label}</div>
        <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-display text-3xl font-bold">{value}</span>
        {delta}
      </div>
      {sub ? <div className="mt-1 text-xs text-foreground/50">{sub}</div> : null}
    </div>
  );
}
