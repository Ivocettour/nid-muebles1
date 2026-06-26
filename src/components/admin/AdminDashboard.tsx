"use client";

import { useEffect, useMemo, useState } from "react";
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import type { Project } from "@/types";
import { categories } from "@/data/categories";
import { projects as demoProjects } from "@/data/projects";
import { Button } from "@/components/shared/Button";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { listProjects, removeProject, saveProject } from "@/services/projects";

export function AdminDashboard() {
  const [items, setItems] = useState<Project[]>(demoProjects);
  const [editing, setEditing] = useState<Project | null | undefined>(undefined);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    listProjects().then(setItems).catch(() => setMessage("No se pudieron cargar proyectos de Firestore; se muestran datos demo."));
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return items.filter((item) => [item.name, item.categoryName, item.environment].join(" ").toLowerCase().includes(q));
  }, [items, query]);

  async function onSave(project: Project) {
    await saveProject(project);
    setItems((current) => [project, ...current.filter((item) => item.id !== project.id)]);
    setEditing(undefined);
    setMessage("Proyecto guardado correctamente.");
  }

  async function onDelete(project: Project) {
    if (!window.confirm(`¿Eliminar ${project.name}? Esta acción no se puede deshacer.`)) return;
    await removeProject(project.id);
    setItems((current) => current.filter((item) => item.id !== project.id));
    setMessage("Proyecto eliminado.");
  }

  return (
    <div className="grid gap-8">
      <section className="grid gap-5 md:grid-cols-4">
        <Stat label="Proyectos" value={String(items.length)} />
        <Stat label="Publicados" value={String(items.filter((item) => item.status === "published").length)} />
        <Stat label="Destacados" value={String(items.filter((item) => item.featured).length)} />
        <Stat label="Consultas nuevas" value="0" />
      </section>

      {message ? <div className="border border-graphite/10 bg-linen p-4 text-sm">{message}</div> : null}

      <section id="proyectos" className="grid gap-4">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <h1 className="font-display text-4xl font-semibold">Gestión de proyectos</h1>
          <Button onClick={() => setEditing(null)}><Plus className="h-4 w-4" /> Nuevo proyecto</Button>
        </div>
        <label className="relative block">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-stone" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} className="h-11 w-full border border-graphite/15 bg-white pl-10 pr-3" placeholder="Buscar proyectos" />
        </label>
        {editing !== undefined ? <ProjectForm project={editing ?? undefined} onSave={onSave} onCancel={() => setEditing(undefined)} /> : null}
        <div className="overflow-x-auto border border-graphite/10 bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-linen text-xs uppercase tracking-[0.14em] text-stone">
              <tr><th className="p-4">Nombre</th><th>Categoría</th><th>Ambiente</th><th>Estado</th><th>Destacado</th><th className="text-right">Acciones</th></tr>
            </thead>
            <tbody>
              {filtered.map((project) => (
                <tr key={project.id} className="border-t border-graphite/10">
                  <td className="p-4 font-medium">{project.name}</td>
                  <td>{project.categoryName}</td>
                  <td>{project.environment}</td>
                  <td><StatusBadge status={project.status} /></td>
                  <td>{project.featured ? "Sí" : "No"}</td>
                  <td className="p-4 text-right">
                    <button className="mr-3 text-timber" onClick={() => setEditing(project)} aria-label={`Editar ${project.name}`}><Edit className="h-4 w-4" /></button>
                    <button className="text-red-700" onClick={() => onDelete(project)} aria-label={`Eliminar ${project.name}`}><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="categorias" className="border border-graphite/10 bg-white p-5">
        <h2 className="font-display text-3xl font-semibold">Categorías</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {categories.map((category) => (
            <div key={category.id} className="border border-graphite/10 p-4">
              <p className="font-semibold">{category.name}</p>
              <p className="mt-1 text-xs text-stone">Orden {category.order} · {category.active ? "Activa" : "Inactiva"}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="consultas" className="border border-graphite/10 bg-white p-5">
        <h2 className="font-display text-3xl font-semibold">Consultas recibidas</h2>
        <p className="mt-2 text-sm leading-6 text-stone">Las solicitudes del formulario se guardan en Firestore cuando Firebase está configurado. Desde aquí se puede ampliar la lectura de `contactRequests`, cambiar estados, agregar notas internas y abrir WhatsApp.</p>
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
