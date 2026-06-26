"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import type { Project } from "@/types";
import { ImageUploader, type UploadedImage } from "@/components/admin/ImageUploader";
import { Button } from "@/components/shared/Button";
import { projectSchema, type ProjectFormValues } from "@/lib/validations/project";

export function ProjectForm({ project, onSave, onCancel }: { project?: Project; onSave: (project: Project) => Promise<void>; onCancel: () => void }) {
  const initialImages = useMemo(() => getInitialImages(project), [project]);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>(initialImages);

  const {
    register,
    handleSubmit,
    setValue,
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

  function syncImages(images: UploadedImage[]) {
    const sorted = [...images].sort((a, b) => a.order - b.order);
    const main = sorted.find((image) => image.isMain) ?? sorted[0];
    setUploadedImages(sorted);
    setValue("images", sorted.map((image) => image.url).join("\n"), { shouldDirty: true, shouldValidate: true });
    if (main?.url) setValue("mainImage", main.url, { shouldDirty: true, shouldValidate: true });
  }

  async function submit(values: ProjectFormValues) {
    const now = new Date().toISOString();
    const imageList = values.images?.split("\n").map((item) => item.trim()).filter(Boolean) ?? [];
    const images = imageList.length ? imageList : [values.mainImage];
    const normalizedImages = images.includes(values.mainImage) ? images : [values.mainImage, ...images];

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
      images: normalizedImages,
      featured: values.featured,
      status: values.status,
      createdAt: project?.createdAt ?? now,
      updatedAt: now,
      createdBy: project?.createdBy,
      updatedBy: project?.updatedBy
    });
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="grid gap-5 border border-graphite/10 bg-white p-5">
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

      <section className="grid gap-4 border border-graphite/10 bg-ivory p-4">
        <div>
          <h2 className="text-lg font-semibold text-graphite">Imágenes del proyecto</h2>
          <p className="mt-1 text-sm leading-6 text-stone">Podés pegar URLs manualmente o subir imágenes desde tu PC. La estrella define la imagen principal.</p>
        </div>
        <ImageUploader value={uploadedImages} onChange={syncImages} />
        <Field label="Imagen principal" error={errors.mainImage?.message}><input {...register("mainImage")} /></Field>
        <Field label="Galería de imágenes" error={errors.images?.message}><textarea rows={4} placeholder="Una URL por línea" {...register("images")} /></Field>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Fecha" error={errors.completionDate?.message}><input type="month" {...register("completionDate")} /></Field>
        <Field label="Estado" error={errors.status?.message}>
          <select {...register("status")}><option value="draft">Borrador</option><option value="published">Publicado</option><option value="archived">Archivado</option></select>
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

function getInitialImages(project?: Project): UploadedImage[] {
  const urls = Array.from(new Set([project?.mainImage, ...(project?.images ?? [])].filter((url): url is string => Boolean(url))));
  return urls.map((url, index) => ({
    key: url,
    url,
    alt: project?.name ? `Imagen ${index + 1} de ${project.name}` : `Imagen ${index + 1}`,
    order: index,
    isMain: url === project?.mainImage || (!project?.mainImage && index === 0)
  }));
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactElement }) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <div className="[&_input]:h-11 [&_input]:w-full [&_input]:border [&_input]:border-graphite/15 [&_input]:bg-white [&_input]:px-3 [&_select]:h-11 [&_select]:w-full [&_select]:border [&_select]:border-graphite/15 [&_select]:bg-white [&_select]:px-3 [&_textarea]:w-full [&_textarea]:border [&_textarea]:border-graphite/15 [&_textarea]:bg-white [&_textarea]:p-3">
        {children}
      </div>
      {error ? <span className="font-normal text-red-700">{error}</span> : null}
    </label>
  );
}
