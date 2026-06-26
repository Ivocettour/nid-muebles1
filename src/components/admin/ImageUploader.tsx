"use client";

import { fetchAuthSession } from "aws-amplify/auth";
import { GripVertical, ImageIcon, Star, Trash2, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/shared/Button";
import { configureAmplify } from "@/lib/aws/amplify";

export interface UploadedImage {
  key: string;
  url: string;
  alt: string;
  order: number;
  isMain?: boolean;
}

interface UploadState extends UploadedImage {
  progress: number;
  status: "uploading" | "done" | "error";
  error?: string;
}

async function authHeaders() {
  configureAmplify();
  const token = (await fetchAuthSession()).tokens?.idToken?.toString();
  if (!token) throw new Error("No hay sesión administrativa.");
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

export function ImageUploader({ value, onChange }: { value: UploadedImage[]; onChange: (images: UploadedImage[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploads, setUploads] = useState<UploadState[]>(value.map((item) => ({ ...item, progress: 100, status: "done" })));

  useEffect(() => {
    setUploads(value.map((item) => ({ ...item, progress: 100, status: "done" })));
  }, [value]);

  async function uploadFiles(files: FileList | null) {
    if (!files) return;

    for (const file of Array.from(files)) {
      const tempKey = `${file.name}-${Date.now()}`;

      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setUploads((current) => [
          ...current,
          { key: tempKey, url: "", alt: file.name, order: current.length, progress: 0, status: "error", error: "Formato no permitido. Usá JPG, PNG o WEBP." }
        ]);
        continue;
      }

      setUploads((current) => [...current, { key: tempKey, url: "", alt: file.name, order: current.length, progress: 0, status: "uploading" }]);

      try {
        const response = await fetch("/api/admin/uploads/presigned-url", {
          method: "POST",
          headers: await authHeaders(),
          body: JSON.stringify({ folder: "projects", contentType: file.type, size: file.size })
        });

        if (!response.ok) throw new Error("No se pudo generar la URL de subida.");

        const presigned = (await response.json()) as { key: string; uploadUrl: string; publicUrl: string };
        await putFile(presigned.uploadUrl, file, (progress) => {
          setUploads((current) => current.map((item) => (item.key === tempKey ? { ...item, progress } : item)));
        });

        setUploads((current) => {
          const doneCount = current.filter((item) => item.status === "done").length;
          const next = current.map((item) =>
            item.key === tempKey
              ? {
                  key: presigned.key,
                  url: presigned.publicUrl,
                  alt: file.name,
                  order: item.order,
                  progress: 100,
                  status: "done" as const,
                  isMain: doneCount === 0
                }
              : item
          );
          onChange(normalizeDoneImages(next));
          return next;
        });
      } catch (error) {
        setUploads((current) =>
          current.map((item) => (item.key === tempKey ? { ...item, status: "error", error: error instanceof Error ? error.message : "Error de subida" } : item))
        );
      }
    }

    if (inputRef.current) inputRef.current.value = "";
  }

  function removeImage(key: string) {
    const next = uploads.filter((item) => item.key !== key).map((item, index) => ({ ...item, order: index }));
    const normalized = ensureMain(next);
    setUploads(normalized);
    onChange(normalizeDoneImages(normalized));
  }

  function makeMain(key: string) {
    const next = uploads.map((item) => ({ ...item, isMain: item.key === key }));
    setUploads(next);
    onChange(normalizeDoneImages(next));
  }

  return (
    <div className="grid gap-4">
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(event) => uploadFiles(event.target.files)} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()}>
          <Upload className="h-4 w-4" /> Subir imágenes desde mi PC
        </Button>
        <p className="text-xs leading-5 text-stone">JPG, PNG o WEBP. Se suben directo a S3 mediante URL segura.</p>
      </div>

      <div className="grid gap-3">
        {uploads.map((item) => (
          <div key={item.key} className="grid gap-3 border border-graphite/10 bg-ivory p-3 md:grid-cols-[96px_1fr_180px]">
            <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden bg-white">
              {item.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.url} alt={item.alt || "Imagen subida"} className="h-full w-full object-cover" />
              ) : (
                <ImageIcon className="h-6 w-6 text-stone" aria-hidden />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-stone" aria-hidden />
                <input
                  value={item.alt}
                  onChange={(event) => {
                    const next = uploads.map((image) => (image.key === item.key ? { ...image, alt: event.target.value } : image));
                    setUploads(next);
                    onChange(normalizeDoneImages(next));
                  }}
                  className="h-10 flex-1 border border-graphite/15 bg-white px-3 text-sm"
                  aria-label="Texto alternativo"
                />
              </div>
              {item.status === "uploading" ? (
                <div className="mt-3 h-2 bg-linen" aria-label={`Subida ${item.progress}%`}>
                  <div className="h-2 bg-timber transition-all" style={{ width: `${item.progress}%` }} />
                </div>
              ) : null}
              {item.isMain ? <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-timber">Imagen principal</p> : null}
              {item.status === "error" ? <p className="mt-2 text-sm text-red-700">{item.error}</p> : null}
            </div>

            <div className="flex items-center justify-end gap-2">
              <button type="button" onClick={() => makeMain(item.key)} className="inline-flex h-9 w-9 items-center justify-center border border-graphite/10 bg-white" aria-label="Elegir imagen principal">
                <Star className={item.isMain ? "h-4 w-4 fill-timber text-timber" : "h-4 w-4"} />
              </button>
              {item.status === "uploading" ? (
                <button type="button" className="inline-flex h-9 w-9 items-center justify-center border border-graphite/10 bg-white" aria-label="Cancelar subida">
                  <X className="h-4 w-4" />
                </button>
              ) : null}
              <button type="button" onClick={() => removeImage(item.key)} className="inline-flex h-9 w-9 items-center justify-center border border-graphite/10 bg-white text-red-700" aria-label="Eliminar imagen">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ensureMain(images: UploadState[]) {
  if (!images.length || images.some((item) => item.isMain)) return images;
  return images.map((item, index) => ({ ...item, isMain: index === 0 }));
}

function normalizeDoneImages(images: UploadState[]) {
  return ensureMain(images)
    .filter((item) => item.status === "done")
    .sort((a, b) => a.order - b.order)
    .map(({ key, url, alt, order, isMain }) => ({ key, url, alt, order, isMain }));
}

function putFile(url: string, file: File, onProgress: (progress: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    });
    xhr.addEventListener("load", () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error("S3 rechazó la subida."))));
    xhr.addEventListener("error", () => reject(new Error("Error de red al subir.")));
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.send(file);
  });
}
