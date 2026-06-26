import { PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import type { Category } from "@/types";
import { categories as demoCategories } from "@/data/categories";
import { dynamo, tables } from "@/lib/aws/dynamodb";

export async function listCategories() {
  try {
    const result = await dynamo.send(new ScanCommand({ TableName: tables.categories }));
    return ((result.Items ?? []) as Category[]).sort((a, b) => a.order - b.order);
  } catch {
    return demoCategories;
  }
}

export async function putCategory(category: Category) {
  await dynamo.send(new PutCommand({ TableName: tables.categories, Item: category }));
}
