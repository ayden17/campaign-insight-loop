export type FunnelStage = "TOF" | "MOF" | "BOF";
export type LeadQuality = "high" | "medium" | "low" | "lost";
export type Recommendation = "increase_budget" | "pause" | "test_creative" | "maintain";

export interface Campaign {
  id: string;
  name: string;
  platform: "meta" | "google";
  status: "active" | "paused";
  funnel: FunnelStage;
  spend: number;
  leads: number;
  qualifiedLeads: number;
  costPerLead: number;
  costPerQualifiedLead: number;
  conversionRate: number;
  revenue: number;
  roas: number;
  leadQuality: { high: number; medium: number; low: number; lost: number };
  recommendation: Recommendation;
}

export interface Lead {
  id: string;
  name: string;
  campaignId: string;
  campaignName: string;
  adSet: string;
  quality: LeadQuality;
  outcome: "closed" | "lost" | "pending";
  callDuration: number; // seconds
  date: string;
}

export interface DashboardMetrics {
  totalSpend: number;
  totalLeads: number;
  totalQualifiedLeads: number;
  costPerLead: number;
  costPerQualifiedLead: number;
  conversionRate: number;
  revenueAttributed: number;
  roas: number;
  spendChange: number;
  leadsChange: number;
  cplChange: number;
  conversionChange: number;
}

export const dashboardMetrics: DashboardMetrics = {
  totalSpend: 48250,
  totalLeads: 1842,
  totalQualifiedLeads: 591,
  costPerLead: 26.19,
  costPerQualifiedLead: 72.45,
  conversionRate: 12.4,
  revenueAttributed: 342800,
  roas: 7.1,
  spendChange: 8.2,
  leadsChange: 14.5,
  cplChange: -5.3,
  conversionChange: 2.1,
};

export const campaigns: Campaign[] = [
  {
    id: "1", name: "RE Luxury Homes – Cold Audience", platform: "meta", status: "active", funnel: "TOF",
    spend: 12400, leads: 520, qualifiedLeads: 156, costPerLead: 23.85, costPerQualifiedLead: 79.49,
    conversionRate: 10.2, revenue: 98500, roas: 7.9,
    leadQuality: { high: 96, medium: 60, low: 240, lost: 124 }, recommendation: "increase_budget",
  },
  {
    id: "2", name: "PropTech SaaS – Retargeting", platform: "meta", status: "active", funnel: "MOF",
    spend: 8200, leads: 312, qualifiedLeads: 125, costPerLead: 26.28, costPerQualifiedLead: 65.60,
    conversionRate: 15.8, revenue: 78200, roas: 9.5,
    leadQuality: { high: 80, medium: 45, low: 112, lost: 75 }, recommendation: "increase_budget",
  },
  {
    id: "3", name: "Commercial RE – Lookalike", platform: "meta", status: "active", funnel: "TOF",
    spend: 9600, leads: 410, qualifiedLeads: 98, costPerLead: 23.41, costPerQualifiedLead: 97.96,
    conversionRate: 7.1, revenue: 52300, roas: 5.4,
    leadQuality: { high: 42, medium: 56, low: 198, lost: 114 }, recommendation: "test_creative",
  },
  {
    id: "4", name: "Agency Lead Gen – Intent", platform: "meta", status: "active", funnel: "BOF",
    spend: 6800, leads: 245, qualifiedLeads: 112, costPerLead: 27.76, costPerQualifiedLead: 60.71,
    conversionRate: 18.4, revenue: 68400, roas: 10.1,
    leadQuality: { high: 72, medium: 40, low: 80, lost: 53 }, recommendation: "increase_budget",
  },
  {
    id: "5", name: "Rental Properties – Broad", platform: "meta", status: "paused", funnel: "TOF",
    spend: 5200, leads: 180, qualifiedLeads: 32, costPerLead: 28.89, costPerQualifiedLead: 162.50,
    conversionRate: 3.2, revenue: 12400, roas: 2.4,
    leadQuality: { high: 12, medium: 20, low: 98, lost: 50 }, recommendation: "pause",
  },
  {
    id: "6", name: "B2B Services – Webinar", platform: "meta", status: "active", funnel: "MOF",
    spend: 6050, leads: 175, qualifiedLeads: 68, costPerLead: 34.57, costPerQualifiedLead: 88.97,
    conversionRate: 11.8, revenue: 33000, roas: 5.5,
    leadQuality: { high: 38, medium: 30, low: 72, lost: 35 }, recommendation: "maintain",
  },
];

