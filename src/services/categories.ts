import { fetchAuthSession } from "aws-amplify/auth";
import type { Category } from "@/types";
import { configureAmplify } from "@/lib/aws/amplify";

async function authHeaders() {
  configureAmplify();
  const token = (await fetchAuthSession()).tokens?.idToken?.toString();
  if (!token) throw new Error("No hay sesion administrativa.");
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

async function readError(response: Response, fallback: string) {
  const payload = (await response.json().catch(() => null)) as { error?: string } | null;
  return payload?.error ?? fallback;
}

export async function listCategories(): Promise<Category[]> {
  const response = await fetch("/api/admin/categories", { headers: await authHeaders() });
  if (!response.ok) throw new Error(await readError(response, "No se pudieron cargar categorias."));
  return (await response.json()).categories as Category[];
}

export async function saveCategory(category: Category): Promise<Category> {
  const isNew = category.id.startsWith("new-");
  const response = await fetch(isNew ? "/api/admin/categories" : `/api/admin/categories/${category.id}`, {
    method: isNew ? "POST" : "PUT",
    headers: await authHeaders(),
    body: JSON.stringify(category)
  });
  const result = (await response.json().catch(() => null)) as { category?: Category; error?: string } | null;
  if (!response.ok) throw new Error(result?.error ?? "No se pudo guardar la categoria.");
  if (!result?.category) throw new Error("El servidor no devolvio la categoria guardada.");
  return result.category;
}

export async function removeCategory(id: string) {
  const response = await fetch(`/api/admin/categories/${id}`, {
    method: "DELETE",
    headers: await authHeaders()
  });
  if (!response.ok) throw new Error(await readError(response, "No se pudo eliminar la categoria."));
}
