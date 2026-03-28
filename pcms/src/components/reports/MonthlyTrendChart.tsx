"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

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

interface MonthlyTrendChartProps {
  data: Array<{ name: string; value: number }>;
  isLoading: boolean;
  selectedYear: string;
}

export function MonthlyTrendChart({ data, isLoading, selectedYear }: MonthlyTrendChartProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Monthly Request Trend</CardTitle>
        <CardDescription className="text-xs">
          {selectedYear === "all" ? "All years" : selectedYear}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? <LoadingChart /> : data.length === 0 ? <EmptyChart /> : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data} margin={{ left: -20, right: 8, top: 4 }}>
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
  );
}