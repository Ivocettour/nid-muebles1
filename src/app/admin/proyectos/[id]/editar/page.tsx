"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { AdminPlaceholderPage } from "@/components/admin/AdminPlaceholderPage";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import type { Project } from "@/types";
import { listProjects, saveProject } from "@/services/projects";

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    listProjects()
      .then((projects) => {
        setProject(projects.find((item) => item.id === params.id) ?? null);
      })
      .catch(() => setMessage("No se pudo cargar el proyecto."))
      .finally(() => setLoading(false));
  }, [params.id]);

  async function onSave(updatedProject: Project) {
    try {
      setMessage("");
      await saveProject(updatedProject);
      router.replace("/admin/proyectos");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo guardar el proyecto.");
    }
  }

  return (
    <AdminPlaceholderPage title="Editar proyecto" description="Edición de proyectos con carga de imágenes desde tu PC.">
      <section className="grid gap-5">
        <div>
          <h1 className="font-display text-4xl font-semibold">Editar proyecto</h1>
          <p className="mt-2 text-sm text-stone">Actualizá los datos, reemplazá imágenes o marcá una nueva imagen principal.</p>
        </div>
        {message ? <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-800">{message}</div> : null}
        {loading ? <LoadingSkeleton /> : null}
        {!loading && !project ? <div className="border border-graphite/10 bg-white p-6 text-sm text-stone">No encontramos el proyecto solicitado.</div> : null}
        {project ? <ProjectForm project={project} onSave={onSave} onCancel={() => router.push("/admin/proyectos")} /> : null}
      </section>
    </AdminPlaceholderPage>
  );
}
