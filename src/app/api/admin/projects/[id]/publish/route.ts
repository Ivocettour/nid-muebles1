import { NextRequest } from "next/server";
import { handleApiError, jsonError, jsonOk } from "@/lib/api/response";
import { verifyCognitoRequest } from "@/lib/auth/cognito";
import { getProjectById, putProject } from "@/services/server/projectRepository";
import { writeAuditLog } from "@/services/server/auditLogRepository";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = await verifyCognitoRequest(request);
    const project = await getProjectById(id);
    if (!project) return jsonError("Proyecto no encontrado.", 404);
    const updated = { ...project, status: "published" as const, updatedAt: new Date().toISOString(), updatedBy: auth.sub };
    await putProject(updated);
    await writeAuditLog({ userId: auth.sub, email: auth.email, action: "publish", entity: "project", entityId: id, description: project.name });
    return jsonOk({ project: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
