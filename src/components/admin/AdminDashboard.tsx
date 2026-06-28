"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import type { Project } from "@/types";
import { Button } from "@/components/shared/Button";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { listProjects, removeProject, saveProject } from "@/services/projects";
import { listContactRequests } from "@/services/contact";

export function AdminDashboard() {
  const [items, setItems] = useState<Project[]>([]);
  const [editing, setEditing] = useState<Project | null | undefined>(undefined);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [contactStats, setContactStats] = useState({ new: 0, pending: 0 });

  useEffect(() => {
    listProjects().then(setItems).catch((error) => setMessage(error instanceof Error ? error.message : "No se pudieron cargar proyectos desde DynamoDB."));
    listContactRequests({ limit: 5 })
      .then((result) => setContactStats({ new: result.stats.new, pending: result.stats.pending }))
      .catch(() => undefined);
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return items.filter((item) => [item.name, item.categoryName, item.environment].join(" ").toLowerCase().includes(q));
  }, [items, query]);

  async function onSave(project: Project) {
    try {
      const savedProject = await saveProject(project);
      setItems((current) => [savedProject, ...current.filter((item) => item.id !== project.id && item.id !== savedProject.id)]);
      setEditing(undefined);
      setMessage("Proyecto guardado correctamente.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo guardar el proyecto.");
    }
  }

  async function onDelete(project: Project) {
    if (!window.confirm(`Eliminar ${project.name}? Esta accion no se puede deshacer.`)) return;
    try {
      await removeProject(project.id);
      setItems((current) => current.filter((item) => item.id !== project.id));
      setMessage("Proyecto eliminado.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo eliminar el proyecto.");
    }
  }

  return (
    <div className="grid gap-8">
      <section className="grid gap-5 md:grid-cols-4">
        <Stat label="Proyectos" value={String(items.length)} />
        <Stat label="Publicados" value={String(items.filter((item) => item.status === "published").length)} />
        <Stat label="Destacados" value={String(items.filter((item) => item.featured).length)} />
        <Stat label="Consultas nuevas" value={String(contactStats.new)} />
      </section>

      <section className="border border-graphite/10 bg-white p-5">
        <h2 className="font-display text-3xl font-semibold">Consultas pendientes</h2>
        <p className="mt-2 text-sm text-stone">{contactStats.pending} consultas necesitan seguimiento.</p>
        <Link href="/admin/consultas" className="mt-4 inline-flex text-sm font-medium text-timber">Ver consultas</Link>
      </section>

      {message ? <div className="border border-graphite/10 bg-linen p-4 text-sm">{message}</div> : null}

      <section id="proyectos" className="grid gap-4">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <h1 className="font-display text-4xl font-semibold">Gestion de proyectos</h1>
          <div className="flex gap-3">
            <Link href="/admin/proyectos/nuevo" className="inline-flex h-11 items-center justify-center gap-2 bg-graphite px-5 text-sm font-medium text-white transition hover:bg-black">
              <Plus className="h-4 w-4" /> Nuevo proyecto
            </Link>
            <Button variant="secondary" onClick={() => setEditing(null)}><Plus className="h-4 w-4" /> Rapido</Button>
          </div>
        </div>
        <label className="relative block">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-stone" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} className="h-11 w-full border border-graphite/15 bg-white pl-10 pr-3" placeholder="Buscar proyectos" />
        </label>
        {editing !== undefined ? <ProjectForm project={editing ?? undefined} onSave={onSave} onCancel={() => setEditing(undefined)} /> : null}
        <div className="overflow-x-auto border border-graphite/10 bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-linen text-xs uppercase tracking-[0.14em] text-stone">
              <tr><th className="p-4">Nombre</th><th>Categoria</th><th>Ambiente</th><th>Estado</th><th>Destacado</th><th className="text-right">Acciones</th></tr>
            </thead>
            <tbody>
              {filtered.map((project) => (
                <tr key={project.id} className="border-t border-graphite/10">
                  <td className="p-4 font-medium">{project.name}</td>
                  <td>{project.categoryName}</td>
                  <td>{project.environment}</td>
                  <td><StatusBadge status={project.status} /></td>
                  <td>{project.featured ? "Si" : "No"}</td>
                  <td className="p-4 text-right">
                    <Link className="mr-3 inline-flex text-timber" href={`/admin/proyectos/${project.id}/editar`} aria-label={`Editar ${project.name}`}><Edit className="h-4 w-4" /></Link>
                    <button className="text-red-700" onClick={() => onDelete(project)} aria-label={`Eliminar ${project.name}`}><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="consultas" className="border border-graphite/10 bg-white p-5">
        <h2 className="font-display text-3xl font-semibold">Consultas recibidas</h2>
        <p className="mt-2 text-sm leading-6 text-stone">Las solicitudes del formulario se guardan en DynamoDB cuando AWS esta configurado.</p>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-graphite/10 bg-white p-5">
      <p className="font-display text-4xl font-semibold">{value}</p>
      <p className="mt-2 text-xs uppercase tracking-[0.16em] text-stone">{label}</p>
    </div>
  );
}
