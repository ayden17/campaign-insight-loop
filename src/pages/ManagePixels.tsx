import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Plus, Globe, Copy, Check, Trash2, ExternalLink } from "lucide-react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export default function ManagePixels() {
  const { toast } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [step, setStep] = useState(1);
  const [websiteName, setWebsiteName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [createdPixelId, setCreatedPixelId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: pixels, refetch } = useQuery({
    queryKey: ["pixels"],
    queryFn: async () => {
      const { data } = await supabase.from("pixels").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const handleCreate = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("pixels")
      .insert({ user_id: user.id, website_name: websiteName, website_url: websiteUrl, webhook_url: webhookUrl || null })
      .select("id")
      .single();

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setCreatedPixelId(data.id);
    setStep(3);
    refetch();
  };

  const scriptTag = createdPixelId
    ? `<script src="${SUPABASE_URL}/functions/v1/pixel-script/${createdPixelId}" async></script>`
    : "";

  const copyScript = () => {
    navigator.clipboard.writeText(scriptTag);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied!", description: "Pixel script copied to clipboard." });
  };

  const handleDelete = async (id: string) => {
    await supabase.from("pixels").delete().eq("id", id);
    refetch();
    toast({ title: "Deleted", description: "Pixel removed." });
  };

  const resetModal = () => {
    setShowCreate(false);
    setStep(1);
    setWebsiteName("");
    setWebsiteUrl("");
    setWebhookUrl("");
    setCreatedPixelId(null);
    setCopied(false);
  };

  return (
    <DashboardLayout title="Manage Pixels" subtitle="Create and manage website tracking pixels">
      <div className="flex justify-end mb-6">
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-2" /> Create Pixel
        </Button>
      </div>

      {/* Pixel list */}
      <div className="space-y-3">
        {pixels?.map((px: any) => (
          <Card key={px.id}>
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">{px.website_name}</p>
                  <p className="text-sm text-muted-foreground">{px.website_url}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={px.is_active ? "default" : "secondary"}>
                  {px.is_active ? "Active" : "Inactive"}
                </Badge>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(px.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {pixels?.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No pixels created yet. Click "Create Pixel" to get started.
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Pixel Dialog */}
      <Dialog open={showCreate} onOpenChange={(o) => !o && resetModal()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Pixel</DialogTitle>
          </DialogHeader>

          {/* Steps indicator */}
          <div className="flex items-center justify-center gap-0 mb-6">
            {[
              { n: 1, label: "Pixel Details" },
              { n: 2, label: "Webhook" },
              { n: 3, label: "Install" },
            ].map((s, i) => (
              <div key={s.n} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      step >= s.n ? "bg-foreground text-background" : "border border-border text-muted-foreground"
                    }`}
                  >
                    {s.n}
                  </div>
                  <span className="text-sm font-medium text-foreground">{s.label}</span>
                </div>
                {i < 2 && <div className="w-12 h-px bg-border mx-2" />}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label>Website Name</Label>
                <Input placeholder="My Website" value={websiteName} onChange={(e) => setWebsiteName(e.target.value)} />
              </div>
              <div>
                <Label>Website URL</Label>
                <Input placeholder="https://example.com" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} />
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setStep(2)} disabled={!websiteName || !websiteUrl}>
                  Next →
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label>Webhook URL (optional)</Label>
                <Input placeholder="https://your-webhook.com/events" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} />
                <p className="text-xs text-muted-foreground mt-1">
                  Optionally send visitor events to an external webhook.
                </p>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  ← Back
                </Button>
                <Button onClick={handleCreate}>
                  Next →
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Choose your installation method below.
              </p>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Basic Pixel Installation</h4>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside mb-3">
                  <li>
                    Insert this script into the <code className="bg-muted px-1 rounded text-xs">&lt;head&gt;</code> block before{" "}
                    <code className="bg-muted px-1 rounded text-xs">&lt;/head&gt;</code> on all pages.
                  </li>
                  <li>Save changes and test using browser developer tools (Network tab).</li>
                </ol>
                <div className="relative bg-muted rounded-lg p-4">
                  <pre className="text-xs text-foreground whitespace-pre-wrap break-all font-mono">{scriptTag}</pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={copyScript}
                  >
                    {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={resetModal}>Finish</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
