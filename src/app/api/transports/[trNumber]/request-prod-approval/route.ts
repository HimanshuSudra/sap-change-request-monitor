import { ok, serverError } from "@/lib/api-response";
import { requestProductionApproval } from "@/services/sap-transport.service";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ trNumber: string }> }
) {
  try {
    const { trNumber } = await params;
    const result = await requestProductionApproval(decodeURIComponent(trNumber));
    return ok(result, result.message);
  } catch (err) {
    return serverError(err);
  }
}
