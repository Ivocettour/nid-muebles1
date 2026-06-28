"use client";

import { AdminPlaceholderPage } from "@/components/admin/AdminPlaceholderPage";
import { ProjectManager } from "@/components/admin/ProjectManager";

export default function AdminProjectsPage() {
  return (
    <AdminPlaceholderPage title="Proyectos" description="Gestión de proyectos, búsqueda, edición, publicación y eliminación con permisos Cognito.">
      <ProjectManager />
    </AdminPlaceholderPage>
  );
}
