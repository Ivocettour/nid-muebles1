import type { ContactRequest, ContactStatus } from "@/types";

export async function createContactRequest(data: Omit<ContactRequest, "id" | "status" | "createdAt" | "updatedAt">) {
  const response = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, privacyAccepted: true, company: "" })
  });
  if (!response.ok) throw new Error("No se pudo enviar la consulta.");
}

export async function updateContactStatus(id: string, status: ContactStatus, internalNotes?: string) {
  const response = await fetch(`/api/admin/contact-requests/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, internalNotes })
  });
  if (!response.ok) throw new Error("No se pudo actualizar la consulta.");
}
