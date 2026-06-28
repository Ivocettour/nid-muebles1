import "server-only";
import { DeleteCommand, GetCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import type { ContactReferenceImage, ContactRequest, ContactRequestHistoryEntry, ContactStatus, PreferredContactMethod } from "@/types";
import { getDynamo, tables } from "@/lib/aws/dynamodb";

export const contactStatuses: ContactStatus[] = ["new", "read", "contacted", "quoted", "accepted", "inProduction", "completed", "discarded"];

export interface ContactRequestListParams {
  page?: number;
  limit?: number;
  status?: ContactStatus | "all";
  search?: string;
  sort?: "newest" | "oldest" | "updated";
  preferredContactMethod?: PreferredContactMethod | "all";
  furnitureType?: string;
}

export interface ContactRequestListResult {
  items: ContactRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function sanitizeString(value: unknown) {
  return typeof value === "string" ? value.replace(/[<>]/g, "").trim() : "";
}

function normalizeReferenceImages(value: unknown): ContactReferenceImage[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item): ContactReferenceImage | null => {
      if (typeof item === "string") return { key: item };
      if (item && typeof item === "object") {
        const image = item as Partial<ContactReferenceImage>;
        if (!image.key) return null;
        return {
          key: image.key,
          name: image.name,
          contentType: image.contentType,
          size: image.size
        };
      }
      return null;
    })
    .filter((item): item is ContactReferenceImage => Boolean(item));
}

function normalizeHistory(value: unknown): ContactRequestHistoryEntry[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item): ContactRequestHistoryEntry | null => {
      if (!item || typeof item !== "object") return null;
      const entry = item as Partial<ContactRequestHistoryEntry>;
      if (!entry.status || !contactStatuses.includes(entry.status) || !entry.changedAt || !entry.changedBy) return null;
      return { status: entry.status, changedAt: entry.changedAt, changedBy: entry.changedBy, note: entry.note };
    })
    .filter((item): item is ContactRequestHistoryEntry => Boolean(item));
}

export function normalizeContactRequest(item: Record<string, unknown>): ContactRequest {
  const now = new Date().toISOString();
  const status = contactStatuses.includes(item.status as ContactStatus) ? (item.status as ContactStatus) : "new";
  const preferredContactMethod = ["whatsapp", "phone", "email"].includes(String(item.preferredContactMethod))
    ? (item.preferredContactMethod as PreferredContactMethod)
    : "whatsapp";

  return {
    id: sanitizeString(item.id),
    fullName: sanitizeString(item.fullName || item.name),
    phone: sanitizeString(item.phone),
    email: sanitizeString(item.email),
    city: sanitizeString(item.city),
    environment: sanitizeString(item.environment),
    furnitureType: sanitizeString(item.furnitureType),
    approximateDimensions: sanitizeString(item.approximateDimensions) || undefined,
    estimatedBudget: sanitizeString(item.estimatedBudget) || undefined,
    description: sanitizeString(item.description),
    referenceImages: normalizeReferenceImages(item.referenceImages),
    preferredContactMethod,
    status,
    internalNotes: sanitizeString(item.internalNotes) || undefined,
    readAt: sanitizeString(item.readAt) || undefined,
    contactedAt: sanitizeString(item.contactedAt) || undefined,
    createdAt: sanitizeString(item.createdAt) || now,
    updatedAt: sanitizeString(item.updatedAt) || sanitizeString(item.createdAt) || now,
    statusHistory: normalizeHistory(item.statusHistory)
  };
}

function matchesSearch(item: ContactRequest, search?: string) {
  if (!search) return true;
  const q = search.trim().toLowerCase();
  if (!q) return true;
  return [item.fullName, item.email, item.phone, item.city, item.furnitureType].join(" ").toLowerCase().includes(q);
}

