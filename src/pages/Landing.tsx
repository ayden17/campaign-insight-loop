import { useNavigate } from "react-router-dom";
import {
  Check,
  ClipboardList,
  Phone,
  Home,
  Rocket,
  Users,
  TrendingUp,
} from "lucide-react";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { HeroVideoDialog } from "@/components/ui/hero-video-dialog";
import { useInView } from "@/hooks/use-in-view";
import dashboardAnalytics from "@/assets/dashboard-analytics.png";
import houseIcon from "@/assets/house-icon.png";
import serviceRoofing from "@/assets/service-roofing.png";
import serviceSiding from "@/assets/service-siding.png";
import serviceWindow from "@/assets/service-window.png";
import serviceBathroom from "@/assets/service-bathroom.png";
import serviceHvac from "@/assets/service-hvac.png";

const DISPLAY_FONT = "'Degular Display', 'General Sans', 'Inter', system-ui, -apple-system, sans-serif";

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
  { name: "Roofing", image: serviceRoofing },
  { name: "Siding", image: serviceSiding },
  { name: "Window Replacement", image: serviceWindow },
  { name: "Bathroom Remodeling", image: serviceBathroom },
  { name: "Kitchen Remodeling", image: serviceBathroom },
  { name: "HVAC", image: serviceHvac },
];

const STATS = [
  { icon: Rocket, value: "25,000+", label: "Weekly Leads" },
  { icon: Users, value: "10,000", label: "Daily Homeowner Visits" },
  { icon: TrendingUp, value: "10,000", label: "Exclusive Leads Delivered" },
];

