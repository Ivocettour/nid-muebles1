"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FolderKanban, Inbox, LayoutDashboard, LogOut, Settings, Tags, TextCursorInput } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/proyectos", label: "Proyectos", icon: FolderKanban },
  { href: "/admin/categorias", label: "Categorías", icon: Tags },
  { href: "/admin/contenido", label: "Contenido", icon: TextCursorInput },
  { href: "/admin/consultas", label: "Consultas", icon: Inbox },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings }
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { logout } = useAuth();

  async function handleLogout() {
    await logout();
    router.replace("/admin/login");
  }

  return (
    <div className="min-h-screen bg-ivory">
      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 lg:grid-cols-[260px_1fr] lg:px-8">
        <aside className="border border-graphite/10 bg-white p-4">
          <p className="font-display text-3xl font-bold">NID Admin</p>
          <nav className="mt-6 grid gap-2 text-sm" aria-label="Navegación administrativa">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className="flex items-center gap-2 px-3 py-2 transition hover:bg-linen">
                  <Icon className="h-4 w-4" aria-hidden />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <Button variant="secondary" className="mt-8 w-full" onClick={handleLogout}>
            <LogOut className="h-4 w-4" /> Cerrar sesión
          </Button>
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
