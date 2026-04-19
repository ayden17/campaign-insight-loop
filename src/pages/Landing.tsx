import { useNavigate } from "react-router-dom";
import { Check, Workflow } from "lucide-react";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { HeroVideoDialog } from "@/components/ui/hero-video-dialog";
import dashboardAnalytics from "@/assets/dashboard-analytics.png";

const FEATURES = [
  "Budget-Based Billing",
  "Leads or appointments",
  "Pre Screened Prospects",
  "Exclusive - Never Shared",
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Subtle grid background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(to right, hsl(0 0% 90%) 1px, transparent 1px), linear-gradient(to bottom, hsl(0 0% 90%) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse at 50% 30%, black 40%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at 50% 30%, black 40%, transparent 75%)",
        }}
      />

      <LandingNavbar />

      {/* ───── Hero ───── */}
      <section
        id="hero"
        className="relative pt-36 md:pt-44 pb-16 md:pb-24"
      >
        <div className="container mx-auto px-6 max-w-5xl text-center relative z-10">
          {/* Eyebrow icon + label */}
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="h-14 w-14 rounded-2xl bg-[hsl(217_91%_60%/0.08)] flex items-center justify-center">
              <Workflow
                className="h-7 w-7"
                style={{ color: "hsl(217 91% 60%)" }}
                strokeWidth={2.5}
              />
            </div>
            <p className="text-base font-semibold text-foreground">
              For Commodity Trading Desks
            </p>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-[68px] font-extrabold tracking-tight leading-[1.05] mb-8 max-w-4xl mx-auto">
            Scale your Trading Desk By Automating{" "}
            <span className="whitespace-nowrap">Document & Market Ops</span>{" "}
            Without Lifting a Finger
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Don't pay for ad spend or bloated software retainers — deploy autonomous, human-governed agents that handle the messy middle of every trade.
          </p>

          <button
            onClick={() => navigate("/auth")}
            className="h-12 px-8 rounded-full bg-[hsl(217_91%_60%)] text-white text-base font-semibold shadow-lg hover:bg-[hsl(217_91%_55%)] transition-colors"
          >
            Book a call
          </button>
        </div>

        {/* Video */}
        <div className="container mx-auto px-6 max-w-5xl mt-14 md:mt-20 relative z-10">
          <div
            className="rounded-3xl p-2"
            style={{
              background:
                "linear-gradient(180deg, hsl(217 91% 60% / 0.25), hsl(217 91% 60% / 0.05))",
              boxShadow: "0 30px 80px -30px hsl(217 91% 60% / 0.45)",
            }}
          >
            <HeroVideoDialog
              animationStyle="from-center"
              videoSrc="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
              thumbnailSrc={dashboardAnalytics}
              thumbnailAlt="AngelFlows product demo"
              className="rounded-2xl overflow-hidden"
            />
          </div>

          {/* Feature checkmarks */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4 mt-12 md:mt-16">
            {FEATURES.map((feature) => (
              <div
                key={feature}
                className="flex flex-col items-center text-center gap-3"
              >
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "hsl(217 91% 60%)" }}
                >
                  <Check
                    className="h-5 w-5 text-white"
                    strokeWidth={3}
                  />
                </div>
                <span className="text-base md:text-lg font-semibold text-foreground">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Operations ───── */}
      <section
        id="operations"
        className="relative py-24 md:py-32 border-t border-border/60"
      >
        <div className="container mx-auto px-6 max-w-5xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Operations
          </p>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            Commodities move at light speed.{" "}
            <span className="text-muted-foreground">
              Your back office shouldn't move at the speed of Excel.
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            AngelFlows agents reconcile PDFs, monitor LME/CBOT/ICE spreads, and track logistics 24/7 — pausing for human approval before any trade is finalized.
          </p>
        </div>
      </section>

      {/* ───── Testimonials placeholder ───── */}
      <section
        id="testimonials"
        className="relative py-24 md:py-32 border-t border-border/60"
      >
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Testimonials
          </p>
          <h2 className="text-3xl md:text-5xl font-bold mb-10 leading-tight">
            Trusted by trade desks who refuse to lose margin to ops drag.
          </h2>
          <button
            onClick={() => navigate("/auth")}
            className="h-12 px-8 rounded-full bg-[hsl(217_91%_60%)] text-white text-base font-semibold shadow-lg hover:bg-[hsl(217_91%_55%)] transition-colors"
          >
            Book a call
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 py-8 relative z-10">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>AngelFlows © {new Date().getFullYear()}</span>
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
