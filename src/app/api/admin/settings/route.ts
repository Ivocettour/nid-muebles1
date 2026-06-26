import { NextRequest } from "next/server";
import { handleApiError, jsonError, jsonOk } from "@/lib/api/response";
import { verifyCognitoRequest } from "@/lib/auth/cognito";
import { settingsSchema } from "@/lib/validations/content";
import { putSettings } from "@/services/server/settingsRepository";
import { writeAuditLog } from "@/services/server/auditLogRepository";

export async function PUT(request: NextRequest) {
  try {
    const auth = await verifyCognitoRequest(request, ["Admin"]);
    const parsed = settingsSchema.safeParse(await request.json());
    if (!parsed.success) return jsonError("Datos inválidos.", 422);
    const settings = { id: "public" as const, ...parsed.data, updatedAt: new Date().toISOString() };
    await putSettings(settings);
    await writeAuditLog({ userId: auth.sub, email: auth.email, action: "update", entity: "settings", entityId: "public" });
    return jsonOk({ settings });
  } catch (error) {
    return handleApiError(error);
  }
}
