"use client";

import Image from "next/image";
import { useState } from "react";

export function ProjectGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(images[0]);

  return (
    <div className="grid gap-4">
      <div className="relative aspect-[16/10] overflow-hidden bg-linen">
        <Image src={active} alt={`Imagen principal de ${name}`} fill priority sizes="100vw" className="object-cover" />
      </div>
      <div className="flex gap-3 overflow-x-auto">
        {images.map((item, index) => (
          <button
            key={item}
            type="button"
            onClick={() => setActive(item)}
            className="relative h-20 w-28 shrink-0 overflow-hidden border border-graphite/10 focus-visible:outline focus-visible:outline-2"
            aria-label={`Ver imagen ${index + 1} de ${name}`}
          >
            <Image src={item} alt={`Miniatura ${index + 1} de ${name}`} fill sizes="112px" className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
