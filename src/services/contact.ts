import { fetchAuthSession } from "aws-amplify/auth";
import type { ContactReferenceImage, ContactRequest, ContactStatus } from "@/types";
import { configureAmplify } from "@/lib/aws/amplify";

export interface ContactRequestListResponse {
  contactRequests: ContactRequest[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  stats: {
    total: number;
    new: number;
    pending: number;
    contacted: number;
    quoted: number;
    accepted: number;
    inProduction: number;
    completed: number;
    latest: ContactRequest[];
  };
}

async function authHeaders() {
  configureAmplify();
  const token = (await fetchAuthSession()).tokens?.idToken?.toString();
  if (!token) throw new Error("No hay sesion administrativa.");
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

async function readError(response: Response, fallback: string) {
  const payload = (await response.json().catch(() => null)) as { error?: string; success?: boolean; errorInfo?: { message?: string } } | null;
  return payload?.error ?? payload?.errorInfo?.message ?? fallback;
}

export async function createContactRequest(data: Omit<ContactRequest, "id" | "status" | "createdAt" | "updatedAt" | "statusHistory"> & { requestId?: string; company?: string; privacyAccepted?: boolean }) {
  const response = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  const result = (await response.json().catch(() => null)) as { success?: boolean; id?: string; error?: { message?: string } } | null;
  if (!response.ok || !result?.success) throw new Error(result?.error?.message ?? "No se pudo enviar la consulta.");
  return result.id;
}

export async function getContactUploadUrl(input: { requestId: string; fileName: string; contentType: string; size: number }) {
  const response = await fetch("/api/contact/uploads/presigned-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
  const result = (await response.json().catch(() => null)) as { uploadUrl?: string; key?: string; error?: { message?: string } } | null;
  if (!response.ok || !result?.uploadUrl || !result.key) throw new Error(result?.error?.message ?? "No pudimos preparar la imagen.");
  return { uploadUrl: result.uploadUrl, key: result.key };
}

export function uploadReferenceImage({
  file,
  requestId,
  onProgress
}: {
  file: File;
  requestId: string;
  onProgress?: (progress: number) => void;
}): Promise<ContactReferenceImage> {
  return new Promise((resolve, reject) => {
    getContactUploadUrl({ requestId, fileName: file.name, contentType: file.type, size: file.size })
      .then(({ uploadUrl, key }) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100));
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve({ key, name: file.name, contentType: file.type, size: file.size });
          } else {
            reject(new Error("No pudimos subir una imagen."));
          }
        };
        xhr.onerror = () => reject(new Error("No pudimos subir una imagen."));
        xhr.send(file);
      })
      .catch(reject);
  });
}

export async function listContactRequests(params: Record<string, string | number | boolean | undefined> = {}): Promise<ContactRequestListResponse> {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== false) search.set(key, String(value));
  });
  const response = await fetch(`/api/admin/contact-requests?${search}`, { headers: await authHeaders() });
  if (!response.ok) throw new Error(await readError(response, "No se pudieron cargar las consultas."));
  return response.json();
}

export async function getContactRequest(id: string): Promise<ContactRequest> {
  const response = await fetch(`/api/admin/contact-requests/${id}`, { headers: await authHeaders() });
  if (!response.ok) throw new Error(await readError(response, "No se pudo cargar la consulta."));
  return (await response.json()).contactRequest as ContactRequest;
}

export async function updateContactRequest(
  id: string,
  data: { status?: ContactStatus; internalNotes?: string; note?: string; readAt?: string; contactedAt?: string }
): Promise<ContactRequest> {
  const response = await fetch(`/api/admin/contact-requests/${id}`, {
    method: "PATCH",
    headers: await authHeaders(),
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error(await readError(response, "No se pudo actualizar la consulta."));
  return (await response.json()).contactRequest as ContactRequest;
}

export async function removeContactRequest(id: string) {
  const response = await fetch(`/api/admin/contact-requests/${id}`, {
    method: "DELETE",
    headers: await authHeaders()
  });
  if (!response.ok) throw new Error(await readError(response, "No se pudo eliminar la consulta."));
}
