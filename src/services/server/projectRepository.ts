import { DeleteCommand, GetCommand, PutCommand, QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import type { Project } from "@/types";
import { projects as demoProjects } from "@/data/projects";
import { getDynamo, tables } from "@/lib/aws/dynamodb";

const bySlugIndex = "bySlug";
const byStatusIndex = "byStatus";

type ProjectRecord = Omit<Project, "featured"> & {
  featured: "true" | "false" | boolean;
};

function toProjectRecord(project: Project): ProjectRecord {
  return {
    ...project,
    featured: project.featured ? "true" : "false"
  };
}

function toProject(item: ProjectRecord): Project {
  return {
    ...item,
    featured: item.featured === true || item.featured === "true"
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
  } catch {
    return demoProjects.filter((project) => project.status === "published");
  }
}

export async function listAllProjects() {
  try {
    const result = await getDynamo().send(new ScanCommand({ TableName: tables.projects }));
    return toProjects(result.Items);
  } catch {
    return demoProjects;
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
  } catch {
    return demoProjects.find((project) => project.slug === slug) ?? null;
  }
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
