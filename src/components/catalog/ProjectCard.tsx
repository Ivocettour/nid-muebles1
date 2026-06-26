import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/types";
import { ButtonLink } from "@/components/shared/Button";

export function ProjectCard({ project, priority = false }: { project: Project; priority?: boolean }) {
  return (
    <article className="group">
      <div className="relative aspect-[4/5] overflow-hidden bg-linen">
        <Image
          src={project.mainImage}
          alt={`Proyecto ${project.name} de NID`}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute left-4 top-4 bg-ivory px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-graphite">
          Diseño a medida
        </span>
      </div>
      <div className="pt-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-timber">{project.categoryName}</p>
            <h3 className="mt-1 text-xl font-semibold text-graphite">{project.name}</h3>
          </div>
          <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-stone transition group-hover:text-timber" aria-hidden />
        </div>
        <p className="mt-3 text-sm leading-6 text-stone">{project.shortDescription}</p>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-xs text-stone">
          <div>
            <dt className="font-semibold text-graphite">Ambiente</dt>
            <dd>{project.environment}</dd>
          </div>
          <div>
            <dt className="font-semibold text-graphite">Material</dt>
            <dd>{project.materials[0]}</dd>
          </div>
        </dl>
        <ButtonLink href={`/catalogo/${project.slug}`} variant="ghost" className="mt-4 px-0">
          Ver proyecto
        </ButtonLink>
      </div>
    </article>
  );
}
