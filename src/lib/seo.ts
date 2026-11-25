import type { Metadata } from "next";
import { DEFAULT_LOCALE, LOCALES, OG_LOCALE, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { SERVICE_SLUGS, site, type ServiceId } from "@/config/site";

/**
 * Absolute production URL (no trailing slash). Used for canonical URLs, hreflang,
 * sitemap, robots and structured data.
 * Priority: NEXT_PUBLIC_SITE_URL → Vercel production domain → localhost (development only).
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")
).replace(/\/+$/, "");

export const OG_IMAGE = { url: "/og-image.jpg", width: 1200, height: 630 };
export const ORG_ID = `${SITE_URL}/#organization`;

/** Absolute URL for a locale + path ("" for the home page, "/services/x" etc.). */
export const absoluteUrl = (locale: Locale, path = "") => `${SITE_URL}/${locale}${path}`;

/** Canonical + hreflang alternates (en, de, uk, x-default → English). */
export function languageAlternates(locale: Locale, path = "") {
  const languages: Record<string, string> = {};
  // hreflang order: English (primary) first
  for (const l of [DEFAULT_LOCALE, ...LOCALES.filter((x) => x !== DEFAULT_LOCALE)]) languages[l] = `/${l}${path}`;
  languages["x-default"] = `/${DEFAULT_LOCALE}${path}`;
  return { canonical: `/${locale}${path}`, languages };
}

export function pageMetadata({
  locale,
  path = "",
  title,
  description,
  type = "website",
  absoluteTitle = false,
}: {
  locale: Locale;
  path?: string;
  title: string;
  description: string;
  type?: "website" | "article";
  absoluteTitle?: boolean;
}): Metadata {
  const t = getDictionary(locale);
  const fullTitle = absoluteTitle ? title : `${title} | ${site.name}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: languageAlternates(locale, path),
    openGraph: {
      type,
      siteName: site.name,
      title: fullTitle,
      description,
      url: `/${locale}${path}`,
      locale: OG_LOCALE[locale],
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
      images: [{ ...OG_IMAGE, alt: t.seo.homeTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [OG_IMAGE.url],
    },
  };
}

/* ------------------------------------------------------------------ */
/* Structured data — verified business information only               */
/* (name, website, email, phone, Telegram). No address, ratings,      */
/* reviews, founding date or credentials are published.               */
/* ------------------------------------------------------------------ */

export function organizationJsonLd(locale: Locale) {
  const t = getDictionary(locale);
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: site.name,
    url: `${SITE_URL}/${DEFAULT_LOCALE}`,
    logo: `${SITE_URL}/logo.png`,
    image: `${SITE_URL}${OG_IMAGE.url}`,
    description: t.seo.homeDescription,
    email: site.contacts.email,
    telephone: site.contacts.phone,
    sameAs: [site.contacts.telegramHref, ...site.socials.map((s) => s.href)],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer service",
        email: site.contacts.email,
        telephone: site.contacts.phone,
        url: site.contacts.telegramHref,
        availableLanguage: ["English", "German", "Ukrainian"],
      },
    ],
  };
}

export function websiteJsonLd() {
  return {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: `${SITE_URL}/${DEFAULT_LOCALE}`,
    name: site.name,
    inLanguage: ["en", "de", "uk"],
    publisher: { "@id": ORG_ID },
  };
}

export function serviceJsonLd(locale: Locale, id: ServiceId) {
  const t = getDictionary(locale);
  const page = t.servicePages.items[id];
  return {
    "@type": "Service",
    "@id": `${absoluteUrl(locale, `/services/${SERVICE_SLUGS[id]}`)}#service`,
    name: t.services.items[id].title,
    serviceType: t.services.items[id].title,
    description: page.metaDescription,
    url: absoluteUrl(locale, `/services/${SERVICE_SLUGS[id]}`),
    inLanguage: locale,
    areaServed: "Worldwide",
    provider: { "@id": ORG_ID },
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({ "@type": "ListItem", position: i + 1, name: item.name, item: item.url })),
  };
}

/** Wraps nodes in a single @graph document. */
export function jsonLdGraph(...nodes: object[]) {
  return JSON.stringify({ "@context": "https://schema.org", "@graph": nodes }).replace(/</g, "\\u003c");
}
