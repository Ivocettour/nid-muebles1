"use client";

import { useEffect, useState } from "react";
import type { Category } from "@/types";
import { Button } from "@/components/shared/Button";
import { slugify } from "@/lib/slug";
import { listCategories, removeCategory, saveCategory } from "@/services/categories";

const emptyCategory: Category = {
  id: "new",
  name: "",
  slug: "",
  description: "",
  image: "",
  active: true,
  order: 0
};

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Category | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    listCategories().then(setCategories).catch((error) => setMessage(error instanceof Error ? error.message : "No se pudieron cargar categorias."));
  }, []);

  async function onSave(category: Category) {
    try {
      const saved = await saveCategory(category);
      setCategories((current) => [saved, ...current.filter((item) => item.id !== category.id && item.id !== saved.id)].sort((a, b) => a.order - b.order));
      setEditing(null);
      setMessage("Categoria guardada correctamente.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo guardar la categoria.");
    }
  }

  async function onDelete(category: Category) {
    if (!window.confirm(`Eliminar ${category.name}?`)) return;
    try {
      await removeCategory(category.id);
      setCategories((current) => current.filter((item) => item.id !== category.id));
      setMessage("Categoria eliminada.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo eliminar la categoria.");
    }
  }

  return (
    <section className="grid gap-5">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h1 className="font-display text-4xl font-semibold">Categorias</h1>
          <p className="mt-2 text-sm text-stone">Estas categorias alimentan inicio, catalogo, filtros y rutas publicas.</p>
        </div>
        <Button onClick={() => setEditing({ ...emptyCategory, id: `new-${Date.now()}`, order: categories.length + 1 })}>Nueva categoria</Button>
      </div>
      {message ? <div className="border border-graphite/10 bg-linen p-4 text-sm">{message}</div> : null}
      {editing ? <CategoryForm category={editing} onSave={onSave} onCancel={() => setEditing(null)} /> : null}
      <div className="overflow-x-auto border border-graphite/10 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-linen text-xs uppercase tracking-[0.14em] text-stone">
            <tr><th className="p-4">Nombre</th><th>Slug</th><th>Orden</th><th>Estado</th><th className="text-right">Acciones</th></tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-t border-graphite/10">
                <td className="p-4 font-medium">{category.name}</td>
                <td>{category.slug}</td>
                <td>{category.order}</td>
                <td>{category.active ? "Activa" : "Inactiva"}</td>
                <td className="p-4 text-right">
                  <button className="mr-4 text-timber" onClick={() => setEditing(category)}>Editar</button>
                  <button className="text-red-700" onClick={() => onDelete(category)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function CategoryForm({ category, onSave, onCancel }: { category: Category; onSave: (category: Category) => Promise<void>; onCancel: () => void }) {
  const [draft, setDraft] = useState(category);
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    await onSave({ ...draft, slug: slugify(draft.slug || draft.name) });
    setSaving(false);
  }

  return (
    <form onSubmit={submit} className="grid gap-4 border border-graphite/10 bg-white p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nombre"><input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value, slug: draft.slug || slugify(event.target.value) })} required /></Field>
        <Field label="Slug"><input value={draft.slug} onChange={(event) => setDraft({ ...draft, slug: slugify(event.target.value) })} required /></Field>
        <Field label="Imagen"><input value={draft.image ?? ""} onChange={(event) => setDraft({ ...draft, image: event.target.value })} /></Field>
        <Field label="Orden"><input type="number" value={draft.order} onChange={(event) => setDraft({ ...draft, order: Number(event.target.value) })} /></Field>
      </div>
      <Field label="Descripcion"><textarea value={draft.description ?? ""} onChange={(event) => setDraft({ ...draft, description: event.target.value })} rows={3} /></Field>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.active} onChange={(event) => setDraft({ ...draft, active: event.target.checked })} /> Activa</label>
      <div className="flex gap-3">
        <Button disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactElement }) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <div className="[&_input]:h-11 [&_input]:w-full [&_input]:border [&_input]:border-graphite/15 [&_input]:bg-white [&_input]:px-3 [&_textarea]:w-full [&_textarea]:border [&_textarea]:border-graphite/15 [&_textarea]:bg-white [&_textarea]:p-3">
        {children}
      </div>
    </label>
  );
}
