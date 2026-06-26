import { z } from "zod";
import { allowedImageTypes, maxImageSizeBytes } from "@/lib/aws/s3";

export const presignedUploadSchema = z.object({
  folder: z.enum(["projects", "categories", "site-content", "contact-requests", "logos"]),
  contentType: z.string().refine((value) => allowedImageTypes.includes(value), "Tipo de archivo no permitido."),
  size: z.number().int().positive().max(maxImageSizeBytes)
});
