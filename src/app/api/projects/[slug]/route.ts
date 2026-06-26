import { handleApiError, jsonError, jsonOk } from "@/lib/api/response";
import { getProjectBySlug } from "@/services/server/projectRepository";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const project = await getProjectBySlug(slug);
    if (!project || project.status !== "published") return jsonError("Proyecto no encontrado.", 404);
    return jsonOk({ project });
  } catch (error) {
    return handleApiError(error);
  }
}
