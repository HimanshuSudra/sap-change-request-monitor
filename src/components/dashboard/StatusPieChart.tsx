// src/components/dashboard/StatusPieChart.tsx
"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { topN } from "@/lib/utils";

const COLORS = [
  "#2563eb","#16a34a","#d97706","#7c3aed","#0891b2",
  "#dc2626","#ea580c","#0d9488","#9333ea","#65a30d",
];

interface Props {
  data: Record<string, number>;
  isLoading: boolean;
  onSliceClick?: (value: string) => void;
}

function EmptyChart() {
  return (
    <div className="flex h-48 items-center justify-center">
      <p className="text-xs text-slate-400">No data available</p>
    </div>
  );
}

function LoadingChart() {
  return (
    <div className="h-48 w-full animate-pulse rounded-lg bg-slate-100" />
  );
}

export function StatusPieChart({ data, isLoading, onSliceClick }: Props) {
  if (isLoading) return <LoadingChart />;

  const entries = Object.entries(data).filter(([, v]) => v > 0);
  if (!entries.length) return <EmptyChart />;

  const chartData = entries.map(([name, value]) => ({ name, value }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={75}
          paddingAngle={3}
          dataKey="value"
          onClick={(entry) => onSliceClick?.(entry.name)}
          className={onSliceClick ? "cursor-pointer" : ""}
        >
          {chartData.map((entry, i) => (
            <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "#1e293b",
            border: "none",
            borderRadius: 8,
            fontSize: 12,
            color: "#f8fafc",
          }}
          formatter={(value: number, name: string) => [`${value} records`, name]}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ── Type Pie Chart (reuse same impl) ─────────────────────────────

export function TypePieChart({ data, isLoading, onSliceClick }: Props) {
  return (
    <StatusPieChart data={data} isLoading={isLoading} onSliceClick={onSliceClick} />
  );
}

// ── Monthly Bar Chart ─────────────────────────────────────────────

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell as BarCell,
} from "recharts";
import { MONTH_ORDER } from "@/lib/utils";

interface MonthlyProps {
  data: Record<string, number>;
  isLoading: boolean;
}

export function MonthlyBarChart({ data, isLoading }: MonthlyProps) {
  if (isLoading) return <LoadingChart />;

  // Sort months in calendar order
  const chartData = MONTH_ORDER
    .filter((m) => data[m] !== undefined)
    .map((m) => ({ name: m, value: data[m] ?? 0 }));

  if (!chartData.length) return <EmptyChart />;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} margin={{ left: -20, right: 4, top: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            background: "#1e293b",
            border: "none",
            borderRadius: 8,
            fontSize: 12,
            color: "#f8fafc",
          }}
          formatter={(v: number) => [`${v} requests`, "Volume"]}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="#2563eb" />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Horizontal Bar Chart (Requesters / TR Creators) ───────────────

import {
  BarChart as HBarChart,
  Bar as HBar,
  XAxis as HXAxis,
  YAxis as HYAxis,
  CartesianGrid as HGrid,
  Tooltip as HTooltip,
} from "recharts";

interface BarProps {
  data: Record<string, number>;
  isLoading: boolean;
  color?: string;
  onBarClick?: (name: string) => void;
}

function HorizontalBarChart({ data, isLoading, color = "#7c3aed", onBarClick }: BarProps) {
  if (isLoading) return <LoadingChart />;

  const chartData = topN(data, 10);
  if (!chartData.length) return <EmptyChart />;

  return (
    <ResponsiveContainer width="100%" height={Math.max(200, chartData.length * 32)}>
      <HBarChart
        data={chartData}
        layout="vertical"
        margin={{ left: 8, right: 16, top: 4, bottom: 4 }}
      >
        <HGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
        <HXAxis
          type="number"
          tick={{ fontSize: 10, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <HYAxis
          type="category"
          dataKey="name"
          width={90}
          tick={{ fontSize: 10, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
        />
        <HTooltip
          contentStyle={{
            background: "#1e293b",
            border: "none",
            borderRadius: 8,
            fontSize: 12,
            color: "#f8fafc",
          }}
          formatter={(v: number) => [`${v} requests`, "Volume"]}
        />
        <HBar
          dataKey="value"
          fill={color}
          radius={[0, 4, 4, 0]}
          onClick={onBarClick ? (d) => onBarClick(d.name) : undefined}
          className={onBarClick ? "cursor-pointer" : ""}
        />
      </HBarChart>
    </ResponsiveContainer>
  );
}

export function RequesterBarChart(props: BarProps) {
  return <HorizontalBarChart {...props} color="#7c3aed" />;
}

export function TrCreatorBarChart(props: BarProps) {
  return <HorizontalBarChart {...props} color="#0891b2" />;
}
