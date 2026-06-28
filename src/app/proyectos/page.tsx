import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { EmptyState } from "@/components/shared/EmptyState";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { getCachedPublishedProjects } from "@/services/server/publicData";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Proyectos",
  description: "Portfolio editorial de proyectos realizados por NID."
};

export default async function ProjectsPage() {
  const projects = await getCachedPublishedProjects();

  return (
    <section className="mx-auto max-w-7xl px-5 pb-20 pt-32 lg:px-8">
      <SectionHeading eyebrow="Portfolio" title="Trabajos realizados" description="Una galeria editorial de ambientes, detalles y soluciones de mobiliario a medida." />
      {projects.length ? (
        <div className="mt-12 grid auto-rows-[220px] gap-5 md:grid-cols-4">
          {projects.map((project, index) => (
            <Link
              key={project.id}
              href={`/catalogo/${project.slug}`}
              className={`group relative overflow-hidden bg-linen ${index % 5 === 0 ? "md:col-span-2 md:row-span-2" : ""} ${index % 7 === 0 ? "md:row-span-2" : ""}`}
            >
              <Image src={project.mainImage} alt={`Proyecto ${project.name}`} fill sizes="(min-width: 768px) 25vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5 text-white">
                <p className="text-xs uppercase tracking-[0.2em] text-white/70">{project.environment}</p>
                <h2 className="mt-1 text-xl font-semibold">{project.name}</h2>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-12">
          <EmptyState title="Todavia no hay proyectos publicados." description="Los proyectos publicados desde el panel administrativo van a aparecer en esta galeria." />
        </div>
      )}
    </section>
  );
}
