import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { HeroVideoDialog } from "@/components/ui/hero-video-dialog";
import { useInView } from "@/hooks/use-in-view";
import dashboardAnalytics from "@/assets/dashboard-analytics.png";

const DISPLAY_FONT = "'Degular Display', 'General Sans', 'Inter', system-ui, -apple-system, sans-serif";
const SLATE = "hsl(215 25% 17%)";
const SLATE_SOFT = "hsl(215 20% 35%)";
const SLATE_MUTED = "hsl(215 15% 55%)";
const BLUE = "hsl(217 91% 60%)";

const FAQ_VIDEOS = [
  { title: "Are the leads exclusive?", videoSrc: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" },
  { title: "Will it work for me?", videoSrc: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" },
  { title: "How are you different?", videoSrc: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" },
  { title: "What happens next?", videoSrc: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" },
];

export default function ThankYouPI() {
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
        className="pointer-events-none absolute inset-x-0 top-0 h-[700px] opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(to right, hsl(220 13% 91%) 1px, transparent 1px), linear-gradient(to bottom, hsl(220 13% 91%) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse at 50% 25%, black 35%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 25%, black 35%, transparent 70%)",
        }}
      />

      <LandingNavbar />

      <section className="relative pt-28 md:pt-32 pb-12 md:pb-16">
        <div className="container mx-auto px-6 max-w-4xl text-center relative z-10">
          <Reveal
            as="p"
            className="text-sm md:text-[15px] mb-4"
            style={{ fontFamily: DISPLAY_FONT, fontWeight: 400, letterSpacing: "-0.01em", color: SLATE_MUTED }}
          >
            Application Received
          </Reveal>

          <Reveal
            as="h1"
            delay={80}
            className="text-[28px] sm:text-3xl md:text-4xl lg:text-5xl mb-6 max-w-3xl mx-auto"
            style={{
              fontFamily: DISPLAY_FONT,
              fontWeight: 400,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              color: SLATE,
            }}
          >
            You're almost in! Here's How to Claim Your Call!
          </Reveal>
        </div>

        <div className="container mx-auto px-6 max-w-4xl mt-6 md:mt-8 relative z-10">
          <Reveal
            delay={150}
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
              thumbnailAlt="Claim your call walkthrough"
              className="rounded-2xl overflow-hidden"
            />
          </Reveal>
        </div>
      </section>

      <section
        className="relative bg-white py-16 md:py-24 border-t"
        style={{ borderColor: "hsl(220 13% 93%)" }}
      >
        <div className="container mx-auto px-6 max-w-5xl relative z-10">
          <Reveal
            as="h2"
            className="text-2xl md:text-3xl text-center mb-10 md:mb-14"
            style={{ fontFamily: DISPLAY_FONT, fontWeight: 400, letterSpacing: "-0.03em", color: SLATE, lineHeight: 1.1 }}
          >
            Common Questions Answered
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {FAQ_VIDEOS.map((item, idx) => (
              <Reveal key={item.title} delay={idx * 100} className="flex flex-col items-center text-center">
                <h3
                  className="text-lg md:text-xl mb-4"
                  style={{ fontFamily: DISPLAY_FONT, fontWeight: 400, color: BLUE, letterSpacing: "-0.02em" }}
                >
                  {item.title}
                </h3>
                <div
                  className="rounded-2xl p-1.5 w-full"
                  style={{
                    background:
                      "linear-gradient(180deg, hsl(217 91% 60% / 0.2), hsl(217 91% 60% / 0.04))",
                    boxShadow: "0 20px 50px -25px hsl(217 91% 60% / 0.35)",
                  }}
                >
                  <HeroVideoDialog
                    animationStyle="from-center"
                    videoSrc={item.videoSrc}
                    thumbnailSrc={dashboardAnalytics}
                    thumbnailAlt={item.title}
                    className="rounded-xl overflow-hidden"
                  />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t bg-white py-8 relative z-10" style={{ borderColor: "hsl(220 13% 93%)" }}>
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm" style={{ color: SLATE_SOFT }}>
          <span style={{ fontFamily: DISPLAY_FONT, fontWeight: 400 }}>AngelFlows © {new Date().getFullYear()}</span>
          <div className="flex gap-6" style={{ fontFamily: DISPLAY_FONT, fontWeight: 400 }}>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </footer>
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
