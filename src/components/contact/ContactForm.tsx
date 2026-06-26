"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Send } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/shared/Button";
import { createContactRequest } from "@/services/contact";
import { contactSchema, type ContactFormValues } from "@/lib/validations/contact";
import { createWhatsAppLink } from "@/lib/whatsapp";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [lastSubmit, setLastSubmit] = useState(0);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { preferredContactMethod: "whatsapp", privacyAccepted: false, company: "" }
  });

  const whatsappLink = useMemo(() => {
    const name = watch("fullName") || "";
    const type = watch("furnitureType") || "mueble a medida";
    return createWhatsAppLink(`Hola, soy ${name}. Quisiera solicitar información para realizar ${type} con NID.`);
  }, [watch]);

  async function onSubmit(values: ContactFormValues) {
    if (values.company) return;
    if (Date.now() - lastSubmit < 12000) return;
    setLastSubmit(Date.now());
    await createContactRequest({
      fullName: values.fullName,
      phone: values.phone,
      email: values.email,
      city: values.city,
      environment: values.environment,
      furnitureType: values.furnitureType,
      approximateDimensions: values.approximateDimensions,
      estimatedBudget: values.estimatedBudget,
      description: values.description,
      referenceImages: [],
      preferredContactMethod: values.preferredContactMethod
    });
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="border border-graphite/10 bg-white p-8">
        <CheckCircle2 className="h-10 w-10 text-timber" aria-hidden />
        <h2 className="mt-4 text-2xl font-semibold">Solicitud recibida</h2>
        <p className="mt-2 text-stone">Guardamos tu consulta. Podés continuar la conversación por WhatsApp para compartir referencias o coordinar una llamada.</p>
        <a className="mt-6 inline-flex h-11 items-center justify-center bg-graphite px-5 text-sm font-medium text-white" href={whatsappLink} target="_blank" rel="noreferrer">
          Continuar por WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5 border border-graphite/10 bg-white p-5 md:p-8">
      <input className="hidden" tabIndex={-1} autoComplete="off" {...register("company")} aria-hidden />
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Nombre y apellido" error={errors.fullName?.message}><input {...register("fullName")} /></Field>
        <Field label="Teléfono" error={errors.phone?.message}><input {...register("phone")} /></Field>
        <Field label="Correo electrónico" error={errors.email?.message}><input type="email" {...register("email")} /></Field>
        <Field label="Localidad" error={errors.city?.message}><input {...register("city")} /></Field>
        <Field label="Tipo de ambiente" error={errors.environment?.message}><input placeholder="Cocina, dormitorio, oficina..." {...register("environment")} /></Field>
        <Field label="Tipo de mueble" error={errors.furnitureType?.message}><input placeholder="Placard, biblioteca, mueble TV..." {...register("furnitureType")} /></Field>
        <Field label="Medidas aproximadas" error={errors.approximateDimensions?.message}><input placeholder="Ancho x alto x profundidad" {...register("approximateDimensions")} /></Field>
        <Field label="Presupuesto estimado opcional" error={errors.estimatedBudget?.message}><input {...register("estimatedBudget")} /></Field>
      </div>
      <Field label="Descripción de la idea" error={errors.description?.message}>
        <textarea rows={5} {...register("description")} />
      </Field>
      <p className="text-sm text-stone">Para adjuntar imágenes de referencia, continuá por WhatsApp luego de enviar. En producción se puede activar Firebase Storage para subirlas desde este formulario.</p>
      <Field label="Método de contacto preferido" error={errors.preferredContactMethod?.message}>
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
      <Button disabled={isSubmitting} type="submit">
        <Send className="h-4 w-4" /> {isSubmitting ? "Enviando..." : "Enviar solicitud"}
      </Button>
      <p className="text-xs leading-5 text-stone">
        Protección anti spam incluida: campo honeypot y espera mínima entre envíos. Para producción se recomienda sumar verificación server-side con App Check, Cloud Functions o reCAPTCHA Enterprise.
      </p>
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
