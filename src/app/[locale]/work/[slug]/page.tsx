import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectDetail from "@/components/ProjectDetail";
import { PROJECTS, type ProjectSlug } from "@/config/site";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { absoluteUrl, breadcrumbJsonLd, jsonLdGraph, pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string; slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale) || !PROJECTS.some((p) => p.slug === slug)) return {};
  const t = getDictionary(locale);
  const item = t.work.items[slug as ProjectSlug];
  // Summary + as much of the scope as fits a ~160 character snippet
  let scope = [...item.deliverables];
  const describe = () => `${item.summary} ${t.work.scope}: ${scope.join(", ")}.`;
  while (scope.length > 1 && describe().length > 160) scope = scope.slice(0, -1);
  return pageMetadata({
    locale,
    path: `/work/${slug}`,
    title: `${item.title} — ${t.seo.projectSuffix}`,
    description: describe(),
    type: "article",
  });
}

export default async function ProjectPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale) || !PROJECTS.some((p) => p.slug === slug)) notFound();
  const t = getDictionary(locale);
  const item = t.work.items[slug as ProjectSlug];
  const jsonLd = jsonLdGraph(
    breadcrumbJsonLd([
      { name: t.servicePages.breadcrumbHome, url: absoluteUrl(locale) },
      { name: t.nav.work, url: `${absoluteUrl(locale)}#work` },
      { name: item.title, url: absoluteUrl(locale, `/work/${slug}`) },
    ]),
  );
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <ProjectDetail slug={slug as ProjectSlug} />
    </>
  );
}
