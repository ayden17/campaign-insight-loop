import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Bot, Mail, MessageSquare, Save, Slack, Zap, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SlackConnection {
  id: string;
  team_name: string | null;
  channel_id: string | null;
}

interface Message {
  id: string;
  channel_type: string;
  direction: string;
  subject: string | null;
  body: string;
  sender: string | null;
  recipient: string | null;
  created_at: string;
  is_read: boolean;
  lead_id: string | null;
}

interface AgentSettings {
  personality: string;
  slack_channel_id: string | null;
  auto_reply_emails: boolean;
  post_lead_grades: boolean;
  alert_high_intent: boolean;
}

const defaultSettings: AgentSettings = {
  personality: "Professional and helpful. Follow up promptly on high-intent leads.",
  slack_channel_id: null,
  auto_reply_emails: false,
  post_lead_grades: true,
  alert_high_intent: true,
};

export default function AgentPage() {
  const [settings, setSettings] = useState<AgentSettings>(defaultSettings);
  const [slackConnections, setSlackConnections] = useState<SlackConnection[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    subscribeToMessages();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [settingsRes, slackRes, messagesRes] = await Promise.all([
        supabase.from("agent_settings").select("*").maybeSingle(),
        supabase.from("slack_connections").select("id, team_name, channel_id"),
        supabase.from("messages").select("*").order("created_at", { ascending: false }).limit(50),
      ]);

      if (settingsRes.data) {
        setSettings({
          personality: settingsRes.data.personality ?? defaultSettings.personality,
          slack_channel_id: settingsRes.data.slack_channel_id,
          auto_reply_emails: settingsRes.data.auto_reply_emails ?? false,
          post_lead_grades: settingsRes.data.post_lead_grades ?? true,
          alert_high_intent: settingsRes.data.alert_high_intent ?? true,
        });
      }

      if (slackRes.data) setSlackConnections(slackRes.data);
      if (messagesRes.data) setMessages(messagesRes.data as Message[]);
    } catch (err) {
      console.error("Failed to load agent data:", err);
    } finally {
      setLoading(false);
    }
  }

  function subscribeToMessages() {
    const channel = supabase
      .channel("agent-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          setMessages((prev) => [payload.new as Message, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  async function saveSettings() {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Please sign in", description: "Authentication required to save settings.", variant: "destructive" });
        return;
      }

      const { error } = await supabase.from("agent_settings").upsert(
        {
          user_id: user.id,
          personality: settings.personality,
          slack_channel_id: settings.slack_channel_id,
          auto_reply_emails: settings.auto_reply_emails,
          post_lead_grades: settings.post_lead_grades,
          alert_high_intent: settings.alert_high_intent,
        },
        { onConflict: "user_id" }
      );

      if (error) throw error;
      toast({ title: "Settings saved", description: "Your agent configuration has been updated." });
    } catch (err) {
      console.error("Save error:", err);
      toast({ title: "Save failed", description: "Could not save settings. Try again.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  function formatTime(dateStr: string) {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return d.toLocaleDateString();
  }

  return (
    <DashboardLayout title="Agent" subtitle="Configure your AI agent's behavior and view communications">
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Agent Configuration</h1>
            <p className="text-sm text-muted-foreground">
              Customize how your AI agent communicates across Slack and Email
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column — Settings */}
          <div className="lg:col-span-1 space-y-5">
            {/* Personality */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Zap className="h-4 w-4 text-warning" />
                    Agent Personality
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Define the tone and style your agent uses when communicating with leads
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={settings.personality}
                    onChange={(e) => setSettings((s) => ({ ...s, personality: e.target.value }))}
                    placeholder="e.g. Professional but aggressive on follow-ups..."
                    className="min-h-[120px] text-sm resize-none"
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* Channel Mapping */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Slack className="h-4 w-4 text-info" />
                    Lead Alert Channel
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Select which Slack channel receives lead intelligence alerts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {slackConnections.length > 0 ? (
                    <Select
                      value={settings.slack_channel_id ?? ""}
                      onValueChange={(v) => setSettings((s) => ({ ...s, slack_channel_id: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a channel" />
                      </SelectTrigger>
                      <SelectContent>
                        {slackConnections.map((conn) => (
                          <SelectItem key={conn.id} value={conn.channel_id ?? conn.id}>
                            #{conn.team_name ? `${conn.team_name} — leads-intelligence` : "leads-intelligence"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      No Slack workspace connected. Go to{" "}
                      <a href="/settings" className="text-primary underline">
                        Settings
                      </a>{" "}
                      to connect.
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Action Rules */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    Action Rules
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Control what the agent does automatically
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <Checkbox
                      checked={settings.auto_reply_emails}
                      onCheckedChange={(v) => setSettings((s) => ({ ...s, auto_reply_emails: !!v }))}
                      className="mt-0.5"
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">Auto-reply to emails</p>
                      <p className="text-xs text-muted-foreground">
                        Agent drafts and sends email replies based on your personality settings
                      </p>
                    </div>
                  </label>

                  <Separator />

                  <label className="flex items-start gap-3 cursor-pointer">
                    <Checkbox
                      checked={settings.post_lead_grades}
                      onCheckedChange={(v) => setSettings((s) => ({ ...s, post_lead_grades: !!v }))}
                      className="mt-0.5"
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">Post lead grades to Slack</p>
                      <p className="text-xs text-muted-foreground">
                        Share lead quality scores in your connected Slack channel
                      </p>
                    </div>
                  </label>

                  <Separator />

                  <label className="flex items-start gap-3 cursor-pointer">
                    <Checkbox
                      checked={settings.alert_high_intent}
                      onCheckedChange={(v) => setSettings((s) => ({ ...s, alert_high_intent: !!v }))}
                      className="mt-0.5"
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">Alert on high-intent emails</p>
                      <p className="text-xs text-muted-foreground">
                        Get a Slack notification when a lead sends a high-intent email
                      </p>
                    </div>
                  </label>
                </CardContent>
              </Card>
            </motion.div>

            <Button onClick={saveSettings} disabled={saving} className="w-full gap-2">
              <Save className="h-4 w-4" />
              {saving ? "Saving…" : "Save Configuration"}
            </Button>
          </div>

          {/* Right Column — Unified Feed */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Unified Communication Feed
                </CardTitle>
                <CardDescription className="text-xs">
                  Combined timeline of Slack messages and Email threads with your leads
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
                    Loading messages…
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
                      <MessageSquare className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground">No messages yet</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-[280px]">
                      Messages from Slack threads and Email conversations will appear here in a unified timeline
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1 max-h-[600px] overflow-y-auto pr-1">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors",
                          !msg.is_read && "bg-primary/5"
                        )}
                      >
                        {/* Channel icon */}
                        <div
                          className={cn(
                            "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
                            msg.channel_type === "slack"
                              ? "bg-info/10 text-info"
                              : "bg-warning/10 text-warning"
                          )}
                        >
                          {msg.channel_type === "slack" ? (
                            <Slack className="h-3.5 w-3.5" />
                          ) : (
                            <Mail className="h-3.5 w-3.5" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-foreground truncate">
                              {msg.sender ?? "Unknown"}
                            </span>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px] px-1.5 py-0",
                                msg.direction === "inbound"
                                  ? "border-success/30 text-success"
                                  : "border-info/30 text-info"
                              )}
                            >
                              {msg.direction === "inbound" ? (
                                <ArrowDownLeft className="h-2.5 w-2.5 mr-0.5" />
                              ) : (
                                <ArrowUpRight className="h-2.5 w-2.5 mr-0.5" />
                              )}
                              {msg.direction}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground ml-auto shrink-0">
                              {formatTime(msg.created_at)}
                            </span>
                          </div>
                          {msg.subject && (
                            <p className="text-xs font-medium text-foreground mt-0.5 truncate">
                              {msg.subject}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {msg.body}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
