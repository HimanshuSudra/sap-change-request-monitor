import { ok, serverError } from "@/lib/api-response";
import { reviewProductionApproval } from "@/services/sap-transport.service";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ trNumber: string }> }
) {
  try {
    const { trNumber } = await params;
    const result = await reviewProductionApproval(decodeURIComponent(trNumber), "APPROVE");
    return ok(result, result.message);
  } catch (err) {
    return serverError(err);
  }
}
