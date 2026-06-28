import type { ContactStatus } from "@/types";

export const contactStatusLabels: Record<ContactStatus, string> = {
  new: "Nueva",
  read: "Leida",
  contacted: "Contactada",
  quoted: "Presupuestada",
  accepted: "Aceptada",
  inProduction: "En produccion",
  completed: "Finalizada",
  discarded: "Descartada"
};

export const preferredContactLabels = {
  whatsapp: "WhatsApp",
  phone: "Llamada",
  email: "Correo"
};

export function normalizePhoneForWhatsApp(phone: string) {
  return phone.replace(/[\s\-().+]/g, "");
}

export function createClientWhatsAppLink(phone: string, message: string) {
  const normalized = normalizePhoneForWhatsApp(phone);
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export function contactReferenceUrl(key: string) {
  if (/^https?:\/\//.test(key)) return key;
  const domain = process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN?.replace(/^https?:\/\//, "");
  return domain ? `https://${domain}/${key.replace(/^\/+/, "")}` : key;
}
