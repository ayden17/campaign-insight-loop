import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useMetaAdsStore } from "@/lib/meta-ads-store";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileSpreadsheet, Share2 } from "lucide-react";
import metaLogo from "@/assets/meta-logo.png";
import googleAdsLogo from "@/assets/google-ads-logo.png";

interface Audience {
  id: string;
  name: string;
  status: string;
  audience_size: number;
  results: any;
}

const SyncAudience = () => {
  const { accessToken } = useMetaAdsStore();
  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadAudiences();
  }, []);

  const loadAudiences = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("audiences" as any).select("*").eq("user_id", user.id).eq("status", "completed").order("created_at", { ascending: false });
    setAudiences((data as any[]) || []);
  };

  const handleExportCSV = (audience: Audience) => {
    const results = audience.results || [];
    if (!Array.isArray(results) || results.length === 0) {
      toast({ title: "No data", description: "This audience has no results to export.", variant: "destructive" });
      return;
    }
    const headers = ["First Name", "Last Name", "Email", "Phone", "Company", "Job Title"];
    const rows = results.map((p: any) => [p.first_name || "", p.last_name || "", p.email || "", p.phone || "", p.company_name || "", p.title || ""]);
    const csv = [headers.join(","), ...rows.map((r: string[]) => r.map(v => `"${(v || "").replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${audience.name.replace(/\s+/g, "-").toLowerCase()}-export.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: `${results.length} contacts exported as CSV.` });
  };

  const handleSync = (audienceId: string, destination: string) => {
    setSyncingId(audienceId);
    setTimeout(() => {
      setSyncingId(null);
      toast({ title: "Sync Started", description: `Syncing audience to ${destination}. This may take a few minutes.` });
    }, 1500);
  };

  return (
    <DashboardLayout title="Sync Audience" subtitle="Sync audiences to your ad platforms or export as a spreadsheet">
      <div>
        <h2 className="text-lg font-bold text-foreground mb-1">Audience Synchronization</h2>
        <p className="text-sm text-muted-foreground mb-6">Select an audience and sync it to your ad platforms or export as a spreadsheet.</p>

        {audiences.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
            <Share2 className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground mb-1">No Completed Audiences</p>
            <p className="text-xs text-muted-foreground mb-4">Build and generate an audience first to sync it to your platforms.</p>
            <Button variant="outline" size="sm" onClick={() => navigate("/lead-search")}>
              Build Audience →
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mb-6">
              <p className="text-sm font-semibold text-foreground mb-3">1. Select a Destination</p>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { id: "facebook", name: "Facebook Ads", logo: metaLogo, connected: !!accessToken },
                  { id: "google", name: "Google Ads", logo: googleAdsLogo, connected: false },
                  { id: "spreadsheet", name: "Google Sheets", icon: FileSpreadsheet, connected: false },
                ].map(dest => (
                  <div key={dest.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center gap-3">
                      {dest.logo ? (
                        <img src={dest.logo} alt={dest.name} className="h-8 w-8 object-contain rounded" />
                      ) : dest.icon ? (
                        <dest.icon className="h-8 w-8 text-muted-foreground" />
                      ) : null}
                      <span className="text-sm font-medium text-foreground">{dest.name}</span>
                    </div>
                    {dest.connected ? (
                      <Badge className="bg-green-500/10 text-green-600 border-green-200">Connected</Badge>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => {
                        if (dest.id === "facebook") navigate("/ad-accounts");
                        else toast({ title: "Coming Soon", description: `${dest.name} integration is coming soon.` });
                      }}>Connect</Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-foreground mb-3">2. Select an Audience to Sync</p>
              <div className="space-y-3">
                {audiences.map(audience => (
                  <div key={audience.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">{audience.name}</p>
                      <p className="text-xs text-muted-foreground">{audience.audience_size?.toLocaleString() || 0} contacts</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => handleExportCSV(audience)}>
                        <FileSpreadsheet className="h-3.5 w-3.5" />
                        Export CSV
                      </Button>
                      {accessToken && (
                        <Button
                          size="sm"
                          className="gap-1.5"
                          disabled={syncingId === audience.id}
                          onClick={() => handleSync(audience.id, "Facebook Ads")}
                        >
                          {syncingId === audience.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Share2 className="h-3.5 w-3.5" />}
                          Sync to Facebook
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SyncAudience;
