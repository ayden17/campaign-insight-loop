import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SettingsPage = () => {
  const [slackConnecting, setSlackConnecting] = useState(false);
  const { toast } = useToast();

  const handleSlackConnect = async () => {
    setSlackConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke("slack-oauth-start");
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      toast({
        title: "Slack Connection Error",
        description: err.message || "Failed to start Slack OAuth flow",
        variant: "destructive",
      });
    }
    setSlackConnecting(false);
  };

  return (
    <DashboardLayout title="Settings" subtitle="Workspace and account settings">
      <div className="max-w-2xl space-y-6">
        {/* Workspace */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-sm font-semibold text-card-foreground mb-1">Workspace</h3>
          <p className="text-[11px] text-muted-foreground mb-4">Manage your workspace name and team.</p>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="workspace-name" className="text-xs">Workspace Name</Label>
              <Input id="workspace-name" defaultValue="My Workspace" className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="workspace-url" className="text-xs">Workspace URL</Label>
              <Input id="workspace-url" defaultValue="my-workspace" className="h-9 text-sm" disabled />
            </div>
            <Button size="sm" className="text-xs">Save Changes</Button>
          </div>
        </div>

        {/* Slack Integration */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-sm font-semibold text-card-foreground mb-1">Slack Integration</h3>
          <p className="text-[11px] text-muted-foreground mb-4">
            Connect your Slack workspace to receive lead alerts and post updates.
          </p>
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Uses OAuth 2.0 to securely connect your Slack workspace. Your bot will be able to post
              to channels and send notifications about leads and campaigns.
            </p>
            <Button
              onClick={handleSlackConnect}
              disabled={slackConnecting}
              variant="outline"
              className="gap-2 text-xs"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {slackConnecting ? "Connecting..." : "Add to Slack"}
            </Button>
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-sm font-semibold text-card-foreground mb-1">Notifications</h3>
          <p className="text-[11px] text-muted-foreground mb-4">Configure email and in-app notification preferences.</p>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-card-foreground">Campaign Alerts</p>
                <p className="text-[11px] text-muted-foreground">Get notified when a campaign needs attention</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-card-foreground">Lead Quality Reports</p>
                <p className="text-[11px] text-muted-foreground">Weekly summary of lead quality metrics</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-card-foreground">Budget Alerts</p>
                <p className="text-[11px] text-muted-foreground">Alert when spend exceeds threshold</p>
              </div>
              <Switch />
            </div>
          </div>
        </div>

        {/* Data & Privacy */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-sm font-semibold text-card-foreground mb-1">Data & Privacy</h3>
          <p className="text-[11px] text-muted-foreground mb-4">Export your data or manage data retention policies.</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-card-foreground">Export All Data</p>
                <p className="text-[11px] text-muted-foreground">Download campaigns, leads, and analytics as CSV</p>
              </div>
              <Button variant="outline" size="sm" className="text-xs">Export</Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-card-foreground">Data Retention</p>
                <p className="text-[11px] text-muted-foreground">Keep data for 12 months (default)</p>
              </div>
              <select className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
                <option>12 months</option>
                <option>6 months</option>
                <option>24 months</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
