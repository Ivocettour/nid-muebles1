import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().min(3),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/),
  shortDescription: z.string().min(10),
  description: z.string().min(20),
  categoryName: z.string().min(2),
  environment: z.string().min(2),
  materials: z.string().min(2),
  finishes: z.string().min(2),
  dimensions: z.string().optional(),
  location: z.string().optional(),
  completionDate: z.string().optional(),
  features: z.string().min(2),
  mainImage: z.string().url(),
  images: z.string().optional(),
  featured: z.boolean(),
  status: z.enum(["draft", "published", "archived"])
});

export type ProjectFormValues = z.infer<typeof projectSchema>;
