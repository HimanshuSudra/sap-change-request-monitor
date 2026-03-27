// src/app/api/records/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { getAllRecords, createRecord } from "@/services/record.service";
import { ok, created, apiError, serverError } from "@/lib/api-response";

// ── Zod validation schemas ────────────────────────────────────────

const CreateRecordSchema = z.object({
  year: z.string().min(1, "Year is required"),
  typeOfRequest: z.string().min(1, "Type of Request is required"),
  requestDescription: z.string().min(1, "Request Description is required").max(500),
  status: z.string().min(1, "Status is required"),

  serialNumber: z.string().max(30).optional(),
  requestNumber: z.string().max(30).optional(),
  mojoTicketUrl: z.string().url().optional().or(z.literal("")),
  developmentTaskOrReportName: z.string().optional(),
  tCode: z.string().max(20).optional(),
  programName: z.string().max(50).optional(),
  smartFormOrScript: z.string().max(80).optional(),
  smartformBackup: z.string().max(80).optional(),
  programBackup: z.string().max(80).optional(),
  trNumber: z.string().max(30).optional(),
  trCreatedBy: z.string().max(60).optional(),
  trCreationDate: z.string().optional(),
  trMovedBy: z.enum(["Lokesh", "Manoj", ""]).optional(),
  trMovedDate: z.string().optional(),
  moveTo: z.string().optional(),
  requester: z.string().max(80).optional(),
  documentTestCaseChecked: z.enum(["Yes", "No", "NA", ""]).optional(),
  documentCheckedBy: z.string().max(80).optional(),
  documentCheckedDate: z.string().optional(),
  documentUpdated: z.enum(["Yes", "No", "NA", ""]).optional(),
  programOrConfigurationVerified: z.enum(["Yes", "No", "NA", ""]).optional(),
  documentLink: z.string().url().or(z.literal("")).optional(),
  productionBackupLink: z.string().url().or(z.literal("")).optional(),
  remarks: z.string().max(400).optional(),
});

// ── GET /api/records ──────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;

    const params = {
      year: searchParams.get("year") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      typeOfRequest: searchParams.get("typeOfRequest") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
      pageSize: searchParams.get("pageSize") ? Number(searchParams.get("pageSize")) : 1000,
      sortBy: (searchParams.get("sortBy") as any) ?? "createdAt",
      sortDir: (searchParams.get("sortDir") as "asc" | "desc") ?? "desc",
    };

    const result = await getAllRecords(params);
    return ok(result);
  } catch (err) {
    return serverError(err);
  }
}

// ── POST /api/records ─────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreateRecordSchema.safeParse(body);

    if (!parsed.success) {
      const messages = parsed.error.errors.map((e) => e.message).join("; ");
      return apiError(`Validation failed: ${messages}`, 422);
    }

    const record = await createRecord(parsed.data as any);
    return created(record, "Record created successfully");
  } catch (err) {
    return serverError(err);
  }
}
