"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, ImagePlus, RotateCcw, Send, Trash2, Upload } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/shared/Button";
import { createContactRequest, uploadReferenceImage } from "@/services/contact";
import { contactSchema, maxContactReferenceImages, type ContactFormValues } from "@/lib/validations/contact";
import { createWhatsAppLink } from "@/lib/whatsapp";
import type { ContactReferenceImage } from "@/types";

const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
const maxFileSize = 8 * 1024 * 1024;

interface SelectedImage {
  id: string;
  file: File;
  previewUrl: string;
  progress: number;
  status: "pending" | "uploading" | "uploaded" | "error";
  error?: string;
  uploaded?: ContactReferenceImage;
}

export function ContactForm() {
  const [submittedId, setSubmittedId] = useState("");
  const [lastSubmit, setLastSubmit] = useState(0);
  const [images, setImages] = useState<SelectedImage[]>([]);
  const [imageError, setImageError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const requestIdRef = useRef(crypto.randomUUID());
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { requestId: requestIdRef.current, preferredContactMethod: "whatsapp", privacyAccepted: false, company: "", referenceImages: [] }
  });

  const whatsappLink = useMemo(() => {
    return createWhatsAppLink(`Hola, acabo de enviar una solicitud de presupuesto desde la web de NID. Mi numero de consulta es ${submittedId}.`);
  }, [submittedId]);

  function validateFile(file: File) {
    const extensionOk = /\.(jpe?g|png|webp)$/i.test(file.name);
    if (!allowedTypes.includes(file.type) || !extensionOk) return "Solo se permiten imagenes JPG, PNG o WEBP.";
    if (file.size > maxFileSize) return "El archivo supera el tamano maximo.";
    return "";
  }

  function addFiles(fileList: FileList | File[]) {
    setImageError("");
    const files = Array.from(fileList);
    if (images.length + files.length > maxContactReferenceImages) {
      setImageError("Podes adjuntar hasta 5 imagenes.");
      return;
    }

    const next: SelectedImage[] = [];
    for (const file of files) {
      const error = validateFile(file);
      if (error) {
        setImageError(error);
        continue;
      }
      next.push({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        progress: 0,
        status: "pending"
      });
    }
    setImages((current) => [...current, ...next]);
  }

  function removeImage(id: string) {
    setImages((current) => {
      const image = current.find((item) => item.id === id);
      if (image) URL.revokeObjectURL(image.previewUrl);
      return current.filter((item) => item.id !== id);
    });
  }

  async function uploadImage(image: SelectedImage) {
    if (image.status === "uploaded" && image.uploaded) return image.uploaded;
    setImages((current) => current.map((item) => (item.id === image.id ? { ...item, status: "uploading", progress: 0, error: undefined } : item)));
    try {
      const uploaded = await uploadReferenceImage({
        file: image.file,
        requestId: requestIdRef.current,
        onProgress: (progress) => setImages((current) => current.map((item) => (item.id === image.id ? { ...item, progress } : item)))
      });
      setImages((current) => current.map((item) => (item.id === image.id ? { ...item, status: "uploaded", progress: 100, uploaded } : item)));
      return uploaded;
    } catch (error) {
      const message = error instanceof Error ? error.message : "No pudimos subir la imagen.";
      setImages((current) => current.map((item) => (item.id === image.id ? { ...item, status: "error", error: message } : item)));
      throw new Error(message);
    }
  }

  async function uploadAllImages() {
    const uploaded: ContactReferenceImage[] = [];
    for (const image of images) {
      uploaded.push(await uploadImage(image));
    }
    return uploaded;
  }

  async function onSubmit(values: ContactFormValues) {
    setSubmitError("");
    if (values.company) return;
    if (Date.now() - lastSubmit < 12000) {
      setSubmitError("Espera unos segundos antes de volver a enviar.");
      return;
    }
    setLastSubmit(Date.now());

    try {
      const referenceImages = await uploadAllImages();
      const id = await createContactRequest({
        requestId: requestIdRef.current,
        fullName: values.fullName,
        phone: values.phone,
        email: values.email,
        city: values.city,
        environment: values.environment,
        furnitureType: values.furnitureType,
        approximateDimensions: values.approximateDimensions,
        estimatedBudget: values.estimatedBudget,
        description: values.description,
        referenceImages,
        preferredContactMethod: values.preferredContactMethod,
        privacyAccepted: values.privacyAccepted
      });
      images.forEach((image) => URL.revokeObjectURL(image.previewUrl));
      setImages([]);
      reset({ requestId: crypto.randomUUID(), preferredContactMethod: "whatsapp", privacyAccepted: false, company: "", referenceImages: [] });
      requestIdRef.current = id || crypto.randomUUID();
      setSubmittedId(id ?? "");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "No pudimos enviar tu consulta. Intenta nuevamente.");
    }
  }

  if (submittedId) {
    return (
      <div className="border border-graphite/10 bg-white p-8">
        <CheckCircle2 className="h-10 w-10 text-timber" aria-hidden />
        <h2 className="mt-4 text-2xl font-semibold">Gracias. Recibimos tu solicitud correctamente.</h2>
        <p className="mt-2 text-stone">Nos vamos a comunicar con vos para avanzar con el presupuesto.</p>
        <p className="mt-4 border border-graphite/10 bg-linen p-3 text-sm">Numero de consulta: <strong>{submittedId}</strong></p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a className="inline-flex h-11 items-center justify-center bg-graphite px-5 text-sm font-medium text-white" href={whatsappLink} target="_blank" rel="noreferrer">
            Continuar por WhatsApp
          </a>
          <Link className="inline-flex h-11 items-center justify-center border border-graphite/20 bg-white px-5 text-sm font-medium" href="/">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const companyRegistration = register("company");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5 border border-graphite/10 bg-white p-5 md:p-8">
      <input
        className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        {...companyRegistration}
      />
      <input type="hidden" defaultValue={requestIdRef.current} {...register("requestId")} />
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Nombre y apellido" error={errors.fullName?.message}><input {...register("fullName")} /></Field>
        <Field label="Telefono" error={errors.phone?.message}><input {...register("phone")} /></Field>
        <Field label="Correo electronico" error={errors.email?.message}><input type="email" {...register("email")} /></Field>
        <Field label="Localidad" error={errors.city?.message}><input {...register("city")} /></Field>
        <Field label="Tipo de ambiente" error={errors.environment?.message}><input placeholder="Cocina, dormitorio, oficina..." {...register("environment")} /></Field>
        <Field label="Tipo de mueble" error={errors.furnitureType?.message}><input placeholder="Placard, biblioteca, mueble TV..." {...register("furnitureType")} /></Field>
        <Field label="Medidas aproximadas" error={errors.approximateDimensions?.message}><input placeholder="Ancho x alto x profundidad" {...register("approximateDimensions")} /></Field>
        <Field label="Presupuesto estimado opcional" error={errors.estimatedBudget?.message}><input {...register("estimatedBudget")} /></Field>
      </div>
      <Field label="Descripcion de la idea" error={errors.description?.message}>
        <textarea rows={5} {...register("description")} />
      </Field>

      <section className="grid gap-3">
        <div>
          <h2 className="text-sm font-semibold text-graphite">Imagenes de referencia</h2>
          <p className="mt-1 text-sm text-stone">Podes adjuntar hasta 5 imagenes de referencia.</p>
        </div>
        <div
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            addFiles(event.dataTransfer.files);
          }}
          className="grid min-h-36 place-items-center border border-dashed border-graphite/25 bg-ivory p-6 text-center"
        >
          <ImagePlus className="mx-auto h-8 w-8 text-timber" />
          <p className="mt-3 text-sm font-medium">Arrastra imagenes aca o selecciona archivos</p>
          <p className="mt-1 text-xs text-stone">JPG, PNG o WEBP. Maximo 8 MB por imagen.</p>
          <Button type="button" variant="secondary" className="mt-4" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4" /> Seleccionar imagenes
          </Button>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(event) => event.target.files && addFiles(event.target.files)} />
        </div>
        <p className="text-xs text-stone">{images.length}/{maxContactReferenceImages} imagenes seleccionadas</p>
        {imageError ? <p className="text-sm text-red-700">{imageError}</p> : null}
        {images.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {images.map((image) => (
              <div key={image.id} className="grid grid-cols-[84px_1fr_auto] gap-3 border border-graphite/10 bg-white p-3">
                <span className="relative h-20 w-20 overflow-hidden bg-linen">
                  <Image src={image.previewUrl} alt={image.file.name} fill sizes="80px" unoptimized className="object-cover" />
                </span>
                <div className="min-w-0 text-sm">
                  <p className="truncate font-medium">{image.file.name}</p>
                  <p className="text-xs text-stone">{Math.round(image.file.size / 1024)} KB</p>
                  <div className="mt-2 h-2 overflow-hidden bg-linen">
                    <div className="h-full bg-timber transition-all" style={{ width: `${image.progress}%` }} />
                  </div>
                  {image.error ? <p className="mt-1 text-xs text-red-700">{image.error}</p> : <p className="mt-1 text-xs text-stone">{image.status === "uploaded" ? "Lista para enviar" : image.status === "uploading" ? "Subiendo..." : "Pendiente"}</p>}
                </div>
                <div className="flex flex-col gap-2">
                  {image.status === "error" ? (
                    <button type="button" className="text-timber" onClick={() => uploadImage(image)} aria-label="Reintentar imagen">
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  ) : null}
                  <button type="button" className="text-red-700" onClick={() => removeImage(image.id)} aria-label="Eliminar imagen">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <Field label="Metodo de contacto preferido" error={errors.preferredContactMethod?.message}>
        <select {...register("preferredContactMethod")}>
          <option value="whatsapp">WhatsApp</option>
          <option value="phone">Llamada</option>
          <option value="email">Correo</option>
        </select>
      </Field>
      <label className="flex items-start gap-3 text-sm text-stone">
        <input type="checkbox" className="mt-1 h-4 w-4" {...register("privacyAccepted")} />
        Acepto que NID utilice estos datos para responder mi solicitud de presupuesto.
      </label>
      {errors.privacyAccepted?.message ? <p className="text-sm text-red-700">{errors.privacyAccepted.message}</p> : null}
      {submitError ? <p className="border border-red-200 bg-red-50 p-3 text-sm text-red-700">{submitError}</p> : null}
      <Button disabled={isSubmitting || images.some((image) => image.status === "uploading")} type="submit">
        <Send className="h-4 w-4" /> {isSubmitting ? "Enviando solicitud..." : "Enviar solicitud"}
      </Button>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactElement }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-graphite">
      {label}
      <div className="[&_input]:h-11 [&_input]:w-full [&_input]:border [&_input]:border-graphite/15 [&_input]:bg-ivory [&_input]:px-3 [&_select]:h-11 [&_select]:w-full [&_select]:border [&_select]:border-graphite/15 [&_select]:bg-ivory [&_select]:px-3 [&_textarea]:w-full [&_textarea]:border [&_textarea]:border-graphite/15 [&_textarea]:bg-ivory [&_textarea]:p-3">
        {children}
      </div>
      {error ? <span className="text-sm font-normal text-red-700">{error}</span> : null}
    </label>
  );
}
