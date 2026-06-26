"use client";

import { fetchAuthSession } from "aws-amplify/auth";
import { GripVertical, Star, Trash2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
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

  async function uploadFiles(files: FileList | null) {
    if (!files) return;
    for (const file of Array.from(files)) {
      const tempKey = `${file.name}-${Date.now()}`;
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
          const next = current.map((item) =>
            item.key === tempKey ? { key: presigned.key, url: presigned.publicUrl, alt: file.name, order: item.order, progress: 100, status: "done" as const } : item
          );
          onChange(next.filter((item) => item.status === "done"));
          return next;
        });
      } catch (error) {
        setUploads((current) => current.map((item) => (item.key === tempKey ? { ...item, status: "error", error: error instanceof Error ? error.message : "Error de subida" } : item)));
      }
    }
  }

  function removeImage(key: string) {
    const next = uploads.filter((item) => item.key !== key).map((item, index) => ({ ...item, order: index }));
    setUploads(next);
    onChange(next.filter((item) => item.status === "done"));
  }

  function makeMain(key: string) {
    const next = uploads.map((item) => ({ ...item, isMain: item.key === key }));
    setUploads(next);
    onChange(next.filter((item) => item.status === "done"));
  }

  return (
    <div className="grid gap-4">
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(event) => uploadFiles(event.target.files)} />
      <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()}>
        <Upload className="h-4 w-4" /> Subir imágenes
      </Button>
      <div className="grid gap-3">
        {uploads.map((item) => (
          <div key={item.key} className="grid gap-3 border border-graphite/10 bg-ivory p-3 md:grid-cols-[1fr_180px]">
            <div>
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-stone" />
                <input
                  value={item.alt}
                  onChange={(event) => {
                    const next = uploads.map((image) => (image.key === item.key ? { ...image, alt: event.target.value } : image));
                    setUploads(next);
                    onChange(next.filter((image) => image.status === "done"));
                  }}
                  className="h-10 flex-1 border border-graphite/15 bg-white px-3 text-sm"
                  aria-label="Texto alternativo"
                />
              </div>
              {item.status === "uploading" ? <div className="mt-2 h-2 bg-linen"><div className="h-2 bg-timber" style={{ width: `${item.progress}%` }} /></div> : null}
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
