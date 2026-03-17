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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import angelflowsLogo from "@/assets/angelflows-logo.png";

const mainNav = [
  { title: "Dashboard", path: "/", icon: LayoutDashboard },
  { title: "Lead Search", path: "/lead-search", icon: Search },
  { title: "Campaigns", path: "/campaigns", icon: Megaphone },
  { title: "Ad Creatives", path: "/ad-creatives", icon: Palette },
  { title: "Funnel View", path: "/funnel", icon: Filter },
  { title: "Review Sales Calls", path: "/sales", icon: Headphones },
  { title: "Leads", path: "/leads", icon: Users },
  { title: "Intelligence", path: "/intelligence", icon: Lightbulb },
  { title: "Agent", path: "/agent", icon: Bot },
];

const secondaryNav = [
  { title: "Ad Accounts", path: "/ad-accounts", icon: Link2 },
  { title: "Settings", path: "/settings", icon: Settings },
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
        <img src={angelflowsLogo} alt="AngelFlows" className={cn("shrink-0 object-contain transition-all", collapsed ? "h-10 w-10" : "h-20 w-full max-w-[12rem]")} />
      </div>

      <Separator />

      {/* Main Nav */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {mainNav.map((item) => (
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

        <div className="pt-4 pb-2">
          {!collapsed && (
            <span className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Manage
            </span>
          )}
        </div>

        {secondaryNav.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
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
