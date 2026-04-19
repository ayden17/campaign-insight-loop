import { useState } from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Megaphone,
  Filter,
  Users,
  Lightbulb,
  Link2,
  Settings,
  ChevronLeft,
  ChevronRight,
  Palette,
  Headphones,
  Bot,
  Search,
  Scan,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import angelflowsLogo from "@/assets/angelflows-logo.png";

interface NavSection {
  label: string;
  items: { title: string; path: string; icon: React.ElementType }[];
}

const navSections: NavSection[] = [
  {
    label: "Plug Intent Data",
    items: [
      { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      { title: "Build Audience", path: "/lead-search", icon: Search },
      { title: "Manage Pixels", path: "/pixels", icon: Scan },
      { title: "Visitor Analytics", path: "/visitor-analytics", icon: Eye },
      { title: "Sync Audience", path: "/sync-audience", icon: Filter },
      { title: "Customers", path: "/customers", icon: Users },
    ],
  },
  {
    label: "Creatives",
    items: [
      { title: "Campaigns", path: "/campaigns", icon: Megaphone },
      { title: "Ad Creatives", path: "/ad-creatives", icon: Palette },
      { title: "Agent", path: "/agent", icon: Bot },
    ],
  },
  {
    label: "Sales Intelligence",
    items: [
      { title: "Review Sales Calls", path: "/sales", icon: Headphones },
      { title: "Intelligence", path: "/intelligence", icon: Lightbulb },
    ],
  },
  {
    label: "Manage",
    items: [
      { title: "Link Accounts", path: "/ad-accounts", icon: Link2 },
      { title: "Settings", path: "/settings", icon: Settings },
    ],
  },
];

const sidebarVariants = {
  open: { width: "18rem" },
  closed: { width: "4.5rem" },
};

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      initial={false}
      animate={collapsed ? "closed" : "open"}
      variants={sidebarVariants}
      transition={{ type: "tween", ease: "easeOut", duration: 0.2 }}
      className="flex h-screen flex-col border-r border-sidebar-border bg-sidebar shrink-0 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex h-20 items-center justify-center px-4">
        <img src={angelflowsLogo} alt="AngelFlows" loading="eager" decoding="async" className={cn("shrink-0 object-contain transition-all", collapsed ? "h-10 w-10" : "h-20 w-full max-w-[12rem]")} />
      </div>

      <Separator />

      {/* Nav Sections */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navSections.map((section, sIdx) => (
          <div key={section.label}>
            {sIdx > 0 && <div className="pt-3" />}
            {!collapsed && (
              <span className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">
                {section.label}
              </span>
            )}
            {collapsed && sIdx > 0 && <Separator className="my-2" />}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )
                  }
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span className="truncate">{item.title}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <Separator />

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex h-12 items-center justify-center text-sidebar-foreground hover:text-foreground transition-colors"
      >
        {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
      </button>
    </motion.aside>
  );
}
