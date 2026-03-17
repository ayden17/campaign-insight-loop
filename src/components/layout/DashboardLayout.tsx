import { AppSidebar } from "./AppSidebar";
import { Separator } from "@/components/ui/separator";
import { Outlet } from "react-router-dom";

interface DashboardLayoutProps {
  children?: React.ReactNode;
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
          <div className="flex h-16 items-center justify-between px-6">
            <div>
              <h1 className="text-lg font-semibold text-foreground">{title}</h1>
              {subtitle && <p className="text-sm text-muted-foreground -mt-0.5">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-3">
              {actions}
              <select className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
                <option>Last 30 days</option>
                <option>Last 7 days</option>
                <option>Last 90 days</option>
              </select>
              <select className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
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

/** Persistent layout wrapper — sidebar stays mounted across route changes */
export function PersistentSidebarLayout() {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
