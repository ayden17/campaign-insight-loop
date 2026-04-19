import { useNavigate } from "react-router-dom";
import { GlassEffect } from "@/components/ui/liquid-glass";
import angelflowsLogo from "@/assets/angelflows-logo.png";

const NAV_ITEMS = [
  { label: "Home", href: "#hero" },
  { label: "Operations", href: "#operations" },
  { label: "Testimonials", href: "#testimonials" },
];

export function LandingNavbar() {
  const navigate = useNavigate();

  return (
    <header className="fixed top-4 left-0 right-0 z-50 px-4">
      <div className="container mx-auto max-w-6xl">
        <GlassEffect className="h-20 px-3 sm:px-5">
          <div className="flex w-full items-center justify-between gap-3">
            <a href="/" className="flex items-center pl-1" aria-label="AngelFlows home">
              <img
                src={angelflowsLogo}
                alt="AngelFlows"
                loading="eager"
                decoding="async"
                className="h-12 sm:h-14 w-auto object-contain"
              />
            </a>

            <nav className="hidden md:flex items-center gap-10">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-[15px] font-light text-foreground/70 hover:text-foreground transition-colors"
                  style={{ letterSpacing: "-0.01em" }}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <button
              onClick={() => navigate("/auth")}
              className="h-10 px-5 sm:px-6 rounded-full bg-[hsl(217_91%_60%)] text-white text-sm font-medium shadow-md hover:bg-[hsl(217_91%_55%)] transition-colors"
              style={{ letterSpacing: "-0.01em" }}
            >
              Book a call
            </button>
          </div>
        </GlassEffect>
      </div>
    </header>
  );
}
