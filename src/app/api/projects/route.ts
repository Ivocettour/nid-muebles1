import { handleApiError, jsonOk } from "@/lib/api/response";
import { listPublishedProjects } from "@/services/server/projectRepository";

export async function GET() {
  try {
    const projects = await listPublishedProjects();
    return jsonOk({ projects });
  } catch (error) {
    return handleApiError(error);
  }
}
