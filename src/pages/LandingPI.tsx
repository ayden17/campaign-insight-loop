import { useRef } from "react";
import {
  Check,
  ClipboardList,
  Phone,
  Home,
  Rocket,
  Users,
  TrendingUp,
} from "lucide-react";
import { motion, useInView, type Variants } from "framer-motion";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { HeroVideoDialog } from "@/components/ui/hero-video-dialog";
import dashboardAnalytics from "@/assets/dashboard-analytics.png";
import houseIcon from "@/assets/house-icon.png";
import piMva from "@/assets/pi-mva.png";
import piSlipFall from "@/assets/pi-slip-fall.png";
import piWorkplace from "@/assets/pi-workplace.png";
import piMedical from "@/assets/pi-medical.png";
import piWrongfulDeath from "@/assets/pi-wrongful-death.png";
import piCatastrophic from "@/assets/pi-catastrophic.png";

const DISPLAY_FONT = "'Degular Display', 'General Sans', 'Inter', system-ui, -apple-system, sans-serif";

const FEATURES = [
  "Performance-Based Billing",
  "Exclusive MVA & PI Cases",
  "Vetted Legal Intake",
  "100% Case Exclusivity",
];

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Victims Request Case Evaluation",
    description:
      "Prospects are pre-screened via a high-intent legal questionnaire to ensure valid injury and insurance status.",
  },
  {
    step: "2",
    title: "You Are Matched With a Qualified Case",
    description:
      "Only high-intent Motor Vehicle Accident (MVA) or Slip & Fall cases are sent directly to your intake team.",
  },
  {
    step: "3",
    title: "Sign New Retainers",
    description:
      "Your firm reviews the vetted intake and signs the retainer. We deliver the volume; you handle the litigation.",
  },
];

const HOW_WE_HELP = [
  {
    icon: ClipboardList,
    title: "Case Generation: 100% Exclusively Yours",
    description:
      "We never share a victim's info with multiple firms. You get the first and only shot at the retainer.",
  },
  {
    icon: Phone,
    title: "24/7 AI Intake: Never Miss a Case",
    description:
      "Legal emergencies don't wait for office hours. Our AI intake strike team qualifies cases instantly, 24/7, while the lead is still hot.",
  },
  {
    icon: Home,
    title: "Appointment Setting: Automated Retainer Delivery",
    description:
      "We handle the follow-ups and calendar scheduling so your attorneys stay focused on high-value litigation.",
  },
];

const SERVICES = [
  { name: "MVA", image: piMva },
  { name: "Slip & Fall", image: piSlipFall },
  { name: "Workplace Injury", image: piWorkplace },
  { name: "Medical Malpractice", image: piMedical },
  { name: "Wrongful Death", image: piWrongfulDeath },
  { name: "Catastrophic Injury", image: piCatastrophic },
];

const STATS = [
  { icon: Rocket, value: "25,000+", label: "Weekly Leads" },
  { icon: Users, value: "10,000", label: "Daily Homeowner Visits" },
  { icon: TrendingUp, value: "10,000", label: "Exclusive Leads Delivered" },
];

const BLUE = "hsl(217 91% 60%)";
const BLUE_HOVER = "hsl(217 91% 55%)";
const SLATE = "hsl(215 25% 17%)";
const SLATE_SOFT = "hsl(215 20% 35%)";
const SLATE_MUTED = "hsl(215 15% 55%)";

