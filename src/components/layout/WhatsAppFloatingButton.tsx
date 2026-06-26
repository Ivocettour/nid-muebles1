"use client";

import { MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { createWhatsAppLink } from "@/lib/whatsapp";

export function WhatsAppFloatingButton() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <a
      href={createWhatsAppLink("Hola, quisiera solicitar un presupuesto para un mueble a medida.")}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#1f8f4d] text-white shadow-soft transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      aria-label="Consultar por WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}
