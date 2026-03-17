import { useState, useEffect, useMemo, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DonutChart, type DonutChartSegment } from "@/components/ui/donut-chart";
import { cn } from "@/lib/utils";
import { Search, Eye, X, Save, Loader2, Download, Users, Circle, Facebook } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useMetaAdsStore, API_VERSION } from "@/lib/meta-ads-store";

const qualityBadge: Record<string, string> = {
  high: "bg-success/15 text-success border-success/30",
  medium: "bg-warning/15 text-warning border-warning/30",
  low: "bg-destructive/15 text-destructive border-destructive/30",
};

const statusOptions = [
  { value: "pif", label: "Paid in Full (PIF)", color: "bg-success/15 text-success" },
  { value: "partial", label: "Partial", color: "bg-info/15 text-info" },
  { value: "follow_up", label: "Follow-up Required", color: "bg-warning/15 text-warning" },
  { value: "burnt", label: "Burnt Lead", color: "bg-destructive/15 text-destructive" },
  { value: "pending", label: "Pending", color: "bg-muted text-muted-foreground" },
];

const statusBadge: Record<string, string> = Object.fromEntries(
  statusOptions.map((s) => [s.value, s.color])
);

function getStatusLabel(value: string): string {
  return statusOptions.find((s) => s.value === value)?.label || value;
}

interface Lead {
  id: string;
  meeting_id: string | null;
  meeting_title: string | null;
  lead_name: string | null;
  meeting_date: string | null;
  attendees: any;
  transcript: string | null;
  summary: string | null;
  offer: string | null;
  objections: string | null;
  objection_handling: string | null;
  lead_quality: string | null;
  suggested_followups: string | null;
  notes: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
}

function getLeadDisplayName(lead: Lead): string {
  if (lead.lead_name) return lead.lead_name;
  if (lead.attendees && Array.isArray(lead.attendees) && lead.attendees.length > 0) {
    const names = lead.attendees.map((a: any) => a.name || a.email).filter(Boolean);
    if (names.length > 1) return names[1];
    if (names.length > 0) return names[0];
  }
  return lead.meeting_title || "Unknown Lead";
}

function getAttendeesDisplay(lead: Lead): string {
  if (!lead.attendees || !Array.isArray(lead.attendees)) return "—";
  const names = lead.attendees.map((a: any) => a.name || a.email).filter(Boolean);
  return names.length > 0 ? names.join(", ") : "—";
}

// Parse objections string into array
function parseObjections(objections: string | null): string[] {
  if (!objections) return [];
  // Try splitting by common separators
  return objections.split(/[,;\n•\-\d+\.]+/).map(s => s.trim()).filter(Boolean);
}

