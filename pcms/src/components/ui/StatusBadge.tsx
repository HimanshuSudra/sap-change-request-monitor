// src/components/ui/StatusBadge.tsx
import { cn, statusVariant } from "@/lib/utils";

const VARIANT_CLASSES = {
  success: "bg-green-50 text-green-700 border-green-200 ring-green-100",
  info:    "bg-blue-50 text-blue-700 border-blue-200 ring-blue-100",
  warning: "bg-amber-50 text-amber-700 border-amber-200 ring-amber-100",
  error:   "bg-red-50 text-red-700 border-red-200 ring-red-100",
  violet:  "bg-violet-50 text-violet-700 border-violet-200 ring-violet-100",
  cyan:    "bg-cyan-50 text-cyan-700 border-cyan-200 ring-cyan-100",
  secondary:"bg-slate-50 text-slate-600 border-slate-200 ring-slate-100",
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
