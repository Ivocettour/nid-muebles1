"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Eye, EyeOff, Loader2, MailCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/shared/Button";
import { confirmPasswordReset, requestPasswordReset, translateCognitoError } from "@/lib/aws/auth";
import {
  confirmPasswordResetSchema,
  requestPasswordResetSchema,
  type ConfirmPasswordResetValues,
  type RequestPasswordResetValues
} from "@/lib/validations/admin-auth";

export function PasswordRecoveryForm() {
  const [step, setStep] = useState<"request" | "confirm" | "done">("request");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const requestForm = useForm<RequestPasswordResetValues>({
    resolver: zodResolver(requestPasswordResetSchema),
    defaultValues: { email: "" }
  });

  const confirmForm = useForm<ConfirmPasswordResetValues>({
    resolver: zodResolver(confirmPasswordResetSchema),
    defaultValues: { email: "", code: "", newPassword: "", confirmPassword: "" }
  });

  async function onRequest(values: RequestPasswordResetValues) {
    setError("");
    try {
      await requestPasswordReset(values.email);
      setEmail(values.email);
      confirmForm.setValue("email", values.email);
      setStep("confirm");
    } catch (requestError) {
      setError(translateCognitoError(requestError));
    }
  }

  async function onConfirm(values: ConfirmPasswordResetValues) {
    setError("");
    try {
      await confirmPasswordReset(values.email, values.code, values.newPassword);
      setStep("done");
    } catch (confirmError) {
      setError(translateCognitoError(confirmError));
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory px-5 py-8">
      <section className="w-full max-w-[460px] border border-graphite/10 bg-white p-6 shadow-soft sm:p-8" aria-label="Recuperación de contraseña administrativa">
        <div className="mb-8 text-center">
          <p className="font-display text-4xl font-bold tracking-wide text-graphite">NID</p>
          <div className="mx-auto mt-5 flex h-12 w-12 items-center justify-center border border-graphite/10 bg-ivory text-timber">
            <MailCheck className="h-6 w-6" aria-hidden />
          </div>
          <h1 className="mt-5 font-display text-4xl font-semibold text-graphite">Recuperar contraseña</h1>
          <p className="mt-3 text-sm leading-6 text-stone">Te enviaremos un código por correo para definir una nueva contraseña.</p>
        </div>

        {step === "request" ? (
          <form onSubmit={requestForm.handleSubmit(onRequest)} className="grid gap-5" noValidate>
            <Field label="Correo electrónico" error={requestForm.formState.errors.email?.message}>
              <input type="email" autoComplete="email" {...requestForm.register("email")} />
            </Field>
            {error ? <p className="text-sm text-red-700" role="alert">{error}</p> : null}
            <Button disabled={requestForm.formState.isSubmitting} className="w-full">
              {requestForm.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Enviar código
            </Button>
          </form>
        ) : null}

        {step === "confirm" ? (
          <form onSubmit={confirmForm.handleSubmit(onConfirm)} className="grid gap-5" noValidate>
            <div className="border border-timber/25 bg-linen p-4 text-sm leading-6 text-graphite">
              Enviamos un código a {email}. Revisá tu correo e ingresalo abajo.
            </div>
            <Field label="Código de verificación" error={confirmForm.formState.errors.code?.message}>
              <input autoComplete="one-time-code" {...confirmForm.register("code")} />
            </Field>
            <Field label="Nueva contraseña" error={confirmForm.formState.errors.newPassword?.message}>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} autoComplete="new-password" className="pr-12" {...confirmForm.register("newPassword")} />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center text-stone"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>
            <Field label="Confirmar nueva contraseña" error={confirmForm.formState.errors.confirmPassword?.message}>
              <input type="password" autoComplete="new-password" {...confirmForm.register("confirmPassword")} />
            </Field>
            <p className="text-xs leading-5 text-stone">Usá al menos 12 caracteres, una mayúscula, una minúscula, un número y un símbolo.</p>
            {error ? <p className="text-sm text-red-700" role="alert">{error}</p> : null}
            <Button disabled={confirmForm.formState.isSubmitting} className="w-full">
              {confirmForm.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Guardar nueva contraseña
            </Button>
          </form>
        ) : null}

        {step === "done" ? (
          <div className="text-center">
            <h2 className="text-xl font-semibold text-graphite">Contraseña actualizada</h2>
            <p className="mt-3 text-sm leading-6 text-stone">Ya podés ingresar al panel administrativo con tu nueva contraseña.</p>
          </div>
        ) : null}

        <Link href="/admin/login" className="mt-7 inline-flex w-full justify-center text-sm font-medium text-stone underline-offset-4 hover:text-graphite hover:underline">
          Volver al login
        </Link>
      </section>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactElement }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-graphite">
      {label}
      <div className="[&_input]:h-11 [&_input]:w-full [&_input]:border [&_input]:border-graphite/15 [&_input]:bg-ivory [&_input]:px-3 [&_input]:text-graphite [&_input]:outline-timber">
        {children}
      </div>
      {error ? <span className="text-sm font-normal text-red-700">{error}</span> : null}
    </label>
  );
}
