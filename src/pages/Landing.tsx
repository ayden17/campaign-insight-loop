import { useNavigate } from "react-router-dom";
import {
  Check,
  Workflow,
  ClipboardList,
  Phone,
  Home,
  Rocket,
  Users,
  TrendingUp,
} from "lucide-react";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { HeroVideoDialog } from "@/components/ui/hero-video-dialog";
import dashboardAnalytics from "@/assets/dashboard-analytics.png";

const FEATURES = [
  "Budget-Based Billing",
  "Leads or appointments",
  "Pre Screened Prospects",
  "Exclusive - Never Shared",
];

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Homeowners Request A Project Estimate",
    description:
      "They are pre-screened with a targeted questionnaire to ensure high quality.",
  },
  {
    step: "2",
    title: "You Are Matched With Homeowner Lead",
    description: "Leads or appointments are sent to your sales team.",
  },
  {
    step: "3",
    title: "You Get New, High-Quality Customers",
    description:
      "Your estimator visits the home, quotes & closes new customers.",
  },
];

const HOW_WE_HELP = [
  {
    icon: ClipboardList,
    title: "Lead Generation: 100% Exclusively Yours",
    description:
      "Get 100% exclusive homeowner leads, guaranteed. We never share your opportunities with other contractors. This will give you more influence, higher trust and a better chance of winning each job.",
  },
  {
    icon: Phone,
    title: "After-Hours Call Center: Never Miss a Lead Again",
    description:
      "If your office is closed when leads call, you could lose business. Our call center works 7 days a week, up to 15 hours daily, answering your calls, capturing leads and making appointments for you.",
  },
  {
    icon: Home,
    title: "Appointments Setting: We Handle the Outreach for You",
    description:
      "We can take care of all your prospect outreach, follow-ups and calendar scheduling with a guaranteed set rate, so your team can stay focused on closing deals.",
  },
];

const SERVICES = [
  { name: "Roofing", emoji: "🏠" },
  { name: "Siding", emoji: "🧱" },
  { name: "Window Replacement", emoji: "🪟" },
  { name: "Bathroom Remodeling", emoji: "🛁" },
  { name: "Kitchen Remodeling", emoji: "🍳" },
  { name: "HVAC", emoji: "❄️" },
];

const STATS = [
  { icon: Rocket, value: "25,000+", label: "Weekly Leads" },
  { icon: Users, value: "10,000", label: "Daily Homeowner Visits" },
  { icon: TrendingUp, value: "10,000", label: "Exclusive Leads Delivered" },
];

