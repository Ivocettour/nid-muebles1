"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Copy, Mail, MessageCircle, RefreshCw, Search, Trash2 } from "lucide-react";
import type { ContactRequest, ContactStatus, PreferredContactMethod } from "@/types";
import { Button } from "@/components/shared/Button";
import { contactStatusLabels, createClientWhatsAppLink, preferredContactLabels } from "@/lib/contact";
import { listContactRequests, removeContactRequest, updateContactRequest, type ContactRequestListResponse } from "@/services/contact";
import { useAuth } from "@/hooks/useAuth";

const statuses: Array<ContactStatus | "all"> = ["all", "new", "read", "contacted", "quoted", "accepted", "inProduction", "completed", "discarded"];
const methods: Array<PreferredContactMethod | "all"> = ["all", "whatsapp", "phone", "email"];

export function ContactRequestManager() {
  const { groups } = useAuth();
  const isAdmin = groups.includes("Admin");
  const [items, setItems] = useState<ContactRequest[]>([]);
  const [stats, setStats] = useState<ContactRequestListResponse["stats"] | null>(null);
  const [pagination, setPagination] = useState<ContactRequestListResponse["pagination"] | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ContactStatus | "all">("all");
  const [method, setMethod] = useState<PreferredContactMethod | "all">("all");
  const [sort, setSort] = useState<"newest" | "oldest" | "updated">("newest");
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);
      const result = await listContactRequests({ page, limit: 20, search, status, preferredContactMethod: method, sort });
      setItems(result.contactRequests);
      setStats(result.stats);
      setPagination(result.pagination);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No pudimos cargar las consultas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status, method, sort]);

  const furnitureTypes = useMemo(() => Array.from(new Set(items.map((item) => item.furnitureType).filter(Boolean))).sort(), [items]);

  async function copy(value: string) {
    await navigator.clipboard.writeText(value);
    setMessage("Copiado al portapapeles.");
  }

  async function quickStatus(item: ContactRequest, nextStatus: ContactStatus) {
    try {
      const updated = await updateContactRequest(item.id, { status: nextStatus });
      setItems((current) => current.map((entry) => (entry.id === item.id ? updated : entry)));
      setMessage("Consulta actualizada correctamente.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo actualizar la consulta.");
    }
  }

  async function deleteItem(item: ContactRequest) {
    if (!window.confirm("Queres eliminar esta consulta? Esta accion no se puede deshacer.")) return;
    try {
      await removeContactRequest(item.id);
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      setMessage("Consulta eliminada correctamente.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo eliminar la consulta.");
    }
  }

  return (
    <section className="grid gap-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h1 className="font-display text-4xl font-semibold">Consultas</h1>
          <p className="mt-2 text-sm text-stone">Administra las solicitudes de presupuesto recibidas desde la web.</p>
          <p className="mt-3 text-sm text-stone">Total: {stats?.total ?? 0} · Nuevas: {stats?.new ?? 0} · Pendientes: {stats?.pending ?? 0}</p>
        </div>
        <Button type="button" variant="secondary" onClick={load}><RefreshCw className="h-4 w-4" /> Actualizar</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <Stat label="Nuevas" value={stats?.new ?? 0} />
        <Stat label="Contactadas" value={stats?.contacted ?? 0} />
        <Stat label="Presupuestadas" value={stats?.quoted ?? 0} />
        <Stat label="Aceptadas" value={stats?.accepted ?? 0} />
        <Stat label="En produccion" value={stats?.inProduction ?? 0} />
        <Stat label="Finalizadas" value={stats?.completed ?? 0} />
      </div>

      {message ? <div className="border border-graphite/10 bg-linen p-4 text-sm">{message}</div> : null}

      <div className="grid gap-3 border border-graphite/10 bg-white p-4 lg:grid-cols-5">
        <label className="relative lg:col-span-2">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-stone" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => event.key === "Enter" && load()} className="h-11 w-full border border-graphite/15 bg-ivory pl-10 pr-3" placeholder="Buscar nombre, correo, telefono o localidad" />
        </label>
        <Select value={status} onChange={(value) => { setStatus(value as ContactStatus | "all"); setPage(1); }} options={statuses} labels={{ all: "Todos", ...contactStatusLabels }} />
        <Select value={method} onChange={(value) => { setMethod(value as PreferredContactMethod | "all"); setPage(1); }} options={methods} labels={{ all: "Metodo", ...preferredContactLabels }} />
        <Select value={sort} onChange={(value) => setSort(value as "newest" | "oldest" | "updated")} options={["newest", "oldest", "updated"]} labels={{ newest: "Mas recientes", oldest: "Mas antiguas", updated: "Actualizadas" }} />
        {furnitureTypes.length ? <p className="text-xs text-stone lg:col-span-5">Tipos cargados: {furnitureTypes.join(", ")}</p> : null}
      </div>

      {loading ? (
        <div className="grid gap-3">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-20 animate-pulse bg-white" />)}</div>
      ) : items.length ? (
        <div className="grid gap-3">
          {items.map((item) => (
            <article key={item.id} className="grid gap-4 border border-graphite/10 bg-white p-4 lg:grid-cols-[1.1fr_1fr_1fr_0.8fr_1.2fr] lg:items-center">
              <div>
                <Link href={`/admin/consultas/${item.id}`} className="font-semibold text-graphite hover:text-timber">{item.fullName}</Link>
                <p className="mt-1 text-xs text-stone">{new Date(item.createdAt).toLocaleString("es-AR")}</p>
              </div>
              <div className="text-sm text-stone">
                <button onClick={() => copy(item.phone)} className="block hover:text-graphite">{item.phone}</button>
                <button onClick={() => copy(item.email)} className="block hover:text-graphite">{item.email}</button>
              </div>
              <div className="text-sm">
                <p className="font-medium">{item.furnitureType}</p>
                <p className="text-stone">{item.city}</p>
              </div>
              <StatusBadge status={item.status} />
              <div className="flex flex-wrap gap-2 lg:justify-end">
                <Link className="inline-flex h-9 items-center border border-graphite/15 px-3 text-sm" href={`/admin/consultas/${item.id}`}>Ver detalle</Link>
                <select value={item.status} onChange={(event) => quickStatus(item, event.target.value as ContactStatus)} className="h-9 border border-graphite/15 bg-white px-2 text-sm">
                  {statuses.filter((entry) => entry !== "all").map((entry) => <option key={entry} value={entry}>{contactStatusLabels[entry as ContactStatus]}</option>)}
                </select>
                <a className="inline-flex h-9 items-center border border-graphite/15 px-3 text-sm" href={createClientWhatsAppLink(item.phone, `Hola ${item.fullName}, te contacto de NID por la consulta que enviaste sobre ${item.furnitureType}.`)} target="_blank" rel="noreferrer"><MessageCircle className="h-4 w-4" /></a>
                <a className="inline-flex h-9 items-center border border-graphite/15 px-3 text-sm" href={`mailto:${item.email}?subject=${encodeURIComponent("Consulta de presupuesto - NID")}`}><Mail className="h-4 w-4" /></a>
                <button className="inline-flex h-9 items-center border border-graphite/15 px-3 text-sm" onClick={() => copy(item.description)}><Copy className="h-4 w-4" /></button>
                {isAdmin ? <button className="inline-flex h-9 items-center border border-red-200 px-3 text-sm text-red-700" onClick={() => deleteItem(item)}><Trash2 className="h-4 w-4" /></button> : null}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="border border-graphite/10 bg-white p-8 text-center">
          <h2 className="font-display text-3xl font-semibold">{search || status !== "all" || method !== "all" ? "No encontramos consultas con esos filtros." : "Todavia no hay consultas."}</h2>
          <p className="mt-2 text-sm text-stone">Las solicitudes enviadas desde la web van a aparecer aca.</p>
        </div>
      )}

      {pagination && pagination.totalPages > 1 ? (
        <div className="flex justify-center gap-3">
          <Button type="button" variant="secondary" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Anterior</Button>
          <span className="flex items-center text-sm text-stone">Pagina {pagination.page} de {pagination.totalPages}</span>
          <Button type="button" variant="secondary" disabled={page >= pagination.totalPages} onClick={() => setPage((value) => value + 1)}>Siguiente</Button>
        </div>
      ) : null}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-graphite/10 bg-white p-4">
      <p className="font-display text-3xl font-semibold">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.14em] text-stone">{label}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: ContactStatus }) {
  return <span className="inline-flex w-fit bg-linen px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-graphite">{contactStatusLabels[status]}</span>;
}

function Select({ value, options, labels, onChange }: { value: string; options: string[]; labels: Record<string, string>; onChange: (value: string) => void }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)} className="h-11 border border-graphite/15 bg-ivory px-3 text-sm">
      {options.map((option) => <option key={option} value={option}>{labels[option] ?? option}</option>)}
    </select>
  );
}
