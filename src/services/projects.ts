import { fetchAuthSession } from "aws-amplify/auth";
import type { Project } from "@/types";
import { projects as demoProjects } from "@/data/projects";
import { configureAmplify } from "@/lib/aws/amplify";

async function authHeaders() {
  configureAmplify();
  const token = (await fetchAuthSession()).tokens?.idToken?.toString();
  if (!token) throw new Error("No hay sesión administrativa.");
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

export async function listProjects(): Promise<Project[]> {
  try {
    const response = await fetch("/api/admin/projects", { headers: await authHeaders() });
    if (!response.ok) throw new Error("No se pudieron cargar proyectos.");
    return (await response.json()).projects as Project[];
  } catch {
    return demoProjects;
  }
}

export async function saveProject(project: Project) {
  const payload = {
    ...project,
    materials: project.materials.join(", "),
    finishes: project.finishes.join(", "),
    features: project.features.join(", "),
    images: project.images.join("\n")
  };
  const response = await fetch(project.id.startsWith("new-") ? "/api/admin/projects" : `/api/admin/projects/${project.id}`, {
    method: project.id.startsWith("new-") ? "POST" : "PUT",
    headers: await authHeaders(),
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error("No se pudo guardar el proyecto.");
}

export async function removeProject(projectId: string) {
  const response = await fetch(`/api/admin/projects/${projectId}`, {
    method: "DELETE",
    headers: await authHeaders()
  });
  if (!response.ok) throw new Error("No se pudo eliminar el proyecto.");
}

export async function updateProjectStatus(projectId: string, status: Project["status"]) {
  if (status !== "published") return;
  const response = await fetch(`/api/admin/projects/${projectId}/publish`, {
    method: "POST",
    headers: await authHeaders()
  });
  if (!response.ok) throw new Error("No se pudo publicar el proyecto.");
}
