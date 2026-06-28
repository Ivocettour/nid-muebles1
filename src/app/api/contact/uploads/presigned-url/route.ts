import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/api/rate-limit";
import { createContactRequestPresignedUploadUrl } from "@/lib/aws/s3";
import { contactPresignedUploadSchema } from "@/lib/validations/contact";

function uploadError(message = "No pudimos preparar la subida de la imagen.", status = 400) {
  return NextResponse.json({ success: false, error: { code: "CONTACT_UPLOAD_URL_FAILED", message } }, { status });
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
    if (!checkRateLimit(`contact-upload:${ip}`, 30, 60 * 60 * 1000)) return uploadError("Demasiados intentos. Proba nuevamente mas tarde.", 429);

    const parsed = contactPresignedUploadSchema.safeParse(await request.json());
    if (!parsed.success) return uploadError("Revisa el archivo seleccionado.", 422);

    const upload = await createContactRequestPresignedUploadUrl(parsed.data);
    return NextResponse.json({ uploadUrl: upload.uploadUrl, key: upload.key });
  } catch (error) {
    console.error(JSON.stringify({ level: "error", message: "Contact upload presigned URL failed", detail: error instanceof Error ? error.message : "unknown" }));
    return uploadError("No pudimos preparar la subida de la imagen.", 500);
  }
}
