"use client";

import { AdminPlaceholderPage } from "@/components/admin/AdminPlaceholderPage";
import { ContactRequestManager } from "@/components/admin/ContactRequestManager";

export default function AdminContactRequestsPage() {
  return (
    <AdminPlaceholderPage title="Consultas" description="Administracion de consultas">
      <ContactRequestManager />
    </AdminPlaceholderPage>
  );
}
