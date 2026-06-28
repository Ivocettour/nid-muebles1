import type { Metadata } from "next";
import Image from "next/image";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { getCachedSiteContent } from "@/services/server/publicData";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nosotros",
  description: "Historia, mision y forma de trabajo de NID."
};

const defaults = {
  eyebrow: "Nosotros",
  title: "Muebles con precision de taller y mirada de diseno",
  description: "NID nace para resolver espacios reales con soluciones de mobiliario personalizadas, funcionales y duraderas.",
  body:
    "Trabajamos con una metodologia clara: escuchamos, medimos, disenamos, seleccionamos materiales y fabricamos cada pieza con atencion a sus detalles de uso. Nuestro objetivo es que el mueble se integre al espacio y mejore la vida cotidiana.",
  image: ""
};

export default async function AboutPage() {
  const content = await getCachedSiteContent("nosotros").catch(() => null);
  const data = { ...defaults, ...(content?.data ?? {}) } as typeof defaults;

  return (
    <section className="mx-auto max-w-7xl px-5 pb-20 pt-32 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <SectionHeading eyebrow={data.eyebrow} title={data.title} description={data.description} />
        <div className="text-lg leading-8 text-stone">
          {data.body.split("\n").map((paragraph) => (
            <p key={paragraph} className="mt-5 first:mt-0">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
      {data.image ? (
        <div className="relative mt-14 aspect-[16/8] overflow-hidden bg-linen">
          <Image src={data.image} alt={data.title} fill sizes="100vw" className="object-cover" />
        </div>
      ) : null}
    </section>
  );
}
