// src/components/dashboard/KpiGrid.tsx
"use client";

import { DashboardStats } from "@/types";
import { clearPointerGlow, cn, trackPointerGlow } from "@/lib/utils";
import {
  LayoutGrid,
  Clock,
  CheckCircle2,
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
    sub: "All records",
    icon: LayoutGrid,
    colorClass: "border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/30 dark:bg-blue-500/16 dark:text-blue-100",
  },
  {
    key: "open",
    label: "Open",
    sub: "Awaiting action",
    icon: Clock,
    colorClass: "border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/30 dark:bg-amber-500/16 dark:text-amber-100",
    filterField: "status",
    filterValue: "Open",
  },
  {
    key: "closed",
    label: "Closed",
    sub: "Completed",
    icon: CheckCircle2,
    colorClass: "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/16 dark:text-emerald-100",
    filterField: "status",
    filterValue: "Closed",
    showProgress: true,
  },
  {
    key: "dev",
    label: "Development",
    sub: "Dev type requests",
    icon: Code2,
    colorClass: "border border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-400/30 dark:bg-violet-500/16 dark:text-violet-100",
    filterField: "typeOfRequest",
    filterValue: "Development",
  },
  {
    key: "configuration",
    label: "Configuration",
    sub: "Config type requests",
    icon: Settings2,
    colorClass: "border border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-400/30 dark:bg-cyan-500/16 dark:text-cyan-100",
    filterField: "typeOfRequest",
    filterValue: "Configuration",
  },
  {
    key: "pendingDocs",
    label: "Pending Docs",
    sub: "Missing document links",
    icon: FileWarning,
    colorClass: "border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/30 dark:bg-rose-500/16 dark:text-rose-100",
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
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="glass-panel h-44 animate-pulse rounded-[1.9rem]"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
      {KPI_CONFIG.map((cfg) => {
        const value = stats?.[cfg.key] ?? 0;
        const ratio = cfg.showProgress ? (stats?.completionRatio ?? 0) : null;
        const clickable = !!(cfg.filterField && onFilter);

        return (
          <div
            key={cfg.key}
            onClick={
              clickable
                ? () => onFilter!(cfg.filterField!, cfg.filterValue!)
                : undefined
            }
            className={cn(
              "glass-panel interactive-spotlight glow-ring lift-card motion-tile stagger-in relative flex min-h-[14rem] flex-col gap-5 overflow-hidden rounded-[1.9rem] p-6",
              clickable &&
                "cursor-pointer"
            )}
            onPointerMove={trackPointerGlow}
            onPointerLeave={clearPointerGlow}
            style={{ animationDelay: `${KPI_CONFIG.indexOf(cfg) * 80}ms` }}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-br from-white/70 to-transparent" />
            <div
              className={cn(
                "relative flex h-12 w-12 items-center justify-center rounded-[1.15rem] shadow-sm",
                "motion-icon",
                cfg.colorClass
              )}
            >
              <cfg.icon className="h-[1.15rem] w-[1.15rem] stroke-[2.25]" />
            </div>

            <div className="space-y-2">
              <div className="theme-subtle text-xs font-medium uppercase tracking-[0.2em]">
                {cfg.label}
              </div>
              <div className="theme-heading text-4xl font-bold tracking-tight tabular-nums">
                {typeof value === "number" ? value.toLocaleString() : value}
              </div>
              <div className="theme-body text-sm leading-6">{cfg.sub}</div>
            </div>

            {ratio !== null && (
              <div className="mt-auto space-y-2">
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-green-600 transition-all duration-700"
                    style={{ width: `${Math.min(ratio, 100)}%` }}
                  />
                </div>
                <div className="theme-subtle text-[10px] uppercase tracking-[0.18em]">{ratio}% completion</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
