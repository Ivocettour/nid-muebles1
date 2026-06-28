"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/shared/Button";

export interface ProjectFilterState {
  category: string;
  environment: string;
  material: string;
  query: string;
  sort: "recent" | "alpha";
  featured: boolean;
}

export function ProjectFilters({
  filters,
  categories,
  environments,
  materials,
  onChange,
  onClear
}: {
  filters: ProjectFilterState;
  categories: string[];
  environments: string[];
  materials: string[];
  onChange: (filters: ProjectFilterState) => void;
  onClear: () => void;
}) {
  return (
    <div className="border border-graphite/10 bg-white p-4">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
        <SlidersHorizontal className="h-4 w-4" /> Filtros
      </div>
      <div className="grid gap-3 md:grid-cols-6">
        <label className="grid gap-1 text-xs font-medium uppercase tracking-[0.14em] text-stone">
          Buscar
          <input
            value={filters.query}
            onChange={(event) => onChange({ ...filters, query: event.target.value })}
            className="h-11 border border-graphite/15 bg-ivory px-3 text-sm normal-case tracking-normal text-graphite"
            placeholder="Nombre o material"
          />
        </label>
        <Select label="Categoria" value={filters.category} onChange={(value) => onChange({ ...filters, category: value })} options={categories} />
        <Select label="Ambiente" value={filters.environment} onChange={(value) => onChange({ ...filters, environment: value })} options={environments} />
        <Select label="Material" value={filters.material} onChange={(value) => onChange({ ...filters, material: value })} options={materials} />
        <Select
          label="Orden"
          value={filters.sort}
          onChange={(value) => onChange({ ...filters, sort: value as ProjectFilterState["sort"] })}
          options={["recent", "alpha"]}
          labels={{ recent: "Mas recientes", alpha: "A-Z" }}
        />
        <label className="flex items-end gap-2 pb-3 text-sm font-medium text-stone">
          <input type="checkbox" checked={filters.featured} onChange={(event) => onChange({ ...filters, featured: event.target.checked })} />
          Destacados
        </label>
        <div className="flex items-end md:col-span-6">
          <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={onClear}>
            <X className="h-4 w-4" /> Limpiar filtros
          </Button>
        </div>
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  options,
  labels,
  onChange
}: {
  label: string;
  value: string;
  options: string[];
  labels?: Record<string, string>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1 text-xs font-medium uppercase tracking-[0.14em] text-stone">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 border border-graphite/15 bg-ivory px-3 text-sm normal-case tracking-normal text-graphite"
      >
        <option value="">Todos</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {labels?.[option] ?? option}
          </option>
        ))}
      </select>
    </label>
  );
}
