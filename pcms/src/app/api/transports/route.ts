import { getTransportDashboardData } from "@/services/sap-transport.service";
import { ok, serverError } from "@/lib/api-response";

export async function GET() {
  try {
    const result = await getTransportDashboardData();
    return ok(result);
  } catch (err) {
    return serverError(err);
  }
}
