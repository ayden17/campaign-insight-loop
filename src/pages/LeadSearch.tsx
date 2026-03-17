import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Loader2, Download, User, ExternalLink, Mail, Phone, Save, SlidersHorizontal, Calendar, Briefcase, DollarSign, UserCheck, Home, MapPin, AtSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/* ---------- types ---------- */

interface Prospect {
  prospect_id?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  title?: string;
  company_name?: string;
  department?: string;
  job_level?: string;
  linkedin_url?: string;
  location?: string;
  country_code?: string;
  email?: string;
  phone?: string;
  [key: string]: any;
}

/* ---------- filter tab config ---------- */

type FilterTab = {
  id: string;
  label: string;
  icon: React.ElementType;
};

const filterTabs: FilterTab[] = [
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

const jobLevelOptions = [
  { value: "", label: "All Levels" },
  { value: "c_level", label: "C-Level" },
  { value: "vp", label: "VP" },
  { value: "director", label: "Director" },
  { value: "manager", label: "Manager" },
  { value: "senior", label: "Senior" },
  { value: "entry", label: "Entry Level" },
];

const departmentOptions = [
  { value: "", label: "All Departments" },
  { value: "engineering", label: "Engineering" },
  { value: "sales", label: "Sales" },
  { value: "marketing", label: "Marketing" },
  { value: "finance", label: "Finance" },
  { value: "hr", label: "Human Resources" },
  { value: "operations", label: "Operations" },
  { value: "product", label: "Product" },
  { value: "design", label: "Design" },
];

/* ---------- component ---------- */

const LeadSearch = () => {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [enriching, setEnriching] = useState<string | null>(null);
  const [titleFilter, setTitleFilter] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [jobLevel, setJobLevel] = useState("");
  const [department, setDepartment] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [searchLabel, setSearchLabel] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("intent");
  const [appliedFilters, setAppliedFilters] = useState<Record<string, number>>({});
  const { toast } = useToast();

  const currentFilters = () => {
    const f: Record<string, any> = {};
    if (titleFilter) f.title = { values: [titleFilter] };
    if (companyFilter) f.company_name = { values: [companyFilter] };
    if (jobLevel && jobLevel !== "all") f.job_level = { values: [jobLevel] };
    if (department && department !== "all") f.sub_department = { values: [department] };
    if (locationFilter) f.country_code = { values: [locationFilter] };
    return f;
  };

  const handleSearch = async (page = 1) => {
    setLoading(true);
    try {
      const filters: Record<string, any> = {};
      if (companyFilter) filters.company_name = [companyFilter];
      if (jobLevel && jobLevel !== "all") filters.job_level = [jobLevel];
      if (department && department !== "all") filters.department = [department];
      if (titleFilter) filters.title = [titleFilter];
      if (locationFilter) filters.country_code = [locationFilter];

      // Track applied filter counts
      const counts: Record<string, number> = {};
      if (titleFilter || jobLevel || department) counts.intent = [titleFilter, jobLevel, department].filter(Boolean).length;
      if (companyFilter) counts.business = 1;
      if (locationFilter) counts.location = 1;
      setAppliedFilters(counts);

      const { data, error } = await supabase.functions.invoke('prospect-search', {
        body: { action: 'search', filters, page, page_size: 20 },
      });
      if (error) throw error;

      const results = data?.prospects || data?.data || data?.results || [];
      setProspects(Array.isArray(results) ? results : []);
      setTotalResults(data?.total || data?.total_results || results.length || 0);
      setCurrentPage(page);
      setSelectedIds(new Set());
    } catch (err: any) {
      console.error('Search error:', err);
      toast({ title: "Search Error", description: err.message || "Failed to search prospects", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleSaveResults = async () => {
    const toSave = selectedIds.size > 0
      ? prospects.filter(p => selectedIds.has(p.prospect_id || ''))
      : prospects;
    if (toSave.length === 0) return;

    setSaving(true);
    try {
      const filters = currentFilters();
      const rows = toSave.map(p => ({
        prospect_id: p.prospect_id || null,
        full_name: p.full_name || `${p.first_name || ''} ${p.last_name || ''}`.trim() || null,
        first_name: p.first_name || null, last_name: p.last_name || null,
        title: p.title || null, company_name: p.company_name || null,
        department: p.department || null, job_level: p.job_level || null,
        linkedin_url: p.linkedin_url || null,
        location: p.location || p.country_code || null, country_code: p.country_code || null,
        email: p.email || null, phone: p.phone || null,
        enriched: !!(p as any).enriched, search_filters: filters,
        search_label: searchLabel || null, raw_data: p,
      }));
      const { error } = await supabase.from('saved_prospects' as any).insert(rows as any);
      if (error) throw error;
      toast({ title: "Saved", description: `${toSave.length} prospects saved.` });
    } catch (err: any) {
      toast({ title: "Save Error", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const handleEnrich = async (prospectId: string) => {
    setEnriching(prospectId);
    try {
      const { data, error } = await supabase.functions.invoke('prospect-search', {
        body: { action: 'enrich', prospect_id: prospectId },
      });
      if (error) throw error;
      setProspects(prev => prev.map(p =>
        p.prospect_id === prospectId ? { ...p, ...data, enriched: true } : p
      ));
      toast({ title: "Enriched", description: "Contact details retrieved." });
    } catch (err: any) {
      toast({ title: "Enrichment Error", description: err.message, variant: "destructive" });
    }
    setEnriching(null);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === prospects.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(prospects.map(p => p.prospect_id || '')));
  };

  const handleExport = () => {
    const toExport = selectedIds.size > 0
      ? prospects.filter(p => selectedIds.has(p.prospect_id || ''))
      : prospects;
    const headers = ["First Name", "Last Name", "Business Email", "Business Phone", "Company", "Company Domain", "Job Title", "Personal Phone", "Personal Email"];
    const rows = toExport.map(p => [
      p.first_name || '', p.last_name || '', p.email || '', p.phone || '',
      p.company_name || '', '', p.title || '', '', '',
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.map(v => `"${(v || '').replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audience-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: `${toExport.length} prospects exported.` });
  };

  const getName = (p: Prospect) => p.full_name || `${p.first_name || ''} ${p.last_name || ''}`.trim() || '—';

  return (
    <DashboardLayout title={searchLabel || "Audience Filters"} subtitle="Build high-intent audiences from big data">
      {/* Top bar with actions */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Audience name…"
            value={searchLabel}
            onChange={e => setSearchLabel(e.target.value)}
            className="text-sm w-64"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => handleSearch(1)} disabled={loading} className="gap-1.5">
            <Search className="h-4 w-4" />
            Preview
          </Button>
          <Button onClick={() => handleSearch(1)} disabled={loading} className="gap-1.5">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Generate Audience
          </Button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 border-b border-border mb-6 overflow-x-auto">
        {filterTabs.map((tab) => {
          const count = appliedFilters[tab.id];
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                activeTab === tab.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {count ? (
                <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5">
                  {count} applied
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Filter panel for active tab */}
      <Card className="mb-6">
        <CardContent className="pt-4">
          {activeTab === "intent" && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Job Title</Label>
                <Input placeholder="e.g. Marketing Manager" value={titleFilter} onChange={e => setTitleFilter(e.target.value)} className="text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Job Level</Label>
                <Select value={jobLevel} onValueChange={setJobLevel}>
                  <SelectTrigger className="text-sm"><SelectValue placeholder="All Levels" /></SelectTrigger>
                  <SelectContent>
                    {jobLevelOptions.map(o => (
                      <SelectItem key={o.value} value={o.value || "all"}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Department</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger className="text-sm"><SelectValue placeholder="All Departments" /></SelectTrigger>
                  <SelectContent>
                    {departmentOptions.map(o => (
                      <SelectItem key={o.value} value={o.value || "all"}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          {activeTab === "business" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Company</Label>
                <Input placeholder="e.g. Acme Corp" value={companyFilter} onChange={e => setCompanyFilter(e.target.value)} className="text-sm" />
              </div>
            </div>
          )}
          {activeTab === "location" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Country Code</Label>
                <Input placeholder="e.g. US" value={locationFilter} onChange={e => setLocationFilter(e.target.value)} className="text-sm" />
              </div>
            </div>
          )}
          {!["intent", "business", "location"].includes(activeTab) && (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Filters for "{filterTabs.find(t => t.id === activeTab)?.label}" coming soon.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Results table */}
      {prospects.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              Showing {prospects.length} of {totalResults} results
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleSaveResults} disabled={saving} className="gap-1.5">
                <Save className="h-4 w-4" />
                {saving ? "Saving…" : `Save ${selectedIds.size > 0 ? `(${selectedIds.size})` : 'all'}`}
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
                <Download className="h-4 w-4" />
                Export {selectedIds.size > 0 ? `(${selectedIds.size})` : 'all'}
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-10">
                    <Checkbox checked={selectedIds.size === prospects.length && prospects.length > 0} onCheckedChange={toggleSelectAll} />
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide">#</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide">First Name</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide">Last Name</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide">Business Email</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide">Business Phone</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide">Company</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide">Job Title</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prospects.map((prospect, idx) => {
                  const id = prospect.prospect_id || String(idx);
                  return (
                    <TableRow key={id} className="hover:bg-muted/30">
                      <TableCell>
                        <Checkbox checked={selectedIds.has(id)} onCheckedChange={() => toggleSelect(id)} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{idx + 1}</TableCell>
                      <TableCell className="text-sm text-foreground">{prospect.first_name || '—'}</TableCell>
                      <TableCell className="text-sm text-foreground">{prospect.last_name || '—'}</TableCell>
                      <TableCell className="text-sm text-foreground truncate max-w-[200px]">{prospect.email || '—'}</TableCell>
                      <TableCell className="text-sm text-foreground">{prospect.phone || '—'}</TableCell>
                      <TableCell className="text-sm text-foreground">{prospect.company_name || '—'}</TableCell>
                      <TableCell className="text-sm text-foreground">{prospect.title || '—'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {prospect.linkedin_url && (
                            <a href={prospect.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                          <Button variant="outline" size="sm" className="text-xs" disabled={enriching === id || (prospect as any).enriched} onClick={() => handleEnrich(id)}>
                            {enriching === id ? <Loader2 className="h-3 w-3 animate-spin" /> : (prospect as any).enriched ? "✓" : "Enrich"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <Button variant="outline" size="sm" disabled={currentPage <= 1 || loading} onClick={() => handleSearch(currentPage - 1)}>Previous</Button>
            <span className="text-sm text-muted-foreground">Page {currentPage}</span>
            <Button variant="outline" size="sm" disabled={prospects.length < 20 || loading} onClick={() => handleSearch(currentPage + 1)}>Next</Button>
          </div>
        </>
      )}

      {!loading && prospects.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-16 text-center">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-base font-medium text-foreground mb-1">Preview Your Audience</p>
          <p className="text-sm text-muted-foreground">
            Configure your filters to build an audience. Click to start.
          </p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default LeadSearch;
