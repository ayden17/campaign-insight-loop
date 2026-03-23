import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  Search, Mail, Phone, MapPin, Building2, GraduationCap, Copy,
  ExternalLink, Globe, Clock, User, Eye, Download, Hash,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import VisitorMap from "@/components/visitor/VisitorMap";

interface Visitor {
  id: string;
  visitor_uid: string;
  ip_address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  company: string | null;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  job_title: string | null;
  education: string | null;
  pdl_data: any;
  total_visits: number;
  first_seen: string;
  last_seen: string;
  pixel_id: string;
}

interface PageView {
  id: string;
  page_url: string;
  referrer: string | null;
  created_at: string;
}

export default function VisitorAnalytics() {
  const { toast } = useToast();
  const [selectedPixelId, setSelectedPixelId] = useState<string>("");
  const [selectedVisitorId, setSelectedVisitorId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: pixels } = useQuery({
    queryKey: ["pixels-list"],
    queryFn: async () => {
      const { data } = await supabase.from("pixels").select("id, website_name, website_url").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const activePixelId = selectedPixelId || pixels?.[0]?.id || "";

  const { data: visitors } = useQuery({
    queryKey: ["pixel-visitors", activePixelId],
    enabled: !!activePixelId,
    queryFn: async () => {
      const { data } = await supabase
        .from("pixel_visitors")
        .select("*")
        .eq("pixel_id", activePixelId)
        .order("last_seen", { ascending: false });
      return (data || []) as Visitor[];
    },
  });

  const selectedVisitor = useMemo(
    () => visitors?.find((v) => v.id === selectedVisitorId) || visitors?.[0] || null,
    [visitors, selectedVisitorId]
  );

  const { data: pageViews } = useQuery({
    queryKey: ["page-views", selectedVisitor?.id],
    enabled: !!selectedVisitor?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("pixel_page_views")
        .select("*")
        .eq("visitor_id", selectedVisitor!.id)
        .order("created_at", { ascending: false });
      return (data || []) as PageView[];
    },
  });

  const filteredVisitors = useMemo(() => {
    if (!visitors) return [];
    if (!searchQuery) return visitors;
    const q = searchQuery.toLowerCase();
    return visitors.filter(
      (v) =>
        (v.full_name && v.full_name.toLowerCase().includes(q)) ||
        (v.email && v.email.toLowerCase().includes(q)) ||
        (v.ip_address && v.ip_address.includes(q)) ||
        (v.visitor_uid && v.visitor_uid.toLowerCase().includes(q))
    );
  }, [visitors, searchQuery]);

  const displayName = (v: Visitor) =>
    v.full_name || (v.city ? `Anonymous (${v.city})` : v.visitor_uid.slice(0, 12));

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: text });
  };

  const hasLocation = selectedVisitor?.latitude != null && selectedVisitor?.longitude != null || selectedVisitor?.city;

  const exportCsv = () => {
    if (!visitors?.length) return;
    const resolved = visitors.filter((v) => v.email || v.full_name);
    const headers = ["email", "phone", "fn", "ln", "ct", "st", "zip"];
    const rows = resolved.map((v) => [
      v.email || "", v.phone || "", v.first_name || "", v.last_name || "",
      v.city || "", v.state || "", v.postal_code || "",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "visitor_audience_export.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: `${resolved.length} resolved visitors exported.` });
  };

  const activeSite = pixels?.find((p: any) => p.id === activePixelId);

  return (
    <DashboardLayout
      title="Visitor Analytics"
      subtitle={activeSite ? `Visitors for ${activeSite.website_url}` : "Select a pixel to view visitors"}
      actions={
        <div className="flex items-center gap-2">
          {pixels && pixels.length > 0 && (
            <Select value={activePixelId} onValueChange={setSelectedPixelId}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select pixel" />
              </SelectTrigger>
              <SelectContent>
                {pixels.map((p: any) => (
                  <SelectItem key={p.id} value={p.id}>{p.website_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download className="h-4 w-4 mr-1" /> Export CSV
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[calc(100vh-12rem)]">
        {/* Left: Visitor List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {filteredVisitors.length} Unique Visitors
            </CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search visitors..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <ScrollArea className="h-[calc(100vh-20rem)]">
            <div className="px-4 pb-4 space-y-1">
              {filteredVisitors.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVisitorId(v.id)}
                  className={`w-full text-left rounded-lg p-3 transition-colors ${
                    (selectedVisitor?.id === v.id)
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{displayName(v)}</p>
                        <p className="text-xs text-muted-foreground">{v.ip_address || "No IP"}</p>
                        <p className="text-xs text-muted-foreground">
                          Last seen: {format(new Date(v.last_seen), "MMM d, yyyy h:mm a")}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="shrink-0">{v.total_visits} visits</Badge>
                  </div>
                </button>
              ))}
              {filteredVisitors.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">No visitors found.</p>
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* Right: Intelligence Card */}
        <div className="lg:col-span-2 space-y-4">
          {selectedVisitor ? (
            <>
              {/* Map */}
              {hasLocation && (
                <Card className="overflow-hidden">
                  <VisitorMap
                    latitude={selectedVisitor.latitude}
                    longitude={selectedVisitor.longitude}
                    city={selectedVisitor.city}
                    visitorName={displayName(selectedVisitor)}
                  />
                </Card>
              )}

              {/* Identity Summary */}
              <Card>
                <CardContent className="py-4">
                  <p className="text-sm text-foreground leading-relaxed">
                    <strong>{displayName(selectedVisitor)}</strong>
                    {" "}is {selectedVisitor.full_name ? "an identified" : "an anonymous"} website visitor
                    {selectedVisitor.city && ` from ${selectedVisitor.city}, ${selectedVisitor.state || ""}`}
                    {`, with a total of ${selectedVisitor.total_visits} site visit${selectedVisitor.total_visits !== 1 ? "s" : ""}`}.
                    {selectedVisitor.first_seen && ` They first visited on ${format(new Date(selectedVisitor.first_seen), "M/d/yyyy")}`}
                    {selectedVisitor.last_seen && ` and were last active on ${format(new Date(selectedVisitor.last_seen), "M/d/yyyy")}`}.
                    {selectedVisitor.job_title && ` They work as ${selectedVisitor.job_title}`}
                    {selectedVisitor.company && ` at ${selectedVisitor.company}`}.
                  </p>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedVisitor.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground flex-1">{selectedVisitor.email}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(selectedVisitor.email!)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  {selectedVisitor.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground flex-1">{selectedVisitor.phone}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(selectedVisitor.phone!)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  {(selectedVisitor.city || selectedVisitor.state) && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">
                        {[selectedVisitor.city, selectedVisitor.state].filter(Boolean).join(", ")}
                      </span>
                    </div>
                  )}
                  {selectedVisitor.company && (
                    <div className="flex items-center gap-3">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{selectedVisitor.company}</span>
                    </div>
                  )}
                  {selectedVisitor.education && (
                    <div className="flex items-center gap-3">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{selectedVisitor.education}</span>
                    </div>
                  )}
                  {selectedVisitor.linkedin_url && (
                    <div className="flex items-center gap-3">
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      <a href={selectedVisitor.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                  {selectedVisitor.ip_address && (
                    <div className="flex items-center gap-3">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">IP: {selectedVisitor.ip_address}</span>
                    </div>
                  )}
                  {!selectedVisitor.email && !selectedVisitor.phone && !selectedVisitor.city && (
                    <p className="text-sm text-muted-foreground">No contact information resolved for this visitor.</p>
                  )}
                </CardContent>
              </Card>

              {/* Visit Summary */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Visit Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground">Total Visits</span>
                    <span className="text-sm font-semibold text-foreground">{selectedVisitor.total_visits}</span>
                  </div>
                  <Separator className="mb-3" />
                  <div className="space-y-2">
                    {pageViews?.map((pv) => (
                      <div key={pv.id} className="flex items-start gap-3">
                        <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm text-foreground truncate">{pv.page_url}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(pv.created_at), "MMM d, yyyy h:mm a")}
                            {pv.referrer && ` • via ${pv.referrer}`}
                          </p>
                        </div>
                      </div>
                    ))}
                    {(!pageViews || pageViews.length === 0) && (
                      <p className="text-sm text-muted-foreground">No page views recorded yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-16 text-center text-muted-foreground">
                <Eye className="h-12 w-12 mx-auto mb-4 opacity-40" />
                <p>Select a visitor from the left to view their profile, or create a pixel to start tracking.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
