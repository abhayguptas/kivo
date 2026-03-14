"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BarChart3, 
  Inbox, 
  Settings, 
  Database, 
  Zap, 
  Menu,
  ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "Dashboard", icon: BarChart3, href: "/dashboard" },
  { name: "Inbox", icon: Inbox, href: "/dashboard/inbox" },
  { name: "Data Sources", icon: Database, href: "/dashboard/sources" },
  { name: "AI Metrics", icon: Zap, href: "/dashboard/ai" },
];

const settingItems = [
  { name: "Settings", icon: Settings, href: "/dashboard/settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside 
      className={cn(
        "h-full shrink-0 border-r border-slate-200/70 bg-white/78 backdrop-blur-xl transition-all duration-300 flex flex-col",
        collapsed ? "w-[70px]" : "w-[260px]"
      )}
    >
      <div className="p-6 flex items-center justify-between">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#4f7cff] to-[#315bf0] text-white font-bold shadow-md shadow-blue-300/40">
              K
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Kivo
            </span>
          </Link>
        )}
        {collapsed && (
          <div className="mx-auto flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#4f7cff] to-[#315bf0] text-white font-bold shadow-md shadow-blue-300/40">
            K
          </div>
        )}
      </div>

      <nav className="flex-1 px-4 space-y-1">
        <div className="py-2">
          {!collapsed && <p className="px-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Main Menu</p>}
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                  isActive 
                    ? "bg-gradient-to-r from-blue-50 to-emerald-50 text-slate-900 shadow-sm shadow-slate-300/50 ring-1 ring-blue-100" 
                    : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5 shrink-0 transition-colors",
                  isActive ? "text-blue-700" : "text-slate-500 group-hover:text-slate-700"
                )} />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </div>

        <div className="py-4 border-t border-slate-100">
          {!collapsed && <p className="px-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Settings</p>}
          {settingItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  isActive 
                    ? "bg-gradient-to-r from-blue-50 to-emerald-50 text-slate-900 ring-1 ring-blue-100" 
                    : "text-slate-600 hover:bg-slate-100/70"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="p-4 mt-auto">
        {!collapsed && (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0e1a43] via-[#17317a] to-[#2f6d5a] text-white shadow-lg shadow-blue-200/60">
            <h4 className="text-sm font-bold mb-1">Upgrade to Pro</h4>
            <p className="text-[11px] text-blue-100/90 mb-3">Unlock full opportunity maps, all locales, and unlimited AI runs.</p>
            <Button size="sm" className="w-full bg-emerald-300 text-emerald-950 hover:bg-emerald-200 border-none h-8 text-xs font-bold">
              Upgrade Now
            </Button>
          </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="mt-4 w-full flex items-center justify-center p-2 rounded-lg hover:bg-slate-100/80 text-slate-400 transition-colors"
        >
          {collapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>
    </aside>
  );
}
