// src/app/api/charts/route.ts
import { NextRequest } from "next/server";
import { getChartData } from "@/services/record.service";
import { ok, serverError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const year = req.nextUrl.searchParams.get("year") ?? undefined;
    const data = await getChartData(year);
    return ok(data);
  } catch (err) {
    return serverError(err);
  }
}
