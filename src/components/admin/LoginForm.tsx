"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LockKeyhole, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/shared/Button";
import { useAuth } from "@/hooks/useAuth";
import { adminLoginSchema, newPasswordSchema, type AdminLoginValues, type NewPasswordValues } from "@/lib/validations/admin-auth";

export function LoginForm() {
  const router = useRouter();
  const { user, loading: checkingSession, login, completeNewPassword, configured, hasAccess } = useAuth();
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"login" | "newPassword">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const loginForm = useForm<AdminLoginValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { email: "", password: "", rememberSession: false }
  });

  const passwordForm = useForm<NewPasswordValues>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" }
  });

  useEffect(() => {
    if (!checkingSession && user && hasAccess) router.replace("/admin");
  }, [checkingSession, hasAccess, router, user]);

  async function onLogin(values: AdminLoginValues) {
    setError("");
    try {
      const result = await login(values.email, values.password);
      if (result?.status === "newPasswordRequired") {
        setMode("newPassword");
        return;
      }
      router.replace("/admin");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "No pudimos iniciar sesión.");
    }
  }

  async function onNewPassword(values: NewPasswordValues) {
    setError("");
    try {
      await completeNewPassword(values.newPassword);
      router.replace("/admin");
    } catch (passwordError) {
      setError(passwordError instanceof Error ? passwordError.message : "No pudimos actualizar la contraseña.");
    }
  }

  if (checkingSession) {
    return (
      <LoginShell>
        <div className="flex items-center justify-center gap-3 py-12 text-sm text-stone">
          <Loader2 className="h-4 w-4 animate-spin" />
          Verificando sesión...
        </div>
      </LoginShell>
    );
  }

  return (
    <LoginShell>
      <div className="mb-8 text-center">
        <p className="font-display text-4xl font-bold tracking-wide text-graphite">NID</p>
        <div className="mx-auto mt-5 flex h-12 w-12 items-center justify-center border border-graphite/10 bg-ivory text-timber">
          <LockKeyhole className="h-6 w-6" aria-hidden />
        </div>
        <h1 className="mt-5 font-display text-4xl font-semibold text-graphite">Administración</h1>
        <p className="mt-3 text-sm leading-6 text-stone">Ingresá con tus credenciales para administrar proyectos y contenido.</p>
      </div>

      {!configured ? (
        <div className="mb-6 border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">
          Falta configurar Amazon Cognito en las variables de entorno.
        </div>
      ) : null}

      {mode === "login" ? (
        <form onSubmit={loginForm.handleSubmit(onLogin)} className="grid gap-5" noValidate>
          <Field label="Correo electrónico" error={loginForm.formState.errors.email?.message}>
            <input type="email" autoComplete="email" {...loginForm.register("email")} />
          </Field>
          <Field label="Contraseña" error={loginForm.formState.errors.password?.message}>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} autoComplete="current-password" className="pr-12" {...loginForm.register("password")} />
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
          <div className="flex items-center justify-between gap-4 text-sm">
            <label className="flex items-center gap-2 text-stone">
              <input type="checkbox" className="h-4 w-4" {...loginForm.register("rememberSession")} />
              Mantener sesión iniciada
            </label>
            <Link href="/admin/recuperar-password" className="font-medium text-graphite underline-offset-4 hover:underline">
              Olvidé mi contraseña
            </Link>
          </div>
          {error ? <p className="text-sm text-red-700" role="alert">{error}</p> : null}
          <Button disabled={loginForm.formState.isSubmitting || !configured} className="w-full">
            {loginForm.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {loginForm.formState.isSubmitting ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>
      ) : (
        <form onSubmit={passwordForm.handleSubmit(onNewPassword)} className="grid gap-5" noValidate>
          <div className="border border-timber/25 bg-linen p-4 text-sm leading-6 text-graphite">
            Tu usuario requiere definir una nueva contraseña antes de entrar al panel.
          </div>
          <Field label="Nueva contraseña" error={passwordForm.formState.errors.newPassword?.message}>
            <div className="relative">
              <input type={showNewPassword ? "text" : "password"} autoComplete="new-password" className="pr-12" {...passwordForm.register("newPassword")} />
              <button
                type="button"
                onClick={() => setShowNewPassword((value) => !value)}
                className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center text-stone"
                aria-label={showNewPassword ? "Ocultar nueva contraseña" : "Mostrar nueva contraseña"}
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </Field>
          <Field label="Confirmar nueva contraseña" error={passwordForm.formState.errors.confirmPassword?.message}>
            <input type="password" autoComplete="new-password" {...passwordForm.register("confirmPassword")} />
          </Field>
          <PasswordRequirements />
          {error ? <p className="text-sm text-red-700" role="alert">{error}</p> : null}
          <Button disabled={passwordForm.formState.isSubmitting} className="w-full">
            {passwordForm.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Guardar contraseña e ingresar
          </Button>
        </form>
      )}

      <Link href="/" className="mt-7 inline-flex w-full justify-center text-sm font-medium text-stone underline-offset-4 hover:text-graphite hover:underline">
        Volver al sitio público
      </Link>
    </LoginShell>
  );
}

function LoginShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory px-5 py-8">
      <section className="w-full max-w-[460px] border border-graphite/10 bg-white p-6 shadow-soft sm:p-8" aria-label="Inicio de sesión administrativo">
        {children}
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

function PasswordRequirements() {
  return (
    <div className="text-xs leading-5 text-stone">
      Usá al menos 12 caracteres, una mayúscula, una minúscula, un número y un símbolo.
    </div>
  );
}
