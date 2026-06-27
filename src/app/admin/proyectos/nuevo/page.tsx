"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { AdminPlaceholderPage } from "@/components/admin/AdminPlaceholderPage";
import type { Project } from "@/types";
import { saveProject } from "@/services/projects";

export default function NewProjectPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");

  async function onSave(project: Project) {
    try {
      setMessage("");
      await saveProject(project);
      router.replace("/admin/proyectos");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo guardar el proyecto.");
    }
  }

  return (
    <AdminPlaceholderPage title="Nuevo proyecto" description="Alta de proyectos con carga de imágenes desde tu PC.">
      <section className="grid gap-5">
        <div>
          <h1 className="font-display text-4xl font-semibold">Nuevo proyecto</h1>
          <p className="mt-2 text-sm text-stone">Completá los datos y subí imágenes desde tu PC para guardarlas en S3.</p>
        </div>
        {message ? <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-800">{message}</div> : null}
        <ProjectForm project={undefined} onSave={onSave} onCancel={() => router.push("/admin/proyectos")} />
      </section>
    </AdminPlaceholderPage>
  );
}
