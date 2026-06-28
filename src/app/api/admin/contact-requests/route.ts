import { NextRequest } from "next/server";
import { handleApiError, jsonOk } from "@/lib/api/response";
import { verifyCognitoRequest } from "@/lib/auth/cognito";
import { contactStatuses, getContactRequests, getContactRequestStats } from "@/services/server/contactRequestRepository";
import type { ContactStatus, PreferredContactMethod } from "@/types";

function parseStatus(value: string | null): ContactStatus | "all" | undefined {
  if (!value || value === "all") return value === "all" ? "all" : undefined;
  return contactStatuses.includes(value as ContactStatus) ? (value as ContactStatus) : undefined;
}

function parseMethod(value: string | null): PreferredContactMethod | "all" | undefined {
  if (!value || value === "all") return value === "all" ? "all" : undefined;
  return ["whatsapp", "phone", "email"].includes(value) ? (value as PreferredContactMethod) : undefined;
}

export async function GET(request: NextRequest) {
  try {
    await verifyCognitoRequest(request, ["Admin", "Editor"]);
    const { searchParams } = request.nextUrl;
    const result = await getContactRequests({
      page: Number(searchParams.get("page") ?? 1),
      limit: Number(searchParams.get("limit") ?? 20),
      status: parseStatus(searchParams.get("status")),
      preferredContactMethod: parseMethod(searchParams.get("preferredContactMethod")),
      search: searchParams.get("search") ?? undefined,
      sort: (searchParams.get("sort") as "newest" | "oldest" | "updated" | null) ?? "newest",
      furnitureType: searchParams.get("furnitureType") ?? undefined
    });
    const stats = await getContactRequestStats();
    return jsonOk({ contactRequests: result.items, pagination: { total: result.total, page: result.page, limit: result.limit, totalPages: result.totalPages }, stats });
  } catch (error) {
    return handleApiError(error);
  }
}
