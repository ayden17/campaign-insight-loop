import { AppSidebar } from "./AppSidebar";
import { Separator } from "@/components/ui/separator";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function DashboardLayout({ children, title, subtitle, actions }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
          <div className="flex h-14 items-center justify-between px-6">
            <div>
              <h1 className="text-base font-semibold text-foreground">{title}</h1>
              {subtitle && <p className="text-xs text-muted-foreground -mt-0.5">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-2">
              {actions}
              <select className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
                <option>Last 30 days</option>
                <option>Last 7 days</option>
                <option>Last 90 days</option>
              </select>
              <select className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
                <option>All Platforms</option>
                <option>Meta Ads</option>
                <option>Google Ads</option>
              </select>
            </div>
          </div>
          <Separator />
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
