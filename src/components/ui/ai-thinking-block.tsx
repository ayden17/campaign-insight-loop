import { Card } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { useEffect, useRef, useState } from "react";

interface AIThinkingBlockProps {
  thinkingText?: string;
  label?: string;
}

export default function AIThinkingBlock({ thinkingText, label = "AI is analyzing" }: AIThinkingBlockProps) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [timer, setTimer] = useState(0);

  const displayText = thinkingText || `Analyzing meeting transcript and summary to extract key insights...

Identifying the offer details including pricing and services discussed during the call.

Looking for objections raised by the prospect - concerns about cost, timeline, competition, or product fit.

Evaluating how objections were handled - what techniques were used, were they addressed effectively?

Assessing lead quality based on buying signals, engagement level, and decision-making authority.

Generating suggested follow-up actions based on the conversation outcomes and next steps discussed.

Cross-referencing attendee information to identify key decision makers and stakeholders.

Finalizing the analysis with a comprehensive lead quality assessment...`;

  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timerInterval);
  }, []);

  useEffect(() => {
    if (contentRef.current) {
      scrollIntervalRef.current = setInterval(() => {
        setScrollPosition((prev) => {
          if (!contentRef.current) return prev;
          const maxScroll = contentRef.current.scrollHeight - contentRef.current.clientHeight;
          const newPosition = prev + 1;
          return newPosition >= maxScroll ? 0 : newPosition;
        });
      }, 30);
      return () => {
        if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
      };
    }
  }, []);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = scrollPosition;
    }
  }, [scrollPosition]);

  return (
    <Card className="overflow-hidden border-border">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Loader size="sm" variant="primary" />
          <span className="text-sm font-medium text-card-foreground">{label}</span>
        </div>
        <span className="text-xs text-muted-foreground font-mono">{timer}s</span>
      </div>
      <div className="relative h-32">
        <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-card to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-card to-transparent z-10 pointer-events-none" />
        <div
          ref={contentRef}
          className="h-full overflow-hidden px-4 py-3"
          style={{ scrollBehavior: "auto" }}
        >
          <p className="text-xs text-muted-foreground/60 leading-relaxed whitespace-pre-wrap">
            {displayText}
          </p>
        </div>
      </div>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </Card>
  );
}
