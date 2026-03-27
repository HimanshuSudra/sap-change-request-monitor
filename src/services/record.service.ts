// src/services/record.service.ts
// All database operations for ChangeRecord — business logic lives here, not in route handlers

import { Prisma, TrMovedBy, YesNoNa } from "@prisma/client";
import prisma from "@/lib/prisma";
import { toDto } from "@/lib/utils";
import { ChangeRecordDto, ChangeRecordFormData, DashboardStats, ChartData, RecordListParams } from "@/types";
import { MONTH_ORDER } from "@/lib/utils";

// ── ALLOWED VALUES ────────────────────────────────────────────────

const TR_MOVED_BY_VALUES = Object.values(TrMovedBy);
const YES_NO_NA_VALUES = Object.values(YesNoNa);

// ── HELPERS ───────────────────────────────────────────────────────

function sanitizeTrMovedBy(v: unknown): TrMovedBy | null {
  if (!v || !TR_MOVED_BY_VALUES.includes(v as TrMovedBy)) return null;
  return v as TrMovedBy;
}

function sanitizeYesNoNa(v: unknown): YesNoNa | null {
  if (!v || !YES_NO_NA_VALUES.includes(v as YesNoNa)) return null;
  return v as YesNoNa;
}

function parseDate(v: unknown): Date | null {
  if (!v) return null;
  const d = new Date(v as string);
  return isNaN(d.getTime()) ? null : d;
}

function tally(map: Record<string, number>, key: unknown): void {
  if (key === null || key === undefined || String(key).trim() === "") return;
  const k = String(key).trim();
  map[k] = (map[k] ?? 0) + 1;
}

// ── BUILD PRISMA DATA FROM FORM PAYLOAD ───────────────────────────

function buildRecordData(payload: ChangeRecordFormData): Prisma.ChangeRecordCreateInput {
  return {
    year: payload.year,
    serialNumber: payload.serialNumber || null,
    typeOfRequest: payload.typeOfRequest,
    requestNumber: payload.requestNumber || null,
    requestDescription: payload.requestDescription,
    developmentTaskOrReportName: payload.developmentTaskOrReportName || null,
    tCode: payload.tCode || null,
    programName: payload.programName || null,
    smartFormOrScript: payload.smartFormOrScript || null,
    smartformBackup: payload.smartformBackup || null,
    programBackup: payload.programBackup || null,
    trNumber: payload.trNumber || null,
    trCreatedBy: payload.trCreatedBy || null,
    trCreationDate: parseDate(payload.trCreationDate),
    trMovedBy: sanitizeTrMovedBy(payload.trMovedBy),
    trMovedDate: parseDate(payload.trMovedDate),
    moveTo: payload.moveTo || null,
    requester: payload.requester || null,
    documentTestCaseChecked: sanitizeYesNoNa(payload.documentTestCaseChecked),
    documentCheckedBy: payload.documentCheckedBy || null,
    documentCheckedDate: parseDate(payload.documentCheckedDate),
    documentUpdated: sanitizeYesNoNa(payload.documentUpdated),
    programOrConfigurationVerified: sanitizeYesNoNa(payload.programOrConfigurationVerified),
    documentLink: payload.documentLink || null,
    productionBackupLink: payload.productionBackupLink || null,
    status: payload.status,
    remarks: payload.remarks || null,
  };
}

// ── CRUD ─────────────────────────────────────────────────────────

/** Get all records with optional filtering */
export async function getAllRecords(params: RecordListParams = {}): Promise<{
  records: ChangeRecordDto[];
  total: number;
}> {
  const {
    year, status, typeOfRequest, search,
    page = 1, pageSize = 1000,
    sortBy = "createdAt", sortDir = "desc",
  } = params;

  const where: Prisma.ChangeRecordWhereInput = {};

  if (year) where.year = year;
  if (status) where.status = status;
  if (typeOfRequest) where.typeOfRequest = typeOfRequest;
  if (search) {
    const s = search.trim();
    where.OR = [
      { requestDescription: { contains: s, mode: "insensitive" } },
      { requestNumber: { contains: s, mode: "insensitive" } },
      { serialNumber: { contains: s, mode: "insensitive" } },
      { trNumber: { contains: s, mode: "insensitive" } },
      { programName: { contains: s, mode: "insensitive" } },
      { requester: { contains: s, mode: "insensitive" } },
      { tCode: { contains: s, mode: "insensitive" } },
      { status: { contains: s, mode: "insensitive" } },
    ];
  }

  const orderBy: Prisma.ChangeRecordOrderByWithRelationInput = {
    [sortBy]: sortDir,
  };

  const [records, total] = await Promise.all([
    prisma.changeRecord.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.changeRecord.count({ where }),
  ]);

  return { records: records.map(toDto), total };
}

