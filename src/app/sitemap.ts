import type { MetadataRoute } from "next";
import { getRuntimeCredentials } from "@/lib/aws/credentials";
import { getCachedActiveCategories, getCachedPublishedProjects } from "@/services/server/publicData";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const routes = ["", "/catalogo", "/proyectos", "/servicios", "/nosotros", "/contacto"];
  const baseRoutes = routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date()
  }));

  if (!getRuntimeCredentials()) return baseRoutes;

  const [projects, categories] = await Promise.all([
    getCachedPublishedProjects().catch(() => []),
    getCachedActiveCategories().catch(() => [])
  ]);

  return [
    ...baseRoutes,
    ...categories.map((category) => ({
      url: `${baseUrl}/catalogo/categoria/${category.slug}`,
      lastModified: new Date()
    })),
    ...projects.map((project) => ({
      url: `${baseUrl}/catalogo/${project.slug}`,
      lastModified: new Date(project.updatedAt)
    }))
  ];
}
