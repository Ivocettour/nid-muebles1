import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

const region = process.env.AWS_REGION ?? process.env.NEXT_PUBLIC_AWS_REGION ?? "us-east-1";

export const s3 = new S3Client({ region });

export const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
export const maxImageSizeBytes = 8 * 1024 * 1024;

export function cloudFrontUrl(key: string) {
  const domain = process.env.CLOUDFRONT_DOMAIN ?? process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN;
  if (!domain) return key;
  return `https://${domain.replace(/^https?:\/\//, "")}/${key}`;
}

export function safeImageExtension(contentType: string) {
  if (contentType === "image/jpeg") return "jpg";
  if (contentType === "image/png") return "png";
  if (contentType === "image/webp") return "webp";
  throw new Error("Tipo de imagen no permitido.");
}

function getUploadsBucketName() {
  return process.env.UPLOADS_BUCKET_NAME ?? "";
}

export async function createPresignedUploadUrl({
  folder,
  contentType,
  size
}: {
  folder: "projects" | "categories" | "site-content" | "contact-requests" | "logos";
  contentType: string;
  size: number;
}) {
  const bucket = getUploadsBucketName();
  if (!bucket) {
    throw new Error("UPLOADS_BUCKET_NAME no está disponible en el runtime de Amplify. Revisá la variable en la rama desplegada y hacé redeploy.");
  }
  if (!allowedImageTypes.includes(contentType)) throw new Error("Tipo de imagen no permitido.");
  if (size > maxImageSizeBytes) throw new Error("La imagen supera el tamaño máximo permitido.");

  const key = `${folder}/${randomUUID()}.${safeImageExtension(contentType)}`;
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
  return {
    bucket,
    key,
    uploadUrl,
    publicUrl: cloudFrontUrl(key),
    expiresIn: 300
  };
}