function sortItems(items: ContactRequest[], sort: ContactRequestListParams["sort"] = "newest") {
  return [...items].sort((a, b) => {
    if (sort === "oldest") return a.createdAt.localeCompare(b.createdAt);
    if (sort === "updated") return b.updatedAt.localeCompare(a.updatedAt);
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export async function createContactRequestItem(item: ContactRequest) {
  await getDynamo().send(new PutCommand({ TableName: tables.contacts, Item: item }));
}

export async function getContactRequests(params: ContactRequestListParams = {}): Promise<ContactRequestListResult> {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(100, Math.max(1, params.limit ?? 20));
  const result = await getDynamo().send(new ScanCommand({ TableName: tables.contacts }));
  const all = ((result.Items ?? []) as Record<string, unknown>[]).map(normalizeContactRequest);
  const filtered = all
    .filter((item) => !params.status || params.status === "all" || item.status === params.status)
    .filter((item) => !params.preferredContactMethod || params.preferredContactMethod === "all" || item.preferredContactMethod === params.preferredContactMethod)
    .filter((item) => !params.furnitureType || item.furnitureType.toLowerCase().includes(params.furnitureType.toLowerCase()))
    .filter((item) => matchesSearch(item, params.search));
  const sorted = sortItems(filtered, params.sort);
  const start = (page - 1) * limit;
  return {
    items: sorted.slice(start, start + limit),
    total: sorted.length,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(sorted.length / limit))
  };
}

export async function listContactRequests() {
  return (await getContactRequests({ limit: 100 })).items;
}

export async function getContactRequestById(id: string) {
  const result = await getDynamo().send(new GetCommand({ TableName: tables.contacts, Key: { id } }));
  return result.Item ? normalizeContactRequest(result.Item as Record<string, unknown>) : null;
}

export async function saveContactRequest(item: ContactRequest) {
  await getDynamo().send(new PutCommand({ TableName: tables.contacts, Item: item }));
  return item;
}

export async function updateContactRequest(input: {
  id: string;
  status?: ContactStatus;
  internalNotes?: string;
  readAt?: string;
  contactedAt?: string;
  changedBy: string;
  note?: string;
}) {
  const existing = await getContactRequestById(input.id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const statusChanged = input.status && input.status !== existing.status;
  const nextStatus = input.status ?? existing.status;
  const history = [...(existing.statusHistory ?? [])];
  if (statusChanged) {
    history.push({
      status: nextStatus,
      changedAt: now,
      changedBy: input.changedBy,
      note: input.note || input.internalNotes
    });
  }

  const updated: ContactRequest = {
    ...existing,
    status: nextStatus,
    internalNotes: input.internalNotes ?? existing.internalNotes,
    readAt: input.readAt ?? (nextStatus === "read" && !existing.readAt ? now : existing.readAt),
    contactedAt: input.contactedAt ?? (nextStatus === "contacted" && !existing.contactedAt ? now : existing.contactedAt),
    updatedAt: now,
    statusHistory: history
  };

  return saveContactRequest(updated);
}

export async function markContactRequestAsRead(id: string, changedBy: string) {
  const existing = await getContactRequestById(id);
  if (!existing) return null;
  if (existing.status !== "new") return existing;
  return updateContactRequest({ id, status: "read", readAt: new Date().toISOString(), changedBy, note: "Marcada como leida al abrir el detalle." });
}

export async function deleteContactRequest(id: string) {
  await getDynamo().send(new DeleteCommand({ TableName: tables.contacts, Key: { id } }));
}

export async function getContactRequestStats() {
  const { items } = await getContactRequests({ limit: 100 });
  const pendingStatuses: ContactStatus[] = ["new", "read", "contacted", "quoted"];
  return {
    total: items.length,
    new: items.filter((item) => item.status === "new").length,
    pending: items.filter((item) => pendingStatuses.includes(item.status)).length,
    contacted: items.filter((item) => item.status === "contacted").length,
    quoted: items.filter((item) => item.status === "quoted").length,
    accepted: items.filter((item) => item.status === "accepted").length,
    inProduction: items.filter((item) => item.status === "inProduction").length,
    completed: items.filter((item) => item.status === "completed").length,
    latest: sortItems(items, "newest").slice(0, 5)
  };
}
