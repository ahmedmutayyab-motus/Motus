"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, BookOpenCheck, Zap, Inbox, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/ai-writer", label: "AI Writer", icon: BookOpenCheck },
  { href: "/sequences", label: "Sequences", icon: Zap },
  { href: "/inbox", label: "Inbox", icon: Inbox },
];

export default function AppSidebar() {
  const currentPath = usePathname() || "/dashboard";

  return (
    <aside className="w-64 border-r border-white/5 bg-obsidian-900 flex flex-col h-full sticky top-0">
      <div className="h-16 flex items-center px-6 border-b border-white/5">
        <span className="font-bold text-lg text-white">MOTUS.</span>
      </div>
      
      <div className="p-4 border-b border-white/5">
        <button disabled title="Workspace switching (Phase 6)" className="w-full flex items-center justify-between bg-white/5 p-2 rounded-md transition-colors border border-white/5 opacity-50 cursor-not-allowed">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-brand-primary rounded mr-2 flex items-center justify-center text-xs font-bold text-white">A</div>
            <span className="text-sm font-medium text-white">Acme Corp</span>
          </div>
          <span className="text-xs text-brand-muted shrink-0 text-brand-muted select-none">▼</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = currentPath === item.href;
          if (item.disabled) {
            return (
              <div 
                key={item.href} 
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all text-brand-muted opacity-50 cursor-not-allowed"
                title={`${item.label} coming in future phase`}
              >
                <item.icon className="mr-3 h-5 w-5 shrink-0 text-brand-muted" />
                {item.label}
              </div>
            );
          }
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all",
                isActive 
                  ? "bg-brand-primary/10 text-brand-primary" 
                  : "text-brand-muted hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className={cn("mr-3 h-5 w-5 shrink-0", isActive ? "text-brand-primary" : "text-brand-muted")} />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-white/5">
        <button 
          disabled
          title="Settings (Phase 6)"
          className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all text-brand-muted opacity-50 cursor-not-allowed"
        >
          <Settings className="mr-3 h-5 w-5 shrink-0" />
          Settings (Phase 6)
        </button>
      </div>
    </aside>
  );
}
