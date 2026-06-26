"use client";

import { useMemo, useState } from "react";
import type { Project } from "@/types";
import { ProjectCard } from "@/components/catalog/ProjectCard";
import { ProjectFilters, type ProjectFilterState } from "@/components/catalog/ProjectFilters";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/shared/Button";

const emptyFilters: ProjectFilterState = { category: "", environment: "", material: "", query: "" };

export function ProjectGrid({ projects }: { projects: Project[] }) {
  const [filters, setFilters] = useState(emptyFilters);
  const [visible, setVisible] = useState(9);

  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return projects
      .filter((project) => project.status === "published")
      .filter((project) => !filters.category || project.categoryName === filters.category)
      .filter((project) => !filters.environment || project.environment === filters.environment)
      .filter((project) => !filters.material || project.materials.some((material) => material.toLowerCase().includes(filters.material.toLowerCase())))
      .filter((project) => !q || [project.name, project.shortDescription, project.materials.join(" ")].join(" ").toLowerCase().includes(q))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [filters, projects]);

  return (
    <div className="grid gap-8">
      <ProjectFilters
        filters={filters}
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
                Cargar más
              </Button>
            </div>
          ) : null}
        </>
      ) : (
        <EmptyState title="No encontramos proyectos" description="Probá con otra categoría, ambiente o material para ver más trabajos de NID." />
      )}
    </div>
  );
}
