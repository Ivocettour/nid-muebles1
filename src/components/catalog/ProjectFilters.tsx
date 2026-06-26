"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { categories } from "@/data/categories";
import { Button } from "@/components/shared/Button";

export interface ProjectFilterState {
  category: string;
  environment: string;
  material: string;
  query: string;
}

export function ProjectFilters({
  filters,
  onChange,
  onClear
}: {
  filters: ProjectFilterState;
  onChange: (filters: ProjectFilterState) => void;
  onClear: () => void;
}) {
  const environments = ["Cocina", "Dormitorio", "Living", "Baño", "Oficina", "Local comercial", "Circulación"];
  const materials = ["Melamina", "MDF", "Roble", "Nogal", "Aluminio", "Piedra"];

  return (
    <div className="border border-graphite/10 bg-white p-4">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
        <SlidersHorizontal className="h-4 w-4" /> Filtros
      </div>
      <div className="grid gap-3 md:grid-cols-5">
        <label className="grid gap-1 text-xs font-medium uppercase tracking-[0.14em] text-stone">
          Buscar
          <input
            value={filters.query}
            onChange={(event) => onChange({ ...filters, query: event.target.value })}
            className="h-11 border border-graphite/15 bg-ivory px-3 text-sm normal-case tracking-normal text-graphite"
            placeholder="Nombre o material"
          />
        </label>
        <Select label="Categoría" value={filters.category} onChange={(value) => onChange({ ...filters, category: value })} options={categories.map((item) => item.name)} />
        <Select label="Ambiente" value={filters.environment} onChange={(value) => onChange({ ...filters, environment: value })} options={environments} />
        <Select label="Material" value={filters.material} onChange={(value) => onChange({ ...filters, material: value })} options={materials} />
        <div className="flex items-end">
          <Button type="button" variant="secondary" className="w-full" onClick={onClear}>
            <X className="h-4 w-4" /> Limpiar
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
  onChange
}: {
  label: string;
  value: string;
  options: string[];
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
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
