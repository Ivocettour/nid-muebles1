"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Mail, MessageCircle, Phone, Trash2 } from "lucide-react";
import type { ContactRequest, ContactStatus } from "@/types";
import { Button } from "@/components/shared/Button";
import { contactReferenceUrl, contactStatusLabels, createClientWhatsAppLink, preferredContactLabels } from "@/lib/contact";
import { getContactRequest, removeContactRequest, updateContactRequest } from "@/services/contact";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

const statuses: ContactStatus[] = ["new", "read", "contacted", "quoted", "accepted", "inProduction", "completed", "discarded"];

export function ContactRequestDetail({ id }: { id: string }) {
  const router = useRouter();
  const { groups } = useAuth();
  const isAdmin = groups.includes("Admin");
  const [item, setItem] = useState<ContactRequest | null>(null);
  const [status, setStatus] = useState<ContactStatus>("new");
  const [internalNotes, setInternalNotes] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getContactRequest(id)
      .then((contactRequest) => {
        setItem(contactRequest);
        setStatus(contactRequest.status);
        setInternalNotes(contactRequest.internalNotes ?? "");
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : "No se pudo cargar la consulta."))
      .finally(() => setLoading(false));
  }, [id]);

  async function copy(value: string) {
    await navigator.clipboard.writeText(value);
    setMessage("Copiado al portapapeles.");
  }

  async function save() {
    try {
      setSaving(true);
      const updated = await updateContactRequest(id, { status, internalNotes });
      setItem(updated);
      setStatus(updated.status);
      setInternalNotes(updated.internalNotes ?? "");
      setMessage("Consulta actualizada correctamente.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo actualizar la consulta.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteItem() {
    if (!item || !window.confirm("Queres eliminar esta consulta? Esta accion no se puede deshacer.")) return;
    try {
      await removeContactRequest(item.id);
      router.push("/admin/consultas");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo eliminar la consulta.");
    }
  }

  if (loading) return <div className="h-64 animate-pulse bg-white" />;
  if (!item) return <div className="border border-graphite/10 bg-white p-8">Consulta no encontrada.</div>;

  return (
    <section className="grid gap-6">
      <Link href="/admin/consultas" className="inline-flex w-fit items-center gap-2 text-sm text-stone hover:text-graphite"><ArrowLeft className="h-4 w-4" /> Volver a consultas</Link>
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-timber">{contactStatusLabels[item.status]}</p>
          <h1 className="mt-2 font-display text-4xl font-semibold">{item.fullName}</h1>
          <p className="mt-2 text-sm text-stone">Recibida el {new Date(item.createdAt).toLocaleString("es-AR")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a className="inline-flex h-10 items-center gap-2 border border-graphite/15 bg-white px-4 text-sm" href={createClientWhatsAppLink(item.phone, `Hola ${item.fullName}, te contacto de NID por la consulta que enviaste sobre ${item.furnitureType}.`)} target="_blank" rel="noreferrer"><MessageCircle className="h-4 w-4" /> WhatsApp</a>
          <a className="inline-flex h-10 items-center gap-2 border border-graphite/15 bg-white px-4 text-sm" href={`tel:${item.phone}`}><Phone className="h-4 w-4" /> Llamar</a>
          <a className="inline-flex h-10 items-center gap-2 border border-graphite/15 bg-white px-4 text-sm" href={`mailto:${item.email}?subject=${encodeURIComponent("Consulta de presupuesto - NID")}`}><Mail className="h-4 w-4" /> Correo</a>
          {isAdmin ? <button className="inline-flex h-10 items-center gap-2 border border-red-200 bg-white px-4 text-sm text-red-700" onClick={deleteItem}><Trash2 className="h-4 w-4" /> Eliminar</button> : null}
        </div>
      </div>

      {message ? <div className="border border-graphite/10 bg-linen p-4 text-sm">{message}</div> : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="grid gap-6">
          <Panel title="Datos del cliente">
            <Info label="Nombre" value={item.fullName} />
            <Info label="Telefono" value={item.phone} action={() => copy(item.phone)} />
            <Info label="Correo" value={item.email} action={() => copy(item.email)} />
            <Info label="Localidad" value={item.city} />
            <Info label="Metodo preferido" value={preferredContactLabels[item.preferredContactMethod]} />
          </Panel>

          <Panel title="Datos del proyecto">
            <Info label="Ambiente" value={item.environment} />
            <Info label="Tipo de mueble" value={item.furnitureType} />
            <Info label="Medidas" value={item.approximateDimensions ?? "Sin especificar"} />
            <Info label="Presupuesto" value={item.estimatedBudget ?? "Sin especificar"} />
            <div>
              <p className="text-sm font-semibold text-graphite">Descripcion</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-stone">{item.description}</p>
              <button className="mt-3 inline-flex items-center gap-2 text-sm text-timber" onClick={() => copy(item.description)}><Copy className="h-4 w-4" /> Copiar descripcion</button>
            </div>
          </Panel>

          <Panel title="Archivos de referencia">
            {item.referenceImages.length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {item.referenceImages.map((image) => (
                  <a key={image.key} href={contactReferenceUrl(image.key)} target="_blank" rel="noreferrer" className="border border-graphite/10 p-3 text-sm hover:border-timber">
                    <span className="block font-medium">{image.name ?? image.key.split("/").pop()}</span>
                    <span className="mt-1 block text-xs text-stone">{image.contentType ?? "archivo"} {image.size ? `· ${Math.round(image.size / 1024)} KB` : ""}</span>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-stone">Esta consulta no tiene archivos adjuntos.</p>
            )}
          </Panel>
        </div>

        <div className="grid gap-6">
          <Panel title="Gestion">
            <label className="grid gap-2 text-sm font-medium">
              Estado
              <select value={status} onChange={(event) => setStatus(event.target.value as ContactStatus)} className="h-11 border border-graphite/15 bg-ivory px-3">
                {statuses.map((entry) => <option key={entry} value={entry}>{contactStatusLabels[entry]}</option>)}
              </select>
            </label>
            <label className="mt-4 grid gap-2 text-sm font-medium">
              Notas internas
              <textarea value={internalNotes} onChange={(event) => setInternalNotes(event.target.value)} rows={8} className="border border-graphite/15 bg-ivory p-3" />
            </label>
            <Button className="mt-4" disabled={saving} onClick={save}>{saving ? "Guardando..." : "Guardar cambios"}</Button>
          </Panel>

          <Panel title="Historial">
            {item.statusHistory?.length ? (
              <div className="grid gap-4">
                {[...item.statusHistory].reverse().map((entry, index) => (
                  <div key={`${entry.changedAt}-${index}`} className="border-l border-timber pl-4">
                    <p className="text-sm font-semibold">{contactStatusLabels[entry.status]}</p>
                    <p className="text-xs text-stone">{new Date(entry.changedAt).toLocaleString("es-AR")} · {entry.changedBy}</p>
                    {entry.note ? <p className="mt-1 text-sm text-stone">{entry.note}</p> : null}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-stone">Todavia no hay historial.</p>
            )}
          </Panel>
        </div>
      </div>
    </section>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-graphite/10 bg-white p-5">
      <h2 className="font-display text-2xl font-semibold">{title}</h2>
      <div className="mt-4 grid gap-4">{children}</div>
    </section>
  );
}

function Info({ label, value, action }: { label: string; value: string; action?: () => void }) {
  return (
    <div className="grid gap-1">
      <p className="text-sm font-semibold text-graphite">{label}</p>
      {action ? <button className="w-fit text-left text-sm text-stone hover:text-timber" onClick={action}>{value}</button> : <p className="text-sm text-stone">{value}</p>}
    </div>
  );
}
