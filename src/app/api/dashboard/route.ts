// src/app/api/dashboard/route.ts
import { getDashboardStats } from "@/services/record.service";
import { ok, serverError } from "@/lib/api-response";

export async function GET() {
  try {
    const stats = await getDashboardStats();
    return ok(stats);
  } catch (err) {
    return serverError(err);
  }
}
