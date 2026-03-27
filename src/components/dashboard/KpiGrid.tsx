// src/components/dashboard/KpiGrid.tsx
"use client";

import { DashboardStats } from "@/types";
import { cn } from "@/lib/utils";
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
    colorClass: "bg-blue-50 text-blue-600",
  },
  {
    key: "open",
    label: "Open",
    sub: "Awaiting action",
    icon: Clock,
    colorClass: "bg-amber-50 text-amber-600",
    filterField: "status",
    filterValue: "Open",
  },
  {
    key: "closed",
    label: "Closed",
    sub: "Completed",
    icon: CheckCircle2,
    colorClass: "bg-green-50 text-green-600",
    filterField: "status",
    filterValue: "Closed",
    showProgress: true,
  },
  {
    key: "dev",
    label: "Development",
    sub: "Dev type requests",
    icon: Code2,
    colorClass: "bg-violet-50 text-violet-600",
    filterField: "typeOfRequest",
    filterValue: "Development",
  },
  {
    key: "configuration",
    label: "Configuration",
    sub: "Config type requests",
    icon: Settings2,
    colorClass: "bg-cyan-50 text-cyan-600",
    filterField: "typeOfRequest",
    filterValue: "Configuration",
  },
  {
    key: "pendingDocs",
    label: "Pending Docs",
    sub: "Missing document links",
    icon: FileWarning,
    colorClass: "bg-red-50 text-red-600",
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
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="glass-panel h-36 animate-pulse rounded-[1.75rem]"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
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
              "glass-panel glow-ring lift-card stagger-in relative flex min-h-[9.5rem] flex-col gap-4 overflow-hidden rounded-[1.75rem] p-4",
              clickable &&
                "cursor-pointer"
            )}
            style={{ animationDelay: `${KPI_CONFIG.indexOf(cfg) * 80}ms` }}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-br from-white/70 to-transparent" />
            <div
              className={cn(
                "relative flex h-11 w-11 items-center justify-center rounded-2xl shadow-sm",
                cfg.colorClass
              )}
            >
              <cfg.icon className="h-4 w-4" />
            </div>

            <div className="space-y-1">
              <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
                {cfg.label}
              </div>
              <div className="text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
                {typeof value === "number" ? value.toLocaleString() : value}
              </div>
              <div className="text-[11px] text-slate-500">{cfg.sub}</div>
            </div>

            {ratio !== null && (
              <div className="mt-auto space-y-2">
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-green-600 transition-all duration-700"
                    style={{ width: `${Math.min(ratio, 100)}%` }}
                  />
                </div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{ratio}% completion</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
