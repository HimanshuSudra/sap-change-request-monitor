"use client";

import { DashboardStats } from "@/types";
import { clearPointerGlow, cn, trackPointerGlow } from "@/lib/utils";
import {
  LayoutGrid,
  Clock3,
  BadgeCheck,
  Code2,
  Settings2,
  FileWarning,
} from "lucide-react";

interface KpiConfig {
  key: keyof DashboardStats;
  label: string;
  sub: string;
  icon: React.ElementType;
  colorClass: string;
  filterField?: string;
  filterValue?: string;
  showProgress?: boolean;
}

const KPI_CONFIG: KpiConfig[] = [
  {
    key: "total",
    label: "Total Requests",
    sub: "All indexed records",
    icon: LayoutGrid,
    colorClass: "border border-cyan-300/20 bg-cyan-400/12 text-cyan-100",
  },
  {
    key: "open",
    label: "Open",
    sub: "Awaiting action",
    icon: Clock3,
    colorClass: "border border-amber-300/20 bg-amber-400/12 text-amber-100",
    filterField: "status",
    filterValue: "Open",
  },
  {
    key: "closed",
    label: "Closed",
    sub: "Completed or signed off",
    icon: BadgeCheck,
    colorClass: "border border-emerald-300/20 bg-emerald-400/12 text-emerald-100",
    filterField: "status",
    filterValue: "Closed",
    showProgress: true,
  },
  {
    key: "dev",
    label: "Development",
    sub: "Engineering work items",
    icon: Code2,
    colorClass: "border border-violet-300/20 bg-violet-400/12 text-violet-100",
    filterField: "typeOfRequest",
    filterValue: "Development",
  },
  {
    key: "configuration",
    label: "Configuration",
    sub: "Functional configuration work",
    icon: Settings2,
    colorClass: "border border-sky-300/20 bg-sky-400/12 text-sky-100",
    filterField: "typeOfRequest",
    filterValue: "Configuration",
  },
  {
    key: "pendingDocs",
    label: "Pending Docs",
    sub: "Missing evidence or links",
    icon: FileWarning,
    colorClass: "border border-rose-300/20 bg-rose-400/12 text-rose-100",
  },
];

interface KpiGridProps {
  stats?: DashboardStats;
  isLoading: boolean;
  onFilter?: (field: string, value: string) => void;
}

export function KpiGrid({ stats, isLoading, onFilter }: KpiGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass-panel h-44 animate-pulse rounded-[2rem]" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {KPI_CONFIG.map((cfg, index) => {
        const value = stats?.[cfg.key] ?? 0;
        const ratio = cfg.showProgress ? stats?.completionRatio ?? 0 : null;
        const clickable = !!(cfg.filterField && onFilter);

        return (
          <button
            key={cfg.key}
            type="button"
            onClick={clickable ? () => onFilter!(cfg.filterField!, cfg.filterValue!) : undefined}
            className={cn(
              "glass-panel interactive-spotlight metric-card motion-tile stagger-in group relative min-h-[12.5rem] rounded-[2rem] p-6 text-left",
              clickable ? "cursor-pointer" : "cursor-default"
            )}
            onPointerMove={trackPointerGlow}
            onPointerLeave={clearPointerGlow}
            style={{ animationDelay: `${index * 70}ms` }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className={cn("motion-icon flex h-12 w-12 items-center justify-center rounded-[1rem] shadow-[0_12px_30px_rgba(2,6,23,0.18)]", cfg.colorClass)}>
                <cfg.icon className="h-5 w-5 stroke-[2.2]" />
              </div>
              {clickable ? (
                <span className="theme-subtle text-[11px] uppercase tracking-[0.24em]">Explore</span>
              ) : (
                <span className="theme-subtle text-[11px] uppercase tracking-[0.24em]">Summary</span>
              )}
            </div>

            <div className="mt-8">
              <div className="section-label">{cfg.label}</div>
              <div className="theme-heading mt-3 text-5xl font-semibold tracking-tight tabular-nums">{typeof value === "number" ? value.toLocaleString() : value}</div>
              <div className="theme-body mt-3 text-sm leading-6">{cfg.sub}</div>
            </div>

            {ratio !== null ? (
              <div className="mt-6 space-y-3">
                <div className="h-2 overflow-hidden rounded-full bg-white/12">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-300"
                    style={{ width: `${Math.min(ratio, 100)}%` }}
                  />
                </div>
                <div className="theme-subtle text-xs uppercase tracking-[0.18em]">{ratio}% completion</div>
              </div>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
