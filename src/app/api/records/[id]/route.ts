// src/app/api/records/[id]/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { getRecordById, updateRecord, deleteRecord } from "@/services/record.service";
import { ok, notFound, apiError, serverError } from "@/lib/api-response";

const UpdateRecordSchema = z.object({
  year: z.string().min(1, "Year is required").optional(),
  typeOfRequest: z.string().min(1, "Type of Request is required").optional(),
  requestDescription: z.string().min(1, "Request Description is required").max(500).optional(),
  status: z.string().min(1, "Status is required").optional(),
  serialNumber: z.string().max(30).optional().nullable(),
  requestNumber: z.string().max(30).optional().nullable(),
  developmentTaskOrReportName: z.string().optional().nullable(),
  tCode: z.string().max(20).optional().nullable(),
  programName: z.string().max(50).optional().nullable(),
  smartFormOrScript: z.string().max(80).optional().nullable(),
  smartformBackup: z.string().max(80).optional().nullable(),
  programBackup: z.string().max(80).optional().nullable(),
  trNumber: z.string().max(30).optional().nullable(),
  trCreatedBy: z.string().max(60).optional().nullable(),
  trCreationDate: z.string().optional().nullable(),
  trMovedBy: z.enum(["Lokesh", "Manoj", ""]).optional().nullable(),
  trMovedDate: z.string().optional().nullable(),
  moveTo: z.string().optional().nullable(),
  requester: z.string().max(80).optional().nullable(),
  documentTestCaseChecked: z.enum(["Yes", "No", "NA", ""]).optional().nullable(),
  documentCheckedBy: z.string().max(80).optional().nullable(),
  documentCheckedDate: z.string().optional().nullable(),
  documentUpdated: z.enum(["Yes", "No", "NA", ""]).optional().nullable(),
  programOrConfigurationVerified: z.enum(["Yes", "No", "NA", ""]).optional().nullable(),
  documentLink: z.string().url().or(z.literal("")).optional().nullable(),
  productionBackupLink: z.string().url().or(z.literal("")).optional().nullable(),
  remarks: z.string().max(400).optional().nullable(),
});

// ── GET /api/records/:id ──────────────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const record = await getRecordById(id);
    if (!record) return notFound();
    return ok(record);
  } catch (err) {
    return serverError(err);
  }
}

// ── PUT /api/records/:id ──────────────────────────────────────────

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = UpdateRecordSchema.safeParse(body);

    if (!parsed.success) {
      const messages = parsed.error.errors.map((e) => e.message).join("; ");
      return apiError(`Validation failed: ${messages}`, 422);
    }

    const record = await updateRecord(id, parsed.data as any);
    return ok(record, "Record updated successfully");
  } catch (err: any) {
    if (err?.message?.includes("not found")) return notFound(err.message);
    return serverError(err);
  }
}

// ── DELETE /api/records/:id ───────────────────────────────────────

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteRecord(id);
    return ok(null, "Record deleted successfully");
  } catch (err: any) {
    if (err?.message?.includes("not found")) return notFound(err.message);
    return serverError(err);
  }
}
