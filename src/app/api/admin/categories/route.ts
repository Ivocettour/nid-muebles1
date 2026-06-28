import { randomUUID } from "crypto";
import { NextRequest } from "next/server";
import { handleApiError, jsonError, jsonOk } from "@/lib/api/response";
import { verifyCognitoRequest } from "@/lib/auth/cognito";
import { revalidatePublicCategories } from "@/lib/revalidation";
import { categorySchema } from "@/lib/validations/category";
import { getAnyCategoryBySlug, listCategories, putCategory } from "@/services/server/categoryRepository";
import { writeAuditLog } from "@/services/server/auditLogRepository";

export async function GET(request: NextRequest) {
  try {
    await verifyCognitoRequest(request);
    const categories = await listCategories();
    return jsonOk({ categories });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyCognitoRequest(request);
    const parsed = categorySchema.safeParse(await request.json());
    if (!parsed.success) return jsonError("Datos invalidos.", 422);
    const duplicated = await getAnyCategoryBySlug(parsed.data.slug);
    if (duplicated) return jsonError("Ya existe una categoria con ese slug.", 409);
    const now = new Date().toISOString();
    const category = { id: randomUUID(), ...parsed.data, createdAt: now, updatedAt: now };
    await putCategory(category);
    revalidatePublicCategories(category.slug);
    await writeAuditLog({ userId: auth.sub, email: auth.email, action: "create", entity: "category", entityId: category.id, description: category.name });
    return jsonOk({ category }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
