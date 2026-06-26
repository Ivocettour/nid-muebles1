export type ProjectStatus = "draft" | "published" | "archived";
export type ContactStatus = "new" | "read" | "contacted" | "quoted" | "accepted" | "inProduction" | "completed" | "discarded";
export type PreferredContactMethod = "whatsapp" | "phone" | "email";

export interface Project {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  categoryId: string;
  categoryName: string;
  environment: string;
  materials: string[];
  finishes: string[];
  dimensions?: string;
  location?: string;
  completionDate?: string;
  features: string[];
  mainImage: string;
  images: string[];
  featured: boolean;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  active: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContactRequest {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  city: string;
  environment: string;
  furnitureType: string;
  approximateDimensions?: string;
  estimatedBudget?: string;
  description: string;
  referenceImages: string[];
  preferredContactMethod: PreferredContactMethod;
  status: ContactStatus;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SiteStat {
  label: string;
  value: string;
}
