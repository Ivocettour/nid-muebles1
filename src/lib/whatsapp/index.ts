export function getWhatsAppNumber() {
  return process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/[^\d]/g, "") ?? "";
}

export function createWhatsAppLink(message: string) {
  const number = getWhatsAppNumber();
  const query = encodeURIComponent(message);
  return number ? `https://wa.me/${number}?text=${query}` : `https://wa.me/?text=${query}`;
}
