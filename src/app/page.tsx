import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Ruler, Sparkles, Wrench } from "lucide-react";
import { ButtonLink } from "@/components/shared/Button";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { ProjectCard } from "@/components/catalog/ProjectCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { getCachedActiveCategories, getCachedFeaturedProjects, getCachedPublishedProjects } from "@/services/server/publicData";

export const dynamic = "force-dynamic";

const fallbackHero = "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=2200&q=85";

export default async function HomePage() {
  const [featured, projects, categories] = await Promise.all([getCachedFeaturedProjects(), getCachedPublishedProjects(), getCachedActiveCategories()]);
  const heroImage = featured[0]?.mainImage || projects[0]?.mainImage || fallbackHero;

  return (
    <>
      <section className="relative min-h-[92vh] overflow-hidden">
        <Image src={heroImage} alt="Ambiente moderno con mobiliario a medida" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-ivory via-ivory/80 to-transparent" />
        <div className="relative mx-auto flex min-h-[92vh] max-w-7xl items-center px-5 pb-16 pt-28 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-timber">Diseno que nace de tu espacio</p>
            <h1 className="mt-5 font-display text-5xl font-semibold leading-[0.98] text-graphite md:text-7xl">Disenamos muebles que se adaptan a tu espacio.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-graphite/72">Diseno, fabricacion y montaje de mobiliario a medida para hogares, oficinas y espacios comerciales.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/contacto">Solicitar presupuesto</ButtonLink>
              <ButtonLink href="/proyectos" variant="secondary">Ver proyectos</ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <SectionHeading eyebrow="Categorias" title="Soluciones para cada ambiente" description="Muebles pensados para tu forma de vivir, trabajar y habitar cada espacio." />
        {categories.length ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.slice(0, 8).map((category) => {
              const categoryProject = projects.find((project) => project.categoryId === category.id || project.categoryName === category.name);
              const image = category.image || categoryProject?.mainImage;
              return (
                <Link key={category.id} href={`/catalogo/categoria/${category.slug}`} className="group overflow-hidden border border-graphite/10 bg-white transition hover:border-timber">
                  {image ? (
                    <div className="relative aspect-[4/3] bg-linen">
                      <Image src={image} alt={category.name} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover transition duration-500 group-hover:scale-105" />
                    </div>
                  ) : null}
                  <div className="p-6">
                    <p className="font-display text-2xl font-semibold">{category.name}</p>
                    <p className="mt-3 text-sm leading-6 text-stone">{category.description}</p>
                    <ArrowRight className="mt-5 h-5 w-5 text-timber transition group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="mt-10">
            <EmptyState title="Todavia no hay categorias activas." description="Activa categorias desde el panel administrativo para mostrarlas en la web publica." />
          </div>
        )}
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionHeading eyebrow="Proyectos destacados" title="Trabajos reales de NID" description="Cada pieza parte del relevamiento, la materialidad y la precision de montaje." />
          {featured.length ? (
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((project, index) => (
                <ProjectCard key={project.id} project={project} priority={index < 3} />
              ))}
            </div>
          ) : (
            <div className="mt-10">
              <EmptyState title="Todavia no hay proyectos publicados." description="Cuando publiques proyectos desde el panel administrativo van a aparecer aca." />
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <SectionHeading eyebrow="Proceso" title="De la idea al montaje final" description="Acompanamos cada decision para que el mueble responda al uso, al espacio y a la estetica buscada." />
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ["Nos contas tu idea", Sparkles],
            ["Analizamos medidas y uso", Ruler],
            ["Disenamos la propuesta", CheckCircle2],
            ["Fabricamos y montamos", Wrench]
          ].map(([label, Icon], index) => (
            <div key={String(label)} className="border border-graphite/10 bg-white p-6">
              <span className="text-sm font-semibold text-timber">0{index + 1}</span>
              <Icon className="mt-8 h-7 w-7 text-graphite" />
              <h3 className="mt-5 text-xl font-semibold">{String(label)}</h3>
            </div>
          ))}
        </div>
      </section>

      {projects.length ? (
        <section className="mx-auto grid max-w-7xl gap-5 px-5 py-20 md:grid-cols-4 lg:px-8">
          {projects.slice(0, 4).map((project, index) => (
            <div key={project.id} className={`relative min-h-80 overflow-hidden bg-linen ${index === 0 ? "md:col-span-2 md:row-span-2" : ""}`}>
              <Image src={project.mainImage} alt={`Ambiente ${project.name}`} fill sizes="(min-width: 768px) 25vw, 100vw" className="object-cover" />
            </div>
          ))}
        </section>
      ) : null}

      <section className="mx-auto grid max-w-7xl gap-10 px-5 pb-20 lg:grid-cols-2 lg:px-8">
        <SectionHeading eyebrow="NID" title="Diseno, fabricacion y montaje con mirada integral" />
        <div className="text-lg leading-8 text-stone">
          <p>Desde la primera idea hasta el montaje final, transformamos espacios a traves de soluciones personalizadas, materiales seleccionados y atencion en cada detalle.</p>
          <ButtonLink href="/nosotros" variant="secondary" className="mt-8">Conocer NID</ButtonLink>
        </div>
      </section>

      <section className="bg-linen px-5 py-20 text-center">
        <h2 className="font-display text-4xl font-semibold md:text-5xl">Tenes un espacio para resolver?</h2>
        <p className="mx-auto mt-4 max-w-2xl text-stone">Contanos medidas, uso y referencias. Preparamos una propuesta a medida para tu proyecto.</p>
        <ButtonLink href="/contacto" className="mt-8">Solicitar presupuesto</ButtonLink>
      </section>
    </>
  );
}
