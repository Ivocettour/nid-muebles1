import { z } from "zod";

export const maxContactReferenceImages = 5;
export const contactAllowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
export const contactMaxImageSizeBytes = 8 * 1024 * 1024;

export const contactReferenceImageSchema = z.object({
  key: z.string().regex(/^contact-requests\/[a-f0-9-]{36}\/[a-f0-9-]+\.(jpg|png|webp)$/i),
  name: z.string().min(1).max(180),
  contentType: z.string().refine((value) => contactAllowedImageTypes.includes(value), "Solo se permiten imagenes JPG, PNG o WEBP."),
  size: z.number().int().positive().max(contactMaxImageSizeBytes, "El archivo supera el tamano maximo.")
});

export const contactSchema = z.object({
  requestId: z.string().uuid().optional(),
  fullName: z.string().min(3, "Ingresa tu nombre completo."),
  phone: z.string().min(8, "Ingresa un telefono valido."),
  email: z.string().email("Ingresa un correo valido."),
  city: z.string().min(2, "Indica tu localidad."),
  environment: z.string().min(2, "Selecciona o indica un ambiente."),
  furnitureType: z.string().min(2, "Indica el tipo de mueble."),
  approximateDimensions: z.string().optional(),
  estimatedBudget: z.string().optional(),
  description: z.string().min(20, "Contanos la idea con un poco mas de detalle."),
  preferredContactMethod: z.enum(["whatsapp", "phone", "email"]),
  referenceImages: z.array(contactReferenceImageSchema).max(maxContactReferenceImages, "Podes adjuntar hasta 5 imagenes.").optional(),
  privacyAccepted: z.boolean().refine((value) => value, "Debes aceptar la politica de privacidad."),
  company: z.string().max(0, "Solicitud invalida.").optional()
});

export const contactPresignedUploadSchema = z.object({
  requestId: z.string().uuid(),
  fileName: z.string().min(1).max(180),
  contentType: z.string().refine((value) => contactAllowedImageTypes.includes(value), "Solo se permiten imagenes JPG, PNG o WEBP."),
  size: z.number().int().positive().max(contactMaxImageSizeBytes, "El archivo supera el tamano maximo.")
});

export type ContactFormValues = z.infer<typeof contactSchema>;
