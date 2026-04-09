import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Workflow } from 'lucide-react';

export function LandingHeader() {
  const [open, setOpen] = React.useState(false);
  const scrolled = useScroll(10);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <header
      className={cn(
        'w-full fixed top-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-background/80 backdrop-blur-lg border-b border-border shadow-sm py-3'
          : 'bg-transparent py-5',
      )}
    >
      <div className="container mx-auto flex items-center justify-between px-6">
        <a href="/" className="flex items-center gap-2">
          <Workflow className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold tracking-tight text-foreground">AngelFlows</span>
        </a>

        <nav className="hidden md:flex items-center gap-8">
          <a href="#pain" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Problem</a>
          <a href="#how" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
          <a href="#uses" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Use Cases</a>
          <a href="#trust" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Governance</a>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>Sign In</Button>
          <Button size="sm" onClick={() => navigate('/auth')}>Deploy Agent</Button>
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden" aria-label="Toggle menu">
          <MenuToggleIcon open={open} className="h-7 w-7" />
        </button>
      </div>

      {/* Mobile menu */}
      <MobileMenu open={open}>
        <div className="flex flex-col gap-4 p-6">
          <a href="#pain" onClick={() => setOpen(false)} className="text-lg font-medium">Problem</a>
          <a href="#how" onClick={() => setOpen(false)} className="text-lg font-medium">How It Works</a>
          <a href="#uses" onClick={() => setOpen(false)} className="text-lg font-medium">Use Cases</a>
          <a href="#trust" onClick={() => setOpen(false)} className="text-lg font-medium">Governance</a>
        </div>
        <div className="p-6 mt-auto flex flex-col gap-3">
          <Button variant="outline" className="w-full" onClick={() => navigate('/auth')}>Sign In</Button>
          <Button className="w-full" onClick={() => navigate('/auth')}>Deploy Agent</Button>
        </div>
      </MobileMenu>
    </header>
  );
}

function MobileMenu({ open, children }: { open: boolean; children: React.ReactNode }) {
  if (!open || typeof window === 'undefined') return null;
  return createPortal(
    <div className="fixed inset-0 z-[60] bg-background flex flex-col pt-20">
      {children}
    </div>,
    document.body,
  );
}

function useScroll(threshold: number) {
  const [scrolled, setScrolled] = React.useState(false);
  const onScroll = React.useCallback(() => {
    setScrolled(window.scrollY > threshold);
  }, [threshold]);
  React.useEffect(() => {
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [onScroll]);
  return scrolled;
}
