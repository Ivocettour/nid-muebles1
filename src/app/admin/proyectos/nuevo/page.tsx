"use client";

import { AdminPlaceholderPage } from "@/components/admin/AdminPlaceholderPage";

export default function NewProjectPage() {
  return <AdminPlaceholderPage title="Nuevo proyecto" description="Alta de proyectos conectada al endpoint POST /api/admin/projects y preparada para subir imágenes a S3 mediante URLs prefirmadas." />;
}
