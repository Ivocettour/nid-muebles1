import { handleApiError, jsonError, jsonOk } from "@/lib/api/response";
import { getCategoryBySlug } from "@/services/server/categoryRepository";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const category = await getCategoryBySlug(slug);
    if (!category || !category.active) return jsonError("Categoria no encontrada.", 404);
    return jsonOk({ category });
  } catch (error) {
    return handleApiError(error);
  }
}
