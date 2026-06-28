"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FolderKanban, Inbox, Plus, RefreshCw, Tags, TextCursorInput } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { contactStatusLabels, preferredContactLabels } from "@/lib/contact";
import type { ProjectStatus } from "@/types";
import { getAdminDashboard, type AdminDashboardData } from "@/services/adminDashboard";

const projectStatusLabels: Record<ProjectStatus, string> = {
  draft: "Borrador",
  published: "Publicado",
  archived: "Archivado"
};

export function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const next = await getAdminDashboard();
      setData(next);
      setUpdatedAt(new Date());
    } catch {
      setError("No pudimos cargar las estadisticas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading && !data) {
    return (
      <div className="grid gap-6">
        <div className="h-24 animate-pulse bg-white" />
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-28 animate-pulse bg-white" />)}
        </div>
        <div className="h-80 animate-pulse bg-white" />
      </div>
    );
  }

  return (
    <div className="grid gap-8">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h1 className="font-display text-4xl font-semibold">Dashboard</h1>
          <p className="mt-2 text-sm text-stone">Resumen real de proyectos, categorias, consultas y actividad administrativa.</p>
          {updatedAt ? <p className="mt-2 text-xs text-stone">Ultima actualizacion: {updatedAt.toLocaleString("es-AR")}</p> : null}
        </div>
        <Button type="button" variant="secondary" onClick={load} disabled={loading}>
          <RefreshCw className="h-4 w-4" /> Actualizar dashboard
        </Button>
      </section>

      {error ? <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

      {data ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            <Stat label="Proyectos" value={data.projects.total} />
            <Stat label="Publicados" value={data.projects.published} />
            <Stat label="Destacados" value={data.projects.featured} />
            <Stat label="Consultas nuevas" value={data.contactRequests.new} />
            <Stat label="Pendientes" value={data.contactRequests.pending} />
            <Stat label="Categorias activas" value={data.categories.active} />
          </section>

          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <QuickLink href="/admin/proyectos/nuevo" label="Nuevo proyecto" icon={<Plus className="h-4 w-4" />} />
            <QuickLink href="/admin/proyectos" label="Ver proyectos" icon={<FolderKanban className="h-4 w-4" />} />
            <QuickLink href="/admin/consultas" label="Ver consultas" icon={<Inbox className="h-4 w-4" />} />
            <QuickLink href="/admin/categorias" label="Nueva categoria" icon={<Tags className="h-4 w-4" />} />
            <QuickLink href="/admin/contenido" label="Editar contenido" icon={<TextCursorInput className="h-4 w-4" />} />
            <QuickLink href="/" label="Ver sitio publico" />
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <Panel title="Consultas pendientes">
              {data.pendingContactRequests.length ? (
                data.pendingContactRequests.map((item) => (
                  <Row key={item.id}>
                    <div>
                      <Link href={`/admin/consultas/${item.id}`} className="font-semibold hover:text-timber">{item.fullName}</Link>
                      <p className="text-sm text-stone">{item.furnitureType} · {preferredContactLabels[item.preferredContactMethod]}</p>
                    </div>
                    <div className="text-right">
                      <Badge>{contactStatusLabels[item.status]}</Badge>
                      <p className="mt-1 text-xs text-stone">{new Date(item.createdAt).toLocaleDateString("es-AR")}</p>
                    </div>
                  </Row>
                ))
              ) : (
                <Empty text="No hay consultas pendientes." />
              )}
            </Panel>

            <Panel title="Ultimas consultas">
              {data.recentContactRequests.length ? (
                data.recentContactRequests.map((item) => (
                  <Row key={item.id}>
                    <div>
                      <Link href={`/admin/consultas/${item.id}`} className="font-semibold hover:text-timber">{item.fullName}</Link>
                      <p className="text-sm text-stone">{item.furnitureType}</p>
                    </div>
                    <div className="text-right">
                      <Badge>{contactStatusLabels[item.status]}</Badge>
                      <p className="mt-1 text-xs text-stone">{new Date(item.createdAt).toLocaleDateString("es-AR")}</p>
                    </div>
                  </Row>
                ))
              ) : (
                <Empty text="Todavia no hay consultas." />
              )}
            </Panel>

            <Panel title="Ultimos proyectos modificados">
              {data.recentProjects.length ? (
                data.recentProjects.map((project) => (
                  <Row key={project.id}>
                    <div>
                      <Link href={`/admin/proyectos/${project.id}/editar`} className="font-semibold hover:text-timber">{project.name}</Link>
                      <p className="text-sm text-stone">{project.categoryName} · {project.featured ? "Destacado" : "Sin destacar"}</p>
                    </div>
                    <div className="text-right">
                      <Badge>{projectStatusLabels[project.status]}</Badge>
                      <p className="mt-1 text-xs text-stone">{new Date(project.updatedAt).toLocaleDateString("es-AR")}</p>
                    </div>
                  </Row>
                ))
              ) : (
                <Empty text="Todavia no hay proyectos." />
              )}
            </Panel>

            <Panel title="Actividad reciente">
              {data.recentActivity.length ? (
                data.recentActivity.map((activity) => (
                  <Row key={activity.id}>
                    <div>
                      <p className="font-semibold">{formatActivity(activity.action, activity.entity)}</p>
                      <p className="text-sm text-stone">{activity.description || activity.entityId || "Sin detalle"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-stone">{activity.email || activity.userId}</p>
                      <p className="mt-1 text-xs text-stone">{new Date(activity.createdAt).toLocaleDateString("es-AR")}</p>
                    </div>
                  </Row>
                ))
              ) : (
                <Empty text="Todavia no hay actividad registrada." />
              )}
            </Panel>
          </section>
        </>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-graphite/10 bg-white p-5">
      <p className="font-display text-4xl font-semibold">{value}</p>
      <p className="mt-2 text-xs uppercase tracking-[0.16em] text-stone">{label}</p>
    </div>
  );
}

function QuickLink({ href, label, icon }: { href: string; label: string; icon?: React.ReactNode }) {
  return (
    <Link href={href} className="inline-flex h-11 items-center justify-center gap-2 border border-graphite/15 bg-white px-4 text-sm font-medium hover:border-timber">
      {icon} {label}
    </Link>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-graphite/10 bg-white p-5">
      <h2 className="font-display text-3xl font-semibold">{title}</h2>
      <div className="mt-5 grid gap-3">{children}</div>
    </section>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex items-start justify-between gap-4 border-t border-graphite/10 pt-3 first:border-t-0 first:pt-0">{children}</div>;
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex bg-linen px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]">{children}</span>;
}

function Empty({ text }: { text: string }) {
  return <p className="text-sm text-stone">{text}</p>;
}

function formatActivity(action: string, entity: string) {
  const entityLabel: Record<string, string> = {
    project: "Proyecto",
    contactRequest: "Consulta",
    category: "Categoria",
    content: "Contenido",
    settings: "Configuracion"
  };
  const actionLabel: Record<string, string> = {
    create: "creado",
    update: "actualizado",
    upsert: "actualizado",
    publish: "publicado",
    delete: "eliminado",
    read: "leida"
  };
  return `${entityLabel[entity] ?? entity} ${actionLabel[action] ?? action}`;
}
