// src/app/api/filter-options/route.ts
import { getFilterOptions } from "@/services/settings.service";
import { ok, serverError } from "@/lib/api-response";

export async function GET() {
  try {
    const options = await getFilterOptions();
    return ok(options);
  } catch (err) {
    return serverError(err);
  }
}
