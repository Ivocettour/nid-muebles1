import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { checkRateLimit } from "@/lib/api/rate-limit";
import { getS3Client } from "@/lib/aws/s3";
import { contactSchema } from "@/lib/validations/contact";
import { createContactRequestItem, getContactRequestById } from "@/services/server/contactRequestRepository";
import { writeAuditLog } from "@/services/server/auditLogRepository";

function sanitize(value: string) {
  return value.replace(/[<>]/g, "").trim();
}

function contactError(status = 500) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "CONTACT_REQUEST_CREATE_FAILED",
        message: "No pudimos enviar tu consulta. Intenta nuevamente."
      }
    },
    { status }
  );
}

async function cleanupUploadedImages(keys: string[]) {
  const bucket = process.env.UPLOADS_BUCKET_NAME;
  if (!bucket || !keys.length) return;
  await Promise.allSettled(keys.map((key) => getS3Client().send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))));
}

export async function POST(request: NextRequest) {
  let uploadedKeys: string[] = [];

  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
    if (!checkRateLimit(`contact:${ip}`, 5, 60 * 60 * 1000)) return contactError(429);

    const body = await request.json();
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) return contactError(422);
    if (parsed.data.company) return NextResponse.json({ success: true, id: "" }, { status: 201 });

    const id = parsed.data.requestId ?? randomUUID();
    const referenceImages = parsed.data.referenceImages ?? [];
    uploadedKeys = referenceImages.map((image) => image.key);
    if (await getContactRequestById(id)) return contactError(409);

    const now = new Date().toISOString();
    await createContactRequestItem({
      id,
      fullName: sanitize(parsed.data.fullName),
      phone: sanitize(parsed.data.phone),
      email: sanitize(parsed.data.email),
      city: sanitize(parsed.data.city),
      environment: sanitize(parsed.data.environment),
      furnitureType: sanitize(parsed.data.furnitureType),
      approximateDimensions: parsed.data.approximateDimensions ? sanitize(parsed.data.approximateDimensions) : undefined,
      estimatedBudget: parsed.data.estimatedBudget ? sanitize(parsed.data.estimatedBudget) : undefined,
      description: sanitize(parsed.data.description),
      referenceImages: referenceImages.map((image) => ({
        key: image.key,
        name: sanitize(image.name),
        contentType: image.contentType,
        size: image.size
      })),
      preferredContactMethod: parsed.data.preferredContactMethod,
      status: "new",
      createdAt: now,
      updatedAt: now,
      statusHistory: [{ status: "new", changedAt: now, changedBy: "public-form", note: "Consulta creada desde la web publica." }]
    });

    revalidatePath("/admin");
    revalidatePath("/admin/consultas");
    revalidateTag("admin-dashboard");
    writeAuditLog({ userId: "public", action: "create", entity: "contactRequest", entityId: id }).catch(() => undefined);
    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (error) {
    console.error(JSON.stringify({ level: "error", message: "Contact request create failed", detail: error instanceof Error ? error.message : "unknown" }));
    await cleanupUploadedImages(uploadedKeys);
    return contactError(500);
  }
}
