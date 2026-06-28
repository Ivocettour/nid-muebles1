import { fetchAuthSession } from "aws-amplify/auth";
import type { ContactRequest, ProjectStatus } from "@/types";
import { configureAmplify } from "@/lib/aws/amplify";

interface DashboardActivity {
  id: string;
  userId: string;
  email?: string;
  action: string;
  entity: string;
  entityId?: string;
  description?: string;
  createdAt: string;
}

export interface AdminDashboardData {
  projects: {
    total: number;
    published: number;
    draft: number;
    archived: number;
    featured: number;
  };
  categories: {
    total: number;
    active: number;
  };
  contactRequests: {
    total: number;
    new: number;
    pending: number;
    contacted: number;
    quoted: number;
    accepted: number;
    inProduction: number;
    completed: number;
  };
  recentProjects: Array<{
    id: string;
    name: string;
    categoryName: string;
    status: ProjectStatus;
    featured: boolean;
    updatedAt: string;
  }>;
  pendingContactRequests: ContactRequest[];
  recentContactRequests: ContactRequest[];
  recentActivity: DashboardActivity[];
}

async function authHeaders() {
  configureAmplify();
  const token = (await fetchAuthSession()).tokens?.idToken?.toString();
  if (!token) throw new Error("No hay sesion administrativa.");
  return { Authorization: `Bearer ${token}` };
}

export async function getAdminDashboard(): Promise<AdminDashboardData> {
  const response = await fetch("/api/admin/dashboard", { headers: await authHeaders() });
  const result = (await response.json().catch(() => null)) as { success?: boolean; data?: AdminDashboardData; error?: string } | null;
  if (!response.ok || !result?.data) throw new Error(result?.error ?? "No pudimos cargar las estadisticas.");
  return result.data;
}
