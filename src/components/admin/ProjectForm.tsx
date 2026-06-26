"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { Project } from "@/types";
import { Button } from "@/components/shared/Button";
import { projectSchema, type ProjectFormValues } from "@/lib/validations/project";

export function ProjectForm({ project, onSave, onCancel }: { project?: Project; onSave: (project: Project) => Promise<void>; onCancel: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: project
      ? {
          ...project,
          materials: project.materials.join(", "),
          finishes: project.finishes.join(", "),
          features: project.features.join(", "),
          images: project.images.join("\n")
        }
      : {
          name: "",
          slug: "",
          shortDescription: "",
          description: "",
          categoryName: "Cocinas",
          environment: "Cocina",
          materials: "",
          finishes: "",
          features: "",
          mainImage: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1600&q=82",
          images: "",
          featured: false,
          status: "draft"
        }
  });

  async function submit(values: ProjectFormValues) {
    const now = new Date().toISOString();
    await onSave({
      id: project?.id ?? `new-${Date.now()}`,
      name: values.name,
      slug: values.slug,
      shortDescription: values.shortDescription,
      description: values.description,
      categoryId: project?.categoryId ?? "cat-custom",
      categoryName: values.categoryName,
      environment: values.environment,
      materials: values.materials.split(",").map((item) => item.trim()).filter(Boolean),
      finishes: values.finishes.split(",").map((item) => item.trim()).filter(Boolean),
      dimensions: values.dimensions,
      location: values.location,
      completionDate: values.completionDate,
      features: values.features.split(",").map((item) => item.trim()).filter(Boolean),
      mainImage: values.mainImage,
      images: values.images?.split("\n").map((item) => item.trim()).filter(Boolean) ?? [values.mainImage],
      featured: values.featured,
      status: values.status,
      createdAt: project?.createdAt ?? now,
      updatedAt: now
    });
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="grid gap-4 border border-graphite/10 bg-white p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nombre" error={errors.name?.message}><input {...register("name")} /></Field>
        <Field label="Slug" error={errors.slug?.message}><input {...register("slug")} /></Field>
        <Field label="Categoría" error={errors.categoryName?.message}><input {...register("categoryName")} /></Field>
        <Field label="Ambiente" error={errors.environment?.message}><input {...register("environment")} /></Field>
        <Field label="Materiales" error={errors.materials?.message}><input placeholder="Roble, MDF..." {...register("materials")} /></Field>
        <Field label="Terminaciones" error={errors.finishes?.message}><input {...register("finishes")} /></Field>
        <Field label="Medidas" error={errors.dimensions?.message}><input {...register("dimensions")} /></Field>
        <Field label="Ubicación" error={errors.location?.message}><input {...register("location")} /></Field>
      </div>
      <Field label="Descripción corta" error={errors.shortDescription?.message}><input {...register("shortDescription")} /></Field>
      <Field label="Descripción" error={errors.description?.message}><textarea rows={4} {...register("description")} /></Field>
      <Field label="Características" error={errors.features?.message}><input placeholder="Separadas por coma" {...register("features")} /></Field>
      <Field label="Imagen principal" error={errors.mainImage?.message}><input {...register("mainImage")} /></Field>
      <Field label="Imágenes adicionales" error={errors.images?.message}><textarea rows={3} placeholder="Una URL por línea. Para producción conectar ImageUploader con Firebase Storage." {...register("images")} /></Field>
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Fecha" error={errors.completionDate?.message}><input type="month" {...register("completionDate")} /></Field>
        <Field label="Estado" error={errors.status?.message}>
          <select {...register("status")}><option value="draft">Borrador</option><option value="published">Publicado</option></select>
        </Field>
        <label className="flex items-center gap-3 pt-7 text-sm"><input type="checkbox" {...register("featured")} /> Destacado</label>
      </div>
      <div className="flex gap-3">
        <Button disabled={isSubmitting}>{isSubmitting ? "Guardando..." : "Guardar"}</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
      </div>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactElement }) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <div className="[&_input]:h-11 [&_input]:w-full [&_input]:border [&_input]:border-graphite/15 [&_input]:bg-ivory [&_input]:px-3 [&_select]:h-11 [&_select]:w-full [&_select]:border [&_select]:border-graphite/15 [&_select]:bg-ivory [&_select]:px-3 [&_textarea]:w-full [&_textarea]:border [&_textarea]:border-graphite/15 [&_textarea]:bg-ivory [&_textarea]:p-3">{children}</div>
      {error ? <span className="font-normal text-red-700">{error}</span> : null}
    </label>
  );
}
