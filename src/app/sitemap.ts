import type { MetadataRoute } from "next";
import { PROJECTS, SERVICE_IDS, SERVICE_SLUGS } from "@/config/site";
import { DEFAULT_LOCALE, LOCALES } from "@/i18n/config";
import { SITE_URL } from "@/lib/seo";

/** Every public, canonical URL in every language, with hreflang alternates. */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const pages: { path: string; priority: number; changeFrequency: "monthly" | "yearly" }[] = [
    { path: "", priority: 1, changeFrequency: "monthly" },
    ...SERVICE_IDS.map((id) => ({ path: `/services/${SERVICE_SLUGS[id]}`, priority: 0.9, changeFrequency: "monthly" as const })),
    ...PROJECTS.map((p) => ({ path: `/work/${p.slug}`, priority: 0.6, changeFrequency: "yearly" as const })),
  ];

  return pages.flatMap(({ path, priority, changeFrequency }) => {
    const languages: Record<string, string> = {};
    for (const l of [DEFAULT_LOCALE, ...LOCALES.filter((x) => x !== DEFAULT_LOCALE)]) languages[l] = `${SITE_URL}/${l}${path}`;
    languages["x-default"] = `${SITE_URL}/${DEFAULT_LOCALE}${path}`;
    return LOCALES.map((locale) => ({
      url: `${SITE_URL}/${locale}${path}`,
      lastModified,
      changeFrequency,
      priority: locale === DEFAULT_LOCALE ? priority : Math.round(priority * 90) / 100,
      alternates: { languages },
    }));
  });
}
