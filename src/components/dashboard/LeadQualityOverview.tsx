import { campaigns } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const qualityColors = {
  high: "bg-success",
  medium: "bg-warning",
  low: "bg-destructive",
  lost: "bg-muted-foreground",
};

const qualityLabels = {
  high: "High Quality",
  medium: "Medium",
  low: "Low Quality",
  lost: "Lost",
};

export function LeadQualityOverview() {
  const totals = campaigns.reduce(
    (acc, c) => ({
      high: acc.high + c.leadQuality.high,
      medium: acc.medium + c.leadQuality.medium,
      low: acc.low + c.leadQuality.low,
      lost: acc.lost + c.leadQuality.lost,
    }),
    { high: 0, medium: 0, low: 0, lost: 0 }
  );
  const total = totals.high + totals.medium + totals.low + totals.lost;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold text-card-foreground">Lead Quality Distribution</h3>
      <p className="text-[11px] text-muted-foreground mt-0.5 mb-5">Across all campaigns</p>

      {/* Stacked bar */}
      <div className="flex h-3 rounded-full overflow-hidden mb-5">
        {(Object.keys(qualityColors) as Array<keyof typeof qualityColors>).map((key) => (
          <div
            key={key}
            className={cn(qualityColors[key])}
            style={{ width: `${(totals[key] / total) * 100}%` }}
          />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {(Object.keys(qualityColors) as Array<keyof typeof qualityColors>).map((key) => (
          <div key={key} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <div className={cn("h-2.5 w-2.5 rounded-full shrink-0", qualityColors[key])} />
            <span className="text-[11px] text-muted-foreground">{qualityLabels[key]}</span>
            <span className="text-xs font-mono font-semibold text-card-foreground ml-auto">{totals[key]}</span>
            <span className="text-[10px] text-muted-foreground">({((totals[key] / total) * 100).toFixed(0)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}
