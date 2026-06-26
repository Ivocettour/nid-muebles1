import type { MetadataRoute } from "next";
import { projects } from "@/data/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const routes = ["", "/catalogo", "/proyectos", "/servicios", "/nosotros", "/contacto"];
  return [
    ...routes.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date()
    })),
    ...projects.map((project) => ({
      url: `${baseUrl}/catalogo/${project.slug}`,
      lastModified: new Date(project.updatedAt)
    }))
  ];
}
