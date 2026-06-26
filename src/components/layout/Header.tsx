"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { ButtonLink } from "@/components/shared/Button";
import { cn } from "@/lib/utils/cn";

const nav = [
  ["Inicio", "/"],
  ["Catálogo", "/catalogo"],
  ["Proyectos", "/proyectos"],
  ["Servicios", "/servicios"],
  ["Nosotros", "/nosotros"],
  ["Contacto", "/contacto"]
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition",
        scrolled || open ? "border-b border-graphite/10 bg-ivory/95 shadow-soft backdrop-blur" : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link href="/" className="font-display text-3xl font-bold tracking-wide" aria-label="NID inicio">
          NID
        </Link>
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Navegación principal">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} className="text-sm font-medium text-graphite/80 transition hover:text-graphite">
              {label}
            </Link>
          ))}
        </nav>
        <div className="hidden lg:block">
          <ButtonLink href="/contacto">Solicitar presupuesto</ButtonLink>
        </div>
        <button
          className="inline-flex h-11 w-11 items-center justify-center border border-graphite/15 lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open ? (
        <div className="border-t border-graphite/10 bg-ivory px-5 py-5 lg:hidden">
          <nav className="grid gap-1" aria-label="Navegación móvil">
            {nav.map(([label, href]) => (
              <Link key={href} href={href} onClick={() => setOpen(false)} className="px-2 py-3 text-base font-medium">
                {label}
              </Link>
            ))}
            <ButtonLink href="/contacto" className="mt-3" onClick={() => setOpen(false)}>
              Solicitar presupuesto
            </ButtonLink>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
