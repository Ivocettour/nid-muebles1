import { handleApiError, jsonError, jsonOk } from "@/lib/api/response";
import { getContentSection } from "@/services/server/contentRepository";

export async function GET(_request: Request, { params }: { params: Promise<{ section: string }> }) {
  try {
    const { section } = await params;
    const content = await getContentSection(section);
    if (!content) return jsonError("Contenido no encontrado.", 404);
    return jsonOk({ content });
  } catch (error) {
    return handleApiError(error);
  }
}
