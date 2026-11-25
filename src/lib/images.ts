import type { ImageLoaderProps } from "next/image";
import { photos, type PhotoKey } from "@/config/site";

/** Base URL for an Unsplash CDN photo; width/quality are appended by the loader. */
export function unsplashSrc(key: PhotoKey) {
  return `https://images.unsplash.com/photo-${photos[key].id}?auto=format&fit=crop`;
}

/** Uses Unsplash's own image CDN for resizing instead of the Next.js optimiser. */
export function unsplashLoader({ src, width, quality }: ImageLoaderProps) {
  const sep = src.includes("?") ? "&" : "?";
  return `${src}${sep}w=${width}&q=${quality ?? 72}`;
}
