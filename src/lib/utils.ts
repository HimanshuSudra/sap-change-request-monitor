// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import type React from "react";
import { twMerge } from "tailwind-merge";
import { ChangeRecord, TransportActionAudit, TransportRequest } from "@prisma/client";
import { ChangeRecordDto, TransportActionAuditDto, TransportRequestDto } from "@/types";

/** shadcn/ui className merge helper */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function trackPointerGlow(event: React.PointerEvent<HTMLElement>) {
  const bounds = event.currentTarget.getBoundingClientRect();
  const x = event.clientX - bounds.left;
  const y = event.clientY - bounds.top;
  const px = x / bounds.width - 0.5;
  const py = y / bounds.height - 0.5;

  event.currentTarget.style.setProperty("--mx", `${x}px`);
  event.currentTarget.style.setProperty("--my", `${y}px`);
  event.currentTarget.style.setProperty("--tx", `${px * 14}px`);
  event.currentTarget.style.setProperty("--ty", `${py * 10}px`);
  event.currentTarget.style.setProperty("--rx", `${py * -5}deg`);
  event.currentTarget.style.setProperty("--ry", `${px * 7}deg`);
}

export function clearPointerGlow(event: React.PointerEvent<HTMLElement>) {
  event.currentTarget.style.removeProperty("--mx");
  event.currentTarget.style.removeProperty("--my");
  event.currentTarget.style.removeProperty("--tx");
  event.currentTarget.style.removeProperty("--ty");
  event.currentTarget.style.removeProperty("--rx");
  event.currentTarget.style.removeProperty("--ry");
}

/** Convert a Prisma ChangeRecord to a plain JSON-safe DTO */
export function toDto(r: ChangeRecord): ChangeRecordDto {
  return {
    ...r,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    trCreationDate: r.trCreationDate?.toISOString().split("T")[0] ?? null,
    trMovedDate: r.trMovedDate?.toISOString().split("T")[0] ?? null,
    documentCheckedDate: r.documentCheckedDate?.toISOString().split("T")[0] ?? null,
  };
}

/** Convert a Prisma TransportRequest to a plain JSON-safe DTO */
export function toTransportDto(r: TransportRequest): TransportRequestDto {
  return {
    ...r,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    qaImportedAt: r.qaImportedAt?.toISOString() ?? null,
    prodImportedAt: r.prodImportedAt?.toISOString() ?? null,
    prodApprovalRequestedAt: r.prodApprovalRequestedAt?.toISOString() ?? null,
    prodApprovalDecisionAt: r.prodApprovalDecisionAt?.toISOString() ?? null,
    prodApprovalEmailSentAt: r.prodApprovalEmailSentAt?.toISOString() ?? null,
    lastSyncedAt: r.lastSyncedAt?.toISOString() ?? null,
    sapUpdatedAt: r.sapUpdatedAt?.toISOString() ?? null,
  };
}

/** Convert a Prisma TransportActionAudit to a plain JSON-safe DTO */
export function toTransportActionDto(a: TransportActionAudit): TransportActionAuditDto {
  return {
    ...a,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  };
}

/** Format a date string or Date to a readable label */
export function fmtDate(v: string | Date | null | undefined): string {
  if (!v) return "—";
  const d = typeof v === "string" ? new Date(v + "T00:00:00") : v;
  if (isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Short month name from a date */
export function monthName(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short" });
}

/** Determine status badge variant */
export function statusVariant(
  s: string | null | undefined
): "success" | "warning" | "error" | "info" | "secondary" | "violet" | "cyan" {
  if (!s) return "secondary";
  const l = s.toLowerCase();
  if (l.includes("complet") || l.includes("closed") || l.includes("done"))
    return "success";
  if (l.includes("imported")) return "success";
  if (l.includes("queue")) return "info";
  if (l.includes("fail")) return "error";
  if (l.includes("progress") || l.includes("active") || l.includes("open"))
    return "info";
  if (l.includes("pending") || l.includes("wait")) return "warning";
  if (l.includes("cancel") || l.includes("reject")) return "error";
  if (l.includes("hold")) return "violet";
  if (l.includes("dev")) return "violet";
  if (l.includes("config")) return "cyan";
  return "secondary";
}

/** Truncate a string to maxLength with ellipsis */
export function truncate(s: string | null | undefined, max: number): string {
  if (!s) return "";
  return s.length > max ? s.slice(0, max) + "…" : s;
}

/** Sort an object by its values descending, return top N entries */
export function topN(
  obj: Record<string, number>,
  n: number
): Array<{ name: string; value: number }> {
  return Object.entries(obj)
    .sort(([, a], [, b]) => b - a)
    .slice(0, n)
    .map(([name, value]) => ({ name, value }));
}

/** Generate year options: currentYear-3 through currentYear+6 */
export function generateYearOptions(): string[] {
  const cur = new Date().getFullYear();
  const years: string[] = [];
  for (let y = cur - 3; y <= cur + 6; y++) {
    years.push(String(y));
  }
  return years;
}

/** Strip HTML tags from a string (for Mojo descriptions) */
export function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

/** Map a chart data record with only the current year's months */
export const MONTH_ORDER = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];
