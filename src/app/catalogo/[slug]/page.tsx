import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageCircle } from "lucide-react";
import Link from "next/link";
import { ProjectGallery } from "@/components/catalog/ProjectGallery";
import { ButtonLink } from "@/components/shared/Button";
import { ProjectCard } from "@/components/catalog/ProjectCard";
import { createWhatsAppLink } from "@/lib/whatsapp";
import { getCachedProjectBySlug, getCachedRelatedProjects } from "@/services/server/publicData";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getCachedProjectBySlug(slug).catch(() => null);
  if (!project || project.status !== "published") return { title: "Proyecto no encontrado" };
  return {
    title: project.name,
    description: project.shortDescription,
    openGraph: {
      title: project.name,
      description: project.shortDescription,
      images: project.mainImage ? [{ url: project.mainImage }] : undefined
    },
    alternates: {
      canonical: `/catalogo/${project.slug}`
    }
  };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getCachedProjectBySlug(slug);
  if (!project || project.status !== "published") notFound();
  const related = await getCachedRelatedProjects(slug);
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: project.name,
    description: project.shortDescription,
    image: project.mainImage,
    category: project.categoryName
  };

  return (
    <article className="mx-auto max-w-7xl px-5 pb-20 pt-32 lg:px-8">
      <Link href="/catalogo" className="mb-8 inline-flex items-center gap-2 text-sm text-stone hover:text-graphite">
        <ArrowLeft className="h-4 w-4" /> Volver al catalogo
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
            {project.location ? <Info label="Ubicacion" value={project.location} /> : null}
          </dl>
          {project.features.length ? (
            <div className="mt-8">
              <h2 className="text-lg font-semibold">Caracteristicas principales</h2>
              <ul className="mt-3 grid gap-2 text-sm text-stone">
                {project.features.map((feature) => (
                  <li key={feature}>- {feature}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <p className="mt-6 text-sm leading-6 text-stone">Este proyecto puede adaptarse a otras medidas, materiales y terminaciones segun tu espacio.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/contacto">Consultar por un proyecto similar</ButtonLink>
            <a
              href={createWhatsAppLink(`Hola, vi el proyecto ${project.name} en la web de NID y quisiera solicitar informacion para realizar algo similar.`)}
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
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