/** Get a single record by ID */
export async function getRecordById(id: string): Promise<ChangeRecordDto | null> {
  const record = await prisma.changeRecord.findUnique({ where: { id } });
  return record ? toDto(record) : null;
}

/** Create a new record — returns the created DTO */
export async function createRecord(payload: ChangeRecordFormData): Promise<ChangeRecordDto> {
  const data = buildRecordData(payload);
  const record = await prisma.changeRecord.create({ data });

  // Write audit log
  await prisma.auditLog.create({
    data: {
      action: "CREATE",
      recordId: record.id,
      after: record as unknown as Prisma.InputJsonValue,
    },
  });

  return toDto(record);
}

/** Update an existing record */
export async function updateRecord(
  id: string,
  payload: Partial<ChangeRecordFormData>
): Promise<ChangeRecordDto> {
  const before = await prisma.changeRecord.findUnique({ where: { id } });
  if (!before) throw new Error(`Record not found: ${id}`);

  const updateData = buildRecordData({ ...before, ...payload } as ChangeRecordFormData);
  const record = await prisma.changeRecord.update({ where: { id }, data: updateData });

  // Write audit log
  await prisma.auditLog.create({
    data: {
      action: "UPDATE",
      recordId: id,
      before: before as unknown as Prisma.InputJsonValue,
      after: record as unknown as Prisma.InputJsonValue,
    },
  });

  return toDto(record);
}

/** Soft-delete (hard delete for now — audit log preserves history) */
export async function deleteRecord(id: string): Promise<void> {
  const record = await prisma.changeRecord.findUnique({ where: { id } });
  if (!record) throw new Error(`Record not found: ${id}`);

  await prisma.auditLog.create({
    data: {
      action: "DELETE",
      recordId: id,
      before: record as unknown as Prisma.InputJsonValue,
    },
  });

  await prisma.changeRecord.delete({ where: { id } });
}

// ── DASHBOARD STATS ───────────────────────────────────────────────

export async function getDashboardStats(): Promise<DashboardStats> {
  const [total, open, closed, dev, config, pendingDocs, thisMonth] = await Promise.all([
    prisma.changeRecord.count(),
    prisma.changeRecord.count({ where: { status: { contains: "open", mode: "insensitive" } } }),
    prisma.changeRecord.count({
      where: { status: { in: ["Closed", "Completed", "Done"], mode: "insensitive" } as Prisma.StringFilter },
    }),
    prisma.changeRecord.count({ where: { typeOfRequest: { contains: "dev", mode: "insensitive" } } }),
    prisma.changeRecord.count({ where: { typeOfRequest: { contains: "config", mode: "insensitive" } } }),
    prisma.changeRecord.count({ where: { documentLink: null } }),
    (async () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return prisma.changeRecord.count({
        where: { trCreationDate: { gte: start, lte: end } },
      });
    })(),
  ]);

  const completionRatio = total > 0 ? Math.round((closed / total) * 100) : 0;

  return { total, open, closed, dev, configuration: config, pendingDocs, completionRatio, thisMonth };
}

// ── CHART DATA ────────────────────────────────────────────────────

export async function getChartData(filterYear?: string): Promise<ChartData> {
  const where: Prisma.ChangeRecordWhereInput = filterYear ? { year: filterYear } : {};
  const records = await prisma.changeRecord.findMany({ where });

  const byYear: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  const byType: Record<string, number> = {};
  const byRequester: Record<string, number> = {};
  const byTrCreatedBy: Record<string, number> = {};
  const byTrMovedBy: Record<string, number> = {};
  const byMonth: Record<string, number> = {};
  const byMonthFull: Record<string, number> = {};

  const now = new Date();
  const currentYear = now.getFullYear();

  for (const r of records) {
    tally(byYear, r.year);
    tally(byStatus, r.status);
    tally(byType, r.typeOfRequest);
    tally(byRequester, r.requester);
    tally(byTrCreatedBy, r.trCreatedBy);
    if (r.trMovedBy) tally(byTrMovedBy, r.trMovedBy);

    if (r.trCreationDate) {
      const d = r.trCreationDate;
      if (d.getFullYear() === currentYear) {
        tally(byMonth, MONTH_ORDER[d.getMonth()]);
      }
      const fullKey = `${MONTH_ORDER[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
      tally(byMonthFull, fullKey);
    }
  }

  return { byYear, byStatus, byType, byRequester, byTrCreatedBy, byTrMovedBy, byMonth, byMonthFull };
}

/** Get list of distinct years from all records */
export async function getDistinctYears(): Promise<string[]> {
  const result = await prisma.changeRecord.findMany({
    select: { year: true },
    distinct: ["year"],
    orderBy: { year: "desc" },
  });
  return result.map((r) => r.year).filter(Boolean);
}
