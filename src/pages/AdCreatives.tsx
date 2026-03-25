import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Pen, Video, Search, ArrowRight, Loader2, Copy, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type AdSection = null | "ad_copy" | "ugc_video" | "competitor";

interface AdCopyResult {
  headline: string;
  primary_text: string;
  description: string;
  cta: string;
}

const AdCreatives = () => {
  const [section, setSection] = useState<AdSection>(null);
  const [product, setProduct] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState("professional");
  const [platform, setPlatform] = useState("Facebook");
  const [genType, setGenType] = useState<"headlines" | "ad_copy" | "image_prompts">("headlines");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const { toast } = useToast();

  const generate = async () => {
    if (!product.trim()) {
      toast({ title: "Required", description: "Enter your product or service.", variant: "destructive" });
      return;
    }
    setLoading(true);
    setResults(null);
    try {
      const { data, error } = await supabase.functions.invoke("generate-ad-copy", {
        body: { type: genType, product, audience, tone, platform, count: genType === "headlines" ? 5 : 3 },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResults(data?.results || []);
    } catch (err: any) {
      toast({ title: "Generation Failed", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Copied to clipboard." });
  };

  if (section === "ad_copy") {
    return (
      <DashboardLayout
        title="Ad Copy & Images"
        subtitle="Generate headlines, ad copy, and images using AI"
        actions={
          <Button variant="ghost" size="sm" onClick={() => { setSection(null); setResults(null); }} className="gap-1.5">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Button>
        }
      >
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Generation type tabs */}
          <div className="flex rounded-lg border border-border overflow-hidden">
            {([
              { key: "headlines", label: "Headlines" },
              { key: "ad_copy", label: "Ad Copy" },
              { key: "image_prompts", label: "Images" },
            ] as const).map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setGenType(tab.key); setResults(null); }}
                className={cn(
                  "flex-1 px-4 py-2.5 text-sm font-medium transition-colors",
                  genType === tab.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:bg-muted"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Input form */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Product / Service *</label>
                <Input
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  placeholder="e.g., College admissions consulting for high school students"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Target Audience</label>
                <Input
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="e.g., Parents of high school juniors and seniors"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Tone</label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="inspirational">Inspirational</SelectItem>
                      <SelectItem value="humorous">Humorous</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Platform</label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Facebook">Facebook</SelectItem>
                      <SelectItem value="Instagram">Instagram</SelectItem>
                      <SelectItem value="TikTok">TikTok</SelectItem>
                      <SelectItem value="Google">Google</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={generate} disabled={loading} className="w-full gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pen className="h-4 w-4" />}
                {loading ? "Generating..." : "Generate"}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {results && results.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">
                Generated {genType === "headlines" ? "Headlines" : genType === "ad_copy" ? "Ad Copy" : "Image Prompts"} ({results.length})
              </h3>
              {genType === "headlines" ? (
                <div className="space-y-2">
                  {results.map((h: string, i: number) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
                      <p className="text-sm text-foreground">{h}</p>
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => copyToClipboard(h)}>
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : genType === "ad_copy" ? (
                <div className="space-y-4">
                  {results.map((r: AdCopyResult, i: number) => (
                    <Card key={i}>
                      <CardContent className="pt-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{r.headline}</p>
                            <p className="text-xs text-muted-foreground mt-1">{r.primary_text}</p>
                          </div>
                          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => copyToClipboard(`${r.headline}\n\n${r.primary_text}\n\n${r.description}\n\nCTA: ${r.cta}`)}>
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground italic">{r.description}</p>
                        <Badge variant="outline" className="text-[10px]">{r.cta}</Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {results.map((r: any, i: number) => (
                    <Card key={i}>
                      <CardContent className="pt-4 space-y-1">
                        <p className="text-sm text-foreground">{r.prompt}</p>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-[10px]">{r.style}</Badge>
                          <Badge variant="outline" className="text-[10px]">{r.aspect_ratio}</Badge>
                        </div>
                        <Button variant="ghost" size="sm" className="gap-1 text-xs mt-1" onClick={() => copyToClipboard(r.prompt)}>
                          <Copy className="h-3 w-3" /> Copy Prompt
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  // Landing page with 3 cards
  return (
    <DashboardLayout title="Ad Creatives" subtitle="Create ads or find inspiration from competitors">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl">
        {/* Ad copy & images */}
        <Card className="group cursor-pointer hover:border-primary/40 transition-colors" onClick={() => setSection("ad_copy")}>
          <CardContent className="pt-6 space-y-3">
            <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <Pen className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Ad copy & images</h3>
              <p className="text-xs text-muted-foreground mt-1">Generate headlines, ad copy, and images using AI</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="outline" className="text-[10px]">Headlines</Badge>
              <Badge variant="outline" className="text-[10px]">Ad copy</Badge>
              <Badge variant="outline" className="text-[10px]">Images</Badge>
            </div>
            <button className="text-xs text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
              Start creating <ArrowRight className="h-3 w-3" />
            </button>
          </CardContent>
        </Card>

        {/* UGC Video Ads */}
        <Card className="group cursor-pointer hover:border-primary/40 transition-colors" onClick={() => setSection("ugc_video")}>
          <CardContent className="pt-6 space-y-3">
            <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Video className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">UGC video ads</h3>
              <p className="text-xs text-muted-foreground mt-1">Create video ads with AI avatars and voices</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="outline" className="text-[10px]">Script generation</Badge>
              <Badge variant="outline" className="text-[10px]">AI avatars</Badge>
              <Badge variant="outline" className="text-[10px]">Voices</Badge>
            </div>
            <button className="text-xs text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
              Create video <ArrowRight className="h-3 w-3" />
            </button>
          </CardContent>
        </Card>

        {/* Competitor Ads */}
        <Card className="group cursor-pointer hover:border-primary/40 transition-colors" onClick={() => setSection("competitor")}>
          <CardContent className="pt-6 space-y-3">
            <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center">
              <Search className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Competitor ads</h3>
              <p className="text-xs text-muted-foreground mt-1">Search 100M+ ads to find winning creatives</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="outline" className="text-[10px]">Facebook</Badge>
              <Badge variant="outline" className="text-[10px]">Instagram</Badge>
              <Badge variant="outline" className="text-[10px]">TikTok</Badge>
            </div>
            <button className="text-xs text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
              Browse ads <ArrowRight className="h-3 w-3" />
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Coming soon placeholders for UGC and Competitor */}
      {section === "ugc_video" && (
        <div className="mt-8 rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
          <Video className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">UGC Video Ads — Coming Soon</p>
          <p className="text-xs text-muted-foreground mt-1">AI-generated video ads with avatars and voiceovers are in development.</p>
          <Button variant="ghost" size="sm" className="mt-4" onClick={() => setSection(null)}>Back</Button>
        </div>
      )}
      {section === "competitor" && (
        <div className="mt-8 rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
          <Search className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">Competitor Ads — Coming Soon</p>
          <p className="text-xs text-muted-foreground mt-1">Browse and analyze competitor ad creatives across platforms.</p>
          <Button variant="ghost" size="sm" className="mt-4" onClick={() => setSection(null)}>Back</Button>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdCreatives;
