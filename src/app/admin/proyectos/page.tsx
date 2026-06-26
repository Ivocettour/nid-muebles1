"use client";

import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminPlaceholderPage } from "@/components/admin/AdminPlaceholderPage";

export default function AdminProjectsPage() {
  return (
    <AdminPlaceholderPage title="Proyectos" description="Gestión de proyectos, búsqueda, edición, publicación y eliminación con permisos Cognito.">
      <AdminDashboard />
    </AdminPlaceholderPage>
  );
}
