// src/components/ui/StatusBadge.tsx
import { cn, statusVariant } from "@/lib/utils";

const VARIANT_CLASSES = {
  success: "border-green-200 bg-green-50 text-green-700 ring-green-100 dark:border-green-400/30 dark:bg-green-500/12 dark:text-green-100",
  info: "border-blue-200 bg-blue-50 text-blue-700 ring-blue-100 dark:border-blue-400/30 dark:bg-blue-500/12 dark:text-blue-100",
  warning: "border-amber-200 bg-amber-50 text-amber-700 ring-amber-100 dark:border-amber-400/30 dark:bg-amber-500/12 dark:text-amber-100",
  error: "border-red-200 bg-red-50 text-red-700 ring-red-100 dark:border-red-400/30 dark:bg-red-500/12 dark:text-red-100",
  violet: "border-violet-200 bg-violet-50 text-violet-700 ring-violet-100 dark:border-violet-400/30 dark:bg-violet-500/12 dark:text-violet-100",
  cyan: "border-cyan-200 bg-cyan-50 text-cyan-700 ring-cyan-100 dark:border-cyan-400/30 dark:bg-cyan-500/12 dark:text-cyan-100",
  secondary: "border-slate-200 bg-slate-50 text-slate-600 ring-slate-100 dark:border-slate-400/25 dark:bg-slate-500/10 dark:text-slate-100",
};

const DOT_CLASSES = {
  success:  "bg-green-500",
  info:     "bg-blue-500",
  warning:  "bg-amber-500",
  error:    "bg-red-500",
  violet:   "bg-violet-500",
  cyan:     "bg-cyan-500",
  secondary:"bg-slate-400",
};

interface StatusBadgeProps {
  value: string | null | undefined;
  className?: string;
}

export function StatusBadge({ value, className }: StatusBadgeProps) {
  if (!value) return <span className="text-slate-300 text-xs">—</span>;
  const variant = statusVariant(value);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap",
        VARIANT_CLASSES[variant],
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", DOT_CLASSES[variant])} />
      {value}
    </span>
  );
}
