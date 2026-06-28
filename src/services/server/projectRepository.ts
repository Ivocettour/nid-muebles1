import "server-only";
import { DeleteCommand, GetCommand, PutCommand, QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import type { Project } from "@/types";
import { projects as demoProjects } from "@/data/projects";
import { getDynamo, tables } from "@/lib/aws/dynamodb";
import { isDemoDataEnabled } from "@/lib/demo-data";
import { normalizeProjectImages } from "@/lib/images";

const bySlugIndex = "bySlug";
const byStatusIndex = "byStatus";

type ProjectRecord = Omit<Project, "featured" | "images" | "mainImage"> & {
  featured: "true" | "false" | boolean;
  images?: unknown;
  mainImage?: unknown;
};

function toProjectRecord(project: Project): ProjectRecord {
  return {
    ...project,
    featured: project.featured ? "true" : "false"
  };
}

function toProject(item: ProjectRecord): Project {
  const images = normalizeProjectImages(item.images, item.mainImage);
  const main = images.find((image) => image.isMain) ?? images[0];
  return {
    ...item,
    featured: item.featured === true || item.featured === "true",
    mainImage: main?.url ?? "",
    images: images.map((image) => image.url)
  };
}

function toProjects(items: unknown[] = []) {
  return (items as ProjectRecord[]).map(toProject);
}

export async function listPublishedProjects() {
  try {
    const result = await getDynamo().send(
      new QueryCommand({
        TableName: tables.projects,
        IndexName: byStatusIndex,
        KeyConditionExpression: "#status = :status",
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: { ":status": "published" },
        ScanIndexForward: false
      })
    );
    return toProjects(result.Items);
  } catch (error) {
    if (isDemoDataEnabled()) return demoProjects.filter((project) => project.status === "published");
    console.error("Unable to load published projects from DynamoDB", error);
    throw error;
  }
}

export async function listAllProjects() {
  try {
    const result = await getDynamo().send(new ScanCommand({ TableName: tables.projects }));
    return toProjects(result.Items);
  } catch (error) {
    if (isDemoDataEnabled()) return demoProjects;
    console.error("Unable to load projects from DynamoDB", error);
    throw error;
  }
}

export async function getProjectBySlug(slug: string) {
  try {
    const result = await getDynamo().send(
      new QueryCommand({
        TableName: tables.projects,
        IndexName: bySlugIndex,
        KeyConditionExpression: "slug = :slug",
        ExpressionAttributeValues: { ":slug": slug },
        Limit: 1
      })
    );
    const item = result.Items?.[0] as ProjectRecord | undefined;
    return item ? toProject(item) : null;
  } catch (error) {
    if (isDemoDataEnabled()) return demoProjects.find((project) => project.slug === slug) ?? null;
    console.error("Unable to load project by slug from DynamoDB", error);
    throw error;
  }
}

export async function getPublishedProjects() {
  return listPublishedProjects();
}

export async function getFeaturedProjects(limit = 6) {
  const projects = await listPublishedProjects();
  const featured = projects.filter((project) => project.featured);
  return (featured.length ? featured : projects).slice(0, limit);
}

export async function getRecentProjects(limit = 6) {
  const projects = await listPublishedProjects();
  return projects.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
}

export async function getProjectsByCategory(categoryId: string, categoryName?: string) {
  const projects = await listPublishedProjects();
  return projects.filter((project) => project.categoryId === categoryId || project.categoryName === categoryId || project.categoryName === categoryName);
}

export async function getRelatedProjects(project: Project, limit = 3) {
  const projects = await listPublishedProjects();
  return projects
    .filter((item) => item.id !== project.id && (item.categoryId === project.categoryId || item.categoryName === project.categoryName))
    .slice(0, limit);
}

export async function getProjectById(id: string) {
  const result = await getDynamo().send(new GetCommand({ TableName: tables.projects, Key: { id } }));
  return result.Item ? toProject(result.Item as ProjectRecord) : null;
}

export async function putProject(project: Project) {
  await getDynamo().send(new PutCommand({ TableName: tables.projects, Item: toProjectRecord(project) }));
}

export async function deleteProject(id: string) {
  await getDynamo().send(new DeleteCommand({ TableName: tables.projects, Key: { id } }));
}
