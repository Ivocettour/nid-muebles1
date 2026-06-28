import { AdminPlaceholderPage } from "@/components/admin/AdminPlaceholderPage";
import { ContactRequestDetail } from "@/components/admin/ContactRequestDetail";

export default async function AdminContactRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AdminPlaceholderPage title="Consulta" description="Detalle de consulta">
      <ContactRequestDetail id={id} />
    </AdminPlaceholderPage>
  );
}
