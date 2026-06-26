"use client";

import { AdminPlaceholderPage } from "@/components/admin/AdminPlaceholderPage";

export default function AdminSettingsPage() {
  return <AdminPlaceholderPage title="Configuración" description="Ajustes públicos del sitio mediante /api/admin/settings. Solo el grupo Admin puede modificar configuración sensible." />;
}
