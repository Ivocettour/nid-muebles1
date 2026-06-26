import { z } from "zod";

export const contentSectionSchema = z.object({
  data: z.record(z.unknown())
});

export const settingsSchema = z.object({
  businessName: z.string().min(2),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  socialLinks: z.record(z.string()).optional(),
  siteUrl: z.string().url().optional(),
  defaultWhatsAppText: z.string().optional(),
  projectsPerPage: z.number().int().positive().max(60).optional()
});
