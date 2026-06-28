import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { EmptyState } from "@/components/shared/EmptyState";
import { ProjectCard } from "@/components/catalog/ProjectCard";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { getCachedCategoryBySlug, getCachedProjectsByCategory } from "@/services/server/publicData";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCachedCategoryBySlug(slug).catch(() => null);
  if (!category) return { title: "Categoria no encontrada" };
  return {
    title: category.name,
    description: category.description,
    alternates: { canonical: `/catalogo/categoria/${category.slug}` }
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCachedCategoryBySlug(slug);
  if (!category || !category.active) notFound();
  const projects = await getCachedProjectsByCategory(category.id, category.name);

  return (
    <section className="mx-auto max-w-7xl px-5 pb-20 pt-32 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <SectionHeading eyebrow="Categoria" title={category.name} description={category.description ?? "Proyectos publicados de esta categoria."} />
        {category.image ? (
          <div className="relative min-h-72 overflow-hidden bg-linen">
            <Image src={category.image} alt={category.name} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
        ) : null}
      </div>
      {projects.length ? (
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} priority={index < 3} />
          ))}
        </div>
      ) : (
        <div className="mt-12">
          <EmptyState title="Todavia no hay proyectos publicados en esta categoria." description="Cuando publiques proyectos asociados van a aparecer aca." />
        </div>
      )}
    </section>
  );
}
