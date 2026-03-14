import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const OBJECTIVES = [
  { value: "OUTCOME_TRAFFIC", label: "Traffic" },
  { value: "OUTCOME_ENGAGEMENT", label: "Engagement" },
  { value: "OUTCOME_LEADS", label: "Leads" },
  { value: "OUTCOME_AWARENESS", label: "Awareness" },
  { value: "OUTCOME_SALES", label: "Sales" },
  { value: "OUTCOME_APP_PROMOTION", label: "App Promotion" },
];

interface Props {
  adAccountId: string;
  accessToken: string;
  onCreated: () => void;
}

export function CreateCampaignDialog({ adAccountId, accessToken, onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [objective, setObjective] = useState("OUTCOME_TRAFFIC");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCreate = () => {
    if (!name.trim() || !window.FB) return;
    setLoading(true);

    window.FB.api(
      `/${adAccountId}/campaigns`,
      "POST",
      {
        name: name.trim(),
        objective,
        status: "PAUSED",
        special_ad_categories: "[]",
        access_token: accessToken,
      } as any,
      (res: any) => {
        setLoading(false);
        if (res?.id) {
          toast({ title: "Campaign Created", description: `Campaign "${name}" created successfully.` });
          setName("");
          setOpen(false);
          onCreated();
        } else {
          const errMsg = res?.error?.message || "Failed to create campaign";
          console.error("Campaign create error:", res);
          toast({ title: "Error", description: errMsg, variant: "destructive" });
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> New Campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Ad Campaign</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="campaign-name">Campaign Name</Label>
            <Input id="campaign-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="My Campaign" />
          </div>
          <div className="space-y-2">
            <Label>Objective</Label>
            <Select value={objective} onValueChange={setObjective}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {OBJECTIVES.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-[11px] text-muted-foreground">Campaign will be created in <strong>PAUSED</strong> status.</p>
          <Button onClick={handleCreate} disabled={!name.trim() || loading} className="w-full gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Create Campaign
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
