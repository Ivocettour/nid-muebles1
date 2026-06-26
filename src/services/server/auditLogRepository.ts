import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import { dynamo, tables } from "@/lib/aws/dynamodb";

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
  await dynamo.send(
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
