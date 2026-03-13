import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Video, AlertCircle, Sparkles, ChevronLeft, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import AIThinkingBlock from "@/components/ui/ai-thinking-block";
import { cn } from "@/lib/utils";

interface TranscriptEntry {
  speaker: { display_name: string; matched_calendar_invitee_email?: string | null };
  text: string;
  timestamp: string;
}

interface Meeting {
  id: string;
  title: string;
  recording_id?: string;
  started_at?: string;
  duration_seconds?: number;
  attendees?: Array<{ name?: string; email?: string }>;
  recording?: { id: string };
}

// Extract unique speaker names from transcript
function extractAttendees(transcriptData: any): string[] {
  const names = new Set<string>();
  let entries: TranscriptEntry[] = [];
  if (transcriptData?.transcript && Array.isArray(transcriptData.transcript)) {
    entries = transcriptData.transcript;
  } else if (Array.isArray(transcriptData)) {
    entries = transcriptData;
  }
  entries.forEach((e) => {
    if (e.speaker?.display_name) names.add(e.speaker.display_name);
  });
  return Array.from(names);
}

// Extract meeting date from the meeting data
function getMeetingDate(meeting: Meeting): string {
  return meeting.started_at ? new Date(meeting.started_at).toLocaleDateString() : "—";
}

// Parse summary sections from markdown-like format into structured cards
function parseSummarySections(raw: string): { title: string; body: string }[] {
  if (!raw) return [];
  // Split on ### headings
  const parts = raw.split(/###\s*/);
  const sections: { title: string; body: string }[] = [];
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const lines = trimmed.split("\n");
    let title = lines[0].replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").trim();
    // Remove trailing markdown link artifacts
    title = title.replace(/\(http[^)]*\)/g, "").trim();
    const body = lines.slice(1).join("\n").trim();
    if (body) sections.push({ title, body });
    else if (title) sections.push({ title, body: "" });
  }
  // If no sections found, return entire text as one section
  if (sections.length === 0 && raw.trim()) {
    return [{ title: "Summary", body: raw.trim() }];
  }
  return sections;
}

// Format summary from raw data
function formatSummary(data: any): string {
  if (!data) return "";
  if (typeof data === "string") return data;
  if (data.summary?.markdown_formatted) return data.summary.markdown_formatted;
  if (data.summary && typeof data.summary === "string") return data.summary;
  if (data.summary && typeof data.summary === "object") {
    return data.summary.markdown_formatted || data.summary.text || JSON.stringify(data.summary);
  }
  return "";
}

// Parse transcript entries
function parseTranscript(data: any): TranscriptEntry[] {
  if (!data) return [];
  if (data.transcript && Array.isArray(data.transcript)) return data.transcript;
  if (Array.isArray(data)) return data;
  return [];
}

// Get a color for each speaker
const speakerColors = [
  "bg-primary/10 text-primary border-primary/20",
  "bg-info/10 text-info border-info/20",
  "bg-warning/10 text-warning border-warning/20",
  "bg-success/10 text-success border-success/20",
  "bg-destructive/10 text-destructive border-destructive/20",
];

