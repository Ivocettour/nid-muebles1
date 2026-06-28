import { revalidatePath, revalidateTag } from "next/cache";
import type { Project } from "@/types";

export function revalidatePublicProjects(project?: Pick<Project, "slug" | "categoryId"> | null, previousSlug?: string | null) {
  revalidateTag("projects");
  revalidatePath("/");
  revalidatePath("/catalogo");
  revalidatePath("/proyectos");
  revalidatePath("/sitemap.xml");
  if (project?.slug) revalidatePath(`/catalogo/${project.slug}`);
  if (previousSlug && previousSlug !== project?.slug) revalidatePath(`/catalogo/${previousSlug}`);
  if (project?.categoryId) revalidatePath(`/catalogo/categoria/${project.categoryId}`);
}

export function revalidatePublicCategories(slug?: string) {
  revalidateTag("categories");
  revalidatePath("/");
  revalidatePath("/catalogo");
  revalidatePath("/proyectos");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/catalogo/categoria/${slug}`);
}

export function revalidatePublicContent(section?: string) {
  revalidateTag("site-content");
  revalidatePath("/");
  revalidatePath("/nosotros");
  revalidatePath("/servicios");
  revalidatePath("/contacto");
  if (section) revalidatePath(`/${section}`);
}

export function revalidatePublicSettings() {
  revalidateTag("settings");
  revalidatePath("/");
  revalidatePath("/contacto");
  revalidatePath("/sitemap.xml");
}
