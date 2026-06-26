import { NextRequest } from "next/server";
import { handleApiError, jsonError, jsonOk } from "@/lib/api/response";
import { canDelete, verifyCognitoRequest } from "@/lib/auth/cognito";
import { projectSchema } from "@/lib/validations/project";
import { deleteProject, getProjectById, putProject } from "@/services/server/projectRepository";
import { writeAuditLog } from "@/services/server/auditLogRepository";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = await verifyCognitoRequest(request);
    const existing = await getProjectById(id);
    if (!existing) return jsonError("Proyecto no encontrado.", 404);
    const body = await request.json();
    const parsed = projectSchema.safeParse(body);
    if (!parsed.success) return jsonError("Datos inválidos.", 422);
    const updated = {
      ...existing,
      ...parsed.data,
      materials: parsed.data.materials.split(",").map((item) => item.trim()).filter(Boolean),
      finishes: parsed.data.finishes.split(",").map((item) => item.trim()).filter(Boolean),
      features: parsed.data.features.split(",").map((item) => item.trim()).filter(Boolean),
      images: parsed.data.images?.split("\n").map((item) => item.trim()).filter(Boolean) ?? [parsed.data.mainImage],
      updatedAt: new Date().toISOString(),
      updatedBy: auth.sub
    };
    await putProject(updated);
    await writeAuditLog({ userId: auth.sub, email: auth.email, action: "update", entity: "project", entityId: id, description: updated.name });
    return jsonOk({ project: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = await verifyCognitoRequest(request, ["Admin"]);
    if (!canDelete(auth.groups)) return jsonError("Acceso denegado.", 403);
    await deleteProject(id);
    await writeAuditLog({ userId: auth.sub, email: auth.email, action: "delete", entity: "project", entityId: id });
    return jsonOk({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
