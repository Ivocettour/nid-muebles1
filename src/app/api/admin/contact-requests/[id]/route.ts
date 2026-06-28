import { z } from "zod";
import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { handleApiError, jsonError, jsonOk } from "@/lib/api/response";
import { canDelete, verifyCognitoRequest } from "@/lib/auth/cognito";
import { getS3Client } from "@/lib/aws/s3";
import { contactStatuses, deleteContactRequest, getContactRequestById, markContactRequestAsRead, updateContactRequest } from "@/services/server/contactRequestRepository";
import { writeAuditLog } from "@/services/server/auditLogRepository";

const patchSchema = z.object({
  status: z.enum(["new", "read", "contacted", "quoted", "accepted", "inProduction", "completed", "discarded"]).optional(),
  internalNotes: z.string().max(5000).optional(),
  readAt: z.string().optional(),
  contactedAt: z.string().optional(),
  note: z.string().max(1000).optional()
});

function revalidateAdminContact(id: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/consultas");
  revalidatePath(`/admin/consultas/${id}`);
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = await verifyCognitoRequest(request, ["Admin", "Editor"]);
    const existing = await getContactRequestById(id);
    if (!existing) return jsonError("Consulta no encontrada.", 404);
    const contactRequest = existing.status === "new" ? await markContactRequestAsRead(id, auth.email ?? auth.sub) : existing;
    if (existing.status === "new") {
      revalidateAdminContact(id);
      writeAuditLog({ userId: auth.sub, email: auth.email, action: "read", entity: "contactRequest", entityId: id }).catch(() => undefined);
    }
    return jsonOk({ contactRequest });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = await verifyCognitoRequest(request, ["Admin", "Editor"]);
    const parsed = patchSchema.safeParse(await request.json());
    if (!parsed.success) return jsonError("Datos invalidos.", 422);
    if (parsed.data.status && !contactStatuses.includes(parsed.data.status)) return jsonError("Estado invalido.", 422);
    const contactRequest = await updateContactRequest({
      id,
      status: parsed.data.status,
      internalNotes: parsed.data.internalNotes,
      readAt: parsed.data.readAt,
      contactedAt: parsed.data.contactedAt,
      changedBy: auth.email ?? auth.sub,
      note: parsed.data.note
    });
    if (!contactRequest) return jsonError("Consulta no encontrada.", 404);
    revalidateAdminContact(id);
    await writeAuditLog({ userId: auth.sub, email: auth.email, action: "update", entity: "contactRequest", entityId: id, description: parsed.data.status ?? "notes" });
    return jsonOk({ contactRequest });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = await verifyCognitoRequest(request, ["Admin"]);
    if (!canDelete(auth.groups)) return jsonError("Acceso denegado.", 403);
    const contactRequest = await getContactRequestById(id);
    if (!contactRequest) return jsonError("Consulta no encontrada.", 404);
    const bucket = process.env.UPLOADS_BUCKET_NAME;
    if (bucket) {
      await Promise.allSettled(
        contactRequest.referenceImages.map((image) => getS3Client().send(new DeleteObjectCommand({ Bucket: bucket, Key: image.key })))
      );
    }
    await deleteContactRequest(id);
    revalidateAdminContact(id);
    await writeAuditLog({ userId: auth.sub, email: auth.email, action: "delete", entity: "contactRequest", entityId: id, description: contactRequest.fullName });
    return jsonOk({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
