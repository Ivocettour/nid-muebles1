import type { Category } from "@/types";

export const categories: Category[] = [
  "Cocinas",
  "Dormitorios",
  "Livings",
  "Placares",
  "Vestidores",
  "Oficinas",
  "Baños",
  "Muebles de TV",
  "Bibliotecas",
  "Muebles comerciales",
  "Otros proyectos"
].map((name, index) => ({
  id: `cat-${index + 1}`,
  name,
  slug: name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-"),
  description: `Soluciones a medida para ${name.toLowerCase()}, diseñadas según uso, materialidad y proporciones del espacio.`,
  image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80",
  active: true,
  order: index + 1
}));
