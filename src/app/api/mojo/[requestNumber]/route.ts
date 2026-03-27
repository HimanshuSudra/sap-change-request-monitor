// src/app/api/mojo/[requestNumber]/route.ts
import { NextRequest } from "next/server";
import { fetchMojoTicket } from "@/services/mojo.service";
import { ok, apiError, serverError } from "@/lib/api-response";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ requestNumber: string }> }
) {
  try {
    const { requestNumber } = await params;
    if (!requestNumber?.trim()) {
      return apiError("Request number is required", 400);
    }

    const result = await fetchMojoTicket(requestNumber.trim());

    if (!result.success) {
      return apiError(result.message, 422);
    }

    return ok(result.data, "Mojo ticket details fetched successfully");
  } catch (err) {
    return serverError(err);
  }
}
