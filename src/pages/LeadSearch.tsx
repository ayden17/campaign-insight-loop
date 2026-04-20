import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Loader2, Download, ExternalLink, Save, SlidersHorizontal, Calendar, Briefcase, DollarSign, UserCheck, Home, MapPin, AtSign, Plus, RefreshCw, Link2, ArrowLeft, Building2, Globe, Linkedin, Lock, Users, Sparkles, User as UserIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { IntentFilterDialog, type IntentFilters } from "@/components/audience/IntentFilterDialog";
import { BusinessFilterDialog, type BusinessFilters } from "@/components/audience/BusinessFilterDialog";
import { LocationFilterDialog, type LocationFilters } from "@/components/audience/LocationFilterDialog";
import { PersonalFilterDialog, type PersonalFilters } from "@/components/audience/PersonalFilterDialog";
import { FinancialFilterDialog, type FinancialFilters } from "@/components/audience/FinancialFilterDialog";
import { GenericFilterDialog, type GenericFilters } from "@/components/audience/GenericFilterDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

/* ---------- types ---------- */

interface CompanyResult {
  id: number;
  company_name?: string;
  name?: string;
  website?: string;
  website_domain?: string;
  linkedin_url?: string;
  company_logo_url?: string;
  logo_url?: string;
  industry?: string;
  employees_count?: number;
  size_range?: string;
  description_enriched?: string;
  description_short?: string;
  error?: boolean;
  [key: string]: any;
}

interface Audience {
  id: string;
  name: string;
  status: string;
  audience_size: number;
  filters: any;
  created_at: string;
  updated_at: string;
  last_refreshed: string | null;
  next_refresh: string | null;
  refresh_count: number;
}

/* ---------- filter tab config ---------- */

type FilterTabDef = { id: string; label: string; icon: React.ElementType };

const filterTabs: FilterTabDef[] = [
  { id: "intent", label: "Intent", icon: SlidersHorizontal },
  { id: "date", label: "Date", icon: Calendar },
  { id: "business", label: "Business", icon: Briefcase },
  { id: "financial", label: "Financial", icon: DollarSign },
  { id: "personal", label: "Personal", icon: UserCheck },
  { id: "family", label: "Family", icon: UserCheck },
  { id: "housing", label: "Housing", icon: Home },
  { id: "location", label: "Location", icon: MapPin },
  { id: "contact", label: "Contact", icon: AtSign },
];

const familyFields = ["Children Present", "Number of Children", "Household Size", "Single Parent"];
const housingFields = ["Home Owner / Renter", "Home Value", "Property Type", "Length of Residence", "Year Built"];
const dateFields = ["Created After", "Created Before"];
const contactFields = ["Has Email", "Has Phone", "Has LinkedIn"];

const scoreToGrowth: Record<string, number> = { low: 2, medium: 5, high: 12 };

/* ---------- helpers ---------- */

/** Extract a numeric revenue value from financial custom filters */
function extractRevenue(filters: FinancialFilters): number {
  for (const f of filters.customFilters) {
    const fieldLower = f.field.toLowerCase();
    if (fieldLower.includes("income") || fieldLower.includes("net worth") || fieldLower.includes("revenue")) {
      const num = parseFloat(f.value.replace(/[^0-9.]/g, ""));
      if (!isNaN(num) && num > 0) return num;
    }
  }
  return 1000000; // default
}

/* ---------- component ---------- */

