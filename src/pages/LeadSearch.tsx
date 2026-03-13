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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Loader2, Download, User, ExternalLink, Mail, Phone, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

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
  const { toast } = useToast();

  const currentFilters = () => {
    const f: Record<string, any> = {};
    if (titleFilter) f.title = titleFilter;
    if (companyFilter) f.company_name = companyFilter;
    if (jobLevel && jobLevel !== "all") f.job_level = jobLevel;
    if (department && department !== "all") f.department = department;
    if (locationFilter) f.location = locationFilter;
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
        first_name: p.first_name || null,
        last_name: p.last_name || null,
        title: p.title || null,
        company_name: p.company_name || null,
        department: p.department || null,
        job_level: p.job_level || null,
        linkedin_url: p.linkedin_url || null,
        location: p.location || p.country_code || null,
        country_code: p.country_code || null,
        email: p.email || null,
        phone: p.phone || null,
        enriched: !!(p as any).enriched,
        search_filters: filters,
        search_label: searchLabel || null,
        raw_data: p,
      }));

      const { error } = await supabase.from('saved_prospects' as any).insert(rows as any);
      if (error) throw error;

      toast({ title: "Saved", description: `${toSave.length} prospects saved to database.` });
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
      toast({ title: "Enriched", description: "Contact details retrieved successfully." });
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
    if (selectedIds.size === prospects.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(prospects.map(p => p.prospect_id || '')));
    }
  };

  const handleExport = () => {
    const toExport = selectedIds.size > 0
      ? prospects.filter(p => selectedIds.has(p.prospect_id || ''))
      : prospects;
    const headers = ["Name", "Title", "Company", "Department", "Level", "Location", "LinkedIn", "Email", "Phone"];
    const rows = toExport.map(p => [
      p.full_name || `${p.first_name || ''} ${p.last_name || ''}`.trim(),
      p.title || '', p.company_name || '', p.department || '', p.job_level || '',
      p.location || p.country_code || '', p.linkedin_url || '', p.email || '', p.phone || '',
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.map(v => `"${(v || '').replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prospect-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: `${toExport.length} prospects exported.` });
  };

  const getName = (p: Prospect) => p.full_name || `${p.first_name || ''} ${p.last_name || ''}`.trim() || '—';

  return (
    <DashboardLayout title="Lead Search" subtitle="Find and enrich prospects for outreach">
      {/* Filters */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Search Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Job Title</Label>
              <Input placeholder="e.g. Marketing Manager" value={titleFilter} onChange={e => setTitleFilter(e.target.value)} className="text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Company</Label>
              <Input placeholder="e.g. Acme Corp" value={companyFilter} onChange={e => setCompanyFilter(e.target.value)} className="text-sm" />
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
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Location / Country</Label>
              <Input placeholder="e.g. US" value={locationFilter} onChange={e => setLocationFilter(e.target.value)} className="text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Search Label</Label>
              <Input placeholder="e.g. Q1 Outreach" value={searchLabel} onChange={e => setSearchLabel(e.target.value)} className="text-sm" />
            </div>
            <div className="flex items-end">
              <Button onClick={() => handleSearch(1)} disabled={loading} className="gap-2 w-full">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {prospects.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              Showing {prospects.length} of {totalResults} results
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleSaveResults} disabled={saving} className="gap-1.5">
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : `Save ${selectedIds.size > 0 ? `(${selectedIds.size})` : 'all'}`}
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
                  <TableHead className="text-xs font-semibold uppercase tracking-wide">Name</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide">Links</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide">Title</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide">Company</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide">Contact</TableHead>
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
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <span className="text-sm font-medium text-foreground">{getName(prospect)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {prospect.linkedin_url && (
                          <a href={prospect.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-foreground">{prospect.title || '—'}</span>
                        {prospect.job_level && <Badge variant="secondary" className="ml-2 text-[10px]">{prospect.job_level}</Badge>}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-foreground">{prospect.company_name || '—'}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {prospect.email && <a href={`mailto:${prospect.email}`} className="text-muted-foreground hover:text-foreground"><Mail className="h-4 w-4" /></a>}
                          {prospect.phone && <a href={`tel:${prospect.phone}`} className="text-muted-foreground hover:text-foreground"><Phone className="h-4 w-4" /></a>}
                          {!prospect.email && !prospect.phone && <span className="text-xs text-muted-foreground">—</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" className="text-xs" disabled={enriching === id || (prospect as any).enriched} onClick={() => handleEnrich(id)}>
                          {enriching === id ? <Loader2 className="h-3 w-3 animate-spin" /> : (prospect as any).enriched ? "Enriched" : "Enrich"}
                        </Button>
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
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center">
          <Search className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm font-medium text-foreground mb-1">Search for Prospects</p>
          <p className="text-sm text-muted-foreground">
            Use the filters above to find leads by job title, company, department, or location.
          </p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default LeadSearch;
