// src/types/index.ts
// Shared TypeScript types for the entire PCMS application

import { ChangeRecord, Setting, AuditLog, TrMovedBy, YesNoNa } from "@prisma/client";

// ── Re-export Prisma enums ────────────────────────────────────────
export { TrMovedBy, YesNoNa };

// ── Core record type (what the API returns) ───────────────────────
export type ChangeRecordWithLogs = ChangeRecord & {
  auditLogs?: AuditLog[];
};

// ── API-safe serialized record (dates become strings) ─────────────
export interface ChangeRecordDto {
  id: string;
  createdAt: string;
  updatedAt: string;

  // Request Information
  year: string;
  serialNumber: string | null;
  typeOfRequest: string;
  requestNumber: string | null;
  mojoTicketUrl: string | null;
  requestDescription: string;
  developmentTaskOrReportName: string | null;

  // Technical Details
  tCode: string | null;
  programName: string | null;
  smartFormOrScript: string | null;
  smartformBackup: string | null;
  programBackup: string | null;

  // Transport Request
  trNumber: string | null;
  trCreatedBy: string | null;
  trCreationDate: string | null;
  trMovedBy: TrMovedBy | null;
  trMovedDate: string | null;
  moveTo: string | null;

  // Documentation & Verification
  requester: string | null;
  documentTestCaseChecked: YesNoNa | null;
  documentCheckedBy: string | null;
  documentCheckedDate: string | null;
  documentUpdated: YesNoNa | null;
  programOrConfigurationVerified: YesNoNa | null;
  documentLink: string | null;
  productionBackupLink: string | null;

  // Status & Remarks
  status: string;
  remarks: string | null;
}

// ── Form data schema (what React Hook Form produces) ──────────────
export interface ChangeRecordFormData {
  year: string;
  serialNumber?: string;
  typeOfRequest: string;
  requestNumber?: string;
  mojoTicketUrl?: string;
  requestDescription: string;
  developmentTaskOrReportName?: string;
  tCode?: string;
  programName?: string;
  smartFormOrScript?: string;
  smartformBackup?: string;
  programBackup?: string;
  trNumber?: string;
  trCreatedBy?: string;
  trCreationDate?: string; // YYYY-MM-DD
  trMovedBy?: TrMovedBy | "";
  trMovedDate?: string; // YYYY-MM-DD
  moveTo?: string;
  requester?: string;
  documentTestCaseChecked?: YesNoNa | "";
  documentCheckedBy?: string;
  documentCheckedDate?: string; // YYYY-MM-DD
  documentUpdated?: YesNoNa | "";
  programOrConfigurationVerified?: YesNoNa | "";
  documentLink?: string;
  productionBackupLink?: string;
  status: string;
  remarks?: string;
}

// ── Filter options (from /api/filter-options) ─────────────────────
export interface FilterOptions {
  typeOfRequest: string[];
  status: string[];
  moveTo: string[];
  trMovedBy: string[]; // always ["Lokesh", "Manoj"]
  years: string[];
}

// ── Dashboard KPI stats ───────────────────────────────────────────
export interface DashboardStats {
  total: number;
  open: number;
  closed: number;
  dev: number;
  configuration: number;
  pendingDocs: number;
  completionRatio: number;
  thisMonth: number;
}

// ── Chart data aggregations ───────────────────────────────────────
export interface ChartData {
  byYear: Record<string, number>;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  byRequester: Record<string, number>;
  byTrCreatedBy: Record<string, number>;
  byTrMovedBy: Record<string, number>;
  byMonth: Record<string, number>; // "Jan" => count (current year)
  byMonthFull: Record<string, number>; // "Jan 24" => count (all years)
}

// ── API response wrapper ──────────────────────────────────────────
export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  message?: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ── Record list query params ──────────────────────────────────────
export interface RecordListParams {
  year?: string;
  status?: string;
  typeOfRequest?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: keyof ChangeRecordDto;
  sortDir?: "asc" | "desc";
}

// ── Mojo autofill response ────────────────────────────────────────
export interface MojoDetails {
  ticketTitle: string;
  requestDescription: string;
  requester: string;
  mojoTicketUrl: string;
}

// ── Setting ───────────────────────────────────────────────────────
export type SettingDto = Omit<Setting, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

// ── Audit log ─────────────────────────────────────────────────────
export type AuditLogDto = Omit<AuditLog, "createdAt"> & {
  createdAt: string;
};

// ── Table column definition ───────────────────────────────────────
export interface TableColumn {
  key: keyof ChangeRecordDto;
  label: string;
  width?: number;
  sortable?: boolean;
  badge?: boolean;
  mono?: boolean;
  date?: boolean;
  truncate?: number;
  link?: boolean;
}
