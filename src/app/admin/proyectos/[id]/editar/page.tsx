"use client";

import { AdminPlaceholderPage } from "@/components/admin/AdminPlaceholderPage";

export default function EditProjectPage() {
  return <AdminPlaceholderPage title="Editar proyecto" description="Edición de proyectos mediante PUT /api/admin/projects/[id], con autorización de Admin o Editor desde Cognito." />;
}