const LeadSearch = () => {
  // View state
  const [view, setView] = useState<"list" | "builder">("list");
  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [loadingAudiences, setLoadingAudiences] = useState(true);

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");

  // Builder state
  const [currentAudienceId, setCurrentAudienceId] = useState<string | null>(null);
  const [audienceName, setAudienceName] = useState("");
  const [hydratedCompanies, setHydratedCompanies] = useState<CompanyResult[]>([]);
  const [lockedIds, setLockedIds] = useState<number[]>([]);
  const [currentAudienceIds, setCurrentAudienceIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [hydrating, setHydrating] = useState(false);
  const [audienceGenerated, setAudienceGenerated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Filter dialogs
  const [openDialog, setOpenDialog] = useState<string | null>(null);

  // AngelFlows Audience Builder (AI prompt -> prospects)
  const [afPrompt, setAfPrompt] = useState("");
  const [afLoading, setAfLoading] = useState(false);
  const [afProspects, setAfProspects] = useState<any[]>([]);

  // All filter states
  const [intentFilters, setIntentFilters] = useState<IntentFilters>({ method: "keyword", keywords: [], intentScore: "medium", aiPrompt: "" });
  const [businessFilters, setBusinessFilters] = useState<BusinessFilters>({ b2bKeywords: [], jobTitles: [], seniority: "", department: "", companyNames: [], companyDomains: [], industry: "" });
  const [locationFilters, setLocationFilters] = useState<LocationFilters>({ cities: [], states: [], zipCodes: [], countryCode: "" });
  const [personalFilters, setPersonalFilters] = useState<PersonalFilters>({ ageMin: "", ageMax: "", customFilters: [] });
  const [financialFilters, setFinancialFilters] = useState<FinancialFilters>({ customFilters: [] });
  const [familyFilters, setFamilyFilters] = useState<GenericFilters>({ customFilters: [] });
  const [housingFilters, setHousingFilters] = useState<GenericFilters>({ customFilters: [] });
  const [dateFilters, setDateFilters] = useState<GenericFilters>({ customFilters: [] });
  const [contactFilters, setContactFilters] = useState<GenericFilters>({ customFilters: [] });

  const { toast } = useToast();

  useEffect(() => { loadAudiences(); }, []);

  const loadAudiences = async () => {
    setLoadingAudiences(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setAudiences([]); setLoadingAudiences(false); return; }
      const { data, error } = await supabase.from("audiences" as any).select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (error) throw error;
      setAudiences((data as any[]) || []);
    } catch (err: any) {
      console.error("Load audiences error:", err);
    }
    setLoadingAudiences(false);
  };

  const getAppliedCount = (tabId: string): number => {
    switch (tabId) {
      case "intent": return intentFilters.keywords.length + (intentFilters.intentScore !== "medium" ? 1 : 0);
      case "business": return businessFilters.b2bKeywords.length + businessFilters.jobTitles.length + (businessFilters.seniority ? 1 : 0) + (businessFilters.department ? 1 : 0) + businessFilters.companyNames.length + businessFilters.companyDomains.length + (businessFilters.industry ? 1 : 0);
      case "location": return locationFilters.cities.length + locationFilters.states.length + locationFilters.zipCodes.length;
      case "personal": return (personalFilters.ageMin ? 1 : 0) + (personalFilters.ageMax ? 1 : 0) + personalFilters.customFilters.length;
      case "financial": return financialFilters.customFilters.length;
      case "family": return familyFilters.customFilters.length;
      case "housing": return housingFilters.customFilters.length;
      case "date": return dateFilters.customFilters.length;
      case "contact": return contactFilters.customFilters.length;
      default: return 0;
    }
  };

  const getAllFiltersForSave = () => ({
    intent: intentFilters,
    business: businessFilters,
    location: locationFilters,
    personal: personalFilters,
    financial: financialFilters,
    family: familyFilters,
    housing: housingFilters,
    date: dateFilters,
    contact: contactFilters,
  });

  /* ---------- AngelFlows Audience Builder (AI prompt search) ---------- */
  const handleAudienceBuilderSearch = async () => {
    const query = afPrompt.trim();
    if (!query) {
      toast({ title: "Describe your audience", description: 'Try: "product managers at Microsoft" or "CEOs of AI startups in San Francisco".', variant: "destructive" });
      return;
    }
    setAfLoading(true);
    setAfProspects([]);
    try {
      const { data, error } = await supabase.functions.invoke("angelflows-audience-builder", {
        body: { query, category: "people", type: "auto", numResults: 10 },
      });
      if (error) throw error;
      const prospects = Array.isArray(data?.prospects) ? data.prospects : [];
      setAfProspects(prospects);
      if (prospects.length === 0) {
        toast({ title: "No prospects found", description: "Try rephrasing — e.g. include role, company, or location.", variant: "destructive" });
      } else {
        toast({ title: "Audience built", description: `${prospects.length} prospects enriched with up-to-date career context.` });
      }
    } catch (err: any) {
      console.error("AngelFlows Audience Builder error:", err);
      toast({ title: "Builder error", description: err?.message || "Failed to build audience", variant: "destructive" });
    }
    setAfLoading(false);
  };

  /* ---------- CoreSignal Search + Hydration ---------- */
  const handleSearch = async () => {
    setLoading(true);
    setHydratedCompanies([]);
    setLockedIds([]);
    setAudienceGenerated(false);

    // Build dynamic params
    const userIntent = [...intentFilters.keywords, businessFilters.industry].filter(Boolean).join(" ");
    const growthThreshold = scoreToGrowth[intentFilters.intentScore] || 5;
    const targetRevenue = extractRevenue(financialFilters);
    const jobTitles = businessFilters.jobTitles.length > 0 ? businessFilters.jobTitles : undefined;

    try {
      const { data, error } = await supabase.functions.invoke("coresignal-search", {
        body: {
          action: "search",
          userIntent,
          targetRevenue,
          growthThreshold,
          ...(jobTitles && { jobTitles }),
        },
      });

      if (error) throw error;

      // Parse IDs from response
      let ids: number[] = [];
      if (Array.isArray(data)) {
        ids = data.map((r: any) => typeof r === 'number' ? r : Number(r));
      } else if (data?.hits?.hits) {
        ids = data.hits.hits.map((h: any) => Number(h._id));
      } else if (data?.results) {
        ids = data.results.map((r: any) => typeof r === 'number' ? r : Number(r.id || r._id));
      }

      if (ids.length === 0) {
        toast({
          title: "No companies found",
          description: "No companies found with these specific filters. Try lowering the Minimum Score.",
          variant: "destructive",
        });
        setCurrentAudienceIds([]);
        setTotalResults(0);
        setLoading(false);
        return;
      }

      setCurrentAudienceIds(ids);
      setTotalResults(ids.length);

      // Hydrate first 10
      const hydrateIds = ids.slice(0, 10);
      const remainingIds = ids.slice(10);
      setLockedIds(remainingIds);
      setLoading(false);

      // Now hydrate
      setHydrating(true);
      try {
        const { data: batchData, error: batchError } = await supabase.functions.invoke("coresignal-search", {
          body: { action: "collect_batch", companyIds: hydrateIds },
        });
        if (batchError) throw batchError;
        if (Array.isArray(batchData)) {
          setHydratedCompanies(batchData.filter((c: any) => !c.error));
        }
      } catch (err: any) {
        console.error("Hydration error:", err);
        toast({ title: "Hydration Warning", description: "Could not enrich company details. IDs are still available.", variant: "destructive" });
      }
      setHydrating(false);

    } catch (err: any) {
      console.error("CoreSignal search error:", err);
      toast({ title: "Search Error", description: err.message || "Failed to search companies", variant: "destructive" });
      setLoading(false);
    }
  };

  /* ---------- Generate Audience (saves to DB) ---------- */
  const handleGenerateAudience = async () => {
    if (currentAudienceIds.length === 0) {
      await handleSearch();
      return;
    }

    setSaving(true);
    try {
      if (currentAudienceId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("audiences" as any).update({
            filters: getAllFiltersForSave(),
            results: currentAudienceIds as any,
            audience_size: currentAudienceIds.length,
            status: "completed",
            last_refreshed: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as any).eq("id", currentAudienceId);
        }
      }
      setAudienceGenerated(true);
      toast({ title: "Audience Generated", description: `${currentAudienceIds.length} companies saved to your audience.` });
    } catch (err: any) {
      toast({ title: "Save Error", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const handleCreateAudience = async () => {
    if (!newName.trim()) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Sign in required", description: "Please sign in to create audiences.", variant: "destructive" });
        return;
      }
      const { data, error } = await supabase.from("audiences" as any).insert({
        user_id: user.id,
        name: newName.trim(),
        status: "draft",
        filters: {},
      } as any).select().single();
      if (error) throw error;
      setCurrentAudienceId((data as any).id);
      setAudienceName(newName.trim());
      setNewName("");
      setCreateOpen(false);
      setView("builder");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const openExistingAudience = (audience: Audience) => {
    setCurrentAudienceId(audience.id);
    setAudienceName(audience.name);
    const f = audience.filters as any;
    if (f?.intent) setIntentFilters(f.intent);
    if (f?.business) setBusinessFilters(f.business);
    if (f?.location) setLocationFilters(f.location);
    if (f?.personal) setPersonalFilters(f.personal);
    if (f?.financial) setFinancialFilters(f.financial);
    if (f?.family) setFamilyFilters(f.family);
    if (f?.housing) setHousingFilters(f.housing);
    if (f?.date) setDateFilters(f.date);
    if (f?.contact) setContactFilters(f.contact);
    if (Array.isArray(audience.filters) || (audience as any).results) {
      const savedResults = (audience as any).results;
      if (Array.isArray(savedResults)) {
        setCurrentAudienceIds(savedResults);
        setAudienceGenerated(audience.status === "completed");
      }
    }
    setView("builder");
  };

  const handleExport = () => {
    if (!audienceGenerated) {
      toast({ title: "Generate first", description: "Please generate the audience before exporting.", variant: "destructive" });
      return;
    }
    const headers = ["ID", "Company Name", "Website", "LinkedIn", "Industry", "Employees", "Description"];
    const hydratedMap = new Map(hydratedCompanies.map(c => [c.id, c]));
    const rows = currentAudienceIds.map(id => {
      const c = hydratedMap.get(id);
      if (c) {
        return [
          id,
          c.company_name || c.name || "",
          c.website || c.website_domain || "",
          c.linkedin_url || "",
          c.industry || "",
          c.employees_count || "",
          (c.description_enriched || c.description_short || "").slice(0, 200),
        ];
      }
      return [id, "", "", "", "", "", ""];
    });
    const csv = [headers.join(","), ...rows.map(r => r.map(v => `"${String(v || "").replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${audienceName || "audience"}-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: `${currentAudienceIds.length} companies exported.` });
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  };
  const toggleSelectAll = () => {
    if (selectedIds.size === currentAudienceIds.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(currentAudienceIds));
  };

  const formatDate = (d: string) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  };

  /* ---------- AUDIENCE LIST VIEW ---------- */
  if (view === "list") {
    return (
      <DashboardLayout title="Audience Lists" subtitle="Manage your saved audiences">
        <div className="flex items-center justify-between mb-6">
          <Input placeholder="Search by name and press enter..." className="max-w-sm" />
          <Button onClick={() => setCreateOpen(true)} className="gap-1.5">
            <Plus className="h-4 w-4" /> Create
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
                <TableHead className="text-xs font-semibold uppercase tracking-wide">Audience Size</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">Refresh Count</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">Next Refresh</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingAudiences ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></TableCell></TableRow>
              ) : audiences.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-12 text-muted-foreground">No audiences yet. Click "Create" to build your first audience.</TableCell></TableRow>
              ) : (
                audiences.map(a => (
                  <TableRow key={a.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => openExistingAudience(a)}>
                    <TableCell className="text-sm font-medium text-foreground">{a.name}</TableCell>
                    <TableCell>
                      <Badge variant={a.status === "completed" ? "default" : "secondary"} className={cn(a.status === "completed" && "bg-green-500/10 text-green-600 border-green-200")}>
                        {a.status === "completed" ? "Completed" : a.status === "processing" ? "Processing" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(a.created_at)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{a.last_refreshed ? formatDate(a.last_refreshed) : "—"}</TableCell>
                    <TableCell className="text-sm font-medium">{a.audience_size?.toLocaleString() || 0}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{a.refresh_count || 0}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{a.next_refresh ? formatDate(a.next_refresh) : "—"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><RefreshCw className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Link2 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Create Dialog */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader><DialogTitle>Create New Audience</DialogTitle></DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label>Audience Name</Label>
                <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Personal Injury Lawyers" onKeyDown={e => e.key === "Enter" && handleCreateAudience()} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateAudience} disabled={!newName.trim()}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    );
  }

  /* ---------- BUILDER VIEW ---------- */
  const topMatch = hydratedCompanies.length > 0 ? hydratedCompanies[0] : null;

  return (
    <DashboardLayout title={audienceName || "Audience Filters"} subtitle="Build high-intent audiences from big data">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={() => { setView("list"); setHydratedCompanies([]); setLockedIds([]); setCurrentAudienceIds([]); setAudienceGenerated(false); loadAudiences(); }} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" /> Back to Audiences
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleSearch} disabled={loading || hydrating} className="gap-1.5">
            <Search className="h-4 w-4" /> Preview
          </Button>
          <Button onClick={handleGenerateAudience} disabled={loading || saving || hydrating} className="gap-1.5">
            {(loading || saving) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            {audienceGenerated ? "Update Audience" : "Generate Audience"}
          </Button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 border-b border-border mb-6 overflow-x-auto">
        {filterTabs.map(tab => {
          const count = getAppliedCount(tab.id);
          return (
            <button
              key={tab.id}
              onClick={() => setOpenDialog(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                count > 0
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {count > 0 && (
                <span className="ml-1 text-xs bg-muted text-muted-foreground rounded-full px-1.5 py-0.5">
                  {count} applied
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Filter Dialogs */}
      <IntentFilterDialog open={openDialog === "intent"} onOpenChange={o => !o && setOpenDialog(null)} filters={intentFilters} onChange={setIntentFilters} />
      <BusinessFilterDialog open={openDialog === "business"} onOpenChange={o => !o && setOpenDialog(null)} filters={businessFilters} onChange={setBusinessFilters} />
      <LocationFilterDialog open={openDialog === "location"} onOpenChange={o => !o && setOpenDialog(null)} filters={locationFilters} onChange={setLocationFilters} />
      <PersonalFilterDialog open={openDialog === "personal"} onOpenChange={o => !o && setOpenDialog(null)} filters={personalFilters} onChange={setPersonalFilters} />
      <FinancialFilterDialog open={openDialog === "financial"} onOpenChange={o => !o && setOpenDialog(null)} filters={financialFilters} onChange={setFinancialFilters} />
      <GenericFilterDialog open={openDialog === "family"} onOpenChange={o => !o && setOpenDialog(null)} icon={<UserCheck className="h-5 w-5" />} title="Family" description="What family characteristics does your audience have?" fieldOptions={familyFields} filters={familyFilters} onChange={setFamilyFilters} />
      <GenericFilterDialog open={openDialog === "housing"} onOpenChange={o => !o && setOpenDialog(null)} icon={<Home className="h-5 w-5" />} title="Housing" description="What housing characteristics does your audience have?" fieldOptions={housingFields} filters={housingFilters} onChange={setHousingFilters} />
      <GenericFilterDialog open={openDialog === "date"} onOpenChange={o => !o && setOpenDialog(null)} icon={<Calendar className="h-5 w-5" />} title="Date" description="Filter by date ranges." fieldOptions={dateFields} filters={dateFilters} onChange={setDateFilters} />
      <GenericFilterDialog open={openDialog === "contact"} onOpenChange={o => !o && setOpenDialog(null)} icon={<AtSign className="h-5 w-5" />} title="Contact" description="Filter by contact availability." fieldOptions={contactFields} filters={contactFilters} onChange={setContactFilters} />

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-foreground">Generating Audience Preview</p>
          <p className="text-sm text-muted-foreground mt-1">Querying company databases and analyzing intent signals. This may take a few moments...</p>
        </div>
      )}

      {/* Hydrating state */}
      {!loading && hydrating && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Loader2 className="h-4 w-4 animate-spin" /> Enriching top company results...
        </div>
      )}

      {/* Top Match Card */}
      {!loading && topMatch && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Preview — Top Match</h3>
          <Card className="max-w-2xl">
            <CardContent className="p-5 flex items-start gap-4">
              {(topMatch.company_logo_url || topMatch.logo_url) ? (
                <img
                  src={topMatch.company_logo_url || topMatch.logo_url}
                  alt={topMatch.company_name || topMatch.name || "Company"}
                  className="h-14 w-14 rounded-lg object-contain border border-border bg-background p-1 shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <div className="h-14 w-14 rounded-lg border border-border bg-muted flex items-center justify-center shrink-0">
                  <Building2 className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0 space-y-1.5">
                <p className="text-base font-semibold text-foreground truncate">
                  {topMatch.company_name || topMatch.name || "Unknown Company"}
                </p>
                {topMatch.industry && (
                  <Badge variant="secondary" className="text-xs">{topMatch.industry}</Badge>
                )}
                {(topMatch.description_enriched || topMatch.description_short) && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {topMatch.description_enriched || topMatch.description_short}
                  </p>
                )}
                <div className="flex items-center gap-3 pt-1 flex-wrap">
                  {topMatch.employees_count && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" /> {topMatch.employees_count.toLocaleString()} employees
                    </span>
                  )}
                  {topMatch.size_range && (
                    <span className="text-xs text-muted-foreground">({topMatch.size_range})</span>
                  )}
                  {(topMatch.website || topMatch.website_domain) && (
                    <a href={topMatch.website || `https://${topMatch.website_domain}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline">
                      <Globe className="h-3 w-3" /> Website
                    </a>
                  )}
                  {topMatch.linkedin_url && (
                    <a href={topMatch.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline">
                      <Linkedin className="h-3 w-3" /> LinkedIn
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Results */}
      {!loading && currentAudienceIds.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {totalResults.toLocaleString()} companies found · {hydratedCompanies.length} enriched
            </p>
            <div className="flex items-center gap-2">
              {audienceGenerated && (
                <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
                  <Download className="h-4 w-4" /> Export CSV
                </Button>
              )}
            </div>
          </div>

          {/* Hydrated Company Cards */}
          {hydratedCompanies.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {hydratedCompanies.map((company) => (
                <Card key={company.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      {(company.company_logo_url || company.logo_url) ? (
                        <img
                          src={company.company_logo_url || company.logo_url}
                          alt={company.company_name || company.name || ""}
                          className="h-10 w-10 rounded-lg object-contain border border-border bg-background p-0.5 shrink-0"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg border border-border bg-muted flex items-center justify-center shrink-0">
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {company.company_name || company.name || `Company #${company.id}`}
                        </p>
                        {company.industry && (
                          <Badge variant="secondary" className="text-[10px] mt-1">{company.industry}</Badge>
                        )}
                      </div>
                    </div>

                    {(company.description_enriched || company.description_short) && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {company.description_enriched || company.description_short}
                      </p>
                    )}

                    <div className="flex items-center gap-2 flex-wrap">
                      {company.employees_count && (
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Users className="h-3 w-3" /> {company.employees_count.toLocaleString()}
                        </span>
                      )}
                      {(company.website || company.website_domain) && (
                        <a href={company.website || `https://${company.website_domain}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[11px] text-primary hover:underline">
                          <Globe className="h-3 w-3" /> Website
                        </a>
                      )}
                      {company.linkedin_url && (
                        <a href={company.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[11px] text-primary hover:underline">
                          <Linkedin className="h-3 w-3" /> LinkedIn
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Locked Results */}
          {lockedIds.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                {lockedIds.length} additional companies
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {lockedIds.slice(0, 30).map((id) => (
                  <Card key={id} className="bg-muted/30 border-dashed">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg border border-border bg-muted flex items-center justify-center shrink-0">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-mono text-muted-foreground">ID: {id}</p>
                        <p className="text-xs text-muted-foreground/60">Generate to unlock details</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {lockedIds.length > 30 && (
                <p className="text-xs text-muted-foreground text-center mt-3">
                  + {lockedIds.length - 30} more companies
                </p>
              )}
            </div>
          )}
        </>
      )}

      {/* Empty state */}
      {!loading && !hydrating && currentAudienceIds.length === 0 && hydratedCompanies.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-16 text-center">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-base font-medium text-foreground mb-1">Preview Your Audience</p>
          <p className="text-sm text-muted-foreground">
            Click on the filter tabs above to configure your audience, then click Preview or Generate Audience.
          </p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default LeadSearch;