function exportToCSV(leads: Lead[]) {
  const headers = ["Lead Name", "Quality", "Status", "Date", "Attendees", "Offer", "Objections", "Objection Handling", "Follow-ups", "Notes"];
  const rows = leads.map(l => [
    getLeadDisplayName(l),
    l.lead_quality || "",
    getStatusLabel(l.status || "pending"),
    l.meeting_date ? new Date(l.meeting_date).toLocaleDateString() : "",
    getAttendeesDisplay(l),
    (l.offer || "").replace(/"/g, '""'),
    (l.objections || "").replace(/"/g, '""'),
    (l.objection_handling || "").replace(/"/g, '""'),
    (l.suggested_followups || "").replace(/"/g, '""'),
    (l.notes || "").replace(/"/g, '""'),
  ]);
  const csv = [headers.join(","), ...rows.map(r => r.map(v => `"${v}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `leads-export-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const LeadsPage = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Lead>>({});
  const [saving, setSaving] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [hoveredObjection, setHoveredObjection] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => { loadLeads(); }, []);

  const loadLeads = async () => {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) console.error("Error loading leads:", error);
    else setLeads((data || []) as Lead[]);
    setLoading(false);
  };

  // Compute objection breakdown across all leads
  const objectionData = useMemo<DonutChartSegment[]>(() => {
    const counts: Record<string, number> = {};
    leads.forEach((l) => {
      const objs = parseObjections(l.objections);
      objs.forEach((o) => {
        // Categorize objections
        const lower = o.toLowerCase();
        let category = "Other";
        if (lower.includes("price") || lower.includes("cost") || lower.includes("budget") || lower.includes("expensive") || lower.includes("money") || lower.includes("afford")) {
          category = "Financial";
        } else if (lower.includes("time") || lower.includes("busy") || lower.includes("schedule") || lower.includes("later") || lower.includes("not now")) {
          category = "Timing";
        } else if (lower.includes("feature") || lower.includes("product") || lower.includes("capability") || lower.includes("function")) {
          category = "Product/Features";
        } else if (lower.includes("competitor") || lower.includes("alternative") || lower.includes("other solution") || lower.includes("already using")) {
          category = "Competitor";
        } else if (lower.includes("trust") || lower.includes("proof") || lower.includes("case study") || lower.includes("review") || lower.includes("testimonial")) {
          category = "Trust/Proof";
        }
        counts[category] = (counts[category] || 0) + 1;
      });
    });

    const colors: Record<string, string> = {
      "Financial": "hsl(var(--info))",
      "Product/Features": "hsl(var(--success))",
      "Timing": "hsl(var(--warning))",
      "Competitor": "hsl(var(--muted-foreground))",
      "Trust/Proof": "hsl(var(--chart-4))",
      "Other": "hsl(var(--destructive))",
    };

    return Object.entries(counts).map(([label, value]) => ({
      label,
      value,
      color: colors[label] || "hsl(var(--muted-foreground))",
    }));
  }, [leads]);

  const totalObjections = objectionData.reduce((sum, d) => sum + d.value, 0);

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    const { error } = await supabase.from("leads").update({ status: newStatus }).eq("id", leadId);
    if (error) {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    } else {
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
      if (selectedLead?.id === leadId) setSelectedLead(prev => prev ? { ...prev, status: newStatus } : prev);
      toast({ title: "Updated", description: `Status changed to ${getStatusLabel(newStatus)}` });
    }
  };

  const handleSave = async () => {
    if (!selectedLead) return;
    setSaving(true);
    const { error } = await supabase
      .from("leads")
      .update({
        offer: editForm.offer,
        objections: editForm.objections,
        objection_handling: editForm.objection_handling,
        lead_quality: editForm.lead_quality,
        suggested_followups: editForm.suggested_followups,
        notes: editForm.notes,
        status: editForm.status,
      })
      .eq("id", selectedLead.id);
    if (error) {
      toast({ title: "Error", description: "Failed to save changes", variant: "destructive" });
    } else {
      toast({ title: "Saved", description: "Lead updated successfully." });
      setSelectedLead({ ...selectedLead, ...editForm } as Lead);
      setEditing(false);
      loadLeads();
    }
    setSaving(false);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map(l => l.id)));
  };

  const filtered = leads.filter((l) => {
    const matchesFilter = filter === "all" || l.lead_quality === filter;
    const name = getLeadDisplayName(l).toLowerCase();
    const matchesSearch = !search || name.includes(search.toLowerCase()) || l.offer?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleExport = () => {
    const toExport = selectedIds.size > 0 ? filtered.filter(l => selectedIds.has(l.id)) : filtered;
    exportToCSV(toExport);
    toast({ title: "Exported", description: `${toExport.length} leads exported to CSV.` });
  };

  // Detail view
  if (selectedLead) {
    const lead = editing ? { ...selectedLead, ...editForm } : selectedLead;
    const leadObjections = parseObjections(lead.objections);

    return (
      <DashboardLayout
        title={getLeadDisplayName(lead as Lead)}
        subtitle={lead.meeting_date ? `Call on ${new Date(lead.meeting_date).toLocaleDateString()}` : ""}
        actions={
          <div className="flex gap-2">
            {editing ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
                <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5">
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  Save
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={() => { setEditing(true); setEditForm(selectedLead); }}>Edit</Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => { setSelectedLead(null); setEditing(false); }}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Attendees */}
          {lead.attendees && Array.isArray(lead.attendees) && lead.attendees.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Users className="h-4 w-4 text-muted-foreground" />
              {lead.attendees.map((a: any, i: number) => (
                <span key={i} className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-muted text-muted-foreground">
                  {a.name || a.email || "Unknown"}
                </span>
              ))}
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">💰 Offer</CardTitle></CardHeader>
              <CardContent>
                {editing ? (
                  <Textarea value={editForm.offer || ""} onChange={(e) => setEditForm({ ...editForm, offer: e.target.value })} className="text-sm" rows={4} />
                ) : (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{lead.offer || "—"}</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">🚫 Objections</CardTitle></CardHeader>
              <CardContent>
                {editing ? (
                  <Textarea value={editForm.objections || ""} onChange={(e) => setEditForm({ ...editForm, objections: e.target.value })} className="text-sm" rows={4} />
                ) : leadObjections.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {leadObjections.map((obj, i) => (
                      <span key={i} className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium bg-destructive/10 text-destructive border border-destructive/20">
                        {obj}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">—</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">🛡️ Objection Handling</CardTitle></CardHeader>
              <CardContent>
                {editing ? (
                  <Textarea value={editForm.objection_handling || ""} onChange={(e) => setEditForm({ ...editForm, objection_handling: e.target.value })} className="text-sm" rows={4} />
                ) : (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{lead.objection_handling || "—"}</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">📊 Lead Quality & Status</CardTitle></CardHeader>
              <CardContent>
                {editing ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] text-muted-foreground mb-1 block">Quality</label>
                      <Select value={editForm.lead_quality || "medium"} onValueChange={(v) => setEditForm({ ...editForm, lead_quality: v })}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-[11px] text-muted-foreground mb-1 block">Status</label>
                      <Select value={editForm.status || "pending"} onValueChange={(v) => setEditForm({ ...editForm, status: v })}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((s) => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border capitalize", qualityBadge[lead.lead_quality || "medium"])}>
                      {lead.lead_quality}
                    </span>
                    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize", statusBadge[lead.status || "pending"])}>
                      {getStatusLabel(lead.status || "pending")}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader className="pb-2"><CardTitle className="text-sm">📋 Suggested Follow-ups</CardTitle></CardHeader>
              <CardContent>
                {editing ? (
                  <Textarea value={editForm.suggested_followups || ""} onChange={(e) => setEditForm({ ...editForm, suggested_followups: e.target.value })} className="text-sm" rows={3} />
                ) : (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{lead.suggested_followups || "—"}</p>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader className="pb-2"><CardTitle className="text-sm">📝 Notes</CardTitle></CardHeader>
              <CardContent>
                {editing ? (
                  <Textarea value={editForm.notes || ""} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} className="text-sm" rows={3} />
                ) : (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{lead.notes || "No notes yet."}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Leads" subtitle="AI-enriched lead intelligence from sales conversations">
      {/* Objection Donut Chart */}
      {totalObjections > 0 && (
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Objection Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8 flex-wrap">
              <DonutChart
                data={objectionData}
                size={160}
                strokeWidth={18}
                onSegmentHover={(seg) => setHoveredObjection(seg?.label || null)}
                centerContent={
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground">
                      {hoveredObjection || "Total"}
                    </p>
                    <p className="text-lg font-bold text-card-foreground">
                      {hoveredObjection
                        ? objectionData.find(d => d.label === hoveredObjection)?.value || 0
                        : totalObjections}
                    </p>
                  </div>
                }
              />
              <div className="flex flex-col gap-2">
                {objectionData.map((seg) => (
                  <div
                    key={seg.label}
                    className={cn("flex items-center gap-2 cursor-pointer transition-opacity", hoveredObjection && hoveredObjection !== seg.label ? "opacity-40" : "")}
                    onMouseEnter={() => setHoveredObjection(seg.label)}
                    onMouseLeave={() => setHoveredObjection(null)}
                  >
                    <Circle className="h-3 w-3 shrink-0" fill={seg.color} stroke="none" />
                    <span className="text-xs text-muted-foreground">{seg.label}</span>
                    <span className="text-xs font-semibold text-card-foreground">{seg.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search leads..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-8 text-xs" />
          </div>
          <div className="flex gap-1">
            {["all", "high", "medium", "low"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors",
                  filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                )}
              >
                {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5 text-xs">
          <Download className="h-3.5 w-3.5" />
          Export CSV {selectedIds.size > 0 && `(${selectedIds.size})`}
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10">
                  <Checkbox
                    checked={filtered.length > 0 && selectedIds.size === filtered.length}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wide">Lead</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wide">Quality</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wide">Status</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wide">Objections</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wide">Call Date</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-right w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length > 0 ? (
                filtered.map((lead) => {
                  const leadObjs = parseObjections(lead.objections);
                  return (
                    <TableRow key={lead.id} className="group cursor-pointer" onClick={() => setSelectedLead(lead)}>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.has(lead.id)}
                          onCheckedChange={() => toggleSelect(lead.id)}
                        />
                      </TableCell>
                      <TableCell className="text-sm font-medium text-card-foreground">
                        {getLeadDisplayName(lead)}
                      </TableCell>
                      <TableCell>
                        <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border capitalize", qualityBadge[lead.lead_quality || "medium"])}>
                          {lead.lead_quality}
                        </span>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Select value={lead.status || "pending"} onValueChange={(v) => handleStatusChange(lead.id, v)}>
                          <SelectTrigger className="h-7 w-[140px] text-[10px] font-semibold border-0 bg-transparent p-0 focus:ring-0">
                            <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 capitalize", statusBadge[lead.status || "pending"])}>
                              {getStatusLabel(lead.status || "pending")}
                            </span>
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((s) => (
                              <SelectItem key={s.value} value={s.value} className="text-xs">
                                {s.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {leadObjs.length > 0 ? leadObjs.slice(0, 2).map((o, i) => (
                            <span key={i} className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium bg-destructive/10 text-destructive border border-destructive/20 truncate max-w-[90px]">
                              {o}
                            </span>
                          )) : <span className="text-[10px] text-muted-foreground">—</span>}
                          {leadObjs.length > 2 && (
                            <span className="text-[9px] text-muted-foreground">+{leadObjs.length - 2}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {lead.meeting_date ? new Date(lead.meeting_date).toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-sm text-muted-foreground">
                    {leads.length === 0
                      ? "No leads yet. Analyze a meeting from Review Sales Calls to create your first lead."
                      : "No leads match your filter."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </DashboardLayout>
  );
};

export default LeadsPage;
