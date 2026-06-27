import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { getDynamo, tables } from "@/lib/aws/dynamodb";

export interface SiteContentSection {
  section: string;
  data: Record<string, unknown>;
  updatedAt: string;
  updatedBy?: string;
}

export async function getContentSection(section: string) {
  const result = await getDynamo().send(new GetCommand({ TableName: tables.content, Key: { section } }));
  return (result.Item as SiteContentSection | undefined) ?? null;
}

export async function putContentSection(item: SiteContentSection) {
  await getDynamo().send(new PutCommand({ TableName: tables.content, Item: item }));
}
