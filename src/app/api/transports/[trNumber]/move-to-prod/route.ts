import { moveTransport } from "@/services/sap-transport.service";
import { ok, serverError } from "@/lib/api-response";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ trNumber: string }> }
) {
  try {
    const { trNumber } = await params;
    const result = await moveTransport(decodeURIComponent(trNumber), "PROD");
    return ok(result, result.message);
  } catch (err) {
    return serverError(err);
  }
}
