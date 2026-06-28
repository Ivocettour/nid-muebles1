import "server-only";
import { PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import { getDynamo, tables } from "@/lib/aws/dynamodb";

export async function writeAuditLog(input: {
  userId: string;
  email?: string;
  action: string;
  entity: string;
  entityId?: string;
  description?: string;
  ip?: string;
  userAgent?: string;
}) {
  await getDynamo().send(
    new PutCommand({
      TableName: tables.auditLogs,
      Item: {
        id: randomUUID(),
        ...input,
        createdAt: new Date().toISOString()
      }
    })
  );
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  email?: string;
  action: string;
  entity: string;
  entityId?: string;
  description?: string;
  createdAt: string;
}

export async function listRecentAuditLogs(limit = 10) {
  const result = await getDynamo().send(new ScanCommand({ TableName: tables.auditLogs }));
  return ((result.Items ?? []) as AuditLogEntry[])
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}
