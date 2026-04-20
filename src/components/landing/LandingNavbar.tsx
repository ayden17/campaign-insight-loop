import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { GlassEffect } from "@/components/ui/liquid-glass";
import angelflowsLogo from "@/assets/angelflows-logo.png";

const NAV_ITEMS = [
  { label: "Home", href: "#hero" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Operations", href: "#operations" },
  { label: "Why Us", href: "#why-us" },
];

export function LandingNavbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

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

            {/* Desktop CTA */}
            <a
              href="https://contractors.angelflows.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex h-10 px-5 sm:px-6 rounded-xl bg-[hsl(217_91%_60%)] text-white text-sm font-semibold shadow-md hover:bg-[hsl(217_91%_55%)] transition-colors items-center"
              style={{ letterSpacing: "-0.01em" }}
            >
              Book a call
            </a>

            {/* Mobile hamburger */}
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={open}
              className="md:hidden h-11 w-11 flex items-center justify-center rounded-xl text-[hsl(215_25%_17%)] hover:bg-black/5 transition-colors"
            >
              {open ? <X className="h-6 w-6" strokeWidth={2.25} /> : <Menu className="h-6 w-6" strokeWidth={2.25} />}
            </button>
          </div>
        </GlassEffect>

        {/* Mobile menu panel */}
        {open && (
          <div
            className="md:hidden mt-2 rounded-2xl bg-white/95 backdrop-blur-xl shadow-lg border p-4 animate-fade-in"
            style={{ borderColor: "hsl(220 13% 93%)" }}
          >
            <nav className="flex flex-col">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="px-3 py-3 text-base text-[hsl(215_25%_17%)] hover:bg-black/5 rounded-lg transition-colors"
                  style={{ fontFamily: "'General Sans', 'Inter', sans-serif", fontWeight: 500, letterSpacing: "-0.01em" }}
                >
                  {item.label}
                </a>
              ))}
              <button
                onClick={() => {
                  setOpen(false);
                  navigate("/auth");
                }}
                className="mt-2 h-11 rounded-xl bg-[hsl(217_91%_60%)] text-white text-sm font-semibold shadow-md hover:bg-[hsl(217_91%_55%)] transition-colors"
                style={{ letterSpacing: "0.02em" }}
              >
                Book a call
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
