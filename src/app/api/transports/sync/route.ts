import { syncTransports } from "@/services/sap-transport.service";
import { ok, serverError } from "@/lib/api-response";

export async function POST() {
  try {
    const result = await syncTransports();
    return ok(result, "Transport sync completed");
  } catch (err) {
    return serverError(err);
  }
}
