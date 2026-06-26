import type { Metadata } from "next";
import { ProjectGrid } from "@/components/catalog/ProjectGrid";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { projects } from "@/data/projects";

export const metadata: Metadata = {
  title: "Catálogo",
  description: "Catálogo digital de muebles y proyectos a medida de NID."
};

export default function CatalogPage() {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-20 pt-32 lg:px-8">
      <SectionHeading eyebrow="Catálogo" title="Muebles y proyectos a medida" description="Filtrá por categoría, ambiente o material. Los precios se presupuestan según medidas, materiales y complejidad." />
      <div className="mt-10">
        <ProjectGrid projects={projects} />
      </div>
    </section>
  );
}
