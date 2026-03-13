import { funnelData } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const stageInfo: Record<string, { label: string; color: string; desc: string }> = {
  TOF: { label: "Top of Funnel", color: "bg-info", desc: "Cold traffic & awareness" },
  MOF: { label: "Middle of Funnel", color: "bg-warning", desc: "Retargeting & engagement" },
  BOF: { label: "Bottom of Funnel", color: "bg-success", desc: "Conversion & intent" },
};

export function FunnelBreakdown() {
  const maxLeads = Math.max(...funnelData.map((d) => d.leads));

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold text-card-foreground">Funnel Breakdown</h3>
      <p className="text-[11px] text-muted-foreground mt-0.5 mb-5">Campaign distribution across funnel stages</p>
      <div className="space-y-5">
        {funnelData.map((d) => {
          const info = stageInfo[d.stage];
          const width = (d.leads / maxLeads) * 100;
          return (
            <div key={d.stage}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={cn("h-2.5 w-2.5 rounded-full", info.color)} />
                  <span className="text-sm font-medium text-card-foreground">{info.label}</span>
                  <span className="text-[11px] text-muted-foreground">({d.campaigns})</span>
                </div>
                <span className="text-[11px] font-mono font-medium text-card-foreground">{d.qualifiedRate}% qualified</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-700", info.color)}
                    style={{ width: `${width}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-muted-foreground w-20 text-right">{d.leads} leads</span>
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-[10px] text-muted-foreground">{info.desc}</span>
                <span className="text-[10px] font-mono text-muted-foreground">${d.spend.toLocaleString()}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
