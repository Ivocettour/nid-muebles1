"use client";

import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminShell } from "@/components/admin/AdminShell";
import { LoginForm } from "@/components/admin/LoginForm";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { useAuth } from "@/hooks/useAuth";

export default function AdminPage() {
  const { user, groups, loading, configured } = useAuth();
  if (loading) {
    return <div className="px-5 pt-32"><LoadingSkeleton /></div>;
  }
  if (!configured || !user) {
    return <LoginForm />;
  }
  if (!groups.some((group) => group === "Admin" || group === "Editor")) {
    return <div className="mx-auto max-w-xl px-5 pt-32"><h1 className="font-display text-4xl font-semibold">Acceso denegado</h1><p className="mt-3 text-stone">Tu usuario no pertenece a los grupos Admin o Editor de Cognito.</p></div>;
  }
  return (
    <AdminShell>
      <AdminDashboard />
    </AdminShell>
  );
}
