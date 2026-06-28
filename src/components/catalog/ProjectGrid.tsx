"use client";

import { useMemo, useState } from "react";
import type { Project } from "@/types";
import { ProjectCard } from "@/components/catalog/ProjectCard";
import { ProjectFilters, type ProjectFilterState } from "@/components/catalog/ProjectFilters";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/shared/Button";

const emptyFilters: ProjectFilterState = { category: "", environment: "", material: "", query: "", sort: "recent", featured: false };

export function ProjectGrid({ projects, categoryOptions }: { projects: Project[]; categoryOptions: string[] }) {
  const [filters, setFilters] = useState(emptyFilters);
  const [visible, setVisible] = useState(9);
  const environmentOptions = useMemo(() => Array.from(new Set(projects.map((project) => project.environment).filter(Boolean))).sort(), [projects]);
  const materialOptions = useMemo(() => Array.from(new Set(projects.flatMap((project) => project.materials).filter(Boolean))).sort(), [projects]);

  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return projects
      .filter((project) => project.status === "published")
      .filter((project) => !filters.category || project.categoryName === filters.category)
      .filter((project) => !filters.environment || project.environment === filters.environment)
      .filter((project) => !filters.material || project.materials.some((material) => material.toLowerCase().includes(filters.material.toLowerCase())))
      .filter((project) => !filters.featured || project.featured)
      .filter((project) => !q || [project.name, project.shortDescription, project.materials.join(" ")].join(" ").toLowerCase().includes(q))
      .sort((a, b) => (filters.sort === "alpha" ? a.name.localeCompare(b.name) : b.createdAt.localeCompare(a.createdAt)));
  }, [filters, projects]);

  return (
    <div className="grid gap-8">
      <ProjectFilters
        filters={filters}
        categories={categoryOptions}
        environments={environmentOptions}
        materials={materialOptions}
        onChange={(nextFilters) => {
          setFilters(nextFilters);
          setVisible(9);
        }}
        onClear={() => {
          setFilters(emptyFilters);
          setVisible(9);
        }}
      />
      {filtered.length ? (
        <>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.slice(0, visible).map((project, index) => (
              <ProjectCard key={project.id} project={project} priority={index < 3} />
            ))}
          </div>
          {visible < filtered.length ? (
            <div className="text-center">
              <Button type="button" variant="secondary" onClick={() => setVisible((value) => value + 6)}>
                Cargar mas
              </Button>
            </div>
          ) : null}
        </>
      ) : (
        <EmptyState
          title={projects.length ? "No encontramos proyectos para los filtros seleccionados." : "Todavia no hay proyectos publicados."}
          description={projects.length ? "Proba con otra categoria, ambiente o material para ver mas trabajos de NID." : "Cuando publiques proyectos desde el panel administrativo van a aparecer aca."}
        />
      )}
    </div>
  );
}