export const leads: Lead[] = [
  { id: "l1", name: "Sarah Mitchell", campaignId: "1", campaignName: "RE Luxury Homes – Cold Audience", adSet: "Lookalike 1%", quality: "high", outcome: "closed", callDuration: 420, date: "2026-02-18" },
  { id: "l2", name: "James Thornton", campaignId: "1", campaignName: "RE Luxury Homes – Cold Audience", adSet: "Interest Based", quality: "medium", outcome: "pending", callDuration: 210, date: "2026-02-17" },
  { id: "l3", name: "Diana Ross", campaignId: "2", campaignName: "PropTech SaaS – Retargeting", adSet: "Website Visitors", quality: "high", outcome: "closed", callDuration: 540, date: "2026-02-16" },
  { id: "l4", name: "Mark Chen", campaignId: "3", campaignName: "Commercial RE – Lookalike", adSet: "Lookalike 3%", quality: "low", outcome: "lost", callDuration: 90, date: "2026-02-15" },
  { id: "l5", name: "Elena Vasquez", campaignId: "4", campaignName: "Agency Lead Gen – Intent", adSet: "Custom Audience", quality: "high", outcome: "closed", callDuration: 380, date: "2026-02-14" },
  { id: "l6", name: "Robert Kim", campaignId: "2", campaignName: "PropTech SaaS – Retargeting", adSet: "Email List", quality: "medium", outcome: "pending", callDuration: 260, date: "2026-02-13" },
  { id: "l7", name: "Amanda Foster", campaignId: "5", campaignName: "Rental Properties – Broad", adSet: "Broad Targeting", quality: "low", outcome: "lost", callDuration: 45, date: "2026-02-12" },
  { id: "l8", name: "David Park", campaignId: "4", campaignName: "Agency Lead Gen – Intent", adSet: "Intent Signals", quality: "high", outcome: "closed", callDuration: 490, date: "2026-02-11" },
  { id: "l9", name: "Lisa Wang", campaignId: "6", campaignName: "B2B Services – Webinar", adSet: "Webinar Attendees", quality: "medium", outcome: "pending", callDuration: 310, date: "2026-02-10" },
  { id: "l10", name: "Tom Richards", campaignId: "1", campaignName: "RE Luxury Homes – Cold Audience", adSet: "Lookalike 1%", quality: "lost", outcome: "lost", callDuration: 60, date: "2026-02-09" },
];

export const spendQualityData = [
  { month: "Sep", spend: 32000, highQuality: 180, lowQuality: 420 },
  { month: "Oct", spend: 35000, highQuality: 210, lowQuality: 390 },
  { month: "Nov", spend: 38500, highQuality: 250, lowQuality: 360 },
  { month: "Dec", spend: 41000, highQuality: 280, lowQuality: 340 },
  { month: "Jan", spend: 45000, highQuality: 310, lowQuality: 380 },
  { month: "Feb", spend: 48250, highQuality: 340, lowQuality: 420 },
];

export const funnelData = [
  { stage: "TOF", campaigns: 3, spend: 27200, leads: 1110, qualifiedRate: 25.9 },
  { stage: "MOF", campaigns: 2, spend: 14250, leads: 487, qualifiedRate: 39.6 },
  { stage: "BOF", campaigns: 1, spend: 6800, leads: 245, qualifiedRate: 45.7 },
];

export const dailySpendData = [
  { date: "Feb 1", spend: 1620, leads: 65, qualified: 18 },
  { date: "Feb 3", spend: 1540, leads: 58, qualified: 20 },
  { date: "Feb 5", spend: 1780, leads: 72, qualified: 24 },
  { date: "Feb 7", spend: 1450, leads: 52, qualified: 15 },
  { date: "Feb 9", spend: 1690, leads: 68, qualified: 22 },
  { date: "Feb 11", spend: 1820, leads: 74, qualified: 26 },
  { date: "Feb 13", spend: 1560, leads: 60, qualified: 19 },
  { date: "Feb 15", spend: 1900, leads: 78, qualified: 28 },
  { date: "Feb 17", spend: 1740, leads: 70, qualified: 23 },
  { date: "Feb 19", spend: 1650, leads: 62, qualified: 21 },
  { date: "Feb 21", spend: 1580, leads: 56, qualified: 17 },
];

export function getRecommendationText(rec: Recommendation): string {
  switch (rec) {
    case "increase_budget": return "↑ Increase Budget";
    case "pause": return "⏸ Pause";
    case "test_creative": return "🧪 Test Creative";
    case "maintain": return "→ Maintain";
  }
}

export function getRecommendationColor(rec: Recommendation): string {
  switch (rec) {
    case "increase_budget": return "text-success";
    case "pause": return "text-destructive";
    case "test_creative": return "text-warning";
    case "maintain": return "text-muted-foreground";
  }
}

export function getFunnelColor(stage: FunnelStage): string {
  switch (stage) {
    case "TOF": return "bg-info";
    case "MOF": return "bg-warning";
    case "BOF": return "bg-success";
  }
}
