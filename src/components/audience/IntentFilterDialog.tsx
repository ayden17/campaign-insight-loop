import { useState } from "react";
import { FilterDialogWrapper } from "./FilterDialogWrapper";
import { TagInput } from "./TagInput";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type AudienceMethod = "premade" | "keyword" | "custom";
type IntentScore = "low" | "medium" | "high";

export interface IntentFilters {
  method: AudienceMethod;
  keywords: string[];
  intentScore: IntentScore;
  aiPrompt: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: IntentFilters;
  onChange: (filters: IntentFilters) => void;
}

export function IntentFilterDialog({ open, onOpenChange, filters, onChange }: Props) {
  const [generating, setGenerating] = useState(false);
  const [generatedKeywords, setGeneratedKeywords] = useState<string[]>([]);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!filters.aiPrompt.trim()) return;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("prospect-search", {
        body: {
          action: "generate_keywords",
          prompt: filters.aiPrompt,
        },
      });
      if (error) throw error;
      const kws: string[] = data?.keywords || [];
      setGeneratedKeywords(kws);
      // Auto-add to keywords
      const merged = [...new Set([...filters.keywords, ...kws])];
      onChange({ ...filters, keywords: merged });
      toast({ title: "Keywords Generated", description: `${kws.length} keywords added to your selection.` });
    } catch (err: any) {
      toast({ title: "Generation Error", description: err.message, variant: "destructive" });
    }
    setGenerating(false);
  };

  const reset = () => {
    onChange({ method: "keyword", keywords: [], intentScore: "medium", aiPrompt: "" });
    setGeneratedKeywords([]);
  };

  return (
    <FilterDialogWrapper
      open={open}
      onOpenChange={onOpenChange}
      icon={<SlidersHorizontal className="h-5 w-5" />}
      title="Intent"
      description="Build your core target audience."
      onReset={reset}
      onContinue={() => onOpenChange(false)}
    >
      {/* Audience Method */}
      <div className="space-y-2">
        <Label className="font-semibold">Audience Method</Label>
        <p className="text-sm text-muted-foreground">Select the method you want to use to create your audience.</p>
        <div className="flex gap-2">
          {(["premade", "keyword", "custom"] as AudienceMethod[]).map(m => (
            <Button
              key={m}
              variant={filters.method === m ? "default" : "outline"}
              size="sm"
              onClick={() => onChange({ ...filters, method: m })}
              className="capitalize"
            >
              {m}
            </Button>
          ))}
        </div>
      </div>

      {/* Keywords */}
      <div className="space-y-2">
        <Label className="font-semibold">What interests does your audience have?</Label>
        <p className="text-sm text-muted-foreground">Build your own audience based on search terms.</p>
        <TagInput
          tags={filters.keywords}
          onChange={kws => onChange({ ...filters, keywords: kws })}
        />
      </div>

      {/* AI Generator */}
      <div className="space-y-2">
        <Label className="font-semibold flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          AI Intent Keyword Generator
        </Label>
        <p className="text-sm text-muted-foreground">Describe your audience intent</p>
        <Textarea
          placeholder="Describe your audience intent to generate relevant keywords..."
          value={filters.aiPrompt}
          onChange={e => onChange({ ...filters, aiPrompt: e.target.value })}
          rows={3}
        />
        <div className="flex justify-end">
          <Button onClick={handleGenerate} disabled={generating || !filters.aiPrompt.trim()} className="gap-1.5">
            <Sparkles className="h-4 w-4" />
            {generating ? "Generating..." : "Generate"}
          </Button>
        </div>
        {generatedKeywords.length > 0 && (
          <div className="rounded-md border border-border bg-muted/30 p-3 space-y-1">
            <p className="text-sm font-medium">Generated Keywords ({generatedKeywords.length}) - Added to your selection</p>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <span>✅</span> All keywords have been automatically added to your audience selection above
            </div>
          </div>
        )}
      </div>

      {/* Minimum Score */}
      <div className="space-y-2">
        <Label className="font-semibold">Minimum Score</Label>
        <p className="text-sm text-muted-foreground">Set the intent score for your audience.</p>
        <div className="flex gap-2">
          {(["low", "medium", "high"] as IntentScore[]).map(s => (
            <Button
              key={s}
              variant={filters.intentScore === s ? "default" : "outline"}
              size="sm"
              onClick={() => onChange({ ...filters, intentScore: s })}
              className="capitalize"
            >
              {s}
            </Button>
          ))}
        </div>
      </div>
    </FilterDialogWrapper>
  );
}
