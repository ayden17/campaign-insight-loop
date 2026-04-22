import { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Play, Phone, Mail, Plus, Webhook, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface LiveLead {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: "New" | "Contacted" | "Qualified" | "Converted" | "Lost";
  recordingUrl?: string;
  createdAt: string;
}

const statusStyle: Record<LiveLead["status"], string> = {
  New: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  Contacted: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  Qualified: "bg-blue-500/15 text-blue-600 border-blue-500/30",
  Converted: "bg-violet-500/15 text-violet-600 border-violet-500/30",
  Lost: "bg-red-500/15 text-red-600 border-red-500/30",
};

const seedLeads: LiveLead[] = [
  { id: "1", name: "Marcus Greene", phone: "+1 (415) 555-0173", email: "marcus.greene@gmail.com", status: "New", recordingUrl: "#", createdAt: new Date().toISOString() },
  { id: "2", name: "Priya Shankar", phone: "+1 (646) 555-0148", email: "priya.s@protonmail.com", status: "Contacted", recordingUrl: "#", createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString() },
  { id: "3", name: "Jordan Mills", phone: "+1 (213) 555-0192", email: "jmills@outlook.com", status: "Qualified", recordingUrl: "#", createdAt: new Date(Date.now() - 1000 * 60 * 41).toISOString() },
  { id: "4", name: "Aaliyah Bennett", phone: "+1 (305) 555-0117", email: "aaliyah.b@yahoo.com", status: "Converted", recordingUrl: "#", createdAt: new Date(Date.now() - 1000 * 60 * 88).toISOString() },
  { id: "5", name: "Tomás Fischer", phone: "+1 (708) 555-0166", email: "tomas.fischer@me.com", status: "New", recordingUrl: "#", createdAt: new Date(Date.now() - 1000 * 60 * 132).toISOString() },
];

const STORAGE_KEY = "angelflows_live_leads_webhook";

export function LiveLeadsTable() {
  const { toast } = useToast();
  const [leads, setLeads] = useState<LiveLead[]>(seedLeads);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setWebhookUrl(saved);
  }, []);

  const saveWebhook = () => {
    localStorage.setItem(STORAGE_KEY, webhookUrl.trim());
    setOpen(false);
    toast({ title: "Webhook saved", description: "New leads posted to this URL will appear here in real time." });
  };

  const copyExample = () => {
    const example = `curl -X POST -H 'Content-type: application/json' --data '{"name":"Jane Doe","phone":"+15551234567","email":"jane@example.com","status":"New"}' ${webhookUrl || "<YOUR_WEBHOOK_URL>"}`;
    navigator.clipboard.writeText(example);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const playRecording = (lead: LiveLead) => {
    if (!lead.recordingUrl || lead.recordingUrl === "#") {
      toast({ title: "No recording yet", description: `${lead.name} hasn't been called yet.` });
      return;
    }
    window.open(lead.recordingUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <h3 className="text-lg font-semibold text-foreground">Live Leads</h3>
          <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">Real-time</Badge>
        </div>
        <Button size="sm" variant="outline" onClick={() => setOpen(true)} className="gap-1.5">
          <Webhook className="h-4 w-4" />
          {webhookUrl ? "Edit Webhook" : "Connect Webhook"}
        </Button>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Name</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Phone Number</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Email</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Status</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide w-40">Call Recording</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground text-sm">
                  No live leads yet. Connect your webhook to start receiving leads.
                </TableCell>
              </TableRow>
            ) : (
              leads.map((l) => (
                <TableRow key={l.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium text-sm text-foreground">{l.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <a href={`tel:${l.phone}`} className="inline-flex items-center gap-1.5 hover:text-foreground">
                      <Phone className="h-3.5 w-3.5" /> {l.phone}
                    </a>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <a href={`mailto:${l.email}`} className="inline-flex items-center gap-1.5 hover:text-foreground">
                      <Mail className="h-3.5 w-3.5" /> {l.email}
                    </a>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(statusStyle[l.status])}>
                      {l.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => playRecording(l)}
                      className="gap-1.5 h-8 text-xs"
                    >
                      <Play className="h-3.5 w-3.5" /> Play
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Webhook className="h-5 w-5" /> Connect Live Leads Webhook
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Webhook URL</Label>
              <Input
                placeholder="https://hooks.slack.com/services/..."
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                POST JSON payloads to this URL to dispatch new leads. Each payload should include <code className="text-foreground">name</code>, <code className="text-foreground">phone</code>, <code className="text-foreground">email</code>, and <code className="text-foreground">status</code>.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Sample cURL</Label>
              <div className="relative rounded-md border border-border bg-muted/40 p-3 font-mono text-[11px] text-foreground overflow-x-auto">
                <pre className="whitespace-pre-wrap break-all">{`curl -X POST -H 'Content-type: application/json' \\
  --data '{"name":"Jane Doe","phone":"+15551234567","email":"jane@example.com","status":"New"}' \\
  ${webhookUrl || "<YOUR_WEBHOOK_URL>"}`}</pre>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={copyExample}
                  className="absolute top-1.5 right-1.5 h-7 w-7"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={saveWebhook} disabled={!webhookUrl.trim()}>Save Webhook</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}