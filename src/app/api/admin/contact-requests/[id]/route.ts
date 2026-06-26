import { z } from "zod";
import { NextRequest } from "next/server";
import { handleApiError, jsonError, jsonOk } from "@/lib/api/response";
import { verifyCognitoRequest } from "@/lib/auth/cognito";
import { updateContactRequest } from "@/services/server/contactRequestRepository";
import { writeAuditLog } from "@/services/server/auditLogRepository";

const schema = z.object({
  status: z.enum(["new", "read", "contacted", "quoted", "accepted", "inProduction", "completed", "discarded"]),
  internalNotes: z.string().optional()
});

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = await verifyCognitoRequest(request);
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return jsonError("Datos inválidos.", 422);
    await updateContactRequest(id, parsed.data.status, parsed.data.internalNotes);
    await writeAuditLog({ userId: auth.sub, email: auth.email, action: "update", entity: "contactRequest", entityId: id, description: parsed.data.status });
    return jsonOk({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
