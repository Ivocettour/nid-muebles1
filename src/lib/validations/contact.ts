import { z } from "zod";

export const contactSchema = z.object({
  fullName: z.string().min(3, "Ingresá tu nombre completo."),
  phone: z.string().min(8, "Ingresá un teléfono válido."),
  email: z.string().email("Ingresá un correo válido."),
  city: z.string().min(2, "Indicá tu localidad."),
  environment: z.string().min(2, "Seleccioná o indicá un ambiente."),
  furnitureType: z.string().min(2, "Indicá el tipo de mueble."),
  approximateDimensions: z.string().optional(),
  estimatedBudget: z.string().optional(),
  description: z.string().min(20, "Contanos la idea con un poco más de detalle."),
  preferredContactMethod: z.enum(["whatsapp", "phone", "email"]),
  privacyAccepted: z.boolean().refine((value) => value, "Debés aceptar la política de privacidad."),
  company: z.string().max(0, "Solicitud inválida.").optional()
});

export type ContactFormValues = z.infer<typeof contactSchema>;
