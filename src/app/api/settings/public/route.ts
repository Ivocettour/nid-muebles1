import { handleApiError, jsonOk } from "@/lib/api/response";
import { getSiteSettings } from "@/services/server/settingsRepository";

export async function GET() {
  try {
    const settings = await getSiteSettings();
    if (!settings) return jsonOk({ settings: null });
    const { businessName, phone, whatsapp, email, address, socialLinks, siteUrl, defaultWhatsAppText, projectsPerPage } = settings;
    return jsonOk({ settings: { businessName, phone, whatsapp, email, address, socialLinks, siteUrl, defaultWhatsAppText, projectsPerPage } });
  } catch (error) {
    return handleApiError(error);
  }
}
