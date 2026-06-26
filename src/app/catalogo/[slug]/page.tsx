import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageCircle } from "lucide-react";
import Link from "next/link";
import { projects } from "@/data/projects";
import { ProjectGallery } from "@/components/catalog/ProjectGallery";
import { ButtonLink } from "@/components/shared/Button";
import { ProjectCard } from "@/components/catalog/ProjectCard";
import { createWhatsAppLink } from "@/lib/whatsapp";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  return {
    title: project?.name ?? "Proyecto",
    description: project?.shortDescription
  };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) notFound();
  const related = projects.filter((item) => item.categoryName === project.categoryName && item.id !== project.id).slice(0, 3);

  return (
    <article className="mx-auto max-w-7xl px-5 pb-20 pt-32 lg:px-8">
      <Link href="/catalogo" className="mb-8 inline-flex items-center gap-2 text-sm text-stone hover:text-graphite">
        <ArrowLeft className="h-4 w-4" /> Volver al catálogo
      </Link>
      <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
        <ProjectGallery images={project.images.length ? project.images : [project.mainImage]} name={project.name} />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-timber">{project.categoryName}</p>
          <h1 className="mt-3 font-display text-5xl font-semibold leading-tight">{project.name}</h1>
          <p className="mt-5 text-lg leading-8 text-stone">{project.description}</p>
          <dl className="mt-8 grid gap-4 border-y border-graphite/10 py-6 text-sm">
            <Info label="Ambiente" value={project.environment} />
            <Info label="Materiales" value={project.materials.join(", ")} />
            <Info label="Terminaciones" value={project.finishes.join(", ")} />
            <Info label="Medidas" value={project.dimensions ?? "Adaptable a relevamiento"} />
            <Info label="Fecha" value={project.completionDate ?? "A definir"} />
            {project.location ? <Info label="Ubicación" value={project.location} /> : null}
          </dl>
          <div className="mt-8">
            <h2 className="text-lg font-semibold">Características principales</h2>
            <ul className="mt-3 grid gap-2 text-sm text-stone">
              {project.features.map((feature) => (
                <li key={feature}>- {feature}</li>
              ))}
            </ul>
          </div>
          <p className="mt-6 text-sm leading-6 text-stone">Este proyecto puede adaptarse a otras medidas, materiales y terminaciones según tu espacio.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/contacto">Consultar por un proyecto similar</ButtonLink>
            <a
              href={createWhatsAppLink(`Hola, vi el proyecto ${project.name} en la web de NID y quisiera solicitar información para realizar algo similar.`)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center justify-center gap-2 border border-graphite/20 bg-white px-5 text-sm font-medium"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </div>
        </div>
      </div>
      {related.length ? (
        <section className="mt-20">
          <h2 className="font-display text-4xl font-semibold">Proyectos relacionados</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <ProjectCard key={item.id} project={item} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-4">
      <dt className="font-semibold text-graphite">{label}</dt>
      <dd className="text-stone">{value}</dd>
    </div>
  );
}
