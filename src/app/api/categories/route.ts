import { handleApiError, jsonOk } from "@/lib/api/response";
import { listCategories } from "@/services/server/categoryRepository";

export async function GET() {
  try {
    const categories = await listCategories();
    return jsonOk({ categories: categories.filter((category) => category.active) });
  } catch (error) {
    return handleApiError(error);
  }
}
