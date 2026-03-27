"use client";

import { cn } from "@/lib/utils";

interface YearFilterChipsProps {
  selectedYear: string;
  onYearChange: (year: string) => void;
  years: string[];
}

export function YearFilterChips({ selectedYear, onYearChange, years }: YearFilterChipsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Filter Year:
      </span>
      {["all", ...years].map((y) => (
        <button
          key={y}
          onClick={() => onYearChange(y)}
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
  );
}