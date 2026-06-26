"use client";

import { useState } from "react";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { useAuth } from "@/hooks/useAuth";

export function LoginForm() {
  const { login, configured } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "No se pudo iniciar sesión.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-5 pt-20">
      <form onSubmit={onSubmit} className="w-full border border-graphite/10 bg-white p-8">
        <LockKeyhole className="h-8 w-8 text-timber" />
        <h1 className="mt-5 font-display text-4xl font-semibold">Administración</h1>
        <p className="mt-2 text-sm leading-6 text-stone">
          Acceso protegido con Firebase Authentication. Creá el usuario administrador desde Firebase Console.
        </p>
        {!configured ? (
          <div className="mt-6 bg-linen p-4 text-sm leading-6 text-graphite">
            Faltan variables de Firebase. Completá `.env.local` para habilitar el inicio de sesión.
          </div>
        ) : null}
        <label className="mt-6 grid gap-2 text-sm font-medium">
          Correo
          <input className="h-11 border border-graphite/15 bg-ivory px-3" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label className="mt-4 grid gap-2 text-sm font-medium">
          Contraseña
          <input className="h-11 border border-graphite/15 bg-ivory px-3" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
        <Button className="mt-6 w-full" disabled={loading || !configured}>
          {loading ? "Ingresando..." : "Ingresar"}
        </Button>
      </form>
    </div>
  );
}
