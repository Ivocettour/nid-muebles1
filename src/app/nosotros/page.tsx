import type { Metadata } from "next";
import Image from "next/image";
import { siteStats } from "@/data/projects";
import { SectionHeading } from "@/components/shared/SectionHeading";

export const metadata: Metadata = {
  title: "Nosotros",
  description: "Historia, misión y forma de trabajo de NID."
};

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-20 pt-32 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <SectionHeading eyebrow="Nosotros" title="Muebles con precisión de taller y mirada de diseño" description="NID nace para resolver espacios reales con soluciones de mobiliario personalizadas, funcionales y duraderas." />
        <div className="text-lg leading-8 text-stone">
          <p>
            Trabajamos con una metodología clara: escuchamos, medimos, diseñamos, seleccionamos materiales y fabricamos cada pieza con atención a sus detalles de uso. Nuestro objetivo es que el mueble se integre al espacio y mejore la vida cotidiana.
          </p>
          <p className="mt-5">
            Valoramos la calidad de fabricación, la atención personalizada, el diseño funcional y el compromiso con las terminaciones. Estos textos y estadísticas pueden editarse desde el contenido institucional almacenado en DynamoDB.
          </p>
        </div>
      </div>
      <div className="relative mt-14 aspect-[16/8] overflow-hidden bg-linen">
        <Image src="https://images.unsplash.com/photo-1581091215367-59ab6b7b9f95?auto=format&fit=crop&w=1800&q=80" alt="Taller de fabricación de muebles a medida" fill sizes="100vw" className="object-cover" />
      </div>
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {siteStats.map((stat) => (
          <div key={stat.label} className="border border-graphite/10 bg-white p-8 text-center">
            <p className="font-display text-5xl font-semibold text-timber">{stat.value}</p>
            <p className="mt-2 text-sm uppercase tracking-[0.18em] text-stone">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
