import { PutCommand, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import type { ContactRequest, ContactStatus } from "@/types";
import { getDynamo, tables } from "@/lib/aws/dynamodb";

export async function createContactRequestItem(item: ContactRequest) {
  await getDynamo().send(new PutCommand({ TableName: tables.contacts, Item: item }));
}

export async function listContactRequests() {
  const result = await getDynamo().send(new ScanCommand({ TableName: tables.contacts }));
  return ((result.Items ?? []) as ContactRequest[]).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function updateContactRequest(id: string, status: ContactStatus, internalNotes?: string) {
  await getDynamo().send(
    new UpdateCommand({
      TableName: tables.contacts,
      Key: { id },
      UpdateExpression: "set #status = :status, internalNotes = :notes, updatedAt = :updatedAt",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: {
        ":status": status,
        ":notes": internalNotes ?? "",
        ":updatedAt": new Date().toISOString()
      }
    })
  );
}
