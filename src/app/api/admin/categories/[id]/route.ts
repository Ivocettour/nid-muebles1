import { NextRequest } from "next/server";
import { handleApiError, jsonError, jsonOk } from "@/lib/api/response";
import { canDelete, verifyCognitoRequest } from "@/lib/auth/cognito";
import { revalidatePublicCategories } from "@/lib/revalidation";
import { categorySchema } from "@/lib/validations/category";
import { deleteCategory, getAnyCategoryBySlug, getCategoryById, putCategory } from "@/services/server/categoryRepository";
import { listAllProjects } from "@/services/server/projectRepository";
import { writeAuditLog } from "@/services/server/auditLogRepository";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = await verifyCognitoRequest(request);
    const existing = await getCategoryById(id);
    if (!existing) return jsonError("Categoria no encontrada.", 404);
    const parsed = categorySchema.safeParse(await request.json());
    if (!parsed.success) return jsonError("Datos invalidos.", 422);
    const duplicated = await getAnyCategoryBySlug(parsed.data.slug);
    if (duplicated && duplicated.id !== id) return jsonError("Ya existe una categoria con ese slug.", 409);
    const category = { ...existing, ...parsed.data, updatedAt: new Date().toISOString() };
    await putCategory(category);
    revalidatePublicCategories(category.slug);
    if (existing.slug !== category.slug) revalidatePublicCategories(existing.slug);
    await writeAuditLog({ userId: auth.sub, email: auth.email, action: "update", entity: "category", entityId: id, description: category.name });
    return jsonOk({ category });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = await verifyCognitoRequest(request, ["Admin"]);
    if (!canDelete(auth.groups)) return jsonError("Acceso denegado.", 403);
    const category = await getCategoryById(id);
    if (!category) return jsonError("Categoria no encontrada.", 404);
    const projects = await listAllProjects();
    const hasProjects = projects.some((project) => project.categoryId === id || project.categoryName === category.name);
    if (hasProjects) return jsonError("No se puede eliminar una categoria con proyectos asociados.", 409);
    await deleteCategory(id);
    revalidatePublicCategories(category.slug);
    await writeAuditLog({ userId: auth.sub, email: auth.email, action: "delete", entity: "category", entityId: id, description: category.name });
    return jsonOk({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
