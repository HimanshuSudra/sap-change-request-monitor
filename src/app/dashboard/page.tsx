"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowUpRight,
  BadgeCheck,
  Clock3,
  FolderKanban,
  Layers3,
  ShieldCheck,
  TimerReset,
} from "lucide-react";
import { useDashboardStats, useChartData } from "@/hooks/useRecords";
import { KpiGrid } from "@/components/dashboard/KpiGrid";
import { StatusPieChart } from "@/components/dashboard/StatusPieChart";
import { TypePieChart } from "@/components/dashboard/TypePieChart";
import { MonthlyBarChart } from "@/components/dashboard/MonthlyBarChart";
import { RequesterBarChart } from "@/components/dashboard/RequesterBarChart";
import { TrCreatorBarChart } from "@/components/dashboard/TrCreatorBarChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { clearPointerGlow, cn, trackPointerGlow } from "@/lib/utils";

function topEntry(entries: Record<string, number>) {
  const [name, value] =
    Object.entries(entries).sort((a, b) => b[1] - a[1])[0] ?? ["None", 0];
  return { name, value };
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: statsData, isLoading: statsLoading } = useDashboardStats();
  const { data: chartData, isLoading: chartsLoading } = useChartData();

  function handleChartFilter(field: string, value: string) {
    router.push(`/records?${field}=${encodeURIComponent(value)}`);
  }

  const insights = useMemo(() => {
    const topRequester = topEntry(chartData?.byRequester ?? {});
    const topCreator = topEntry(chartData?.byTrCreatedBy ?? {});
    const total = statsData?.total ?? 0;
    const open = statsData?.open ?? 0;
    const completion = statsData?.completionRatio ?? 0;

    return {
      openRate: total ? Math.round((open / total) * 100) : 0,
      topRequester,
      topCreator,
      completion,
      thisMonth: statsData?.thisMonth ?? 0,
    };
  }, [chartData, statsData]);

  const overviewCards = [
    {
      label: "Execution tempo",
      value: `${insights.thisMonth}`,
      caption: "Requests landed this month",
      icon: Activity,
      accent: "from-cyan-500/20 via-sky-500/8 to-transparent",
    },
    {
      label: "Closure ratio",
      value: `${insights.completion}%`,
      caption: "Portfolio completion",
      icon: BadgeCheck,
      accent: "from-emerald-500/20 via-green-500/8 to-transparent",
    },
    {
      label: "Open exposure",
      value: `${insights.openRate}%`,
      caption: "Records still in flight",
      icon: TimerReset,
      accent: "from-amber-500/20 via-orange-500/8 to-transparent",
    },
  ];

  return (
    <div className="dashboard-shell">
      <section
        className="magnetic-surface glass-panel interactive-spotlight hero-grid glow-ring relative overflow-hidden rounded-[2.5rem] border-white/50 px-8 py-10 md:px-10 md:py-12"
        onPointerMove={trackPointerGlow}
        onPointerLeave={clearPointerGlow}
      >
        <div className="magnetic-depth pointer-events-none absolute inset-0 overflow-hidden">
          <div className="orb-layer left-[-2rem] top-10 h-40 w-40 bg-cyan-300/20" />
          <div className="orb-layer right-[10%] top-6 h-48 w-48 bg-blue-500/12" style={{ animationDelay: "-6s" }} />
          <div className="orb-layer bottom-[-4rem] left-[42%] h-56 w-56 bg-slate-200/10" style={{ animationDelay: "-10s" }} />
        </div>
        <div className="relative grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
          <div className="magnetic-child space-y-6">
            <div className="hero-badge inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em]">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>
              PCMS Operational Command
            </div>
            <div className="max-w-4xl space-y-4">
              <h2 className="theme-heading font-display text-4xl font-semibold tracking-tight md:text-[4.25rem] md:leading-[0.98]">
                Run SAP change delivery from a
                <span className="theme-gradient-text"> real control surface</span>.
              </h2>
              <p className="theme-body max-w-2xl text-base leading-8 md:text-lg">
                Watch request volume, release readiness, documentation health, and transport movement from one live dashboard built to read like an operations room, not a form library.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {overviewCards.map((card) => (
                <div
                  key={card.label}
                  className={cn(
                    "surface-dim mini-grid rounded-[1.75rem] p-5 shadow-[0_20px_50px_rgba(2,6,23,0.18)]",
                    "bg-gradient-to-br",
                    card.accent
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="section-label">{card.label}</div>
                      <div className="theme-heading text-4xl font-semibold">{card.value}</div>
                    </div>
                    <div className="motion-icon flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white/90 shadow-[0_12px_30px_rgba(2,6,23,0.18)]">
                      <card.icon className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="theme-body mt-4 text-sm leading-6">{card.caption}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="magnetic-child grid gap-4 md:grid-cols-2 xl:grid-cols-1">
            <div className="surface-dim rounded-[2rem] p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="section-label">Live posture</div>
                  <div className="theme-heading mt-2 text-2xl font-semibold">Release board stable</div>
                </div>
                <ShieldCheck className="h-8 w-8 text-emerald-300" />
              </div>
              <div className="ops-divider mt-5 grid gap-4 border-t pt-5 sm:grid-cols-2">
                <div>
                  <div className="theme-subtle text-xs uppercase tracking-[0.2em]">Top requester</div>
                  <div className="theme-heading mt-2 text-lg font-semibold">{insights.topRequester.name}</div>
                  <div className="theme-body mt-1 text-sm">{insights.topRequester.value} records driving the queue</div>
                </div>
                <div>
                  <div className="theme-subtle text-xs uppercase tracking-[0.2em]">Top TR creator</div>
                  <div className="theme-heading mt-2 text-lg font-semibold">{insights.topCreator.name}</div>
                  <div className="theme-body mt-1 text-sm">{insights.topCreator.value} transports issued recently</div>
                </div>
              </div>
            </div>

            <div className="surface-dim rounded-[2rem] p-6">
              <div className="flex items-center justify-between">
                <div className="section-label">Flow controls</div>
                <ArrowUpRight className="h-4 w-4 theme-subtle" />
              </div>
              <div className="mt-5 space-y-4">
                <button
                  type="button"
                  onClick={() => router.push("/trms")}
                  className="theme-hover-surface flex w-full items-center justify-between rounded-[1.4rem] border border-border/70 px-4 py-4 text-left transition-colors"
                >
                  <div>
                    <div className="theme-heading text-base font-semibold">Transport release lane</div>
                    <div className="theme-body mt-1 text-sm">Move into QA, review production readiness, and sync SAP status.</div>
                  </div>
                  <Layers3 className="h-5 w-5 text-cyan-300" />
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/reports")}
                  className="theme-hover-surface flex w-full items-center justify-between rounded-[1.4rem] border border-border/70 px-4 py-4 text-left transition-colors"
                >
                  <div>
                    <div className="theme-heading text-base font-semibold">Trend reporting</div>
                    <div className="theme-body mt-1 text-sm">Check historical flow, closure pace, and request concentration by team.</div>
                  </div>
                  <FolderKanban className="h-5 w-5 text-violet-300" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <KpiGrid stats={statsData} isLoading={statsLoading} onFilter={handleChartFilter} />

      <div className="grid gap-5 2xl:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-5 xl:grid-cols-2">
          <Card className="glass-panel metric-card rounded-[2rem] border-white/50 bg-white/75">
            <CardHeader>
              <CardTitle className="text-base">Status Distribution</CardTitle>
              <CardDescription className="text-sm">Current request states across the control plane</CardDescription>
            </CardHeader>
            <CardContent>
              <StatusPieChart
                data={chartData?.byStatus ?? {}}
                isLoading={chartsLoading}
                onSliceClick={(value) => handleChartFilter("status", value)}
              />
              <p className="theme-subtle mt-4 text-center text-xs">Use this to jump directly into open or blocked slices.</p>
            </CardContent>
          </Card>

          <Card className="glass-panel metric-card rounded-[2rem] border-white/50 bg-white/75">
            <CardHeader>
              <CardTitle className="text-base">Request Mix</CardTitle>
              <CardDescription className="text-sm">Development versus configuration load</CardDescription>
            </CardHeader>
            <CardContent>
              <TypePieChart
                data={chartData?.byType ?? {}}
                isLoading={chartsLoading}
                onSliceClick={(value) => handleChartFilter("typeOfRequest", value)}
              />
              <p className="theme-subtle mt-4 text-center text-xs">Balance execution across engineering and functional streams.</p>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-panel metric-card rounded-[2rem] border-white/50 bg-white/75">
          <CardHeader>
            <CardTitle className="text-base">Monthly Throughput</CardTitle>
            <CardDescription className="text-sm">Current-year creation volume and delivery pressure</CardDescription>
          </CardHeader>
          <CardContent>
            <MonthlyBarChart data={chartData?.byMonth ?? {}} isLoading={chartsLoading} />
            <div className="ops-divider mt-4 grid gap-4 border-t pt-4 sm:grid-cols-3">
              <div>
                <div className="theme-subtle text-xs uppercase tracking-[0.2em]">Open work</div>
                <div className="theme-heading mt-2 text-2xl font-semibold">{statsData?.open ?? 0}</div>
              </div>
              <div>
                <div className="theme-subtle text-xs uppercase tracking-[0.2em]">Closed work</div>
                <div className="theme-heading mt-2 text-2xl font-semibold">{statsData?.closed ?? 0}</div>
              </div>
              <div>
                <div className="theme-subtle text-xs uppercase tracking-[0.2em]">This month</div>
                <div className="theme-heading mt-2 text-2xl font-semibold">{statsData?.thisMonth ?? 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 2xl:grid-cols-2">
        <Card className="glass-panel metric-card rounded-[2rem] border-white/50 bg-white/75">
          <CardHeader>
            <CardTitle className="text-base">Requester Activity</CardTitle>
            <CardDescription className="text-sm">Who is generating the most change demand right now</CardDescription>
          </CardHeader>
          <CardContent>
            <RequesterBarChart
              data={chartData?.byRequester ?? {}}
              isLoading={chartsLoading}
              onBarClick={(value) => handleChartFilter("requester", value)}
            />
          </CardContent>
        </Card>

        <Card className="glass-panel metric-card rounded-[2rem] border-white/50 bg-white/75">
          <CardHeader>
            <CardTitle className="text-base">Transport Creator Activity</CardTitle>
            <CardDescription className="text-sm">Transport creation ownership and execution concentration</CardDescription>
          </CardHeader>
          <CardContent>
            <TrCreatorBarChart
              data={chartData?.byTrCreatedBy ?? {}}
              isLoading={chartsLoading}
              onBarClick={(value) => handleChartFilter("trCreatedBy", value)}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        {[
          {
            title: "SLA posture",
            body: `${statsData?.open ?? 0} active requests are still moving through review and execution gates.`,
            icon: Clock3,
            accent: "text-amber-300",
          },
          {
            title: "Documentation hygiene",
            body: `${statsData?.pendingDocs ?? 0} records still need supporting links or validation evidence.`,
            icon: FolderKanban,
            accent: "text-rose-300",
          },
          {
            title: "Release confidence",
            body: `Completion is holding at ${statsData?.completionRatio ?? 0}% with a refreshed live data interval.`,
            icon: ShieldCheck,
            accent: "text-emerald-300",
          },
        ].map((item) => (
          <Card key={item.title} className="glass-panel metric-card rounded-[2rem] border-white/50 bg-white/75">
            <CardContent className="flex h-full flex-col justify-between gap-6">
              <div className="flex items-center justify-between gap-4">
                <div className="section-label">{item.title}</div>
                <item.icon className={cn("h-5 w-5", item.accent)} />
              </div>
              <p className="theme-body text-sm leading-7">{item.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
