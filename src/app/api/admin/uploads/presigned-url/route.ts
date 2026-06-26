import { NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/api/rate-limit";
import { handleApiError, jsonError, jsonOk } from "@/lib/api/response";
import { verifyCognitoRequest } from "@/lib/auth/cognito";
import { createPresignedUploadUrl } from "@/lib/aws/s3";
import { presignedUploadSchema } from "@/lib/validations/upload";
import { writeAuditLog } from "@/services/server/auditLogRepository";

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyCognitoRequest(request);
    if (!checkRateLimit(`upload:${auth.sub}`, 60, 60 * 60 * 1000)) return jsonError("Demasiadas solicitudes de subida.", 429);
    const parsed = presignedUploadSchema.safeParse(await request.json());
    if (!parsed.success) return jsonError("Datos inválidos.", 422);
    const upload = await createPresignedUploadUrl(parsed.data);
    await writeAuditLog({ userId: auth.sub, email: auth.email, action: "presign", entity: "upload", entityId: upload.key });
    return jsonOk(upload);
  } catch (error) {
    return handleApiError(error);
  }
}
