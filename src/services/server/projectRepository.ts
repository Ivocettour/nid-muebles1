import { DeleteCommand, GetCommand, PutCommand, QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import type { Project } from "@/types";
import { projects as demoProjects } from "@/data/projects";
import { getDynamo, tables } from "@/lib/aws/dynamodb";

const bySlugIndex = "bySlug";
const byStatusIndex = "byStatus";

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
    return (result.Items ?? []) as Project[];
  } catch {
    return demoProjects.filter((project) => project.status === "published");
  }
}

export async function listAllProjects() {
  try {
    const result = await getDynamo().send(new ScanCommand({ TableName: tables.projects }));
    return (result.Items ?? []) as Project[];
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
    return (result.Items?.[0] as Project | undefined) ?? null;
  } catch {
    return demoProjects.find((project) => project.slug === slug) ?? null;
  }
}

export async function getProjectById(id: string) {
  const result = await getDynamo().send(new GetCommand({ TableName: tables.projects, Key: { id } }));
  return (result.Item as Project | undefined) ?? null;
}

export async function putProject(project: Project) {
  await getDynamo().send(new PutCommand({ TableName: tables.projects, Item: project }));
}

export async function deleteProject(id: string) {
  await getDynamo().send(new DeleteCommand({ TableName: tables.projects, Key: { id } }));
}
