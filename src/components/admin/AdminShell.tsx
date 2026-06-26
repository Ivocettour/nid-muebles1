"use client";

import Link from "next/link";
import { LogOut, LayoutDashboard, FolderKanban, Inbox, Tags } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/shared/Button";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen bg-ivory pt-20">
      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 lg:grid-cols-[260px_1fr] lg:px-8">
        <aside className="border border-graphite/10 bg-white p-4">
          <p className="font-display text-3xl font-bold">NID Admin</p>
          <nav className="mt-6 grid gap-2 text-sm">
            <Link href="/admin" className="flex items-center gap-2 px-3 py-2 hover:bg-linen"><LayoutDashboard className="h-4 w-4" /> Dashboard</Link>
            <a href="#proyectos" className="flex items-center gap-2 px-3 py-2 hover:bg-linen"><FolderKanban className="h-4 w-4" /> Proyectos</a>
            <a href="#categorias" className="flex items-center gap-2 px-3 py-2 hover:bg-linen"><Tags className="h-4 w-4" /> Categorías</a>
            <a href="#consultas" className="flex items-center gap-2 px-3 py-2 hover:bg-linen"><Inbox className="h-4 w-4" /> Consultas</a>
          </nav>
          <Button variant="secondary" className="mt-8 w-full" onClick={logout}>
            <LogOut className="h-4 w-4" /> Cerrar sesión
          </Button>
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
