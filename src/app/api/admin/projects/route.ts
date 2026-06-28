import { randomUUID } from "crypto";
import { NextRequest } from "next/server";
import { handleApiError, jsonError, jsonOk } from "@/lib/api/response";
import { verifyCognitoRequest } from "@/lib/auth/cognito";
import { revalidatePublicProjects } from "@/lib/revalidation";
import { projectSchema } from "@/lib/validations/project";
import { getProjectBySlug, listAllProjects, putProject } from "@/services/server/projectRepository";
import { writeAuditLog } from "@/services/server/auditLogRepository";

export async function GET(request: NextRequest) {
  try {
    await verifyCognitoRequest(request);
    const projects = await listAllProjects();
    return jsonOk({ projects });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyCognitoRequest(request);
    const body = await request.json();
    const parsed = projectSchema.safeParse(body);
    if (!parsed.success) return jsonError("Datos invalidos.", 422);
    const duplicatedSlug = await getProjectBySlug(parsed.data.slug);
    if (duplicatedSlug) return jsonError("Ya existe un proyecto con ese slug.", 409);

    const now = new Date().toISOString();
    const project = {
      id: randomUUID(),
      name: parsed.data.name,
      slug: parsed.data.slug,
      shortDescription: parsed.data.shortDescription,
      description: parsed.data.description,
      categoryId: "cat-custom",
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
      createdAt: now,
      updatedAt: now,
      createdBy: auth.sub,
      updatedBy: auth.sub
    };

    await putProject(project);
    revalidatePublicProjects(project);
    writeAuditLog({ userId: auth.sub, email: auth.email, action: "create", entity: "project", entityId: project.id, description: project.name }).catch((auditError) => {
      console.error(JSON.stringify({ level: "warn", message: "Project audit log failed", detail: auditError instanceof Error ? auditError.message : "unknown" }));
    });

    return jsonOk({ project }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) return jsonError(error.message, 500);
    return handleApiError(error);
  }
}
