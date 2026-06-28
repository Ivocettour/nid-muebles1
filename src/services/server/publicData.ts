import "server-only";
import { unstable_cache } from "next/cache";
import {
  getFeaturedProjects,
  getProjectBySlug,
  getProjectsByCategory,
  getPublishedProjects,
  getRecentProjects,
  getRelatedProjects
} from "@/services/server/projectRepository";
import { getActiveCategories, getCategoryBySlug } from "@/services/server/categoryRepository";
import { getSiteContent } from "@/services/server/contentRepository";
import { getSiteSettings } from "@/services/server/settingsRepository";

export const getCachedPublishedProjects = unstable_cache(getPublishedProjects, ["published-projects"], { tags: ["projects"] });
export const getCachedFeaturedProjects = unstable_cache(() => getFeaturedProjects(6), ["featured-projects"], { tags: ["projects"] });
export const getCachedRecentProjects = unstable_cache(() => getRecentProjects(6), ["recent-projects"], { tags: ["projects"] });
export const getCachedActiveCategories = unstable_cache(getActiveCategories, ["active-categories"], { tags: ["categories"] });
export const getCachedSiteSettings = unstable_cache(getSiteSettings, ["site-settings"], { tags: ["settings"] });

export function getCachedProjectBySlug(slug: string) {
  return unstable_cache(() => getProjectBySlug(slug), ["project", slug], { tags: ["projects"] })();
}

export function getCachedRelatedProjects(slug: string) {
  return unstable_cache(async () => {
    const project = await getProjectBySlug(slug);
    if (!project || project.status !== "published") return [];
    return getRelatedProjects(project);
  }, ["related-projects", slug], { tags: ["projects"] })();
}

export function getCachedProjectsByCategory(categoryId: string, categoryName?: string) {
  return unstable_cache(() => getProjectsByCategory(categoryId, categoryName), ["projects-by-category", categoryId, categoryName ?? ""], { tags: ["projects", "categories"] })();
}

export function getCachedCategoryBySlug(slug: string) {
  return unstable_cache(() => getCategoryBySlug(slug), ["category", slug], { tags: ["categories"] })();
}

export function getCachedSiteContent(section: string) {
  return unstable_cache(() => getSiteContent(section), ["site-content", section], { tags: ["site-content"] })();
}
