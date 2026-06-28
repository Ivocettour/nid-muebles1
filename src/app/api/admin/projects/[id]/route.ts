import { NextRequest } from "next/server";
import { handleApiError, jsonError, jsonOk } from "@/lib/api/response";
import { canDelete, verifyCognitoRequest } from "@/lib/auth/cognito";
import { revalidatePublicProjects } from "@/lib/revalidation";
import { projectSchema } from "@/lib/validations/project";
import { deleteProject, getProjectById, getProjectBySlug, putProject } from "@/services/server/projectRepository";
import { writeAuditLog } from "@/services/server/auditLogRepository";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = await verifyCognitoRequest(request);
    const existing = await getProjectById(id);
    const body = await request.json();
    const parsed = projectSchema.safeParse(body);
    if (!parsed.success) return jsonError("Datos invalidos.", 422);
    const duplicatedSlug = await getProjectBySlug(parsed.data.slug);
    if (duplicatedSlug && duplicatedSlug.id !== id) return jsonError("Ya existe un proyecto con ese slug.", 409);

    const now = new Date().toISOString();
    const updated = {
      id,
      name: parsed.data.name,
      slug: parsed.data.slug,
      shortDescription: parsed.data.shortDescription,
      description: parsed.data.description,
      categoryId: existing?.categoryId ?? "cat-custom",
      categoryName: parsed.data.categoryName,
      environment: parsed.data.environment,
      materials: parsed.data.materials.split(",").map((item) => item.trim()).filter(Boolean),
      finishes: parsed.data.finishes.split(",").map((item) => item.trim()).filter(Boolean),
      dimensions: parsed.data.dimensions,
      location: parsed.data.location,
      completionDate: parsed.data.completionDate,
      features: parsed.data.features.split(",").map((item) => item.trim()).filter(Boolean),
      mainImage: parsed.data.mainImage,
      images: parsed.data.images?.split("\n").map((item) => item.trim()).filter(Boolean) ?? [parsed.data.mainImage],
      featured: parsed.data.featured,
      status: parsed.data.status,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      createdBy: existing?.createdBy ?? auth.sub,
      updatedBy: auth.sub
    };

    await putProject(updated);
    revalidatePublicProjects(updated, existing?.slug);
    writeAuditLog({ userId: auth.sub, email: auth.email, action: existing ? "update" : "upsert", entity: "project", entityId: id, description: updated.name }).catch((auditError) => {
      console.error(JSON.stringify({ level: "warn", message: "Project audit log failed", detail: auditError instanceof Error ? auditError.message : "unknown" }));
    });

    return jsonOk({ project: updated });
  } catch (error) {
    if (error instanceof Error) return jsonError(error.message, 500);
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = await verifyCognitoRequest(request, ["Admin"]);
    if (!canDelete(auth.groups)) return jsonError("Acceso denegado.", 403);
    const existing = await getProjectById(id);
    await deleteProject(id);
    revalidatePublicProjects(existing);
    writeAuditLog({ userId: auth.sub, email: auth.email, action: "delete", entity: "project", entityId: id }).catch((auditError) => {
      console.error(JSON.stringify({ level: "warn", message: "Project audit log failed", detail: auditError instanceof Error ? auditError.message : "unknown" }));
    });
    return jsonOk({ ok: true });
  } catch (error) {
    if (error instanceof Error) return jsonError(error.message, 500);
    return handleApiError(error);
  }
}
