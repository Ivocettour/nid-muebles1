import { NextRequest } from "next/server";
import { handleApiError, jsonError, jsonOk } from "@/lib/api/response";
import { verifyCognitoRequest } from "@/lib/auth/cognito";
import { contentSectionSchema } from "@/lib/validations/content";
import { putContentSection } from "@/services/server/contentRepository";
import { writeAuditLog } from "@/services/server/auditLogRepository";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ section: string }> }) {
  try {
    const { section } = await params;
    const auth = await verifyCognitoRequest(request);
    const parsed = contentSectionSchema.safeParse(await request.json());
    if (!parsed.success) return jsonError("Datos inválidos.", 422);
    const content = { section, data: parsed.data.data, updatedAt: new Date().toISOString(), updatedBy: auth.sub };
    await putContentSection(content);
    await writeAuditLog({ userId: auth.sub, email: auth.email, action: "update", entity: "content", entityId: section });
    return jsonOk({ content });
  } catch (error) {
    return handleApiError(error);
  }
}