const BLUE = "hsl(217 91% 60%)";
const BLUE_HOVER = "hsl(217 91% 55%)";
const SLATE = "hsl(215 25% 17%)"; // #1e293b deep slate charcoal
const SLATE_SOFT = "hsl(215 20% 35%)";
const SLATE_MUTED = "hsl(215 15% 55%)"; // lighter gray for subtitles

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen bg-white relative overflow-hidden"
      style={{
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        color: SLATE,
        letterSpacing: "-0.01em",
      }}
    >
      {/* Very subtle grid background — only behind hero */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[900px] opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(to right, hsl(220 13% 91%) 1px, transparent 1px), linear-gradient(to bottom, hsl(220 13% 91%) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse at 50% 25%, black 35%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at 50% 25%, black 35%, transparent 70%)",
        }}
      />

      <LandingNavbar />

      {/* ───── Hero ───── */}
      <section id="hero" className="relative pt-28 md:pt-32 pb-8 md:pb-10">
        <div className="container mx-auto px-6 max-w-4xl text-center relative z-10">
          <div className="flex flex-col items-center gap-3 mb-4">
            <img
              src={houseIcon}
              alt="AngelFlows house icon"
              className="h-16 md:h-20 w-auto object-contain"
              loading="eager"
            />
            <p
              className="text-sm md:text-[15px] font-medium"
              style={{ letterSpacing: "-0.01em", color: SLATE }}
            >
              For Contracting Businesses
            </p>
          </div>

          <Reveal as="h1"
            className="text-[28px] sm:text-3xl md:text-4xl lg:text-5xl font-medium mb-4 max-w-4xl mx-auto"
            style={{
              fontFamily: DISPLAY_FONT,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              color: SLATE,
            }}
          >
            Scale your Contracting Business By Getting Qualified &amp; Exclusive Appointments Without Lifting a Finger
          </Reveal>

          <p
            className="text-sm md:text-base max-w-xl mx-auto mb-6"
            style={{ fontFamily: DISPLAY_FONT, fontWeight: 400, letterSpacing: "-0.01em", color: SLATE_MUTED }}
          >
            Don't Pay Ad Spend or Monthly Retainers, Just Pay-Per-Appointment.
          </p>

          <button
            onClick={() => navigate("/auth")}
            className="h-11 px-7 rounded-xl text-white text-sm shadow-md transition-colors"
            style={{
              backgroundColor: BLUE,
              fontWeight: 500,
              letterSpacing: "0.02em",
            }}
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
            {FEATURES.map((feature, idx) => (
              <Reveal
                key={feature}
                delay={idx * 100}
                className="flex flex-col items-center text-center gap-3"
              >
                <div
                  className="h-9 w-9 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: BLUE }}
                >
                  <Check className="h-4 w-4 text-white" strokeWidth={2.5} />
                </div>
                <span
                  className="text-sm md:text-[15px]"
                  style={{ fontFamily: DISPLAY_FONT, fontWeight: 400, letterSpacing: "-0.005em", color: SLATE }}
                >
                  {feature}
                </span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───── How it Works ───── */}
      <HowItWorksSection />

      {/* ───── How AngelFlows helps ───── */}
      <section
        id="operations"
        className="relative bg-white py-16 md:py-20 border-t"
        style={{ borderColor: "hsl(220 13% 93%)" }}
      >
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
          <Reveal as="h2"
            className="text-3xl md:text-4xl text-center mb-10 md:mb-14"
            style={{ fontFamily: DISPLAY_FONT, letterSpacing: "-0.03em", fontWeight: 500, color: SLATE, lineHeight: 1.1 }}
          >
            How AngelFlows Helps Contractors
          </Reveal>
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-px rounded-2xl overflow-hidden border"
            style={{ backgroundColor: "hsl(220 13% 93%)", borderColor: "hsl(220 13% 93%)" }}
          >
            {HOW_WE_HELP.map((item, idx) => (
              <RevealCard key={item.title} delay={idx * 100}>
                <div
                  className="h-11 w-11 rounded-full flex items-center justify-center mb-10"
                  style={{ backgroundColor: BLUE }}
                >
                  <item.icon className="h-5 w-5 text-white" strokeWidth={1.75} />
                </div>
                <h3
                  className="text-lg md:text-xl mb-3 leading-snug"
                  style={{ fontFamily: DISPLAY_FONT, color: BLUE, letterSpacing: "-0.02em", fontWeight: 500 }}
                >
                  {item.title}
                </h3>
                <p
                  className="text-sm md:text-[15px] leading-relaxed"
                  style={{ fontFamily: DISPLAY_FONT, letterSpacing: "-0.005em", color: SLATE_SOFT, fontWeight: 400 }}
                >
                  {item.description}
                </p>
              </RevealCard>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Leads or Appointments ───── */}
      <section
        className="relative bg-white py-20 md:py-28 border-t"
        style={{ borderColor: "hsl(220 13% 93%)" }}
      >
        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <Reveal as="h2"
            className="text-3xl md:text-5xl text-center mb-14"
            style={{ fontFamily: DISPLAY_FONT, letterSpacing: "-0.03em", fontWeight: 500, color: SLATE, lineHeight: 1.1 }}
          >
            Leads or Appointments
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {SERVICES.map((service, idx) => (
              <Reveal
                key={service.name}
                delay={idx * 100}
                className="rounded-2xl border bg-white p-8 flex flex-col items-center justify-center text-center transition-all hover:shadow-md"
                style={{ borderColor: "hsl(220 13% 93%)" }}
              >
                <img
                  src={service.image}
                  alt={service.name}
                  className="h-24 md:h-28 w-auto object-contain mb-6"
                  loading="lazy"
                />
                <p
                  className="text-lg md:text-xl"
                  style={{ fontFamily: DISPLAY_FONT, color: BLUE, letterSpacing: "-0.02em", fontWeight: 500 }}
                >
                  {service.name}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Why Us ───── */}
      <section
        id="why-us"
        className="relative bg-white py-20 md:py-28 border-t"
        style={{ borderColor: "hsl(220 13% 93%)" }}
      >
        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <div className="text-center mb-14">
            <Reveal as="h2"
              className="text-3xl md:text-5xl mb-4"
              style={{ fontFamily: DISPLAY_FONT, letterSpacing: "-0.03em", fontWeight: 500, color: SLATE, lineHeight: 1.1 }}
            >
              Why Choose Us?
            </Reveal>
            <Reveal as="p"
              delay={100}
              className="text-base md:text-lg"
              style={{ fontFamily: DISPLAY_FONT, color: SLATE_SOFT, fontWeight: 400 }}
            >
              Connect with motivated homeowners actively searching for your services.
            </Reveal>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STATS.map((stat, idx) => (
              <Reveal
                key={stat.label}
                delay={idx * 100}
                className="rounded-2xl border bg-white p-8 flex flex-col items-start"
                style={{ borderColor: "hsl(220 13% 93%)" }}
              >
                <stat.icon
                  className="h-9 w-9 mb-6"
                  style={{ color: BLUE }}
                  strokeWidth={2}
                />
                <p
                  className="text-4xl md:text-5xl mb-3"
                  style={{ fontFamily: DISPLAY_FONT, color: BLUE, letterSpacing: "-0.03em", fontWeight: 500 }}
                >
                  {stat.value}
                </p>
                <p
                  className="text-base"
                  style={{ fontFamily: DISPLAY_FONT, color: SLATE_SOFT, fontWeight: 400 }}
                >
                  {stat.label}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Testimonials / CTA ───── */}
      <section
        id="testimonials"
        className="relative bg-white py-24 md:py-32 border-t"
        style={{ borderColor: "hsl(220 13% 93%)" }}
      >
        <div className="container mx-auto px-6 max-w-3xl text-center relative z-10">
          <Reveal as="h2"
            className="text-4xl md:text-6xl mb-6"
            style={{ fontFamily: DISPLAY_FONT, letterSpacing: "-0.03em", fontWeight: 500, color: SLATE, lineHeight: 1.1 }}
          >
            Ready to Expand?
          </Reveal>
          <p
            className="text-base md:text-lg mb-10 max-w-xl mx-auto"
            style={{ fontFamily: DISPLAY_FONT, color: SLATE_SOFT, fontWeight: 400 }}
          >
            At AngelFlows Media, each lead only goes to ONE contractor. Claim it before your competitor does.
          </p>
          <button
            onClick={() => navigate("/auth")}
            className="h-12 px-8 rounded-xl text-white text-base shadow-lg transition-colors"
            style={{ backgroundColor: BLUE, fontWeight: 500, letterSpacing: "0.02em" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = BLUE_HOVER)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = BLUE)
            }
          >
            Book a Call
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-8 relative z-10" style={{ borderColor: "hsl(220 13% 93%)" }}>
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span style={{ fontFamily: DISPLAY_FONT }}>AngelFlows © {new Date().getFullYear()}</span>
          <div className="flex gap-6" style={{ fontFamily: DISPLAY_FONT }}>
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

function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="relative bg-white py-16 md:py-20 border-t"
      style={{ borderColor: "hsl(220 13% 93%)" }}
    >
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
        <Reveal as="h2"
          className="text-3xl md:text-4xl text-center mb-10 md:mb-14"
          style={{ fontFamily: DISPLAY_FONT, letterSpacing: "-0.03em", fontWeight: 500, color: SLATE, lineHeight: 1.1 }}
        >
          How it Works
        </Reveal>
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-px rounded-2xl overflow-hidden border"
          style={{ backgroundColor: "hsl(220 13% 93%)", borderColor: "hsl(220 13% 93%)" }}
        >
          {HOW_IT_WORKS.map((item, idx) => (
            <RevealCard key={item.step} delay={idx * 100}>
              <div
                className="h-11 w-11 rounded-full flex items-center justify-center text-white text-base mb-10"
                style={{ backgroundColor: BLUE, fontWeight: 500 }}
              >
                {item.step}
              </div>
              <h3
                className="text-lg md:text-xl mb-3 leading-snug"
                style={{ fontFamily: DISPLAY_FONT, color: BLUE, letterSpacing: "-0.02em", fontWeight: 500 }}
              >
                {item.title}
              </h3>
              <p
                className="text-sm md:text-[15px] leading-relaxed"
                style={{ fontFamily: DISPLAY_FONT, letterSpacing: "-0.005em", color: SLATE_SOFT, fontWeight: 400 }}
              >
                {item.description}
              </p>
            </RevealCard>
          ))}
        </div>
      </div>
    </section>
  );
}

function RevealCard({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className="flex flex-col items-start text-left bg-white p-8 md:p-10 min-h-[280px]"
      style={{
        opacity: inView ? undefined : 0,
        transform: inView ? undefined : "scale(0.95)",
        willChange: "transform, opacity",
        animation: inView ? `smooth-pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${delay}ms forwards` : undefined,
      }}
    >
      {children}
    </div>
  );
}

type RevealProps = {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
  as?: keyof JSX.IntrinsicElements;
};

function Reveal({ children, delay = 0, className, style, as: Tag = "div" }: RevealProps) {
  const { ref, inView } = useInView<HTMLElement>();
  const AnyTag = Tag as any;
  return (
    <AnyTag
      ref={ref as any}
      className={className}
      style={{
        ...style,
        opacity: inView ? undefined : 0,
        transform: inView ? undefined : "scale(0.95)",
        willChange: "transform, opacity",
        animation: inView ? `smooth-pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${delay}ms forwards` : undefined,
      }}
    >
      {children}
    </AnyTag>
  );
}
