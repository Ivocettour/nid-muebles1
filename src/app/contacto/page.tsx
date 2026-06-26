import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
import { SectionHeading } from "@/components/shared/SectionHeading";

export const metadata: Metadata = {
  title: "Contacto y presupuesto",
  description: "Solicitá presupuesto para muebles a medida con NID."
};

export default function ContactPage() {
  return (
    <section className="mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-32 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
      <div>
        <SectionHeading eyebrow="Presupuesto" title="Contanos qué espacio querés transformar" description="Compartí medidas aproximadas, tipo de mueble y referencias. Te contactamos para avanzar con una propuesta personalizada." />
        <div className="mt-8 border border-graphite/10 bg-linen p-6 text-sm leading-6 text-stone">
          No trabajamos con carrito ni pago online: cada proyecto se cotiza según medidas, materiales, terminaciones y complejidad de montaje.
        </div>
      </div>
      <ContactForm />
    </section>
  );
}
