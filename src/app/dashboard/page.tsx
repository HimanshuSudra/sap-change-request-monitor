// src/app/dashboard/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useDashboardStats, useChartData } from "@/hooks/useRecords";
import { KpiGrid } from "@/components/dashboard/KpiGrid";
import { StatusPieChart } from "@/components/dashboard/StatusPieChart";
import { TypePieChart } from "@/components/dashboard/TypePieChart";
import { MonthlyBarChart } from "@/components/dashboard/MonthlyBarChart";
import { RequesterBarChart } from "@/components/dashboard/RequesterBarChart";
import { TrCreatorBarChart } from "@/components/dashboard/TrCreatorBarChart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function DashboardPage() {
  const router = useRouter();
  const { data: statsData, isLoading: statsLoading } = useDashboardStats();
  const { data: chartData, isLoading: chartsLoading } = useChartData();

  function handleChartFilter(field: string, value: string) {
    router.push(`/records?${field}=${encodeURIComponent(value)}`);
  }

  return (
    <div className="space-y-6">
      <section className="stagger-in glass-panel hero-grid glow-ring motion-tile relative overflow-hidden rounded-[2rem] border-white/50 px-6 py-8 md:px-8">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="orb-layer -left-8 top-4 h-32 w-32 bg-sky-300/30" />
          <div className="orb-layer right-16 top-10 h-24 w-24 bg-cyan-300/35" style={{ animationDelay: "-5s" }} />
          <div className="orb-layer bottom-[-2rem] right-[20%] h-44 w-44 bg-blue-500/15" style={{ animationDelay: "-8s" }} />
        </div>
        <div className="relative grid gap-8 lg:grid-cols-[1.5fr_0.8fr] lg:items-end">
          <div className="space-y-5">
            <div className="hero-badge inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em]">
              SAP Change Request Monitoring Tool
            </div>
            <div className="max-w-3xl space-y-3">
              <h2 className="theme-heading font-display text-3xl font-semibold tracking-tight md:text-5xl">
                Record, monitor, and track SAP changes across development and configuration work.
              </h2>
              <p className="theme-body max-w-2xl text-sm leading-7 md:text-base">
                Use this tool to capture SAP-level changes, follow transport movement, maintain supporting documentation, and monitor request status from creation through closure for both development and configuration activities.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="glass-panel motion-tile lift-card rounded-[1.5rem] border-white/50 p-4">
              <div className="theme-subtle text-[11px] uppercase tracking-[0.2em]">Throughput</div>
              <div className="theme-heading mt-2 text-3xl font-bold">{statsData?.total ?? 0}</div>
              <div className="theme-body mt-2 text-xs">Requests currently indexed in the control plane</div>
            </div>
            <div className="glass-panel motion-tile lift-card rounded-[1.5rem] border-white/50 p-4">
              <div className="theme-subtle text-[11px] uppercase tracking-[0.2em]">Completion</div>
              <div className="theme-heading mt-2 text-3xl font-bold">{statsData?.completionRatio ?? 0}%</div>
              <div className="theme-body mt-2 text-xs">Closed requests relative to portfolio volume</div>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Cards */}
      <KpiGrid stats={statsData} isLoading={statsLoading} onFilter={handleChartFilter} />

      {/* Row 1: Status, Type, Monthly */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="glass-panel stagger-in lift-card rounded-[1.75rem] border-white/50 bg-white/75">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Status Distribution</CardTitle>
            <CardDescription className="text-xs">All records by current status</CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <StatusPieChart
              data={chartData?.byStatus ?? {}}
              isLoading={chartsLoading}
              onSliceClick={(value) => handleChartFilter("status", value)}
            />
            <p className="theme-subtle mt-2 text-center text-[10px]">
              Click a slice to filter records
            </p>
          </CardContent>
        </Card>

        <Card className="glass-panel stagger-in lift-card rounded-[1.75rem] border-white/50 bg-white/75" style={{ animationDelay: "120ms" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Type of Request</CardTitle>
            <CardDescription className="text-xs">Breakdown by request type</CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <TypePieChart
              data={chartData?.byType ?? {}}
              isLoading={chartsLoading}
              onSliceClick={(value) => handleChartFilter("typeOfRequest", value)}
            />
            <p className="theme-subtle mt-2 text-center text-[10px]">
              Click a slice to filter records
            </p>
          </CardContent>
        </Card>

        <Card className="glass-panel stagger-in lift-card rounded-[1.75rem] border-white/50 bg-white/75" style={{ animationDelay: "220ms" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Monthly Volume</CardTitle>
            <CardDescription className="text-xs">
              TR creation by month (this year)
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <MonthlyBarChart data={chartData?.byMonth ?? {}} isLoading={chartsLoading} />
            <p className="theme-subtle mt-2 text-center text-[10px]">
              Records created each month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Top Requesters + Top TR Creators */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="glass-panel stagger-in lift-card rounded-[1.75rem] border-white/50 bg-white/75" style={{ animationDelay: "300ms" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Top Requesters</CardTitle>
            <CardDescription className="text-xs">By volume of requests (top 10)</CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <RequesterBarChart
              data={chartData?.byRequester ?? {}}
              isLoading={chartsLoading}
              onBarClick={(value) => handleChartFilter("requester", value)}
            />
          </CardContent>
        </Card>

        <Card className="glass-panel stagger-in lift-card rounded-[1.75rem] border-white/50 bg-white/75" style={{ animationDelay: "380ms" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Top TR Creators</CardTitle>
            <CardDescription className="text-xs">By transport requests created (top 10)</CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <TrCreatorBarChart
              data={chartData?.byTrCreatedBy ?? {}}
              isLoading={chartsLoading}
              onBarClick={(value) => handleChartFilter("trCreatedBy", value)}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
