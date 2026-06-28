"use client";

import { EmptyState } from "@/components/shared/EmptyState";

export default function RootError() {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-20 pt-32 lg:px-8">
      <EmptyState title="No pudimos cargar el contenido." description="Intenta nuevamente en unos minutos." />
    </section>
  );
}