export default function LandingPI() {
  const handleCTA = () => {
    window.open("https://pi.angelflows.com", "_blank", "noopener,noreferrer");
  };
  return (
    <div
      className="min-h-screen bg-white relative overflow-hidden"
      style={{
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        color: SLATE,
        letterSpacing: "-0.01em",
      }}
    >
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

      {/* Hero */}
      <section id="hero" className="relative pt-28 md:pt-32 pb-8 md:pb-10">
        <div className="container mx-auto px-6 max-w-4xl text-center relative z-10">
          <div className="flex flex-col items-center gap-3 mb-4">
            <img
              src={houseIcon}
              alt="AngelFlows icon"
              className="h-16 md:h-20 w-auto object-contain"
              loading="eager"
            />
            <p
              className="text-sm md:text-[15px] font-medium"
              style={{ letterSpacing: "-0.01em", color: SLATE }}
            >
              For Personal Injury Law Firms
            </p>
          </div>

          <RevealGroup>
            <Reveal as="h1"
              className="text-[28px] sm:text-3xl md:text-4xl lg:text-5xl font-medium mb-4 max-w-4xl mx-auto"
              style={{
                fontFamily: DISPLAY_FONT,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                color: SLATE,
              }}
            >
              Scale Your Law Firm With Qualified &amp; Exclusive Case Signings Without Lifting a Finger
            </Reveal>

            <Reveal as="p"
              className="text-sm md:text-base max-w-xl mx-auto mb-6"
              style={{ fontFamily: DISPLAY_FONT, fontWeight: 400, letterSpacing: "-0.01em", color: SLATE_MUTED }}
            >
              Don't Pay Ad Spend or Monthly Retainers, Just Pay-Per-Lead.
            </Reveal>

            <Reveal>
              <button
                onClick={handleCTA}
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
                Test a Batch
              </button>
            </Reveal>
          </RevealGroup>
        </div>

        <div className="container mx-auto px-6 max-w-5xl mt-8 md:mt-10 relative z-10">
          <RevealSolo>
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
          </RevealSolo>

          <RevealGroup className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4 mt-12 md:mt-16">
            {FEATURES.map((feature) => (
              <Reveal
                key={feature}
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
          </RevealGroup>
        </div>
      </section>

      <HowItWorksSection />

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
            How AngelFlows Helps Law Firms
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

      <section
        className="relative bg-white py-20 md:py-28 border-t"
        style={{ borderColor: "hsl(220 13% 93%)" }}
      >
        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <Reveal as="h2"
            className="text-3xl md:text-5xl text-center mb-14"
            style={{ fontFamily: DISPLAY_FONT, letterSpacing: "-0.03em", fontWeight: 500, color: SLATE, lineHeight: 1.1 }}
          >
            Cases We Deliver
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {SERVICES.map((service, idx) => (
              <Reveal
                key={service.name}
                delay={idx * 100}
                className="rounded-2xl border bg-white p-8 flex flex-col items-center justify-between text-center transition-all hover:shadow-md min-h-[260px] md:min-h-[280px]"
                style={{ borderColor: "hsl(220 13% 93%)" }}
              >
                <div className="flex-1 flex items-center justify-center w-full">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="h-28 md:h-32 w-auto max-w-full object-contain"
                    loading="lazy"
                  />
                </div>
                <p
                  className="text-lg md:text-xl mt-6"
                  style={{ fontFamily: DISPLAY_FONT, color: BLUE, letterSpacing: "-0.02em", fontWeight: 500 }}
                >
                  {service.name}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

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
              Connect with motivated victims actively seeking legal representation.
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
            Ready to Grow Your Docket?
          </Reveal>
          <p
            className="text-base md:text-lg mb-10 max-w-xl mx-auto"
            style={{ fontFamily: DISPLAY_FONT, color: SLATE_SOFT, fontWeight: 400 }}
          >
            At AngelFlows Media, every case is exclusive. Secure your territory before your competition does.
          </p>
          <button
            onClick={handleCTA}
            className="h-12 px-8 rounded-xl text-white text-base shadow-lg transition-colors"
            style={{ backgroundColor: BLUE, fontWeight: 500, letterSpacing: "0.02em" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = BLUE_HOVER)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = BLUE)
            }
          >
            Test a Batch
          </button>
        </div>
      </section>

      <footer className="border-t bg-white py-8 relative z-10" style={{ borderColor: "hsl(220 13% 93%)" }}>
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span style={{ fontFamily: DISPLAY_FONT }}>AngelFlows © {new Date().getFullYear()}</span>
          <div className="flex gap-6" style={{ fontFamily: DISPLAY_FONT }}>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
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

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

type RevealGroupProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  amount?: number;
};

function RevealGroup({ children, className, style, amount = 0.2 }: RevealGroupProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount, margin: "0px 0px -10% 0px" });

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

function RevealCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={itemVariants}
      className="flex flex-col items-start text-left bg-white p-8 md:p-10 min-h-[280px]"
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  );
}

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  as?: keyof JSX.IntrinsicElements;
};

function Reveal({ children, className, style, as: Tag = "div" }: RevealProps) {
  const MotionTag = ((motion as any)[Tag] ?? motion.div) as any;
  return (
    <MotionTag
      variants={itemVariants}
      className={className}
      style={{ ...style, willChange: "transform, opacity" }}
    >
      {children}
    </MotionTag>
  );
}

// Standalone reveal for elements not inside a RevealGroup
function RevealSolo({ children, className, style, as: Tag = "div" }: RevealProps) {
  const MotionTag = ((motion as any)[Tag] ?? motion.div) as any;
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref as any, { once: true, amount: 0.2, margin: "0px 0px -10% 0px" });
  return (
    <MotionTag
      ref={ref}
      variants={itemVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={className}
      style={{ ...style, willChange: "transform, opacity" }}
    >
      {children}
    </MotionTag>
  );
}
