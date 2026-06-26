"use client";

import { AdminShell } from "@/components/admin/AdminShell";
import { LoginForm } from "@/components/admin/LoginForm";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { useAuth } from "@/hooks/useAuth";

export function AdminPlaceholderPage({ title, description, children }: { title: string; description: string; children?: React.ReactNode }) {
  const { user, groups, loading, configured } = useAuth();
  if (loading) return <div className="px-5 pt-32"><LoadingSkeleton /></div>;
  if (!configured || !user) return <LoginForm />;
  if (!groups.some((group) => group === "Admin" || group === "Editor")) {
    return <div className="mx-auto max-w-xl px-5 pt-32"><h1 className="font-display text-4xl font-semibold">Acceso denegado</h1></div>;
  }
  return (
    <AdminShell>
      {children ?? (
        <section className="border border-graphite/10 bg-white p-8">
          <h1 className="font-display text-4xl font-semibold">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-stone">{description}</p>
        </section>
      )}
    </AdminShell>
  );
}
