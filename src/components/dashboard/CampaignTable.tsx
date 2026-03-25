import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import type { MetaCampaign, CampaignInsights } from "@/lib/meta-ads-store";

function StatusBadge({ status }: { status: string }) {
  const isActive = status === "ACTIVE";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-semibold border",
        isActive
          ? "bg-success/15 text-success border-success/30"
          : "bg-muted text-muted-foreground border-border"
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          isActive ? "bg-success" : "bg-muted-foreground/40"
        )}
      />
      {status}
    </span>
  );
}

interface CampaignTableProps {
  metaCampaigns: MetaCampaign[];
  metaInsights: Record<string, CampaignInsights>;
  loading: boolean;
  currency?: string;
}

export function CampaignTable({ metaCampaigns, metaInsights, loading, currency = "USD" }: CampaignTableProps) {
  const formatCurrency = (value: string) => {
    try {
      return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(Number(value));
    } catch {
      return `$${Number(value).toFixed(2)}`;
    }
  };
  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 flex items-center justify-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading campaigns…</span>
      </div>
    );
  }

  if (metaCampaigns.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <p className="text-sm text-muted-foreground">No campaigns found for this ad account.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-card-foreground">Campaign Performance</h3>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {metaCampaigns.length} campaigns from Meta Ads
        </p>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-[11px] font-semibold uppercase tracking-wide">Campaign</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wide">Objective</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wide">Status</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-right">Impressions</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-right">Clicks</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-right">Spend</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {metaCampaigns.map((c) => {
              const ins = metaInsights[c.id];
              return (
                <TableRow key={c.id}>
                  <TableCell>
                    <span className="text-sm font-medium text-card-foreground max-w-[280px] truncate block">
                      {c.name}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">{c.objective || "—"}</span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={c.effective_status} />
                  </TableCell>
                  <TableCell className="text-right text-sm font-mono text-card-foreground">
                    {ins ? Number(ins.impressions).toLocaleString() : "—"}
                  </TableCell>
                  <TableCell className="text-right text-sm font-mono text-card-foreground">
                    {ins ? Number(ins.clicks).toLocaleString() : "—"}
                  </TableCell>
                  <TableCell className="text-right text-sm font-mono text-card-foreground">
                    {ins ? `$${Number(ins.spend).toFixed(2)}` : "—"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
