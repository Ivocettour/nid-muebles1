import "server-only";
import { DeleteCommand, GetCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import type { Category } from "@/types";
import { categories as demoCategories } from "@/data/categories";
import { getDynamo, tables } from "@/lib/aws/dynamodb";
import { isDemoDataEnabled } from "@/lib/demo-data";

export async function listCategories() {
  try {
    const result = await getDynamo().send(new ScanCommand({ TableName: tables.categories }));
    return ((result.Items ?? []) as Category[]).sort((a, b) => a.order - b.order);
  } catch (error) {
    if (isDemoDataEnabled()) return demoCategories;
    console.error("Unable to load categories from DynamoDB", error);
    throw error;
  }
}

export async function getActiveCategories() {
  const categories = await listCategories();
  return categories.filter((category) => category.active).sort((a, b) => a.order - b.order);
}

export async function getCategoryBySlug(slug: string) {
  const categories = await getActiveCategories();
  return categories.find((category) => category.slug === slug) ?? null;
}

export async function getAnyCategoryBySlug(slug: string) {
  const categories = await listCategories();
  return categories.find((category) => category.slug === slug) ?? null;
}

export async function getCategoryById(id: string) {
  const result = await getDynamo().send(new GetCommand({ TableName: tables.categories, Key: { id } }));
  return (result.Item as Category | undefined) ?? null;
}

export async function putCategory(category: Category) {
  await getDynamo().send(new PutCommand({ TableName: tables.categories, Item: category }));
}

export async function deleteCategory(id: string) {
  await getDynamo().send(new DeleteCommand({ TableName: tables.categories, Key: { id } }));
}
