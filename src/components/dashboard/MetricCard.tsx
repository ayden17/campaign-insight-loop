import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change?: number;
  icon: LucideIcon;
  delay?: number;
}

export function MetricCard({ title, value, change, icon: Icon, delay = 0 }: MetricCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <div
      className="rounded-xl border border-border bg-card p-4 opacity-0 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{title}</span>
        <div className="rounded-lg bg-muted p-1.5">
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      </div>
      <div className="text-xl font-bold text-card-foreground tracking-tight">{value}</div>
      {change !== undefined && (
        <div className="mt-1.5 flex items-center gap-1">
          {isPositive && <ArrowUp className="h-3 w-3 text-success" />}
          {isNegative && <ArrowDown className="h-3 w-3 text-destructive" />}
          <span
            className={cn(
              "text-[11px] font-semibold",
              isPositive && "text-success",
              isNegative && "text-destructive",
              !isPositive && !isNegative && "text-muted-foreground"
            )}
          >
            {isPositive ? "+" : ""}{change}%
          </span>
          <span className="text-[11px] text-muted-foreground">vs last period</span>
        </div>
      )}
    </div>
  );
}
