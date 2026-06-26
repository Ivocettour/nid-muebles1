"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminShell } from "@/components/admin/AdminShell";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { useAuth } from "@/hooks/useAuth";

export default function AdminPage() {
  const router = useRouter();
  const { user, loading, hasAccess } = useAuth();

  useEffect(() => {
    if (!loading && !user) router.replace("/admin/login");
  }, [loading, router, user]);

  if (loading || !user) return <div className="px-5 pt-32"><LoadingSkeleton /></div>;
  if (!hasAccess) {
    return (
      <div className="mx-auto max-w-xl px-5 pt-32">
        <h1 className="font-display text-4xl font-semibold">Acceso denegado</h1>
        <p className="mt-3 text-stone">No tenés permisos para acceder al panel.</p>
      </div>
    );
  }

  return (
    <AdminShell>
      <AdminDashboard />
    </AdminShell>
  );
}
