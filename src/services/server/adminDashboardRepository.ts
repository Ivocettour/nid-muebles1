import "server-only";
import { listRecentAuditLogs } from "@/services/server/auditLogRepository";
import { listCategories } from "@/services/server/categoryRepository";
import { getContactRequests, getContactRequestStats } from "@/services/server/contactRequestRepository";
import { listAllProjects } from "@/services/server/projectRepository";
import type { ContactRequest, Project } from "@/types";

const pendingStatuses = ["new", "read", "contacted", "quoted"];

function recentProjects(projects: Project[]) {
  return [...projects]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 5)
    .map((project) => ({
      id: project.id,
      name: project.name,
      categoryName: project.categoryName,
      status: project.status,
      featured: project.featured,
      updatedAt: project.updatedAt
    }));
}

function pendingContactRequests(items: ContactRequest[]) {
  return items.filter((item) => pendingStatuses.includes(item.status)).slice(0, 5);
}

export async function getAdminDashboardData() {
  const [projects, categories, contactStats, contactList, recentActivity] = await Promise.all([
    listAllProjects(),
    listCategories(),
    getContactRequestStats(),
    getContactRequests({ limit: 100 }),
    listRecentAuditLogs(10).catch(() => [])
  ]);

  return {
    projects: {
      total: projects.length,
      published: projects.filter((project) => project.status === "published").length,
      draft: projects.filter((project) => project.status === "draft").length,
      archived: projects.filter((project) => project.status === "archived").length,
      featured: projects.filter((project) => project.status === "published" && project.featured).length
    },
    categories: {
      total: categories.length,
      active: categories.filter((category) => category.active).length
    },
    contactRequests: {
      total: contactStats.total,
      new: contactStats.new,
      pending: contactStats.pending,
      contacted: contactStats.contacted,
      quoted: contactStats.quoted,
      accepted: contactStats.accepted,
      inProduction: contactStats.inProduction,
      completed: contactStats.completed
    },
    recentProjects: recentProjects(projects),
    pendingContactRequests: pendingContactRequests(contactList.items),
    recentContactRequests: contactList.items.slice(0, 5),
    recentActivity
  };
}