const SalesConversations = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [transcriptData, setTranscriptData] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [autoAnalyze, setAutoAnalyze] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const { data: conn } = await supabase.from("fathom_connections").select("id").limit(1);
      if (!conn || conn.length === 0) { setConnected(false); setLoading(false); return; }
      setConnected(true);
      const { data, error } = await supabase.functions.invoke("fathom-meetings");
      if (error) {
        console.error("Error loading meetings:", error);
        toast({ title: "Error", description: "Failed to load meetings", variant: "destructive" });
      } else if (data) {
        const items = data.meetings || data.items || data.data || (Array.isArray(data) ? data : []);
        setMeetings(items);
      }
      setLoading(false);
    };
    load();
  }, [toast]);

  const handleMeetingClick = useCallback(async (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setDetailLoading(true);
    setSummaryData(null);
    setTranscriptData(null);
    setAnalysisResult(null);

    const recordingId = meeting.recording?.id || meeting.recording_id || meeting.id;

    try {
      const [sumRes, transRes] = await Promise.all([
        supabase.functions.invoke("fathom-meetings", { body: null, headers: { "x-action": "summary", "x-recording-id": recordingId } }),
        supabase.functions.invoke("fathom-meetings", { body: null, headers: { "x-action": "transcript", "x-recording-id": recordingId } }),
      ]);

      const sData = sumRes.data;
      const tData = transRes.data;
      setSummaryData(sData);
      setTranscriptData(tData);

      // Auto analyze if toggle is on
      if (autoAnalyze && (sData || tData)) {
        handleAnalyzeWithData(meeting, sData, tData);
      }
    } catch (e) {
      console.error("Error fetching meeting details:", e);
    }
    setDetailLoading(false);
  }, [autoAnalyze]);

  const handleAnalyzeWithData = async (meeting: Meeting, sData: any, tData: any) => {
    setAnalyzing(true);
    const summaryText = formatSummary(sData);
    const transcriptText = typeof tData === "string" ? tData : JSON.stringify(tData);
    const attendees = extractAttendees(tData);
    // Use first non-owner attendee as lead name, or fallback
    const leadName = attendees.length > 1 ? attendees[1] : attendees[0] || meeting.title;

    try {
      const { data, error } = await supabase.functions.invoke("analyze-meeting", {
        body: { transcript: transcriptText, summary: summaryText },
      });
      if (error) throw error;

      setAnalysisResult(data);

      // Save to leads table
      const { error: insertError } = await supabase.from("leads").insert({
        meeting_id: meeting.id,
        meeting_title: meeting.title,
        lead_name: leadName,
        meeting_date: meeting.started_at || new Date().toISOString(),
        attendees: attendees.map(name => ({ name })),
        transcript: transcriptText,
        summary: summaryText,
        offer: data.offer,
        objections: data.objections,
        objection_handling: data.objection_handling,
        lead_quality: data.lead_quality,
        suggested_followups: data.suggested_followups,
        status: "pending",
      } as any);

      if (insertError) {
        console.error("Insert error:", insertError);
        toast({ title: "Error", description: "Failed to save lead", variant: "destructive" });
      } else {
        toast({ title: "Lead Created", description: `${leadName} added to leads.` });
      }
    } catch (e) {
      console.error("Analyze error:", e);
      toast({ title: "Analysis Failed", description: "Could not analyze this meeting.", variant: "destructive" });
    }
    setAnalyzing(false);
  };

  const handleAnalyze = () => {
    if (!selectedMeeting) return;
    handleAnalyzeWithData(selectedMeeting, summaryData, transcriptData);
  };

  const formattedSummary = formatSummary(summaryData);
  const transcriptEntries = parseTranscript(transcriptData);
  const attendees = extractAttendees(transcriptData);
  const speakerColorMap: Record<string, string> = {};
  attendees.forEach((name, i) => {
    speakerColorMap[name] = speakerColors[i % speakerColors.length];
  });

  if (selectedMeeting) {
    return (
      <DashboardLayout
        title={selectedMeeting.title || "Meeting Details"}
        subtitle={selectedMeeting.started_at ? new Date(selectedMeeting.started_at).toLocaleString() : ""}
        actions={
          <Button variant="ghost" size="sm" onClick={() => { setSelectedMeeting(null); setAnalysisResult(null); }} className="gap-1.5">
            <ChevronLeft className="h-3.5 w-3.5" /> Back
          </Button>
        }
      >
        <div className="space-y-4">
          {detailLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Attendees */}
              {attendees.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {attendees.map((name) => (
                    <span key={name} className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border", speakerColorMap[name])}>
                      <User className="h-3 w-3" />
                      {name}
                    </span>
                  ))}
                </div>
              )}

              {/* Summary as structured cards */}
              {(() => {
                const sections = parseSummarySections(formattedSummary);
                return sections.length > 0 ? (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-card-foreground flex items-center gap-1.5">📝 Summary</h3>
                    <div className="grid gap-3 lg:grid-cols-2">
                      {sections.map((sec, i) => (
                        <Card key={i} className={sections.length % 2 !== 0 && i === sections.length - 1 ? "lg:col-span-2" : ""}>
                          <CardHeader className="pb-1.5 pt-4 px-4">
                            <CardTitle className="text-xs font-semibold text-card-foreground">{sec.title}</CardTitle>
                          </CardHeader>
                          {sec.body && (
                            <CardContent className="px-4 pb-4 pt-0">
                              <p className="text-sm text-muted-foreground leading-relaxed">{sec.body}</p>
                            </CardContent>
                          )}
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-4">
                      <p className="text-sm text-muted-foreground italic">No summary available.</p>
                    </CardContent>
                  </Card>
                );
              })()}

              {/* Transcript as chat bubbles */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">🎙️ Transcript</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2">
                    {transcriptEntries.length > 0 ? (
                      transcriptEntries.map((entry, i) => (
                        <div key={i} className="flex gap-3">
                          <div className="flex-shrink-0 pt-0.5">
                            <div className={cn("h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold border", speakerColorMap[entry.speaker?.display_name] || speakerColors[0])}>
                              {entry.speaker?.display_name?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2">
                              <span className="text-xs font-semibold text-card-foreground">{entry.speaker?.display_name || "Unknown"}</span>
                              <span className="text-[10px] text-muted-foreground font-mono">{entry.timestamp}</span>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">{entry.text}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No transcript available.</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* AI Analysis */}
              {analyzing ? (
                <AIThinkingBlock label="Analyzing sales call" />
              ) : analysisResult ? (
                <div className="grid gap-4 lg:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">💰 Offer</CardTitle></CardHeader>
                    <CardContent><p className="text-sm text-muted-foreground">{analysisResult.offer}</p></CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">🚫 Objections</CardTitle></CardHeader>
                    <CardContent><p className="text-sm text-muted-foreground">{analysisResult.objections}</p></CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">🛡️ Objection Handling</CardTitle></CardHeader>
                    <CardContent><p className="text-sm text-muted-foreground">{analysisResult.objection_handling}</p></CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">📊 Lead Quality</CardTitle></CardHeader>
                    <CardContent>
                      <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border capitalize",
                        analysisResult.lead_quality === "high" ? "bg-success/15 text-success border-success/30" :
                        analysisResult.lead_quality === "low" ? "bg-destructive/15 text-destructive border-destructive/30" :
                        "bg-warning/15 text-warning border-warning/30"
                      )}>
                        {analysisResult.lead_quality}
                      </span>
                    </CardContent>
                  </Card>
                  <Card className="lg:col-span-2">
                    <CardHeader className="pb-2"><CardTitle className="text-sm">📋 Follow-ups</CardTitle></CardHeader>
                    <CardContent><p className="text-sm text-muted-foreground">{analysisResult.suggested_followups}</p></CardContent>
                  </Card>
                </div>
              ) : (
                <Button
                  onClick={handleAnalyze}
                  disabled={analyzing || (!formattedSummary && transcriptEntries.length === 0)}
                  className="gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Generate AI Lead Notes
                </Button>
              )}
            </>
          )}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Review Sales Calls" subtitle="Meeting recordings synced from Fathom">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : !connected ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
          <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-card-foreground mb-1">Fathom Not Connected</p>
          <p className="text-xs text-muted-foreground mb-4">Connect your Fathom account to sync sales conversations.</p>
          <button onClick={() => navigate("/ad-accounts")} className="text-xs font-medium text-primary underline underline-offset-2 hover:text-primary/80">
            Go to Ad Accounts →
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter meetings" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Meetings</SelectItem>
                <SelectItem value="external">External Only</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Switch id="auto-analyze" checked={autoAnalyze} onCheckedChange={setAutoAnalyze} />
              <Label htmlFor="auto-analyze" className="text-xs text-muted-foreground cursor-pointer">
                Auto AI Lead Notes
              </Label>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wide">Meeting</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wide">Date</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wide">Attendees</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {meetings.length > 0 ? (
                  meetings.map((m) => (
                    <TableRow key={m.id} className="cursor-pointer group" onClick={() => handleMeetingClick(m)}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Video className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-card-foreground">{m.title || "Untitled Meeting"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {getMeetingDate(m)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {m.attendees?.map((a) => a.name || a.email).join(", ") || "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-sm text-muted-foreground">
                      No meetings found. Your Fathom recordings will appear here.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default SalesConversations;
