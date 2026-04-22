import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ExternalLink, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  link?: string;
  linkLabel?: string;
}

const checklistItems: ChecklistItem[] = [
  {
    id: "lead-magnet",
    title: "Create a lead magnet (to collect leads)",
    description:
      "Build a high-converting funnel to capture leads from your ads and organic traffic.",
    link: "https://vertasir.com/templates#funnels/lead_magnet",
    linkLabel: "Browse templates →",
  },
  {
    id: "facebook",
    title: "Create / Login to Facebook Business Account to manage ads",
    description:
      "These will bring you clicks & allow us to track your leads.",
  },
  {
    id: "fathom",
    title: "Create / Login to your free Fathom account",
    description:
      "These will collect data from your sales calls that will allow our AI agents to follow up with leads.",
  },
  {
    id: "social",
    title: "Login to your business social media",
    description:
      "Allow our agents to connect to your business DMs and track & nurture leads into sales.",
  },
  {
    id: "audience",
    title: "Build an audience: get high-intent leads from last 24h",
    description:
      "Target leads searching for your service in the last 24h using big data and sync it directly into Facebook, Google, and spreadsheets, or more.",
  },
  {
    id: "sync",
    title: "Sync your audience",
    description:
      "In Dashboard, you will see your available audiences to be synced. Select the ad account you want to sync the data to.",
  },
  {
    id: "creatives",
    title: "Launch the creatives",
    description:
      "Check our curated library of winning products. Chat to our agent to find winning pain points according to your high-intent leads' pain.",
  },
  {
    id: "ltv-cac",
    title: "Optimize LTV:CAC (Alex Hormozi's secret)",
    description:
      "The ROI for email marketing is around 36 – 45x. Manage your CRM, unlimited funnels, and email marketing on vertasir.com (Angelflows).",
  },
];

export function OnboardingChecklist() {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggle = (id: string) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const completedCount = checked.size;

  return (
    <Card className="mb-6 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/5 to-transparent px-6 pt-6 pb-4">
        <h2 className="text-xl font-semibold text-foreground">
          Hello AngelFlower! 👋🏽
        </h2>
      </div>

      <CardContent className="px-6 pb-6 pt-2">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Launch Checklist
          </p>
          <span className="text-xs text-muted-foreground">
            {completedCount} of {checklistItems.length} completed
          </span>
        </div>

        <div className="divide-y divide-border rounded-lg border border-border">
          {checklistItems.map((item, idx) => {
            const isChecked = checked.has(item.id);
            const isExpanded = expandedId === item.id;

            return (
              <div key={item.id}>
                <button
                  onClick={() =>
                    setExpandedId(isExpanded ? null : item.id)
                  }
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-muted/40 transition-colors"
                >
                  {/* Checkbox circle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggle(item.id);
                    }}
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                      isChecked
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/40"
                    )}
                  >
                    {isChecked && <Check className="h-3.5 w-3.5" />}
                  </button>

                  <span
                    className={cn(
                      "flex-1 text-sm font-medium",
                      isChecked
                        ? "line-through text-muted-foreground"
                        : "text-foreground"
                    )}
                  >
                    {item.title}
                  </span>

                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                      isExpanded && "rotate-180"
                    )}
                  />
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pl-[3.25rem]">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {item.description}
                        </p>
                        {item.link && (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                          >
                            {item.linkLabel || "Learn more"}
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
