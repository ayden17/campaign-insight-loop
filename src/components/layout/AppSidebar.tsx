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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import angelflowsLogo from "@/assets/angelflows-logo.png";

const mainNav = [
  { title: "Dashboard", path: "/", icon: LayoutDashboard },
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
  open: { width: "14rem" },
  closed: { width: "3.5rem" },
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
      <div className="flex h-14 items-center gap-2 px-3">
        <img src={angelflowsLogo} alt="AngelFlows" className="h-8 w-8 shrink-0 object-contain" />
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm font-bold tracking-tight text-foreground"
          >
            AngelFlows
          </motion.span>
        )}
      </div>

      <Separator />

      {/* Main Nav */}
      <nav className="flex-1 space-y-0.5 px-2 py-3">
        {mainNav.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="truncate">{item.title}</span>}
          </NavLink>
        ))}

        <div className="pt-3 pb-1">
          {!collapsed && (
            <span className="px-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
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
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="truncate">{item.title}</span>}
          </NavLink>
        ))}
      </nav>

      <Separator />

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex h-10 items-center justify-center text-sidebar-foreground hover:text-foreground transition-colors"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </motion.aside>
  );
}
