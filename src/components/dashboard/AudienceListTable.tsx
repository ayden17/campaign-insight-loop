import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, ExternalLink, Download, Link2 } from "lucide-react";

interface AudienceList {
  name: string;
  status: "Completed" | "Processing" | "Queued";
  created: string;
  lastRefreshed: string;
  size: number;
  refreshCount: number;
  nextRefresh?: string;
}

const demoAudiences: AudienceList[] = [
  {
    name: "Personal Injury Lawyer B2B2C List (large)",
    status: "Completed",
    created: "Dec 24 2025, 3:32 AM",
    lastRefreshed: "Dec 24 2025, 3:41 AM",
    size: 25818,
    refreshCount: 0,
  },
  {
    name: "Personal Injury Lawyer Leads",
    status: "Completed",
    created: "Dec 22 2025, 9:16 AM",
    lastRefreshed: "Dec 23 2025, 7:56 AM",
    size: 2432,
    refreshCount: 1,
  },
  {
    name: "Construction Company Owners",
    status: "Completed",
    created: "Dec 20 2025, 3:56 PM",
    lastRefreshed: "Dec 20 2025, 4:06 PM",
    size: 22775,
    refreshCount: 0,
    nextRefresh: "Jan 13 2026, 3:00 PM",
  },
  {
    name: "B2B SaaS Companies Offering AI Agent Solutions",
    status: "Completed",
    created: "Dec 18 2025, 7:56 AM",
    lastRefreshed: "Dec 18 2025, 8:08 AM",
    size: 726,
    refreshCount: 0,
  },
  {
    name: "Casino Owners",
    status: "Completed",
    created: "Dec 14 2025, 7:21 AM",
    lastRefreshed: "Dec 14 2025, 7:51 AM",
    size: 267,
    refreshCount: 0,
  },
];

const statusColor: Record<string, string> = {
  Completed: "bg-success/15 text-success border-success/30",
  Processing: "bg-warning/15 text-warning border-warning/30",
  Queued: "bg-muted text-muted-foreground border-border",
};

export function AudienceListTable() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Audience Lists</h3>
        <Button size="sm" className="gap-1.5">
          Create
        </Button>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Name</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Status</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Created</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Last Refreshed</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-right">Audience Size</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-right">Refresh Count</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Next Refresh</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide w-28">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {demoAudiences.map((a) => (
              <TableRow key={a.name} className="hover:bg-muted/30">
                <TableCell className="font-medium text-sm text-foreground">{a.name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusColor[a.status]}>
                    {a.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{a.created}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{a.lastRefreshed}</TableCell>
                <TableCell className="text-sm text-foreground text-right font-medium">
                  {a.size.toLocaleString()}
                </TableCell>
                <TableCell className="text-sm text-foreground text-right">{a.refreshCount}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{a.nextRefresh || "—"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7"><RefreshCw className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7"><ExternalLink className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7"><Download className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7"><Link2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
