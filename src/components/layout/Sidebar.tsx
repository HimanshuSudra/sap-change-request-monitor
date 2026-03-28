// src/components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  List,
  PlusCircle,
  BarChart3,
  X,
  TableProperties,
  GitBranchPlus,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  section?: string;
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    section: "Main Menu",
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/records",
    label: "All Records",
    icon: List,
  },
  {
    href: "/records/new",
    label: "New Request",
    icon: PlusCircle,
  },
  {
    href: "/trms",
    label: "TRMS",
    icon: GitBranchPlus,
  },
  {
    section: "Analytics",
    href: "/reports",
    label: "Reports",
    icon: BarChart3,
  },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  function isActive(item: NavItem) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  let lastSection = "";

  return (
    <aside
      className={cn(
        "theme-sidebar fixed inset-y-0 left-0 z-30 flex w-72 flex-col overflow-hidden border-r border-white/10 text-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-2rem] top-10 h-36 w-36 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute bottom-12 right-[-2rem] h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
      </div>
      {/* Logo */}
      <div className="relative flex items-center gap-3 border-b border-white/10 px-5 py-6">
        <div className="glow-ring flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-[0_10px_30px_rgba(14,165,233,0.28)]">
          <TableProperties className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="text-base font-bold tracking-wide text-white">PCMS</div>
          <div className="mt-1 text-[11px] leading-none text-slate-400">
            Program Change Control Center
          </div>
        </div>
        {/* Mobile close */}
        <button
          className="ml-auto lg:hidden text-slate-400 hover:text-white"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="relative flex-1 overflow-y-auto px-3 py-5 space-y-1">
        {NAV_ITEMS.map((item) => {
          const showSection = item.section && item.section !== lastSection;
          if (item.section) lastSection = item.section;
          const active = isActive(item);

          return (
            <div key={item.href}>
              {showSection && (
                <div className="px-3 pb-1.5 pt-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                  {item.section}
                </div>
              )}
              <Link
                href={item.href}
                onClick={onClose}
                className={cn(
                  "lift-card group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium",
                  active
                    ? "border border-cyan-400/30 bg-white/6 text-cyan-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                )}
              >
                <span className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl border border-white/5 bg-white/5 transition-colors",
                  active ? "bg-cyan-400/10 text-cyan-300" : "group-hover:bg-white/10"
                )}>
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                </span>
                {item.label}
              </Link>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="relative border-t border-white/10 px-4 py-5">
        <div className="glass-panel rounded-2xl border-white/10 bg-white/5 px-3 py-3 text-white">
          <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-xs font-bold text-white">
            PC
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-100">PCMS User</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-cyan-200/70">Administrator</div>
          </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
