import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { z } from "zod";
import { NextRequest } from "next/server";
import { handleApiError, jsonError, jsonOk } from "@/lib/api/response";
import { getS3Client } from "@/lib/aws/s3";
import { verifyCognitoRequest } from "@/lib/auth/cognito";
import { writeAuditLog } from "@/services/server/auditLogRepository";

const schema = z.object({ key: z.string().min(3) });

export async function DELETE(request: NextRequest) {
  try {
    const auth = await verifyCognitoRequest(request);
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return jsonError("Datos inválidos.", 422);
    await getS3Client().send(new DeleteObjectCommand({ Bucket: process.env.UPLOADS_BUCKET_NAME, Key: parsed.data.key }));
    await writeAuditLog({ userId: auth.sub, email: auth.email, action: "delete", entity: "upload", entityId: parsed.data.key });
    return jsonOk({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
