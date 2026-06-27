import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { getDynamo, tables } from "@/lib/aws/dynamodb";

export interface SiteSettings {
  id: "public";
  businessName: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  socialLinks?: Record<string, string>;
  siteUrl?: string;
  defaultWhatsAppText?: string;
  projectsPerPage?: number;
  updatedAt: string;
}

export async function getSettings() {
  const result = await getDynamo().send(new GetCommand({ TableName: tables.settings, Key: { id: "public" } }));
  return (result.Item as SiteSettings | undefined) ?? null;
}

export async function putSettings(settings: SiteSettings) {
  await getDynamo().send(new PutCommand({ TableName: tables.settings, Item: settings }));
}
