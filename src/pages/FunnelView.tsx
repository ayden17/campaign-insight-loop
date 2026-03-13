import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { MousePointerClick, Eye, MessageSquare, UserCheck, DollarSign } from "lucide-react";

const stages = [
  { label: "Impressions", value: "12,450", icon: Eye, color: "bg-info/15 text-info border-info/30", width: "100%" },
  { label: "Clicks", value: "3,200", icon: MousePointerClick, color: "bg-primary/15 text-primary border-primary/30", width: "75%" },
  { label: "Leads", value: "840", icon: MessageSquare, color: "bg-warning/15 text-warning border-warning/30", width: "50%" },
  { label: "Qualified", value: "310", icon: UserCheck, color: "bg-success/15 text-success border-success/30", width: "30%" },
  { label: "Closed", value: "78", icon: DollarSign, color: "bg-chart-4/15 text-chart-4 border-chart-4/30", width: "15%" },
];

const FunnelView = () => (
  <DashboardLayout title="Funnel View" subtitle="Campaign classification by funnel stage">
    <div className="flex flex-col items-center gap-2 py-6">
      {stages.map((stage, i) => (
        <motion.div
          key={stage.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="w-full flex justify-center"
        >
          <div
            className={cn(
              "flex items-center justify-between rounded-xl border px-6 py-4 transition-all",
              stage.color
            )}
            style={{ width: stage.width, minWidth: 280 }}
          >
            <div className="flex items-center gap-3">
              <stage.icon className="h-5 w-5 shrink-0" />
              <span className="text-sm font-semibold">{stage.label}</span>
            </div>
            <span className="text-lg font-bold">{stage.value}</span>
          </div>
        </motion.div>
      ))}
    </div>

    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[
        { label: "Click-through Rate", value: "25.7%", sub: "Clicks / Impressions" },
        { label: "Lead Conversion", value: "26.3%", sub: "Leads / Clicks" },
        { label: "Qualification Rate", value: "36.9%", sub: "Qualified / Leads" },
        { label: "Close Rate", value: "25.2%", sub: "Closed / Qualified" },
      ].map((m) => (
        <div key={m.label} className="rounded-xl border border-border bg-card p-4">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{m.label}</p>
          <p className="text-2xl font-bold text-card-foreground mt-1">{m.value}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{m.sub}</p>
        </div>
      ))}
    </div>
  </DashboardLayout>
);

export default FunnelView;
