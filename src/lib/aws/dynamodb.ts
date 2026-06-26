import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const region = process.env.AWS_REGION ?? process.env.NEXT_PUBLIC_AWS_REGION ?? "us-east-1";

const client = new DynamoDBClient({ region });

export const dynamo = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true
  }
});

export const tables = {
  projects: process.env.PROJECTS_TABLE_NAME ?? "nid-development-projects",
  categories: process.env.CATEGORIES_TABLE_NAME ?? "nid-development-categories",
  content: process.env.SITE_CONTENT_TABLE_NAME ?? "nid-development-site-content",
  contacts: process.env.CONTACT_REQUESTS_TABLE_NAME ?? "nid-development-contact-requests",
  settings: process.env.SITE_SETTINGS_TABLE_NAME ?? "nid-development-site-settings",
  auditLogs: process.env.AUDIT_LOGS_TABLE_NAME ?? "nid-development-audit-logs"
};
