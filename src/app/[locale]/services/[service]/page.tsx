import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ServicePage from "@/components/ServicePage";
import { SERVICE_IDS, SERVICE_SLUGS, serviceIdFromSlug } from "@/config/site";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { absoluteUrl, breadcrumbJsonLd, jsonLdGraph, pageMetadata, serviceJsonLd } from "@/lib/seo";

type Props = { params: Promise<{ locale: string; service: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return SERVICE_IDS.map((id) => ({ service: SERVICE_SLUGS[id] }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, service } = await params;
  const id = serviceIdFromSlug(service);
  if (!isLocale(locale) || !id) return {};
  const page = getDictionary(locale).servicePages.items[id];
  return pageMetadata({ locale, path: `/services/${service}`, title: page.metaTitle, description: page.metaDescription });
}

export default async function ServiceRoute({ params }: Props) {
  const { locale, service } = await params;
  const id = serviceIdFromSlug(service);
  if (!isLocale(locale) || !id) notFound();
  const t = getDictionary(locale);

  const jsonLd = jsonLdGraph(
    serviceJsonLd(locale, id),
    breadcrumbJsonLd([
      { name: t.servicePages.breadcrumbHome, url: absoluteUrl(locale) },
      { name: t.servicePages.breadcrumbServices, url: `${absoluteUrl(locale)}#services` },
      { name: t.services.items[id].title, url: absoluteUrl(locale, `/services/${service}`) },
    ]),
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <ServicePage id={id} />
    </>
  );
}
