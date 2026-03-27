// src/app/reports/page.tsx
"use client";

import { useState } from "react";
import { useChartData, useFilterOptions } from "@/hooks/useRecords";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn, topN, MONTH_ORDER } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line,
} from "recharts";

const COLORS = [
  "#2563eb","#16a34a","#d97706","#7c3aed","#0891b2",
  "#dc2626","#ea580c","#0d9488","#9333ea","#65a30d",
];

const TOOLTIP_STYLE = {
  contentStyle: {
    background: "#1e293b",
    border: "none",
    borderRadius: 8,
    fontSize: 12,
    color: "#f8fafc",
  },
};

function EmptyChart() {
  return (
    <div className="flex h-48 items-center justify-center">
      <p className="text-xs text-slate-400">No data for this selection</p>
    </div>
  );
}

function LoadingChart() {
  return <div className="h-48 w-full animate-pulse rounded-lg bg-slate-100" />;
}

export default function ReportsPage() {
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const { data: filterOptions } = useFilterOptions();
  const { data: chartData, isLoading } = useChartData(
    selectedYear === "all" ? undefined : selectedYear
  );

  const years = filterOptions?.years ?? [];

  // Year-over-year bar chart data
  const yearlyData = Object.entries(chartData?.byYear ?? {})
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, value]) => ({ name, value }));

  // Monthly trend (sorted by month order)
  const monthlyData = MONTH_ORDER
    .filter((m) => (chartData?.byMonth ?? {})[m] !== undefined)
    .map((m) => ({ name: m, value: (chartData?.byMonth ?? {})[m] ?? 0 }));

  // Pie data
  const statusData = Object.entries(chartData?.byStatus ?? {})
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  const typeData = Object.entries(chartData?.byType ?? {})
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  // Bar data
  const requesterData = topN(chartData?.byRequester ?? {}, 10);
  const trCreatorData = topN(chartData?.byTrCreatedBy ?? {}, 10);
  const movedByData = topN(chartData?.byTrMovedBy ?? {}, 10);

  return (
    <div className="space-y-5">
      {/* ── Year filter chips ──────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Filter Year:
        </span>
        {["all", ...years].map((y) => (
          <button
            key={y}
            onClick={() => setSelectedYear(y)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              selectedYear === y
                ? "border-blue-500 bg-blue-600 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600"
            )}
          >
            {y === "all" ? "All Years" : y}
          </button>
        ))}
      </div>

      {/* ── Year-over-Year Volume ─────────────────── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Year-over-Year Volume</CardTitle>
          <CardDescription className="text-xs">Total change requests per year</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? <LoadingChart /> : yearlyData.length === 0 ? <EmptyChart /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={yearlyData} margin={{ left: -20, right: 8, top: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [`${v} requests`, "Volume"]} />
                <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* ── Monthly Trend ─────────────────────────── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Monthly Request Trend</CardTitle>
          <CardDescription className="text-xs">
            {selectedYear === "all" ? "All years" : selectedYear}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? <LoadingChart /> : monthlyData.length === 0 ? <EmptyChart /> : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthlyData} margin={{ left: -20, right: 8, top: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [`${v} requests`, "Requests"]} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ fill: "#2563eb", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* ── Status + Type Pies ────────────────────── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <LoadingChart /> : statusData.length === 0 ? <EmptyChart /> : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip {...TOOLTIP_STYLE} formatter={(v: number, n: string) => [`${v} records`, n]} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Request Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <LoadingChart /> : typeData.length === 0 ? <EmptyChart /> : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={typeData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip {...TOOLTIP_STYLE} formatter={(v: number, n: string) => [`${v} records`, n]} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Requester + TR Creator bars ───────────── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[
          { title: "Requester Activity", data: requesterData, color: "#7c3aed" },
          { title: "TR Creator Activity", data: trCreatorData, color: "#0891b2" },
        ].map(({ title, data, color }) => (
          <Card key={title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? <LoadingChart /> : data.length === 0 ? <EmptyChart /> : (
                <ResponsiveContainer width="100%" height={Math.max(200, data.length * 32)}>
                  <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [`${v} requests`, "Volume"]} />
                    <Bar dataKey="value" fill={color} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── TR Moved By ───────────────────────────── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">TR Moved By</CardTitle>
          <CardDescription className="text-xs">Transport requests by mover</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? <LoadingChart /> : movedByData.length === 0 ? <EmptyChart /> : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={movedByData} margin={{ left: -20, right: 8, top: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [`${v} records`, "Moved"]} />
                <Bar dataKey="value" fill="#0891b2" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
