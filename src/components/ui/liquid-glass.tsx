"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface GlassEffectProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Reusable "liquid glass" wrapper used by the landing navbar and hero CTA.
 * Pure visual layer — no routing/state.
 */
export const GlassEffect: React.FC<GlassEffectProps> = ({
  children,
  className = "",
  style = {},
}) => {
  const glassStyle: React.CSSProperties = {
    boxShadow:
      "0 6px 24px rgba(15, 23, 42, 0.12), 0 2px 6px rgba(15, 23, 42, 0.06), inset 0 1px 0 rgba(255,255,255,0.6)",
    transitionTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 2.2)",
    backdropFilter: "blur(16px) saturate(180%)",
    WebkitBackdropFilter: "blur(16px) saturate(180%)",
    backgroundColor: "rgba(255, 255, 255, 0.55)",
    border: "1px solid rgba(255, 255, 255, 0.6)",
    ...style,
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-full transition-all duration-500",
        className,
      )}
      style={glassStyle}
    >
      {/* Highlight sheen */}
      <div
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 45%)",
        }}
      />
      <div className="relative z-10 flex h-full w-full items-center">
        {children}
      </div>
    </div>
  );
};
