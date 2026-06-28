"use client";

import { AdminPlaceholderPage } from "@/components/admin/AdminPlaceholderPage";
import { CategoryManager } from "@/components/admin/CategoryManager";

export default function AdminCategoriesPage() {
  return (
    <AdminPlaceholderPage title="Categorias" description="Gestion de categorias">
      <CategoryManager />
    </AdminPlaceholderPage>
  );
}
