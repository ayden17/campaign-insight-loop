import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Play,
  FileWarning,
  Eye,
  ShieldAlert,
  FolderLock,
  Cable,
  HeartPulse,
  Wheat,
  Gem,
  Fuel,
  ShieldCheck,
  Workflow,
  PhoneCall,
  Sparkles,
} from "lucide-react";
import dashboardAnalytics from "@/assets/dashboard-analytics.png";
import dashboardOffice from "@/assets/dashboard-office.png";
import dashboardSourcing from "@/assets/dashboard-sourcing.png";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingNavbar />

      {/* ───── Hero ───── */}
      <section className="relative overflow-hidden pt-28 pb-10 md:pt-36 md:pb-16">
        <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
          {/* Status pill */}
          <div className="inline-flex items-center gap-3 rounded-full border border-border bg-muted/60 px-5 py-2 text-xs mb-8">
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
              </span>
              <span className="font-semibold text-foreground">NOW</span>
            </span>
            <span className="text-muted-foreground">accepting new enterprise pilots</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] mb-6">
            The Operating System for{" "}
            <span className="text-muted-foreground">
              Physical Trade Execution
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop losing margin to "Ops Drag." AngelFlows deploys a fleet of autonomous, human‑governed agents to handle your document reconciliation, market monitoring, and logistics tracking—24/7.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="text-base px-8 gap-2 rounded-full" onClick={() => navigate("/auth")}>
              <PhoneCall className="h-4 w-4" /> Book an Ops Audit
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8 gap-2 rounded-full" onClick={() => navigate("/auth")}>
              Deploy Your First Agent <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* ───── Product Showcase Cards ───── */}
      <section className="pb-20 md:pb-28">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Card 1 - Agent Analytics */}
            <div className="rounded-2xl border border-border bg-muted/30 overflow-hidden">
              <div className="p-6">
                <img
                  src={dashboardAnalytics}
                  alt="Agent analytics dashboard showing sessions, costs, and leaderboard"
                  className="rounded-lg w-full shadow-sm"
                />
              </div>
              <div className="px-6 pb-6">
                <h3 className="text-xl font-bold mb-1">Automate Reconciliation</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Agents parse PDFs, validate data, and reconcile trades across your entire book—autonomously.
                </p>
              </div>
            </div>

            {/* Card 2 - Virtual Office */}
            <div className="rounded-2xl border border-border bg-muted/30 overflow-hidden">
              <div className="p-6">
                <img
                  src={dashboardOffice}
                  alt="Virtual office with autonomous trade agents working"
                  className="rounded-lg w-full shadow-sm"
                />
              </div>
              <div className="px-6 pb-6">
                <h3 className="text-xl font-bold mb-1">Automate Monitoring</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Agents monitor LME, CBOT, and ICE spreads—triggering hedge checks and alerts in real time.
                </p>
              </div>
            </div>

            {/* Card 3 - Sourcing */}
            <div className="rounded-2xl border border-border bg-muted/30 overflow-hidden">
              <div className="p-6">
                <img
                  src={dashboardSourcing}
                  alt="Source and match counterparties with AI scoring"
                  className="rounded-lg w-full shadow-sm"
                />
              </div>
              <div className="px-6 pb-6">
                <h3 className="text-xl font-bold mb-1">Learn from Execution</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  AI learns your trade preferences so that you can put operations on autopilot.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── Pain Points ───── */}
      <section id="pain" className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-6 max-w-5xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4 text-center">The Reality Check</p>
          <h2 className="text-3xl md:text-4xl font-bold text-center max-w-3xl mx-auto mb-14 leading-snug">
            Commodities move at the speed of light.{" "}
            <span className="text-muted-foreground">Your back office shouldn't move at the speed of Excel.</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: FileWarning,
                title: "Document Chaos",
                desc: "Stop manually scraping data from PDF Bills of Lading and port certificates. Let agents parse, validate, and reconcile in seconds.",
              },
              {
                icon: Eye,
                title: "Market Blindspots",
                desc: "Agents monitor global exchanges (LME, CBOT, ICE) while you sleep—surfacing spread alerts and hedge triggers in real time.",
              },
              {
                icon: ShieldAlert,
                title: "Compliance Risk",
                desc: 'Eliminate "fat‑finger" errors with automated trade entry and mandatory human‑in‑the‑loop approvals before any position is confirmed.',
              },
            ].map((item) => (
              <Card key={item.title} className="border-border/60 bg-card/80 backdrop-blur-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6 flex flex-col gap-4">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <item.icon className="h-5 w-5 text-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ───── How It Works ───── */}
      <section id="how" className="py-20 md:py-28">
        <div className="container mx-auto px-6 max-w-5xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4 text-center">The Tech Stack</p>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-14">
            Truly Agentic. <span className="text-muted-foreground">Fully Governed.</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: FolderLock,
                step: "01",
                title: "The Workspace",
                desc: 'Define your "Deal Folder." Every trade gets a secure sandbox where agents process files, run scripts, and store data.',
              },
              {
                icon: Cable,
                step: "02",
                title: "The Adapters",
                desc: 'Connect the "Brain" (Claude, Gemini) to the "Body" (Bash scripts, HTTP APIs, and Git) — all through composable adapters.',
              },
              {
                icon: HeartPulse,
                step: "03",
                title: "The Heartbeat",
                desc: "Your agents wake up on a schedule or trigger, perform their tasks, and pause for your approval before finalizing any trade.",
              },
            ].map((item) => (
              <div key={item.step} className="relative flex flex-col gap-4">
                <span className="text-6xl font-black text-muted/80 absolute -top-2 -left-1 select-none">{item.step}</span>
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center relative z-10 mt-6">
                  <item.icon className="h-5 w-5 text-foreground" />
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Use Cases ───── */}
      <section id="uses" className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-6 max-w-5xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4 text-center">Raw Materials Focus</p>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-14">
            Built for the Physical World
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Wheat,
                title: "Agri‑Broking",
                desc: "Automatically reconcile weight certificates against trade captures for grain shipments — no more manual cross‑checks.",
              },
              {
                icon: Gem,
                title: "Metals & Mining",
                desc: "An agent that monitors LME price spreads and triggers a hedge‑check script in your terminal when thresholds are breached.",
              },
              {
                icon: Fuel,
                title: "Energy & Bunkering",
                desc: "Document‑clerks that read bunker delivery notes and flag discrepancies in fuel density or quantity before settlement.",
              },
            ].map((item) => (
              <Card key={item.title} className="border-border/60 bg-card/80 backdrop-blur-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6 flex flex-col gap-4">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <item.icon className="h-5 w-5 text-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Trust & Governance ───── */}
      <section id="trust" className="py-20 md:py-28">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="h-7 w-7 text-foreground" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            AI with an <span className="text-muted-foreground">"Off" Switch.</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            We don't believe in "Black Box" automation. AngelFlows includes a Governance Layer that forces agents to seek human approval for critical actions. You keep the keys; the agents do the work.
          </p>
        </div>
      </section>

      {/* ───── Footer CTA ───── */}
      <section className="py-20 md:py-28 bg-foreground text-background">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to automate the messy middle of your trade desk?
          </h2>
          <Button
            size="lg"
            variant="secondary"
            className="text-base px-8 gap-2 rounded-full"
            onClick={() => navigate("/auth")}
          >
            Book an Ops Audit <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* ───── Footer ───── */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Workflow className="h-4 w-4" />
            <span>AngelFlows © {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
