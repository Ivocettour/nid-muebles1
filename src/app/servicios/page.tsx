import type { Metadata } from "next";
import { ClipboardCheck, Factory, Layers3, Ruler, Truck, Wrench } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";

export const metadata: Metadata = {
  title: "Servicios",
  description: "Diseño personalizado, fabricación y montaje de muebles a medida."
};

export default function ServicesPage() {
  const services = [
    ["Diseño personalizado", Layers3],
    ["Relevamiento y toma de medidas", Ruler],
    ["Asesoramiento en materiales", ClipboardCheck],
    ["Fabricación", Factory],
    ["Transporte", Truck],
    ["Montaje y ajustes finales", Wrench]
  ];
  const steps = ["Nos contás tu idea", "Analizamos el espacio", "Diseñamos la propuesta", "Seleccionamos materiales", "Fabricamos el mueble", "Realizamos el montaje"];

  return (
    <section className="mx-auto max-w-7xl px-5 pb-20 pt-32 lg:px-8">
      <SectionHeading eyebrow="Servicios" title="Un proceso integral para muebles a medida" description="Diseñamos, fabricamos y montamos soluciones funcionales con una estética coherente para cada ambiente." />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {services.map(([label, Icon]) => (
          <div key={String(label)} className="border border-graphite/10 bg-white p-6">
            <Icon className="h-7 w-7 text-timber" />
            <h2 className="mt-6 text-xl font-semibold">{String(label)}</h2>
            <p className="mt-3 text-sm leading-6 text-stone">Acompañamiento técnico y estético para resolver cada detalle antes de fabricar.</p>
          </div>
        ))}
      </div>
      <div className="mt-20 border-y border-graphite/10 py-12">
        <h2 className="font-display text-4xl font-semibold">Proceso de trabajo</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step} className="bg-white p-6">
              <p className="text-sm font-semibold text-timber">0{index + 1}</p>
              <h3 className="mt-5 text-xl font-semibold">{step}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
