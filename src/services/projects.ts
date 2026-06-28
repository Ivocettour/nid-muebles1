import { fetchAuthSession } from "aws-amplify/auth";
import type { Project } from "@/types";
import { configureAmplify } from "@/lib/aws/amplify";

async function authHeaders() {
  configureAmplify();
  const token = (await fetchAuthSession()).tokens?.idToken?.toString();
  if (!token) throw new Error("No hay sesión administrativa.");
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

async function readError(response: Response, fallback: string) {
  const payload = (await response.json().catch(() => null)) as { error?: string } | null;
  return payload?.error ?? fallback;
}

export async function listProjects(): Promise<Project[]> {
  const response = await fetch("/api/admin/projects", { headers: await authHeaders() });
  if (!response.ok) throw new Error(await readError(response, "No se pudieron cargar proyectos."));
  return (await response.json()).projects as Project[];
}

export async function saveProject(project: Project): Promise<Project> {
  const payload = {
    ...project,
    materials: project.materials.join(", "),
    finishes: project.finishes.join(", "),
    features: project.features.join(", "),
    images: project.images.join("\n")
  };

  const isNew = project.id.startsWith("new-");
  const response = await fetch(isNew ? "/api/admin/projects" : `/api/admin/projects/${project.id}`, {
    method: isNew ? "POST" : "PUT",
    headers: await authHeaders(),
    body: JSON.stringify(payload)
  });

  const result = (await response.json().catch(() => null)) as { project?: Project; error?: string } | null;
  if (!response.ok) throw new Error(result?.error ?? "No se pudo guardar el proyecto.");
  if (!result?.project) throw new Error("El servidor no devolvió el proyecto guardado.");
  return result.project;
}

export async function removeProject(projectId: string) {
  const response = await fetch(`/api/admin/projects/${projectId}`, {
    method: "DELETE",
    headers: await authHeaders()
  });
  if (!response.ok) throw new Error(await readError(response, "No se pudo eliminar el proyecto."));
}

export async function updateProjectStatus(projectId: string, status: Project["status"]) {
  if (status !== "published") return;
  const response = await fetch(`/api/admin/projects/${projectId}/publish`, {
    method: "POST",
    headers: await authHeaders()
  });
  if (!response.ok) throw new Error(await readError(response, "No se pudo publicar el proyecto."));
}
