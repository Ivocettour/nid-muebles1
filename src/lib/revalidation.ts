import { revalidatePath, revalidateTag } from "next/cache";
import type { Project } from "@/types";

export function revalidateAdminDashboard() {
  revalidateTag("admin-dashboard");
  revalidatePath("/admin");
}

export function revalidatePublicProjects(project?: Pick<Project, "slug" | "categoryId"> | null, previousSlug?: string | null) {
  revalidateTag("projects");
  revalidateTag("admin-dashboard");
  revalidatePath("/");
  revalidatePath("/catalogo");
  revalidatePath("/proyectos");
  revalidatePath("/admin");
  revalidatePath("/admin/proyectos");
  revalidatePath("/sitemap.xml");
  if (project?.slug) revalidatePath(`/catalogo/${project.slug}`);
  if (previousSlug && previousSlug !== project?.slug) revalidatePath(`/catalogo/${previousSlug}`);
  if (project?.categoryId) revalidatePath(`/catalogo/categoria/${project.categoryId}`);
}

export function revalidatePublicCategories(slug?: string) {
  revalidateTag("categories");
  revalidateTag("admin-dashboard");
  revalidatePath("/");
  revalidatePath("/catalogo");
  revalidatePath("/proyectos");
  revalidatePath("/admin");
  revalidatePath("/admin/categorias");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/catalogo/categoria/${slug}`);
}

export function revalidatePublicContent(section?: string) {
  revalidateTag("site-content");
  revalidateTag("admin-dashboard");
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/contenido");
  revalidatePath("/nosotros");
  revalidatePath("/servicios");
  revalidatePath("/contacto");
  if (section) revalidatePath(`/${section}`);
}

export function revalidatePublicSettings() {
  revalidateTag("settings");
  revalidateTag("admin-dashboard");
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/configuracion");
  revalidatePath("/contacto");
  revalidatePath("/sitemap.xml");
}