const BLUE = "hsl(217 91% 60%)";
const BLUE_HOVER = "hsl(217 91% 55%)";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen bg-background relative overflow-hidden"
      style={{
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        color: "hsl(222 25% 12%)",
        letterSpacing: "-0.01em",
      }}
    >
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
      <section id="hero" className="relative pt-28 md:pt-32 pb-8 md:pb-10">
        <div className="container mx-auto px-6 max-w-4xl text-center relative z-10">
          <div className="flex flex-col items-center gap-2 mb-3">
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "hsl(217 91% 60% / 0.08)" }}
            >
              <Workflow
                className="h-5 w-5"
                style={{ color: BLUE }}
                strokeWidth={1.75}
              />
            </div>
            <p
              className="text-[13px] font-light text-muted-foreground"
              style={{ letterSpacing: "-0.01em" }}
            >
              For Contracting Businesses
            </p>
          </div>

          <h1
            className="text-2xl md:text-3xl lg:text-[38px] font-normal leading-[1.15] mb-3 max-w-3xl mx-auto"
            style={{ letterSpacing: "-0.035em", color: "hsl(222 30% 14%)" }}
          >
            Scale your Contracting Business By Getting Qualified &amp; Exclusive Appointments Without Lifting a Finger
          </h1>

          <p
            className="text-sm md:text-base font-light text-muted-foreground max-w-xl mx-auto mb-5"
            style={{ letterSpacing: "-0.01em" }}
          >
            Don't Pay Ad Spend or Monthly Retainers, Just Pay-Per-Appointment.
          </p>

          <button
            onClick={() => navigate("/auth")}
            className="h-10 px-6 rounded-full text-white text-sm font-medium shadow-md transition-colors"
            style={{ backgroundColor: BLUE, letterSpacing: "-0.01em" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = BLUE_HOVER)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = BLUE)
            }
          >
            Book a call
          </button>
        </div>

        {/* Video */}
        <div className="container mx-auto px-6 max-w-5xl mt-8 md:mt-10 relative z-10">
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
                  style={{ backgroundColor: BLUE }}
                >
                  <Check className="h-5 w-5 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-base md:text-lg font-medium" style={{ letterSpacing: "-0.01em" }}>
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── How it Works ───── */}
      <section
        id="how-it-works"
        className="relative py-16 md:py-20 border-t border-border/60"
      >
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
          <h2
            className="text-2xl md:text-4xl font-normal text-center mb-10 md:mb-14"
            style={{ letterSpacing: "-0.035em" }}
          >
            How it Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border/60 rounded-2xl overflow-hidden border border-border/60">
            {HOW_IT_WORKS.map((item) => (
              <div
                key={item.step}
                className="flex flex-col items-start text-left bg-card p-8 md:p-10 min-h-[280px]"
              >
                <div
                  className="h-11 w-11 rounded-full flex items-center justify-center text-white text-base font-medium mb-10"
                  style={{ backgroundColor: BLUE }}
                >
                  {item.step}
                </div>
                <h3
                  className="text-lg md:text-xl font-medium mb-3 leading-snug"
                  style={{ color: BLUE, letterSpacing: "-0.025em" }}
                >
                  {item.title}
                </h3>
                <p
                  className="text-muted-foreground text-sm md:text-[15px] font-light leading-relaxed"
                  style={{ letterSpacing: "-0.005em" }}
                >
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── How AngelFlows helps ───── */}
      <section
        id="operations"
        className="relative py-16 md:py-20 border-t border-border/60"
      >
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
          <h2
            className="text-2xl md:text-4xl font-normal text-center mb-10 md:mb-14"
            style={{ letterSpacing: "-0.035em" }}
          >
            How AngelFlows Helps Contractors
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border/60 rounded-2xl overflow-hidden border border-border/60">
            {HOW_WE_HELP.map((item) => (
              <div
                key={item.title}
                className="flex flex-col items-start text-left bg-card p-8 md:p-10 min-h-[280px]"
              >
                <div
                  className="h-11 w-11 rounded-full flex items-center justify-center mb-10"
                  style={{ backgroundColor: BLUE }}
                >
                  <item.icon className="h-5 w-5 text-white" strokeWidth={1.75} />
                </div>
                <h3
                  className="text-lg md:text-xl font-medium mb-3 leading-snug"
                  style={{ color: BLUE, letterSpacing: "-0.025em" }}
                >
                  {item.title}
                </h3>
                <p
                  className="text-muted-foreground text-sm md:text-[15px] font-light leading-relaxed"
                  style={{ letterSpacing: "-0.005em" }}
                >
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Leads or Appointments ───── */}
      <section className="relative py-20 md:py-28 border-t border-border/60">
        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <h2 className="text-3xl md:text-5xl font-medium text-center mb-14" style={{ letterSpacing: "-0.03em" }}>
            Leads or Appointments
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {SERVICES.map((service) => (
              <div
                key={service.name}
                className="rounded-2xl border border-border/80 bg-card p-8 flex flex-col items-center justify-center text-center transition-all hover:shadow-lg"
                style={{
                  backgroundImage:
                    "linear-gradient(180deg, hsl(217 91% 60% / 0.02), transparent), linear-gradient(to right, hsl(217 91% 60% / 0.06) 1px, transparent 1px), linear-gradient(to bottom, hsl(217 91% 60% / 0.06) 1px, transparent 1px)",
                  backgroundSize: "auto, 24px 24px, 24px 24px",
                }}
              >
                <div className="text-6xl md:text-7xl mb-6">{service.emoji}</div>
                <p
                  className="text-lg md:text-xl font-medium"
                  style={{ color: BLUE, letterSpacing: "-0.02em" }}
                >
                  {service.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Why Us ───── */}
      <section
        id="why-us"
        className="relative py-20 md:py-28 border-t border-border/60"
      >
        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-5xl font-medium mb-4" style={{ letterSpacing: "-0.03em" }}>
              Why Choose Us?
            </h2>
            <p className="text-muted-foreground text-lg font-light">
              Connect with motivated homeowners actively searching for your services.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-border/80 bg-card p-8 flex flex-col items-start"
                style={{
                  background:
                    "linear-gradient(180deg, hsl(217 91% 60% / 0.04), transparent)",
                }}
              >
                <stat.icon
                  className="h-9 w-9 mb-6"
                  style={{ color: BLUE }}
                  strokeWidth={2}
                />
                <p
                  className="text-4xl md:text-5xl font-medium mb-3"
                  style={{ color: BLUE, letterSpacing: "-0.03em" }}
                >
                  {stat.value}
                </p>
                <p className="text-muted-foreground text-base font-light">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Testimonials / CTA ───── */}
      <section
        id="testimonials"
        className="relative py-24 md:py-32 border-t border-border/60"
      >
        <div className="container mx-auto px-6 max-w-3xl text-center relative z-10">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground mb-4">
            Get Started
          </p>
          <h2 className="text-3xl md:text-5xl font-medium mb-10 leading-tight" style={{ letterSpacing: "-0.03em" }}>
            Ready to grow your contracting business?
          </h2>
          <button
            onClick={() => navigate("/auth")}
            className="h-12 px-8 rounded-full text-white text-base font-medium shadow-lg transition-colors"
            style={{ backgroundColor: BLUE, letterSpacing: "-0.01em" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = BLUE_HOVER)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = BLUE)
            }
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
            <a href="#" className="hover:text-foreground transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
