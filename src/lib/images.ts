export interface ProjectImageInput {
  key?: string;
  url?: string;
  alt?: string;
  order?: number;
  isMain?: boolean;
}

export interface NormalizedProjectImage {
  key: string;
  url: string;
  alt?: string;
  order: number;
  isMain: boolean;
}

export function getPublicImageUrl(value: string) {
  if (!value) return "";
  if (/^https?:\/\//.test(value) || value.startsWith("data:")) return value;
  const domain = process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN?.replace(/^https?:\/\//, "");
  return domain ? `https://${domain}/${value.replace(/^\/+/, "")}` : value;
}

export function normalizeProjectImages(input: unknown, mainImage?: unknown): NormalizedProjectImage[] {
  const rawItems = Array.isArray(input) ? input : [];
  const main = typeof mainImage === "string" ? mainImage : typeof mainImage === "object" && mainImage && "key" in mainImage ? String((mainImage as ProjectImageInput).key) : "";
  const items = rawItems.length ? rawItems : main ? [main] : [];
  const normalized = items
    .map((item, index): NormalizedProjectImage | null => {
      if (typeof item === "string") {
        return { key: item, url: getPublicImageUrl(item), order: index, isMain: item === main || (!main && index === 0) };
      }
      if (item && typeof item === "object") {
        const image = item as ProjectImageInput;
        const key = image.key ?? image.url;
        if (!key) return null;
        return {
          key,
          url: getPublicImageUrl(image.url ?? key),
          alt: image.alt,
          order: image.order ?? index,
          isMain: Boolean(image.isMain) || key === main
        };
      }
      return null;
    })
    .filter((item): item is NormalizedProjectImage => Boolean(item))
    .sort((a, b) => a.order - b.order);

  if (normalized.length && !normalized.some((image) => image.isMain)) normalized[0].isMain = true;
  return normalized;
}
