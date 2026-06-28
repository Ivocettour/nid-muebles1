import type { Metadata } from "next";
import { ProjectGrid } from "@/components/catalog/ProjectGrid";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { getCachedActiveCategories, getCachedPublishedProjects } from "@/services/server/publicData";
import { EmptyState } from "@/components/shared/EmptyState";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Catalogo",
  description: "Catalogo digital de muebles y proyectos a medida de NID."
};

export default async function CatalogPage() {
  const [projects, categories] = await Promise.all([getCachedPublishedProjects(), getCachedActiveCategories()]);

  return (
    <section className="mx-auto max-w-7xl px-5 pb-20 pt-32 lg:px-8">
      <SectionHeading eyebrow="Catalogo" title="Muebles y proyectos a medida" description="Filtra por categoria, ambiente o material. Los precios se presupuestan segun medidas, materiales y complejidad." />
      <div className="mt-10">
        {projects.length ? (
          <ProjectGrid projects={projects} categoryOptions={categories.map((category) => category.name)} />
        ) : (
          <EmptyState title="Todavia no hay proyectos publicados." description="Cuando publiques proyectos desde el panel administrativo van a aparecer aca." />
        )}
      </div>
    </section>
  );
}
