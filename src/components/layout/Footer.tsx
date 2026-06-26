"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Instagram, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="bg-graphite text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-[1.3fr_0.7fr_0.7fr] lg:px-8">
        <div>
          <p className="font-display text-4xl font-bold">NID</p>
          <p className="mt-4 max-w-md text-sm leading-7 text-white/68">
            Diseñamos, fabricamos y montamos muebles a medida, creados para integrarse de manera funcional y estética en cada espacio.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-clay">Navegación</h2>
          <div className="mt-4 grid gap-3 text-sm text-white/72">
            <Link href="/catalogo">Catálogo</Link>
            <Link href="/proyectos">Proyectos</Link>
            <Link href="/servicios">Servicios</Link>
            <Link href="/contacto">Contacto</Link>
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-clay">Contacto</h2>
          <div className="mt-4 grid gap-3 text-sm text-white/72">
            <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Argentina</span>
            <span className="flex items-center gap-2"><Phone className="h-4 w-4" /> WhatsApp configurable</span>
            <span className="flex items-center gap-2"><Mail className="h-4 w-4" /> consultas@nid.com</span>
            <span className="flex items-center gap-2"><Instagram className="h-4 w-4" /> @nid.muebles</span>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-5 py-5 text-center text-xs text-white/52">
        © {new Date().getFullYear()} NID. Mobiliario a medida.
      </div>
    </footer>
  );
}
