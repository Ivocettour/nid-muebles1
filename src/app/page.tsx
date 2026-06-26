import Image from "next/image";
import { ArrowRight, CheckCircle2, Ruler, Sparkles, Wrench } from "lucide-react";
import { categories } from "@/data/categories";
import { projects } from "@/data/projects";
import { ButtonLink } from "@/components/shared/Button";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { ProjectCard } from "@/components/catalog/ProjectCard";

export default function HomePage() {
  const featured = projects.filter((project) => project.featured).slice(0, 6);

  return (
    <>
      <section className="relative min-h-[92vh] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=2200&q=85"
          alt="Ambiente moderno con mobiliario a medida"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ivory via-ivory/80 to-transparent" />
        <div className="relative mx-auto flex min-h-[92vh] max-w-7xl items-center px-5 pb-16 pt-28 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-timber">Diseño que nace de tu espacio</p>
            <h1 className="mt-5 font-display text-5xl font-semibold leading-[0.98] text-graphite md:text-7xl">
              Diseñamos muebles que se adaptan a tu espacio.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-graphite/72">
              Diseño, fabricación y montaje de mobiliario a medida para hogares, oficinas y espacios comerciales.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/contacto">Solicitar presupuesto</ButtonLink>
              <ButtonLink href="/proyectos" variant="secondary">Ver proyectos</ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <SectionHeading eyebrow="Categorías" title="Soluciones para cada ambiente" description="Muebles pensados para tu forma de vivir, trabajar y habitar cada espacio." />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.slice(0, 8).map((category) => (
            <a key={category.id} href={`/catalogo?categoria=${category.slug}`} className="group border border-graphite/10 bg-white p-6 transition hover:border-timber">
              <p className="font-display text-2xl font-semibold">{category.name}</p>
              <p className="mt-3 text-sm leading-6 text-stone">{category.description}</p>
              <ArrowRight className="mt-5 h-5 w-5 text-timber transition group-hover:translate-x-1" />
            </a>
          ))}
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionHeading eyebrow="Proyectos recientes" title="Catálogo premium de trabajos reales" description="Cada pieza parte del relevamiento, la materialidad y la precisión de montaje." />
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((project, index) => (
              <ProjectCard key={project.id} project={project} priority={index < 3} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <SectionHeading eyebrow="Proceso" title="De la idea al montaje final" description="Acompañamos cada decisión para que el mueble responda al uso, al espacio y a la estética buscada." />
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ["Nos contás tu idea", Sparkles],
            ["Analizamos medidas y uso", Ruler],
            ["Diseñamos la propuesta", CheckCircle2],
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

      <section className="bg-graphite py-20 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-3 lg:px-8">
          {["Diseño funcional", "Materiales seleccionados", "Montaje preciso"].map((title) => (
            <div key={title}>
              <h2 className="font-display text-3xl font-semibold">{title}</h2>
              <p className="mt-4 text-sm leading-7 text-white/68">Soluciones personalizadas con atención en proporciones, terminaciones y detalles de uso diario.</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 py-20 md:grid-cols-4 lg:px-8">
        {projects.slice(0, 4).map((project, index) => (
          <div key={project.id} className={`relative min-h-80 overflow-hidden bg-linen ${index === 0 ? "md:col-span-2 md:row-span-2" : ""}`}>
            <Image src={project.mainImage} alt={`Ambiente ${project.name}`} fill sizes="(min-width: 768px) 25vw, 100vw" className="object-cover" />
          </div>
        ))}
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 pb-20 lg:grid-cols-2 lg:px-8">
        <SectionHeading eyebrow="NID" title="Diseño, fabricación y montaje con mirada integral" />
        <div className="text-lg leading-8 text-stone">
          <p>
            Desde la primera idea hasta el montaje final, transformamos espacios a través de soluciones personalizadas, materiales seleccionados y atención en cada detalle.
          </p>
          <ButtonLink href="/nosotros" variant="secondary" className="mt-8">Conocer NID</ButtonLink>
        </div>
      </section>

      <section className="bg-linen px-5 py-20 text-center">
        <h2 className="font-display text-4xl font-semibold md:text-5xl">¿Tenés un espacio para resolver?</h2>
        <p className="mx-auto mt-4 max-w-2xl text-stone">Contanos medidas, uso y referencias. Preparamos una propuesta a medida para tu proyecto.</p>
        <ButtonLink href="/contacto" className="mt-8">Solicitar presupuesto</ButtonLink>
      </section>
    </>
  );
}
