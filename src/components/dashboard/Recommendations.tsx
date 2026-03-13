import { campaigns, getRecommendationText, type Recommendation } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { ArrowUpRight, Pause, FlaskConical, ArrowRight } from "lucide-react";

const recMeta: Record<Recommendation, { icon: typeof ArrowUpRight; color: string; bgColor: string; detail: string }> = {
  increase_budget: {
    icon: ArrowUpRight,
    color: "text-success",
    bgColor: "bg-success/5 border-success/20",
    detail: "Strong lead quality and ROAS. Consider increasing daily budget by 20–30%.",
  },
  pause: {
    icon: Pause,
    color: "text-destructive",
    bgColor: "bg-destructive/5 border-destructive/20",
    detail: "Low qualified lead rate and poor ROAS. Recommend pausing and reallocating budget.",
  },
  test_creative: {
    icon: FlaskConical,
    color: "text-warning",
    bgColor: "bg-warning/5 border-warning/20",
    detail: "Decent reach but low qualification rate. Test new ad creatives and copy.",
  },
  maintain: {
    icon: ArrowRight,
    color: "text-muted-foreground",
    bgColor: "bg-muted border-border",
    detail: "Performance is stable. Maintain current settings and monitor.",
  },
};

export function Recommendations() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold text-card-foreground">Optimization Recommendations</h3>
      <p className="text-[11px] text-muted-foreground mt-0.5 mb-4">Rule-based suggestions from lead quality feedback</p>
      <div className="space-y-2.5">
        {campaigns.map((c) => {
          const meta = recMeta[c.recommendation];
          const Icon = meta.icon;
          return (
            <div key={c.id} className={cn("rounded-lg border p-3.5", meta.bgColor)}>
              <div className="flex items-start gap-3">
                <div className={cn("mt-0.5 rounded-lg bg-background p-1.5", meta.color)}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-card-foreground truncate">{c.name}</span>
                    <span className={cn("text-[11px] font-semibold shrink-0", meta.color)}>
                      {getRecommendationText(c.recommendation)}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">{meta.detail}</p>
                  <div className="flex gap-4 mt-2 text-[10px] font-mono text-muted-foreground">
                    <span>Leads: {c.leads}</span>
                    <span>High: {c.leadQuality.high}</span>
                    <span>Low: {c.leadQuality.low}</span>
                    <span>ROAS: {c.roas}x</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
